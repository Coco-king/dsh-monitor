/**
 * dsh-monitor 账本:SQLite 用量账本(token_usage / sweep_progress / ledger_meta)
 * + JSON 配置持久化(ledger.json)。
 *
 * 架构:事实源是 DSH 会话日志(sessionPersistence 读出),本模块的 SQLite 只是
 * 可丢弃的投影——schema 版本不匹配即 DROP 重建,reindex 从日志回填。收益:
 * 历史可回填、插件停摆不丢、replacement 语义精确(delete+insert 整会话重写,
 * 不做「先减再加」的全局计数器,杜绝累计误差)。
 *
 * 折叠本身是纯函数(lib/fold.js);本模块只负责落盘(SQLite)+ 查询聚合
 * (usageSummary),以及配置持久化(JSON,沿用既有校验/迁移/防抖原子写)。
 */

import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { resolveDshHome } from '@deepseek-ai/dsh-home-paths'
import {
  DEFAULT_PEAK_EFFECTIVE_AT,
  DEFAULT_PEAK_WINDOWS,
  DEFAULT_PRICE_TABLE,
  DEFAULT_PRICE_TABLE_CNY,
  activeCurrency,
  costOf,
  normalizePrice,
  priceEntryFor,
  priceTableFor,
} from './pricing.js'
import { applyUsageDelta, createUsageState, flattenState } from './fold.js'

const CONFIG_VERSION = 1
const SCHEMA_VERSION = 1
const DEFAULT_HISTORY_DAYS = 180

/** SQLite schema(列带中文注释)。事实=日志,库=投影;版本不匹配 → DROP 重建。 */
const SCHEMA = `
CREATE TABLE IF NOT EXISTS ledger_meta (
  key   TEXT PRIMARY KEY,   -- 键名(如 'schemaVersion')
  value TEXT NOT NULL       -- 值(字符串)
);

CREATE TABLE IF NOT EXISTS token_usage (
  sessionId        TEXT    NOT NULL,   -- 会话 id
  day              TEXT    NOT NULL,   -- 本地日历日 YYYY-MM-DD
  provider         TEXT    NOT NULL,   -- 提供方路由名;未知 = 'unknown'
  model            TEXT    NOT NULL,   -- 模型 id;未知 = 'unknown'
  inputTokens      INTEGER NOT NULL DEFAULT 0,  -- 未命中输入 token
  outputTokens     INTEGER NOT NULL DEFAULT 0,  -- 输出 token
  cacheReadTokens  INTEGER NOT NULL DEFAULT 0,  -- 缓存命中输入 token
  cacheWriteTokens INTEGER NOT NULL DEFAULT 0,  -- 缓存写入 token
  requests         INTEGER NOT NULL DEFAULT 0,  -- 调用次数
  cost             REAL    NOT NULL DEFAULT 0,  -- 折叠时按事件时刻峰谷计费
  currency         TEXT    NOT NULL DEFAULT 'usd', -- 计费币种(该会话最后一次折叠时的生效币种)
  PRIMARY KEY (sessionId, day, provider, model)
) WITHOUT ROWID;

CREATE INDEX IF NOT EXISTS idx_token_usage_day   ON token_usage (day);
CREATE INDEX IF NOT EXISTS idx_token_usage_route ON token_usage (provider, model, day);

CREATE TABLE IF NOT EXISTS sweep_progress (
  sessionId   TEXT PRIMARY KEY,   -- 会话 id
  consumedSeq INTEGER NOT NULL,   -- 已消费到的事件 seq
  logRevision TEXT,               -- 日志修订标识(未变则跳过)
  cursor      TEXT NOT NULL,      -- JSON:折叠状态(lastSample/lastRoute)
  lastUsageAt INTEGER,            -- 最近一次用量事件时刻(ms)
  updatedAt   INTEGER NOT NULL    -- 最近一次写入时刻(ms)
) WITHOUT ROWID;
`

/** 默认配置(首次启动;之后持久化副本优先)。 */
export function defaultConfig() {
  return {
    locale: 'auto', // 界面语言:auto(跟随浏览器) | zh(中文) | en(English)
    decimals: 4,
    peakEnabled: true, // 启用峰谷计价
    peakEffectiveAt: DEFAULT_PEAK_EFFECTIVE_AT,
    peakWindows: DEFAULT_PEAK_WINDOWS.map(w => ({ ...w })),
    prices: {
      usd: {
        models: Object.fromEntries(
          Object.entries(DEFAULT_PRICE_TABLE.models).map(([id, entry]) => [id, { ...entry }]),
        ),
        default: { ...DEFAULT_PRICE_TABLE.default },
      },
      cny: {
        models: Object.fromEntries(
          Object.entries(DEFAULT_PRICE_TABLE_CNY.models).map(([id, entry]) => [id, { ...entry }]),
        ),
        default: { ...DEFAULT_PRICE_TABLE_CNY.default },
      },
    },
    providers: {}, // providerId → ProviderConfig(见 index.js 的获取逻辑与校验)
    historyDays: DEFAULT_HISTORY_DAYS,
    fetchedAt: null, // 最近一次官方价格同步时间(ISO)
    priceSource: 'bundled', // bundled | official
  }
}

const CONFIG_KEYS = Object.keys(defaultConfig())

/** 默认人民币价格表(独立副本,供首次启动与迁移使用)。 */
export function defaultPricesCny() {
  return {
    models: Object.fromEntries(
      Object.entries(DEFAULT_PRICE_TABLE_CNY.models).map(([id, entry]) => [id, { ...entry }]),
    ),
    default: { ...DEFAULT_PRICE_TABLE_CNY.default },
  }
}

/** 本地日期键(宿主机时区)。 */
export function localDayKey(ms) {
  const d = new Date(ms)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
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
    unknownKey: '未知配置项「{key}」',
    decimals: 'decimals 必须是 0-10 的整数',
    peakEnabled: 'peakEnabled 必须是布尔值',
    peakEffectiveAt: 'peakEffectiveAt 非法',
    peakWindows: 'peakWindows 必须是数组',
    historyDays: 'historyDays 必须是 7-3650 的整数',
    locale: 'locale 必须是 auto / zh / en',
    prices: 'prices 非法',
    pricesModels: 'prices.models 非法',
    modelPrice: '模型「{id}」的价格非法',
    pricesDefault: 'prices.default 非法',
    providers: 'providers 非法',
    providerObject: '提供方「{id}」的配置非法',
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
    decimals: 'decimals must be an integer from 0 to 10',
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
  // prices 子表 与 providers 是可编辑列表/记录:客户端提交完整结构时必须按
  // 替换语义处理,否则 mergeDeep 会把已删除的旧条目重新合并回来。
  if (patch.prices !== null && typeof patch.prices === 'object' && !Array.isArray(patch.prices)) {
    for (const key of ['usd', 'cny']) {
      const sub = patch.prices[key]
      if (sub !== null && typeof sub === 'object' && !Array.isArray(sub)) {
        const table = candidate.prices[key]
        if (table !== null && typeof table === 'object') {
          if (sub.models !== null && typeof sub.models === 'object' && !Array.isArray(sub.models)) {
            table.models = sub.models
          }
          if (sub.default !== null && typeof sub.default === 'object' && !Array.isArray(sub.default)) {
            table.default = sub.default
          }
        }
      }
    }
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
  const decimals = Number(candidate.decimals)
  if (!Number.isInteger(decimals) || decimals < 0 || decimals > 10) errors.push(vmsg(locale, 'decimals'))
  if (typeof candidate.peakEnabled !== 'boolean') errors.push(vmsg(locale, 'peakEnabled'))
  if (typeof candidate.peakEffectiveAt !== 'string') errors.push(vmsg(locale, 'peakEffectiveAt'))
  if (!Array.isArray(candidate.peakWindows)) errors.push(vmsg(locale, 'peakWindows'))
  const historyDays = Number(candidate.historyDays)
  if (!Number.isInteger(historyDays) || historyDays < 7 || historyDays > 3650) errors.push(vmsg(locale, 'historyDays'))
  // 价格表规范化(两套子表各自校验)。
  const prices = candidate.prices
  if (prices === null || typeof prices !== 'object') {
    errors.push(vmsg(locale, 'prices'))
  } else {
    for (const key of ['usd', 'cny']) {
      const table = prices[key]
      if (table === null || typeof table !== 'object') {
        errors.push(vmsg(locale, 'pricesModels'))
        continue
      }
      if (table.models === null || typeof table.models !== 'object' || Array.isArray(table.models)) {
        errors.push(vmsg(locale, 'pricesModels'))
      } else {
        for (const [id, raw] of Object.entries(table.models)) {
          const entry = normalizePrice(raw)
          if (entry === null) errors.push(vmsg(locale, 'modelPrice', { id }))
          else table.models[id] = entry
        }
      }
      const def = normalizePrice(table.default)
      if (def === null) errors.push(vmsg(locale, 'pricesDefault'))
      else table.default = def
    }
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

/** 由价格表 + 峰谷配置构造折叠计费函数(按事件时刻档位,币种 = 生效币种)。 */
function makeBiller(config) {
  return ({ buckets, atMs, model }) => {
    const entry = priceEntryFor(model, priceTableFor(config))
    const peak = {
      enabled: config?.peakEnabled === true,
      effectiveAtMs: Date.parse(config?.peakEffectiveAt ?? ''),
      windows: config?.peakWindows,
    }
    return costOf(buckets, entry, atMs, peak)
  }
}

/**
 * SQLite 用量账本 + JSON 配置。
 *
 * 公开方法:
 *  - 配置侧(config / applyConfigPatch / scheduleWrite / flush / close):沿用旧接口,
 *    monitor 服务与旧测试依赖 `ledger.config` 与 `ledger.scheduleWrite`。
 *  - 用量侧(fold / dropSession / resetUsage / usageSummary):SQLite。
 */
export class Ledger {
  #stmt
  #usageSql

  /**
   * @param config - 配置对象(默认值或持久化副本)。
   * @param db - SQLite DatabaseSync 连接。
   * @param configPath - ledger.json 路径。
   * @param dbPath - ledger.sqlite 路径。
   */
  constructor(config, db, configPath, dbPath) {
    this.config = config
    this.db = db
    this.configPath = configPath
    this.dbPath = dbPath
    this.closed = false
    this.pendingWrite = false
    this.writeTimer = null
    this.#stmt = {}
    this.#usageSql = {}
    this.#migrate()
    this.#prepare()
    this.prune()
  }

  /** 在 $DSH_HOME 下创建/打开账本(建库 + 读取并迁移配置)。 */
  static open() {
    const root = join(resolveDshHome(), 'storages', 'dsh-monitor')
    return Ledger.openAt({ root, configPath: join(root, 'ledger.json'), dbPath: join(root, 'ledger.sqlite') })
  }

  /** 显式指定路径打开(测试用)。 */
  static openAt({ root, configPath, dbPath }) {
    const config = Ledger.readConfig(configPath)
    const db = new DatabaseSync(dbPath)
    return new Ledger(config, db, configPath, dbPath)
  }

  /** 读取并迁移配置(纯读取,不写库)。 */
  static readConfig(configPath) {
    let config = defaultConfig()
    try {
      const parsed = JSON.parse(readFileSync(configPath, 'utf8'))
      if (parsed !== null && typeof parsed === 'object') {
        const cfg = typeof parsed.config === 'object' && parsed.config !== null ? parsed.config : {}
        // 迁移:旧版单价格表(顶层 models/default,无 usd/cny)→ 双表结构。
        const rawPrices = cfg.prices
        if (rawPrices !== null && typeof rawPrices === 'object' && !Array.isArray(rawPrices)
          && typeof rawPrices.models === 'object' && rawPrices.models !== null
          && typeof rawPrices.usd !== 'object' && typeof rawPrices.cny !== 'object') {
          cfg.prices = {
            usd: { models: rawPrices.models, default: rawPrices.default },
            cny: defaultPricesCny(),
          }
        }
        // 旧版展示层换算字段已移除:不持久化。
        delete cfg.currency
        delete cfg.symbol
        delete cfg.exchangeRate
        // 新版本新增的配置键用默认值补齐。
        config = mergeDeep(defaultConfig(), cfg)
      }
    } catch (error) {
      if (error?.code !== 'ENOENT') {
        console.warn(`[dsh-monitor] 配置读取失败,按默认配置启动: ${String(error?.message ?? error)}`)
      }
    }
    return config
  }

  #migrate() {
    try {
      this.db.exec('PRAGMA journal_mode = WAL')
      this.db.exec(SCHEMA)
      const found = this.db.prepare("SELECT value FROM ledger_meta WHERE key = 'schemaVersion'").get()
      if (found === undefined) {
        this.db.prepare("INSERT INTO ledger_meta (key, value) VALUES ('schemaVersion', ?)").run(String(SCHEMA_VERSION))
        return
      }
      if (Number(found.value) !== SCHEMA_VERSION) {
        // 投影可丢弃:版本不匹配 → DROP 重建,下次 sweep 从日志回填。
        this.db.exec('DROP TABLE IF EXISTS token_usage; DROP TABLE IF EXISTS sweep_progress;')
        this.db.exec(SCHEMA)
        this.db.prepare("UPDATE ledger_meta SET value = ? WHERE key = 'schemaVersion'").run(String(SCHEMA_VERSION))
      }
    } catch (error) {
      console.warn(`[dsh-monitor] 账本建库失败: ${String(error?.message ?? error)}`)
    }
  }

  #prepare() {
    this.#stmt = {
      getProgress: this.db.prepare('SELECT * FROM sweep_progress WHERE sessionId = ?'),
      allProgress: this.db.prepare('SELECT * FROM sweep_progress ORDER BY sessionId'),
      sessionRows: this.db.prepare('SELECT * FROM token_usage WHERE sessionId = ?'),
      deleteUsage: this.db.prepare('DELETE FROM token_usage WHERE sessionId = ?'),
      insertUsage: this.db.prepare(
        `INSERT INTO token_usage
           (sessionId, day, provider, model, inputTokens, outputTokens, cacheReadTokens, cacheWriteTokens, requests, cost, currency)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ),
      upsertProgress: this.db.prepare(
        `INSERT INTO sweep_progress (sessionId, consumedSeq, logRevision, cursor, lastUsageAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT (sessionId) DO UPDATE SET
           consumedSeq = excluded.consumedSeq,
           logRevision = excluded.logRevision,
           cursor      = excluded.cursor,
           lastUsageAt = excluded.lastUsageAt,
           updatedAt   = excluded.updatedAt`,
      ),
      deleteProgress: this.db.prepare('DELETE FROM sweep_progress WHERE sessionId = ?'),
    }
    this.#usageSql = {
      sums: 'COALESCE(SUM(inputTokens),0) AS input, COALESCE(SUM(outputTokens),0) AS output,'
        + ' COALESCE(SUM(cacheReadTokens),0) AS cacheRead, COALESCE(SUM(cacheWriteTokens),0) AS cacheWrite,'
        + ' COALESCE(SUM(requests),0) AS calls, COALESCE(SUM(cost),0) AS cost',
    }
  }

  #transaction(fn) {
    this.db.exec('BEGIN IMMEDIATE')
    try {
      const result = fn()
      this.db.exec('COMMIT')
      return result
    } catch (error) {
      this.db.exec('ROLLBACK')
      throw error
    }
  }

  /** 某会话的扫描进度,或 undefined。 */
  progressFor(sessionId) {
    const row = this.#stmt.getProgress.get(sessionId)
    if (row === undefined) return undefined
    return {
      sessionId: row.sessionId,
      consumedSeq: Number(row.consumedSeq),
      logRevision: row.logRevision ?? undefined,
      lastUsageAt: row.lastUsageAt === null ? undefined : Number(row.lastUsageAt),
      updatedAt: Number(row.updatedAt),
      lastSample: this.#cursorPart(row.cursor, 'lastSample'),
      lastRoute: this.#cursorPart(row.cursor, 'lastRoute'),
    }
  }

  #cursorPart(cursor, key) {
    if (typeof cursor !== 'string' || !cursor.startsWith('{')) return null
    try {
      const parsed = JSON.parse(cursor ?? 'null')
      return parsed?.[key] ?? null
    } catch {
      return null
    }
  }

  /** 全部扫描进度(供 sweep 遍历 / 诊断)。 */
  allProgress() {
    return this.#stmt.allProgress.all().map(row => ({
      sessionId: row.sessionId,
      consumedSeq: Number(row.consumedSeq),
      logRevision: row.logRevision ?? undefined,
      lastUsageAt: row.lastUsageAt === null ? undefined : Number(row.lastUsageAt),
      updatedAt: Number(row.updatedAt),
    }))
  }

  /**
   * 把某会话新折叠出的事件落盘(替换整会话的用量行,并推进扫描进度)。
   * 先从库中水合该会话既有状态(旧行 + 进度),再应用新事件,保证增量续扫
   * 不丢旧数据、替换语义跨分片正确。
   * @param sessionId - 会话 id。
   * @param events - 新事件(seq 递增),可为空(仅推进进度)。
   * @param options - { bill, logRevision }。
   */
  fold(sessionId, events, options = {}) {
    if (this.closed) return
    const state = this.#loadState(sessionId)
    const bill = options.bill ?? makeBiller(this.config)
    applyUsageDelta(state, events, { bill })
    const now = Date.now()
    const currency = activeCurrency(this.config)
    this.#transaction(() => {
      this.#stmt.deleteUsage.run(sessionId)
      for (const row of flattenState(state)) {
        this.#stmt.insertUsage.run(
          sessionId, row.day, row.provider, row.model,
          row.input, row.output, row.cacheRead, row.cacheWrite,
          row.requests, row.cost, currency,
        )
      }
      this.#stmt.upsertProgress.run(
        sessionId,
        state.consumedSeq,
        options.logRevision ?? null,
        JSON.stringify({ lastSample: state.lastSample, lastRoute: state.lastRoute }),
        state.lastUsageAt ?? null,
        now,
      )
    })
    this.prune()
  }

  /** 从库中水合某会话的折叠状态(旧用量行 + 进度)。无记录则返回空状态。 */
  #loadState(sessionId) {
    const state = createUsageState()
    const progress = this.progressFor(sessionId)
    state.consumedSeq = progress?.consumedSeq ?? -1
    state.lastUsageAt = progress?.lastUsageAt
    state.lastSample = progress?.lastSample ?? null
    state.lastRoute = progress?.lastRoute ?? null
    for (const row of this.#stmt.sessionRows.all(sessionId)) {
      const key = `${row.provider}\u0000${row.model}`
      let entry = state.days.get(row.day)
      if (entry === undefined) {
        entry = { totals: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, requests: 0, cost: 0 }, routes: new Map() }
        state.days.set(row.day, entry)
      }
      const buckets = {
        input: Number(row.inputTokens ?? 0),
        output: Number(row.outputTokens ?? 0),
        cacheRead: Number(row.cacheReadTokens ?? 0),
        cacheWrite: Number(row.cacheWriteTokens ?? 0),
        requests: Number(row.requests ?? 0),
        cost: Number(row.cost ?? 0),
      }
      entry.routes.set(key, buckets)
      for (const field of ['input', 'output', 'cacheRead', 'cacheWrite', 'requests', 'cost']) {
        entry.totals[field] += buckets[field]
      }
    }
    return state
  }

  /** 丢弃单会话的用量行与进度。 */
  dropSession(sessionId) {
    if (this.closed) return
    this.#transaction(() => {
      this.#stmt.deleteUsage.run(sessionId)
      this.#stmt.deleteProgress.run(sessionId)
    })
  }

  /** 丢弃整个用量账本;下次 sweep 从日志回填(reindex)。 */
  resetUsage() {
    if (this.closed) return
    this.#transaction(() => {
      this.db.exec('DELETE FROM token_usage')
      this.db.exec('DELETE FROM sweep_progress')
    })
  }

  /** 清理超出保留天数的旧用量行。 */
  prune() {
    if (this.closed) return
    const keep = Math.max(7, Math.min(3650, Number(this.config?.historyDays) || DEFAULT_HISTORY_DAYS))
    const today = localDayKey(Date.now())
    const cutoffDate = new Date(today + 'T00:00:00')
    cutoffDate.setDate(cutoffDate.getDate() - keep + 1)
    try {
      this.db.prepare('DELETE FROM token_usage WHERE day < ?').run(localDayKey(cutoffDate.getTime()))
    } catch (error) {
      console.warn(`[dsh-monitor] 账本剪枝失败: ${String(error?.message ?? error)}`)
    }
  }

  /** 组装按天/提供方/模型的筛选 SQL 子句(day BETWEEN + provider IN + model IN)。 */
  usageWhere(query) {
    const where = []
    const params = []
    if (query?.range?.start !== undefined) { where.push('day >= ?'); params.push(String(query.range.start)) }
    if (query?.range?.end !== undefined) { where.push('day <= ?'); params.push(String(query.range.end)) }
    if (Array.isArray(query?.providers) && query.providers.length > 0) {
      const marks = query.providers.map(() => '?').join(', ')
      where.push(`provider IN (${marks})`)
      params.push(...query.providers.map(String))
    }
    if (Array.isArray(query?.models) && query.models.length > 0) {
      const marks = query.models.map(() => '?').join(', ')
      where.push(`model IN (${marks})`)
      params.push(...query.models.map(String))
    }
    return { sql: where.length > 0 ? `WHERE ${where.join(' AND ')}` : '', params }
  }

  /**
   * 用量汇总:筛选后总计 + 按天序列 + 会话列表。
   * @param query - { range?, providers?, models? }(供图表/卡片/列表)。
   * @returns { totals, byDay, sessions }。
   */
  usageSummary(query) {
    const { sql, params } = this.usageWhere(query)
    const from = sql === '' ? 'FROM token_usage ' : `FROM token_usage ${sql} `
    const totals = this.db
      .prepare(`SELECT ${this.#usageSql.sums} ${from}`)
      .get(...params)
    // 会话列表:每会话一行(含该会话用过的所有 provider/model 的聚合)。
    const sessions = this.db
      .prepare(`SELECT sessionId, MAX(day) AS date, ${this.#usageSql.sums}
                ${from}
                GROUP BY sessionId ORDER BY date DESC, sessionId`)
      .all(...params)
      .map(row => ({ id: row.sessionId, date: row.date, ...this.#numeric(row) }))
    const byDay = this.db
      .prepare(`SELECT day, ${this.#usageSql.sums} ${from}
                GROUP BY day ORDER BY day`)
      .all(...params)
      .map(row => ({ date: row.day, ...this.#numeric(row) }))
    return {
      totals: this.#numeric(totals),
      byDay,
      sessions,
    }
  }

  #numeric(row) {
    return {
      input: Number(row.input ?? 0),
      output: Number(row.output ?? 0),
      cacheRead: Number(row.cacheRead ?? 0),
      cacheWrite: Number(row.cacheWrite ?? 0),
      calls: Number(row.calls ?? 0),
      cost: Number(row.cost ?? 0),
    }
  }

  // ── 配置持久化(旧接口保留) ──────────────────────────────────────────

  scheduleWrite() {
    this.pendingWrite = true
    if (this.writeTimer !== null) return
    this.writeTimer = setTimeout(() => {
      this.writeTimer = null
      this.flush()
    }, 2000)
  }

  /** 立即落盘(原子写,只写配置)。 */
  flush() {
    if (this.closed) return
    this.pendingWrite = false
    try {
      mkdirSync(dirname(this.configPath), { recursive: true })
      const tmp = `${this.configPath}.tmp`
      writeFileSync(tmp, JSON.stringify({ version: CONFIG_VERSION, config: this.config }), 'utf8')
      renameSync(tmp, this.configPath)
    } catch (error) {
      console.warn(`[dsh-monitor] 配置写入失败: ${String(error?.message ?? error)}`)
    }
  }

  /** 停止后续写入并最终落盘(插件卸载/进程退出)。 */
  close() {
    if (this.closed) return
    this.closed = true
    if (this.writeTimer !== null) {
      clearTimeout(this.writeTimer)
      this.writeTimer = null
    }
    try {
      this.flush()
    } catch { /* 关闭失败不抛 */ }
    try {
      this.db.close()
    } catch { /* 关闭失败不抛 */ }
  }
}
