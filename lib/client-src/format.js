/**
 * dsh-monitor 客户端计价与显示助手(与服务端 pricing.js 一致)。
 */

/** 取模型价格条目;未知模型回退 default。 */
function priceEntryFor(modelId, table) {
  const models = table?.models ?? {}
  if (typeof modelId === 'string' && modelId.length > 0 && models[modelId] !== undefined) return models[modelId]
  return table?.default ?? { cacheHit: 0, cacheMiss: 0, output: 0 }
}

/** 当前生效币种:界面语言 zh → 'cny',其余(含 auto)按中文处理 → 'cny' 之外为 'usd'。 */
function activeCurrency(locale) {
  return (locale ?? '') === 'en' ? 'usd' : 'cny'
}

/** 按生效币种从双表配置里取价格表(与账本 account 同口径)。 */
function priceTableFor(config, locale) {
  const prices = config?.prices
  if (prices === null || typeof prices !== 'object') {
    return { models: {}, default: { cacheHit: 0, cacheMiss: 0, output: 0 } }
  }
  const table = prices[activeCurrency(locale)]
  if (table !== null && typeof table === 'object' && table.models !== null && typeof table.models === 'object') {
    return table
  }
  const usd = prices.usd
  if (usd !== null && typeof usd === 'object' && usd.models !== null && typeof usd.models === 'object') {
    return usd
  }
  return { models: {}, default: { cacheHit: 0, cacheMiss: 0, output: 0 } }
}

/** 某一 UTC 小时是否落在任一窗口(半开,支持跨午夜)。 */
function hourInWindows(hour, windows) {
  return (Array.isArray(windows) ? windows : []).some(w => {
    const start = Number(w?.start)
    const end = Number(w?.end)
    if (!Number.isFinite(start) || !Number.isFinite(end)) return false
    return start < end ? hour >= start && hour < end : hour >= start || hour < end
  })
}

// ── 窗口时区换算(固定冬季锚点,避免 DST 逐月波动;窗口粒度 = 整点) ──────────

/** 本地小时(0-23)→ UTC 小时。 */
function localHourToUtc(localHour) {
  const d = new Date(2000, 0, 1, Number(localHour) || 0, 0, 0, 0)
  return d.getUTCHours()
}

/** UTC 小时 → 本地小时。 */
function utcHourToLocal(utcHour) {
  const d = new Date(2000, 0, 1, 0, 0, 0, 0)
  d.setUTCHours(Number(utcHour) || 0, 0, 0, 0)
  return d.getHours()
}

/** 本地窗口显示串(如「09:00–12:00」)。 */
function formatWindow(w) {
  const hh = h => String(h).padStart(2, '0') + ':00'
  return hh(utcHourToLocal(w?.start)) + '–' + hh(utcHourToLocal(w?.end))
}

/** 按时刻挑选计费档位(与账本同口径:模型自带窗口优先 + 补集语义)。 */
function tierFor(entry, atMs, peak) {
  const base = entry ?? { cacheHit: 0, cacheMiss: 0, output: 0 }
  const pick = tier => tier === undefined || tier === null
    ? { cacheHit: base.cacheHit, cacheMiss: base.cacheMiss, output: base.output }
    : { cacheHit: tier.cacheHit, cacheMiss: tier.cacheMiss, output: tier.output }
  if (peak?.enabled !== true) return pick(undefined)
  const effectiveAtMs = typeof peak.effectiveAtMs === 'number' ? peak.effectiveAtMs : undefined
  if (effectiveAtMs !== undefined && atMs < effectiveAtMs) return pick(undefined)
  const own = entry?.windows
  const peakWins = (Array.isArray(own?.peak) && own.peak.length > 0)
    ? own.peak
    : (Array.isArray(peak.windows) && peak.windows.length > 0 ? peak.windows : [])
  const offWins = Array.isArray(own?.offPeak) && own.offPeak.length > 0 ? own.offPeak : []
  const hour = new Date(atMs).getUTCHours()
  const inPeak = hourInWindows(hour, peakWins)
  const inOff = hourInWindows(hour, offWins)
  if (inPeak) return pick(base.peak)
  if (peakWins.length > 0) return pick(base.offPeak)
  if (offWins.length > 0) return pick(inOff ? base.offPeak : base.peak)
  return pick(base.offPeak)
}

/** token 桶 × 档位价 → 成本数值(按 1M tokens 计价;币种 = 档位价所属价格表)。 */
function costOfBuckets(buckets, tier) {
  const input = Math.max(0, Number(buckets.input) || 0)
  const output = Math.max(0, Number(buckets.output) || 0)
  const cacheRead = Math.max(0, Number(buckets.cacheRead) || 0)
  const cacheWrite = Math.max(0, Number(buckets.cacheWrite) || 0)
  return (input * tier.cacheMiss + output * tier.output + (cacheRead + cacheWrite) * tier.cacheHit) / 1_000_000
}

/** 金额 → 显示字符串(符号 + 可调小数位);按生效币种直接显示,不做汇率换算。 */
function formatMoneyValue(value, locale, decimals) {
  const symbol = activeCurrency(locale) === 'cny' ? '¥' : '$'
  const d = Math.max(0, Math.min(10, Math.floor(Number(decimals) || 4)))
  let effective = d
  if (value > 0 && value < Math.pow(10, -d)) effective = d + 2
  const fixed = value.toFixed(effective)
  const trimmed = fixed.includes('.') ? fixed.replace(/0+$/, '').replace(/\.$/, '') : fixed
  return symbol + trimmed
}

/** 账本成本(已按生效币种计费)按该币种直接显示(符号 ¥ / $),不再乘汇率。 */
function formatMoneyUsd(cost, locale, decimals) {
  return formatMoneyValue(cost, locale, decimals)
}

/** 普通数值显示(无符号,最多 fixed 位小数,去尾零)。 */
function formatPlain(value, decimals) {
  const d = Math.max(0, Math.min(10, Math.floor(Number(decimals) || 2)))
  const fixed = value.toFixed(d)
  return fixed.includes('.') ? fixed.replace(/0+$/, '').replace(/\.$/, '') : fixed
}

/** token 数 → 紧凑显示(K/M)。 */
function formatTokens(n) {
  const v = Math.max(0, Number(n) || 0)
  const scaled = x => x >= 100 ? String(Math.round(x)) : String(Math.round(x * 10) / 10)
  if (v < 1000) return String(Math.round(v))
  if (v < 1000000) return scaled(v / 1000) + 'K'
  return scaled(v / 1000000) + 'M'
}

/** 投影 token 桶 → 按当前时刻档位计价,成本即生效币种数值。 */
function usageCost(usage, config) {
  if (!usage || !config) return 0
  // 宿主按事件时刻逐次计费的成本(历史正确,含峰谷时代前的旧基础价)。
  if (typeof usage.cost === 'number' && Number.isFinite(usage.cost)) return usage.cost
  const peak = {
    enabled: config.peakEnabled === true,
    effectiveAtMs: Date.parse(config.peakEffectiveAt || ''),
    windows: config.peakWindows,
  }
  const table = priceTableFor(config, config?.locale)
  const now = Date.now()
  const byModel = usage.byModel ?? {}
  let total = 0
  for (const modelId of Object.keys(byModel)) {
    const entry = priceEntryFor(modelId, table)
    total += costOfBuckets(byModel[modelId], tierFor(entry, now, peak))
  }
  const modeled = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 }
  for (const modelId of Object.keys(byModel)) {
    modeled.input += byModel[modelId].input ?? 0
    modeled.output += byModel[modelId].output ?? 0
    modeled.cacheRead += byModel[modelId].cacheRead ?? 0
    modeled.cacheWrite += byModel[modelId].cacheWrite ?? 0
  }
  const leftover = {
    input: Math.max(0, (usage.input ?? 0) - modeled.input),
    output: Math.max(0, (usage.output ?? 0) - modeled.output),
    cacheRead: Math.max(0, (usage.cacheRead ?? 0) - modeled.cacheRead),
    cacheWrite: Math.max(0, (usage.cacheWrite ?? 0) - modeled.cacheWrite),
  }
  total += costOfBuckets(leftover, tierFor(priceEntryFor('default', table), now, peak))
  return total
}

/** 计费口径的输入 token(含缓存读写)。 */
function billedInput(usage) {
  return (usage?.input ?? 0) + (usage?.cacheRead ?? 0) + (usage?.cacheWrite ?? 0)
}

export {
  activeCurrency, priceTableFor, priceEntryFor, tierFor, costOfBuckets,
  hourInWindows, localHourToUtc, utcHourToLocal, formatWindow,
  formatMoneyValue, formatMoneyUsd, formatPlain, formatTokens,
  usageCost, billedInput,
}