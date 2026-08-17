import { test, mock } from 'node:test'
import assert from 'node:assert/strict'
import { jsonByPath, createService, queryCustom, queryGoQuota, queryBalance } from '../lib/index.js'
import { defaultConfig } from '../lib/store.js'

/** 构造一个最小 ctx 桩:settings/credentials 服务。 */
function makeCtx(overrides = {}) {
  return {
    get: name => {
      if (name === 'settings') {
        return { get: () => ({ baseURL: 'https://api.deepseek.com', apiKeyEnv: 'DEEPSEEK_API_KEY' }) }
      }
      if (name === 'credentials') return { resolve: async () => ({ value: 'test-key' }) }
      return undefined
    },
    ...overrides,
  }
}

function mockFetchJson(status, body) {
  mock.method(globalThis, 'fetch', async () => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } }))
}

function configWithProviders(providers) {
  return { ...defaultConfig(), providers }
}

test('jsonByPath: 点路径提取与缺失处理', () => {
  const data = { usage: { weekly: { percent: 42, resetsAt: 'x' }, tokens: 250 } }
  assert.equal(jsonByPath(data, 'usage.weekly.percent'), 42)
  assert.equal(jsonByPath(data, 'usage.tokens'), 250)
  assert.equal(jsonByPath(data, 'usage.missing'), undefined)
  assert.equal(jsonByPath(data, 'nope.deep'), undefined)
  assert.equal(jsonByPath(null, 'a'), undefined)
})

test('queryCustom: percent/字面量值与 {apiKey} 头占位', async () => {
  mockFetchJson(200, { usage: { weekly: { percent: 42, resetsAt: '2026-08-20T00:00:00Z' }, tokens: 250 } })
  try {
    const provider = {
      enabled: true, preset: 'custom', refreshMinutes: 5, apiKey: 'k1',
      custom: {
        url: 'https://example.com/usage',
        headers: { Authorization: 'Bearer {apiKey}' },
        items: [
          { key: 'weekly', label: '本周', kind: 'percent', path: 'usage.weekly.percent', maxPath: null, resetsAtPath: 'usage.weekly.resetsAt' },
          { key: 'tokens', label: 'Tokens', kind: 'number', path: 'usage.tokens', maxPath: 1000, resetsAtPath: null },
          { key: 'gone', label: 'Gone', kind: 'text', path: 'usage.gone', maxPath: null, resetsAtPath: null },
        ],
      },
    }
    const { items } = await queryCustom(makeCtx(), provider, 'zh')
    assert.equal(items.length, 2) // gone 缺失 → 跳过
    const weekly = items.find(it => it.key === 'weekly')
    assert.equal(weekly.value, 42)
    assert.equal(weekly.percent, 42)
    assert.equal(weekly.resetsAt, '2026-08-20T00:00:00Z')
    const tokens = items.find(it => it.key === 'tokens')
    assert.equal(tokens.value, 250)
    assert.equal(tokens.max, 1000)
    assert.equal(tokens.percent, 25)
    const called = globalThis.fetch.mock.calls[0]
    assert.equal(called.arguments[0], 'https://example.com/usage')
    assert.equal(called.arguments[1].headers.Authorization, 'Bearer k1')
  } finally {
    mock.restoreAll()
  }
})

test('queryCustom: 非 JSON 响应抛错', async () => {
  mock.method(globalThis, 'fetch', async () => new Response('<html>', { status: 200 }))
  try {
    const provider = {
      enabled: true, preset: 'custom', refreshMinutes: 5, apiKey: '',
      custom: { url: 'https://x', headers: {}, items: [{ key: 'a', label: 'A', kind: 'number', path: 'a', maxPath: null, resetsAtPath: null }] },
    }
    await assert.rejects(() => queryCustom(makeCtx(), provider, 'zh'))
  } finally {
    mock.restoreAll()
  }
})

test('queryGoQuota: 401/403 降级为 soft(无订阅)', async () => {
  mock.method(globalThis, 'fetch', async () => new Response('{}', { status: 401 }))
  try {
    await assert.rejects(() => queryGoQuota(makeCtx(), { enabled: true, preset: 'opencode', refreshMinutes: 5, apiKey: '' }, 'zh'), error => error.soft === true)
  } finally {
    mock.restoreAll()
  }
})

test('queryGoQuota: 官方响应归一化三档窗口', async () => {
  mockFetchJson(200, {
    usage: { rolling: { percent: 30, resetsAt: '2026-08-17T10:00:00Z' }, weekly: null, monthly: { percent: 12, resetsAt: '' } },
  })
  try {
    const quota = await queryGoQuota(makeCtx(), { enabled: true, preset: 'opencode', refreshMinutes: 5, apiKey: '' }, 'zh')
    assert.equal(quota.rolling.percent, 30)
    assert.equal(quota.weekly, null)
    assert.equal(quota.monthly.percent, 12)
  } finally {
    mock.restoreAll()
  }
})

test('queryBalance: 非官方端点拒绝(不发出 Key)', async () => {
  const ctx = {
    get: name => {
      if (name === 'settings') return { get: () => ({ baseURL: 'https://proxy.example.com', apiKeyEnv: 'DEEPSEEK_API_KEY' }) }
      if (name === 'credentials') return { resolve: async () => ({ value: 'secret' }) }
      return undefined
    },
  }
  await assert.rejects(() => queryBalance(ctx, 'zh'), error => /官方端点|official endpoint/i.test(error.message))
})

test('queryBalance: 官方端点返回余额字段', async () => {
  mockFetchJson(200, {
    balance_infos: [{ currency: 'CNY', total_balance: '100.5', granted_balance: '10.25', topped_up_balance: '90.25' }],
  })
  try {
    const balance = await queryBalance(makeCtx(), 'zh')
    assert.equal(balance.currency, 'CNY')
    assert.equal(balance.totalBalance, 100.5)
    assert.equal(balance.grantedBalance, 10.25)
    assert.equal(balance.toppedUpBalance, 90.25)
  } finally {
    mock.restoreAll()
  }
})

test('monitor 服务:未配置提供方 → off + 提示', async () => {
  const service = createService(makeCtx(), { config: configWithProviders({}), scheduleWrite: () => {} })
  const usage = await service.getProviderUsage('nope')
  assert.equal(usage.status, 'off')
  assert.equal(usage.items.length, 0)
  assert.ok(usage.message.length > 0)
})

test('monitor 服务:停用提供方 → off', async () => {
  const providers = { ds: { enabled: false, preset: 'deepseek', refreshMinutes: 5, apiKey: '' } }
  const service = createService(makeCtx(), { config: configWithProviders(providers), scheduleWrite: () => {} })
  const usage = await service.getProviderUsage('ds')
  assert.equal(usage.status, 'off')
})

test('monitor 服务:deepseek 预设走余额接口(3 条 money 条目)', async () => {
  mockFetchJson(200, {
    balance_infos: [{ currency: 'CNY', total_balance: '88', granted_balance: '0', topped_up_balance: '88' }],
  })
  try {
    const providers = { ds: { enabled: true, preset: 'deepseek', refreshMinutes: 5, apiKey: '' } }
    const service = createService(makeCtx(), { config: configWithProviders(providers), scheduleWrite: () => {} })
    const usage = await service.getProviderUsage('ds')
    assert.equal(usage.status, 'ok')
    assert.equal(usage.items.length, 3)
    assert.equal(usage.items[0].value, 88)
  } finally {
    mock.restoreAll()
  }
})

test('monitor 服务:opencode 预设归一化三档,null 窗口跳过', async () => {
  mockFetchJson(200, {
    usage: { rolling: { percent: 30, resetsAt: 'x' }, weekly: null, monthly: { percent: 12, resetsAt: '' } },
  })
  try {
    const providers = { ops: { enabled: true, preset: 'opencode', refreshMinutes: 5, apiKey: '' } }
    const service = createService(makeCtx(), { config: configWithProviders(providers), scheduleWrite: () => {} })
    const usage = await service.getProviderUsage('ops')
    assert.equal(usage.status, 'ok')
    assert.deepEqual(usage.items.map(it => it.key), ['rolling', 'monthly'])
  } finally {
    mock.restoreAll()
  }
})

test('monitor 服务:custom 预设抓取条目', async () => {
  mockFetchJson(200, { usage: { weekly: { percent: 55 } } })
  try {
    const providers = {
      cc: {
        enabled: true, preset: 'custom', refreshMinutes: 5, apiKey: '',
        custom: {
          url: 'https://example.com/u', headers: {},
          items: [{ key: 'w', label: 'W', kind: 'percent', path: 'usage.weekly.percent', maxPath: null, resetsAtPath: null }],
        },
      },
    }
    const service = createService(makeCtx(), { config: configWithProviders(providers), scheduleWrite: () => {} })
    const usage = await service.getProviderUsage('cc')
    assert.equal(usage.status, 'ok')
    assert.equal(usage.items[0].value, 55)
  } finally {
    mock.restoreAll()
  }
})

test('monitor 服务:查询失败落 error 且不炸服务', async () => {
  mock.method(globalThis, 'fetch', async () => new Response('oops', { status: 500 }))
  try {
    const providers = { cc: {
      enabled: true, preset: 'custom', refreshMinutes: 5, apiKey: '',
      custom: { url: 'https://example.com/u', headers: {}, items: [{ key: 'a', label: 'A', kind: 'number', path: 'a', maxPath: null, resetsAtPath: null }] },
    } }
    const service = createService(makeCtx(), { config: configWithProviders(providers), scheduleWrite: () => {} })
    const usage = await service.getProviderUsage('cc')
    assert.equal(usage.status, 'error')
    assert.ok(usage.message.includes('500'))
  } finally {
    mock.restoreAll()
  }
})

test('monitor 服务:updateConfig 非法补丁拒绝且状态不变', async () => {
  const providers = { ds: { enabled: true, preset: 'deepseek', refreshMinutes: 5, apiKey: '' } }
  const ledger = { config: configWithProviders(providers), scheduleWrite: () => {} }
  const service = createService(makeCtx(), ledger)
  await assert.rejects(() => service.updateConfig({ nope: 1 }))
  assert.deepEqual(Object.keys(ledger.config.providers), ['ds'])
  const ok = await service.updateConfig({ providers: { ops: { enabled: true, preset: 'opencode', refreshMinutes: 5, apiKey: '' } } })
  assert.deepEqual(Object.keys(ok.providers), ['ops'])
})

test('monitor 服务:deepseek-official 内置自动(无需配置也直接查余额)', async () => {
  mockFetchJson(200, {
    balance_infos: [{ currency: 'CNY', total_balance: '66', granted_balance: '10', topped_up_balance: '56' }],
  })
  try {
    // providers 为空:deepseek-official 不配置也应有内置行为。
    const service = createService(makeCtx(), { config: configWithProviders({}), scheduleWrite: () => {} })
    const usage = await service.getProviderUsage('deepseek-official')
    assert.equal(usage.status, 'ok')
    assert.equal(usage.preset, 'deepseek')
    assert.equal(usage.items.length, 3)
    assert.equal(usage.items[0].value, 66)
  } finally {
    mock.restoreAll()
  }
})

test('monitor 服务:内置 deepseek 可被显式配置覆盖(如停用)', async () => {
  const providers = { 'deepseek-official': { enabled: false, preset: 'deepseek', refreshMinutes: 5, apiKey: '' } }
  const service = createService(makeCtx(), { config: configWithProviders(providers), scheduleWrite: () => {} })
  const usage = await service.getProviderUsage('deepseek-official')
  assert.equal(usage.status, 'off')
})

test('monitor 服务:listCatalog 读取设置→模型 目录(提供方+模型)', async () => {
  const llm = {
    listConfigurableProviders: () => [
      { provider: 'deepseek-official', displayName: 'DeepSeek 官方', settingsNs: 'llm-deepseek', settingsPath: [], declared: true },
      // dormant:在 configurable 目录声明了、但没有存活路由 → 不应进入提供方选择器。
      { provider: 'dormant-proxy', displayName: 'Dormant Proxy', settingsNs: 'llm-dormant', settingsPath: [] },
    ],
    listProviders: () => [
      { id: 'deepseek-official', name: 'DeepSeek 官方' },
      { id: 'deepseek-cn', name: 'DeepSeek CN' },
    ],
    listModels: async provider => {
      if (provider === 'deepseek-official') {
        return [
          { id: 'deepseek-v4-flash', name: 'DeepSeek V4 Flash' },
          { id: 'deepseek-v4-pro', name: 'DeepSeek V4 Pro' },
        ]
      }
      if (provider === 'deepseek-cn') return [{ id: 'deepseek-v4-pro', name: 'DeepSeek V4 Pro CN' }]
      return []
    },
  }
  const service = createService({ get: name => (name === 'llm' ? llm : undefined) }, { config: defaultConfig(), scheduleWrite: () => {} })
  const catalog = await service.listCatalog()
  // 提供方只列「已配置/可用」的(有存活路由):deepseek-official;
  // dormant-proxy(无路由)与 deepseek-cn(注册路由但未出现在需过滤的目录)都不该作为提供方出现。
  const ids = catalog.providers.map(p => p.id).sort()
  assert.deepEqual(ids, ['deepseek-official'])
  // 模型:数据源不变(仍按注册路由展开,与模型切换器同源),含 deepseek-cn 的模型。
  assert.equal(catalog.models.length, 3)
  const flash = catalog.models.find(m => m.id === 'deepseek-v4-flash')
  assert.equal(flash.provider, 'deepseek-official')
  const cn = catalog.models.find(m => m.provider === 'deepseek-cn')
  assert.equal(cn.id, 'deepseek-v4-pro')
})

test('monitor 服务:listCatalog 在无 llm 服务时返回空目录', async () => {
  const service = createService({ get: () => undefined }, { config: defaultConfig(), scheduleWrite: () => {} })
  const catalog = await service.listCatalog()
  assert.deepEqual(catalog, { providers: [], models: [] })
})