/**
 * DeepSeek 官方定价模型:价格表、官方文档解析、计费数学。
 *
 * 移植自 dsh-cost-meter(lib/pricing.js,MIT),保留峰谷计价与官方价格同步,
 * 去掉宿主不用的 formatMoney / isZeroPrice(展示层在客户端)。
 *
 * 价格单位:按生效币种计价;账本成本即该币种数值(USD 存美元数字,CNY 存人民币
 * 数字),并带 currency 标记;不做跨币种换算。
 *
 * 本插件按界面语言区分币种:账本同时维护 USD 与 CNY 两套独立价格表
 * (config.prices.usd / config.prices.cny),分别可与官方英文页 / 中文页同步;
 * 生效币种由界面语言决定(zh → cny,其余 → usd,auto 视作 zh)。
 *
 * 官方页面(2026-08-15 抓取)要点:
 *  - 现为纯峰谷两档计价:空闲时段(OFF-PEAK)价格 = 高峰时段(PEAK)价格的一半;
 *    deepseek-v4-flash 空闲 命中 $0.007 / 未命中 $0.22 / 输出 $0.66,
 *    高峰 命中 $0.014 / 未命中 $0.44 / 输出 $1.32;
 *    deepseek-v4-pro 空闲 命中 $0.022 / 未命中 $0.66 / 输出 $1.98,
 *    高峰 命中 $0.044 / 未命中 $1.32 / 输出 $3.96;
 *    中文页(/zh-cn/quick_start/pricing)对应人民币:
 *    flash 空闲 命中 ¥0.05 / 未命中 ¥1.5 / 输出 ¥4.5,高峰翻倍;
 *    pro 空闲 命中 ¥0.15 / 未命中 ¥4.5 / 输出 ¥13.5,高峰翻倍。
 *  - 峰时段为 01:00-04:00 与 06:00-10:00 UTC,其余为空闲时段;
 *  - 页面已不再列出基础价档与生效时间(两档方案即时生效);本插件把空闲档
 *    同时作为「基础档」存储,未启用峰谷计价时按空闲档计费。
 *  - 页面未单列 cache write 价格,历史定价中 cache write 按 cache hit 计,
 *    本插件沿用该规则(cacheRead + cacheWrite 均按命中价计)。
 *  - 本插件自 2026-08-17 起开发,仅使用峰谷时代的新价格,不保留
 *    峰谷时代之前的历史基础价,也不对更早时刻做历史旧价回算。
 *
 * 价格表写法(两币种一致):
 *  - 三桶:{ cacheHit, cacheMiss, output }(DeepSeek 官方结构);
 *  - 两档简写:{ input, output }(Anthropic / Gemini / Mistral 等无缓存折扣模型);
 *  - 任意子集皆可:cacheMiss 缺省取 input,cacheHit 缺省取 cacheMiss(无缓存折扣
 *    时命中价 = 未命中价),output 缺省为 0;峰谷子档(offPeak/peak)
 *    同样适用该补齐规则。
 */

/** 官方定价页(英文版,服务端预渲染,可解析)。 */
export const OFFICIAL_PRICING_URL = 'https://api-docs.deepseek.com/quick_start/pricing'

/** 官方定价页(中文版,人民币价格)。 */
export const CNY_PRICING_URL = 'https://api-docs.deepseek.com/zh-cn/quick_start/pricing'

/** 峰谷计价生效时间(UTC)。两档方案已即时生效:置为过去时刻,门控恒通过。 */
export const DEFAULT_PEAK_EFFECTIVE_AT = '2026-08-01T00:00:00Z'

/** 峰时段窗口(UTC 小时,半开区间 [start, end))。 */
export const DEFAULT_PEAK_WINDOWS = [
  { start: 1, end: 4 },
  { start: 6, end: 10 },
]

/** 内置默认价格表(与官方页面当前数字一致,供首次启动使用;基础档 = 空闲档)。 */
export const DEFAULT_PRICE_TABLE = {
  models: {
    'deepseek-v4-flash': {
      cacheHit: 0.007,
      cacheMiss: 0.22,
      output: 0.66,
      offPeak: { cacheHit: 0.007, cacheMiss: 0.22, output: 0.66 },
      peak: { cacheHit: 0.014, cacheMiss: 0.44, output: 1.32 },
    },
    'deepseek-v4-pro': {
      cacheHit: 0.022,
      cacheMiss: 0.66,
      output: 1.98,
      offPeak: { cacheHit: 0.022, cacheMiss: 0.66, output: 1.98 },
      peak: { cacheHit: 0.044, cacheMiss: 1.32, output: 3.96 },
    },
  },
  default: { cacheHit: 0.007, cacheMiss: 0.22, output: 0.66 },
}

/** 内置默认人民币价格表(与官方中文页当前数字一致;基础档 = 空闲档)。 */
export const DEFAULT_PRICE_TABLE_CNY = {
  models: {
    'deepseek-v4-flash': {
      cacheHit: 0.05,
      cacheMiss: 1.5,
      output: 4.5,
      offPeak: { cacheHit: 0.05, cacheMiss: 1.5, output: 4.5 },
      peak: { cacheHit: 0.1, cacheMiss: 3.0, output: 9.0 },
    },
    'deepseek-v4-pro': {
      cacheHit: 0.15,
      cacheMiss: 4.5,
      output: 13.5,
      offPeak: { cacheHit: 0.15, cacheMiss: 4.5, output: 13.5 },
      peak: { cacheHit: 0.3, cacheMiss: 9.0, output: 27.0 },
    },
  },
  default: { cacheHit: 0.05, cacheMiss: 1.5, output: 4.5 },
}

/**
 * 当前生效币种:界面语言 zh → 'cny',其余(含 auto,服务端视作 zh)→ 'usd'。
 * @param config - 账本配置。
 * @returns 'usd' | 'cny'。
 */
export function activeCurrency(config) {
  return config?.locale === 'en' ? 'usd' : 'cny'
}

/**
 * 按当前生效币种选取价格表(两美元/人民币两套表相互独立)。
 * @param config - 账本配置。
 * @returns { models, default } 价格表(缺档时回退到 USD 表或空表)。
 */
export function priceTableFor(config) {
  const prices = config?.prices
  if (prices === null || typeof prices !== 'object') {
    return { models: {}, default: { cacheHit: 0, cacheMiss: 0, output: 0 } }
  }
  const table = prices[activeCurrency(config)]
  if (table !== null && typeof table === 'object' && table.models !== null && typeof table.models === 'object') {
    return table
  }
  const usd = prices.usd
  if (usd !== null && typeof usd === 'object' && usd.models !== null && typeof usd.models === 'object') {
    return usd
  }
  return { models: {}, default: { cacheHit: 0, cacheMiss: 0, output: 0 } }
}

/**
 * 补齐一档价格:支持多种模型计费写法。
 *  - 三桶写法:{ cacheHit, cacheMiss, output }(DeepSeek 官方结构);
 *  - 两档简写:{ input, output }(Anthropic / Gemini / Mistral 等无缓存折扣模型
 *    的价表通常只给输入/输出两档);
 *  - 混合:{ cacheMiss, output } 等任意子集。
 * 补齐规则:
 *  - cacheMiss 缺省 → 取 input;两者都缺 → 0;
 *  - cacheHit 缺省 → 取 cacheMiss(无缓存折扣时命中价 = 未命中价);
 *  - output 缺省 → 0。
 * 显式给出的数字恒优先;非负有限数字才被接受。
 * @param raw - 任意一档价格对象。
 * @returns 补全后的三桶价格 { cacheHit, cacheMiss, output },或 undefined。
 */
function completeTier(raw) {
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) return undefined
  const n = key => {
    const v = raw[key]
    return typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : undefined
  }
  const cacheMiss = n('cacheMiss') ?? n('input') ?? 0
  const cacheHit = n('cacheHit') ?? cacheMiss
  const output = n('output') ?? 0
  return { cacheHit, cacheMiss, output }
}

/**
 * 规范化一条价格记录:按 completeTier 补齐缺失字段,剥离未知字段。
 * @param value - 任意解析结果。
 * @returns 规范化后的价格记录,或 null。
 */
export function normalizePrice(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return null
  if (!('cacheHit' in value) && !('cacheMiss' in value) && !('output' in value) && !('input' in value)) return null
  const entry = completeTier(value)
  if (value.peakEnabled !== undefined) entry.peakEnabled = value.peakEnabled === true
  const offPeak = completeTier(value.offPeak)
  if (offPeak !== undefined) entry.offPeak = offPeak
  const peak = completeTier(value.peak)
  if (peak !== undefined) entry.peak = peak
  const windows = normalizeWindows(value.windows)
  if (windows !== undefined) entry.windows = windows
  return entry
}

/**
 * 规范化每模型的峰谷时间窗口(可选)。
 * @param raw - { peak?: [{start,end}], offPeak?: [{start,end}] }(UTC 整数小时)。
 * @returns 规范化窗口对象;无任何有效窗口时返回 undefined。
 */
export function normalizeWindows(raw) {
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) return undefined
  const norm = list => {
    if (!Array.isArray(list)) return []
    const out = []
    for (const item of list) {
      const start = Number(item?.start)
      const end = Number(item?.end)
      if (Number.isInteger(start) && Number.isInteger(end) && start >= 0 && start < 24 && end >= 0 && end < 24) {
        out.push({ start, end })
      }
    }
    return out
  }
  const peak = norm(raw.peak)
  const offPeak = norm(raw.offPeak)
  if (peak.length === 0 && offPeak.length === 0) return undefined
  const out = {}
  if (peak.length > 0) out.peak = peak
  if (offPeak.length > 0) out.offPeak = offPeak
  return out
}

/**
 * 按模型 id 解析价格记录:精确匹配 → default 回退。
 * @param modelId - 请求中的模型 id。
 * @param table - { models, default } 价格表。
 * @returns 价格记录。
 */
export function priceEntryFor(modelId, table) {
  const models = table?.models ?? {}
  if (typeof modelId === 'string' && modelId.length > 0) {
    const exact = models[modelId]
    if (exact !== undefined) return exact
  }
  return table?.default ?? { cacheHit: 0, cacheMiss: 0, output: 0 }
}

/**
 * 某一 UTC 小时是否落在任一窗口(半开 [start,end),支持跨午夜)。
 * @param hour - UTC 小时(0-23)。
 * @param windows - 窗口数组({start,end} UTC 小时)。
 * @returns 命中返回 true。
 */
export function hourInWindows(hour, windows) {
  return (Array.isArray(windows) ? windows : []).some(w => {
    const start = Number(w?.start)
    const end = Number(w?.end)
    if (!Number.isFinite(start) || !Number.isFinite(end)) return false
    if (start < end) return hour >= start && hour < end
    // 跨午夜窗口。
    return hour >= start || hour < end
  })
}

/**
 * 某一时刻是否处于峰时段。
 * @param atMs - 时刻(epoch ms)。
 * @param effectiveAtMs - 峰谷计价生效时刻(epoch ms)。
 * @param windows - 峰时段窗口数组({start,end} UTC 小时,半开区间)。
 * @returns 峰时段返回 true;生效前或窗口外返回 false。
 */
export function isPeakHour(atMs, effectiveAtMs, windows) {
  if (!Array.isArray(windows) || windows.length === 0) return false
  if (Number.isFinite(effectiveAtMs) && atMs < effectiveAtMs) return false
  return hourInWindows(new Date(atMs).getUTCHours(), windows)
}

/**
 * 为一次用量挑选价格档位(按模型自身的峰值/空闲窗口)。
 *
 * 窗口取自模型价格条目的 `windows`(可选),缺省时回退到全局 peak.windows:
 *  - 模型设了 peak 窗口 → 窗口内用 peak 价,窗口外(含未设 offPeak 窗口)用 offPeak 价;
 *  - 只设了 offPeak 窗口 → 窗口内用 offPeak 价,窗口外用 peak 价;
 *  - 两者都设 → 各自窗口各自档,重叠时 peak 优先;
 *  - 两者都没设 → 恒用 offPeak 价(基础价)。
 * 生效前或禁用峰谷 → 基础价格。cache write 与 cache hit 同价。
 * @param entry - 模型价格记录(可含可选 windows)。
 * @param atMs - 计费时刻。
 * @param peak - { enabled, effectiveAtMs, windows } 峰谷配置(windows 为全局回退)。
 * @returns 三档价格 { cacheHit, cacheMiss, output }。
 */
export function tierFor(entry, atMs, peak) {
  const base = entry ?? { cacheHit: 0, cacheMiss: 0, output: 0 }
  const pick = tier => tier === undefined || tier === null
    ? { cacheHit: base.cacheHit, cacheMiss: base.cacheMiss, output: base.output }
    : { cacheHit: tier.cacheHit, cacheMiss: tier.cacheMiss, output: tier.output }
  // 模型级「峰谷」开关:显式关闭(peakEnabled === false)时禁用峰谷,只用基础价。
  if (entry?.peakEnabled === false) return pick(undefined)
  if (peak?.enabled !== true) return pick(undefined)
  const effectiveAtMs = typeof peak.effectiveAtMs === 'number' ? peak.effectiveAtMs : undefined
  if (effectiveAtMs !== undefined && atMs < effectiveAtMs) return pick(undefined)
  const own = entry?.windows
  // 模型一旦设了自己的窗口(任一档),就完全按自己的窗口判定;完全没设才回退全局。
  const hasOwn = own !== undefined
    && ((Array.isArray(own.peak) && own.peak.length > 0)
      || (Array.isArray(own.offPeak) && own.offPeak.length > 0))
  const peakWins = hasOwn
    ? (Array.isArray(own.peak) ? own.peak : [])
    : (Array.isArray(peak.windows) && peak.windows.length > 0 ? peak.windows : [])
  const offWins = hasOwn ? (Array.isArray(own.offPeak) ? own.offPeak : []) : []
  const hour = new Date(atMs).getUTCHours()
  const inPeak = hourInWindows(hour, peakWins)
  const inOff = hourInWindows(hour, offWins)
  if (inPeak) return pick(base.peak)
  if (peakWins.length > 0) return pick(base.offPeak) // 定义了 peak 窗口:窗口外都是空闲
  if (offWins.length > 0) return pick(inOff ? base.offPeak : base.peak) // 只定义 offPeak:窗口外是高峰
  return pick(base.offPeak) // 两者都未定义:恒空闲(基础价)
}

/**
 * 一次调用的美元成本。
 * @param tokens - { input, output, cacheRead, cacheWrite } 各桶 token 数。
 * @param entry - 模型价格记录。
 * @param atMs - 计费时刻。
 * @param peak - 峰谷配置。
 * @returns 美元成本(非负)。
 */
export function costOf(tokens, entry, atMs, peak) {
  const tier = tierFor(entry, atMs, peak)
  const input = Math.max(0, Number(tokens?.input) || 0)
  const output = Math.max(0, Number(tokens?.output) || 0)
  const cacheRead = Math.max(0, Number(tokens?.cacheRead) || 0)
  const cacheWrite = Math.max(0, Number(tokens?.cacheWrite) || 0)
  const cost = (input * tier.cacheMiss
    + output * tier.output
    + (cacheRead + cacheWrite) * tier.cacheHit) / 1_000_000
  return Math.max(0, cost)
}

// ── 官方页面解析 ──────────────────────────────────────────────────────────

function decodeEntities(text) {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&mdash;/g, '—')
}

function stripTags(html) {
  return decodeEntities(String(html).replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim()
}

/** 取出页面内所有 <table> 块,解析为行 × 单元格文本。 */
function parseTables(html) {
  const blocks = String(html).match(/<table[\s\S]*?<\/table>/gi) ?? []
  return blocks.map(block => {
    const rows = []
    const trs = block.match(/<tr[\s\S]*?<\/tr>/gi) ?? []
    for (const tr of trs) {
      const cells = tr.match(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi) ?? []
      const row = cells.map(cell => stripTags(cell.replace(/^<t[dh][^>]*>/, '').replace(/<\/t[dh]>$/, '')))
      if (row.length > 0) rows.push(row)
    }
    return rows
  })
}

/** 单元格内金额:USD 取 $ 数字,CNY 取「数字+元」。 */
function cellMoney(cell, target) {
  const pattern = target === 'cny' ? /([0-9]+(?:\.[0-9]+)?)\s*元/ : /(?:^|\s)\$([0-9]+(?:\.[0-9]+)?)/
  const m = pattern.exec(cell ?? '')
  if (m === null) return null
  const value = Number(m[1])
  return Number.isFinite(value) ? value : null
}

const MODEL_ID = /deepseek-[a-z0-9_.-]+/i

/** 评级目标的语言/内容差异:指标、模型表头、档位标签。 */
const TARGET_PROFILE = {
  usd: {
    metricOf: text => {
      if (text.includes('CACHE HIT')) return 'cacheHit'
      if (text.includes('CACHE MISS')) return 'cacheMiss'
      if (text.includes('OUTPUT TOKENS')) return 'output'
      return null
    },
    isModelHeader: first => /^MODEL$/i.test(first),
    tierOf: cell => {
      const c = (cell ?? '').trim()
      if (/^OFF-PEAK$/i.test(c)) return 'offPeak'
      if (/^PEAK$/i.test(c)) return 'peak'
      return null
    },
  },
  cny: {
    metricOf: text => {
      if (text.includes('缓存未命中')) return 'cacheMiss'
      if (text.includes('缓存命中')) return 'cacheHit'
      if (text.includes('输出')) return 'output'
      return null
    },
    isModelHeader: first => /^模型$/i.test(first.trim()),
    tierOf: cell => {
      const c = (cell ?? '').trim()
      if (/^空闲时段$/.test(c)) return 'offPeak'
      if (/^高峰时段$/.test(c)) return 'peak'
      return null
    },
  },
}

/**
 * 解析官方定价页 HTML(支持美元 / 人民币两个目标)。
 *
 * 页面为一张表(服务端预渲染,结构与 2026-08-15 抓取一致):
 *  - 首行 [MODEL, <模型id>...](中文页为 [模型, <模型id>...])给出全部模型 id;
 *  - 计价行按指标分组:指标标签行 [1M INPUT TOKENS (CACHE HIT), OFF-PEAK, $hit, $hit]
 *    后跟 PEAK 续行 [PEAK, $hit, $hit](首两格被上一行 rowspan 合并);
 *    中文页同构:指标行 [百万tokens输入（缓存命中）, 空闲时段, 0.05元, 0.15元]
 *    后跟 [高峰时段, 0.10元, 0.30元];
 *  - 每个指标给出 OFF-PEAK / PEAK 两档各模型价格,空闲档 = 高峰档的一半;
 *  - 页面已不再列出基础价档与生效时间(两档方案即时生效),因此 models 的
 *    基础档直接取空闲档数值,effectiveAt 返回 null。
 * @param html - 页面源文本。
 * @param target - 'usd' | 'cny'(英文页 / 中文页),决定指标/表头/金额解析。
 * @returns { models, effectiveAt, peakWindows } 解析结果。
 * @throws 无法识别价格表时抛出带说明的 Error。
 */
export function parsePricingHtml(html, target = 'usd') {
  const profile = TARGET_PROFILE[target] ?? TARGET_PROFILE.usd
  const tables = parseTables(html)
  const modelIds = []
  /** metricKey -> { offPeak: number[], peak: number[] }(按模型顺序)。 */
  const tiers = {}
  const metricOf = cell => profile.metricOf((cell ?? '').toUpperCase())

  for (const rows of tables) {
    let lastMetric = null
    for (let i = 0; i < rows.length; i += 1) {
      const row = rows[i]
      const first = (row[0] ?? '').trim()
      // 模型表头行:MODEL / 模型 后跟全部模型 id。
      if (profile.isModelHeader(first)) {
        const ids = row.slice(1).map(cell => (MODEL_ID.exec(cell ?? '') ?? [])[0]).filter(Boolean)
        if (ids.length > 0) modelIds.splice(0, modelIds.length, ...ids)
        continue
      }
      // 指标标签可能在本行任意单元格(含 rowspan 合并布局);PEAK 续行沿用上一行指标。
      const metric = metricOf(row.join(' ')) ?? lastMetric
      if (metric !== null) lastMetric = metric
      // 档位标签:OFF-PEAK / PEAK(或 空闲时段 / 高峰时段),价格紧跟其后。
      let tierLabel = null
      let tierIdx = -1
      for (let j = 0; j < row.length; j += 1) {
        const label = profile.tierOf(row[j])
        if (label === null) continue
        tierLabel = label
        tierIdx = j
        break
      }
      if (tierIdx < 0) continue
      if (metric === null || modelIds.length === 0) continue
      const prices = row.slice(tierIdx + 1, tierIdx + 1 + modelIds.length).map(cell => cellMoney(cell, target))
      if (prices.some(v => v === null)) continue
      if (tiers[metric] === undefined) tiers[metric] = { offPeak: [], peak: [] }
      tiers[metric][tierLabel] = prices
    }
  }

  const models = {}
  for (let k = 0; k < modelIds.length; k += 1) {
    const id = modelIds[k].toLowerCase()
    const off = {
      cacheHit: tiers.cacheHit?.offPeak?.[k],
      cacheMiss: tiers.cacheMiss?.offPeak?.[k],
      output: tiers.output?.offPeak?.[k],
    }
    const pk = {
      cacheHit: tiers.cacheHit?.peak?.[k],
      cacheMiss: tiers.cacheMiss?.peak?.[k],
      output: tiers.output?.peak?.[k],
    }
    if (off.cacheHit === undefined || off.cacheMiss === undefined || off.output === undefined) continue
    models[id] = {
      cacheHit: off.cacheHit,
      cacheMiss: off.cacheMiss,
      output: off.output,
      offPeak: off,
      peak: {
        cacheHit: pk.cacheHit ?? off.cacheHit,
        cacheMiss: pk.cacheMiss ?? off.cacheMiss,
        output: pk.output ?? off.output,
      },
    }
  }

  if (Object.keys(models).length === 0) {
    // code 供上层按语言渲染提示(见 index.js 的 ERR_NO_MODELS 分支)。
    const error = new Error('官方页面中未解析出任何模型价格，页面结构可能已变化，请稍后重试或手动编辑价格')
    error.code = 'ERR_NO_MODELS'
    throw error
  }
  // 生效时间:页面已不再给出(两档方案即时生效)→ null。
  const effectiveAt = null
  // 峰时段窗口(仅英文页给出 UTC 时段;中文页为北京时段,不去覆盖)。
  let peakWindows = null
  const plain = stripTags(html)
  const win = /Peak hours are\s+(.+?)\s+UTC/.exec(plain)
  if (win !== null) {
    const pairs = win[1].match(/\d{1,2}:\d{2}/g) ?? []
    peakWindows = []
    for (let i = 0; i + 1 < pairs.length; i += 2) {
      const start = Number(pairs[i].split(':')[0])
      const end = Number(pairs[i + 1].split(':')[0])
      if (Number.isFinite(start) && Number.isFinite(end)) peakWindows.push({ start, end })
    }
  }
  return { models, effectiveAt, peakWindows }
}