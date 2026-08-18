import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Ledger, applyConfigPatch, defaultConfig, localDayKey } from '../lib/store.js'

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

test('Ledger.fold: 成本按生效币种计费并落 currency 列', () => withTemp(({ ledger }) => {
  ledger.config.locale = 'zh'
  ledger.fold('s1', [
    usageEvent(1, 1, 0, { inputTokens: 1_000_000, outputTokens: 0 }, 'deepseek-official', 'deepseek-v4-flash', '2026-08-17T12:00:00Z'),
  ])
  const row = ledger.db.prepare('SELECT cost, currency FROM token_usage').get()
  assert.equal(row.currency, 'cny')
  // 1M tokens 未命中 × 人民币空闲价 1.5 元。
  assert.ok(Math.abs(row.cost - 1.5) < 1e-9, `expected ~1.5, got ${row.cost}`)
}))

test('Ledger.fold: en 语言按美元表计费', () => withTemp(({ ledger }) => {
  ledger.config.locale = 'en'
  ledger.fold('s1', [
    usageEvent(1, 1, 0, { inputTokens: 1_000_000, outputTokens: 0 }, 'deepseek-official', 'deepseek-v4-flash', '2026-08-17T12:00:00Z'),
  ])
  const row = ledger.db.prepare('SELECT cost, currency FROM token_usage').get()
  assert.equal(row.currency, 'usd')
  assert.ok(Math.abs(row.cost - 0.22) < 1e-9, `expected ~0.22, got ${row.cost}`)
}))

test('Ledger.usageSummary: 总计/按天/会话列表 + 提供方与模型筛选', () => withTemp(({ ledger }) => {
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
  assert.equal(all.sessions.length, 2)
  assert.equal(all.sessions[0].id, 's2') // 日期倒序(08-19 在前)

  // 提供方筛选。
  const deep = ledger.usageSummary({ providers: ['deepseek-official'] })
  assert.equal(deep.totals.input, 1500)
  assert.equal(deep.sessions.length, 1)
  assert.equal(deep.sessions[0].id, 's1')

  // 模型筛选。
  const flash = ledger.usageSummary({ models: ['deepseek-v4-flash'] })
  assert.equal(flash.totals.input, 1000)
  assert.equal(flash.byDay.length, 1)

  // 时间范围筛选。
  const day18 = ledger.usageSummary({ range: { start: '2026-08-18', end: '2026-08-18' } })
  assert.equal(day18.totals.input, 500)
  assert.equal(day18.byDay.length, 1)
  assert.equal(day18.byDay[0].date, '2026-08-18')
}))

test('Ledger.prune: 保留最近 historyDays 天', () => withTemp(({ ledger }) => {
  ledger.config.historyDays = 7
  const today = localDayKey(Date.now())
  const base = new Date(today + 'T00:00:00')
  for (let i = 0; i < 30; i += 1) {
    const d = new Date(base.getTime() - i * 86_400_000)
    const day = localDayKey(d.getTime())
    ledger.db.prepare(
      'INSERT INTO token_usage (sessionId, day, provider, model, inputTokens, requests, cost, currency) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    ).run(`s${i}`, day, 'p', 'm', 1, 1, 0, 'usd')
  }
  ledger.prune()
  const count = ledger.db.prepare('SELECT COUNT(*) AS n FROM token_usage').get()
  assert.equal(count.n, 7)
}))

test('Ledger.fold: 增量续扫不重算旧事件,切语言不回改历史成本', () => withTemp(({ ledger }) => {
  ledger.config.locale = 'en'
  ledger.fold('s1', [usageEvent(1, 1, 0, { inputTokens: 1_000_000 }, 'deepseek-official', 'deepseek-v4-flash', '2026-08-17T12:00:00Z')])
  // 第二次续扫:新事件 seq=2。
  ledger.fold('s1', [usageEvent(2, 2, 0, { inputTokens: 500_000 }, 'deepseek-official', 'deepseek-v4-flash', '2026-08-17T13:00:00Z')])
  const row = ledger.db.prepare('SELECT inputTokens, cost FROM token_usage').get()
  assert.equal(row.inputTokens, 1_500_000)
  // 1M×$0.22 + 0.5M×$0.22 = 0.33(同一档 → 累计线性)。
  assert.ok(Math.abs(row.cost - 0.33) < 1e-9, `expected ~0.33, got ${row.cost}`)
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
