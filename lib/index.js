/**
 * dsh-monitor 宿主插件。
 *
 * 单一 Loader 行(见 cordis.patch.yml)挂载本模块,职责:
 *  1. 打开/维护账本($DSH_HOME/storages/dsh-monitor/ledger.json);
 *  2. 包裹 `llm/stream` 瀑布,捕获每次模型调用的 usage 块按官方价格计费(峰谷 + 历史基础价);
 *  3. 注册 `costUsage` 会话投影(纯 token 桶 + 按模型拆分,客户端按价表计价);
 *  4. 提供 `monitor` 服务(手写 typertRemote 绑定,配合 ./typert 清单走
 *     Typert 网关):按提供方查询配置用量(DeepSeek 官方余额 / OpenCode Go 套餐
 *     额度 / 自定义 HTTP 用量),以及配置与官方价格同步。
 *
 * 会话计费与价格逻辑移植自 dsh-cost-meter(MIT);提供方用量查询为本插件自有。
 * 不导入 cordis/dsh-* 运行时包中的 Service/Context 类:仅用 ctx API 与 Node
 * 内建能力,因此与宿主进程共享同一套运行时实例;dsh-credentials 只用于
 * 凭证引用构造(credentialRef 为纯函数,无跨实例状态)。
 */

import { z } from 'zod'
import fs from 'node:fs'
import { credentialRef } from '@deepseek-ai/dsh-credentials'
import { Ledger, applyConfigPatch, localDayKey } from './store.js'
import { OFFICIAL_PRICING_URL, normalizePrice, parsePricingHtml, costOf, priceEntryFor } from './pricing.js'

export const name = 'monitor'

// ── 多语言(中/英) ─────────────────────────────────────────────────────────

/** 服务端用户可见文案(zh/en)。 */
const SERVER_MESSAGES = {
  zh: {
    apiKeyMissing: '未配置 DeepSeek API Key(请在 设置→模型 中配置,或导出 {env} 环境变量)',
    balanceHttp: '余额接口 HTTP {code}',
    balanceNoInfos: '余额接口响应缺少 balance_infos',
    balanceEndpointNotOfficial: '余额查询仅支持官方端点(api.deepseek.com):当前配置的 baseURL {url} 不是官方域名,为保护 API Key 已拒绝发起请求',
    balanceItemTotal: '总余额',
    balanceItemGranted: '赠送余额',
    balanceItemToppedUp: '充值余额',
    goQuotaKeyMissing: '未找到 OpenCode Go API Key。有 Go 订阅的话:运行 opencode login、导出 OPENCODE_GO_API_KEY 环境变量,或在提供方配置中填写 Key;没有订阅可关闭「启用」开关。',
    goQuotaHttp: 'OpenCode Go 额度接口 HTTP {code}',
    goQuotaNoSub: '没有检测到生效的 OpenCode Go 订阅(接口返回 {code}),或 API Key 无效。没有订阅可关闭「启用」开关。',
    goQuotaNoUsage: 'OpenCode Go 额度响应缺少 usage 字段',
    goRollingLabel: '滚动 5 小时',
    goWeeklyLabel: '本周',
    goMonthlyLabel: '本月',
    customHttp: '自定义用量接口 HTTP {code}',
    customNoUsage: '自定义用量接口响应无法解析为 JSON 对象',
    customUrlMissing: '自定义提供方缺少 url 配置',
    providerNotConfigured: '该提供方尚未配置用量查询',
    providerDisabled: '该提供方的用量查询已停用',
    providerUnknown: '未知提供方 {id}',
    configRejected: '配置更新被拒绝:{errors}',
    pageTooShort: '页面内容过短,可能被网关拦截',
    noModelsParsed: '官方页面中未解析出任何模型价格,页面结构可能已变化,请稍后重试或手动编辑价格',
    pricesSynced: '已从官方文档同步 {ids} 的价格',
    priceSyncFailed: '官方价格同步失败:{error}',
  },
  en: {
    apiKeyMissing: 'DeepSeek API key not configured (configure it in Settings → Models, or export the {env} environment variable)',
    balanceHttp: 'Balance API returned HTTP {code}',
    balanceNoInfos: 'Balance API response is missing balance_infos',
    balanceEndpointNotOfficial: 'Balance lookup only supports the official endpoint (api.deepseek.com): the configured baseURL {url} is not an official host, so the API key will not be sent there',
    balanceItemTotal: 'Total balance',
    balanceItemGranted: 'Granted balance',
    balanceItemToppedUp: 'Topped-up balance',
    goQuotaKeyMissing: 'OpenCode Go API key not found. If you have a Go subscription: run opencode login, export OPENCODE_GO_API_KEY, or set the key in the provider config; otherwise turn off the Enable switch above.',
    goQuotaHttp: 'OpenCode Go quota API returned HTTP {code}',
    goQuotaNoSub: 'No active OpenCode Go subscription detected (API returned {code}), or the API key is invalid. Turn off the Enable switch above if you have no subscription.',
    goQuotaNoUsage: 'OpenCode Go quota response is missing the usage field',
    goRollingLabel: 'Rolling 5 hours',
    goWeeklyLabel: 'This week',
    goMonthlyLabel: 'This month',
    customHttp: 'Custom usage API returned HTTP {code}',
    customNoUsage: 'Custom usage API response is not a JSON object',
    customUrlMissing: 'Custom provider is missing the url config',
    providerNotConfigured: 'No usage query configured for this provider',
    providerDisabled: 'Usage query for this provider is disabled',
    providerUnknown: 'Unknown provider {id}',
    configRejected: 'Config update rejected: {errors}',
    pageTooShort: 'Page content too short; the request may have been blocked by the gateway',
    noModelsParsed: 'No model prices could be parsed from the official page; the page structure may have changed — try again later or edit the price table manually.',
    pricesSynced: 'Synced prices for {ids} from the official docs',
    priceSyncFailed: 'Official price sync failed: {error}',
  },
}

/** 取服务端文案(zh/en),支持 {var} 插值。 */
function tmsg(locale, code, vars) {
  const dict = locale === 'en' ? SERVER_MESSAGES.en : SERVER_MESSAGES.zh
  let text = dict[code] ?? code
  if (vars) for (const key of Object.keys(vars)) text = text.split(`{${key}}`).join(String(vars[key]))
  return text
}

/** 从配置解析消息语言:'en' → en;auto/zh → zh(服务端无法探测浏览器)。 */
function localeOf(config) {
  return config?.locale === 'en' ? 'en' : 'zh'
}

// ── costUsage 会话投影 ─────────────────────────────────────────────────────

const usageProjectionSchema = z.object({
  input: z.number(),
  output: z.number(),
  cacheRead: z.number(),
  cacheWrite: z.number(),
  cost: z.number(),
  byModel: z.record(z.string(), z.object({
    input: z.number(),
    output: z.number(),
    cacheRead: z.number(),
    cacheWrite: z.number(),
    cost: z.number(),
  })),
})

/**
 * costUsage 会话投影工厂:闭包账本,按事件时刻(event.time)用当时的价格档位
 * 逐次计费(峰谷时代前按 legacyBase,之后按峰谷两档),保证会话徽章历史正确。
 */
function makeCostUsageProjection(ledger) {
  const zeroBuckets = () => ({ input: 0, output: 0, cacheRead: 0, cacheWrite: 0, cost: 0 })
  const peakConfig = () => ({
    enabled: ledger.config?.peakEnabled === true,
    effectiveAtMs: Date.parse(ledger.config?.peakEffectiveAt ?? ''),
    windows: ledger.config?.peakWindows,
  })
  return {
    key: 'costUsage',
    schema: usageProjectionSchema,
    stateVersion: 2,
    init: () => ({ model: 'default', totals: zeroBuckets(), byModel: {}, last: null }),
    apply(state, event) {
      if (event.type === 'request/header') {
        const model = event.data?.header?.config?.model
        const next = typeof model === 'string' && model.length > 0 ? model : 'default'
        return next === state.model ? state : { ...state, model: next }
      }
      let usage = null
      let turn = 0
      let step = 0
      if (event.type === 'assistant/chunk' && event.data?.chunk?.type === 'usage' && event.data.chunk.usage !== undefined) {
        usage = event.data.chunk.usage
        turn = event.data.turn
        step = event.data.step
      } else if (event.type === 'assistant/message' && event.data?.usage !== undefined) {
        usage = event.data.usage
        turn = event.data.turn
        step = event.data.step
      } else {
        return state
      }
      const buckets = {
        input: usage.inputTokens ?? 0,
        output: usage.outputTokens ?? 0,
        cacheRead: usage.cacheReadTokens ?? 0,
        cacheWrite: usage.cacheWriteTokens ?? 0,
      }
      const key = `${turn}:${step}`
      const prev = state.last !== null && state.last.key === key ? state.last : null
      if (prev !== null && prev.model === state.model
        && prev.buckets.input === buckets.input && prev.buckets.output === buckets.output
        && prev.buckets.cacheRead === buckets.cacheRead && prev.buckets.cacheWrite === buckets.cacheWrite) {
        return state
      }
      // 按事件时刻计费(历史正确):峰谷时代前用 legacyBase,之后按峰谷两档。
      const atMs = Number.isFinite(Number(event.time)) && Number(event.time) > 0 ? Number(event.time) : Date.now()
      const billed = costOf(buckets, priceEntryFor(state.model, ledger.config?.prices), atMs, peakConfig())
      // 同一 (turn, step) 的最终样本替换流式样本,先减后加,避免重复计数。
      const totals = { ...state.totals }
      const byModel = { ...state.byModel }
      const shift = (model, bucket, cost, sign) => {
        totals.input += sign * bucket.input
        totals.output += sign * bucket.output
        totals.cacheRead += sign * bucket.cacheRead
        totals.cacheWrite += sign * bucket.cacheWrite
        totals.cost += sign * cost
        const current = byModel[model] ?? zeroBuckets()
        byModel[model] = {
          input: current.input + sign * bucket.input,
          output: current.output + sign * bucket.output,
          cacheRead: current.cacheRead + sign * bucket.cacheRead,
          cacheWrite: current.cacheWrite + sign * bucket.cacheWrite,
          cost: current.cost + sign * cost,
        }
      }
      if (prev !== null) shift(prev.model, prev.buckets, prev.cost, -1)
      shift(state.model, buckets, billed, 1)
      return { model: state.model, totals, byModel, last: { key, model: state.model, buckets, cost: billed } }
    },
    view(state) {
      return {
        input: state.totals.input,
        output: state.totals.output,
        cacheRead: state.totals.cacheRead,
        cacheWrite: state.totals.cacheWrite,
        cost: state.totals.cost,
        byModel: state.byModel,
      }
    },
  }
}

// ── OpenCode Go 订阅额度 ─────────────────────────────────────────────────

/** OpenCode Go 订阅额度端点(官方固定域名)。 */
const GO_QUOTA_URL = 'https://opencode.ai/zen/go/v1/usage'

/** DeepSeek 官方在 dsh 模型目录中的 provider id(dsh-llm-deepseek 的路由名)。内置自动查询用。 */
const BUILTIN_DEEPSEEK_ID = 'deepseek-official'

/** OpenCode Go 额度占位(未启用/未配置或查询失败时的空值)。 */
function emptyGoQuota() {
  return { rolling: null, weekly: null, monthly: null }
}

/** 从 opencode auth.json 自动发现 opencode-go 的 API Key(与 opencode CLI 共用登录态)。 */
function findGoKeyInAuthJson() {
  const home = process.env.USERPROFILE || process.env.HOME || ''
  const candidates = [
    home ? `${home}/.local/share/opencode/auth.json` : '',
    process.env.XDG_CONFIG_HOME ? `${process.env.XDG_CONFIG_HOME}/opencode/auth.json` : '',
    home ? `${home}/.config/opencode/auth.json` : '',
  ].filter(Boolean)
  for (const path of candidates) {
    try {
      const data = JSON.parse(fs.readFileSync(path, 'utf8'))
      const key = data?.['opencode-go']?.key
      if (typeof key === 'string' && key.length > 0) return key
    } catch {
      // 文件不存在或不可读:继续尝试下一个位置。
    }
  }
  return null
}

/**
 * 解析 OpenCode Go API Key:显式配置 → DSH 凭据库(OPENCODE_GO_API_KEY)
 * → 环境变量 OPENCODE_GO_API_KEY → 兼容旧名环境变量 OPENCODE_API_KEY
 * → opencode auth.json 兜底。
 * @param ctx - 宿主插件上下文(用于读取凭证服务)。
 * @param config - 提供方配置(apiKey)。
 */
async function resolveGoKey(ctx, provider) {
  const explicit = String(provider?.apiKey ?? '').trim()
  if (explicit.length > 0) return explicit
  const credentials = ctx.get('credentials')
  if (credentials !== undefined) {
    try {
      const hit = await credentials.resolve(credentialRef('OPENCODE_GO_API_KEY'))
      if (typeof hit?.value === 'string' && hit.value.length > 0) return hit.value
    } catch {
      // 凭证解析失败时回退到环境变量。
    }
  }
  for (const name of ['OPENCODE_GO_API_KEY', 'OPENCODE_API_KEY']) {
    const value = String(process.env[name] ?? '').trim()
    if (value.length > 0) return value
  }
  return findGoKeyInAuthJson()
}

/** 归一化单个额度窗口(percent + resetsAt);非法值返回 null。 */
function normalizeGoWindow(raw) {
  if (raw === null || typeof raw !== 'object') return null
  const percent = Number(raw.percent)
  if (!Number.isFinite(percent)) return null
  return { percent, resetsAt: typeof raw.resetsAt === 'string' ? raw.resetsAt : '' }
}

/**
 * 查询 OpenCode Go 订阅额度(GET {GO_QUOTA_URL})。
 * 返回 rolling(滚动 5 小时)/ weekly(本周)/ monthly(本月) 三档用量百分比与重置时间。
 * 凭证只发往官方域名 opencode.ai;Key 解析顺序见 resolveGoKey。
 * 请求需携带浏览器 User-Agent,否则会被 opencode.ai 前置 Cloudflare 拦截(error 1010)。
 * @param ctx - 宿主插件上下文(用于解析 DSH 凭据库中的 Key)。
 * @param provider - 提供方配置(apiKey)。
 * @param locale - 消息语言(zh/en)。
 */
async function queryGoQuota(ctx, provider, locale) {
  const key = await resolveGoKey(ctx, provider)
  if (key === null) {
    const error = new Error(tmsg(locale, 'goQuotaKeyMissing'))
    error.soft = true // 未登录/未配置 Key 属预期场景,面板以中性提示展示
    throw error
  }
  const response = await fetch(GO_QUOTA_URL, {
    headers: {
      authorization: `Bearer ${key}`,
      // 浏览器 UA:避免被 opencode.ai 前置 Cloudflare 以 error 1010 拦截。
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
    },
    signal: AbortSignal.timeout(15000),
  })
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      const error = new Error(tmsg(locale, 'goQuotaNoSub', { code: String(response.status) }))
      error.soft = true // 无订阅/Key 无效属预期场景,面板以中性提示展示
      throw error
    }
    throw new Error(tmsg(locale, 'goQuotaHttp', { code: String(response.status) }))
  }
  const data = await response.json()
  const usage = data?.usage
  if (usage === null || typeof usage !== 'object') throw new Error(tmsg(locale, 'goQuotaNoUsage'))
  return {
    rolling: normalizeGoWindow(usage.rolling),
    weekly: normalizeGoWindow(usage.weekly),
    monthly: normalizeGoWindow(usage.monthly),
  }
}

// ── DeepSeek 官方余额 ─────────────────────────────────────────────────────

/** 官方余额端点:仅允许官方域名(api.deepseek.com),防止 API Key 被发往非官方端点;非法端点返回 null。 */
function balanceEndpoint(baseURL) {
  let base = String(baseURL ?? '').trim().replace(/\/+$/, '')
  if (base.length === 0) base = String(process.env.DEEPSEEK_BASE_URL ?? '').trim().replace(/\/+$/, '')
  if (base.length === 0) base = 'https://api.deepseek.com'
  if (/\/v\d+$/i.test(base)) base = base.replace(/\/v\d+$/i, '')
  let host = ''
  try { host = new URL(base).host.toLowerCase() } catch { return null }
  if (host !== 'api.deepseek.com') return null
  return `${base}/user/balance`
}

/**
 * 调用官方开放平台余额接口(GET {base}/user/balance)。
 * 凭证与端点均取自 llm-deepseek 的设置段与凭证服务,与模型请求同一把 Key。
 * @param ctx - 宿主插件上下文。
 * @param locale - 消息语言(zh/en)。
 * @returns { currency, totalBalance, grantedBalance, toppedUpBalance }。
 */
async function queryBalance(ctx, locale) {
  const settings = ctx.get('settings')
  const section = typeof settings?.get === 'function' ? settings.get('llm-deepseek') : undefined
  const baseURL = section?.baseURL
  const apiKeyEnv = typeof section?.apiKeyEnv === 'string' && section.apiKeyEnv.length > 0
    ? section.apiKeyEnv
    : 'DEEPSEEK_API_KEY'
  let apiKey = null
  const credentials = ctx.get('credentials')
  if (credentials !== undefined) {
    try {
      const hit = await credentials.resolve(credentialRef(apiKeyEnv))
      if (hit?.value !== undefined && hit.value.length > 0) apiKey = hit.value
    } catch {
      // 凭证解析失败时回退到环境变量。
    }
  }
  if (apiKey === null && typeof process.env[apiKeyEnv] === 'string') apiKey = process.env[apiKeyEnv]
  if (apiKey === null || apiKey.length === 0) {
    throw new Error(tmsg(locale, 'apiKeyMissing', { env: apiKeyEnv }))
  }
  const endpoint = balanceEndpoint(baseURL)
  if (endpoint === null) {
    throw new Error(tmsg(locale, 'balanceEndpointNotOfficial', { url: String(baseURL ?? '') }))
  }
  const response = await fetch(endpoint, {
    headers: { authorization: `Bearer ${apiKey}` },
    signal: AbortSignal.timeout(15000),
  })
  if (!response.ok) throw new Error(tmsg(locale, 'balanceHttp', { code: String(response.status) }))
  const data = await response.json()
  const info = Array.isArray(data?.balance_infos) ? data.balance_infos[0] : undefined
  if (info === undefined) throw new Error(tmsg(locale, 'balanceNoInfos'))
  const num = value => {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return {
    currency: typeof info.currency === 'string' ? info.currency : '',
    totalBalance: num(info.total_balance),
    grantedBalance: num(info.granted_balance),
    toppedUpBalance: num(info.topped_up_balance),
  }
}

// ── 自定义 HTTP 用量查询 ─────────────────────────────────────────────────

/** 按点路径提取 JSON 值(如 'usage.weekly.percent');不可达返回 undefined。 */
export function jsonByPath(obj, path) {
  if (typeof path !== 'string' || path.length === 0) return undefined
  let cur = obj
  for (const seg of path.split('.')) {
    if (cur === null || typeof cur !== 'object') return undefined
    cur = cur[seg]
  }
  return cur
}

/** 有限数字归一化;非法返回 undefined。 */
function finiteNumber(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n : undefined
}

/**
 * 查询自定义 HTTP 用量接口(GET)。
 * 条目按 items[].path 逐条提取;maxPath 为 number 常量或 JSON 路径,
 * 存在时计算 percent = value/max×100;resetsAtPath 提取重置时间。
 * headers 中 {apiKey} 占位符用提供方配置的 apiKey 替换。
 * @param ctx - 宿主插件上下文(未使用,保留签名一致性)。
 * @param provider - 提供方配置(preset=custom)。
 * @param locale - 消息语言(zh/en)。
 */
async function queryCustom(ctx, provider, locale) {
  const custom = provider?.custom
  if (custom === null || typeof custom !== 'object' || typeof custom.url !== 'string' || custom.url.length === 0) {
    throw new Error(tmsg(locale, 'customUrlMissing'))
  }
  const headers = {}
  for (const [key, value] of Object.entries(custom.headers ?? {})) {
    headers[key] = typeof value === 'string' ? value.split('{apiKey}').join(String(provider.apiKey ?? '')) : String(value ?? '')
  }
  const response = await fetch(custom.url, {
    method: 'GET',
    headers,
    signal: AbortSignal.timeout(15000),
  })
  if (!response.ok) throw new Error(tmsg(locale, 'customHttp', { code: String(response.status) }))
  const data = await response.json()
  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error(tmsg(locale, 'customNoUsage'))
  }
  const items = []
  const list = Array.isArray(custom.items) ? custom.items : []
  for (const item of list) {
    const value = finiteNumber(jsonByPath(data, item?.path))
    if (value === undefined) continue // 该窗口/条目缺失:跳过而非整体失败
    let max
    if (typeof item?.maxPath === 'number') max = item.maxPath
    else if (typeof item?.maxPath === 'string' && item.maxPath.length > 0) max = finiteNumber(jsonByPath(data, item.maxPath))
    let percent
    if (max !== undefined && Number.isFinite(max) && max > 0) percent = (value / max) * 100
    else if (item?.kind === 'percent') percent = value
    const resetsRaw = typeof item?.resetsAtPath === 'string' && item.resetsAtPath.length > 0
      ? jsonByPath(data, item.resetsAtPath)
      : undefined
    items.push({
      key: String(item?.key ?? `item${items.length}`),
      label: String(item?.label ?? item?.key ?? ''),
      kind: ['percent', 'number', 'money', 'text'].includes(item?.kind) ? item.kind : 'number',
      value,
      ...(max !== undefined ? { max } : {}),
      ...(percent !== undefined ? { percent } : {}),
      resetsAt: typeof resetsRaw === 'string' ? resetsRaw : null,
    })
  }
  return { items }
}

// ── 服务 ───────────────────────────────────────────────────────────────────

/** 组装对客户端的提供方用量快照。 */
function buildProviderUsage(providerId, provider, value, status, message, fetchedAt) {
  return {
    provider: providerId,
    preset: provider?.preset ?? 'custom',
    status,
    fetchedAt,
    message,
    items: value?.items ?? [],
  }
}

/** 空用量(未配置/停用/查询失败降级)。 */
function emptyUsage(providerId, provider, status, message) {
  return buildProviderUsage(providerId, provider, { items: [] }, status, message, Date.now())
}

/**
 * 创建 monitor 服务对象。手写 `typertRemote` 绑定(service/serviceKey/namespace)
 * 满足 Typert 网关的 validateBinding 校验;方法按清单参数顺序位置调用。
 * @param ctx - 宿主插件上下文。
 * @param ledger - 账本。
 * @returns 服务对象。
 */
function createService(ctx, ledger) {
  // 每提供方独立的进程内用量缓存:按 refreshMinutes 过期;失败落 error/off 状态。
  const usageCaches = new Map()

  const providerOf = providerId => {
    const providers = ledger.config?.providers
    if (providers === null || typeof providers !== 'object') return undefined
    return providers[providerId]
  }

  /** 按需抓取并缓存某提供方用量(过期或 force);未配置/停用/失败均落空或 error/off 状态。 */
  const ensureUsage = async (providerId, force = false) => {
    const providerIdStr = String(providerId ?? '')
    const locale = localeOf(ledger.config)
    let provider = providerOf(providerIdStr)
    // DeepSeek 官方内置:无需配置 provider,自动用 设置→模型 的 Key 查 /user/balance。
    if (provider === undefined && providerIdStr === BUILTIN_DEEPSEEK_ID) {
      provider = { enabled: true, preset: 'deepseek', refreshMinutes: 5, apiKey: '' }
    }
    if (provider === undefined) {
      return emptyUsage(providerIdStr, undefined, 'off', tmsg(locale, 'providerNotConfigured'))
    }
    if (provider.enabled === false) {
      return emptyUsage(providerIdStr, provider, 'off', tmsg(locale, 'providerDisabled'))
    }
    const cache = usageCaches.get(providerIdStr)
    const interval = Math.max(1, Number(provider.refreshMinutes) || 15) * 60_000
    if (!force && cache !== undefined && Date.now() - cache.fetchedAt < interval) return cache.value
    if (cache !== undefined && cache.inFlight !== undefined) {
      await cache.inFlight
      return cache.value
    }
    const task = (async () => {
      let value
      if (provider.preset === 'deepseek') {
        const balance = await queryBalance(ctx, locale)
        value = { items: [
          { key: 'balance-total', label: tmsg(locale, 'balanceItemTotal'), kind: 'money', value: balance.totalBalance, resetsAt: null },
          { key: 'balance-granted', label: tmsg(locale, 'balanceItemGranted'), kind: 'money', value: balance.grantedBalance, resetsAt: null },
          { key: 'balance-topped-up', label: tmsg(locale, 'balanceItemToppedUp'), kind: 'money', value: balance.toppedUpBalance, resetsAt: null },
        ] }
      } else if (provider.preset === 'opencode') {
        const quota = await queryGoQuota(ctx, provider, locale)
        const items = []
        const push = (key, window, label) => {
          if (window === null) return
          items.push({ key, label, kind: 'percent', value: window.percent, resetsAt: window.resetsAt })
        }
        push('rolling', quota.rolling, tmsg(locale, 'goRollingLabel'))
        push('weekly', quota.weekly, tmsg(locale, 'goWeeklyLabel'))
        push('monthly', quota.monthly, tmsg(locale, 'goMonthlyLabel'))
        value = { items }
      } else {
        value = await queryCustom(ctx, provider, locale)
      }
      usageCaches.set(providerId, { fetchedAt: Date.now(), value: buildProviderUsage(providerId, provider, value, 'ok', '', Date.now()) })
    })()

    const prev = usageCaches.get(providerId)
    if (prev === undefined) {
      usageCaches.set(providerId, { fetchedAt: 0, value: emptyUsage(providerId, provider, 'off', ''), inFlight: task })
    } else {
      prev.inFlight = task
    }
    try {
      await task
    } catch (error) {
      const soft = error && error.soft === true
      const entry = usageCaches.get(providerId)
      entry.value = buildProviderUsage(
        providerId,
        provider,
        { items: [] },
        soft ? 'off' : 'error',
        error instanceof Error ? error.message : String(error),
        Date.now(),
      )
    } finally {
      const entry = usageCaches.get(providerId)
      if (entry?.inFlight === task) delete entry.inFlight
    }
    return usageCaches.get(providerId).value
  }

  const service = {
    async getProviderUsage(providerId) {
      return ensureUsage(String(providerId ?? ''), false)
    },

    async refreshProvider(providerId) {
      return ensureUsage(String(providerId ?? ''), true)
    },

    async getConfig() {
      return ledger.config
    },

    async updateConfig(patch) {
      const { config, errors } = applyConfigPatch(ledger.config, patch)
      if (errors.length > 0) {
        const locale = patch !== null && typeof patch === 'object' && patch.locale === 'en' ? 'en' : localeOf(ledger.config)
        usageCaches.clear() // 提供方配置可能已变化:清空缓存
        throw new Error(tmsg(locale, 'configRejected', { errors: errors.join(locale === 'zh' ? ';' : '; ') }))
      }
      ledger.config = config
      ledger.scheduleWrite()
      usageCaches.clear() // 配置变化:下一次按新配置抓取
      return ledger.config
    },

    async fetchPrices() {
      const locale = localeOf(ledger.config)
      try {
        const response = await fetch(OFFICIAL_PRICING_URL, {
          signal: AbortSignal.timeout(20000),
          headers: { 'user-agent': 'dsh-monitor/0.1 (DeepSeek Harness plugin)' },
        })
        if (!response.ok) throw new Error(`HTTP ${String(response.status)}`)
        const html = await response.text()
        if (html.length < 500) throw new Error(tmsg(locale, 'pageTooShort'))
        const parsed = parsePricingHtml(html)
        const models = { ...ledger.config.prices.models }
        for (const [id, raw] of Object.entries(parsed.models)) {
          const entry = normalizePrice(raw)
          if (entry === null) continue
          models[id] = { ...(models[id] ?? {}), ...entry }
        }
        const patch = {
          prices: { ...ledger.config.prices, models },
          priceSource: 'official',
          fetchedAt: new Date().toISOString(),
        }
        if (typeof parsed.effectiveAt === 'string') patch.peakEffectiveAt = parsed.effectiveAt
        else patch.peakEffectiveAt = new Date().toISOString() // 页面已无生效时间:两档方案即时生效
        if (Array.isArray(parsed.peakWindows) && parsed.peakWindows.length > 0) {
          patch.peakWindows = parsed.peakWindows
        }
        const { config, errors } = applyConfigPatch(ledger.config, patch)
        if (errors.length > 0) throw new Error(errors.join(';'))
        ledger.config = config
        ledger.scheduleWrite()
        const ids = Object.keys(parsed.models)
        return {
          ok: true,
          message: tmsg(locale, 'pricesSynced', { ids: ids.join(locale === 'zh' ? '、' : ', ') }),
          config: ledger.config,
        }
      } catch (error) {
        const detail = error?.code === 'ERR_NO_MODELS'
          ? tmsg(locale, 'noModelsParsed')
          : (error instanceof Error ? error.message : String(error))
        return {
          ok: false,
          message: tmsg(locale, 'priceSyncFailed', { error: detail }),
        }
      }
    },
  }
  Object.defineProperty(service, 'typertRemote', {
    configurable: false,
    enumerable: false,
    writable: false,
    value: { service, serviceKey: 'monitor', namespace: 'monitor' },
  })
  return service
}

// ── 插件主体 ───────────────────────────────────────────────────────────────

/**
 * 挂载账本、llm/stream 计费包裹、会话投影与 monitor 服务。
 * @param ctx - 宿主插件上下文。
 */
export function apply(ctx) {
  const ledger = Ledger.open()
  console.log(`[dsh-monitor] 已加载,账本:${ledger.path}`)

  // 卸载/退出前最终落盘。
  ctx.effect(() => () => ledger.close(), 'dsh-monitor: ledger close')

  // 包裹 llm/stream:捕获 usage 块(位于 finish 之前),按价格表计入账本。
  // 本插件是链尾监听者,next() 即适配器流;仅透传数据块,不改变流协议。
  ctx.on('llm/stream', (options, next) => {
    const downstream = next()
    return (async function* monitorStream() {
      let usage = null
      try {
        for await (const chunk of downstream) {
          if (chunk !== null && chunk !== undefined && chunk.type === 'usage' && chunk.usage !== undefined) {
            usage = chunk.usage
          }
          yield chunk
        }
      } finally {
        if (usage !== null) {
          try {
            ledger.account({
              input: usage.inputTokens ?? 0,
              output: usage.outputTokens ?? 0,
              cacheRead: usage.cacheReadTokens ?? 0,
              cacheWrite: usage.cacheWriteTokens ?? 0,
            }, options?.model, options?.sessionId, Date.now())
          } catch (error) {
            ctx.logger?.warn?.(`[dsh-monitor] 计费失败: ${String(error)}`)
          }
        }
      }
    })()
  })

  // costUsage 投影:向会话历史页/推送帧提供 token 桶(客户端计价)。
  ctx.inject(['sessionProjections'], (projectionCtx) => {
    projectionCtx.sessionProjections.register(makeCostUsageProjection(ledger))
  })

  // RPC 服务:客户端经 remote.monitor.* 调用(./typert 清单由 typert-loader 注册)。
  ctx.provide('monitor', createService(ctx, ledger))
}

// 供单元测试直接驱动(生产 bundle 无需别处引用)。
export { createService, queryGoQuota, queryBalance, queryCustom }