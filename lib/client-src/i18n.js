/**
 * dsh-monitor 客户端多语言(zh/en):全部界面文案 + 语言解析/取词助手。
 * 与宿主端 lib/messages.js 分开维护(客户端另有浏览器语言探测)。
 */

/** 全部界面文案:zh / en。{var} 为插值占位。 */
export const MESSAGES = {
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
    providersIntro: '按提供方配置用量查询;查询预设(官方余额 / OpenCode 套餐 / 自定义 HTTP)按提供方 ID 自动判定,DeepSeek 官方免配置。',
    addProviderTitle: '添加提供方',
    editProviderTitle: '编辑提供方',
    noProviders: '尚未配置任何提供方。',
    addProvider: '添加提供方',
    providerId: '提供方 ID',
    providerIdPlaceholder: '输入自定义 ID…',
    providerIdDatalist: '选择已配置的提供方…',
    modelSelectHint: '从 设置→模型 中选择要添加价格的模型(按提供方分组)',
    addModelManual: '或手动输入模型 ID(不在目录中时)',
    deepseekHint: '复用 设置→模型 中配置的 DeepSeek API Key,查询官方账户余额。',
    opencodeHint: '查询 OpenCode Go 套餐额度(滚动 5 小时 / 本周 / 本月);Key 留空则自动发现(凭据 → 环境变量 → opencode auth.json)。',
    apiKey: 'API Key(可选)',
    apiKeyPlaceholder: '留空 = 自动发现',
    presetLabel: '查询预设(按提供方自动)',
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
    addModelTitle: '添加模型',
    addModel: '添加模型',
    modelName: '模型',
    actions: '操作',
    tiersLabel: '档位价格(空闲 / 高峰 / 历史基础价)',
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
    // Usage icon/panel
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
    // Session cost badge
    sessionCostTitle: 'Session cost (billed precisely at each call time)',
    sessionDetailTokens: 'Input {input} · Cache {cache} · Output {output}',
    sessionDetailCache: 'Cache: read {read} · write {write} (writes billed at hit price)',
    cost: 'Cost {amount}',
    // Settings: provider usage config
    sectionLabel: 'Usage',
    providersTitle: 'Provider usage config',
    providersIntro: 'Configure usage queries per provider. The query type (official balance / OpenCode plan / custom HTTP) follows the provider ID; DeepSeek official works with no config.',
    addProviderTitle: 'Add provider',
    editProviderTitle: 'Edit provider',
    noProviders: 'No providers configured yet.',
    addProvider: 'Add provider',
    providerId: 'Provider ID',
    providerIdPlaceholder: 'Type a custom ID…',
    providerIdDatalist: 'Pick a provider…',
    modelSelectHint: 'Pick a model from Settings → Models (grouped by provider)',
    addModelManual: 'Or type a model ID manually (if not in the catalog)',
    deepseekHint: 'Reuses the DeepSeek API key configured in Settings → Models and queries the official account balance.',
    opencodeHint: 'Queries the OpenCode Go plan quota (rolling 5h / weekly / monthly). Leave the key empty for auto-discovery (credentials → env → opencode auth.json).',
    apiKey: 'API key (optional)',
    apiKeyPlaceholder: 'Empty = auto-discover',
    presetLabel: 'Query type (auto from provider)',
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
    // Settings: billing prices
    pricesTitle: 'Billing prices (USD / 1M tokens)',
    peakNotice: 'Off-peak / Peak are the two tiers; calls before the effective boundary are billed at the legacy base prices; cache writes are billed at the cache-hit price.',
    defaultModel: 'default (fallback for unmatched models)',
    addModelTitle: 'Add model',
    addModel: 'Add model',
    modelName: 'Model',
    actions: 'Actions',
    tiersLabel: 'Tier pricing (off-peak / peak / legacy base)',
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
export function detectBrowserLocale() {
  const lang = typeof navigator !== 'undefined' && typeof navigator.language === 'string' ? navigator.language : ''
  return lang.toLowerCase().startsWith('zh') ? 'zh' : 'en'
}

/** 解析生效语言:显式 zh/en 直接采用;auto/缺失 → 浏览器探测。 */
export function resolveLocale(configLocale) {
  if (configLocale === 'zh' || configLocale === 'en') return configLocale
  return detectBrowserLocale()
}

/** 构造按当前语言取文案的函数 t(key, vars)。 */
export function makeT(locale) {
  const dict = locale === 'zh' ? MESSAGES.zh : MESSAGES.en
  return (key, vars) => {
    let text = dict[key] ?? MESSAGES.en[key] ?? key
    if (vars) for (const name of Object.keys(vars)) text = text.split('{' + name + '}').join(String(vars[name]))
    return text
  }
}