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
    notConfiguredHint: '该提供方尚未配置用量查询。请到 设置→模型，在该提供方条目上点击编辑按钮旁的用量图标配置。',
    noUsageItems: '暂无用数据。',
    resetsAt: '重置时间 {time}',
    updatedAt: '更新于 {time}',
    loading: '加载中…',
    // 会话费用徽章
    sessionCostTitle: '本会话费用（按每次调用实际时刻精确计费）',
    sessionDetailTokens: '输入 {input} · 缓存 {cache} · 输出 {output}',
    sessionDetailCache: '缓存：读 {read} · 写 {write}（写入按命中价计费）',
    cost: '费用 {amount}',
    // 设置页:提供方绑定用量查询(入口在 设置→模型 每行图标) 
    sectionLabel: '计费',
    bindingTitle: '配置用量查询',
    bindingDesc: '为该提供方绑定一条用量查询配置；保存会覆盖该提供方此前的配置。',
    bindSaveNote: '已保存',
    bindRemoveNote: '已解除绑定',
    bindRemove: '解除绑定',
    presetChoose: '查询方式',
    presetOptDeepseek: 'DeepSeek 官方（余额）',
    presetOptOpencode: 'OpenCode Go 套餐',
    presetOptCustom: '自定义 HTTP',
    providerId: '提供方 ID',
    providerIdDatalist: '选择已配置的提供方…',
    modelSelectHint: '从 设置→模型 中选择要添加价格的模型（按提供方分组）',
    noModelsLeft: '所有模型均已设置价格',
    modelExists: '该模型已设置价格',
    deepseekHint: '复用 设置→模型 中配置的 DeepSeek API Key，查询官方账户余额。',
    opencodeHint: '查询 OpenCode Go 套餐额度（5小时 / 本周 / 本月）；Key 留空则自动发现（凭据 → 环境变量 → opencode auth.json）。',
    apiKey: 'API Key（可选）',
    apiKeyPlaceholder: '留空 = 自动发现',
    refreshMinutes: '刷新间隔（分钟）',
    enabled: '启用',
    remove: '删除',
    save: '保存',
    cancel: '取消',
    customUrl: '接口 URL',
    customUrlHint: 'GET 请求的完整地址；返回体 JSON 由下方条目的「取值路径」逐条提取。',
    customHeaders: '请求头',
    customHeadersHint: '键值对形式的请求头；键为空的行会被忽略。',
    customHeadersNote: '值支持 {apiKey} 占位符，会被替换为该提供方填写的 API Key。',
    headerKey: '键',
    headerValue: '值',
    addHeader: '添加请求头',
    exampleRolling: '5小时',
    exampleWeekly: '本周',
    exampleMonthly: '本月',
    customIntro: '自定义 = 指定任意 HTTP 用量接口：填 GET 地址和请求头，再用下面的条目从响应 JSON 里取值展示。',
    customItems: '用量条目',
    customItemsExplainTitle: '条目说明与示例',
    customItemsExplain: '每个条目从接口返回的 JSON 里取一个值，在用量面板逐条展示：\n'
      + '① 标识（key）：条目的唯一 id，用于去重更新，建议简短英文，如 weekly；\n'
      + '② 显示名（label）：面板上显示的名字，如「本周」；\n'
      + '③ 数值类型（kind）：percent 直接用百分比画进度条，number 显示数字，money 显示金额，text 显示文本；\n'
      + '④ 取值路径（path）：从响应 JSON 取值的点路径，如 usage.weekly.percent（即 data 的 usage.weekly.percent）；\n'
      + '⑤ 上限（maxPath）：可选，填数字常量或 JSON 路径；填了会自动算百分比 = 值 ÷ 上限 × 100（数值类型 为 百分比 时不用填）；\n'
      + '⑥ 重置时间（resetsAtPath）：可选，指示哪一天重置（如 usage.weekly.resetsAt）。\n'
      + '某一条的路径取不到值时，该条目不显示、不报错（例如 monthly 为 null 时）。',
    viewSample: '查看 OpenCode 接口响应示例（图片）',
    itemField: '条目',
    itemKey: '标识',
    itemKeyHint: '条目的唯一标识，用于更新与去重；建议简短英文，如 weekly。',
    itemLabel: '显示名',
    itemLabelHint: '用量面板上显示的名称，如「5小时」。',
    itemKind: '数值类型',
    itemKindHint: '数值的展示方式：percent 直接用百分比；number 显示数字；money 显示金额；text 显示纯文本。',
    itemPath: '取值路径',
    itemPathHint: '从响应 JSON 取值的点路径，如 usage.weekly.percent（取 data 的 usage.weekly.percent）。',
    itemMaxPath: '上限',
    itemMaxPathHint: '可选：填数字常量（如 1000000）或 JSON 路径（如 usage.limit）；存在时自动计算百分比 = 数值 ÷ 上限 × 100。数值类型 选 百分比 时不用填。',
    itemResetsAtPath: '重置时间',
    itemResetsAtHint: '可选：重置时间在响应中的 JSON 路径，如 usage.weekly.resetsAt；填了会在面板里显示重置时间。',
    addItem: '添加条目',
    kindPercent: '百分比（percent）',
    kindNumber: '数字（number）',
    kindMoney: '金额（money）',
    kindText: '文本（text）',
    saved: '已保存',
    saveFailed: '保存失败：{message}',
    // 设置页:计费价格
    pricesTitle: '计费价格（人民币 / 1M tokens）',
    peakNotice: '空闲 / 高峰为峰谷计价两档；缓存写入按命中价计费。',
    defaultModel: 'default（未匹配模型时回退）',
    addModelTitle: '添加模型',
    addModel: '添加模型',
    modelName: '模型',
    actions: '操作',
    tiersToggle: '峰谷',
    basePrice: '基础价',
    applyBase: '把基础价填入空闲价',
    cacheHit: '命中',
    cacheMiss: '未命中',
    output: '输出',
    offPeak: '空闲',
    peak: '高峰',
    windowsLabel: '时段',
    addWindow: '添加时段',
    windowStart: '开始时间',
    windowEnd: '结束时间',
    syncFromDocs: '从官方文档同步',
    syncFailed: '同步失败：{message}',
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
    notConfiguredHint: 'No usage query configured for this provider. Configure it in Settings → Models: click the usage icon beside the Edit button on this provider\'s row.',
    noUsageItems: 'No usage data yet.',
    resetsAt: 'Resets {time}',
    updatedAt: 'Updated {time}',
    loading: 'Loading…',
    // Session cost badge
    sessionCostTitle: 'Session cost (billed precisely at each call time)',
    sessionDetailTokens: 'Input {input} · Cache {cache} · Output {output}',
    sessionDetailCache: 'Cache: read {read} · write {write} (writes billed at hit price)',
    cost: 'Cost {amount}',
    // Settings: per-provider usage query binding (entry icon on Settings → Models rows)
    sectionLabel: 'Billing',
    bindingTitle: 'Configure usage',
    bindingDesc: 'Bind one usage-query config for this provider; saving overwrites the provider\'s previous config.',
    bindSaveNote: 'Saved',
    bindRemoveNote: 'Binding removed',
    bindRemove: 'Remove binding',
    presetChoose: 'Query type',
    presetOptDeepseek: 'DeepSeek official (balance)',
    presetOptOpencode: 'OpenCode Go plan',
    presetOptCustom: 'Custom HTTP',
    providerId: 'Provider ID',
    providerIdDatalist: 'Pick a provider…',
    modelSelectHint: 'Pick a model from Settings → Models (grouped by provider)',
    noModelsLeft: 'All models already have prices',
    modelExists: 'This model already has a price',
    deepseekHint: 'Reuses the DeepSeek API key configured in Settings → Models and queries the official account balance.',
    opencodeHint: 'Queries the OpenCode Go plan quota (rolling 5h / weekly / monthly). Leave the key empty for auto-discovery (credentials → env → opencode auth.json).',
    apiKey: 'API key (optional)',
    apiKeyPlaceholder: 'Empty = auto-discover',
    refreshMinutes: 'Refresh interval (minutes)',
    enabled: 'Enabled',
    remove: 'Remove',
    save: 'Save',
    cancel: 'Cancel',
    customUrl: 'Endpoint URL',
    customUrlHint: 'Full URL for the GET request; the response JSON is read by the items below via their paths.',
    customHeaders: 'Headers',
    customHeadersHint: 'Request headers as key/value pairs; rows with an empty key are ignored.',
    customHeadersNote: 'Values support the {apiKey} placeholder, replaced by this provider\'s API key.',
    headerKey: 'Key',
    headerValue: 'Value',
    addHeader: 'Add header',
    exampleRolling: '5 hours',
    exampleWeekly: 'This week',
    exampleMonthly: 'This month',
    customIntro: 'Custom = point any HTTP usage endpoint: fill the GET URL and headers, then define items that read values from the response JSON.',
    customItems: 'Usage items',
    customItemsExplainTitle: 'Items: explanation & example',
    customItemsExplain: 'Each item reads one value from the response JSON and shows it in the usage panel:\n'
      + '① Key: unique id for the item (dedupe/update), keep it short and English, e.g. weekly;\n'
      + '② Display name: label shown in the panel, e.g. "This week";\n'
      + '③ Value kind: percent draws a progress bar from the percentage, number shows a plain number, money an amount, text plain text;\n'
      + '④ Path: dot path into the response JSON, e.g. usage.weekly.percent (i.e. data.usage.weekly.percent);\n'
      + '⑤ Max: optional — a number constant or a JSON path; when set, percent = value ÷ max × 100 (leave empty when kind is percent);\n'
      + '⑥ Resets at: optional — the JSON path of the reset time, e.g. usage.weekly.resetsAt.\n'
      + 'An item whose path is missing is simply skipped (e.g. when monthly is null) — no error.',
    viewSample: 'View the OpenCode response example (image)',
    itemField: 'Item',
    itemKey: 'Key',
    itemKeyHint: 'Unique id for this item, used for updates and dedupe; keep it short and English, e.g. weekly.',
    itemLabel: 'Display name',
    itemLabelHint: 'Name shown in the usage panel, e.g. "5 hours".',
    itemKind: 'Value kind',
    itemKindHint: 'How the value is displayed: percent shows it as a percentage, number as a plain number, money as an amount, text as plain text.',
    itemPath: 'Path',
    itemPathHint: 'Dot path into the response JSON, e.g. usage.weekly.percent reads data.usage.weekly.percent.',
    itemMaxPath: 'Max',
    itemMaxPathHint: 'Optional: a number constant (e.g. 1000000) or a JSON path (e.g. usage.limit); when set, percent = value ÷ max × 100. Leave empty when kind is percent.',
    itemResetsAtPath: 'Resets at',
    itemResetsAtHint: 'Optional: JSON path of the reset time, e.g. usage.weekly.resetsAt; the panel shows it when present.',
    addItem: 'Add item',
    kindPercent: 'Percent',
    kindNumber: 'Number',
    kindMoney: 'Money',
    kindText: 'Text',
    saved: 'Saved',
    saveFailed: 'Save failed: {message}',
    // Settings: billing prices
    pricesTitle: 'Billing prices (USD / 1M tokens)',
    peakNotice: 'Off-peak / Peak are the two tiers; cache writes are billed at the cache-hit price.',
    defaultModel: 'default (fallback for unmatched models)',
    addModelTitle: 'Add model',
    addModel: 'Add model',
    modelName: 'Model',
    actions: 'Actions',
    tiersToggle: 'Peak/off-peak',
    basePrice: 'Base price',
    applyBase: 'Copy base price to off-peak',
    cacheHit: 'Hit',
    cacheMiss: 'Miss',
    output: 'Output',
    offPeak: 'Off-peak',
    peak: 'Peak',
    windowsLabel: 'Windows',
    addWindow: 'Add window',
    windowStart: 'Start',
    windowEnd: 'End',
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