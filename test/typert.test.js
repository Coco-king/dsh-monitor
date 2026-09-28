import { test } from 'node:test'
import assert from 'node:assert/strict'
import { TYPERT } from '../lib/typert.host.js'

/** 取某方法的 result codec 返回的 zod 实例(宿主 ≥0.1.7 走 create() 工厂)。 */
function resultCodecOf(method) {
  const invocation = TYPERT.invocations.find(i => i.method === method)
  assert.ok(invocation !== undefined, `TYPERT 清单缺少 monitor/${method}`)
  return invocation.result.create()
}

/** 断言一个严格 codec 满足宿主 ≥0.1.7 的契约(create() 工厂,zod 实例由其返回)。 */
function assertStrictCodec(codec, subject) {
  assert.equal(codec.mode, 'strict', `${subject} 必须使用严格 codec`)
  assert.equal(typeof codec.typeSymbol, 'string', `${subject} 缺少 typeSymbol`)
  assert.notEqual(codec.typeSymbol.length, 0, `${subject} 的 typeSymbol 为空`)
  // 宿主用 codec.create() 取 schema;残留的 schema 字段说明清单又回到了旧契约。
  assert.equal(typeof codec.create, 'function', `${subject} 缺少 create() 工厂`)
  assert.equal('schema' in codec, false, `${subject} 仍保留旧的 schema 字段`)
  const schema = codec.create()
  assert.equal(typeof schema.parse, 'function', `${subject} 的 create() 未返回可校验 schema`)
}

/** 完整 totals 对象(usageTotalsSchema 七个字段全必填,与 #numeric 输出同形)。 */
function totals(over = {}) {
  return {
    input: 0, output: 0, cacheRead: 0, cacheWrite: 0, calls: 0, costUsd: 0, costCny: 0,
    ...over,
  }
}

test('TYPERT 清单:所有参数与结果 codec 均满足宿主 create() 契约', () => {
  assert.notEqual(TYPERT.invocations.length, 0, 'TYPERT 清单为空')
  for (const invocation of TYPERT.invocations) {
    for (const parameter of invocation.parameters) {
      assertStrictCodec(parameter.codec, `${invocation.id} 参数 ${parameter.name}`)
    }
    assertStrictCodec(invocation.result, `${invocation.id} 结果`)
  }
})

test('TYPERT 清单:getUsage 结果契约保留 windows.week（四窗全通,不剥离）', () => {
  const schema = resultCodecOf('getUsage')
  const summary = {
    totals: totals({ input: 150 }),
    byDay: [],
    models: [],
    sessions: [],
    byProvider: [],
    byProject: [],
    activity: [],
    activityModels: [],
    windows: {
      today: totals({ input: 100 }),
      week: totals({ input: 120 }),
      month: totals({ input: 150 }),
      all: totals({ input: 150 }),
    },
    timeZone: { offset: '+08:00' },
    lastSweepAt: null,
    diagnostics: { lastUsageAt: null, unattributedRows: 0 },
    providers: [],
  }
  const parsed = schema.parse(summary)
  // zod 对象默认剥离未知键：week 一旦漏进契约就会被静默丢掉，客户端「本周」卡恒 0。
  assert.deepEqual(Object.keys(parsed.windows), ['today', 'week', 'month', 'all'])
  assert.equal(parsed.windows.week.input, 120)
  assert.equal(parsed.windows.week.calls, 0)
})

test('TYPERT 清单:getUsage 查询契约接受 week 范围起点', () => {
  const invocation = TYPERT.invocations.find(i => i.method === 'getUsage')
  const parsed = invocation.parameters[0].codec.create().parse({ range: { start: '2026-08-24' } })
  assert.equal(parsed.range.start, '2026-08-24')
  assert.equal(parsed.range.end, undefined)
})
