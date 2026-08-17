/**
 * dsh-monitor 浏览器端 bundle(单文件,经 __ModuleLoader__ 加载)。
 *
 * 提供三个界面:
 *  - conversation.input.right:用量图标(模型切换器左侧)→ 点击弹出当前提供方用量面板;
 *  - conversation.session.header.actions:本会话费用角标(useProjection('costUsage') + 客户端计价);
 *  - settings.section「用量 / Usage」:提供方配置(deepseek/opencode/custom 预设)+ 价格表与官方价格同步。
 *
 * 数据通道:
 *  - costUsage 会话投影(useProjection)+ 客户端价格表 → 本会话费用;
 *  - remote.monitor.*(Typert RPC)→ 提供方用量、配置、官方价格同步。
 * 样式全部使用 --dsw-* 主题变量,跟随全局亮/暗主题。
 */

window.__ModuleLoader__.load({
  id: 'dsh-monitor',
  factory: (require) => {
    var module = { exports: {} }
    var exports = module.exports
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' })

    const React = require('react')
    const { Tooltip } = require('@deepseek-ai/dsh-client-ui-primitives')

    // ── 样式 ────────────────────────────────────────────────────────────────

    const css = [
      '/* dsh-monitor: 用量图标/面板与设置页 */',
      '.dm-icon-btn{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border:none;border-radius:999px;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;flex:none}',
      '.dm-icon-btn:hover{background:var(--dsw-alias-interactive-bg-hover)}',
      '.dm-icon-btn:disabled{opacity:.5;cursor:default}',
      '.dm-icon-btn-open{background:var(--dsw-alias-interactive-bg-hover)}',
      '.dm-icon-btn .dm-spin{animation:dm-spin 1s linear infinite}',
      '@keyframes dm-spin{to{transform:rotate(360deg)}}',
      '.dm-dock{position:relative;display:inline-flex;align-items:center}',
      '.dm-panel{position:absolute;right:0;bottom:calc(100% + 8px);z-index:60;width:320px;max-width:calc(100vw - 32px);box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2-darkmode-thin);border-radius:12px;background:var(--dsw-specific-input-major);box-shadow:var(--dsw-shadow-lv2);padding:12px;font-size:13px;line-height:20px;color:var(--dsw-alias-label-primary)}',
      '.dm-panel-head{display:flex;align-items:center;gap:8px;margin-bottom:10px}',
      '.dm-panel-title{flex:1;min-width:0;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
      '.dm-preset{flex:none;font-size:11px;font-weight:500;color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-layer-2);border-radius:6px;padding:0 6px;height:18px;line-height:18px}',
      '.dm-items{display:flex;flex-direction:column;gap:10px}',
      '.dm-row{display:flex;align-items:center;gap:8px;font-size:12px}',
      '.dm-label{flex:none;width:auto;min-width:56px;color:var(--dsw-alias-label-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
      '.dm-bar{flex:1;height:6px;border-radius:3px;background:var(--dsw-alias-interactive-bg-hover);overflow:hidden}',
      '.dm-fill{height:100%;border-radius:3px;background:var(--dsw-alias-brand-primary)}',
      '.dm-fill.warn{background:var(--dsw-alias-state-warn-primary)}',
      '.dm-fill.over{background:var(--dsw-alias-state-error-primary)}',
      '.dm-num{flex:none;min-width:52px;text-align:right;font-weight:600;font-variant-numeric:tabular-nums}',
      '.dm-reset{font-size:11px;color:var(--dsw-alias-label-tertiary);padding-left:64px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
      '.dm-msg{font-size:12px;line-height:18px;border-radius:8px;padding:8px 10px;margin-bottom:8px}',
      '.dm-msg.err{color:var(--dsw-alias-state-error-primary);background:var(--dsw-alias-interactive-bg-hover-danger)}',
      '.dm-msg.off,.dm-empty{color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-interactive-bg-hover);border-radius:8px;padding:8px 10px;font-size:12px}',
      '.dm-panel-foot{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:10px;font-size:11px;color:var(--dsw-alias-label-tertiary);border-top:1px solid var(--dsw-alias-border-l1);padding-top:8px}',
      '.dm-chip{display:inline-flex;align-items:center;gap:4px;max-width:180px;padding:0 8px;height:24px;border-radius:8px;background:var(--dsw-alias-bg-layer-2);font-size:12px;line-height:24px;color:var(--dsw-alias-label-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
      '.dm-section{display:flex;flex-direction:column;gap:20px;padding:4px 2px 24px;font-size:13px;color:var(--dsw-alias-label-primary)}',
      '.dm-h{font-size:14px;font-weight:600;margin:0 0 10px}',
      '.dm-note{font-size:12px;color:var(--dsw-alias-label-tertiary);margin:4px 0 0}',
      '.dm-btn{display:inline-flex;align-items:center;justify-content:center;height:28px;padding:0 12px;border:none;border-radius:8px;background:var(--dsw-alias-button-info-fill);color:#fff;font-size:12px;cursor:pointer}',
      '.dm-btn:hover{background:var(--dsw-alias-button-info-hover)}',
      '.dm-btn:disabled{opacity:.5;cursor:default}',
      '.dm-btn.ghost{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}',
      '.dm-btn.danger{background:transparent;color:var(--dsw-alias-state-error-primary);border:1px solid var(--dsw-alias-state-error-primary)}',
      '.dm-btn.small{height:22px;padding:0 8px;font-size:11px}',
      '.dm-field{display:flex;flex-direction:column;gap:4px;min-width:0}',
      '.dm-field label{font-size:11px;color:var(--dsw-alias-label-tertiary)}',
      '.dm-input{height:26px;padding:0 8px;border:1px solid var(--dsw-alias-border-l2-darkmode-thin);border-radius:6px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font-size:12px;box-sizing:border-box;min-width:0}',
      '.dm-input:focus{outline:none;border-color:var(--dsw-alias-state-business-primary)}',
      '.dm-input.narrow{width:100%}',
      '.dm-textarea{min-height:56px;padding:6px 8px;border:1px solid var(--dsw-alias-border-l2-darkmode-thin);border-radius:6px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font-size:12px;font-family:var(--dsw-font-family-mono,monospace);box-sizing:border-box;width:100%;resize:vertical}',
      '.dm-grid2{display:grid;grid-template-columns:1fr 1fr;gap:8px}',
      '.dm-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}',
      '.dm-provider-card{border:1px solid var(--dsw-alias-border-l1);border-radius:12px;padding:12px 14px;background:var(--dsw-alias-bg-layer-1);display:flex;flex-direction:column;gap:8px}',
      '.dm-price-card{border:1px solid var(--dsw-alias-border-l1);border-radius:12px;padding:12px 14px;background:var(--dsw-alias-bg-layer-1)}',
      '.dm-price-name{font-size:12px;font-weight:600;margin:0 0 8px;display:flex;align-items:center;gap:6px}',
      '.dm-price-legacy{font-size:10px;color:var(--dsw-alias-label-tertiary)}',
      '.dm-tier{font-size:11px;color:var(--dsw-alias-label-tertiary);margin-top:6px;line-height:16px}',
      '.dm-row-actions{display:flex;gap:6px;align-items:center}',
      '.dm-switch{cursor:pointer;user-select:none}',
      '@media (max-width:640px){.dm-grid3{grid-template-columns:1fr}.dm-grid2{grid-template-columns:1fr}}',
    ].join('\n')
    const cssTagId = 'dsh-monitor/client.css'
    if (typeof document !== 'undefined' && document.querySelector('style[data-plugin-css=' + JSON.stringify(cssTagId) + ']') === null) {
      const tag = document.createElement('style')
      tag.dataset.plugin = 'dsh-monitor'
      tag.dataset.pluginCss = cssTagId
      tag.textContent = css
      document.head.appendChild(tag)
    }

    // ── 多语言(中/英) ──────────────────────────────────────────────────────

    /** 全部界面文案:zh / en。{var} 为插值占位。 */
    const MESSAGES = {
      zh: {
        // 用量图标/面板
        panelTitle: '用量',
        refresh: '刷新',
        presetDeepseek: 'DeepSeek 官方',
        presetOpencode: 'OpenCode',
        presetCustom: '自定义',
        unknownProvider: '未知提供方',
        notConfiguredHint: '该提供方尚未配置用量查询,请在 设置→用量 中配置。',
        noUsageItems: '暂无用数据。',
        resetsAt: '重置时间 {time}',
        updatedAt: '更新于 {time}',
        loading: '加载中…',
        // 会话费用徽章
        sessionCostTitle: '本会话费用(按每次调用实际时刻精确计费)',
        sessionDetailTokens: '输入 {input} · 缓存 {cache} · 输出 {output}',
        sessionDetailCache: '缓存:读 {read} · 写 {write}(写入按命中价计费)',
        cost: '费用 {amount}',
        // 设置页:提供方配置
        sectionLabel: '用量',
        providersTitle: '提供方用量配置',
        noProviders: '尚未配置任何提供方。',
        addProvider: '添加提供方',
        providerId: '提供方 ID',
        providerIdPlaceholder: '与模型选择器中的提供方一致',
        deepseekHint: '复用 设置→模型 中配置的 DeepSeek API Key,查询官方账户余额。',
        opencodeHint: '查询 OpenCode Go 套餐额度(滚动 5 小时 / 本周 / 本月);Key 留空则自动发现(凭据 → 环境变量 → opencode auth.json)。',
        apiKey: 'API Key(可选)',
        apiKeyPlaceholder: '留空 = 自动发现',
        refreshMinutes: '刷新间隔(分钟)',
        enabled: '启用',
        edit: '编辑',
        remove: '删除',
        save: '保存',
        cancel: '取消',
        customUrl: '接口 URL',
        customHeaders: '请求头(JSON,支持 {apiKey})',
        customItems: '用量条目',
        itemField: '条目',
        itemKey: 'key',
        itemLabel: 'label',
        itemKind: 'kind',
        itemPath: 'path',
        itemMaxPath: 'maxPath',
        itemResetsAtPath: 'resetsAtPath',
        addItem: '添加条目',
        kindPercent: 'percent',
        kindNumber: 'number',
        kindMoney: 'money',
        kindText: 'text',
        providerSaved: '已保存 {id}',
        providerRemoved: '已删除 {id}',
        saved: '已保存',
        saveFailed: '保存失败:{message}',
        providersUpdated: '提供方配置已更新',
        // 设置页:计费价格
        pricesTitle: '计费价格(美元 / 1M tokens)',
        peakNotice: '空闲 / 高峰为峰谷计价两档;生效前按历史基础价(legacyBase)计费;缓存写入按命中价计费。',
        defaultModel: 'default(未匹配模型时回退)',
        addModel: '添加模型',
        newModelPlaceholder: '新模型 ID(如 deepseek-v4-pro)',
        cacheHit: '命中',
        cacheMiss: '未命中',
        output: '输出',
        offPeak: '空闲',
        peak: '高峰',
        legacyBase: '历史基础价',
        legacy: '旧模型',
        syncFromDocs: '从官方文档同步',
        syncFailed: '同步失败:{message}',
        lastSync: '上次同步 {time} · 来源 {source}',
        neverSynced: '从未',
        sourceBundled: '内置',
        sourceOfficial: '官方',
      },
      en: {
        panelTitle: 'Usage',
        refresh: 'Refresh',
        presetDeepseek: 'DeepSeek official',
        presetOpencode: 'OpenCode',
        presetCustom: 'Custom',
        unknownProvider: 'Unknown provider',
        notConfiguredHint: 'No usage query configured for this provider. Configure it in Settings → Usage.',
        noUsageItems: 'No usage data yet.',
        resetsAt: 'Resets {time}',
        updatedAt: 'Updated {time}',
        loading: 'Loading…',
        sessionCostTitle: 'Session cost (billed precisely at each call time)',
        sessionDetailTokens: 'Input {input} · Cache {cache} · Output {output}',
        sessionDetailCache: 'Cache: read {read} · write {write} (writes billed at hit price)',
        cost: 'Cost {amount}',
        sectionLabel: 'Usage',
        providersTitle: 'Provider usage config',
        noProviders: 'No providers configured yet.',
        addProvider: 'Add provider',
        providerId: 'Provider ID',
        providerIdPlaceholder: 'Matches the provider in the model switcher',
        deepseekHint: 'Reuses the DeepSeek API key configured in Settings → Models and queries the official account balance.',
        opencodeHint: 'Queries the OpenCode Go plan quota (rolling 5h / weekly / monthly). Leave the key empty for auto-discovery (credentials → env → opencode auth.json).',
        apiKey: 'API key (optional)',
        apiKeyPlaceholder: 'Empty = auto-discover',
        refreshMinutes: 'Refresh interval (minutes)',
        enabled: 'Enabled',
        edit: 'Edit',
        remove: 'Remove',
        save: 'Save',
        cancel: 'Cancel',
        customUrl: 'Endpoint URL',
        customHeaders: 'Headers (JSON, supports {apiKey})',
        customItems: 'Usage items',
        itemField: 'Item',
        itemKey: 'key',
        itemLabel: 'label',
        itemKind: 'kind',
        itemPath: 'path',
        itemMaxPath: 'maxPath',
        itemResetsAtPath: 'resetsAtPath',
        addItem: 'Add item',
        kindPercent: 'percent',
        kindNumber: 'number',
        kindMoney: 'money',
        kindText: 'text',
        providerSaved: 'Saved {id}',
        providerRemoved: 'Removed {id}',
        saved: 'Saved',
        saveFailed: 'Save failed: {message}',
        providersUpdated: 'Provider config updated',
        pricesTitle: 'Billing prices (USD / 1M tokens)',
        peakNotice: 'Off-peak / Peak are the two tiers; calls before the effective boundary are billed at the legacy base prices; cache writes are billed at the cache-hit price.',
        defaultModel: 'default (fallback for unmatched models)',
        addModel: 'Add model',
        newModelPlaceholder: 'New model ID (e.g. deepseek-v4-pro)',
        cacheHit: 'Hit',
        cacheMiss: 'Miss',
        output: 'Output',
        offPeak: 'Off-peak',
        peak: 'Peak',
        legacyBase: 'Legacy base',
        legacy: 'Legacy',
        syncFromDocs: 'Sync from official docs',
        syncFailed: 'Sync failed: {message}',
        lastSync: 'Last sync {time} · Source {source}',
        neverSynced: 'Never',
        sourceBundled: 'Bundled',
        sourceOfficial: 'Official',
      },
    }

    /** 探测浏览器语言:zh* → zh,其余 → en。 */
    function detectBrowserLocale() {
      const lang = typeof navigator !== 'undefined' && typeof navigator.language === 'string' ? navigator.language : ''
      return lang.toLowerCase().startsWith('zh') ? 'zh' : 'en'
    }

    /** 解析生效语言:显式 zh/en 直接采用;auto/缺失 → 浏览器探测。 */
    function resolveLocale(configLocale) {
      if (configLocale === 'zh' || configLocale === 'en') return configLocale
      return detectBrowserLocale()
    }

    /** 构造按当前语言取文案的函数 t(key, vars)。 */
    function makeT(locale) {
      const dict = locale === 'zh' ? MESSAGES.zh : MESSAGES.en
      return (key, vars) => {
        let text = dict[key] ?? MESSAGES.en[key] ?? key
        if (vars) for (const name of Object.keys(vars)) text = text.split('{' + name + '}').join(String(vars[name]))
        return text
      }
    }

    // ── 线路校验器(与服务端 zod 清单对应,宽松校验必要字段) ─────────────────

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
    function parseConfig(v, path) {
      if (v === null || typeof v !== 'object' || Array.isArray(v)) fail(path, 'object')
      const models = {}
      if (v.prices !== null && typeof v.prices === 'object' && v.prices.models !== null && typeof v.prices.models === 'object') {
        for (const id of Object.keys(v.prices.models)) models[id] = parsePrice(v.prices.models[id], path + '.prices.models.' + id)
      }
      const providers = {}
      if (v.providers !== null && typeof v.providers === 'object' && !Array.isArray(v.providers)) {
        for (const id of Object.keys(v.providers)) providers[id] = parseProvider(v.providers[id], path + '.providers.' + id)
      }
      return {
        locale: v.locale === 'zh' || v.locale === 'en' || v.locale === 'auto' ? v.locale : 'auto',
        currency: typeof v.currency === 'string' ? v.currency : 'CNY',
        symbol: typeof v.symbol === 'string' ? v.symbol : '¥',
        decimals: needNum(v.decimals, path + '.decimals'),
        exchangeRate: needNum(v.exchangeRate, path + '.exchangeRate'),
        peakEnabled: v.peakEnabled === true,
        peakEffectiveAt: typeof v.peakEffectiveAt === 'string' ? v.peakEffectiveAt : '',
        peakWindows: Array.isArray(v.peakWindows)
          ? v.peakWindows.map((w, i) => ({ start: needNum(w.start, path + '.peakWindows[' + i + '].start'), end: needNum(w.end, path + '.peakWindows[' + i + '].end') }))
          : [],
        prices: {
          models,
          default: parsePrice(v.prices?.default ?? { cacheHit: 0, cacheMiss: 0, output: 0 }, path + '.prices.default'),
        },
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
    const stringCodec = codecOf(v => {
      if (typeof v !== 'string') fail('providerId', 'string')
      return v
    })

    // ── RPC 贡献(与服务端 ./typert 清单一一对应) ───────────────────────────

    const CONTRIBUTION = {
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
          id: 'dsh-monitor#monitor/fetchPrices', service: 'monitor', namespace: 'monitor', method: 'fetchPrices',
          invocation: { kind: 'direct' }, parameters: [],
          result: { mode: 'strict', typeSymbol: 'dsh-monitor#FetchPricesResult', schema: fetchCodec },
        },
      ],
    }

    // ── 计费与显示助手(与服务端 pricing.js 一致) ───────────────────────────

    function priceEntryFor(modelId, table) {
      const models = table?.models ?? {}
      if (typeof modelId === 'string' && modelId.length > 0 && models[modelId] !== undefined) return models[modelId]
      return table?.default ?? { cacheHit: 0, cacheMiss: 0, output: 0 }
    }
    function isPeakHour(atMs, effectiveAtMs, windows) {
      if (!Array.isArray(windows) || windows.length === 0) return false
      if (Number.isFinite(effectiveAtMs) && atMs < effectiveAtMs) return false
      const hour = new Date(atMs).getUTCHours()
      return windows.some(w => {
        const start = Number(w.start)
        const end = Number(w.end)
        if (!Number.isFinite(start) || !Number.isFinite(end)) return false
        return start < end ? hour >= start && hour < end : hour >= start || hour < end
      })
    }
    function tierFor(entry, atMs, peak) {
      const base = entry ?? { cacheHit: 0, cacheMiss: 0, output: 0 }
      if (peak?.enabled !== true) return { cacheHit: base.cacheHit, cacheMiss: base.cacheMiss, output: base.output }
      const effectiveAtMs = typeof peak.effectiveAtMs === 'number' ? peak.effectiveAtMs : undefined
      if (isPeakHour(atMs, effectiveAtMs, peak.windows)) {
        const p = base.peak
        return p === undefined ? { ...base } : { cacheHit: p.cacheHit, cacheMiss: p.cacheMiss, output: p.output }
      }
      if (effectiveAtMs !== undefined && atMs >= effectiveAtMs) {
        const off = base.offPeak
        return off === undefined ? { ...base } : { cacheHit: off.cacheHit, cacheMiss: off.cacheMiss, output: off.output }
      }
      return { cacheHit: base.cacheHit, cacheMiss: base.cacheMiss, output: base.output }
    }
    function costOfBuckets(buckets, tier) {
      const input = Math.max(0, Number(buckets.input) || 0)
      const output = Math.max(0, Number(buckets.output) || 0)
      const cacheRead = Math.max(0, Number(buckets.cacheRead) || 0)
      const cacheWrite = Math.max(0, Number(buckets.cacheWrite) || 0)
      return (input * tier.cacheMiss + output * tier.output + (cacheRead + cacheWrite) * tier.cacheHit) / 1_000_000
    }
    /** 已换算币种金额 → 显示字符串(符号 + 可调小数位)。 */
    function formatMoneyValue(value, config) {
      const symbol = typeof config?.symbol === 'string' && config.symbol.length > 0 ? config.symbol : '$'
      const decimals = Math.max(0, Math.min(10, Math.floor(Number(config?.decimals) || 2)))
      let effective = decimals
      if (value > 0 && value < Math.pow(10, -decimals)) effective = decimals + 2
      const fixed = value.toFixed(effective)
      const trimmed = fixed.includes('.') ? fixed.replace(/0+$/, '').replace(/\.$/, '') : fixed
      return symbol + trimmed
    }
    function formatMoneyUsd(usd, config) {
      const rate = Number(config?.exchangeRate)
      const value = usd * (Number.isFinite(rate) && rate > 0 ? rate : 1)
      return formatMoneyValue(value, config)
    }
    /** 普通数值显示(无符号,最多 fixed 位小数,去尾零)。 */
    function formatPlain(value, decimals) {
      const d = Math.max(0, Math.min(10, Math.floor(Number(decimals) || 2)))
      const fixed = value.toFixed(d)
      return fixed.includes('.') ? fixed.replace(/0+$/, '').replace(/\.$/, '') : fixed
    }
    function formatTokens(n) {
      const v = Math.max(0, Number(n) || 0)
      const scaled = x => x >= 100 ? String(Math.round(x)) : String(Math.round(x * 10) / 10)
      if (v < 1000) return String(Math.round(v))
      if (v < 1000000) return scaled(v / 1000) + 'K'
      return scaled(v / 1000000) + 'M'
    }
    /** 投影 token 桶 → 按当前时刻档位计价的美元成本。 */
    function usageCost(usage, config) {
      if (!usage || !config) return 0
      // 宿主按事件时刻逐次计费的成本(历史正确,含峰谷时代前的旧基础价)。
      if (typeof usage.cost === 'number' && Number.isFinite(usage.cost)) return usage.cost
      const peak = {
        enabled: config.peakEnabled === true,
        effectiveAtMs: Date.parse(config.peakEffectiveAt || ''),
        windows: config.peakWindows,
      }
      const now = Date.now()
      const byModel = usage.byModel ?? {}
      let total = 0
      for (const modelId of Object.keys(byModel)) {
        const entry = priceEntryFor(modelId, config.prices)
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
      total += costOfBuckets(leftover, tierFor(priceEntryFor('default', config.prices), now, peak))
      return total
    }
    function billedInput(usage) {
      return (usage?.input ?? 0) + (usage?.cacheRead ?? 0) + (usage?.cacheWrite ?? 0)
    }

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

    const { createElement: el, Fragment, useState, useEffect, useCallback, useRef } = React

    // ── 用量图标(仪表盘 SVG) ───────────────────────────────────────────────

    function GaugeIcon({ size = 16, className }) {
      return el('svg', { width: size, height: size, className, viewBox: '0 0 16 16', fill: 'none', xmlns: 'http://www.w3.org/2000/svg' },
        el('path', { d: 'M1.5 10.4A6.5 6.5 0 1 1 14.5 10.4', stroke: 'currentColor', strokeWidth: '1.7', strokeLinecap: 'round' }),
        el('path', { d: 'M8 10.4V4.2', stroke: 'currentColor', strokeWidth: '1.7', strokeLinecap: 'round' }),
        el('circle', { cx: '8', cy: '10.4', r: '1.4', fill: 'currentColor' }))
    }

    function RefreshIcon({ size = 14, spin }) {
      return el('svg', { width: size, height: size, className: spin ? 'dm-spin' : undefined, viewBox: '0 0 16 16', fill: 'none', xmlns: 'http://www.w3.org/2000/svg' },
        el('path', {
          d: 'M13.5 8A5.5 5.5 0 1 1 8 2.5M8 2.5v3M8 2.5h3',
          stroke: 'currentColor', strokeWidth: '1.6', strokeLinecap: 'round', strokeLinejoin: 'round',
        }))
    }

    // ── 用量面板 ────────────────────────────────────────────────────────────

    function UsageItemRow({ item, t }) {
      const pct = typeof item.percent === 'number' && Number.isFinite(item.percent)
        ? Math.max(0, Math.min(100, item.percent))
        : item.kind === 'percent' ? Math.max(0, Math.min(100, item.value)) : null
      let valueText
      if (item.kind === 'money') valueText = formatPlain(item.value, 2)
      else if (item.kind === 'text') valueText = String(item.value ?? '')
      else if (pct !== null) valueText = Math.round(pct) + '%'
      else valueText = formatPlain(item.value, 2)
      const showMax = typeof item.max === 'number' && Number.isFinite(item.max) && item.max > 0 && item.kind !== 'percent'
      const fillClass = pct !== null ? (pct >= 100 ? ' dm-fill over' : pct >= 80 ? ' dm-fill warn' : '') : ''
      const rows = []
      rows.push(el('div', { key: 'r', className: 'dm-row' },
        el('div', { className: 'dm-label', title: item.label }, item.label),
        pct !== null
          ? el(Fragment, null,
            el('div', { className: 'dm-bar' }, el('div', { className: 'dm-fill' + fillClass, style: { width: pct + '%' } })),
            el('div', { className: 'dm-num' }, valueText))
          : el('div', { className: 'dm-num' }, valueText)))
      if (showMax) {
        rows.push(el('div', { key: 'max', className: 'dm-reset' }, item.label + ': ' + formatPlain(item.value, 2) + ' / ' + formatPlain(item.max, 2)))
      }
      if (item.resetsAt) {
        rows.push(el('div', { key: 'reset', className: 'dm-reset' }, t('resetsAt', { time: new Date(item.resetsAt).toLocaleString() })))
      }
      return el('div', null, rows)
    }

    function UsagePanel(props) {
      const { providerId, usage, loading, refreshing, error, onRefresh, config, t } = props
      // DeepSeek 官方内置 provider:id 与 dsh 模型目录一致,无需配置即可自动查询余额。
      const BUILTIN_DEEPSEEK = 'deepseek-official'
      const configured = config?.providers?.[providerId]
      const isBuiltinDeepseek = providerId === BUILTIN_DEEPSEEK
      const preset = configured?.preset ?? (isBuiltinDeepseek ? 'deepseek' : undefined)
      const presetLabel = preset === 'deepseek' ? t('presetDeepseek') : preset === 'opencode' ? t('presetOpencode') : preset === 'custom' ? t('presetCustom') : null
      let body
      if (loading) {
        body = el('div', { className: 'dm-msg off' }, t('loading'))
      } else if (!configured && !isBuiltinDeepseek) {
        body = el('div', { className: 'dm-empty' }, t('notConfiguredHint'))
      } else if (error) {
        body = el('div', { className: 'dm-msg err' }, error)
      } else if (usage !== null && (usage.status === 'error' || (usage.status === 'off' && usage.message.length > 0))) {
        body = el('div', { className: 'dm-msg ' + (usage.status === 'error' ? 'err' : 'off') }, usage.message)
      } else if (usage !== null && usage.items.length === 0) {
        body = el('div', { className: 'dm-empty' }, t('noUsageItems'))
      } else {
        body = el('div', { className: 'dm-items' }, usage.items.map(item => el(UsageItemRow, { key: item.key, item, t })))
      }
      return el('div', { className: 'dm-panel', role: 'dialog' },
        el('div', { className: 'dm-panel-head' },
          el('div', { className: 'dm-panel-title', title: providerId || undefined }, providerId || t('unknownProvider')),
          presetLabel !== null && el('span', { className: 'dm-preset' }, presetLabel),
          el('button', { type: 'button', className: 'dm-icon-btn', 'aria-label': t('refresh'), disabled: refreshing || loading, onClick: onRefresh }, RefreshIcon({ size: 14, spin: refreshing }))),
        body,
        usage !== null && usage.fetchedAt > 0 && el('div', { className: 'dm-panel-foot' },
          el('span', null, t('updatedAt', { time: new Date(usage.fetchedAt).toLocaleTimeString() }))))
    }

    function UsageButton(props) {
      const { sessionId, api, providerOf, useMonitor, t } = props
      const storeSnap = useMonitor ? useMonitor(s => s) : { state: null }
      const config = storeSnap.state?.config
      const [open, setOpen] = useState(false)
      const [usage, setUsage] = useState(null)
      const [loading, setLoading] = useState(false)
      const [refreshing, setRefreshing] = useState(false)
      const [error, setError] = useState(null)
      const wrapRef = useRef(null)

      const close = useCallback(() => setOpen(false), [])
      useEffect(() => {
        if (!open) return
        const onDown = e => {
          if (wrapRef.current !== null && !wrapRef.current.contains(e.target)) close()
        }
        document.addEventListener('mousedown', onDown)
        return () => document.removeEventListener('mousedown', onDown)
      }, [open, close])
      useEffect(() => {
        if (!open) return
        let cancelled = false
        setLoading(true)
        const providerId = providerOf(sessionId)
        if (providerId === undefined) {
          setUsage(null); setError(null); setLoading(false)
          return () => { cancelled = true }
        }
        api.getProviderUsage(providerId).then(
          v => { if (!cancelled) { setUsage(v); setError(null) } },
          err => { if (!cancelled) { setUsage(null); setError(err?.message ?? String(err)) } },
        ).finally(() => { if (!cancelled) setLoading(false) })
        return () => { cancelled = true }
      }, [open, sessionId, api, providerOf])

      const doRefresh = () => {
        const providerId = providerOf(sessionId)
        if (providerId === undefined) return
        setRefreshing(true)
        api.refreshProvider(providerId).then(
          v => { setUsage(v); setError(null) },
          err => setError(err?.message ?? String(err)),
        ).finally(() => setRefreshing(false))
      }

      return el('div', { className: 'dm-dock', ref: wrapRef },
        el(Tooltip, { label: t('panelTitle'), side: 'top', delayMs: 500 },
          el('button', {
            type: 'button',
            className: 'dm-icon-btn' + (open ? ' dm-icon-btn-open' : ''),
            'aria-label': t('panelTitle'),
            'aria-expanded': open,
            onClick: () => setOpen(v => !v),
          }, GaugeIcon({ size: 16 }))),
        open && el(UsagePanel, {
          providerId: providerOf(sessionId),
          usage, loading, refreshing, error,
          onRefresh: doRefresh,
          config, t,
        }))
    }

    // ── 会话费用徽章(会话头部) ─────────────────────────────────────────────

    function SessionCost(props) {
      const usage = props.useProjection ? props.useProjection('costUsage') : undefined
      const costStore = props.useMonitor ? props.useMonitor(s => s) : undefined
      const config = costStore?.state?.config
      const cost = usageCost(usage, config)
      const input = billedInput(usage)
      if (!usage || !config || (input + (usage?.output ?? 0)) === 0) return null
      const t = makeT(resolveLocale(config.locale))
      const detail = [
        t('sessionCostTitle'),
        t('sessionDetailTokens', {
          input: formatTokens(usage?.input ?? 0),
          cache: formatTokens((usage?.cacheRead ?? 0) + (usage?.cacheWrite ?? 0)),
          output: formatTokens(usage?.output ?? 0),
        }),
        t('sessionDetailCache', {
          read: formatTokens(usage?.cacheRead ?? 0),
          write: formatTokens(usage?.cacheWrite ?? 0),
        }),
        t('cost', { amount: formatMoneyUsd(cost, config) }),
      ].join('; ')
      return el(Tooltip, { label: detail, side: 'top', delayMs: 500 },
        el('div', { className: 'dm-chip' }, t('cost', { amount: formatMoneyUsd(cost, config) })))
    }

    // ── 设置页:提供方配置 ─────────────────────────────────────────────────

    function ProviderForm(props) {
      const { initial, onSave, onCancel, t } = props
      const [provider, setProvider] = useState(initial?.provider ?? '')
      const [preset, setPreset] = useState(initial?.preset ?? 'custom')
      const [enabled, setEnabled] = useState(initial?.enabled !== false)
      const [refreshMinutes, setRefreshMinutes] = useState(String(initial?.refreshMinutes ?? 15))
      const [apiKey, setApiKey] = useState(initial?.apiKey ?? '')
      const [url, setUrl] = useState(initial?.custom?.url ?? '')
      const [headersText, setHeadersText] = useState(JSON.stringify(initial?.custom?.headers ?? {}, null, 2))
      const [items, setItems] = useState(
        initial?.custom?.items && initial.custom.items.length > 0
          ? initial.custom.items.map(it => ({ ...it, maxPath: it.maxPath ?? '', resetsAtPath: it.resetsAtPath ?? '' }))
          : [{ key: '', label: '', kind: 'percent', path: '', maxPath: '', resetsAtPath: '' }],
      )
      const updateItem = (index, field, value) => {
        setItems(list => list.map((it, i) => (i === index ? { ...it, [field]: value } : it)))
      }
      const tItem = field => t('item' + field[0].toUpperCase() + field.slice(1))
      const submit = () => {
        let headers = {}
        try {
          const parsed = JSON.parse(headersText)
          if (parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)
            && Object.values(parsed).every(v => typeof v === 'string')) headers = parsed
        } catch {
          // 解析失败:保持空对象,由服务端校验兜底。
        }
        const cleanItems = items
          .filter(it => typeof it.path === 'string' && it.path.length > 0)
          .map(it => ({
            key: (it.key || it.path).trim(),
            label: (it.label || it.key || it.path).trim(),
            kind: ['percent', 'number', 'money', 'text'].includes(it.kind) ? it.kind : 'number',
            path: it.path.trim(),
            maxPath: typeof it.maxPath === 'string' && it.maxPath.trim().length > 0 ? it.maxPath.trim() : (typeof it.maxPath === 'number' ? it.maxPath : null),
            resetsAtPath: typeof it.resetsAtPath === 'string' && it.resetsAtPath.trim().length > 0 ? it.resetsAtPath.trim() : null,
          }))
        onSave({
          provider: provider.trim(),
          preset,
          enabled,
          refreshMinutes: Math.max(1, Math.min(1440, Number(refreshMinutes) || 15)),
          apiKey: apiKey.trim(),
          custom: preset === 'custom' ? { url: url.trim(), headers, items: cleanItems } : undefined,
        })
      }
      const field = (label, control) => el('div', { className: 'dm-field' }, el('label', null, label), control)
      return el('div', { className: 'dm-provider-card' },
        el('div', { className: 'dm-grid2' },
          field(t('providerId'), el('input', {
            className: 'dm-input', type: 'text',
            value: provider,
            placeholder: t('providerIdPlaceholder'),
            disabled: initial !== null,
            onChange: e => setProvider(e.target.value),
          })),
          field(t('refreshMinutes'), el('input', {
            className: 'dm-input', type: 'number', min: '1', max: '1440',
            value: refreshMinutes,
            onChange: e => setRefreshMinutes(e.target.value),
          }))),
        el('div', { className: 'dm-field' },
          el('label', null, t('itemKind')),
          el('select', { className: 'dm-input', value: preset, onChange: e => setPreset(e.target.value) },
            el('option', { value: 'deepseek' }, t('presetDeepseek')),
            el('option', { value: 'opencode' }, t('presetOpencode')),
            el('option', { value: 'custom' }, t('presetCustom')))),
        el('label', { className: 'dm-switch', style: { display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12 } },
          el('input', { type: 'checkbox', checked: enabled, onChange: e => setEnabled(e.target.checked) }), t('enabled')),
        preset === 'deepseek' && el('p', { className: 'dm-note' }, t('deepseekHint')),
        preset === 'opencode' && el('div', { className: 'dm-field' },
          field(t('apiKey'), el('input', {
            className: 'dm-input', type: 'password',
            value: apiKey,
            placeholder: t('apiKeyPlaceholder'),
            onChange: e => setApiKey(e.target.value),
          })),
          el('p', { className: 'dm-note' }, t('opencodeHint'))),
        preset === 'custom' && el('div', { className: 'dm-field', style: { gap: 8 } },
          field(t('customUrl'), el('input', { className: 'dm-input', type: 'text', value: url, onChange: e => setUrl(e.target.value) })),
          field(t('customHeaders'), el('textarea', { className: 'dm-textarea', value: headersText, onChange: e => setHeadersText(e.target.value) })),
          el('label', null, t('customItems')),
          items.map((it, i) => el('div', { key: i, className: 'dm-provider-card', style: { padding: 8 } },
            el('div', { className: 'dm-grid3' },
              field(tItem('key'), el('input', { className: 'dm-input narrow', type: 'text', value: it.key, onChange: e => updateItem(i, 'key', e.target.value) })),
              field(tItem('label'), el('input', { className: 'dm-input narrow', type: 'text', value: it.label, onChange: e => updateItem(i, 'label', e.target.value) })),
              field(tItem('kind'), el('select', { className: 'dm-input', value: it.kind, onChange: e => updateItem(i, 'kind', e.target.value) },
                el('option', { value: 'percent' }, t('kindPercent')),
                el('option', { value: 'number' }, t('kindNumber')),
                el('option', { value: 'money' }, t('kindMoney')),
                el('option', { value: 'text' }, t('kindText'))))),
            el('div', { className: 'dm-grid2', style: { marginTop: 6 } },
              field(tItem('path'), el('input', { className: 'dm-input narrow', type: 'text', value: it.path, onChange: e => updateItem(i, 'path', e.target.value) })),
              field(tItem('maxPath'), el('input', { className: 'dm-input narrow', type: 'text', value: String(it.maxPath ?? ''), onChange: e => updateItem(i, 'maxPath', e.target.value) }))),
            el('div', { className: 'dm-field', style: { marginTop: 6 } },
              field(tItem('resetsAtPath'), el('input', { className: 'dm-input narrow', type: 'text', value: String(it.resetsAtPath ?? ''), onChange: e => updateItem(i, 'resetsAtPath', e.target.value) }))),
            el('div', { className: 'dm-row-actions', style: { marginTop: 6 } },
              el('button', { type: 'button', className: 'dm-btn danger small', onClick: () => setItems(list => list.filter((_, j) => j !== i)) }, t('remove'))))),
          el('button', { type: 'button', className: 'dm-btn ghost small', onClick: () => setItems(list => [...list, { key: '', label: '', kind: 'percent', path: '', maxPath: '', resetsAtPath: '' }]) }, t('addItem'))),
        el('div', { className: 'dm-row-actions' },
          el('button', { type: 'button', className: 'dm-btn', onClick: submit, disabled: provider.trim().length === 0 || (preset === 'custom' && url.trim().length === 0) }, t('save')),
          el('button', { type: 'button', className: 'dm-btn ghost', onClick: onCancel }, t('cancel'))))
    }

    function ProvidersSection(props) {
      const { config, api, t } = props
      const [adding, setAdding] = useState(false)
      const [editing, setEditing] = useState(null) // providerId | 'new' | null
      const [busy, setBusy] = useState(false)
      const [notice, setNotice] = useState(null) // { kind, text }
      const providerIds = Object.keys(config?.providers ?? {})

      const save = async (draft) => {
        setBusy(true)
        try {
          const providers = { ...(config?.providers ?? {}) }
          if (draft.provider.length === 0) return
          if (editing === 'new' && providers[draft.provider] !== undefined) {
            setNotice({ kind: 'err', text: t('providerSaved', { id: draft.provider }) + ' (exists)' })
            return
          }
          const { provider, ...body } = draft
          if (editing !== 'new') delete providers[provider] // 编辑:先移除旧的再写入(provider id 只读)
          providers[provider] = body
          await api.updateConfig({ providers })
          setNotice({ kind: 'ok', text: t('providersUpdated') })
          setAdding(false); setEditing(null)
        } catch (err) {
          setNotice({ kind: 'err', text: t('saveFailed', { message: err?.message ?? String(err) }) })
        } finally {
          setBusy(false)
        }
      }
      const remove = async (providerId) => {
        setBusy(true)
        try {
          const providers = { ...(config?.providers ?? {}) }
          delete providers[providerId]
          await api.updateConfig({ providers })
          setNotice({ kind: 'ok', text: t('providerRemoved', { id: providerId }) })
        } catch (err) {
          setNotice({ kind: 'err', text: t('saveFailed', { message: err?.message ?? String(err) }) })
        } finally {
          setBusy(false)
        }
      }
      const toggle = async (providerId, enabled) => {
        try {
          const providers = { ...(config?.providers ?? {}) }
          if (providers[providerId] !== undefined) providers[providerId] = { ...providers[providerId], enabled }
          await api.updateConfig({ providers })
        } catch (err) {
          setNotice({ kind: 'err', text: t('saveFailed', { message: err?.message ?? String(err) }) })
        }
      }

      return el('div', null,
        el('div', { className: 'dm-row-actions', style: { justifyContent: 'space-between', marginBottom: 8 } },
          el('strong', null, t('providersTitle')),
          el('button', { type: 'button', className: 'dm-btn ghost small', onClick: () => { setAdding(true); setEditing('new') }, disabled: adding || busy }, t('addProvider'))),
        notice !== null && el('div', { className: 'dm-msg ' + (notice.kind === 'err' ? 'err' : 'off') }, notice.text),
        providerIds.length === 0 && !adding && el('div', { className: 'dm-empty' }, t('noProviders')),
        providerIds.map(providerId => {
          const provider = config.providers[providerId]
          const badge = provider.preset === 'deepseek' ? t('presetDeepseek') : provider.preset === 'opencode' ? t('presetOpencode') : t('presetCustom')
          if (editing === providerId) {
            return el(ProviderForm, {
              key: providerId, initial: { ...provider, provider: providerId }, onSave: save, onCancel: () => setEditing(null), t,
            })
          }
          return el('div', { key: providerId, className: 'dm-provider-card' },
            el('div', { className: 'dm-row-actions', style: { justifyContent: 'space-between' } },
              el('div', { className: 'dm-panel-title', title: providerId }, providerId, ' ', el('span', { className: 'dm-preset' }, badge)),
              el('div', { className: 'dm-row-actions' },
                el('label', { className: 'dm-switch', title: t('enabled') },
                  el('input', { type: 'checkbox', checked: provider.enabled !== false, onChange: e => toggle(providerId, e.target.checked) })),
                el('button', { type: 'button', className: 'dm-btn ghost small', onClick: () => setEditing(providerId), disabled: busy }, t('edit')),
                el('button', { type: 'button', className: 'dm-btn danger small', onClick: () => remove(providerId), disabled: busy }, t('remove'))))),
            el('div', { className: 'dm-note' },
              t('refreshMinutes') + ': ' + String(provider.refreshMinutes ?? 15)
              + (provider.preset === 'opencode' && provider.apiKey ? ' · ' + t('apiKey') + ': ****' : '')
              + (provider.preset === 'custom' && provider.custom?.url ? ' · ' + provider.custom.url : ''))
        }),
        adding && editing === 'new' && el(ProviderForm, { key: '__new', initial: null, onSave: save, onCancel: () => { setAdding(false); setEditing(null) }, t }))
    }

    // ── 设置页:计费价格 + 官方同步 ─────────────────────────────────────────

    function PricesSection(props) {
      const { config, api, t } = props
      const [draft, setDraft] = useState(() => ({
        models: Object.fromEntries(Object.entries(config?.prices?.models ?? {}).map(([id, p]) => [id, { ...p }])),
        default: { ...(config?.prices?.default ?? { cacheHit: 0, cacheMiss: 0, output: 0 }) },
      }))
      const [newModel, setNewModel] = useState('')
      const [busy, setBusy] = useState(false)
      const [notice, setNotice] = useState(null)
      const [syncing, setSyncing] = useState(false)

      // 官方同步后按新价格表重建草稿(仅在 fetchedAt 变化时,避免覆盖用户编辑)。
      useEffect(() => {
        setDraft({
          models: Object.fromEntries(Object.entries(config?.prices?.models ?? {}).map(([id, p]) => [id, { ...p }])),
          default: { ...(config?.prices?.default ?? { cacheHit: 0, cacheMiss: 0, output: 0 }) },
        })
        // 仅依赖 fetchedAt:用户编辑期间配置刷新不会清空草稿。
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [config?.fetchedAt])

      const setTier = (modelId, field, value) => {
        const num = Number(value)
        const next = Number.isFinite(num) && num >= 0 ? num : 0
        setDraft(d => ({
          ...d,
          models: { ...d.models, [modelId]: { ...(d.models[modelId] ?? {}), [field]: next } },
        }))
      }
      const addModel = () => {
        const id = newModel.trim().toLowerCase()
        if (id.length === 0 || draft.models[id] !== undefined) return
        setDraft(d => ({ ...d, models: { ...d.models, [id]: { cacheHit: 0, cacheMiss: 0, output: 0 } } }))
        setNewModel('')
      }
      const removeModel = (modelId) => {
        const models = { ...draft.models }
        delete models[modelId]
        setDraft(d => ({ ...d, models }))
      }
      const save = async () => {
        setBusy(true)
        try {
          await api.updateConfig({ prices: { models: draft.models, default: draft.default } })
          setNotice({ kind: 'ok', text: t('saved') })
        } catch (err) {
          setNotice({ kind: 'err', text: t('saveFailed', { message: err?.message ?? String(err) }) })
        } finally {
          setBusy(false)
        }
      }
      const sync = async () => {
        setSyncing(true)
        try {
          await api.fetchPrices()
          setNotice({ kind: 'ok', text: t('saved') })
        } catch (err) {
          setNotice({ kind: 'err', text: t('syncFailed', { message: err?.message ?? String(err) }) })
        } finally {
          setSyncing(false)
        }
      }
      const tierText = (tier) => {
        if (tier === undefined) return '—'
        const n = v => formatPlain(v, 4)
        return 'H ' + n(tier.cacheHit) + ' / M ' + n(tier.cacheMiss) + ' / O ' + n(tier.output)
      }
      const now = config?.fetchedAt !== null && config?.fetchedAt !== undefined ? new Date(config.fetchedAt).toLocaleString() : t('neverSynced')
      const source = config?.priceSource === 'official' ? t('sourceOfficial') : t('sourceBundled')

      return el('div', null,
        el('div', { className: 'dm-row-actions', style: { justifyContent: 'space-between', marginBottom: 8 } },
          el('strong', null, t('pricesTitle')),
          el('button', { type: 'button', className: 'dm-btn ghost small', onClick: sync, disabled: syncing }, t('syncFromDocs'))),
        notice !== null && el('div', { className: 'dm-msg ' + (notice.kind === 'err' ? 'err' : 'off') }, notice.text),
        el('p', { className: 'dm-note' }, t('lastSync', { time: now, source })),
        el('p', { className: 'dm-note' }, t('peakNotice')),
        el('div', { className: 'dm-grid2' },
          Object.keys(draft.models).map(modelId => {
            const model = draft.models[modelId]
            return el('div', { key: modelId, className: 'dm-price-card' },
              el('p', { className: 'dm-price-name' }, modelId, model.legacy === true && el('span', { className: 'dm-price-legacy' }, t('legacy')),
                el('button', { type: 'button', className: 'dm-btn danger small', style: { marginLeft: 'auto' }, onClick: () => removeModel(modelId) }, t('remove'))),
              el('div', { className: 'dm-grid3' },
                el('div', { className: 'dm-field' }, el('label', null, t('cacheHit')), el('input', { className: 'dm-input narrow', type: 'number', step: '0.000001', min: '0', value: String(model.cacheHit ?? 0), onChange: e => setTier(modelId, 'cacheHit', e.target.value) })),
                el('div', { className: 'dm-field' }, el('label', null, t('cacheMiss')), el('input', { className: 'dm-input narrow', type: 'number', step: '0.000001', min: '0', value: String(model.cacheMiss ?? 0), onChange: e => setTier(modelId, 'cacheMiss', e.target.value) })),
                el('div', { className: 'dm-field' }, el('label', null, t('output')), el('input', { className: 'dm-input narrow', type: 'number', step: '0.000001', min: '0', value: String(model.output ?? 0), onChange: e => setTier(modelId, 'output', e.target.value) }))),
              el('div', { className: 'dm-tier' },
                t('offPeak') + ': ' + tierText(model.offPeak)
                + ' · ' + t('peak') + ': ' + tierText(model.peak)
                + ' · ' + t('legacyBase') + ': ' + tierText(model.legacyBase)))
          })),
        el('div', { className: 'dm-price-card' },
          el('p', { className: 'dm-price-name' }, t('defaultModel')),
          el('div', { className: 'dm-grid3' },
            el('div', { className: 'dm-field' }, el('label', null, t('cacheHit')), el('input', { className: 'dm-input narrow', type: 'number', step: '0.000001', min: '0', value: String(draft.default?.cacheHit ?? 0), onChange: e => setDraft(d => ({ ...d, default: { ...d.default, cacheHit: Math.max(0, Number(e.target.value) || 0) } })) })),
            el('div', { className: 'dm-field' }, el('label', null, t('cacheMiss')), el('input', { className: 'dm-input narrow', type: 'number', step: '0.000001', min: '0', value: String(draft.default?.cacheMiss ?? 0), onChange: e => setDraft(d => ({ ...d, default: { ...d.default, cacheMiss: Math.max(0, Number(e.target.value) || 0) } })) })),
            el('div', { className: 'dm-field' }, el('label', null, t('output')), el('input', { className: 'dm-input narrow', type: 'number', step: '0.000001', min: '0', value: String(draft.default?.output ?? 0), onChange: e => setDraft(d => ({ ...d, default: { ...d.default, output: Math.max(0, Number(e.target.value) || 0) } })) })))),
        el('div', { className: 'dm-row-actions', style: { marginTop: 8 } },
          el('input', { className: 'dm-input narrow', type: 'text', placeholder: t('newModelPlaceholder'), value: newModel, onChange: e => setNewModel(e.target.value), style: { maxWidth: 220 } }),
          el('button', { type: 'button', className: 'dm-btn ghost small', onClick: addModel, disabled: newModel.trim().length === 0 }, t('addModel')),
          el('button', { type: 'button', className: 'dm-btn', onClick: save, disabled: busy }, t('save'))))
    }

    function SettingsSection(props) {
      const { useMonitor, api, t } = props
      console.log('[dsh-monitor] SettingsSection: useMonitor =', typeof useMonitor, '| props keys =', Object.keys(props).join(','))
      const state = useMonitor ? useMonitor(s => s).state : null
      const config = state?.config
      const status = state?.status
      if (config === null || config === undefined) {
        return el('div', { className: 'dm-section' },
          el('div', { className: 'dm-empty' }, status === 'error' ? (state?.error ?? '') : t('loading')))
      }
      return el('div', { className: 'dm-section' },
        el(ProvidersSection, { config, api, t }),
        el(PricesSection, { config, api, t }))
    }

    // ── 插件主体 ────────────────────────────────────────────────────────────

    const inject = ['remote']

    async function apply(ctx) {
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
      const reload = async () => {
        if (reloading) return // 并发防抖:轮询/手动刷新/重连不叠加 getConfig,避免乱序覆盖
        reloading = true
        const prev = store.getSnapshot()
        const started = Date.now()
        console.log('[dsh-monitor] reload: getConfig start')
        try {
          const config = await call('getConfig')
          console.log('[dsh-monitor] reload: getConfig ok after', Date.now() - started, 'ms, keys =', config ? Object.keys(config).join(',') : 'null')
          store.set({ status: 'ready', error: null, config })
        } catch (error) {
          console.error('[dsh-monitor] reload: getConfig failed after', Date.now() - started, 'ms —', error?.message ?? String(error))
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

      // ── 诊断(排查"设置页一直加载中");定位后可移除 ─────────────────────────
      console.log('[dsh-monitor] apply: remote.monitor =', monitor === undefined ? 'undefined' : 'ok')
      void reload()

      const slots = ctx.get('slots')
      if (slots === undefined) return
      console.log('[dsh-monitor] apply: slots ok, 注册图标/角标/设置页')

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
      const injected = () => ({ api, providerOf, t: tOf(), hooks: { monitor: store } })

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

    exports.apply = apply
    exports.inject = inject
    return module.exports
  },
})