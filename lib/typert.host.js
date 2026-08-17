/**
 * dsh-monitor 的 Host 面 Typert 清单(由 typert-loader 自动扫描注册)。
 * 手写清单,结构与 @deepseek-ai/dsh-typert-generator 产物一致:
 * `./typert` 导出 TYPERT,invocations 的 codec 必须是 zod v4 实例。
 */

import { z } from 'zod'

const num = z.number()

const priceTierSchema = z.object({
  cacheHit: num,
  cacheMiss: num,
  output: num,
})

const priceSchema = z.object({
  cacheHit: num,
  cacheMiss: num,
  output: num,
  offPeak: priceTierSchema.optional(),
  peak: priceTierSchema.optional(),
  legacyBase: priceTierSchema.optional(),
  legacy: z.boolean().optional(),
})

const peakWindowSchema = z.object({ start: num, end: num })

const customItemSchema = z.object({
  key: z.string(),
  label: z.string(),
  kind: z.enum(['percent', 'number', 'money', 'text']),
  path: z.string(),
  maxPath: z.union([z.string(), num, z.null()]),
  resetsAtPath: z.union([z.string(), z.null()]),
})

const customSchema = z.object({
  url: z.string(),
  headers: z.record(z.string(), z.string()),
  items: z.array(customItemSchema),
})

const providerSchema = z.object({
  enabled: z.boolean(),
  preset: z.enum(['deepseek', 'opencode', 'custom']),
  refreshMinutes: num,
  apiKey: z.string(),
  custom: customSchema.optional(),
})

const priceTableSchema = z.object({
  models: z.record(z.string(), priceSchema),
  default: priceSchema,
})

const configSchema = z.object({
  locale: z.enum(['auto', 'zh', 'en']),
  decimals: num,
  peakEnabled: z.boolean(),
  peakEffectiveAt: z.string(),
  peakWindows: z.array(peakWindowSchema),
  prices: z.object({
    usd: priceTableSchema,
    cny: priceTableSchema,
  }),
  providers: z.record(z.string(), providerSchema),
  historyDays: num,
  fetchedAt: z.union([z.string(), z.null()]),
  priceSource: z.string(),
})

const usageItemSchema = z.object({
  key: z.string(),
  label: z.string(),
  kind: z.enum(['percent', 'number', 'money', 'text']),
  value: num,
  max: num.optional(),
  percent: num.optional(),
  resetsAt: z.union([z.string(), z.null()]),
})

const providerUsageSchema = z.object({
  provider: z.string(),
  preset: z.enum(['deepseek', 'opencode', 'custom']),
  status: z.enum(['off', 'ok', 'error']),
  fetchedAt: num,
  message: z.string(),
  items: z.array(usageItemSchema),
})

const fetchPricesSchema = z.object({
  ok: z.boolean(),
  message: z.string(),
  config: configSchema.optional(),
})

const catalogProviderSchema = z.object({ id: z.string(), name: z.string() })
const catalogModelSchema = z.object({
  provider: z.string(),
  providerName: z.string(),
  id: z.string(),
  name: z.string(),
})

const catalogSchema = z.object({
  providers: z.array(catalogProviderSchema),
  models: z.array(catalogModelSchema),
})

const _config$codec = { mode: 'strict', typeSymbol: 'dsh-monitor#MonitorConfig', schema: configSchema }
const _usage$codec = { mode: 'strict', typeSymbol: 'dsh-monitor#ProviderUsage', schema: providerUsageSchema }
const _patch$codec = { mode: 'strict', typeSymbol: 'dsh-monitor#ConfigPatch', schema: z.record(z.string(), z.unknown()) }
const _fetch$codec = { mode: 'strict', typeSymbol: 'dsh-monitor#FetchPricesResult', schema: fetchPricesSchema }
const _catalog$codec = { mode: 'strict', typeSymbol: 'dsh-monitor#Catalog', schema: catalogSchema }

export const TYPERT = {
  package: 'dsh-monitor',
  face: 'host',
  schemas: [],
  invocations: [
    {
      id: 'dsh-monitor#monitor/getProviderUsage',
      service: 'monitor',
      namespace: 'monitor',
      method: 'getProviderUsage',
      invocation: { kind: 'direct' },
      parameters: [
        { name: 'providerId', wire: 'providerId', source: 'json', codec: { mode: 'strict', typeSymbol: 'string', schema: z.string() } },
      ],
      result: _usage$codec,
    },
    {
      id: 'dsh-monitor#monitor/refreshProvider',
      service: 'monitor',
      namespace: 'monitor',
      method: 'refreshProvider',
      invocation: { kind: 'direct' },
      parameters: [
        { name: 'providerId', wire: 'providerId', source: 'json', codec: { mode: 'strict', typeSymbol: 'string', schema: z.string() } },
      ],
      result: _usage$codec,
    },
    {
      id: 'dsh-monitor#monitor/getConfig',
      service: 'monitor',
      namespace: 'monitor',
      method: 'getConfig',
      invocation: { kind: 'direct' },
      parameters: [],
      result: _config$codec,
    },
    {
      id: 'dsh-monitor#monitor/updateConfig',
      service: 'monitor',
      namespace: 'monitor',
      method: 'updateConfig',
      invocation: { kind: 'direct' },
      parameters: [
        { name: 'patch', wire: 'patch', source: 'json', codec: _patch$codec },
      ],
      result: _config$codec,
    },
    {
      id: 'dsh-monitor#monitor/listCatalog',
      service: 'monitor',
      namespace: 'monitor',
      method: 'listCatalog',
      invocation: { kind: 'direct' },
      parameters: [],
      result: _catalog$codec,
    },
    {
      id: 'dsh-monitor#monitor/fetchPrices',
      service: 'monitor',
      namespace: 'monitor',
      method: 'fetchPrices',
      invocation: { kind: 'direct' },
      parameters: [],
      result: _fetch$codec,
    },
  ],
  model: {
    services: [
      {
        description: 'dsh-monitor 会话计费与提供方用量服务(ctx.monitor):按提供方查询套餐额度,读取会话费用配置。Session billing and per-provider usage service (ctx.monitor).',
        summary: 'dsh-monitor 计费与用量服务 (dsh-monitor billing & usage service)。',
        tags: [],
        jsDoc: '/** dsh-monitor 会话计费与提供方用量服务(ctx.monitor)。dsh-monitor billing & usage service (ctx.monitor). */',
        key: 'monitor',
        exportName: 'MonitorService',
        members: [
          {
            kind: 'method',
            name: 'getProviderUsage',
            signature: 'getProviderUsage(providerId: string): ProviderUsage',
            summary: '查询指定提供方的配置用量(缓存命中或按需抓取)。Query the configured usage for a provider (cached or fetched on demand).',
            jsDoc: '/**\n * 查询指定提供方的配置用量(缓存命中或按需抓取)。\n * @param providerId - 模型提供方 id。\n * @returns 用量条目与状态。\n * Query the configured usage for a provider (cached or fetched on demand).\n * @param providerId - The model provider id.\n * @returns Usage items and status.\n */',
          },
          {
            kind: 'method',
            name: 'refreshProvider',
            signature: 'refreshProvider(providerId: string): ProviderUsage',
            summary: '强制刷新指定提供方的用量。Force-refresh a provider usage.',
            jsDoc: '/**\n * 强制刷新指定提供方的用量。\n * @param providerId - 模型提供方 id。\n * @returns 刷新后的用量条目与状态。\n * Force-refresh a provider usage.\n * @param providerId - The model provider id.\n * @returns The refreshed usage items and status.\n */',
          },
          {
            kind: 'method',
            name: 'getConfig',
            signature: 'getConfig(): MonitorConfig',
            summary: '读取完整配置(价格表/峰谷/币种/提供方列表)。Read the full config (prices, peak, currency, providers).',
            jsDoc: '/**\n * 读取完整配置。\n * @returns 当前配置。\n * Read the full config.\n * @returns The current config.\n */',
          },
          {
            kind: 'method',
            name: 'updateConfig',
            signature: 'updateConfig(patch: ConfigPatch): MonitorConfig',
            summary: '深合并一份配置补丁并持久化。Deep-merge and persist a config patch.',
            jsDoc: '/**\n * 深合并一份配置补丁并持久化。\n * @param patch - 配置补丁。\n * @returns 更新后的完整配置。\n * Deep-merge and persist a config patch.\n * @param patch - The config patch.\n * @returns The updated full config.\n */',
          },
          {
            kind: 'method',
            name: 'listCatalog',
            signature: 'listCatalog(): Promise<Catalog>',
            summary: '读取设置→模型 的提供方与模型目录(供选择器)。Read the Settings → Models provider/model catalog (for pickers).',
            jsDoc: '/**\n * 读取设置→模型 的提供方与模型目录。\n * @returns 提供方与模型列表。\n * Read the Settings → Models provider/model catalog.\n * @returns Provider and model lists.\n */',
          },
          {
            kind: 'method',
            name: 'fetchPrices',
            signature: 'fetchPrices(): Promise<FetchPricesResult>',
            summary: '抓取官方定价页并应用解析出的价格。Fetch the official pricing page and apply the parsed prices.',
            jsDoc: '/**\n * 抓取官方定价页并应用解析出的价格。\n * @returns 抓取与应用结果。\n * Fetch the official pricing page and apply the parsed prices.\n * @returns The fetch-and-apply result.\n */',
          },
        ],
        types: [],
      },
    ],
    events: [],
    objects: [],
  },
}

export default TYPERT