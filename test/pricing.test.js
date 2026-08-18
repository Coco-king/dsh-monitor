import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  DEFAULT_PRICE_TABLE,
  DEFAULT_PRICE_TABLE_CNY,
  DEFAULT_PEAK_WINDOWS,
  DEFAULT_PEAK_EFFECTIVE_AT,
  activeCurrency,
  costOf,
  isPeakHour,
  normalizePrice,
  parsePricingHtml,
  priceEntryFor,
  priceTableFor,
  tierFor,
} from '../lib/pricing.js'

const FLASH = DEFAULT_PRICE_TABLE.models['deepseek-v4-flash']
const PRO = DEFAULT_PRICE_TABLE.models['deepseek-v4-pro']
const peak = () => ({
  enabled: true,
  effectiveAtMs: Date.parse(DEFAULT_PEAK_EFFECTIVE_AT),
  windows: DEFAULT_PEAK_WINDOWS,
})

test('tierFor: 峰谷生效前仍按峰段/谷段档位(无历史旧价回算)', () => {
  const atMs = Date.parse('2026-08-01T12:00:00Z') // 早于默认生效时间,但晚于两档方案起点
  const off = tierFor(FLASH, atMs, peak())
  assert.deepEqual({ cacheHit: off.cacheHit, cacheMiss: off.cacheMiss, output: off.output }, FLASH.offPeak)
  const inPeak = tierFor(FLASH, Date.parse('2026-08-17T02:00:00Z'), peak())
  assert.deepEqual({ cacheHit: inPeak.cacheHit, cacheMiss: inPeak.cacheMiss, output: inPeak.output }, FLASH.peak)
})

test('tierFor: 生效后峰段取 peak,谷段取 offPeak', () => {
  const inPeak = tierFor(FLASH, Date.parse('2026-08-17T02:00:00Z'), peak()) // UTC 02 → 窗 [1,4)
  assert.deepEqual({ cacheHit: inPeak.cacheHit, cacheMiss: inPeak.cacheMiss, output: inPeak.output }, FLASH.peak)
  const offPeak = tierFor(FLASH, Date.parse('2026-08-17T12:00:00Z'), peak()) // UTC 12 → 窗外
  assert.deepEqual({ cacheHit: offPeak.cacheHit, cacheMiss: offPeak.cacheMiss, output: offPeak.output }, FLASH.offPeak)
})

test('tierFor: 禁用峰谷时恒取基础档', () => {
  const tier = tierFor(FLASH, Date.parse('2026-08-17T02:00:00Z'), { enabled: false })
  assert.deepEqual({ cacheHit: tier.cacheHit, cacheMiss: tier.cacheMiss, output: tier.output },
    { cacheHit: FLASH.cacheHit, cacheMiss: FLASH.cacheMiss, output: FLASH.output })
})

test('isPeakHour: 窗口边界半开', () => {
  const atMs = ts => Date.parse(ts)
  assert.equal(isPeakHour(atMs('2026-08-17T01:00:00Z'), 0, DEFAULT_PEAK_WINDOWS), true)
  assert.equal(isPeakHour(atMs('2026-08-17T04:00:00Z'), 0, DEFAULT_PEAK_WINDOWS), false)
  assert.equal(isPeakHour(atMs('2026-08-17T06:00:00Z'), 0, DEFAULT_PEAK_WINDOWS), true)
  assert.equal(isPeakHour(atMs('2026-08-17T10:00:00Z'), 0, DEFAULT_PEAK_WINDOWS), false)
  assert.equal(isPeakHour(atMs('2026-08-17T02:00:00Z'), Date.now() + 1e12, DEFAULT_PEAK_WINDOWS), false) // 生效前
})

test('costOf: 1M 输入 + 500K 输出 + 300K 缓存命中,基础档', () => {
  const cost = costOf({ input: 1_000_000, output: 500_000, cacheRead: 200_000, cacheWrite: 100_000 },
    FLASH, Date.parse('2026-08-17T12:00:00Z'), { enabled: false })
  // (1e6*0.22 + 0.5e6*0.66 + 0.3e6*0.007)/1e6
  assert.ok(Math.abs(cost - 0.5521) < 1e-9)
})

test('normalizePrice: 两档简写补齐三桶', () => {
  assert.deepEqual(normalizePrice({ input: 1, output: 2 }), { cacheHit: 1, cacheMiss: 1, output: 2 })
  assert.deepEqual(normalizePrice({ cacheHit: 0.5, cacheMiss: 1, output: 2 }), { cacheHit: 0.5, cacheMiss: 1, output: 2 })
  assert.equal(normalizePrice(null), null)
  assert.equal(normalizePrice({}), null)
})

test('priceEntryFor: 未知模型回退 default', () => {
  assert.equal(priceEntryFor('deepseek-v4-flash', DEFAULT_PRICE_TABLE), FLASH)
  assert.deepEqual(priceEntryFor('unknown-model', DEFAULT_PRICE_TABLE), DEFAULT_PRICE_TABLE.default)
})

const FIXTURE_HTML = `
<table>
  <tr><td>MODEL</td><td>deepseek-v4-flash</td><td>deepseek-v4-pro</td></tr>
  <tr><td>1M INPUT TOKENS (CACHE HIT)</td><td>OFF-PEAK</td><td>$0.007</td><td>$0.022</td></tr>
  <tr><td>PEAK</td><td>$0.014</td><td>$0.044</td></tr>
  <tr><td>1M INPUT TOKENS (CACHE MISS)</td><td>OFF-PEAK</td><td>$0.22</td><td>$0.66</td></tr>
  <tr><td>PEAK</td><td>$0.44</td><td>$1.32</td></tr>
  <tr><td>1M OUTPUT TOKENS</td><td>OFF-PEAK</td><td>$0.66</td><td>$1.98</td></tr>
  <tr><td>PEAK</td><td>$1.32</td><td>$3.96</td></tr>
</table>
<p>Peak hours are 01:00-04:00 and 06:00-10:00 UTC.</p>
`

test('parsePricingHtml: 官方页 fixture 解析出两模型与峰谷档', () => {
  const parsed = parsePricingHtml(FIXTURE_HTML)
  assert.deepEqual(Object.keys(parsed.models).sort(), ['deepseek-v4-flash', 'deepseek-v4-pro'])
  const flash = parsed.models['deepseek-v4-flash']
  assert.equal(flash.cacheMiss, 0.22)
  assert.equal(flash.output, 0.66)
  assert.deepEqual(flash.peak, { cacheHit: 0.014, cacheMiss: 0.44, output: 1.32 })
  assert.deepEqual(flash.offPeak, { cacheHit: 0.007, cacheMiss: 0.22, output: 0.66 })
  assert.deepEqual(parsed.peakWindows, [{ start: 1, end: 4 }, { start: 6, end: 10 }])
  assert.equal(parsed.effectiveAt, null)
})

test('parsePricingHtml: 不可解析页面抛 ERR_NO_MODELS', () => {
  assert.throws(() => parsePricingHtml('<html>nothing here</html>'), error => error.code === 'ERR_NO_MODELS')
})

test('默认价表包含 deepseek-v4-flash / deepseek-v4-pro', () => {
  assert.ok(FLASH !== undefined)
  assert.ok(PRO !== undefined)
  assert.ok(DEFAULT_PRICE_TABLE.default !== undefined)
})

// ── 双币种:默认 CNY 表 / 选表 / 中文页解析 ────────────────────────────

test('默认 CNY 价表与官方中文页数字一致', () => {
  const flash = DEFAULT_PRICE_TABLE_CNY.models['deepseek-v4-flash']
  const pro = DEFAULT_PRICE_TABLE_CNY.models['deepseek-v4-pro']
  assert.ok(flash !== undefined && pro !== undefined)
  assert.deepEqual({ cacheHit: flash.cacheHit, cacheMiss: flash.cacheMiss, output: flash.output }, { cacheHit: 0.05, cacheMiss: 1.5, output: 4.5 })
  assert.deepEqual(flash.peak, { cacheHit: 0.1, cacheMiss: 3.0, output: 9.0 })
  assert.deepEqual({ cacheHit: pro.cacheHit, cacheMiss: pro.cacheMiss, output: pro.output }, { cacheHit: 0.15, cacheMiss: 4.5, output: 13.5 })
  assert.deepEqual(pro.peak, { cacheHit: 0.3, cacheMiss: 9.0, output: 27.0 })
  assert.deepEqual(DEFAULT_PRICE_TABLE_CNY.default, { cacheHit: 0.05, cacheMiss: 1.5, output: 4.5 })
})

test('activeCurrency: zh/auto → cny,en → usd', () => {
  assert.equal(activeCurrency({ locale: 'zh' }), 'cny')
  assert.equal(activeCurrency({ locale: 'auto' }), 'cny')
  assert.equal(activeCurrency({ locale: 'en' }), 'usd')
  assert.equal(activeCurrency({}), 'cny')
})

const DUAL_CONFIG = {
  locale: 'zh',
  prices: {
    usd: { models: { m: { cacheHit: 0.1, cacheMiss: 0.2, output: 0.3 } }, default: { cacheHit: 0.1, cacheMiss: 0.2, output: 0.3 } },
    cny: { models: { m: { cacheHit: 1, cacheMiss: 2, output: 3 } }, default: { cacheHit: 1, cacheMiss: 2, output: 3 } },
  },
}

test('priceTableFor: 按 locale 选表/缺子表回退', () => {
  assert.equal(priceTableFor(DUAL_CONFIG).models.m.cacheMiss, 2) // zh → cny
  assert.equal(priceTableFor({ ...DUAL_CONFIG, locale: 'en' }).models.m.cacheMiss, 0.2) // en → usd
  const partial = { locale: 'zh', prices: {} }
  assert.deepEqual(priceTableFor(partial), { models: {}, default: { cacheHit: 0, cacheMiss: 0, output: 0 } })
})

const FIXTURE_HTML_CNY = `
<table>
  <tr><td colspan="3">模型</td><td>deepseek-v4-flash</td><td>deepseek-v4-pro</td></tr>
  <tr><td rowspan="6">价格</td><td rowspan="2">百万tokens输入（缓存命中）</td><td>空闲时段</td><td>0.05元</td><td>0.15元</td></tr>
  <tr><td>高峰时段</td><td>0.10元</td><td>0.30元</td></tr>
  <tr><td rowspan="2">百万tokens输入（缓存未命中）</td><td>空闲时段</td><td>1.5元</td><td>4.5元</td></tr>
  <tr><td>高峰时段</td><td>3.0元</td><td>9.0元</td></tr>
  <tr><td rowspan="2">百万tokens输出</td><td>空闲时段</td><td>4.5元</td><td>13.5元</td></tr>
  <tr><td>高峰时段</td><td>9.0元</td><td>27.0元</td></tr>
</table>
`

test('parsePricingHtml(target=cny): 中文页解析出两模型与峰谷档', () => {
  const parsed = parsePricingHtml(FIXTURE_HTML_CNY, 'cny')
  assert.deepEqual(Object.keys(parsed.models).sort(), ['deepseek-v4-flash', 'deepseek-v4-pro'])
  const flash = parsed.models['deepseek-v4-flash']
  assert.deepEqual(flash.offPeak, { cacheHit: 0.05, cacheMiss: 1.5, output: 4.5 })
  assert.deepEqual(flash.peak, { cacheHit: 0.1, cacheMiss: 3.0, output: 9.0 })
})