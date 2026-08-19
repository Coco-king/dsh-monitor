/**
 * dsh-monitor monitor 服务:按提供方查询配置用量(deepseek 余额 / opencode
 * 套餐 / 自定义 HTTP),维护进程内用量缓存与配置/官方价格同步(listCatalog、
 * fetchPrices),并以 typertRemote 绑定暴露给 Typert 网关(配合 ./typert 清单)。
 */

import { applyConfigPatch } from './store.js'
import { CNY_PRICING_URL, OFFICIAL_PRICING_URL, normalizePrice, parsePricingHtml } from './pricing.js'
import { tmsg, localeOf } from './messages.js'
import { queryGoQuota, queryBalance, queryCustom } from './queries.js'
import { baseProviderId } from './provider-alias.js'

/** DeepSeek 官方在 dsh 模型目录中的 provider id(dsh-llm-deepseek 的路由名)。内置自动查询用。 */
const BUILTIN_DEEPSEEK_ID = 'deepseek-official'

/**
 * id 是否属 OpenCode Go 提供方(纯字符串推断,DSH 无 opencode 专用目录)。
 * 与客户端「按 ID 推导默认预设」同口径(settings.js: s.includes('opencode')),
 * 这里不区分大小写,便于覆盖 OpenCodeGo / opencode-go 等写法。
 */
function isOpenCodeGoId(id) {
  return typeof id === 'string' && /opencode/i.test(id)
}

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
 * @param options - { sweepStats?: () => { lastSweepAt?: number } }(页脚新鲜度)。
 * @returns 服务对象。
 */
export function createService(ctx, ledger, options = {}) {
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
    // modlens 变体回退本体：变体自身有显式配置时优先（用户可单独改），否则用本体
    // 提供方 id 的配置/官方内置，让变体与本体用量查询完全一致（provider-alias.js）。
    const effectiveId = baseProviderId(providerIdStr)
    const resolvedId = providerOf(providerIdStr) !== undefined ? providerIdStr : effectiveId
    let provider = providerOf(resolvedId)
    // DeepSeek 官方内置:无需配置 provider,自动用 设置→模型 的 Key 查 /user/balance。
    if (provider === undefined && resolvedId === BUILTIN_DEEPSEEK_ID) {
      provider = { enabled: true, preset: 'deepseek', refreshMinutes: 5, apiKey: '' }
    }
    // OpenCode Go 自动识别:未绑定的 opencode 提供方(含装插件前就配好的)直接按
    // Go 订阅查询,无需先在 设置→模型 里保存一次;Key 经 resolveGoKey 从
    // 凭据库/环境变量/opencode auth.json 回退。显式绑定优先(上面 providerOf 命中的用绑定)。
    if (provider === undefined && isOpenCodeGoId(resolvedId)) {
      provider = { enabled: true, preset: 'opencode', refreshMinutes: 15, apiKey: '' }
    }
    if (provider === undefined) {
      return emptyUsage(resolvedId, undefined, 'off', tmsg(locale, 'providerNotConfigured'))
    }
    if (provider.enabled === false) {
      return emptyUsage(resolvedId, provider, 'off', tmsg(locale, 'providerDisabled'))
    }
    const cache = usageCaches.get(resolvedId)
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
        value = resolvedId === BUILTIN_DEEPSEEK_ID
          ? { items: [
            { key: 'balance-total', label: tmsg(locale, 'balanceTotalShort'), kind: 'money', value: balance.totalBalance, resetsAt: null },
          ] }
          : { items: [
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
      usageCaches.set(resolvedId, { fetchedAt: Date.now(), value: buildProviderUsage(resolvedId, provider, value, 'ok', '', Date.now()) })
    })()

    const prev = usageCaches.get(resolvedId)
    if (prev === undefined) {
      usageCaches.set(resolvedId, { fetchedAt: 0, value: emptyUsage(resolvedId, provider, 'off', ''), inFlight: task })
    } else {
      prev.inFlight = task
    }
    try {
      await task
    } catch (error) {
      const soft = error && error.soft === true
      const entry = usageCaches.get(resolvedId)
      entry.value = buildProviderUsage(
        resolvedId,
        provider,
        { items: [] },
        soft ? 'off' : 'error',
        error instanceof Error ? error.message : String(error),
        Date.now(),
      )
    } finally {
      const entry = usageCaches.get(resolvedId)
      if (entry?.inFlight === task) delete entry.inFlight
    }
    return usageCaches.get(resolvedId).value
  }

  const service = {
    async getProviderUsage(providerId) {
      return ensureUsage(String(providerId ?? ''), false)
    },

    async refreshProvider(providerId) {
      return ensureUsage(String(providerId ?? ''), true)
    },

    /**
     * 用量汇总:单次返回整份面板载荷(统计卡/提供方分布/项目分布/活跃度/模型表/页脚)。
     * @param query - { range?, providers?, models? }。
     * @returns { totals, byDay, models, sessions, byProvider, byProject,
     *   activity, activityModels, windows, timeZone, diagnostics, lastSweepAt, providers }。
     */
    async getUsage(query) {
      const summary = ledger.usageSummary(query)
      // 提供方显示名字典:客户端用它给「提供方分布」行命名;目录里没有的路由回退 id。
      const providers = []
      try {
        const llm = ctx.get('llm')
        const routes = typeof llm?.listProviders === 'function' ? (llm.listProviders() ?? []) : []
        for (const p of routes) {
          if (p === null || typeof p !== 'object' || typeof p.id !== 'string' || p.id.length === 0) continue
          providers.push({ id: p.id, name: typeof p.name === 'string' && p.name.length > 0 ? p.name : p.id })
        }
      } catch {
        // 目录不可用:字典留空,客户端回退显示提供方 id。
      }
      return {
        ...summary,
        lastSweepAt: typeof options?.sweepStats === 'function' ? (options.sweepStats()?.lastSweepAt ?? null) : null,
        providers,
      }
    },

    async getConfig() {
      return ledger.config
    },

    async updateConfig(patch) {
      const { config, errors } = applyConfigPatch(ledger.config, patch)
      if (errors.length > 0) {
        const locale = patch !== null && typeof patch === 'object' && patch.locale === 'en' ? 'en' : localeOf(ledger.config)
        usageCaches.clear() // 提供方配置可能已变化:清空缓存
        throw new Error(tmsg(locale, 'configRejected', { errors: errors.join(locale === 'zh' ? '；' : '; ') }))
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
      // 一次性抓两页:英文页(美元)+ 中文页(人民币),分别写两套子表。
      // 任一侧抓取/解析失败只跳过该表,不阻塞另一侧。
      const fetchHtml = async url => {
        const response = await fetch(url, {
          signal: AbortSignal.timeout(20000),
          headers: { 'user-agent': 'dsh-monitor/0.1 (DeepSeek Harness plugin)' },
        })
        if (!response.ok) throw new Error(`HTTP ${String(response.status)}`)
        const html = await response.text()
        if (html.length < 500) throw new Error(tmsg(locale, 'pageTooShort'))
        return html
      }
      const resolveSide = async (url, target) => {
        const html = await fetchHtml(url)
        return parsePricingHtml(html, target)
      }
      const [usd, cny] = await Promise.all([
        resolveSide(OFFICIAL_PRICING_URL, 'usd').then(v => ({ ok: true, value: v }), e => ({ ok: false, error: e })),
        resolveSide(CNY_PRICING_URL, 'cny').then(v => ({ ok: true, value: v }), e => ({ ok: false, error: e })),
      ])
      if (usd.ok !== true && cny.ok !== true) {
        // 两页都失败才整体失败。
        const error = usd.ok !== true ? usd.error : cny.error
        const detail = error?.code === 'ERR_NO_MODELS'
          ? tmsg(locale, 'noModelsParsed')
          : (error instanceof Error ? error.message : String(error))
        return { ok: false, message: tmsg(locale, 'priceSyncFailed', { error: detail }) }
      }

      const officialPeakWindows = usd.ok === true && Array.isArray(usd.value.peakWindows) && usd.value.peakWindows.length > 0
        ? usd.value.peakWindows
        : null
      const applyParsed = (currencyKey, parsed) => {
        const models = { ...(ledger.config.prices[currencyKey]?.models ?? {}) }
        for (const [id, raw] of Object.entries(parsed.models)) {
          const entry = normalizePrice(raw)
          if (entry === null) continue
          // 同步会覆盖手动时间范围:官方有效高峰窗口写入各模型,清空 offPeak。
          if (officialPeakWindows !== null) {
            entry.windows = { peak: officialPeakWindows.map(w => ({ start: w.start, end: w.end })) }
          }
          models[id] = { ...(models[id] ?? {}), ...entry }
        }
        return models
      }
      const prices = { ...ledger.config.prices }
      let affected = []
      if (usd.ok === true) {
        prices.usd = { ...(prices.usd ?? {}), models: applyParsed('usd', usd.value) }
        affected.push('USD')
      }
      if (cny.ok === true) {
        prices.cny = { ...(prices.cny ?? {}), models: applyParsed('cny', cny.value) }
        affected.push('CNY')
      }
      const patch = {
        prices,
        priceSource: 'official',
        fetchedAt: new Date().toISOString(),
      }
      if (usd.ok === true) {
        if (typeof usd.value.effectiveAt === 'string') patch.peakEffectiveAt = usd.value.effectiveAt
        else patch.peakEffectiveAt = new Date().toISOString() // 页面已无生效时间:两档方案即时生效
        if (Array.isArray(usd.value.peakWindows) && usd.value.peakWindows.length > 0) {
          patch.peakWindows = usd.value.peakWindows
        }
      }
      const { config, errors } = applyConfigPatch(ledger.config, patch)
      if (errors.length > 0) return { ok: false, message: errors.join(locale === 'zh' ? '；' : '; ') }
      ledger.config = config
      ledger.scheduleWrite()
      let idsList = []
      if (usd.ok === true) idsList.push(...Object.keys(usd.value.models))
      else if (cny.ok === true) idsList.push(...Object.keys(cny.value.models))
      const ids = idsList.join(locale === 'zh' ? '、' : ', ')
      const part = usd.ok !== true || cny.ok !== true
        ? tmsg(locale, 'pricesSyncedPartial', { currencies: affected.join('/'), ids })
        : tmsg(locale, 'pricesSynced', { ids })
      return { ok: true, message: part, config: ledger.config }
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