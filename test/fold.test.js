import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  applyUsageDelta,
  createUsageState,
  flattenState,
  UNKNOWN,
} from '../lib/fold.js'

/** 构造一条带 provider/model 的 assistant/message 事件。 */
function msg(seq, turn, step, usage, provider, model, iso) {
  return {
    seq, time: Date.parse(iso), type: 'assistant/message',
    data: { turn, step, usage, message: { source: typeof provider === 'string' ? { provider, model } : undefined } },
  }
}

/** 构造一条 usage chunk 事件(无归因)。 */
function chunk(seq, turn, step, usage, iso) {
  return { seq, time: Date.parse(iso), type: 'assistant/chunk', data: { turn, step, chunk: { type: 'usage', usage } } }
}

/** 构造 request/header 事件(设置当前路线)。 */
function header(seq, provider, model, iso) {
  return { seq, time: Date.parse(iso), type: 'request/header', data: { header: { config: { provider, model } } } }
}

function fold(events) {
  const state = createUsageState()
  applyUsageDelta(state, events, {})
  return state
}

test('fold: usage chunk 与 assistant/message 双收,同一步替换语义', () => {
  // 同一步:chunk 先报 200,message 终版 250 → 替换,不重复计。
  const state = fold([
    header(1, 'deepseek-official', 'deepseek-v4-flash', '2026-08-17T06:00:00Z'),
    chunk(2, 1, 0, { inputTokens: 1000, outputTokens: 200 }, '2026-08-17T06:01:00Z'),
    msg(3, 1, 0, { inputTokens: 1000, outputTokens: 250 }, 'deepseek-official', 'deepseek-v4-flash', '2026-08-17T06:02:00Z'),
  ])
  const rows = flattenState(state)
  assert.equal(rows.length, 1)
  assert.equal(rows[0].output, 250)
  assert.equal(rows[0].requests, 1) // 只算一次调用
})

test('fold: 一次真实流失败仍计费(只有 chunk 没有 message)', () => {
  const state = fold([
    header(1, 'deepseek-official', 'deepseek-v4-flash', '2026-08-17T06:00:00Z'),
    chunk(2, 1, 0, { inputTokens: 1000, outputTokens: 200 }, '2026-08-17T06:01:00Z'),
  ])
  const rows = flattenState(state)
  assert.equal(rows.length, 1)
  assert.equal(rows[0].input, 1000)
  assert.equal(rows[0].requests, 1)
})

test('fold: 切模型 → 各模型独立成行', () => {
  const state = fold([
    header(1, 'deepseek-official', 'deepseek-v4-flash', '2026-08-17T06:00:00Z'),
    msg(2, 1, 0, { inputTokens: 1000 }, 'deepseek-official', 'deepseek-v4-flash', '2026-08-17T06:01:00Z'),
    header(3, 'deepseek-official', 'deepseek-v4-pro', '2026-08-17T06:05:00Z'),
    msg(4, 2, 0, { inputTokens: 500 }, 'deepseek-official', 'deepseek-v4-pro', '2026-08-17T06:06:00Z'),
  ])
  const rows = flattenState(state)
  assert.equal(rows.length, 2)
  const flash = rows.find(r => r.model === 'deepseek-v4-flash')
  const pro = rows.find(r => r.model === 'deepseek-v4-pro')
  assert.equal(flash.input, 1000)
  assert.equal(pro.input, 500)
})

test('fold: 无归因落 unknown 桶', () => {
  const state = fold([
    // 没有 header,没有 message.source → unknown。
    chunk(1, 1, 0, { inputTokens: 7 }, '2026-08-17T06:00:00Z'),
  ])
  const rows = flattenState(state)
  assert.equal(rows.length, 1)
  assert.equal(rows[0].provider, UNKNOWN)
  assert.equal(rows[0].model, UNKNOWN)
})

test('fold: request/header 提供归因,usage chunk 继承', () => {
  const state = fold([
    header(1, 'deepseek-official', 'deepseek-v4-pro', '2026-08-17T06:00:00Z'),
    chunk(2, 1, 0, { inputTokens: 7 }, '2026-08-17T06:01:00Z'),
  ])
  const rows = flattenState(state)
  assert.equal(rows.length, 1)
  assert.equal(rows[0].provider, 'deepseek-official')
  assert.equal(rows[0].model, 'deepseek-v4-pro')
})

test('fold: 跨天归日,同一步替换后只留新的一天', () => {
  const state = fold([
    header(1, 'deepseek-official', 'deepseek-v4-flash', '2026-08-17T12:00:00Z'),
    chunk(2, 1, 0, { inputTokens: 1000, outputTokens: 200 }, '2026-08-17T12:01:00Z'),
    msg(3, 1, 0, { inputTokens: 1000, outputTokens: 250, cacheReadTokens: 100 }, 'deepseek-official', 'deepseek-v4-flash', '2026-08-17T23:00:00Z'),
  ])
  const days = [...state.days.keys()]
  // 12:01Z 与 23:00Z 落在本地日历的哪一天取决于跑测试机器的时区,但替换后:
  // 旧天的行被全额扣除 → 该天全零被 flattenState 跳过。
  const rows = flattenState(state)
  assert.equal(rows.length, 1)
  assert.equal(rows[0].output, 250)
  assert.equal(rows[0].cacheRead, 100)
  assert.ok(days.every(day => typeof day === 'string' && day.length === 10))
})

test('fold: 非法 token 归一化为 0', () => {
  const state = fold([
    msg(1, 1, 0, { inputTokens: -5, outputTokens: Number.NaN, cacheReadTokens: 'x' }, 'deepseek-official', 'deepseek-v4-flash', '2026-08-17T06:00:00Z'),
  ])
  const rows = flattenState(state)
  // 全零行不入(requests 也保持 0?不——requests 恒 +1)。归一化后只保留 requests。
  assert.equal(rows.length, 1)
  assert.equal(rows[0].input, 0)
  assert.equal(rows[0].output, 0)
  assert.equal(rows[0].cacheRead, 0)
})

test('fold: cost 由 bill 注入(双币),按桶数值计费', () => {
  // 用假 bill:每令牌照桶数值回 USD / CNY 各一份,验证双币落桶。
  const state = createUsageState()
  applyUsageDelta(state, [
    msg(1, 1, 0, { inputTokens: 3, outputTokens: 4, cacheReadTokens: 5, cacheWriteTokens: 6 }, 'deepseek-official', 'deepseek-v4-flash', '2026-08-17T06:00:00Z'),
  ], { bill: ({ buckets }) => ({
    costUsd: buckets.input + buckets.output,
    costCny: buckets.input + buckets.output + buckets.cacheRead + buckets.cacheWrite,
  }) })
  const rows = flattenState(state)
  assert.equal(rows[0].costUsd, 7)
  assert.equal(rows[0].costCny, 18)
})
