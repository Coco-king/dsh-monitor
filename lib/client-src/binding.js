/**
 * dsh-monitor「配置用量查询」绑定入口:在 设置→模型 页每个提供方行的
 * 编辑按钮前注入一个用量图标,点击弹出绑定表单(deepseek官方 / opencode-go /
 * 自定义,保存覆盖),返回该提供方的用量查询配置。
 *
 * DSH 模型页是自包含组件、无行级槽位,且构建后为 css-module 哈希类名,故用
 * DOM 注入实现:以「编辑按钮的 aria-label = 编辑 <显示名> (<provider id>)」
 * 作为锚点(结构稳定),通过 MutationObserver 幂等注入,不依赖任何 CSS 类。
 */

const { createElement: el, useState } = require('react')
const { createRoot } = require('react-dom/client')
const { ProviderForm } = require('./settings.js')

/** 用量仪表盘图标(SVG 字符串,与 panel.js GaugeIcon 同款)。 */
const GAUGE_SVG = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'
  + '<path d="M1.5 10.4A6.5 6.5 0 1 1 14.5 10.4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>'
  + '<path d="M8 10.4V4.2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>'
  + '<circle cx="8" cy="10.4" r="1.4" fill="currentColor"/></svg>'

/** 绑定弹窗:覆盖层 + 卡片,复用 ProviderForm(固定提供方 + 查询方式选择)。 */
function BindPopup(props) {
  const { providerId, displayName, config, api, t, onClose } = props
  const existing = config?.providers?.[providerId]
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState(null) // { kind, text }
  const save = async draft => {
    setBusy(true)
    try {
      const providers = { ...(config?.providers ?? {}) }
      const { provider, ...body } = draft
      providers[provider] = body // 覆盖该提供方此前的绑定配置
      await api.updateConfig({ providers })
      setNotice({ kind: 'ok', text: t('bindSaveNote') })
      setTimeout(onClose, 700)
    } catch (err) {
      setNotice({ kind: 'err', text: t('saveFailed', { message: err?.message ?? String(err) }) })
    } finally {
      setBusy(false)
    }
  }
  const remove = async () => {
    setBusy(true)
    try {
      const providers = { ...(config?.providers ?? {}) }
      delete providers[providerId]
      await api.updateConfig({ providers })
      setNotice({ kind: 'ok', text: t('bindRemoveNote') })
      setTimeout(onClose, 700)
    } catch (err) {
      setNotice({ kind: 'err', text: t('saveFailed', { message: err?.message ?? String(err) }) })
    } finally {
      setBusy(false)
    }
  }
  const title = displayName !== providerId ? `${displayName} (${providerId})` : providerId
  return el('div', { className: 'dm-bind-layer', onClick: e => { if (e.target === e.currentTarget) onClose() } },
    el('div', { className: 'dm-bind-card', role: 'dialog', 'aria-label': t('bindingTitle') },
      el('div', { className: 'dm-bind-head' },
        el('span', { className: 'dm-bind-title' }, t('bindingTitle')),
        el('span', { className: 'dm-bind-sub' }, title),
        el('button', { type: 'button', className: 'dm-icon-btn danger', style: { marginLeft: 'auto' }, 'aria-label': t('cancel'), onClick: onClose }, '\u00d7')),
      el('p', { className: 'dm-note' }, t('bindingDesc')),
      notice !== null && el('p', { className: 'dm-notice ' + (notice.kind === 'err' ? 'err' : 'ok') }, notice.text),
      el(ProviderForm, {
        initial: existing !== undefined ? { ...existing, provider: providerId } : { provider: providerId, enabled: true },
        onSave: save,
        onCancel: onClose,
        t,
        options: [{ value: providerId, label: title }],
      }),
      existing !== undefined && el('div', { className: 'dm-bind-foot' },
        el('button', { type: 'button', className: 'dm-btn danger small', onClick: remove, disabled: busy }, t('bindRemove')))))
}

/** 启动模型页注入:全插件生命周期运行,幂等;返回清理函数。 */
function startBinding(ctx, deps) {
  const { api, configOf, tOf } = deps

  // 弹出层生命周期:同一时刻最多一个。
  let popHost = null
  let popRoot = null
  let popAnchor = null
  const closePopup = () => {
    if (popRoot !== null) { popRoot.unmount(); popRoot = null }
    if (popHost !== null) { popHost.remove(); popHost = null }
    popAnchor = null
  }

  /** 从编辑按钮 aria-label「编辑 <显示名> (<id>)」解析提供方 id 与显示名。 */
  const parseEditLabel = label => {
    const m = /^(?:编辑|Edit) (.+)$/.exec(String(label ?? ''))
    if (m === null) return null
    const rest = m[1].trim()
    const pm = /\(([^)]+)\)$/.exec(rest)
    if (pm !== null) return { id: pm[1], displayName: rest.slice(0, rest.length - pm[0].length).trim() }
    return { id: rest, displayName: rest }
  }

  const openPopup = (providerId, displayName, anchor) => {
    if (popHost !== null) closePopup()
    popAnchor = anchor
    popHost = document.createElement('div')
    document.body.appendChild(popHost)
    popRoot = createRoot(popHost)
    popRoot.render(el(BindPopup, {
      providerId,
      displayName,
      config: configOf(),
      api,
      t: tOf(),
      onClose: closePopup,
    }))
  }

  /** 在 settings 对话框内找模型提供方行的编辑按钮,前置注入图标(幂等)。 */
  const injectRow = root => {
    if (root === null) return
    const buttons = root.querySelectorAll('button[aria-label]')
    for (const btn of buttons) {
      const parsed = parseEditLabel(btn.getAttribute('aria-label'))
      if (parsed === null) continue
      if (btn.parentElement === null) continue
      if (btn.parentElement.querySelector('[data-dsh-bind]') !== null) continue
      const icon = document.createElement('button')
      icon.type = 'button'
      icon.setAttribute('data-dsh-bind', parsed.id)
      icon.setAttribute('aria-label', tOf()('bindingTitle'))
      icon.setAttribute('title', tOf()('bindingTitle'))
      icon.className = 'dm-icon-btn'
      icon.innerHTML = GAUGE_SVG
      icon.addEventListener('click', e => {
        e.preventDefault()
        e.stopPropagation()
        // 若弹层已打开且指向同一提供方则关闭,否则(重)打开。
        if (popAnchor === icon) closePopup()
        else openPopup(parsed.id, parsed.displayName, icon)
      })
      btn.parentElement.insertBefore(icon, btn)
    }
  }

  /** 扫描 settings 对话框并注入(仅当打开且含模型提供方行时生效)。 */
  let scanTimer = null
  const scan = () => {
    scanTimer = null
    const dialog = document.querySelector('[role="dialog"]')
    if (dialog !== null) injectRow(dialog)
    // 弹层锚点被移除(设置面板关闭/模型行卸载)时收起弹层。
    if (popAnchor !== null && popAnchor.isConnected !== true) closePopup()
  }
  const scheduleScan = () => {
    if (scanTimer === null) scanTimer = setTimeout(scan, 80)
  }
  const observer = new MutationObserver(scheduleScan)
  observer.observe(document.body, { childList: true, subtree: true })
  scheduleScan()
  // 兜底轮询(覆盖非 DOM 变化的重新渲染等)。
  const pollTimer = setInterval(scan, 1500)
  const onKeyDown = e => { if (e.key === 'Escape') closePopup() }
  document.addEventListener('keydown', onKeyDown)

  const stop = () => {
    observer.disconnect()
    clearInterval(pollTimer)
    clearTimeout(scanTimer)
    document.removeEventListener('keydown', onKeyDown)
    closePopup()
  }
  ctx.effect(() => stop, 'dsh-monitor: models-page binding injection')
  return stop
}

module.exports = { startBinding }