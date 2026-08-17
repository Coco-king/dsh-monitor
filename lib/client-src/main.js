/**
 * dsh-monitor 浏览器端 bundle 入口。本文件是 esbuild 打包入口
 * (见 scripts/build-client.mjs):仅有插件接线(装载/卸载、配置快照轮询、
 * 三处插槽注册)与模块导入,组件/样式分散在 ./styles.js、./i18n.js、
 * ./codecs.js、./format.js、./panel.js、./settings.js。
 *
 * 装载契约:构建脚本把本文件(及被内联的模块)整体包进
 * `window.__ModuleLoader__.load({ id:'dsh-monitor', factory:(require)=>… })`,
 * 因此本文件内的 `require('react')` 等外部依赖调用在运行时绑定到 loader 传入
 * 的 require;相对 require 由 esbuild 在构建期内联,不会出现在产物中。
 *
 * 数据通道:
 *  - costUsage 会话投影(useProjection)+ 客户端价格表 → 本会话费用;
 *  - remote.monitor.*(Typert RPC)→ 提供方用量、配置、官方价格同步。
 */

const { injectStyles } = require('./styles.js')
const { MESSAGES, makeT, resolveLocale } = require('./i18n.js')
const { CONTRIBUTION } = require('./codecs.js')
const { UsageButton, SessionCost } = require('./panel.js')
const { SettingsSection } = require('./settings.js')
const { startBinding } = require('./binding.js')

// 样式注入(与旧单文件一致:模块加载即注入,幂等去重)。
injectStyles()

// ── 客户端状态存储 ──────────────────────────────────────────────────────

function makeStore(initial) {
  let snapshot = initial
  const listeners = new Set()
  return {
    getSnapshot: () => snapshot,
    subscribe: fn => {
      listeners.add(fn)
      return () => { listeners.delete(fn) }
    },
    set: next => {
      if (next === snapshot) return
      snapshot = next
      for (const fn of [...listeners]) fn()
    },
  }
}

// ── 插件主体 ────────────────────────────────────────────────────────────

const inject = ['remote']

/** 构建标记:构建脚本按产物内容注入(用于确认热更是否生效)。 */
const BUILD_TAG = __DSH_BUILD_TAG__

async function apply(ctx) {
  console.log('[dsh-monitor] client build ' + BUILD_TAG)
  const remote = ctx.remote
  if (remote === undefined || typeof remote.$mount !== 'function') return
  const unmount = await remote.$mount(CONTRIBUTION)
  ctx.effect(() => () => { unmount() }, 'dsh-monitor: remote contribution')
  const monitor = ctx.get('remote.monitor')
  if (monitor === undefined) return
  const store = makeStore({ status: 'loading', error: null, config: null })

  const call = async (method, args) => {
    const result = await monitor[method](...(args ?? []))
    if (result === null || typeof result !== 'object' || result.ok !== true) {
      throw new Error(result?.error?.message ?? `monitor.${method} failed`)
    }
    return result.value
  }
  let reloading = false
  let localeBackfilled = false
  const reload = async () => {
    if (reloading) return // 并发防抖:轮询/手动刷新/重连不叠加 getConfig,避免乱序覆盖
    reloading = true
    const prev = store.getSnapshot()
    try {
      const config = await call('getConfig')
      store.set({ status: 'ready', error: null, config })
      // 决策 3:auto 由客户端解析后写回配置,服务端计费读配置决定币种。
      // 幂等:仅一次;写回后下次 getConfig 返回 zh/en,不再触发。
      if (!localeBackfilled && config?.locale === 'auto') {
        localeBackfilled = true
        const resolved = resolveLocale('auto')
        if (resolved !== 'auto') void api.updateConfig({ locale: resolved }).catch(() => {})
      }
    } catch (error) {
      store.set({ status: 'error', error: error?.message ?? String(error), config: prev.config })
    } finally {
      reloading = false
    }
  }
  ctx.effect(() => ctx.on('connection/reset', () => { void reload() }), 'dsh-monitor: reconnect reload')
  // 配置快照轮询:面板/设置页依赖 getConfig,页面隐藏时跳过,重新可见立即刷新。
  const pollTimer = setInterval(() => { if (!document.hidden) void reload() }, 60_000)
  ctx.effect(() => () => { clearInterval(pollTimer) }, 'dsh-monitor: poll timer')
  const onVisible = () => { if (document.visibilityState === 'visible') void reload() }
  document.addEventListener('visibilitychange', onVisible)
  ctx.effect(() => () => { document.removeEventListener('visibilitychange', onVisible) }, 'dsh-monitor: visibility reload')

  const api = {
    reload,
    updateConfig: async patch => {
      const config = await call('updateConfig', [patch])
      store.set({ status: 'ready', error: null, config })
      return config
    },
    getProviderUsage: async providerId => call('getProviderUsage', [providerId]),
    refreshProvider: async providerId => call('refreshProvider', [providerId]),
    listCatalog: async () => call('listCatalog'),
    fetchPrices: async () => {
      const result = await monitor.fetchPrices()
      if (result === null || typeof result !== 'object' || result.ok !== true) {
        throw new Error(result?.error?.message ?? 'monitor.fetchPrices failed')
      }
      if (result.value?.ok !== true) throw new Error(result.value.message || 'sync failed')
      if (result.value.config !== undefined) {
        store.set({ status: 'ready', error: null, config: result.value.config })
      }
      return result.value
    },
  }

  void reload()

  const slots = ctx.get('slots')
  if (slots === undefined) return

  /** 解析当前会话的模型提供方 id(读模型切换器自己的 service,不自己猜)。 */
  const providerOf = sessionId => {
    const dirs = ctx.get('modelDirectories')
    if (dirs === undefined || typeof dirs.directoryFor !== 'function') return undefined
    try {
      const directory = dirs.directoryFor(sessionId)
      const snapshot = typeof directory?.store?.getSnapshot === 'function' ? directory.store.getSnapshot() : undefined
      return snapshot?.current?.provider
    } catch {
      return undefined
    }
  }
  const tOf = () => makeT(resolveLocale(store.getSnapshot().config?.locale))
  const injected = () => ({
    api, providerOf, t: tOf(),
    locale: resolveLocale(store.getSnapshot().config?.locale),
    hooks: { monitor: store },
  })

  // 设置→模型 页每行「配置用量查询」图标的 DOM 注入 + 绑定弹窗。
  startBinding(ctx, { api, configOf: () => store.getSnapshot().config, tOf })

  // 用量图标:模型切换器左侧(conversation.input.right,list 协议,session 作用域)。
  slots.inject('conversation.input.right', () => slots.register({
    name: 'conversation.input.right',
    id: 'dsh-monitor-icon',
    order: 0,
    inject: sessionId => ({ sessionId, api, providerOf, t: tOf(), hooks: { monitor: store } }),
  }, UsageButton))

  // 会话费用角标:会话头部操作区(conversation.session.header.actions,list 协议)。
  slots.inject('conversation.session.header.actions', () => slots.register({
    name: 'conversation.session.header.actions',
    id: 'dsh-monitor-cost',
    order: -5,
    inject: () => ({ hooks: { monitor: store } }),
  }, SessionCost))

  // 设置页「用量」分节:标签随语言重建(与 cost-meter 相同的 gen 守卫模式)。
  const sectionActive = { gen: 0, dispose: null }
  const registerSection = locale => {
    if (sectionActive.dispose !== null) { sectionActive.dispose(); sectionActive.dispose = null }
    sectionActive.gen += 1
    const gen = sectionActive.gen
    slots.inject('settings.section', () => {
      if (sectionActive.gen !== gen) return
      const dispose = slots.register({
        name: 'settings.section',
        id: 'dsh-monitor-' + locale,
        order: 30,
        label: locale === 'en' ? MESSAGES.en.sectionLabel : MESSAGES.zh.sectionLabel,
        inject: injected,
      }, SettingsSection)
      if (sectionActive.gen !== gen) { dispose(); return }
      sectionActive.dispose = dispose
      return () => {
        if (sectionActive.dispose === dispose) sectionActive.dispose = null
        dispose()
      }
    })
  }
  let lastSectionLocale = null
  const sync = () => {
    const locale = resolveLocale(store.getSnapshot().config?.locale)
    if (locale !== lastSectionLocale) {
      registerSection(locale)
      lastSectionLocale = locale
    }
  }
  sync()
  const stopSync = store.subscribe(sync)

  return () => { stopSync() }
}

module.exports = { apply, inject }