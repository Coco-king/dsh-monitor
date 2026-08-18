/**
 * dsh-monitor 会话折叠:把 DSH 会话日志事件折叠成按「会话 × 天 × 提供方 × 模型」
 * 的 token 用量状态(纯函数,不触碰 SQLite/宿主管道,可独立单测)。
 *
 * 事实源是 DSH 持久化会话日志(经 `sessionPersistence.readFrom` 读出事件尾部),
 * 本模块只做「事件 → 状态」的纯折叠;SQLite 落盘与增量 checkpoint 在 store.js。
 *
 * 折叠语义(与 @deepseek-ai/dsh-token-meter 的 tokenUsage 投影一致,并补上
 * token-ledger 的 route 归因经验):
 *  - 用量样本两处都收:`assistant/chunk`(chunk.type === 'usage')与
 *    `assistant/message`(data.usage)。只收 message 会漏掉「报了 usage 但流随后
 *    失败、没有产生 assistant/message」的调用——提供方仍会计费,漏记就是低估。
 *  - 同一 (turn, step) 重复样本是**替换**而非累加。usage chunk 先报一版,
 *    assistant/message 再报终版;迟到的样本要减掉先前那次再计入新值,否则同一
 *    步的用量被计两次。
 *  - 归因取事件自带的提供方/模型:`assistant/message` 用 `data.message.source`
 *    (ModelMessageSource 带 provider/model);usage chunk 不带归属,回退到最近的
 *    `request/header` 的 `data.header.config`;仍归不上则落显式 `unknown` 桶,
 *    绝不猜成别的路线。
 *  - 按事件时刻归入本地日历日(localDayKey),同日同会话切模型 → 一行一模型。
 */

/** 未归因到提供方/模型时的占位(显式可见,不被猜成任何具体路线)。 */
export const UNKNOWN = 'unknown'

/** 空桶(与账本行字段一一对应;requests = 调用次数,cost 按事件时刻计)。 */
export function zeroBuckets() {
  return { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, requests: 0, cost: 0 }
}

/** 归一化非有限/负数 token 为 0(防止污染聚合)。 */
function num(value) {
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? n : 0
}

/**
 * 从一次用量的 provider 报告取桶。
 * @param usage - TokenUsage(inputTokens/outputTokens/cache*可选)。
 */
export function bucketsOf(usage) {
  return {
    input: num(usage?.inputTokens),
    output: num(usage?.outputTokens),
    cacheRead: num(usage?.cacheReadTokens),
    cacheWrite: num(usage?.cacheWriteTokens),
    requests: 1,
    cost: 0, // 由调用方按事件时刻计费后回填
  }
}

/** 提取事件携带的用量样本与 (turn, step) 键;无样本返回 undefined。 */
function sampleOf(event) {
  if (event?.type === 'assistant/chunk' && event.data?.chunk?.type === 'usage') {
    return { key: `${event.data.turn}:${event.data.step}`, usage: event.data.chunk.usage }
  }
  if (event?.type === 'assistant/message' && event.data?.usage !== undefined) {
    return { key: `${event.data.turn}:${event.data.step}`, usage: event.data.usage }
  }
  return undefined
}

/**
 * 事件自带的提供方/模型;都没有返回 undefined。
 * `assistant/message` 从 message.source 取名;`request/header` 从 config。
 */
function provenanceOf(event) {
  const source = event?.data?.message?.source
  if (source !== undefined && typeof source.model === 'string' && source.model.length > 0) {
    return {
      provider: typeof source.provider === 'string' && source.provider.length > 0 ? source.provider : UNKNOWN,
      model: source.model,
    }
  }
  const config = event?.data?.header?.config
  if (config !== undefined && typeof config.model === 'string' && config.model.length > 0) {
    return {
      provider: typeof config.provider === 'string' && config.provider.length > 0 ? config.provider : UNKNOWN,
      model: config.model,
    }
  }
  return undefined
}

/**
 * 空的会话折叠状态。
 * - days: Map<本地日期, { totals, routes: Map<'provider\u0000model', buckets> }>
 * - lastSample/currentRoute 跨 fold 分片保留,使增量续扫保持替换语义与路线归因。
 */
export function createUsageState() {
  return { days: new Map(), lastSample: null, lastRoute: null, lastUsageAt: undefined, consumedSeq: -1 }
}

function entryOf(byDay, day) {
  let entry = byDay.get(day)
  if (entry === undefined) {
    entry = { totals: zeroBuckets(), routes: new Map() }
    byDay.set(day, entry)
  }
  return entry
}

function routeKey(provider, model) {
  return `${provider}\u0000${model}`
}

function parseRouteKey(key) {
  const [provider, model] = key.split('\u0000')
  return { provider, model }
}

function addInto(target, source) {
  target.input += source.input
  target.output += source.output
  target.cacheRead += source.cacheRead
  target.cacheWrite += source.cacheWrite
  target.requests += source.requests
  target.cost += source.cost
  return target
}

function subtractFrom(target, source) {
  target.input -= source.input
  target.output -= source.output
  target.cacheRead -= source.cacheRead
  target.cacheWrite -= source.cacheWrite
  target.requests -= source.requests
  target.cost -= source.cost
  return target
}

function routeBucketOf(entry, key) {
  let bucket = entry.routes.get(key)
  if (bucket === undefined) {
    bucket = zeroBuckets()
    entry.routes.set(key, bucket)
  }
  return bucket
}

/**
 * 把一个会话新的事件片段折进状态(就地修改)。
 *
 * @param state - 会话折叠状态(跨分片增量的会话状态)。
 * @param events - 按 seq 递增的新事件,起点在 state.consumedSeq 之后。
 * @param options - { bill: (buckets, atMs, provider, model) => cost } 计费函数。
 *   由调用方注入价格表与峰谷配置(不在此处依赖定价,便于纯函数单测)。
 */
export function applyUsageDelta(state, events, options = {}) {
  const bill = typeof options.bill === 'function' ? options.bill : () => 0
  let last = state.lastSample
  let lastRoute = state.lastRoute

  for (const event of events ?? []) {
    if (typeof event?.seq === 'number' && event.seq > state.consumedSeq) state.consumedSeq = event.seq

    if (event?.type === 'request/header') {
      const provenance = provenanceOf(event)
      if (provenance !== undefined) lastRoute = provenance
    }

    const sample = sampleOf(event)
    if (sample === undefined) continue
    const atMs = Number(event?.time)
    if (Number.isFinite(atMs) && atMs > 0) state.lastUsageAt = Math.max(state.lastUsageAt ?? -Infinity, atMs)

    const route = provenanceOf(event) ?? lastRoute ?? { provider: UNKNOWN, model: UNKNOWN }
    const buckets = bucketsOf(sample.usage)
    buckets.cost = bill({ buckets, atMs, provider: route.provider, model: route.model })
    const key = routeKey(route.provider, route.model)

    const day = Number.isFinite(atMs) && atMs > 0 ? dayOf(atMs) : dayOf(Date.now())
    if (last !== null && last.key === sample.key) {
      // 同 (turn, step) 重报:从先前归属的天/路线里撤销,再计入新样本。
      const previous = state.days.get(last.day)
      if (previous !== undefined) {
        subtractFrom(previous.totals, last.buckets)
        const previousRoute = previous.routes.get(last.route)
        if (previousRoute !== undefined) subtractFrom(previousRoute, last.buckets)
      }
    }

    const entry = entryOf(state.days, day)
    addInto(entry.totals, buckets)
    addInto(routeBucketOf(entry, key), buckets)

    last = { key: sample.key, day, route: key, buckets }
  }

  state.lastSample = last
  state.lastRoute = lastRoute
  return state
}

/** 本地日历日(与账本 localDayKey 同口径):YYYY-MM-DD。 */
function dayOf(ms) {
  const d = new Date(ms)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** 折叠整个会话的完整事件清单(从头或从某 seq 起)为状态。 */
export function foldEvents(events, options = {}) {
  return applyUsageDelta(createUsageState(), events, options)
}

/**
 * 把会话状态展开成按 (provider, model) 的用量行。
 * @param state - 折叠后的会话状态。
 * @returns [{ provider, model, input, output, cacheRead, cacheWrite, requests, cost, day }]
 *   全零路由行会被丢弃。
 */
export function flattenState(state) {
  const rows = []
  for (const [day, entry] of state.days) {
    for (const [key, buckets] of entry.routes) {
      if (buckets.input === 0 && buckets.output === 0 && buckets.cacheRead === 0
        && buckets.cacheWrite === 0 && buckets.requests === 0) continue
      const { provider, model } = parseRouteKey(key)
      rows.push({ provider, model, day, ...{ ...buckets } })
    }
  }
  return rows
}
