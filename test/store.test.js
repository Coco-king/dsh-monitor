import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Ledger, applyConfigPatch, defaultConfig, localDayKey, normalizeProject } from '../lib/store.js'

/** 临时账本目录(返回 { dir, ledger, configPath, dbPath })。 */
function withTemp(fn) {
  const dir = mkdtempSync(join(tmpdir(), 'dsh-monitor-test-'))
  const configPath = join(dir, 'ledger.json')
  const dbPath = join(dir, 'ledger.sqlite')
  const ledger = Ledger.openAt({ root: dir, configPath, dbPath })
  try {
    return fn({ dir, ledger, configPath, dbPath })
  } finally {
    ledger.close()
    rmSync(dir, { recursive: true, force: true })
  }
}

/** 构造一条带 provider/model 的 usage 事件。 */
function usageEvent(seq, turn, step, usage, provider, model, iso) {
  return {
    seq, time: Date.parse(iso), type: 'assistant/message',
    data: {
      turn, step, usage,
      message: { source: { provider, model } },
    },
  }
}

/** 构造一个 request/header 事件(设置当前路线)。 */
function headerEvent(seq, provider, model, iso) {
  return {
    seq, time: Date.parse(iso), type: 'request/header',
    data: { header: { config: { provider, model } } },
  }
}

test('Ledger.fold: 切模型的会话按 provider×model 拆行、替换语义、跨天归日', () => withTemp(({ ledger }) => {
  // 同一步 flash:usage chunk 先报,assistant/message 终版(相邻、跨天)→ 替换。
  ledger.fold('s1', [
    headerEvent(1, 'deepseek-official', 'deepseek-v4-flash', '2026-08-17T12:00:00Z'),
    { seq: 2, time: Date.parse('2026-08-17T12:01:00Z'), type: 'assistant/chunk', data: { turn: 1, step: 0, chunk: { type: 'usage', usage: { inputTokens: 1000, outputTokens: 200 } } } },
    usageEvent(3, 1, 0, { inputTokens: 1000, outputTokens: 250, cacheReadTokens: 100 }, 'deepseek-official', 'deepseek-v4-flash', '2026-08-17T23:00:00Z'),
    headerEvent(4, 'deepseek-official', 'deepseek-v4-pro', '2026-08-18T01:00:00Z'),
    usageEvent(5, 2, 0, { inputTokens: 500, outputTokens: 100 }, 'deepseek-official', 'deepseek-v4-pro', '2026-08-18T01:05:00Z'),
  ])

  // token_usage 应有 2 行:flash(替换后归到 08-18)+ pro。
  const rows = ledger.db.prepare('SELECT * FROM token_usage ORDER BY model').all()
  assert.equal(rows.length, 2)
  const flash = rows.find(r => r.model === 'deepseek-v4-flash')
  assert.equal(flash.inputTokens, 1000)
  assert.equal(flash.outputTokens, 250) // 替换了 chunk 的 200
  assert.equal(flash.cacheReadTokens, 100)
  assert.equal(flash.requests, 1)
  const pro = rows.find(r => r.model === 'deepseek-v4-pro')
  assert.equal(pro.inputTokens, 500)
  // 双币费用列都存在。
  assert.equal(typeof flash.costUsd, 'number')
  assert.equal(typeof flash.costCny, 'number')
  // sweep_progress 已推进。
  const progress = ledger.progressFor('s1')
  assert.equal(progress.consumedSeq, 5)
  assert.equal(progress.lastUsageAt, Date.parse('2026-08-18T01:05:00Z'))
}))

test('Ledger.fold: usage chunk 双收 + request/header 归因 + unknown 兜底', () => withTemp(({ ledger }) => {
  // 无 request/header:usage chunk 也应收(失败调用也计费),归到 unknown。
  ledger.fold('s1', [
    { seq: 1, time: Date.parse('2026-08-17T06:00:00Z'), type: 'assistant/chunk', data: { turn: 1, step: 0, chunk: { type: 'usage', usage: { inputTokens: 50, outputTokens: 5 } } } },
  ])
  let rows = ledger.db.prepare('SELECT provider, model, inputTokens FROM token_usage').all()
  assert.equal(rows.length, 1)
  assert.equal(rows[0].provider, 'unknown')
  assert.equal(rows[0].model, 'unknown')
  assert.equal(rows[0].inputTokens, 50)

  // 有 request/header:chunk 归到 header 路线。
  ledger.fold('s2', [
    headerEvent(1, 'deepseek-official', 'deepseek-v4-pro', '2026-08-17T06:00:00Z'),
    { seq: 2, time: Date.parse('2026-08-17T06:01:00Z'), type: 'assistant/chunk', data: { turn: 1, step: 0, chunk: { type: 'usage', usage: { inputTokens: 7, outputTokens: 0 } } } },
  ])
  rows = ledger.db.prepare('SELECT provider, model, inputTokens FROM token_usage WHERE sessionId = ?').all('s2')
  assert.equal(rows.length, 1)
  assert.equal(rows[0].provider, 'deepseek-official')
  assert.equal(rows[0].model, 'deepseek-v4-pro')
}))

test('Ledger.fold: 非法 token 归一化为 0,仍计一次调用', () => withTemp(({ ledger }) => {
  ledger.fold('s1', [
    usageEvent(1, 1, 0, { inputTokens: -5, outputTokens: Number.NaN, cacheReadTokens: 'x' }, 'deepseek-official', 'deepseek-v4-flash', '2026-08-17T12:00:00Z'),
  ])
  const rows = ledger.db.prepare('SELECT * FROM token_usage').all()
  assert.equal(rows.length, 1) // 调用次数恒 +1,保留该行
  assert.equal(rows[0].inputTokens, 0)
  assert.equal(rows[0].outputTokens, 0)
  assert.equal(rows[0].requests, 1)
  // 非全零但个别非法桶 → 归一化。
  ledger.fold('s2', [
    usageEvent(1, 1, 0, { inputTokens: -5, outputTokens: 3, cacheReadTokens: 'x' }, 'deepseek-official', 'deepseek-v4-flash', '2026-08-17T12:00:00Z'),
  ])
  const single = ledger.db.prepare('SELECT * FROM token_usage WHERE sessionId = ?').all('s2')
  assert.equal(single.length, 1)
  assert.equal(single[0].outputTokens, 3)
  assert.equal(single[0].inputTokens, 0)
}))

test('Ledger.fold: 双币费用各按各自价格表计费(zh 无影响)', () => withTemp(({ ledger }) => {
  ledger.fold('s1', [
    usageEvent(1, 1, 0, { inputTokens: 1_000_000, outputTokens: 0 }, 'deepseek-official', 'deepseek-v4-flash', '2026-08-17T12:00:00Z'),
  ])
  const row = ledger.db.prepare('SELECT costUsd, costCny FROM token_usage').get()
  // 1M tokens 未命中 × 空闲价:USD $0.22,CNY ¥1.5。
  assert.ok(Math.abs(row.costUsd - 0.22) < 1e-9, `expected ~0.22, got ${row.costUsd}`)
  assert.ok(Math.abs(row.costCny - 1.5) < 1e-9, `expected ~1.5, got ${row.costCny}`)
}))

test('Ledger.fold: 切换 locale 不影响已折叠的历史双币费用', () => withTemp(({ ledger }) => {
  ledger.config.locale = 'zh'
  ledger.fold('s1', [usageEvent(1, 1, 0, { inputTokens: 1_000_000 }, 'deepseek-official', 'deepseek-v4-flash', '2026-08-17T12:00:00Z')])
  ledger.config.locale = 'en'
  ledger.fold('s1', [usageEvent(2, 2, 0, { inputTokens: 500_000 }, 'deepseek-official', 'deepseek-v4-flash', '2026-08-17T13:00:00Z')])
  const row = ledger.db.prepare('SELECT inputTokens, costUsd, costCny FROM token_usage').get()
  assert.equal(row.inputTokens, 1_500_000)
  // USD:1.5M × $0.22 = 0.33;CNY:1.5M × ¥1.5 = 2.25。
  assert.ok(Math.abs(row.costUsd - 0.33) < 1e-9, `expected ~0.33, got ${row.costUsd}`)
  assert.ok(Math.abs(row.costCny - 2.25) < 1e-9, `expected ~2.25, got ${row.costCny}`)
}))

test('Ledger.usageSummary: 总计/按天/模型/会话 + 提供方与模型筛选(双币)', () => withTemp(({ ledger }) => {
  ledger.fold('s1', [
    usageEvent(1, 1, 0, { inputTokens: 1000, outputTokens: 100 }, 'deepseek-official', 'deepseek-v4-flash', '2026-08-17T02:00:00Z'),
    usageEvent(2, 2, 0, { inputTokens: 500, outputTokens: 50 }, 'deepseek-official', 'deepseek-v4-pro', '2026-08-18T02:00:00Z'),
  ])
  ledger.fold('s2', [
    usageEvent(1, 1, 0, { inputTokens: 200, outputTokens: 20 }, 'opencode', 'gpt-5', '2026-08-19T03:00:00Z'),
  ])

  const all = ledger.usageSummary({})
  assert.equal(all.totals.input, 1700)
  assert.equal(all.totals.calls, 3)
  assert.equal(all.byDay.length, 3)
  assert.equal(all.models.length, 3) // flash / pro / gpt-5
  assert.equal(all.sessions.length, 2)
  assert.equal(all.sessions[0].id, 's2') // 日期倒序(08-19 在前)
  // 双币费用字段都在。
  assert.equal(typeof all.totals.costUsd, 'number')
  assert.equal(typeof all.totals.costCny, 'number')

  // 提供方筛选。
  const deep = ledger.usageSummary({ providers: ['deepseek-official'] })
  assert.equal(deep.totals.input, 1500)
  assert.equal(deep.sessions.length, 1)
  assert.equal(deep.sessions[0].id, 's1')

  // 模型筛选。
  const flash = ledger.usageSummary({ models: ['deepseek-v4-flash'] })
  assert.equal(flash.totals.input, 1000)
  assert.equal(flash.byDay.length, 1)
  assert.equal(flash.models.length, 1)

  // 时间范围筛选。
  const day18 = ledger.usageSummary({ range: { start: '2026-08-18', end: '2026-08-18' } })
  assert.equal(day18.totals.input, 500)
  assert.equal(day18.byDay.length, 1)
  assert.equal(day18.byDay[0].date, '2026-08-18')
}))

test('normalizeProject: 去尾部分隔符、缺省空串、根路径原样', () => {
  assert.equal(normalizeProject('C:\\work\\web\\'), 'C:\\work\\web')
  assert.equal(normalizeProject('/tmp/proj/'), '/tmp/proj')
  assert.equal(normalizeProject('  '), '')
  assert.equal(normalizeProject(undefined), '')
  assert.equal(normalizeProject('/'), '/')
})

test('Ledger.setProject / usageSummary.byProject: 项目归因与未记录目录', () => withTemp(({ ledger }) => {
  ledger.fold('s1', [usageEvent(1, 1, 0, { inputTokens: 1000 }, 'deepseek-official', 'deepseek-v4-flash', '2026-08-17T02:00:00Z')])
  ledger.fold('s2', [usageEvent(1, 1, 0, { inputTokens: 200 }, 'opencode', 'gpt-5', '2026-08-18T03:00:00Z')])
  // 只有 s1 记录项目 cwd;s2 无 sessions 行 → 归入未记录目录(project '')。
  ledger.setProject('s1', normalizeProject('C:\\work\\web\\'))
  const rows = ledger.usageSummary({}).byProject
  assert.equal(rows.length, 2)
  const s1 = rows.find(r => r.project === 'C:\\work\\web')
  const none = rows.find(r => r.project === '')
  assert.equal(s1.input, 1000)
  assert.equal(s1.output, 0)
  assert.equal(s1.calls, 1)
  assert.equal(none.input, 200)
  // 会话项目覆盖写。
  ledger.setProject('s1', normalizeProject('C:\\work\\api'))
  const after = ledger.usageSummary({}).byProject
  assert.equal(after.length, 2)
  assert.ok(after.some(r => r.project === 'C:\\work\\api'))
}))

test('Ledger.usageSummary: byProvider 按 providerId 去重聚合(含 unknown)', () => withTemp(({ ledger }) => {
  ledger.fold('s1', [
    usageEvent(1, 1, 0, { inputTokens: 100 }, 'deepseek-official', 'deepseek-v4-flash', '2026-08-17T02:00:00Z'),
    usageEvent(2, 2, 0, { inputTokens: 50 }, 'unknown', 'deepseek-v4-flash', '2026-08-17T03:00:00Z'),
  ])
  const rows = ledger.usageSummary({}).byProvider
  assert.equal(rows.length, 2)
  assert.equal(rows.find(r => r.provider === 'deepseek-official').input, 100)
  assert.equal(rows.find(r => r.provider === 'unknown').input, 50)
}))

test('Ledger.usageSummary: windows 三窗 + 活跃度窗口与逐日模型拆分 + 诊断与时区', () => withTemp(({ ledger }) => {
  // 用「今天」事件:活跃度按 371 天窗口过滤,保证测试与真实日期无关。
  const today = new Date()
  const now = today.getTime()
  ledger.fold('s1', [{
    seq: 1, time: now, type: 'assistant/message',
    data: { turn: 1, step: 0, usage: { inputTokens: 100, cacheReadTokens: 50 }, message: { source: { provider: 'deepseek-official', model: 'deepseek-v4-flash' } } },
  }])
  // 十天前的事件:验证三窗与所选范围相互独立。
  ledger.fold('s2', [{
    seq: 1, time: now - 10 * 86_400_000, type: 'assistant/message',
    data: { turn: 1, step: 0, usage: { inputTokens: 50 }, message: { source: { provider: 'opencode', model: 'gpt-5' } } },
  }])
  const summary = ledger.usageSummary({})
  // 三窗:all 与 totals 同口径(全量);各窗字段类型齐全。
  assert.equal(summary.windows.all.input, summary.totals.input)
  for (const key of ['today', 'month', 'all']) {
    assert.equal(typeof summary.windows[key].input, 'number')
    assert.equal(typeof summary.windows[key].calls, 'number')
  }
  // 带范围查询时,「累计」卡不被 range 过滤;totals(所选窗口)才被过滤。
  const filtered = ledger.usageSummary({ range: { start: localDayKey(now) } })
  assert.equal(filtered.totals.input, 100)
  assert.equal(filtered.windows.all.input, 150)
  assert.equal(filtered.windows.today.input, 100)
  assert.equal(filtered.windows.month.input, 150)
  // 活跃度:含今天的按天行 + 逐日模型拆分。
  const key = localDayKey(now)
  assert.ok(Array.isArray(summary.activity))
  assert.ok(summary.activity.length >= 1)
  assert.ok(summary.activity.some(d => d.date === key))
  const flash = summary.activityModels.find(r => r.day === key && r.model === 'deepseek-v4-flash')
  assert.ok(flash !== undefined)
  assert.equal(flash.input, 100)
  // 诊断 + 时区。
  assert.equal(typeof summary.diagnostics.lastUsageAt, 'number')
  assert.equal(summary.diagnostics.unattributedRows, 0)
  assert.match(summary.timeZone.offset, /^[+-]\d{2}:\d{2}$/)
  assert.equal(typeof summary.timeZone.name, 'string')
}))

test('Ledger.usageSummary: 归因不上的行计入 diagnostics.unattributedRows', () => withTemp(({ ledger }) => {
  ledger.fold('s1', [usageEvent(1, 1, 0, { inputTokens: 100 }, 'unknown', 'unknown', '2026-08-17T02:00:00Z')])
  assert.equal(ledger.usageSummary({}).diagnostics.unattributedRows, 1)
}))

test('Ledger.prune: 保留最近 historyDays 天', () => withTemp(({ ledger }) => {
  ledger.config.historyDays = 7
  const today = localDayKey(Date.now())
  const base = new Date(today + 'T00:00:00')
  for (let i = 0; i < 30; i += 1) {
    const d = new Date(base.getTime() - i * 86_400_000)
    const day = localDayKey(d.getTime())
    ledger.db.prepare(
      'INSERT INTO token_usage (sessionId, day, provider, model, inputTokens, requests, costUsd, costCny) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    ).run(`s${i}`, day, 'p', 'm', 1, 1, 0, 0)
  }
  ledger.prune()
  const count = ledger.db.prepare('SELECT COUNT(*) AS n FROM token_usage').get()
  assert.equal(count.n, 7)
}))

test('Ledger 原子写落盘往返(配置)', () => withTemp(({ ledger, configPath }) => {
  ledger.pendingWrite = true
  ledger.flush()
  const parsed = JSON.parse(readFileSync(configPath, 'utf8'))
  assert.equal(parsed.version, 1)
  assert.equal(parsed.config.locale, 'auto')
  assert.ok(parsed.config.providers !== undefined)
  // 新键用默认值补齐。
  assert.equal(parsed.config.prices.usd.models['deepseek-v4-flash'].cacheMiss, 0.22)
  assert.equal(parsed.config.prices.cny.models['deepseek-v4-flash'].cacheMiss, 1.5)
}))

test('Ledger.openAt: 旧单表 prices 迁移为双表', () => {
  const dir = mkdtempSync(join(tmpdir(), 'dsh-monitor-test-'))
  const configPath = join(dir, 'ledger.json')
  const legacy = defaultConfig()
  legacy.prices = { models: { deepseek: { cacheHit: 0.1, cacheMiss: 0.2, output: 0.3 } }, default: { cacheHit: 0.1, cacheMiss: 0.2, output: 0.3 } }
  writeFileSync(configPath, JSON.stringify({ version: 1, config: legacy }), 'utf8')
  try {
    const config = Ledger.readConfig(configPath)
    assert.ok(config.prices.usd.models.deepseek !== undefined)
    assert.ok(config.prices.cny.models['deepseek-v4-flash'] !== undefined)
    assert.equal(config.prices.usd.models.deepseek.cacheMiss, 0.2)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('Ledger.resetUsage: 丢弃用量表,配置不受影响', () => withTemp(({ ledger }) => {
  ledger.fold('s1', [usageEvent(1, 1, 0, { inputTokens: 10 }, 'deepseek-official', 'deepseek-v4-flash', '2026-08-17T12:00:00Z')])
  assert.equal(ledger.db.prepare('SELECT COUNT(*) AS n FROM token_usage').get().n, 1)
  ledger.resetUsage()
  assert.equal(ledger.db.prepare('SELECT COUNT(*) AS n FROM token_usage').get().n, 0)
  assert.equal(ledger.db.prepare('SELECT COUNT(*) AS n FROM sweep_progress').get().n, 0)
  assert.ok(ledger.config.prices.usd.models['deepseek-v4-flash'] !== undefined)
}))

test('applyConfigPatch: 追加 deepseek / opencode / custom 提供方配置', () => {
  const current = defaultConfig()
  const { config, errors } = applyConfigPatch(current, {
    providers: {
      deepseek: { enabled: true, preset: 'deepseek', refreshMinutes: 5, apiKey: '' },
      ops: { enabled: true, preset: 'opencode', refreshMinutes: 15, apiKey: '' },
      custom1: {
        enabled: true, preset: 'custom', refreshMinutes: 10, apiKey: 'k',
        custom: {
          url: 'https://example.com/usage',
          headers: { Authorization: 'Bearer {apiKey}' },
          items: [
            { key: 'weekly', label: '本周', kind: 'percent', path: 'usage.weekly.percent', maxPath: null, resetsAtPath: 'usage.weekly.resetsAt' },
            { key: 'tokens', label: 'Tokens', kind: 'number', path: 'usage.tokens', maxPath: 1_000_000, resetsAtPath: null },
          ],
        },
      },
    },
  })
  assert.deepEqual(errors, [])
  assert.equal(config.providers.custom1.custom.items.length, 2)
  assert.equal(config.providers.custom1.custom.headers.Authorization, 'Bearer {apiKey}')
})

test('applyConfigPatch: 非法补丁整体拒绝', () => {
  const current = defaultConfig()
  assert.ok(applyConfigPatch(current, { nope: 1 }).errors.length > 0)
  assert.ok(applyConfigPatch(current, {
    providers: { x: { enabled: true, preset: 'custom', refreshMinutes: 5, apiKey: '', custom: { url: '', headers: {}, items: [{ key: 'a', label: 'A', kind: 'number', path: 'a', maxPath: null, resetsAtPath: null }] } } },
  }).errors.length > 0)
  assert.ok(applyConfigPatch(current, {
    providers: { x: { enabled: true, preset: 'custom', refreshMinutes: 5, apiKey: '', custom: { url: 'https://x', headers: {}, items: [] } } },
  }).errors.length > 0)
  assert.ok(applyConfigPatch(current, {
    providers: { x: { enabled: true, preset: 'flyio', refreshMinutes: 5, apiKey: '' } },
  }).errors.length > 0)
  assert.ok(applyConfigPatch(current, 42).errors.length > 0)
})

test('applyConfigPatch: providers 整表替换语义(删除即消失)', () => {
  const current = defaultConfig()
  current.providers = { a: { enabled: true, preset: 'deepseek', refreshMinutes: 5, apiKey: '' } }
  const { config, errors } = applyConfigPatch(current, { providers: { b: { enabled: true, preset: 'opencode', refreshMinutes: 5, apiKey: '' } } })
  assert.deepEqual(errors, [])
  assert.deepEqual(Object.keys(config.providers), ['b'])
})

test('applyConfigPatch: prices 子表(models)整表替换语义', () => {
  const current = defaultConfig()
  const { config, errors } = applyConfigPatch(current, {
    prices: { usd: { models: { 'deepseek-v4-flash': { cacheHit: 0.1, cacheMiss: 0.2, output: 0.3 } } } },
  })
  assert.deepEqual(errors, [])
  assert.deepEqual(Object.keys(config.prices.usd.models), ['deepseek-v4-flash'])
  assert.ok(config.prices.cny.models['deepseek-v4-flash'] !== undefined)
})

test('applyConfigPatch: 双表各自校验,单侧非法整体拒绝', () => {
  const current = defaultConfig()
  assert.ok(applyConfigPatch(current, {
    prices: { cny: { models: { 'deepseek-v4-flash': null } } },
  }).errors.length > 0)
  assert.ok(applyConfigPatch(current, {
    prices: { cny: { models: {}, default: { nope: 1 } } },
  }).errors.length > 0)
  assert.ok(applyConfigPatch(current, {
    prices: { usd: { models: {}, default: { cacheHit: 0.1, cacheMiss: 0.2, output: 0.3 } } },
  }).errors.length === 0)
})
