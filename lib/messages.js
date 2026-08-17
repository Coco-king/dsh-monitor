/**
 * dsh-monitor 宿主端多语言(zh/en):服务端用户可见文案 + 取词/语言解析。
 * 与客户端 lib/client-src/i18n.js 分开维护(客户端另有浏览器语言探测)。
 */

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
    pricesSynced: '已从官方文档同步 {ids} 的价格(USD 与 CNY)',
    pricesSyncedPartial: '已同步 {currencies} 价格:{ids}(另一币种页暂时不可用)',
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
    pricesSynced: 'Synced prices for {ids} from the official docs (USD & CNY)',
    pricesSyncedPartial: 'Synced {currencies} prices: {ids} (the other currency page is temporarily unavailable)',
    priceSyncFailed: 'Official price sync failed: {error}',
  },
}

/** 取服务端文案(zh/en),支持 {var} 插值。 */
export function tmsg(locale, code, vars) {
  const dict = locale === 'en' ? SERVER_MESSAGES.en : SERVER_MESSAGES.zh
  let text = dict[code] ?? code
  if (vars) for (const key of Object.keys(vars)) text = text.split(`{${key}}`).join(String(vars[key]))
  return text
}

/** 从配置解析消息语言:'en' → en;auto/zh → zh(服务端无法探测浏览器)。 */
export function localeOf(config) {
  return config?.locale === 'en' ? 'en' : 'zh'
}