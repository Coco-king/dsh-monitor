/**
 * dsh-monitor 用量看板:侧边栏徽标 + 浮动面板(仿 TokenLedger 形态)。
 *
 * 挂在 `sidebar.footer.action` 插槽(侧边栏底部、设置齿轮旁边),展开显示
 * 「本日 token 总数」徽标,折叠成圆形图标;点击弹出固定浮动面板。
 *
 * 面板自上而下:
 *  1. 统计卡片 ×3 —— 今日 / 本月 / 全部,兼作下方内容的范围切换;
 *  2. 按天柱形(所选范围);
 *  3. 活动热力带(近 91 天,分位数 0-4 档);
 *  4. 模型分布表(所选范围,按 token 降序);
 *  5. 会话列表(所选范围,费用双币按语言选币显示)。
 *
 * 数据全部来自 `api.getUsage`(host 侧 SQLite 聚合),面板只渲染不计算口径;
 * 图表为手写 SVG,零第三方依赖(与 token-ledger 相同的弯道:客户端单文件 bundle)。
 */

const { createElement: el, Fragment, useState, useEffect, useMemo, useRef, useCallback } = require('react')
const { Tooltip } = require('@deepseek-ai/dsh-client-ui-primitives')
const { makeT } = require('./i18n.js')
const { BarChart, dayKey, shortLabel, tokensOf } = require('./chart.js')
const { activeCurrency } = require('./format.js')

// ── 范围窗(兼卡片) ───────────────────────────────────────────────────

const RANGES = [
  { id: 'today', keyLabel: 'rangeToday', range: () => ({ start: dayKey(0) }) },
  { id: 'month', keyLabel: 'rangeMonth', range: monthStartRange },
  { id: 'all', keyLabel: 'rangeAll', range: () => ({}) },
]

/** 本月首日(本地)的 YYYY-MM-DD。 */
function monthStartRange() {
  const d = new Date()
  const pad = n => String(n).padStart(2, '0')
  return { start: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-01` }
}

/** 近 N 天(含今天)起点的 YYYY-MM-DD。 */
function daysAgoKey(days) {
  const d = new Date()
  d.setDate(d.getDate() - (days - 1))
  return dayKey(d.getTime())
}

// ── 热力带:近 90 天的周列网格,分位数 0-4 档 ───────────────────────────

/** byDay(全范围) → 近 N 天的周网格渲染(值数组对齐日期列)。 */
function heatCells(byDay, windowDays = 91) {
  const byMap = new Map((byDay ?? []).map(d => [d.date, tokensOf(d)]))
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const cells = []
  for (let back = windowDays - 1; back >= 0; back -= 1) {
    const at = new Date(today.getTime() - back * 86_400_000)
    const key = `${at.getFullYear()}-${String(at.getMonth() + 1).padStart(2, '0')}-${String(at.getDate()).padStart(2, '0')}`
    cells.push({ key, date: at, tokens: byMap.get(key) ?? 0 })
  }
  // 周一开头补齐(weekday: 周日=0)。
  const startPad = (cells[0].date.getDay() + 6) % 7
  for (let i = 0; i < startPad; i += 1) cells.unshift(null)
  return cells
}

/** 分位数定档(0-4):让热力带在不同量级下都有对比度,而非被单日峰压平。 */
function makeLevelScale(values) {
  const active = values.filter(v => v > 0).sort((a, b) => a - b)
  if (active.length === 0) return () => 0
  const distinct = [...new Set(active)]
  if (distinct.length < 4) {
    const rank = new Map(distinct.map((v, i) => [v, distinct.length === 1 ? 4 : 1 + Math.round((i * 3) / (distinct.length - 1))]))
    return value => (value > 0 ? (rank.get(value) ?? 4) : 0)
  }
  const at = q => {
    const pos = (active.length - 1) * q
    const base = Math.floor(pos)
    const rest = pos - base
    return active[base] + (active[Math.min(active.length - 1, base + 1)] - active[base]) * rest
  }
  const t1 = at(0.5); const t2 = at(0.75); const t3 = at(0.9)
  return value => {
    if (!(value > 0)) return 0
    if (value <= t1) return 1
    if (value <= t2) return 2
    if (value <= t3) return 3
    return 4
  }
}

// ── 数字格式化 ────────────────────────────────────────────────────────

function fmtTokens(n) {
  const v = Number(n ?? 0)
  if (v < 1000) return String(Math.round(v))
  if (v < 1000000) return String(Math.round(v / 1000 * 10) / 10) + 'K'
  return String(Math.round(v / 1000000 * 10) / 10) + 'M'
}

function fmtNum(n) {
  return Number(n ?? 0).toLocaleString()
}

// ── 主组件事物:徽标 + 面板 ─────────────────────────────────────────────

/**
 * @param props - { wide, useMonitor, api, t, locale }。
 *   `wide`:侧边栏展开(false 折叠为 rail);api = client api(getUsage);
 *   useMonitor = dsh-monitor 的 store hook(config/decimals)。
 */
function Dashboard({ wide, useMonitor, api, t, locale }) {
  const storeSnap = useMonitor ? useMonitor(s => s) : {}
  const config = storeSnap.config
  const decimals = Math.max(0, Math.min(10, Math.floor(Number(config?.decimals) || 4)))
  const symbol = activeCurrency(locale ?? config?.locale) === 'cny' ? '¥' : '$'
  const fmtMoney = v => symbol + Number(v ?? 0).toFixed(decimals).replace(/\.?0+$/, '')
  const moneyOf = row => activeCurrency(locale ?? config?.locale) === 'cny'
    ? (row?.costCny ?? 0)
    : (row?.costUsd ?? 0)

  const [open, setOpen] = useState(false)
  const [range, setRange] = useState('today')
  const [data, setData] = useState(null)
  const [cards, setCards] = useState(null)
  const [todayTotal, setTodayTotal] = useState(null)
  const [heatDays, setHeatDays] = useState(null)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const root = useRef(null)
  const [nonce, setNonce] = useState(0)

  // 徽标数字:本日 token 总数(打开与否都常驻展示,按 60s 节流刷新)。
  useEffect(() => {
    let alive = true
    const loadBadge = () => {
      api.getUsage({ range: RANGES[0].range() }).then(
        v => { if (alive) setTodayTotal(v.totals) },
        () => { /* 徽标拉取失败不外显 */ },
      )
    }
    loadBadge()
    const timer = setInterval(loadBadge, 60_000)
    return () => { alive = false; clearInterval(timer) }
  }, [api, nonce])

  // 打开面板即拉:主请求(所选范围)+ 三窗卡片(今日/本月/全部)+ 热力带(近 91 天)。
  useEffect(() => {
    if (!open) return undefined
    let alive = true
    setBusy(true)
    const sel = RANGES.find(r => r.id === range) ?? RANGES[0]
    Promise.all([
      api.getUsage({ range: sel.range() }),
      api.getUsage({ range: RANGES[0].range() }),       // 今日
      api.getUsage({ range: RANGES[1].range() }),       // 本月
      api.getUsage({ range: RANGES[2].range() }),       // 全部
      api.getUsage({ range: { start: daysAgoKey(91) } }), // 热力带
    ]).then(
      ([summary, today, month, all, heat]) => {
        if (!alive) return
        setData(summary)
        setCards({ today: today.totals, month: month.totals, all: all.totals })
        if (todayTotal === null) setTodayTotal(today.totals)
        setHeatDays(heat.byDay)
        setError(null)
      },
      err => { if (alive) setError(err?.message ?? String(err)) },
    ).finally(() => { if (alive) setBusy(false) })
    return () => { alive = false }
  }, [open, range, nonce, api]) // eslint-disable-line react-hooks/exhaustive-deps

  // Escape / 外点关闭(Escape 全局,外点 pointerdown 捕获)。
  useEffect(() => {
    if (!open) return undefined
    const onKey = e => { if (e.key === 'Escape') setOpen(false) }
    const onDown = e => { if (root.current !== null && !root.current.contains(e.target)) setOpen(false) }
    window.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onDown, true)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onDown, true)
    }
  }, [open])

  const reload = useCallback(() => setNonce(n => n + 1), [])
  // 徽标:本日 token 总数(常驻 todayTotal,打开中且今日范围时用面板数据即时更新)。
  const badgeValue = busy && open ? '…' : fmtTokens(todayTotal !== null ? todayTotal : (cards !== null ? cards.today : null))

  // 热力带结构。
  const heat = useMemo(() => {
    if (heatDays === null) return null
    const cells = heatCells(heatDays)
    const levelAt = makeLevelScale(cells.filter(c => c !== null).map(c => c.tokens))
    return { cells, levelAt }
  }, [heatDays])
  const heatWeeks = heat === null ? 0 : Math.ceil(heat.cells.length / 7)

  return el('div', { className: 'dm-dash-layer' + (wide === false ? ' dm-dash-rail' : ''), ref: root },
    el('button', {
      type: 'button', className: 'dm-dash-badge' + (open ? ' dm-dash-badge-open' : ''),
      title: t('dashboardTitle'), 'aria-label': t('dashboardTitle'), 'aria-expanded': open,
      onClick: () => setOpen(v => !v),
    },
      el('span', { className: 'dm-dash-badge-icon' }, GaugeIcon({ size: 16 })),
      el('span', { className: 'dm-dash-badge-label' }, t('dashboardTitle')),
      el('span', { className: 'dm-dash-badge-value' }, badgeValue)),

    open && el('div', { className: 'dm-dash-panel', role: 'dialog', 'aria-label': t('dashboardTitle') },
      el('div', { className: 'dm-dash-head' },
        el('div', { className: 'dm-dash-title' }, t('dashboardTitle')),
        el('div', { className: 'dm-dash-actions' },
          el('button', {
            type: 'button', className: 'dm-dash-icon', 'aria-label': t('refresh'),
            disabled: busy, onClick: reload,
          }, RefreshIcon({ size: 14 })))),
      el('div', { className: 'dm-dash-body' },
        el('div', { className: 'dm-dash-cards' },
          RANGES.map(r => {
            const row = cards === null ? null : cards[r.id]
            return el('button', {
              key: r.id, type: 'button', className: 'dm-dash-card' + (range === r.id ? ' dm-dash-card-on' : ''),
              onClick: () => setRange(r.id),
            },
              el('div', { className: 'dm-dash-card-val' }, row === null ? '—' : fmtTokens(tokensOf(row))),
              el('div', { className: 'dm-dash-card-label' }, t(r.keyLabel)))
          })),
        error !== null && el('div', { className: 'dm-dash-error' }, error),
        (busy && data === null) && el('div', { className: 'dm-dash-note' }, t('loading')),

        data !== null && el(Fragment, null,
          // 按天柱形
          el('div', { className: 'dm-dash-section' },
            el('div', { className: 'dm-dash-section-title' }, t('chartByDay')),
            el(BarChart, {
              data: data.byDay, t, height: 120,
              valueOf: row => tokensOf(row),
              labelOf: row => shortLabel(row.date),
              tipOf: row => `${row.date} · ${fmtTokens(tokensOf(row))} tokens · ${fmtMoney(moneyOf(row))}`,
            })),
          // 模型表
          el('div', { className: 'dm-dash-section' },
            el('div', { className: 'dm-dash-section-title' }, t('modelTableTitle')),
            data.models.length === 0
              ? el('div', { className: 'dm-dash-note' }, t('noUsageSummary'))
              : el('table', { className: 'dm-dash-table' },
                el('thead', null, el('tr', null,
                  el('th', null, t('modelName')),
                  el('th', { className: 'num' }, t('sessionTokens')),
                  el('th', { className: 'num' }, t('sessionCalls')),
                  el('th', { className: 'num' }, t('sessionCost')))),
                el('tbody', null, data.models.map((m, i) =>
                  el('tr', { key: m.provider + ':' + m.model },
                    el('td', { title: m.provider }, m.model),
                    el('td', { className: 'num' }, fmtTokens(tokensOf(m))),
                    el('td', { className: 'num' }, String(Number(m.calls ?? 0))),
                    el('td', { className: 'num' }, fmtMoney(moneyOf(m)))))))),
          // 会话列表
          el('div', { className: 'dm-dash-section' },
            el('div', { className: 'dm-dash-section-title' }, t('sessionListTitle')),
            data.sessions.length === 0
              ? el('div', { className: 'dm-dash-note' }, t('noUsageSummary'))
              : el('div', { className: 'dm-dash-sessions' },
                data.sessions.slice(0, 50).map(row =>
                  el(Tooltip, { key: row.id, label: t('sessionCostTitle') + ': ' + fmtMoney(moneyOf(row)) + ' · ' + t('sessionCalls') + ' ' + Number(row.calls ?? 0), delayMs: 400 },
                    el('div', { className: 'dm-dash-session', title: row.id },
                      el('span', { className: 'dm-dash-session-id' }, row.id.length > 18 ? row.id.slice(0, 18) + '…' : row.id),
                      el('span', { className: 'dm-dash-session-date' }, row.date),
                      el('span', { className: 'dm-dash-session-tokens' }, fmtTokens(tokensOf(row))),
                      el('span', { className: 'dm-dash-session-cost' }, fmtMoney(moneyOf(row))))))))),

        heat !== null && el(Fragment, null,
          el('div', { className: 'dm-dash-section' },
            el('div', { className: 'dm-dash-section-title' }, t('activityTitle')),
            el('div', { className: 'dm-dash-heat' },
              el('div', { className: 'dm-dash-heat-grid', style: { gridTemplateColumns: `repeat(${heatWeeks}, 12px)` } },
                heat.cells.map((cell, i) => cell === null
                  ? el('span', { key: 'pad' + i, className: 'dm-dash-heat-pad' })
                  : el('span', {
                    key: cell.key, className: 'dm-dash-heat-cell', 'data-l': heat.levelAt(cell.tokens),
                    title: cell.key + ': ' + fmtTokens(cell.tokens),
                  }))),
              el('div', { className: 'dm-dash-heat-legend' },
                el('span', null, t('activityLess')),
                [0, 1, 2, 3, 4].map(level => el('span', {
                  key: level, className: 'dm-dash-heat-swatch', 'data-l': level,
                })),
                el('span', null, t('activityMore')))))))))
}

module.exports = { Dashboard }

function GaugeIcon({ size = 16, className }) {
  return el('svg', { width: size, height: size, className, viewBox: '0 0 16 16', fill: 'none', xmlns: 'http://www.w3.org/2000/svg' },
    el('path', { d: 'M1.5 10.4A6.5 6.5 0 1 1 14.5 10.4', stroke: 'currentColor', strokeWidth: '1.7', strokeLinecap: 'round' }),
    el('path', { d: 'M8 10.4V4.2', stroke: 'currentColor', strokeWidth: '1.7', strokeLinecap: 'round' }),
    el('circle', { cx: '8', cy: '10.4', r: '1.4', fill: 'currentColor' }))
}

function RefreshIcon({ size = 14, spin }) {
  return el('svg', { width: size, height: size, className: spin ? 'dm-spin' : undefined, viewBox: '0 0 16 16', fill: 'none', xmlns: 'http://www.w3.org/2000/svg' },
    el('path', {
      d: 'M13.5 8A5.5 5.5 0 1 1 8 2.5M8 2.5v3M8 2.5h3',
      stroke: 'currentColor', strokeWidth: '1.6', strokeLinecap: 'round', strokeLinejoin: 'round',
    }))
}
