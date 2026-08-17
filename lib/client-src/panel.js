/**
 * dsh-monitor 客户端:用量图标(模型切换器左侧)→ 悬浮用量面板,
 * 以及会话费用角标(会话头部)。视觉与行为保持原样,仅随拆包搬迁。
 *
 * 三个界面中:
 *  - conversation.input.right:用量图标 + 用量面板(本文件);
 *  - conversation.session.header.actions:本会话费用角标(本文件);
 *  - settings.section「用量 / Usage」:见 ./settings.js。
 */

const { createElement: el, Fragment, useState, useEffect, useCallback, useRef } = require('react')
const { Tooltip } = require('@deepseek-ai/dsh-client-ui-primitives')
const { makeT, resolveLocale } = require('./i18n.js')
const { formatPlain, formatTokens, formatMoneyUsd, usageCost, billedInput } = require('./format.js')

// ── 用量图标(仪表盘 SVG) ───────────────────────────────────────────────

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

// ── 用量面板 ────────────────────────────────────────────────────────────

function UsageItemRow({ item, t }) {
  const pct = typeof item.percent === 'number' && Number.isFinite(item.percent)
    ? Math.max(0, Math.min(100, item.percent))
    : item.kind === 'percent' ? Math.max(0, Math.min(100, item.value)) : null
  let valueText
  if (item.kind === 'money') valueText = formatPlain(item.value, 2)
  else if (item.kind === 'text') valueText = String(item.value ?? '')
  else if (pct !== null) valueText = Math.round(pct) + '%'
  else valueText = formatPlain(item.value, 2)
  const showMax = typeof item.max === 'number' && Number.isFinite(item.max) && item.max > 0 && item.kind !== 'percent'
  const fillClass = pct !== null ? (pct >= 100 ? ' dm-fill over' : pct >= 80 ? ' dm-fill warn' : '') : ''
  const rows = []
  rows.push(el('div', { key: 'r', className: 'dm-row' },
    el('div', { className: 'dm-label', title: item.label }, item.label),
    pct !== null
      ? el(Fragment, null,
        el('div', { className: 'dm-bar' }, el('div', { className: 'dm-fill' + fillClass, style: { width: pct + '%' } })),
        el('div', { className: 'dm-num' }, valueText))
      : el('div', { className: 'dm-num' }, valueText)))
  if (showMax) {
    rows.push(el('div', { key: 'max', className: 'dm-reset' }, item.label + ': ' + formatPlain(item.value, 2) + ' / ' + formatPlain(item.max, 2)))
  }
  if (item.resetsAt) {
    rows.push(el('div', { key: 'reset', className: 'dm-reset' }, t('resetsAt', { time: new Date(item.resetsAt).toLocaleString() })))
  }
  return el('div', null, rows)
}

function UsagePanel(props) {
  const { providerId, usage, loading, refreshing, error, onRefresh, config, t } = props
  // DeepSeek 官方内置 provider:id 与 dsh 模型目录一致,无需配置即可自动查询余额。
  const BUILTIN_DEEPSEEK = 'deepseek-official'
  const configured = config?.providers?.[providerId]
  const isBuiltinDeepseek = providerId === BUILTIN_DEEPSEEK
  const preset = configured?.preset ?? (isBuiltinDeepseek ? 'deepseek' : undefined)
  const presetLabel = preset === 'deepseek' ? t('presetDeepseek') : preset === 'opencode' ? t('presetOpencode') : preset === 'custom' ? t('presetCustom') : null
  let body
  if (loading) {
    body = el('div', { className: 'dm-msg off' }, t('loading'))
  } else if (!configured && !isBuiltinDeepseek) {
    body = el('div', { className: 'dm-empty' }, t('notConfiguredHint'))
  } else if (error) {
    body = el('div', { className: 'dm-msg err' }, error)
  } else if (usage !== null && (usage.status === 'error' || (usage.status === 'off' && usage.message.length > 0))) {
    body = el('div', { className: 'dm-msg ' + (usage.status === 'error' ? 'err' : 'off') }, usage.message)
  } else if (usage !== null && usage.items.length === 0) {
    body = el('div', { className: 'dm-empty' }, t('noUsageItems'))
  } else {
    // 打开面板的首帧:effect 尚未把 loading 置真,此时 usage 仍为 null,
    // 不能对 null 读 items(否则点击即崩);兜底显示加载中。
    body = usage === null
      ? el('div', { className: 'dm-msg off' }, t('loading'))
      : el('div', { className: 'dm-items' }, usage.items.map(item => el(UsageItemRow, { key: item.key, item, t })))
  }
  return el('div', { className: 'dm-panel', role: 'dialog' },
    el('div', { className: 'dm-panel-head' },
      el('div', { className: 'dm-panel-title', title: providerId || undefined }, providerId || t('unknownProvider')),
      presetLabel !== null && el('span', { className: 'dm-preset' }, presetLabel),
      el('button', { type: 'button', className: 'dm-icon-btn', 'aria-label': t('refresh'), disabled: refreshing || loading, onClick: onRefresh }, RefreshIcon({ size: 14, spin: refreshing }))),
    body,
    usage !== null && usage.fetchedAt > 0 && el('div', { className: 'dm-panel-foot' },
      el('span', null, t('updatedAt', { time: new Date(usage.fetchedAt).toLocaleTimeString() }))))
}

function UsageButton(props) {
  const { sessionId, api, providerOf, useMonitor, t } = props
  const storeSnap = useMonitor ? useMonitor(s => s) : {}
  const config = storeSnap.config
  const [open, setOpen] = useState(false)
  const [usage, setUsage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const wrapRef = useRef(null)

  const close = useCallback(() => setOpen(false), [])
  useEffect(() => {
    if (!open) return
    const onDown = e => {
      if (wrapRef.current !== null && !wrapRef.current.contains(e.target)) close()
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open, close])
  useEffect(() => {
    if (!open) return
    let cancelled = false
    setLoading(true)
    const providerId = providerOf(sessionId)
    if (providerId === undefined) {
      setUsage(null); setError(null); setLoading(false)
      return () => { cancelled = true }
    }
    api.getProviderUsage(providerId).then(
      v => { if (!cancelled) { setUsage(v); setError(null) } },
      err => { if (!cancelled) { setUsage(null); setError(err?.message ?? String(err)) } },
    ).finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [open, sessionId, api, providerOf])

  const doRefresh = () => {
    const providerId = providerOf(sessionId)
    if (providerId === undefined) return
    setRefreshing(true)
    api.refreshProvider(providerId).then(
      v => { setUsage(v); setError(null) },
      err => setError(err?.message ?? String(err)),
    ).finally(() => setRefreshing(false))
  }

  return el('div', { className: 'dm-dock', ref: wrapRef },
    el(Tooltip, { label: t('panelTitle'), side: 'top', delayMs: 500 },
      el('button', {
        type: 'button',
        className: 'dm-icon-btn' + (open ? ' dm-icon-btn-open' : ''),
        'aria-label': t('panelTitle'),
        'aria-expanded': open,
        onClick: () => setOpen(v => !v),
      }, GaugeIcon({ size: 16 }))),
    open && el(UsagePanel, {
      providerId: providerOf(sessionId),
      usage, loading, refreshing, error,
      onRefresh: doRefresh,
      config, t,
    }))
}

// ── 会话费用徽章(会话头部) ─────────────────────────────────────────────

function SessionCost(props) {
  const usage = props.useProjection ? props.useProjection('costUsage') : undefined
  const costStore = props.useMonitor ? props.useMonitor(s => s) : undefined
  const config = costStore?.config
  const cost = usageCost(usage, config)
  const input = billedInput(usage)
  if (!usage || !config || (input + (usage?.output ?? 0)) === 0) return null
  const locale = resolveLocale(config.locale)
  const t = makeT(locale)
  const money = amount => formatMoneyUsd(amount, locale, config.decimals)
  const detail = [
    t('sessionCostTitle'),
    t('sessionDetailTokens', {
      input: formatTokens(usage?.input ?? 0),
      cache: formatTokens((usage?.cacheRead ?? 0) + (usage?.cacheWrite ?? 0)),
      output: formatTokens(usage?.output ?? 0),
    }),
    t('sessionDetailCache', {
      read: formatTokens(usage?.cacheRead ?? 0),
      write: formatTokens(usage?.cacheWrite ?? 0),
    }),
    t('cost', { amount: money(cost) }),
  ].join('; ')
  return el(Tooltip, { label: detail, side: 'top', delayMs: 500 },
    el('div', { className: 'dm-chip' }, t('cost', { amount: money(cost) })))
}

module.exports = { UsageButton, UsagePanel, SessionCost }