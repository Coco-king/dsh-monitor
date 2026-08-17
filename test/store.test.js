import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Ledger, applyConfigPatch, defaultConfig, localDayKey } from '../lib/store.js'

function tempPath() {
  const dir = mkdtempSync(join(tmpdir(), 'dsh-monitor-test-'))
  return { dir, path: join(dir, 'ledger.json') }
}

function withTemp(fn) {
  const { dir, path } = tempPath()
  try {
    return fn(path)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

test('Ledger.account: 日与会话双层聚合', () => withTemp(path => {
  const ledger = new Ledger(defaultConfig(), {}, path)
  const at1 = Date.parse('2026-08-17T02:00:00Z')
  ledger.account({ input: 1000, output: 500, cacheRead: 200, cacheWrite: 100 }, 'deepseek-v4-flash', 's1', at1)
  ledger.account({ input: 2000, output: 0, cacheRead: 0, cacheWrite: 0 }, 'deepseek-v4-flash', 's1', Date.parse('2026-08-17T03:00:00Z'))
  ledger.account({ input: 10, output: 10, cacheRead: 0, cacheWrite: 0 }, 'deepseek-v4-pro', 's2', Date.parse('2026-08-17T12:00:00Z'))

  // 断言事件日期的记录(不依赖机器当前日期/时区)。
  const dayKey = localDayKey(at1)
  const day = ledger.days[dayKey]
  assert.ok(day !== undefined, 'day record exists for event date')
  assert.equal(day.input, 3010)
  assert.equal(day.output, 510)
  assert.equal(day.cacheRead, 200)
  assert.equal(day.cacheWrite, 100)
  assert.equal(day.calls, 3)
  assert.equal(day.sessions.length, 2)
  const s1 = day.sessions.find(s => s.id === 's1')
  assert.equal(s1.input, 3000)
  assert.equal(s1.output, 500)
  assert.equal(s1.calls, 2)
  // 成本按各事件时刻档位计费(峰会高、空闲低),必为正。
  assert.ok(day.cost > 0)
}))

test('Ledger.account: 非法 token 归一化为 0', () => withTemp(path => {
  const ledger = new Ledger(defaultConfig(), {}, path)
  ledger.account({ input: -5, output: Number.NaN, cacheRead: 'x', cacheWrite: undefined }, 'deepseek-v4-flash', 's1', Date.now())
  const today = ledger.today()
  assert.equal(today.input, 0)
  assert.equal(today.output, 0)
  assert.equal(today.cacheRead, 0)
  assert.equal(today.calls, 1)
  assert.equal(today.cost, 0)
}))

test('Ledger.sumRange / sumDays', () => withTemp(path => {
  const ledger = new Ledger(defaultConfig(), {
    '2026-08-10': { date: '2026-08-10', input: 1, output: 0, cacheRead: 0, cacheWrite: 0, calls: 1, cost: 0, sessions: [] },
    '2026-08-15': { date: '2026-08-15', input: 2, output: 0, cacheRead: 0, cacheWrite: 0, calls: 1, cost: 0, sessions: [] },
    '2026-08-20': { date: '2026-08-20', input: 4, output: 0, cacheRead: 0, cacheWrite: 0, calls: 1, cost: 0, sessions: [] },
  }, path)
  assert.equal(ledger.sumRange('2026-08-10', '2026-08-15').input, 3)
  assert.equal(ledger.sumDays('2026-08').input, 7)
  assert.equal(ledger.sumDays(undefined).input, 7)
}))

test('Ledger.prune: 保留最近 historyDays 天', () => withTemp(path => {
  const ledger = new Ledger(defaultConfig(), {}, path)
  ledger.config.historyDays = 7
  for (let i = 0; i < 30; i += 1) {
    const date = `2026-07-${String(i + 1).padStart(2, '0')}`
    ledger.days[date] = { date, input: 1, output: 0, cacheRead: 0, cacheWrite: 0, calls: 1, cost: 0, sessions: [] }
  }
  ledger.prune()
  assert.equal(Object.keys(ledger.days).length, 7)
  assert.equal(Object.keys(ledger.days).sort()[0], '2026-07-24')
}))

test('Ledger 原子写落盘往返', () => withTemp(path => {
  const ledger = new Ledger(defaultConfig(), {}, path)
  ledger.account({ input: 100, output: 0, cacheRead: 0, cacheWrite: 0 }, 'deepseek-v4-flash', 's1', Date.parse('2026-08-17T00:00:00Z'))
  ledger.pendingWrite = true
  ledger.flush()
  const parsed = JSON.parse(readFileSync(path, 'utf8'))
  assert.equal(parsed.version, 1)
  assert.equal(parsed.days['2026-08-17'].input, 100)
  assert.equal(parsed.config.locale, 'auto')
  assert.ok(parsed.config.providers !== undefined)
  // 新键用默认值补齐。
  const reopened = new Ledger(defaultConfig(), {}, path)
  reopened.config = Object.assign({}, defaultConfig(), parsed.config)
  assert.equal(reopened.config.prices.usd.models['deepseek-v4-flash'].cacheMiss, 0.22)
  assert.equal(reopened.config.prices.cny.models['deepseek-v4-flash'].cacheMiss, 1.5)
}))

test('applyConfigPatch: 追加 deepseek / opencode / custom 提供方配置', () => {
  const current = defaultConfig()
  const { config, errors } = applyConfigPatch(current, {
    providers: {
      deepseek: { enabled: true, preset: 'deepseek', refreshMinutes: 5, apiKey: '' },
      ops: {
        enabled: true, preset: 'opencode', refreshMinutes: 15, apiKey: '',
      },
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
  // 未知键
  assert.ok(applyConfigPatch(current, { nope: 1 }).errors.length > 0)
  // custom 预设缺 url
  assert.ok(applyConfigPatch(current, {
    providers: { x: { enabled: true, preset: 'custom', refreshMinutes: 5, apiKey: '', custom: { url: '', headers: {}, items: [{ key: 'a', label: 'A', kind: 'number', path: 'a', maxPath: null, resetsAtPath: null }] } } },
  }).errors.length > 0)
  // custom items 缺失
  assert.ok(applyConfigPatch(current, {
    providers: { x: { enabled: true, preset: 'custom', refreshMinutes: 5, apiKey: '', custom: { url: 'https://x', headers: {}, items: [] } } },
  }).errors.length > 0)
  // 非法 preset
  assert.ok(applyConfigPatch(current, {
    providers: { x: { enabled: true, preset: 'flyio', refreshMinutes: 5, apiKey: '' } },
  }).errors.length > 0)
  // 非对象补丁
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
  // cny 子表不受影响。
  assert.ok(config.prices.cny.models['deepseek-v4-flash'] !== undefined)
})

test('applyConfigPatch: 双表各自校验,单侧非法整体拒绝', () => {
  const current = defaultConfig()
  assert.ok(applyConfigPatch(current, {
    prices: { cny: { models: { 'deepseek-v4-flash': null } } },
  }).errors.length > 0)
  // default 非法也应拒绝。
  assert.ok(applyConfigPatch(current, {
    prices: { cny: { models: {}, default: { nope: 1 } } },
  }).errors.length > 0)
  assert.ok(applyConfigPatch(current, {
    prices: { usd: { models: {}, default: { cacheHit: 0.1, cacheMiss: 0.2, output: 0.3 } } },
  }).errors.length === 0)
})

test('Ledger.account: 成本按生效币种记录并带 currency 标记', () => withTemp(path => {
  const config = defaultConfig()
  config.locale = 'zh' // 中文 → 人民币计费
  const ledger = new Ledger(config, {}, path)
  ledger.account({ input: 1_000_000, output: 0, cacheRead: 0, cacheWrite: 0 }, 'deepseek-v4-flash', 's1', Date.parse('2026-08-17T12:00:00Z'))
  const day = ledger.days['2026-08-17']
  assert.equal(day.currency, 'cny')
  assert.equal(day.sessions[0].currency, 'cny')
  // 1M tokens 未命中 × 人民币空闲价 1.5 元。
  assert.ok(Math.abs(day.cost - 1.5) < 1e-9, `expected cny cost ~1.5, got ${day.cost}`)
}))

test('Ledger.account: en 语言按美元表计费', () => withTemp(path => {
  const config = defaultConfig()
  config.locale = 'en'
  const ledger = new Ledger(config, {}, path)
  ledger.account({ input: 1_000_000, output: 0, cacheRead: 0, cacheWrite: 0 }, 'deepseek-v4-flash', 's1', Date.parse('2026-08-17T12:00:00Z'))
  const day = ledger.days['2026-08-17']
  assert.equal(day.currency, 'usd')
  assert.ok(Math.abs(day.cost - 0.22) < 1e-9, `expected usd cost ~0.22, got ${day.cost}`)
}))

test('Ledger.open: 旧单表 prices 迁移为双表', () => withTemp(path => {
  const legacy = defaultConfig()
  legacy.prices = { models: { deepseek: { cacheHit: 0.1, cacheMiss: 0.2, output: 0.3 } }, default: { cacheHit: 0.1, cacheMiss: 0.2, output: 0.3 } }
  delete legacy.currency
  delete legacy.symbol
  delete legacy.exchangeRate
  const dir = join(tempPath().dir, 'home')
  mkdirSync(dir)
  const ledgerPath = join(dir, 'storages', 'dsh-monitor', 'ledger.json')
  mkdirSync(join(dir, 'storages', 'dsh-monitor'), { recursive: true })
  writeFileSync(ledgerPath, JSON.stringify({ version: 1, config: legacy, days: {} }), 'utf8')

  const oldHome = process.env.DSH_HOME
  process.env.DSH_HOME = dir
  let restored
  try {
    restored = Ledger.open()
  } finally {
    if (oldHome === undefined) delete process.env.DSH_HOME
    else process.env.DSH_HOME = oldHome
  }
  assert.ok(restored.config.prices.usd.models.deepseek !== undefined)
  assert.ok(restored.config.prices.cny.models['deepseek-v4-flash'] !== undefined)
  // 旧 USD 表保留 deepseek 模型(不丢数据)。
  assert.equal(restored.config.prices.usd.models.deepseek.cacheMiss, 0.2)
}))