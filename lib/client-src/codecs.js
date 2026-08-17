/**
 * dsh-monitor 客户端线路校验器(与服务端 zod 清单对应,宽松校验必要字段)
 * 与 Typert RPC 贡献清单(CONTRIBUTION,与服务端 ./typert 清单一一对应)。
 */

function fail(path, expect) {
  throw new Error('dsh-monitor: 服务端数据非法 (' + path + ': ' + expect + ')')
}
function needNum(v, path) {
  if (typeof v !== 'number' || !Number.isFinite(v)) fail(path, 'number')
  return v
}
function needStr(v, path) {
  if (typeof v !== 'string') fail(path, 'string')
  return v
}
function needBool(v, path) {
  if (typeof v !== 'boolean') fail(path, 'boolean')
  return v
}
function parsePrice(v, path) {
  if (v === null || typeof v !== 'object' || Array.isArray(v)) fail(path, 'object')
  const out = {
    cacheHit: needNum(v.cacheHit, path + '.cacheHit'),
    cacheMiss: needNum(v.cacheMiss, path + '.cacheMiss'),
    output: needNum(v.output, path + '.output'),
  }
  if (v.offPeak !== undefined && v.offPeak !== null) {
    out.offPeak = {
      cacheHit: needNum(v.offPeak.cacheHit, path + '.offPeak.cacheHit'),
      cacheMiss: needNum(v.offPeak.cacheMiss, path + '.offPeak.cacheMiss'),
      output: needNum(v.offPeak.output, path + '.offPeak.output'),
    }
  }
  if (v.peak !== undefined && v.peak !== null) {
    out.peak = {
      cacheHit: needNum(v.peak.cacheHit, path + '.peak.cacheHit'),
      cacheMiss: needNum(v.peak.cacheMiss, path + '.peak.cacheMiss'),
      output: needNum(v.peak.output, path + '.peak.output'),
    }
  }
  if (v.legacyBase !== undefined && v.legacyBase !== null) {
    out.legacyBase = {
      cacheHit: needNum(v.legacyBase.cacheHit, path + '.legacyBase.cacheHit'),
      cacheMiss: needNum(v.legacyBase.cacheMiss, path + '.legacyBase.cacheMiss'),
      output: needNum(v.legacyBase.output, path + '.legacyBase.output'),
    }
  }
  if (v.legacy !== undefined) out.legacy = needBool(v.legacy, path + '.legacy')
  return out
}
function parseCustomItem(v, path) {
  if (v === null || typeof v !== 'object' || Array.isArray(v)) fail(path, 'object')
  const out = {
    key: needStr(v.key, path + '.key'),
    label: needStr(v.label, path + '.label'),
    kind: v.kind === 'percent' || v.kind === 'number' || v.kind === 'money' || v.kind === 'text' ? v.kind : 'number',
    path: needStr(v.path, path + '.path'),
    maxPath: v.maxPath === null || v.maxPath === undefined ? null : (typeof v.maxPath === 'string' || typeof v.maxPath === 'number' ? v.maxPath : null),
    resetsAtPath: v.resetsAtPath === null || v.resetsAtPath === undefined ? null : needStr(v.resetsAtPath, path + '.resetsAtPath'),
  }
  return out
}
function parseProvider(v, path) {
  if (v === null || typeof v !== 'object' || Array.isArray(v)) fail(path, 'object')
  const out = {
    enabled: v.enabled !== false,
    preset: v.preset === 'deepseek' || v.preset === 'opencode' || v.preset === 'custom' ? v.preset : 'custom',
    refreshMinutes: typeof v.refreshMinutes === 'number' && Number.isFinite(v.refreshMinutes) ? v.refreshMinutes : 15,
    apiKey: typeof v.apiKey === 'string' ? v.apiKey : '',
  }
  if (v.custom !== undefined && v.custom !== null) {
    if (typeof v.custom !== 'object' || Array.isArray(v.custom)) fail(path + '.custom', 'object')
    out.custom = {
      url: needStr(v.custom.url, path + '.custom.url'),
      headers: typeof v.custom.headers === 'object' && v.custom.headers !== null && !Array.isArray(v.custom.headers) ? v.custom.headers : {},
      items: Array.isArray(v.custom.items) ? v.custom.items.map((it, i) => parseCustomItem(it, path + '.custom.items[' + i + ']')) : [],
    }
  }
  return out
}
function parsePriceTable(v, path) {
  if (v === null || typeof v !== 'object' || Array.isArray(v)) fail(path, 'object')
  const models = {}
  if (v.models !== null && typeof v.models === 'object' && !Array.isArray(v.models)) {
    for (const id of Object.keys(v.models)) models[id] = parsePrice(v.models[id], path + '.models.' + id)
  }
  return {
    models,
    default: parsePrice(v.default ?? { cacheHit: 0, cacheMiss: 0, output: 0 }, path + '.default'),
  }
}
function parseConfig(v, path) {
  if (v === null || typeof v !== 'object' || Array.isArray(v)) fail(path, 'object')
  const prices = { usd: null, cny: null }
  if (v.prices !== null && typeof v.prices === 'object' && !Array.isArray(v.prices)) {
    prices.usd = parsePriceTable(v.prices.usd, path + '.prices.usd')
    prices.cny = parsePriceTable(v.prices.cny, path + '.prices.cny')
  }
  const providers = {}
  if (v.providers !== null && typeof v.providers === 'object' && !Array.isArray(v.providers)) {
    for (const id of Object.keys(v.providers)) providers[id] = parseProvider(v.providers[id], path + '.providers.' + id)
  }
  return {
    locale: v.locale === 'zh' || v.locale === 'en' || v.locale === 'auto' ? v.locale : 'auto',
    decimals: needNum(v.decimals, path + '.decimals'),
    peakEnabled: v.peakEnabled === true,
    peakEffectiveAt: typeof v.peakEffectiveAt === 'string' ? v.peakEffectiveAt : '',
    peakWindows: Array.isArray(v.peakWindows)
      ? v.peakWindows.map((w, i) => ({ start: needNum(w.start, path + '.peakWindows[' + i + '].start'), end: needNum(w.end, path + '.peakWindows[' + i + '].end') }))
      : [],
    prices: prices.usd !== null && prices.cny !== null ? prices : { usd: null, cny: null },
    providers,
    historyDays: needNum(v.historyDays, path + '.historyDays'),
    fetchedAt: v.fetchedAt === null || v.fetchedAt === undefined ? null : needStr(v.fetchedAt, path + '.fetchedAt'),
    priceSource: typeof v.priceSource === 'string' ? v.priceSource : 'bundled',
  }
}
function parseUsageItem(v, path) {
  if (v === null || typeof v !== 'object' || Array.isArray(v)) fail(path, 'object')
  const out = {
    key: needStr(v.key, path + '.key'),
    label: needStr(v.label, path + '.label'),
    kind: v.kind === 'percent' || v.kind === 'number' || v.kind === 'money' || v.kind === 'text' ? v.kind : 'number',
    value: needNum(v.value, path + '.value'),
    resetsAt: v.resetsAt === null || v.resetsAt === undefined ? null : needStr(v.resetsAt, path + '.resetsAt'),
  }
  if (v.max !== undefined) out.max = needNum(v.max, path + '.max')
  if (v.percent !== undefined) out.percent = needNum(v.percent, path + '.percent')
  return out
}
function parseProviderUsage(v, path) {
  if (v === null || typeof v !== 'object' || Array.isArray(v)) fail(path, 'object')
  return {
    provider: needStr(v.provider, path + '.provider'),
    preset: v.preset === 'deepseek' || v.preset === 'opencode' || v.preset === 'custom' ? v.preset : 'custom',
    status: v.status === 'ok' || v.status === 'error' ? v.status : 'off',
    fetchedAt: typeof v.fetchedAt === 'number' ? v.fetchedAt : 0,
    message: typeof v.message === 'string' ? v.message : '',
    items: Array.isArray(v.items) ? v.items.map((it, i) => parseUsageItem(it, path + '.items[' + i + ']')) : [],
  }
}
function parseFetchResult(v, path) {
  if (v === null || typeof v !== 'object' || Array.isArray(v)) fail(path, 'object')
  const out = {
    ok: v.ok === true,
    message: typeof v.message === 'string' ? v.message : '',
  }
  if (v.config !== undefined && v.config !== null) out.config = parseConfig(v.config, path + '.config')
  return out
}
function parseCatalog(v, path) {
  if (v === null || typeof v !== 'object' || Array.isArray(v)) fail(path, 'object')
  const providers = Array.isArray(v.providers) ? v.providers.map((p, i) => ({
    id: needStr(p?.id, path + '.providers[' + i + '].id'),
    name: typeof p?.name === 'string' ? p.name : '',
  })) : []
  const models = Array.isArray(v.models) ? v.models.map((m, i) => ({
    provider: needStr(m?.provider, path + '.models[' + i + '].provider'),
    providerName: typeof m?.providerName === 'string' ? m.providerName : '',
    id: needStr(m?.id, path + '.models[' + i + '].id'),
    name: typeof m?.name === 'string' ? m.name : '',
  })) : []
  return { providers, models }
}
function codecOf(parse) {
  return { parse }
}
const configCodec = codecOf(parseConfig)
const patchCodec = codecOf(v => {
  if (v === null || typeof v !== 'object' || Array.isArray(v)) fail('patch', 'object')
  return v
})
const usageCodec = codecOf(parseProviderUsage)
const fetchCodec = codecOf(parseFetchResult)
const catalogCodec = codecOf(parseCatalog)
const stringCodec = codecOf(v => {
  if (typeof v !== 'string') fail('providerId', 'string')
  return v
})

/** Typert RPC 贡献清单(与服务端 ./typert 清单一一对应)。 */
export const CONTRIBUTION = {
  package: 'dsh-monitor',
  descriptors: [
    {
      id: 'dsh-monitor#monitor/getProviderUsage', service: 'monitor', namespace: 'monitor', method: 'getProviderUsage',
      invocation: { kind: 'direct' },
      parameters: [{ name: 'providerId', wire: 'providerId', source: 'json', codec: { mode: 'strict', typeSymbol: 'string', schema: stringCodec } }],
      result: { mode: 'strict', typeSymbol: 'dsh-monitor#ProviderUsage', schema: usageCodec },
    },
    {
      id: 'dsh-monitor#monitor/refreshProvider', service: 'monitor', namespace: 'monitor', method: 'refreshProvider',
      invocation: { kind: 'direct' },
      parameters: [{ name: 'providerId', wire: 'providerId', source: 'json', codec: { mode: 'strict', typeSymbol: 'string', schema: stringCodec } }],
      result: { mode: 'strict', typeSymbol: 'dsh-monitor#ProviderUsage', schema: usageCodec },
    },
    {
      id: 'dsh-monitor#monitor/getConfig', service: 'monitor', namespace: 'monitor', method: 'getConfig',
      invocation: { kind: 'direct' }, parameters: [],
      result: { mode: 'strict', typeSymbol: 'dsh-monitor#MonitorConfig', schema: configCodec },
    },
    {
      id: 'dsh-monitor#monitor/updateConfig', service: 'monitor', namespace: 'monitor', method: 'updateConfig',
      invocation: { kind: 'direct' },
      parameters: [{ name: 'patch', wire: 'patch', source: 'json', codec: { mode: 'strict', typeSymbol: 'dsh-monitor#ConfigPatch', schema: patchCodec } }],
      result: { mode: 'strict', typeSymbol: 'dsh-monitor#MonitorConfig', schema: configCodec },
    },
    {
      id: 'dsh-monitor#monitor/listCatalog', service: 'monitor', namespace: 'monitor', method: 'listCatalog',
      invocation: { kind: 'direct' }, parameters: [],
      result: { mode: 'strict', typeSymbol: 'dsh-monitor#Catalog', schema: catalogCodec },
    },
    {
      id: 'dsh-monitor#monitor/fetchPrices', service: 'monitor', namespace: 'monitor', method: 'fetchPrices',
      invocation: { kind: 'direct' }, parameters: [],
      result: { mode: 'strict', typeSymbol: 'dsh-monitor#FetchPricesResult', schema: fetchCodec },
    },
  ],
}