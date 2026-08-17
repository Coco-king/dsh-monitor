/**
 * dsh-monitor monitor 服务:按提供方查询配置用量(deepseek 余额 / opencode
 * 套餐 / 自定义 HTTP),维护进程内用量缓存与配置/官方价格同步(listCatalog、
 * fetchPrices),并以 typertRemote 绑定暴露给 Typert 网关(配合 ./typert 清单)。
 */

import { applyConfigPatch } from './store.js'
import { OFFICIAL_PRICING_URL, normalizePrice, parsePricingHtml } from './pricing.js'
import { tmsg, localeOf } from './messages.js'
import { queryGoQuota, queryBalance, queryCustom } from './queries.js'

/** DeepSeek 官方在 dsh 模型目录中的 provider id(dsh-llm-deepseek 的路由名)。内置自动查询用。 */
const BUILTIN_DEEPSEEK_ID = 'deepseek-official'

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
export function createService(ctx, ledger) {
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
    async listCatalog() {
      // 设置→模型 目录(模型切换器同源):供客户端「添加提供方/模型」选择器使用。
      const llm = ctx.get('llm')
      if (llm === undefined || typeof llm.listProviders !== 'function') {
        return { providers: [], models: [] }
      }
      const routes = llm.listProviders() ?? []
      // 「已配置/可用」= 有存活路由(active);dormant(directory 里声明了但没激活)提供方
      // 无法查询,不进提供方选择器——没配置的列出来没有意义。
      const activeIds = new Set(
        routes.map(p => p?.id).filter(id => typeof id === 'string' && id.length > 0),
      )
      const providers = []
      const seen = new Set()
      const pushProvider = (id, name) => {
        if (typeof id !== 'string' || id.length === 0 || seen.has(id) || !activeIds.has(id)) return false
        seen.add(id)
        providers.push({ id, name: typeof name === 'string' && name.length > 0 ? name : id })
        return true
      }
      try {
        for (const entry of Array.isArray(llm.listConfigurableProviders?.()) ? llm.listConfigurableProviders() : []) {
          pushProvider(entry?.provider, entry?.displayName)
        }
      } catch {
        // 目录读取失败:提供方列表为空,客户端保留已配置的提供方。
      }
      const groups = []
      for (const p of routes) {
        const id = p?.id
        const name = p?.name
        if (typeof id !== 'string' || id.length === 0) continue
        // 注意:不把注册路由追加进 providers——提供方选择器只列「已配置」的提供方
        // (上方 configurable 目录);模型分组仍按注册路由展开(与模型切换器同源)。
        let models = []
        try {
          models = Array.isArray(await llm.listModels(id)) ? await llm.listModels(id) : []
        } catch {
          // 单提供方模型读取失败:该组留空。
        }
        groups.push({
          id,
          name: typeof name === 'string' && name.length > 0 ? name : id,
          models: models.map(m => ({ id: m?.id, name: m?.name ?? m?.id })).filter(m => typeof m.id === 'string' && m.id.length > 0),
        })
      }
      const models = []
      for (const group of groups) {
        for (const m of group.models) {
          models.push({ provider: group.id, providerName: group.name, id: m.id, name: m.name })
        }
      }
      return { providers, models }
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