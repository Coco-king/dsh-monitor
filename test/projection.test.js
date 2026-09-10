import { test } from 'node:test'
import assert from 'node:assert/strict'
import { makeCostUsageProjection } from '../lib/projection.js'
import { DEFAULT_PRICE_TABLE, DEFAULT_PRICE_TABLE_CNY } from '../lib/pricing.js'

/** 最小账本:zh 语言 → CNY 价表,关闭峰谷(只用基础价,便于断言)。 */
function ledgerWith(over = {}) {
  return {
    config: {
      locale: 'zh',
      peakEnabled: false,
      prices: { cny: DEFAULT_PRICE_TABLE_CNY, usd: DEFAULT_PRICE_TABLE },
      ...over,
    },
  }
}

function headerEvent(model) {
  return { type: 'request/header', time: Date.now(), data: { header: { config: { model } } } }
}

function usageEvent(turn, step, usage, time = 1_800_000_000_000) {
  return { type: 'assistant/chunk', time, data: { turn, step, chunk: { type: 'usage', usage } } }
}

/** deepseek-v4-flash CNY 基础价:(input×1.5 + output×4.5 + 缓存×0.05)/1e6。 */
function expectedCost(b) {
  return (b.input * 1.5 + b.output * 4.5 + (b.cacheRead + b.cacheWrite) * 0.05) / 1_000_000
}

test('costUsage 投影:注册契约为宿主 0.1.5 的 stateSchema + wire(回归:旧顶层 schema/view 会被忽略)', () => {
  const def = makeCostUsageProjection(ledgerWith())
  assert.equal(def.key, 'costUsage')
  // 新契约必填:stateSchema 校验持久化状态;缺 wire 的投影不随快照/推送帧下发。
  assert.ok(def.stateSchema !== undefined, '缺少 stateSchema:状态无法从检查点恢复')
  assert.ok(def.wire !== undefined, '缺少 wire:客户端永远收不到 costUsage,会话角标不显示')
  assert.ok(def.wire.viewSchema !== undefined, '缺少 wire.viewSchema')
  assert.equal(typeof def.wire.view, 'function')
  assert.equal(typeof def.init, 'function')
  assert.equal(typeof def.apply, 'function')
  assert.ok(Number.isSafeInteger(def.stateVersion) && def.stateVersion >= 0)

  // init 状态必须能通过 stateSchema 校验(检查点回读的前提)。
  const init = def.init()
  assert.deepEqual(def.stateSchema.parse(init), init)
})

test('costUsage 投影:usage 事件累计并按模型拆桶,视图与状态一致', () => {
  const def = makeCostUsageProjection(ledgerWith())
  let state = def.init()
  state = def.apply(state, headerEvent('deepseek-v4-flash'))
  state = def.apply(state, usageEvent(1, 0, { inputTokens: 1000, outputTokens: 100, cacheReadTokens: 500, cacheWriteTokens: 200 }))

  const view = def.wire.viewSchema.parse(def.wire.view(state))
  assert.equal(view.input, 1000)
  assert.equal(view.output, 100)
  assert.equal(view.cacheRead, 500)
  assert.equal(view.cacheWrite, 200)
  assert.equal(view.byModel['deepseek-v4-flash'].input, 1000)
  // 基础价逐次计费(zh → CNY 表)。
  assert.ok(Math.abs(view.cost - expectedCost({ input: 1000, output: 100, cacheRead: 500, cacheWrite: 200 })) < 1e-12, `成本 ${view.cost}`)
  // 状态本身也必须能过 stateSchema(检查点行回读)。
  def.stateSchema.parse(state)
})

test('costUsage 投影:同一 (turn, step) 流式样本替换而非累加', () => {
  const def = makeCostUsageProjection(ledgerWith())
  let state = def.init()
  state = def.apply(state, headerEvent('deepseek-v4-flash'))
  const first = { inputTokens: 600, outputTokens: 40, cacheReadTokens: 300, cacheWriteTokens: 0 }
  const final = { inputTokens: 900, outputTokens: 80, cacheReadTokens: 500, cacheWriteTokens: 0 }
  state = def.apply(state, usageEvent(1, 0, first))
  state = def.apply(state, usageEvent(1, 0, final)) // 同 key:最终样本替掉流式样本
  const view = def.wire.viewSchema.parse(def.wire.view(state))
  assert.equal(view.input, 900)
  assert.equal(view.output, 80)
  assert.equal(view.cacheRead, 500)
  assert.ok(Math.abs(view.cost - expectedCost({ input: 900, output: 80, cacheRead: 500, cacheWrite: 0 })) < 1e-12)
})

test('costUsage 投影:无关事件原样返回状态引用(零下游工作)', () => {
  const def = makeCostUsageProjection(ledgerWith())
  const state = def.init()
  assert.equal(def.apply(state, { type: 'unrelated', time: 1 }), state)
})

test('costUsage 投影:模型切换后新模型独立计费', () => {
  const def = makeCostUsageProjection(ledgerWith())
  let state = def.init()
  state = def.apply(state, headerEvent('deepseek-v4-flash'))
  state = def.apply(state, usageEvent(1, 0, { inputTokens: 1000, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0 }))
  state = def.apply(state, headerEvent('deepseek-v4-pro'))
  state = def.apply(state, usageEvent(2, 0, { inputTokens: 2000, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0 }))
  const view = def.wire.viewSchema.parse(def.wire.view(state))
  assert.equal(view.byModel['deepseek-v4-flash'].input, 1000)
  assert.equal(view.byModel['deepseek-v4-pro'].input, 2000)
  // pro 基础价 CNY:input 4.5/M。
  assert.ok(Math.abs(view.cost - (1000 * 1.5 + 2000 * 4.5) / 1_000_000) < 1e-12, `成本 ${view.cost}`)
})