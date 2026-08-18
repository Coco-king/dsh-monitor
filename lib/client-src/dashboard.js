/**
 * dsh-monitor 用量看板:侧边栏徽标 + 浮动面板(对齐 TokenLedger 用量账本,除余额)。
 *
 * 挂 `sidebar.footer.action`(侧边栏底部),展开显示「今日 token」徽标,折叠成圆形;
 * 点击弹出浮动面板,自上而下:
 *  1. 统计卡 ×3(今日/本月/累计,兼范围切换);
 *  2. 摘要行(请求 · 缓存命中 · 估算费用);
 *  3. 提供方分布(按 providerId 分组、显示目录 displayName,点击筛选全盘);
 *  4. 按项目(会话 cwd 归因);
 *  5. 活跃度(371 天热力带 + 逐日 tooltip);
 *  6. 模型表(可排序);
 *  7. 页脚(日志新鲜度 / 最近一次用量 / 归因不上的行)。
 * 无余额卡:余额留在各提供方自己的用量面板(panel.js)里。
 *
 * 数据:单次 `api.getUsage` 拉整份面板载荷(统计卡 windows / 提供方分布 / 项目分布 /
 * 活跃度与逐日模型 / 模型表 / 诊断一并下发),面板只渲染不计算口径;
 * host 侧折叠与聚合在 lib/store.js + lib/monitor.js。
 */

const { createElement: el, Fragment, useState, useEffect, useMemo, useRef, useCallback } = require('react')
const { activeCurrency } = require('./format.js')

/** 活跃度窗口(天),与宿主 lib/store.js 的 ACTIVITY_DAYS 保持一致。 */
const ACTIVITY_DAYS = 371

/** 范围窗(兼卡片):三窗就是范围选择器,不另设下拉。 */
const RANGES = [
  { id: 'today', key: 'today', label: 'rangeToday', range: () => ({ start: dayKey(0) }) },
  // 本月 = 日历月首日(非滚动 30 天)。
  { id: 'month', key: 'month', label: 'rangeMonth', range: () => monthStartRange() },
  { id: 'all', key: 'all', label: 'rangeAll', range: () => ({}) },
]

// ── 数字格式 ──────────────────────────────────────────────────────────────

/** 千分位 + 表格数字;缺失显示破折号而非 0。 */
function fmt(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value.toLocaleString() : '—'
}

/** 占比(0-100),防零分母。 */
function share(part, whole) {
  return typeof part === 'number' && typeof whole === 'number' && whole > 0 ? (part / whole) * 100 : 0
}

/** 缓存命中率(整数百分数);无输入 token 时 null(不是 0%)。 */
function hitRateOf(row) {
  const denom = Number(row?.input ?? 0) + Number(row?.cacheRead ?? 0)
  return denom > 0 ? Math.round((Number(row?.cacheRead ?? 0) / denom) * 100) : null
}

function fmtHit(rate) {
  return typeof rate === 'number' && Number.isFinite(rate) ? `${rate}%` : ''
}

/** 一行 token 总数(输入 + 缓存读写 + 输出)。 */
function tokensOf(row) {
  return Number(row?.input ?? 0) + Number(row?.cacheRead ?? 0)
    + Number(row?.cacheWrite ?? 0) + Number(row?.output ?? 0)
}

// ── 日期 ──────────────────────────────────────────────────────────────────

/** 偏移 offset 天的本地日期键(0 = 今天)。 */
function dayKey(offset = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function monthStartRange() {
  const d = new Date()
  const pad = n => String(n).padStart(2, '0')
  return { start: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-01` }
}

/** 任意日期的本地键 YYYY-MM-DD(热力带用,不能用 toISOString 的 UTC)。 */
function localKey(date) {
  const pad = n => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** 路径的末段(项目行显示名);空/根路径原样返回。 */
function basenameOf(path) {
  const parts = String(path ?? '').split(/[\\/]/).filter(Boolean)
  return parts.length > 0 ? parts[parts.length - 1] : String(path ?? '')
}

// ── 热力带分位数定档(0-4) ────────────────────────────────────────────────
// 对齐 TokenLedger:按有活跃值的分布取分位数,而非按峰值——单日峰值会把其他天压成一片。

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

// ── 分区 ──────────────────────────────────────────────────────────────────

function Section({ title, action, children }) {
  return el('div', { className: 'dm-dash-section' },
    el('div', { className: 'dm-dash-section-title' }, title, action),
    children)
}

/** 三窗统计卡,兼范围切换。每张卡永远显示自己窗口的值,与选中无关。 */
function StatRow({ data, range, onRange, t }) {
  const windows = data.windows ?? {}
  return el('div', { className: 'dm-dash-cards' },
    RANGES.map(r => el('button', {
      key: r.id, type: 'button', className: 'dm-dash-card' + (range === r.id ? ' dm-dash-card-on' : ''),
      onClick: () => onRange(r.id),
    },
      el('div', { className: 'dm-dash-card-val' }, fmt(tokensOf(windows[r.key]))),
      el('div', { className: 'dm-dash-card-label' }, t(r.label)))))
}

/** 选中窗口的一行摘要:请求 · 缓存命中 · 估算费用。 */
function StatCaption({ data, t, money }) {
  const totals = data.totals ?? {}
  const rate = hitRateOf(totals)
  const parts = [
    t('captionRequests', { n: fmt(totals.calls) }),
    t('captionHit', { rate: rate === null ? '—' : fmtHit(rate) }),
    t('captionCost', { cost: money.fmt(money.of(totals)) }),
  ]
  return el('p', { className: 'dm-dash-caption' }, parts.join(' · '))
}

/**
 * 提供方分布:按 providerId 分组。行标签优先目录 displayName,拿不到回退 id;
 * `unknown` 提供方单独一行(灰色),绝不占用彩色槽位。
 * 选中某行 = 只筛该提供方;选中态的行列表永远完整(它是改筛选的入口,不能把自己藏起来)。
 */
function ProviderRows({ data, filter, onSelect, t }) {
  const rows = data.byProvider ?? []
  if (rows.length === 0) return el('p', { className: 'dm-dash-note' }, t('providersNone'))
  const total = rows.reduce((sum, r) => sum + tokensOf(r), 0)
  const nameOf = id => {
    if (id === 'unknown') return t('providersUnknown')
    const hit = (data.providers ?? []).find(p => p.id === id)
    return hit !== undefined && hit.name !== '' ? hit.name : id
  }
  let idx = -1
  const coloured = rows.map(row => {
    const isUnknown = row.provider === 'unknown'
    if (!isUnknown) idx += 1
    return { ...row, color: isUnknown ? 'var(--dm-unknown)' : `var(--dm-series-${idx % 6})` }
  })
  const stackNode = el('div', {
    className: 'dm-dash-stack',
    ...(filter === undefined ? {} : { 'data-dim': '' }),
  },
    coloured.map(row => el('span', {
      key: row.provider, className: 'dm-dash-stack-seg',
      ...(row.provider === filter ? { 'data-on': '' } : {}),
      title: `${nameOf(row.provider)} · ${fmt(tokensOf(row))}`,
      style: { width: `${share(tokensOf(row), total)}%`, background: row.color },
    })))
  const rowNode = row => {
    const id = row.provider
    return el('button', {
      key: id, type: 'button', className: 'dm-dash-row',
      ...(id === filter ? { 'data-on': '' } : {}),
      title: id,
      onClick: () => onSelect(id === filter ? undefined : id),
    },
      el('span', { className: 'dm-dash-swatch', style: { background: row.color } }),
      el('span', { className: 'dm-dash-row-name' }, nameOf(id)),
      el('span', { className: 'dm-dash-row-value' }, fmt(tokensOf(row))),
      el('span', { className: 'dm-dash-row-meta' }, `${Math.round(share(tokensOf(row), total))}%`))
  }
  return el(Fragment, null, stackNode, el('div', { className: 'dm-dash-rows' }, coloured.map(rowNode)))
}

/** 按项目:静态行(basename 为标签,完整路径 title);未记录目录要有可见的「未记录目录」行。 */
function ProjectRows({ data, t }) {
  const rows = data.byProject ?? []
  if (rows.length === 0) return el('p', { className: 'dm-dash-note' }, t('projectsNone'))
  const total = rows.reduce((sum, r) => sum + tokensOf(r), 0)
  return el('div', { className: 'dm-dash-rows' },
    rows.map(row => {
      const unattributed = row.project === ''
      return el('div', {
        key: unattributed ? '__nopath__' : row.project,
        className: 'dm-dash-row dm-dash-row-static',
        title: unattributed ? t('projectsUnattributed') : row.project,
      },
        el('span', { className: 'dm-dash-row-name' }, unattributed ? t('projectsUnattributed') : basenameOf(row.project)),
        unattributed ? null : el('span', { className: 'dm-dash-row-path' }, row.project),
        el('span', { className: 'dm-dash-row-value' }, fmt(tokensOf(row))),
        el('span', { className: 'dm-dash-row-meta' }, `${Math.round(share(tokensOf(row), total))}%`))
    }))
}

/**
 * 活跃度热力带:周作列、一天一格。自己的 371 天窗口,不随所选范围变化
 * (否则选中「今日」时热力图缩成一天,读起来像坏了)。
 */
function ActivityStrip({ data, t }) {
  const [hover, setHover] = useState(null)
  const scroller = useRef(null)
  const days = data.activity ?? []
  const byDay = new Map(days.map(d => [d.date, tokensOf(d)]))

  // 逐日模型拆分按天分组一次,悬停时直接查表。
  const modelsByDay = useMemo(() => {
    const out = new Map()
    for (const row of data.activityModels ?? []) {
      if (!out.has(row.day)) out.set(row.day, [])
      out.get(row.day).push(row)
    }
    for (const rows of out.values()) rows.sort((a, b) => tokensOf(b) - tokensOf(a))
    return out
  }, [data.activityModels])

  const levelAt = makeLevelScale([...byDay.values()])
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const cells = []
  for (let back = ACTIVITY_DAYS - 1; back >= 0; back -= 1) {
    const date = new Date(today.getTime() - back * 86_400_000)
    cells.push({ day: localKey(date), date, tokens: byDay.get(localKey(date)) ?? 0 })
  }
  // 周一开头补齐,末尾补全整周。
  const startPad = (cells[0].date.getDay() + 6) % 7
  for (let i = 0; i < startPad; i += 1) cells.unshift(null)
  const endPad = (7 - (cells.length % 7)) % 7
  for (let i = 0; i < endPad; i += 1) cells.push(null)

  const weeks = cells.length / 7
  const monthLabels = []
  let lastMonth = -1
  for (let w = 0; w < weeks; w += 1) {
    const first = cells.slice(w * 7, w * 7 + 7).find(Boolean)
    const month = first === undefined ? lastMonth : first.date.getMonth()
    monthLabels.push(month !== lastMonth && first !== undefined ? t(`month.${month}`) : '')
    if (first !== undefined) lastMonth = month
  }

  // 落在最新一周;否则一年从左侧跑出画面。
  useEffect(() => {
    const el2 = scroller.current
    if (el2) el2.scrollLeft = el2.scrollWidth
  }, [days.length])

  // 滚动条是隐藏的,普通滚轮映射成横向滚动(否则桌面端只能 shift+滚轮/触控板);
  // 滚到尽头后放行,让外层面板继续纵向滚动。React 根委托的 wheel 是 passive,
  // preventDefault 无效,必须自己挂原生监听。
  useEffect(() => {
    const node = scroller.current
    if (!node) return undefined
    const onWheel = event => {
      if (event.deltaY === 0 || event.shiftKey) return
      const max = node.scrollWidth - node.clientWidth
      const canLeft = node.scrollLeft > 0
      const canRight = node.scrollLeft < max
      if ((event.deltaY > 0 && canRight) || (event.deltaY < 0 && canLeft)) {
        event.preventDefault()
        node.scrollLeft += event.deltaY
      }
    }
    node.addEventListener('wheel', onWheel, { passive: false })
    return () => node.removeEventListener('wheel', onWheel)
  }, [])

  const show = cell => event => {
    const box = event.currentTarget.getBoundingClientRect()
    setHover({ cell, x: box.left + box.width / 2, y: box.top })
  }

  return el(Fragment, null,
    el('div', { className: 'dm-dash-strip', ref: scroller },
      el('div', { className: 'dm-dash-weekdays' },
        [0, 1, 2, 3, 4, 5, 6].map(d => el('span', { key: d, className: 'dm-dash-weekday' }, d === 1 || d === 4 ? t(`weekday.${d}`) : ''))),
      el('div', { className: 'dm-dash-strip-cols' },
        el('div', { className: 'dm-dash-months', style: { gridTemplateColumns: `repeat(${weeks}, 12px)` } },
          monthLabels.map((label, i) => el('span', { key: i, className: 'dm-dash-month' }, label))),
        el('div', { className: 'dm-dash-strip-grid' },
          cells.map((cell, i) => cell === null
            ? el('span', { key: 'p' + i, className: 'dm-dash-heat-pad' })
            : el('span', {
              key: cell.day, className: 'dm-dash-heat-cell', 'data-l': String(levelAt(cell.tokens)),
              onMouseEnter: show(cell), onMouseLeave: () => setHover(null),
            }))))),
    el('div', { className: 'dm-dash-heat-legend' },
      el('span', null, t('activityLess')),
      [0, 1, 2, 3, 4].map(level => el('span', { key: level, className: 'dm-dash-heat-swatch', 'data-l': String(level) })),
      el('span', null, t('activityMore'))),
    hover === null ? null : el(DayTip, {
      cell: hover.cell, x: hover.x, y: hover.y, level: levelAt(hover.cell.tokens),
      models: modelsByDay.get(hover.cell.day) ?? [], t,
    }))
}

/** 某天由哪些模型构成(悬停热力带单元格)。 */
function DayTip({ cell, x, y, level, models, t }) {
  const total = cell.tokens ?? 0
  // 靠边夹取,别把卡片顶出屏幕。
  const left = Math.min(Math.max(x - 110, 8), Math.max(8, window.innerWidth - 258))
  return el('div', {
    className: 'dm-dash-tip',
    style: { left: `${left}px`, top: `${Math.max(8, y - 8)}px`, transform: 'translateY(-100%)' },
  },
    el('div', { className: 'dm-dash-tip-head' },
      el('span', { className: 'dm-dash-tip-date' }, cell.day),
      el('span', { className: 'dm-dash-tip-level' }, t('activityLevel', { level }))),
    el('div', { className: 'dm-dash-tip-total' },
      fmt(total), el('span', { className: 'dm-dash-tip-unit' }, 'tokens')),
    models.length === 0
      ? el('p', { className: 'dm-dash-tip-quiet' }, t('activityQuiet'))
      : el('div', { className: 'dm-dash-tip-models' },
        models.slice(0, 4).map(row => el('div', { key: row.provider + ':' + row.model, className: 'dm-dash-tip-row' },
          el('div', { className: 'dm-dash-tip-row-head' },
            el('span', { className: 'dm-dash-tip-name', title: row.model }, row.model),
            el('span', { className: 'dm-dash-tip-value' }, fmt(tokensOf(row))),
            el('span', { className: 'dm-dash-tip-pct' }, `${Math.round(share(tokensOf(row), total))}%`)),
          el('div', { className: 'dm-dash-tip-bar' },
            el('div', { className: 'dm-dash-tip-bar-fill', style: { width: `${Math.max(2, share(tokensOf(row), total))}%` } }))))))
}

/** 模型表:模型/请求/总计/输入/缓存(+命中率+写入↑)/输出/估算,每列可排序。 */
function ModelTable({ data, t, money }) {
  // 排序三态:列未排序 → 点该列降序 → 再点升序 → 第三次取消(回到默认顺序)。
  const [sort, setSort] = useState(null)
  const rows = data.models ?? []
  if (rows.length === 0) return el('p', { className: 'dm-dash-note' }, t('tableNone'))
  const columns = [
    { id: 'model', label: 'tableModel', get: m => m.model, numeric: false },
    { id: 'requests', label: 'tableRequests', get: m => Number(m.calls ?? 0) },
    { id: 'tokens', label: 'tableTotal', get: m => tokensOf(m) },
    { id: 'input', label: 'tableInput', get: m => Number(m.input ?? 0) },
    { id: 'cache', label: 'tableCache', get: m => Number(m.cacheRead ?? 0) },
    { id: 'output', label: 'tableOutput', get: m => Number(m.output ?? 0) },
    { id: 'cost', label: 'tableCost', get: m => money.of(m) },
  ]
  const column = sort === null ? null : (columns.find(c => c.id === sort.by) ?? columns[2])
  const sorted = sort === null || column === null
    ? rows.slice() // 默认顺序 = 服务端返回(按 token 降序)
    : rows.slice().sort((a, b) => {
      const x = column.get(a)
      const y = column.get(b)
      const order = column.numeric === false ? String(x).localeCompare(String(y)) : Number(x) - Number(y)
      return sort.desc ? -order : order
    })
  const toggle = id => setSort(prev => {
    if (prev === null || prev.by !== id) return { by: id, desc: true }
    return prev.desc ? { by: id, desc: false } : null
  })

  return el('table', { className: 'dm-dash-table' },
    el('thead', null, el('tr', null,
      columns.map(c => el('th', { key: c.id, title: t(c.label), onClick: () => toggle(c.id) },
        t(c.label),
        sort !== null && sort.by === c.id ? el('span', { className: 'dm-dash-sort-mark' }, sort.desc ? '↓' : '↑') : null)))),
    el('tbody', null, sorted.map(m => {
      const hit = hitRateOf(m)
      return el('tr', { key: m.provider + ':' + m.model },
        el('td', { title: m.provider + ' · ' + m.model }, m.model),
        el('td', null, fmt(m.calls)),
        el('td', null, fmt(tokensOf(m))),
        el('td', null, fmt(m.input)),
        el('td', null,
          fmt(m.cacheRead),
          hit !== null ? el('span', { className: 'dm-dash-hit' }, fmtHit(hit)) : null,
          Number(m.cacheWrite ?? 0) > 0 ? el('span', { className: 'dm-dash-hit' }, ` ↑${fmt(m.cacheWrite)}`) : null),
        el('td', null, fmt(m.output)),
        el('td', null, money.fmt(money.of(m))))
    })))
}

/** 页脚:日志新鲜度(看了多久前,不是改了多久前)+ 最近一次用量 + 归因不上的行。 */
function Footer({ data, t }) {
  const now = Date.now()
  const ago = at => {
    if (typeof at !== 'number') return t('footerNever')
    const seconds = Math.max(0, Math.round((now - at) / 1000))
    if (seconds < 90) return t('footerJustNow')
    const minutes = Math.round(seconds / 60)
    if (minutes < 60) return t('footerMinutes', { n: minutes })
    const hours = Math.round(minutes / 60)
    if (hours < 24) return t('footerHours', { n: hours })
    return t('footerDays', { n: Math.round(hours / 24) })
  }
  const checked = data.lastSweepAt
  const d = data.diagnostics ?? {}
  return el('div', { className: 'dm-dash-footer' },
    el('span', { title: typeof checked === 'number' ? new Date(checked).toLocaleString() : '' },
      t('footerUpdated', { ago: ago(checked) })),
    typeof d.lastUsageAt === 'number'
      ? el('span', { title: new Date(d.lastUsageAt).toLocaleString() }, ` · ${t('footerLastActivity', { ago: ago(d.lastUsageAt) })}`)
      : null,
    Number(d.unattributedRows ?? 0) > 0
      ? el('span', { className: 'dm-dash-warn' }, ` · ${t('footerUnattributed', { n: fmt(d.unattributedRows) })}`)
      : null)
}

function Skeleton() {
  return el(Fragment, null,
    el('div', { className: 'dm-dash-cards' },
      [0, 1, 2].map(i => el('div', { key: i, className: 'dm-dash-skel dm-dash-skel-stat' }))),
    el('div', { className: 'dm-dash-section' }, el('div', { className: 'dm-dash-skel', style: { height: '76px' } })))
}

/** 面板主体:每个分区一次成型(余额分区不渲染)。 */
function Body({ data, range, onRange, filter, onSelect, money, t }) {
  const empty = Number(data.totals?.calls ?? 0) === 0
  const filterName = filter === undefined
    ? ''
    : ((data.providers ?? []).find(p => p.id === filter)?.name ?? filter)
  return el(Fragment, null,
    el(Section, { title: t('sectionUsage') },
      el('div', null,
        el(StatRow, { data, range, onRange, t }),
        empty ? el('p', { className: 'dm-dash-note' }, t('stateEmpty')) : el(StatCaption, { data, t, money }))),
    el(Section, {
      title: t('sectionProviders'),
      action: filter === undefined
        ? null
        : el('button', { type: 'button', className: 'dm-dash-filter', onClick: () => onSelect(undefined) },
          t('filterClear', { name: filterName })),
    },
      el(ProviderRows, { data, filter, onSelect, t })),
    empty ? null : el(Section, { title: t('sectionProjects') }, el(ProjectRows, { data, t })),
    empty ? null : el(Section, {
      title: t('sectionActivity'),
      action: data.timeZone === undefined
        ? null
        : el('span', { className: 'dm-dash-zone', title: data.timeZone.name ?? '' }, data.timeZone.offset),
    },
      el(ActivityStrip, { data, t })),
    empty ? null : el(Section, { title: t('sectionModels') }, el(ModelTable, { data, t, money })),
    el(Footer, { data, t }))
}

// ── 主组件:徽标 + 面板 ────────────────────────────────────────────────────

/**
 * @param props - { wide, useMonitor, api, t, locale }。
 *   `wide`:侧边栏展开(false 折叠为 rail);api = client api(getUsage);
 *   useMonitor = dsh-monitor 的 store hook(config/decimals/locale)。
 */
function Dashboard({ wide, useMonitor, api, t, locale }) {
  const storeSnap = useMonitor ? useMonitor(s => s) : {}
  const config = storeSnap.config
  const decimals = Math.max(0, Math.min(10, Math.floor(Number(config?.decimals) || 4)))
  const cny = activeCurrency(locale ?? config?.locale) === 'cny'
  const symbol = cny ? '¥' : '$'
  const money = {
    of: row => (cny ? Number(row?.costCny ?? 0) : Number(row?.costUsd ?? 0)),
    fmt: v => symbol + Number(v ?? 0).toFixed(decimals).replace(/\.?0+$/, ''),
  }

  const [open, setOpen] = useState(false)
  const [range, setRange] = useState('today')
  const [filter, setFilter] = useState(undefined)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const [todayTotal, setTodayTotal] = useState(null)
  const [nonce, setNonce] = useState(0)
  const root = useRef(null)

  // 徽标数字:今日 token 总数(打开与否都常驻,按 60s 节流刷新;失败不外显)。
  useEffect(() => {
    let alive = true
    const loadBadge = () => {
      api.getUsage({ range: RANGES[0].range() }).then(
        v => { if (alive && v !== null && v.totals !== undefined) setTodayTotal(tokensOf(v.totals)) },
        () => { /* 徽标拉取失败不外显 */ },
      )
    }
    loadBadge()
    const timer = setInterval(loadBadge, 60_000)
    return () => { alive = false; clearInterval(timer) }
  }, [api, nonce])

  // 打开面板即拉:单次 getUsage(选中范围 + 可选提供方筛选),整份载荷一次下发。
  // 重载/换范围保留旧数据,不闪空白。慢请求永远覆盖不了新请求:alive 守卫 + 依赖齐全。
  useEffect(() => {
    if (!open) return undefined
    let alive = true
    setBusy(true)
    const sel = RANGES.find(r => r.id === range) ?? RANGES[0]
    const query = { range: sel.range() }
    if (filter !== undefined) query.providers = [filter]
    api.getUsage(query).then(
      v => { if (alive) { setData(v); setError(null) } },
      err => { if (alive) { setError(err?.message ?? String(err)) } },
    ).finally(() => { if (alive) setBusy(false) })
    return () => { alive = false }
  }, [open, range, filter, nonce, api])

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
  const badgeValue = todayTotal !== null ? fmt(todayTotal) : '…'

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
          el('button', { type: 'button', className: 'dm-dash-icon', 'aria-label': t('refresh'), disabled: busy, onClick: reload }, RefreshIcon({ size: 14 })),
          el('button', { type: 'button', className: 'dm-dash-icon', 'aria-label': t('actionClose'), onClick: () => setOpen(false) }, CloseIcon({ size: 16 })))),
      el('div', { className: 'dm-dash-body' },
        error !== null
          ? el(Fragment, null,
            el('p', { className: 'dm-dash-error' }, t('errorLoad')),
            el('p', { className: 'dm-dash-note' }, error),
            el('button', { type: 'button', className: 'dm-dash-retry', onClick: reload }, t('actionRetry')))
          : data === null
            ? el(Skeleton)
            : el(Body, { data, range, onRange: setRange, filter, onSelect: setFilter, money, t }))))
}

module.exports = { Dashboard }

// ── 图标 ──────────────────────────────────────────────────────────────────

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

function CloseIcon({ size = 16 }) {
  return el('svg', { width: size, height: size, viewBox: '0 0 16 16', fill: 'none', xmlns: 'http://www.w3.org/2000/svg' },
    el('path', { d: 'M4 4l8 8M12 4l-8 8', stroke: 'currentColor', strokeWidth: '1.6', strokeLinecap: 'round' }))
}
