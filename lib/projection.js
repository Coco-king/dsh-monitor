/**
 * dsh-monitor costUsage 会话投影:纯 token 桶 + 按模型拆分,客户端按价表计价。
 * 按事件时刻(event.time)用当时的价格档位逐次计费(峰谷时代前按 legacyBase,
 * 之后按峰谷两档),保证会话徽章历史正确。
 */

import { z } from 'zod'
import { costOf, priceEntryFor } from './pricing.js'

const usageProjectionSchema = z.object({
  input: z.number(),
  output: z.number(),
  cacheRead: z.number(),
  cacheWrite: z.number(),
  cost: z.number(),
  byModel: z.record(z.string(), z.object({
    input: z.number(),
    output: z.number(),
    cacheRead: z.number(),
    cacheWrite: z.number(),
    cost: z.number(),
  })),
})

/**
 * costUsage 会话投影工厂。
 * @param ledger - 账本(读取价格表与峰谷配置)。
 * @returns 可注册到 sessionProjections 的投影对象。
 */
export function makeCostUsageProjection(ledger) {
  const zeroBuckets = () => ({ input: 0, output: 0, cacheRead: 0, cacheWrite: 0, cost: 0 })
  const peakConfig = () => ({
    enabled: ledger.config?.peakEnabled === true,
    effectiveAtMs: Date.parse(ledger.config?.peakEffectiveAt ?? ''),
    windows: ledger.config?.peakWindows,
  })
  return {
    key: 'costUsage',
    schema: usageProjectionSchema,
    stateVersion: 2,
    init: () => ({ model: 'default', totals: zeroBuckets(), byModel: {}, last: null }),
    apply(state, event) {
      if (event.type === 'request/header') {
        const model = event.data?.header?.config?.model
        const next = typeof model === 'string' && model.length > 0 ? model : 'default'
        return next === state.model ? state : { ...state, model: next }
      }
      let usage = null
      let turn = 0
      let step = 0
      if (event.type === 'assistant/chunk' && event.data?.chunk?.type === 'usage' && event.data.chunk.usage !== undefined) {
        usage = event.data.chunk.usage
        turn = event.data.turn
        step = event.data.step
      } else if (event.type === 'assistant/message' && event.data?.usage !== undefined) {
        usage = event.data.usage
        turn = event.data.turn
        step = event.data.step
      } else {
        return state
      }
      const buckets = {
        input: usage.inputTokens ?? 0,
        output: usage.outputTokens ?? 0,
        cacheRead: usage.cacheReadTokens ?? 0,
        cacheWrite: usage.cacheWriteTokens ?? 0,
      }
      const key = `${turn}:${step}`
      const prev = state.last !== null && state.last.key === key ? state.last : null
      if (prev !== null && prev.model === state.model
        && prev.buckets.input === buckets.input && prev.buckets.output === buckets.output
        && prev.buckets.cacheRead === buckets.cacheRead && prev.buckets.cacheWrite === buckets.cacheWrite) {
        return state
      }
      // 按事件时刻计费(历史正确):峰谷时代前用 legacyBase,之后按峰谷两档。
      const atMs = Number.isFinite(Number(event.time)) && Number(event.time) > 0 ? Number(event.time) : Date.now()
      const billed = costOf(buckets, priceEntryFor(state.model, ledger.config?.prices), atMs, peakConfig())
      // 同一 (turn, step) 的最终样本替换流式样本,先减后加,避免重复计数。
      const totals = { ...state.totals }
      const byModel = { ...state.byModel }
      const shift = (model, bucket, cost, sign) => {
        totals.input += sign * bucket.input
        totals.output += sign * bucket.output
        totals.cacheRead += sign * bucket.cacheRead
        totals.cacheWrite += sign * bucket.cacheWrite
        totals.cost += sign * cost
        const current = byModel[model] ?? zeroBuckets()
        byModel[model] = {
          input: current.input + sign * bucket.input,
          output: current.output + sign * bucket.output,
          cacheRead: current.cacheRead + sign * bucket.cacheRead,
          cacheWrite: current.cacheWrite + sign * bucket.cacheWrite,
          cost: current.cost + sign * cost,
        }
      }
      if (prev !== null) shift(prev.model, prev.buckets, prev.cost, -1)
      shift(state.model, buckets, billed, 1)
      return { model: state.model, totals, byModel, last: { key, model: state.model, buckets, cost: billed } }
    },
    view(state) {
      return {
        input: state.totals.input,
        output: state.totals.output,
        cacheRead: state.totals.cacheRead,
        cacheWrite: state.totals.cacheWrite,
        cost: state.totals.cost,
        byModel: state.byModel,
      }
    },
  }
}