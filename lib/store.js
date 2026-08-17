/**
 * 账本存储:每日聚合、会话聚合、配置持久化($DSH_HOME/storages/dsh-monitor/ledger.json)。
 *
 * 移植自 dsh-cost-meter(lib/store.js,MIT),砍掉预算/余额/Go 额度/corner 等
 * 附加配置面,新增 providers(提供方用量查询配置)的校验。
 *
 * 所有金额字段均为美元;币种换算只发生在展示层。写入采用临时文件 +
 * 原子重命名,并做防抖;账本按 config.historyDays 保留最近 N 天。
 */

import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { resolveDshHome } from '@deepseek-ai/dsh-home-paths'
import {
  DEFAULT_PEAK_EFFECTIVE_AT,
  DEFAULT_PEAK_WINDOWS,
  DEFAULT_PRICE_TABLE,
  costOf,
  normalizePrice,
  priceEntryFor,
} from './pricing.js'

const LEDGER_VERSION = 1
const MAX_SESSIONS_PER_DAY = 200
const DEFAULT_HISTORY_DAYS = 180

/** 默认配置(首次启动;之后持久化副本优先)。 */
export function defaultConfig() {
  return {
    locale: 'auto', // 界面语言:auto(跟随浏览器) | zh(中文) | en(English)
    currency: 'CNY', // CNY | USD | EUR | custom
    symbol: '¥',
    decimals: 4,
    exchangeRate: 7.2, // 展示层:美元 → 币种汇率
    peakEnabled: true, // 启用峰谷计价
    peakEffectiveAt: DEFAULT_PEAK_EFFECTIVE_AT,
    peakWindows: DEFAULT_PEAK_WINDOWS.map(w => ({ ...w })),
    prices: {
      models: Object.fromEntries(
        Object.entries(DEFAULT_PRICE_TABLE.models).map(([id, entry]) => [id, { ...entry }]),
      ),
      default: { ...DEFAULT_PRICE_TABLE.default },
    },
    providers: {}, // providerId → ProviderConfig(见 index.js 的获取逻辑与校验)
    historyDays: DEFAULT_HISTORY_DAYS,
    fetchedAt: null, // 最近一次官方价格同步时间(ISO)
    priceSource: 'bundled', // bundled | official
  }
}

const CONFIG_KEYS = Object.keys(defaultConfig())

/** 本地日期键(宿主机时区)。 */
export function localDayKey(ms) {
  const d = new Date(ms)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function zeroDay(date) {
  return { date, input: 0, output: 0, cacheRead: 0, cacheWrite: 0, calls: 0, cost: 0, sessions: [] }
}

function zeroSession(id) {
  return { id, input: 0, output: 0, cacheRead: 0, cacheWrite: 0, calls: 0, cost: 0 }
}

/** 深合并两层对象(仅用于配置与价格表补丁)。 */
function mergeDeep(base, patch) {
  if (patch === null || typeof patch !== 'object' || Array.isArray(patch)) return patch === undefined ? base : patch
  const out = { ...base }
  for (const [key, value] of Object.entries(patch)) {
    const current = out[key]
    out[key] = current !== null && typeof current === 'object' && !Array.isArray(current)
      && value !== null && typeof value === 'object' && !Array.isArray(value)
      ? mergeDeep(current, value)
      : value
  }
  return out
}

/**
 * 配置校验错误文案(中/英)。
 */
const VALIDATION_MESSAGES = {
  zh: {
    patchObject: '配置补丁必须是对象',
    unknownKey: '未知配置项 "{key}"',
    currency: 'currency 非法',
    symbol: 'symbol 非法',
    decimals: 'decimals 必须是 0-10 的整数',
    exchangeRate: 'exchangeRate 必须为正数',
    peakEnabled: 'peakEnabled 必须是布尔值',
    peakEffectiveAt: 'peakEffectiveAt 非法',
    peakWindows: 'peakWindows 必须是数组',
    historyDays: 'historyDays 必须是 7-3650 的整数',
    locale: 'locale 必须是 auto / zh / en',
    prices: 'prices 非法',
    pricesModels: 'prices.models 非法',
    modelPrice: '模型 "{id}" 的价格非法',
    pricesDefault: 'prices.default 非法',
    providers: 'providers 非法',
    providerObject: '提供方 "{id}" 的配置非法',
    providerEnabled: 'providers.{id}.enabled 必须是布尔值',
    providerPreset: 'providers.{id}.preset 必须是 deepseek / opencode / custom',
    providerRefresh: 'providers.{id}.refreshMinutes 必须是 1-1440 的整数',
    providerKey: 'providers.{id}.apiKey 必须是字符串',
    providerCustomRequired: 'providers.{id} 为 custom 预设时必须提供 custom 配置',
    customUrl: 'providers.{id}.custom.url 必须是非空字符串',
    customHeaders: 'providers.{id}.custom.headers 必须是字符串到字符串的映射',
    customItems: 'providers.{id}.custom.items 必须是非空数组',
    itemObject: 'providers.{id}.custom.items[{i}] 非法',
    itemKey: 'providers.{id}.custom.items[{i}].key 必须是非空字符串',
    itemLabel: 'providers.{id}.custom.items[{i}].label 必须是非空字符串',
    itemKind: 'providers.{id}.custom.items[{i}].kind 必须是 percent / number / money / text',
    itemPath: 'providers.{id}.custom.items[{i}].path 必须是非空字符串',
    itemMaxPath: 'providers.{id}.custom.items[{i}].maxPath 必须是数字/字符串/null',
    itemResetsAtPath: 'providers.{id}.custom.items[{i}].resetsAtPath 必须是字符串/null',
  },
  en: {
    patchObject: 'Config patch must be an object',
    unknownKey: 'Unknown config key "{key}"',
    currency: 'Invalid currency',
    symbol: 'Invalid symbol',
    decimals: 'decimals must be an integer from 0 to 10',
    exchangeRate: 'exchangeRate must be a positive number',
    peakEnabled: 'peakEnabled must be a boolean',
    peakEffectiveAt: 'Invalid peakEffectiveAt',
    peakWindows: 'peakWindows must be an array',
    historyDays: 'historyDays must be an integer from 7 to 3650',
    locale: 'locale must be auto / zh / en',
    prices: 'Invalid prices',
    pricesModels: 'Invalid prices.models',
    modelPrice: 'Invalid price for model "{id}"',
    pricesDefault: 'Invalid prices.default',
    providers: 'Invalid providers',
    providerObject: 'Invalid config for provider "{id}"',
    providerEnabled: 'providers.{id}.enabled must be a boolean',
    providerPreset: 'providers.{id}.preset must be deepseek / opencode / custom',
    providerRefresh: 'providers.{id}.refreshMinutes must be an integer from 1 to 1440',
    providerKey: 'providers.{id}.apiKey must be a string',
    providerCustomRequired: 'providers.{id} requires a custom config when preset is custom',
    customUrl: 'providers.{id}.custom.url must be a non-empty string',
    customHeaders: 'providers.{id}.custom.headers must be a string-to-string map',
    customItems: 'providers.{id}.custom.items must be a non-empty array',
    itemObject: 'providers.{id}.custom.items[{i}] is invalid',
    itemKey: 'providers.{id}.custom.items[{i}].key must be a non-empty string',
    itemLabel: 'providers.{id}.custom.items[{i}].label must be a non-empty string',
    itemKind: 'providers.{id}.custom.items[{i}].kind must be percent / number / money / text',
    itemPath: 'providers.{id}.custom.items[{i}].path must be a non-empty string',
    itemMaxPath: 'providers.{id}.custom.items[{i}].maxPath must be a number, string, or null',
    itemResetsAtPath: 'providers.{id}.custom.items[{i}].resetsAtPath must be a string or null',
  },
}

/** 取校验文案(zh/en)。 */
function vmsg(locale, code, vars) {
  const dict = locale === 'en' ? VALIDATION_MESSAGES.en : VALIDATION_MESSAGES.zh
  let text = dict[code] ?? code
  if (vars) for (const key of Object.keys(vars)) text = text.split(`{${key}}`).join(String(vars[key]))
  return text
}

/** 校验文案语言:补丁内显式指定优先,否则沿用当前配置。 */
function patchLocale(current, patch) {
  if (patch !== null && typeof patch === 'object' && (patch.locale === 'zh' || patch.locale === 'en')) return patch.locale
  return current?.locale === 'en' ? 'en' : 'zh'
}

/** 校验一个 custom 预设的 items 数组,错误写入 errors。 */
function validateCustomItems(providerId, items, locale, errors) {
  if (!Array.isArray(items) || items.length === 0) {
    errors.push(vmsg(locale, 'customItems', { id: providerId }))
    return
  }
  const kinds = ['percent', 'number', 'money', 'text']
  for (let i = 0; i < items.length; i += 1) {
    const item = items[i]
    const good = item !== null && typeof item === 'object' && !Array.isArray(item)
    if (!good) {
      errors.push(vmsg(locale, 'itemObject', { id: providerId, i }))
      continue
    }
    if (typeof item.key !== 'string' || item.key.length === 0) errors.push(vmsg(locale, 'itemKey', { id: providerId, i }))
    if (typeof item.label !== 'string' || item.label.length === 0) errors.push(vmsg(locale, 'itemLabel', { id: providerId, i }))
    if (!kinds.includes(item.kind)) errors.push(vmsg(locale, 'itemKind', { id: providerId, i }))
    if (typeof item.path !== 'string' || item.path.length === 0) errors.push(vmsg(locale, 'itemPath', { id: providerId, i }))
    const max = item.maxPath
    if (max !== null && typeof max !== 'string' && typeof max !== 'number') errors.push(vmsg(locale, 'itemMaxPath', { id: providerId, i }))
    const resets = item.resetsAtPath
    if (resets !== null && resets !== undefined && typeof resets !== 'string') errors.push(vmsg(locale, 'itemResetsAtPath', { id: providerId, i }))
    else if (resets === undefined) item.resetsAtPath = null
  }
}

/**
 * 校验并应用一份配置补丁,返回 { config, errors }。
 * 未知键、非法值都会报错且整体不落盘;合法补丁深合并后持久化。
 * @param current - 当前配置。
 * @param patch - 客户端提交的补丁(JSON)。
 */
export function applyConfigPatch(current, patch) {
  const locale = patchLocale(current, patch)
  if (patch === null || typeof patch !== 'object' || Array.isArray(patch)) {
    return { config: current, errors: [vmsg(locale, 'patchObject')] }
  }
  const errors = []
  for (const key of Object.keys(patch)) {
    if (!CONFIG_KEYS.includes(key)) errors.push(vmsg(locale, 'unknownKey', { key }))
  }
  if (errors.length > 0) return { config: current, errors }
  const candidate = mergeDeep(current, patch)
  // prices.models 与 providers 是可编辑列表/记录:客户端提交完整结构时必须按
  // 替换语义处理,否则 mergeDeep 会把已删除的旧条目重新合并回来。
  if (patch.prices !== null && typeof patch.prices === 'object' && !Array.isArray(patch.prices)
    && patch.prices.models !== null && typeof patch.prices.models === 'object' && !Array.isArray(patch.prices.models)) {
    candidate.prices.models = patch.prices.models
  }
  if (patch.providers !== null && typeof patch.providers === 'object' && !Array.isArray(patch.providers)) {
    candidate.providers = {}
    for (const [id, raw] of Object.entries(patch.providers)) {
      if (raw !== null && typeof raw === 'object' && !Array.isArray(raw)) candidate.providers[id] = { ...raw }
      else candidate.providers[id] = raw
    }
  }
  // 逐项校验。
  if (!['auto', 'zh', 'en'].includes(candidate.locale)) errors.push(vmsg(locale, 'locale'))
  if (typeof candidate.currency !== 'string' || candidate.currency.length === 0) errors.push(vmsg(locale, 'currency'))
  if (typeof candidate.symbol !== 'string') errors.push(vmsg(locale, 'symbol'))
  const decimals = Number(candidate.decimals)
  if (!Number.isInteger(decimals) || decimals < 0 || decimals > 10) errors.push(vmsg(locale, 'decimals'))
  const rate = Number(candidate.exchangeRate)
  if (!Number.isFinite(rate) || rate <= 0) errors.push(vmsg(locale, 'exchangeRate'))
  if (typeof candidate.peakEnabled !== 'boolean') errors.push(vmsg(locale, 'peakEnabled'))
  if (typeof candidate.peakEffectiveAt !== 'string') errors.push(vmsg(locale, 'peakEffectiveAt'))
  if (!Array.isArray(candidate.peakWindows)) errors.push(vmsg(locale, 'peakWindows'))
  const historyDays = Number(candidate.historyDays)
  if (!Number.isInteger(historyDays) || historyDays < 7 || historyDays > 3650) errors.push(vmsg(locale, 'historyDays'))
  // 价格表规范化。
  const prices = candidate.prices
  if (prices === null || typeof prices !== 'object') {
    errors.push(vmsg(locale, 'prices'))
  } else {
    if (prices.models === null || typeof prices.models !== 'object' || Array.isArray(prices.models)) {
      errors.push(vmsg(locale, 'pricesModels'))
    } else {
      for (const [id, raw] of Object.entries(prices.models)) {
        const entry = normalizePrice(raw)
        if (entry === null) errors.push(vmsg(locale, 'modelPrice', { id }))
        else prices.models[id] = entry
      }
    }
    const def = normalizePrice(prices.default)
    if (def === null) errors.push(vmsg(locale, 'pricesDefault'))
    else prices.default = def
  }
  // 提供方用量查询配置校验。
  const providers = candidate.providers
  if (providers === null || typeof providers !== 'object' || Array.isArray(providers)) {
    errors.push(vmsg(locale, 'providers'))
  } else {
    for (const [id, provider] of Object.entries(providers)) {
      if (provider === null || typeof provider !== 'object' || Array.isArray(provider)) {
        errors.push(vmsg(locale, 'providerObject', { id }))
        continue
      }
      if (typeof provider.enabled !== 'boolean') {
        provider.enabled = true // 旧数据/前端缺省:默认启用
      }
      if (!['deepseek', 'opencode', 'custom'].includes(provider.preset)) {
        errors.push(vmsg(locale, 'providerPreset', { id }))
      }
      const refresh = Number(provider.refreshMinutes)
      if (!Number.isInteger(refresh) || refresh < 1 || refresh > 1440) errors.push(vmsg(locale, 'providerRefresh', { id }))
      else provider.refreshMinutes = refresh
      if (typeof provider.apiKey !== 'string') provider.apiKey = String(provider.apiKey ?? '')
      if (provider.preset === 'custom') {
        const custom = provider.custom
        if (custom === null || typeof custom !== 'object' || Array.isArray(custom)) {
          errors.push(vmsg(locale, 'providerCustomRequired', { id }))
        } else {
          if (typeof custom.url !== 'string' || custom.url.length === 0) errors.push(vmsg(locale, 'customUrl', { id }))
          const headers = custom.headers
          if (headers === null || typeof headers !== 'object' || Array.isArray(headers)
            || Object.values(headers).some(v => typeof v !== 'string')) {
            errors.push(vmsg(locale, 'customHeaders', { id }))
          }
          validateCustomItems(id, custom.items, locale, errors)
        }
      }
    }
  }
  if (errors.length > 0) return { config: current, errors }
  return { config: candidate, errors: [] }
}

/**
 * 账本状态容器。所有聚合写内存,持久化走防抖原子写。
 */
export class Ledger {
  /**
   * @param config - 初始配置(默认值或已持久化配置)。
   * @param days - 已持久化的每日记录对象(date → day)。
   * @param path - 账本文件路径。
   */
  constructor(config, days, path) {
    this.config = config
    this.days = days
    this.path = path
    this.writeTimer = null
    this.closed = false
    this.pendingWrite = false
  }

  /** 在 $DSH_HOME 下创建/加载账本。 */
  static open() {
    const root = join(resolveDshHome(), 'storages', 'dsh-monitor')
    const path = join(root, 'ledger.json')
    let config = defaultConfig()
    let days = {}
    try {
      const parsed = JSON.parse(readFileSync(path, 'utf8'))
      if (parsed !== null && typeof parsed === 'object') {
        if (parsed.version !== LEDGER_VERSION) {
          console.warn(`[dsh-monitor] 账本版本 ${String(parsed.version)} 不受支持,按空账本启动`)
        } else {
          const cfg = typeof parsed.config === 'object' && parsed.config !== null ? parsed.config : {}
          // 新版本新增的配置键用默认值补齐。
          config = mergeDeep(defaultConfig(), cfg)
          if (parsed.days !== null && typeof parsed.days === 'object' && !Array.isArray(parsed.days)) {
            days = parsed.days
          }
        }
      }
    } catch (error) {
      if (error?.code !== 'ENOENT') {
        console.warn(`[dsh-monitor] 账本读取失败,按空账本启动: ${String(error?.message ?? error)}`)
      }
    }
    return new Ledger(config, days, path)
  }

  /**
   * 记入一次模型调用的用量。
   * @param tokens - { input, output, cacheRead, cacheWrite }。
   * @param modelId - 请求模型 id。
   * @param sessionId - 会话 id(可能缺失,例如无会话的辅助调用)。
   * @param atMs - 计费时刻(epoch ms)。
   */
  account(tokens, modelId, sessionId, atMs) {
    if (this.closed) return
    const entry = priceEntryFor(modelId, this.config.prices)
    const peak = {
      enabled: this.config.peakEnabled === true,
      effectiveAtMs: Date.parse(this.config.peakEffectiveAt),
      windows: this.config.peakWindows,
    }
    const cost = costOf(tokens, entry, atMs, peak)
    // 归一化各桶 token 数:非有限/负数一律按 0 处理,防止污染账本聚合。
    const num = value => {
      const n = Number(value)
      return Number.isFinite(n) && n > 0 ? n : 0
    }
    const buckets = {
      input: num(tokens?.input),
      output: num(tokens?.output),
      cacheRead: num(tokens?.cacheRead),
      cacheWrite: num(tokens?.cacheWrite),
    }
    const date = localDayKey(atMs)
    let day = this.days[date]
    if (day === undefined || day === null || typeof day !== 'object') {
      day = zeroDay(date)
      this.days[date] = day
    }
    day.input += buckets.input
    day.output += buckets.output
    day.cacheRead += buckets.cacheRead
    day.cacheWrite += buckets.cacheWrite
    day.calls += 1
    day.cost += cost
    if (typeof sessionId === 'string' && sessionId.length > 0) {
      let sessions = Array.isArray(day.sessions) ? day.sessions : []
      let session = sessions.find(s => s.id === sessionId)
      if (session === undefined) {
        session = zeroSession(sessionId)
        sessions.push(session)
        if (sessions.length > MAX_SESSIONS_PER_DAY) sessions = sessions.slice(-MAX_SESSIONS_PER_DAY)
        day.sessions = sessions
      }
      session.input += buckets.input
      session.output += buckets.output
      session.cacheRead += buckets.cacheRead
      session.cacheWrite += buckets.cacheWrite
      session.calls += 1
      session.cost += cost
    }
    this.prune()
    this.scheduleWrite()
  }

  /** 清理超出保留天数的记录。 */
  prune() {
    const keep = Math.max(7, Math.min(3650, Number(this.config.historyDays) || DEFAULT_HISTORY_DAYS))
    const keys = Object.keys(this.days).sort()
    while (keys.length > keep) delete this.days[keys.shift()]
  }

  scheduleWrite() {
    this.pendingWrite = true
    if (this.writeTimer !== null) return
    this.writeTimer = setTimeout(() => {
      this.writeTimer = null
      this.flush()
    }, 2000)
  }

  /** 立即落盘(原子写)。 */
  flush() {
    if (!this.pendingWrite || this.closed) return
    this.pendingWrite = false
    try {
      mkdirSync(dirname(this.path), { recursive: true })
      const tmp = `${this.path}.tmp`
      writeFileSync(tmp, JSON.stringify({ version: LEDGER_VERSION, config: this.config, days: this.days }), 'utf8')
      renameSync(tmp, this.path)
    } catch (error) {
      console.warn(`[dsh-monitor] 账本写入失败: ${String(error?.message ?? error)}`)
    }
  }

  /** 停止后续写入并最终落盘(插件卸载/进程退出)。 */
  close() {
    this.closed = true
    if (this.writeTimer !== null) {
      clearTimeout(this.writeTimer)
      this.writeTimer = null
    }
    this.flush()
  }

  /** 聚合某前缀(如 '2026-08')的全部天。 */
  sumDays(prefix) {
    const total = zeroDay(prefix === undefined ? 'total' : prefix)
    for (const [date, day] of Object.entries(this.days)) {
      if (prefix !== undefined && !date.startsWith(prefix)) continue
      total.input += day.input ?? 0
      total.output += day.output ?? 0
      total.cacheRead += day.cacheRead ?? 0
      total.cacheWrite += day.cacheWrite ?? 0
      total.calls += day.calls ?? 0
      total.cost += day.cost ?? 0
    }
    total.date = prefix === undefined ? 'total' : prefix
    return total
  }

  /**
   * 聚合自定义日期区间 [startKey, endKey](含两端,YYYY-MM-DD 字典序)。
   * @param startKey - 起始日期键。
   * @param endKey - 结束日期键。
   * @returns 区间聚合(仅数字字段,date 为区间键)。
   */
  sumRange(startKey, endKey) {
    const total = zeroDay(`${startKey}..${endKey}`)
    if (typeof startKey !== 'string' || typeof endKey !== 'string') return total
    for (const [date, day] of Object.entries(this.days)) {
      if (date < startKey || date > endKey) continue
      total.input += day.input ?? 0
      total.output += day.output ?? 0
      total.cacheRead += day.cacheRead ?? 0
      total.cacheWrite += day.cacheWrite ?? 0
      total.calls += day.calls ?? 0
      total.cost += day.cost ?? 0
    }
    return total
  }

  /** 今日记录(可能为空)。 */
  today() {
    const date = localDayKey(Date.now())
    const day = this.days[date]
    return day === undefined ? zeroDay(date) : this.copyDay(day)
  }

  /** 历史列表(降序,轻量副本,不含会话明细)。 */
  history(limit = 60) {
    return Object.keys(this.days)
      .sort()
      .reverse()
      .slice(0, limit)
      .map(date => this.copyDay(this.days[date], true))
  }

  copyDay(day, withoutSessions = false) {
    const sessions = withoutSessions || !Array.isArray(day.sessions)
      ? []
      : day.sessions.slice().sort((a, b) => b.cost - a.cost).map(s => ({ ...s }))
    return {
      date: String(day.date),
      input: day.input ?? 0,
      output: day.output ?? 0,
      cacheRead: day.cacheRead ?? 0,
      cacheWrite: day.cacheWrite ?? 0,
      calls: day.calls ?? 0,
      cost: day.cost ?? 0,
      sessions,
    }
  }
}