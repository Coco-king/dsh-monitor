/**
 * dsh-monitor 用量汇总图表:手写 SVG 柱形图。
 *
 * 零第三方依赖(客户端 bundle 是 esbuild 单文件,external 仅 react/primitives,
 * 引 echarts/recharts 会把产物撑爆且有加载风险)。柱形 = 普通 SVG rect,
 * 悬停 tooltip 用宿主 Tooltip 原语,轴标签按天自动稀疏,坐标自适应数据范围。
 */

const { createElement: el } = require('react')
const { Tooltip } = require('@deepseek-ai/dsh-client-ui-primitives')

/** 本地日历日 YYYY-MM-DD(偏移 0 为今天,负数往前)。 */
function dayKey(offset = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** 本月首日 YYYY-MM-DD。 */
function monthStartKey() {
  const d = new Date()
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-01`
}

/** 去掉月份前缀,柱轴标签只写「日」:MM-DD → D(避免折行)。 */
function shortLabel(date) {
  const m = /^\d{4}-(\d{2})-(\d{2})$/.exec(String(date ?? ''))
  return m === null ? String(date ?? '') : `${Number(m[1])}/${Number(m[2])}`
}

/**
 * SVG 柱形图。
 * @param props - { data, height, valueOf, labelOf, tipOf, t }。
 *   data: 一组条目;valueOf 取数值(纵轴);labelOf 取轴标签;tipOf 取 tooltip 文本。
 */
function BarChart({ data, height = 140, valueOf, labelOf, tipOf, t }) {
  const W = 520
  const PAD_LEFT = 4
  const PAD_TOP = 8
  const PAD_BOTTOM = 22
  const PAD_RIGHT = 4
  const rows = (Array.isArray(data) ? data : []).filter(row => valueOf(row) > 0)
  if (rows.length === 0) {
    return el('div', { className: 'dm-empty dm-chart-empty' }, t?.('noUsageSummary') ?? '')
  }
  const innerW = W - PAD_LEFT - PAD_RIGHT
  const innerH = height - PAD_TOP - PAD_BOTTOM
  const max = Math.max(...rows.map(valueOf))
  const slot = innerW / rows.length
  const barW = Math.max(2, Math.min(18, slot * 0.6))
  // 轴标签稀疏步长:天太多时每隔 N 个标一个,避免挤成一团。
  const labelEvery = Math.max(1, Math.ceil(rows.length / 12))

  const bars = rows.map((row, i) => {
    const v = Math.max(0, valueOf(row))
    const h = max > 0 ? (v / max) * innerH : 0
    const x = PAD_LEFT + i * slot + (slot - barW) / 2
    const y = PAD_TOP + (innerH - h)
    const label = labelOf(row)
    return el('g', { key: i },
      labelOf !== null && i % labelEvery === 0 && el('text', {
        x: PAD_LEFT + i * slot + slot / 2, y: height - 4,
        className: 'dm-chart-tick', textAnchor: 'middle', fontSize: 9,
      }, label),
      el(Tooltip, { label: tipOf(row), side: 'top', delayMs: 150 },
        el('rect', { x, y, width: barW, height: Math.max(0.5, h), rx: 1, className: 'dm-chart-bar' })))
  })

  return el('div', { className: 'dm-chart' },
    el('svg', {
      viewBox: `0 0 ${W} ${height}`, width: '100%', height,
      role: 'img', 'aria-label': t?.('chartByDay') ?? 'chart',
    }, bars))
}

/** 取一行 token 总数(输入 + 缓存读写 + 输出),图表纵轴值。 */
function tokensOf(row) {
  return Number(row?.input ?? 0) + Number(row?.cacheRead ?? 0)
    + Number(row?.cacheWrite ?? 0) + Number(row?.output ?? 0)
}

export { BarChart, dayKey, monthStartKey, shortLabel, tokensOf }
