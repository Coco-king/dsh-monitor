/**
 * dsh-monitor 提供方用量查询:OpenCode Go 订阅额度 / DeepSeek 官方余额 /
 * 自定义 HTTP 用量接口,以及 JSON 点路径提取助手。
 * 凭证只发往官方域名;自定义接口由用户自行配置、自担风险。
 */

import fs from 'node:fs'
import { credentialRef } from '@deepseek-ai/dsh-credentials'
import { tmsg } from './messages.js'

/** OpenCode Go 订阅额度端点(官方固定域名)。 */
const GO_QUOTA_URL = 'https://opencode.ai/zen/go/v1/usage'

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
 * @param provider - 提供方配置(apiKey)。
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
export async function queryGoQuota(ctx, provider, locale) {
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
export async function queryBalance(ctx, locale) {
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
export async function queryCustom(ctx, provider, locale) {
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