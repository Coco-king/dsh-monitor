/**
 * dsh-monitor 设置页「用量 / Usage」:提供方用量配置 + 计费价格两段。
 * 行为逻辑与旧单文件一致(增删改查/同步/选择器均未变),呈现对齐 DSH
 * 设置→模型 / 设置→通用设置 的设计语言(见 styles.js 设置页段)。
 */

const { createElement: el, useState, useEffect } = require('react')
const { Tooltip } = require('@deepseek-ai/dsh-client-ui-primitives')
const { formatPlain } = require('./format.js')

/** 按 value 去重(供 <datalist> 选项使用)。 */
function delist(list) {
  const seen = new Set()
  const out = []
  for (const item of list) {
    if (seen.has(item.value)) continue
    seen.add(item.value)
    out.push(item)
  }
  return out
}

/** 问号图标:悬浮(或聚焦)显示字段含义。 */
function FieldHint({ text }) {
  return el(Tooltip, { label: text, side: 'top', delayMs: 400 },
    el('span', { className: 'dm-hint', role: 'img', 'aria-label': text, tabIndex: 0 }, '?'))
}

// ── 设置页:提供方配置 ─────────────────────────────────────────────────

function ProviderForm(props) {
  const { initial, onSave, onCancel, t, options } = props
  const [provider, setProvider] = useState(initial?.provider ?? '')
  const [enabled, setEnabled] = useState(initial?.enabled !== false)
  const [refreshMinutes, setRefreshMinutes] = useState(String(initial?.refreshMinutes ?? 15))
  const [apiKey, setApiKey] = useState(initial?.apiKey ?? '')
  const [url, setUrl] = useState(initial?.custom?.url ?? '')
  const [headersText, setHeadersText] = useState(JSON.stringify(initial?.custom?.headers ?? {}, null, 2))
  const [items, setItems] = useState(
    initial?.custom?.items && initial.custom.items.length > 0
      ? initial.custom.items.map(it => ({ ...it, maxPath: it.maxPath ?? '', resetsAtPath: it.resetsAtPath ?? '' }))
      : [{ key: '', label: '', kind: 'percent', path: '', maxPath: '', resetsAtPath: '' }],
  )
  const updateItem = (index, field, value) => {
    setItems(list => list.map((it, i) => (i === index ? { ...it, [field]: value } : it)))
  }
  const tItem = field => t('item' + field[0].toUpperCase() + field.slice(1))
  // 查询预设按提供方 ID 自动判定:deepseek-official→官方余额,含 opencode→Go 套餐,其余→自定义 HTTP。
  const derivePreset = id => {
    const s = String(id ?? '').trim().toLowerCase()
    if (s === 'deepseek-official' || s === 'deepseek') return 'deepseek'
    if (s.includes('opencode')) return 'opencode'
    return 'custom'
  }
  // 编辑时保留原有预设(避免自定义 id 的老配置被自动判定改写);新建时自动推导。
  const preset = initial?.preset ? initial.preset : derivePreset(provider)
  const presetLabel = preset === 'deepseek' ? t('presetDeepseek') : preset === 'opencode' ? t('presetOpencode') : t('presetCustom')
  const submit = () => {
    let headers = {}
    try {
      const parsed = JSON.parse(headersText)
      if (parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)
        && Object.values(parsed).every(v => typeof v === 'string')) headers = parsed
    } catch {
      // 解析失败:保持空对象,由服务端校验兜底。
    }
    const cleanItems = items
      .filter(it => typeof it.path === 'string' && it.path.length > 0)
      .map(it => ({
        key: (it.key || it.path).trim(),
        label: (it.label || it.key || it.path).trim(),
        kind: ['percent', 'number', 'money', 'text'].includes(it.kind) ? it.kind : 'number',
        path: it.path.trim(),
        maxPath: typeof it.maxPath === 'string' && it.maxPath.trim().length > 0 ? it.maxPath.trim() : (typeof it.maxPath === 'number' ? it.maxPath : null),
        resetsAtPath: typeof it.resetsAtPath === 'string' && it.resetsAtPath.trim().length > 0 ? it.resetsAtPath.trim() : null,
      }))
    onSave({
      provider: provider.trim(),
      preset,
      enabled,
      refreshMinutes: Math.max(1, Math.min(1440, Number(refreshMinutes) || 15)),
      apiKey: apiKey.trim(),
      custom: preset === 'custom' ? { url: url.trim(), headers, items: cleanItems } : undefined,
    })
  }
  const field = (label, control, hint) => el('div', { className: 'dm-field' },
    el('span', { className: 'dm-field-caption' },
      el('label', null, label),
      hint !== undefined && el(FieldHint, { text: hint })),
    control)
  const providerOptions = options ?? []
  return el('div', { className: 'dm-editor' },
    el('div', { className: 'dm-editor-head' },
      el('span', { className: 'dm-editor-title' }, initial !== null ? t('editProviderTitle') : t('addProviderTitle'))),
    el('div', { className: 'dm-grid2' },
      field(t('providerId'), el('select', {
        className: 'dm-input',
        value: provider,
        disabled: initial !== null, // 编辑时提供方 ID 不可改
        onChange: e => setProvider(e.target.value),
      },
      el('option', { value: '', disabled: true }, t('providerIdDatalist')),
      providerOptions.map(o => el('option', { key: o.value, value: o.value }, o.label)))),
      field(t('refreshMinutes'), el('input', {
        className: 'dm-input', type: 'number', min: '1', max: '1440',
        value: refreshMinutes,
        onChange: e => setRefreshMinutes(e.target.value),
      }))),
    el('p', { className: 'dm-note' }, t('presetLabel') + ': ' + presetLabel),
    el('label', { className: 'dm-switch', style: { width: 'fit-content' } },
      el('input', { type: 'checkbox', checked: enabled, onChange: e => setEnabled(e.target.checked) }), t('enabled')),
    preset === 'deepseek' && el('p', { className: 'dm-note' }, t('deepseekHint')),
    preset === 'opencode' && el('div', { className: 'dm-field' },
      field(t('apiKey'), el('input', {
        className: 'dm-input', type: 'password',
        value: apiKey,
        placeholder: t('apiKeyPlaceholder'),
        onChange: e => setApiKey(e.target.value),
      })),
      el('p', { className: 'dm-note' }, t('opencodeHint'))),
    preset === 'custom' && el('div', { className: 'dm-field' },
      el('p', { className: 'dm-note dm-custom-intro' }, t('customIntro')),
      field(t('customUrl'), el('input', { className: 'dm-input', type: 'text', value: url, onChange: e => setUrl(e.target.value) }), t('customUrlHint')),
      field(t('customHeaders'), el('textarea', { className: 'dm-textarea', value: headersText, onChange: e => setHeadersText(e.target.value) }), t('customHeadersHint')),
      el('div', { className: 'dm-field' },
        el('label', null, t('customItems')),
        el('div', { className: 'dm-item-list' },
          items.map((it, i) => el('div', { key: i, className: 'dm-item' },
            el('div', { className: 'dm-item-head' },
              el('span', { className: 'dm-item-title' }, t('itemField') + ' ' + String(i + 1)),
              el('button', {
                type: 'button', className: 'dm-icon-btn danger', 'aria-label': t('remove'),
                onClick: () => setItems(list => list.filter((_, j) => j !== i)),
              }, '\u00d7')),
            el('div', { className: 'dm-grid2' },
              field(tItem('key'), el('input', { className: 'dm-input', type: 'text', value: it.key, onChange: e => updateItem(i, 'key', e.target.value) }), t('itemKeyHint')),
              field(tItem('label'), el('input', { className: 'dm-input', type: 'text', value: it.label, onChange: e => updateItem(i, 'label', e.target.value) }), t('itemLabelHint'))),
            el('div', { className: 'dm-grid2' },
              field(tItem('kind'), el('select', { className: 'dm-input', value: it.kind, onChange: e => updateItem(i, 'kind', e.target.value) },
                el('option', { value: 'percent' }, t('kindPercent')),
                el('option', { value: 'number' }, t('kindNumber')),
                el('option', { value: 'money' }, t('kindMoney')),
                el('option', { value: 'text' }, t('kindText'))), t('itemKindHint')),
              field(tItem('path'), el('input', { className: 'dm-input', type: 'text', value: it.path, onChange: e => updateItem(i, 'path', e.target.value) }), t('itemPathHint'))),
            el('div', { className: 'dm-grid2' },
              field(tItem('maxPath'), el('input', { className: 'dm-input', type: 'text', value: String(it.maxPath ?? ''), onChange: e => updateItem(i, 'maxPath', e.target.value) }), t('itemMaxPathHint')),
              field(tItem('resetsAtPath'), el('input', { className: 'dm-input', type: 'text', value: String(it.resetsAtPath ?? ''), onChange: e => updateItem(i, 'resetsAtPath', e.target.value) }), t('itemResetsAtHint')))))),
        el('button', { type: 'button', className: 'dm-btn ghost small', style: { alignSelf: 'flex-start' }, onClick: () => setItems(list => [...list, { key: '', label: '', kind: 'percent', path: '', maxPath: '', resetsAtPath: '' }]) }, t('addItem')))),
    el('div', { className: 'dm-row-actions end' },
      el('button', { type: 'button', className: 'dm-btn ghost', onClick: onCancel }, t('cancel')),
      el('button', { type: 'button', className: 'dm-btn', onClick: submit, disabled: provider.trim().length === 0 || (preset === 'custom' && url.trim().length === 0) }, t('save'))))
}

function ProvidersSection(props) {
  const { config, api, t, catalog } = props
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState(null) // providerId | 'new' | null
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState(null) // { kind, text }
  const providerIds = Object.keys(config?.providers ?? {})
  // 提供方选择候选 = 设置→模型 已配置的提供方 + 本插件已配置的提供方(含自定义)。
  const providerCandidates = delist([
    ...(catalog?.providers ?? []).map(p => ({ value: p.id, label: p.name || p.id })),
    ...Object.keys(config?.providers ?? {}).map(id => ({ value: id, label: id })),
  ])

  const save = async (draft) => {
    setBusy(true)
    try {
      const providers = { ...(config?.providers ?? {}) }
      if (draft.provider.length === 0) return
      if (editing === 'new' && providers[draft.provider] !== undefined) {
        setNotice({ kind: 'err', text: t('providerSaved', { id: draft.provider }) + ' (exists)' })
        return
      }
      const { provider, ...body } = draft
      if (editing !== 'new') delete providers[provider] // 编辑:先移除旧的再写入(provider id 只读)
      providers[provider] = body
      await api.updateConfig({ providers })
      setNotice({ kind: 'ok', text: t('providersUpdated') })
      setAdding(false); setEditing(null)
    } catch (err) {
      setNotice({ kind: 'err', text: t('saveFailed', { message: err?.message ?? String(err) }) })
    } finally {
      setBusy(false)
    }
  }
  const remove = async (providerId) => {
    setBusy(true)
    try {
      const providers = { ...(config?.providers ?? {}) }
      delete providers[providerId]
      await api.updateConfig({ providers })
      setNotice({ kind: 'ok', text: t('providerRemoved', { id: providerId }) })
    } catch (err) {
      setNotice({ kind: 'err', text: t('saveFailed', { message: err?.message ?? String(err) }) })
    } finally {
      setBusy(false)
    }
  }
  const toggle = async (providerId, enabled) => {
    try {
      const providers = { ...(config?.providers ?? {}) }
      if (providers[providerId] !== undefined) providers[providerId] = { ...providers[providerId], enabled }
      await api.updateConfig({ providers })
    } catch (err) {
      setNotice({ kind: 'err', text: t('saveFailed', { message: err?.message ?? String(err) }) })
    }
  }

  return el('div', { className: 'dm-subsection' },
    el('h2', { className: 'dm-h' }, t('providersTitle')),
    el('p', { className: 'dm-intro' }, t('providersIntro')),
    notice !== null && el('p', { className: 'dm-notice ' + (notice.kind === 'err' ? 'err' : 'ok') }, notice.text),
    el('ul', { className: 'dm-list' },
      providerIds.map(providerId => {
        const provider = config.providers[providerId]
        const badge = provider.preset === 'deepseek' ? t('presetDeepseek') : provider.preset === 'opencode' ? t('presetOpencode') : t('presetCustom')
        if (editing === providerId) {
          return el('li', { key: providerId, style: { listStyle: 'none' } }, el(ProviderForm, {
            initial: { ...provider, provider: providerId }, onSave: save, onCancel: () => setEditing(null), t, options: providerCandidates,
          }))
        }
        const meta = [
          t('refreshMinutes') + ': ' + String(provider.refreshMinutes ?? 15),
        ]
        if (provider.preset === 'opencode' && provider.apiKey) meta.push(t('apiKey') + ': ****')
        if (provider.preset === 'custom' && provider.custom?.url) meta.push(provider.custom.url)
        return el('li', { key: providerId, className: 'dm-card' },
          el('div', { className: 'dm-card-head' },
            el('span', { className: 'dm-card-name', title: providerId }, providerId, el('span', { className: 'dm-tag' }, badge)),
            el('span', { className: 'dm-card-actions' },
              el('label', { className: 'dm-switch', title: t('enabled') },
                el('input', { type: 'checkbox', checked: provider.enabled !== false, onChange: e => toggle(providerId, e.target.checked) })),
              el('button', { type: 'button', className: 'dm-btn ghost small', onClick: () => setEditing(providerId), disabled: busy }, t('edit')),
              el('button', { type: 'button', className: 'dm-btn danger small', onClick: () => remove(providerId), disabled: busy }, t('remove')))),
          el('p', { className: 'dm-card-meta' }, meta.join(' · ')))
      })),
    providerIds.length === 0 && !adding && editing === null && el('p', { className: 'dm-empty' }, t('noProviders')),
    el('div', { className: 'dm-add-block' },
      adding && editing === 'new' && el(ProviderForm, { key: '__new', initial: null, onSave: save, onCancel: () => { setAdding(false); setEditing(null) }, t, options: providerCandidates }),
      !adding && el('button', {
        type: 'button', className: 'dm-btn add', disabled: busy,
        onClick: () => { setAdding(true); setEditing('new') },
      }, t('addProvider'))))
}

// ── 设置页:计费价格 + 官方同步 ─────────────────────────────────────────

function PricesSection(props) {
  const { config, api, t, catalog } = props
  const [draft, setDraft] = useState(() => ({
    models: Object.fromEntries(Object.entries(config?.prices?.models ?? {}).map(([id, p]) => [id, { ...p }])),
    default: { ...(config?.prices?.default ?? { cacheHit: 0, cacheMiss: 0, output: 0 }) },
  }))
  const [pickedModel, setPickedModel] = useState('')
  const [addingModel, setAddingModel] = useState(false)
  const [newHit, setNewHit] = useState('0')
  const [newMiss, setNewMiss] = useState('0')
  const [newOutput, setNewOutput] = useState('0')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState(null)
  const [syncing, setSyncing] = useState(false)
  // 模型分组(仿聊天框模型选择器):按提供方分组。
  const modelGroups = []
  {
    const byProvider = new Map()
    for (const m of catalog?.models ?? []) {
      if (typeof m?.id !== 'string' || m.id.length === 0) continue
      let group = byProvider.get(m.provider)
      if (group === undefined) {
        group = { id: m.provider, name: m.providerName || m.provider, models: [] }
        byProvider.set(m.provider, group)
      }
      group.models.push(m)
    }
    for (const group of byProvider.values()) modelGroups.push(group)
  }

  // 官方同步后按新价格表重建草稿(仅在 fetchedAt 变化时,避免覆盖用户编辑)。
  useEffect(() => {
    setDraft({
      models: Object.fromEntries(Object.entries(config?.prices?.models ?? {}).map(([id, p]) => [id, { ...p }])),
      default: { ...(config?.prices?.default ?? { cacheHit: 0, cacheMiss: 0, output: 0 }) },
    })
    // 仅依赖 fetchedAt:用户编辑期间配置刷新不会清空草稿。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config?.fetchedAt])

  const setTier = (modelId, field, value) => {
    const num = Number(value)
    const next = Number.isFinite(num) && num >= 0 ? num : 0
    setDraft(d => ({
      ...d,
      models: { ...d.models, [modelId]: { ...(d.models[modelId] ?? {}), [field]: next } },
    }))
  }
  // 「添加模型」:与「添加提供方」一致,虚线按钮展开内嵌编辑卡后提交。
  const addPicked = () => {
    const id = String(pickedModel ?? '').trim().toLowerCase()
    if (id.length === 0 || draft.models[id] !== undefined) return
    const num = v => {
      const n = Number(v)
      return Number.isFinite(n) && n >= 0 ? n : 0
    }
    setDraft(d => ({ ...d, models: { ...d.models, [id]: { cacheHit: num(newHit), cacheMiss: num(newMiss), output: num(newOutput) } } }))
    setAddingModel(false)
    setPickedModel('')
    setNewHit('0'); setNewMiss('0'); setNewOutput('0')
  }
  const removeModel = (modelId) => {
    const models = { ...draft.models }
    delete models[modelId]
    setDraft(d => ({ ...d, models }))
  }
  const save = async () => {
    setBusy(true)
    try {
      await api.updateConfig({ prices: { models: draft.models, default: draft.default } })
      setNotice({ kind: 'ok', text: t('saved') })
    } catch (err) {
      setNotice({ kind: 'err', text: t('saveFailed', { message: err?.message ?? String(err) }) })
    } finally {
      setBusy(false)
    }
  }
  const sync = async () => {
    setSyncing(true)
    try {
      await api.fetchPrices()
      setNotice({ kind: 'ok', text: t('saved') })
    } catch (err) {
      setNotice({ kind: 'err', text: t('syncFailed', { message: err?.message ?? String(err) }) })
    } finally {
      setSyncing(false)
    }
  }
  const tierLine = tier => {
    if (tier === undefined) return '\u2014'
    const n = v => formatPlain(v, 4)
    return t('cacheHit') + ' ' + n(tier.cacheHit) + ' · ' + t('cacheMiss') + ' ' + n(tier.cacheMiss) + ' · ' + t('output') + ' ' + n(tier.output)
  }
  const numberInput = (modelId, field, label) => el('input', {
    className: 'dm-input', type: 'number', step: '0.000001', min: '0', 'aria-label': label,
    value: String(modelId === 'default' ? draft.default?.[field] ?? 0 : draft.models[modelId]?.[field] ?? 0),
    onChange: e => {
      const num = Number(e.target.value)
      const next = Number.isFinite(num) && num >= 0 ? num : 0
      if (modelId === 'default') setDraft(d => ({ ...d, default: { ...d.default, [field]: next } }))
      else setTier(modelId, field, e.target.value)
    },
  })
  const now = config?.fetchedAt !== null && config?.fetchedAt !== undefined ? new Date(config.fetchedAt).toLocaleString() : t('neverSynced')
  const source = config?.priceSource === 'official' ? t('sourceOfficial') : t('sourceBundled')
  const caption = () => el('div', { className: 'dm-price-caption', role: 'presentation', 'aria-hidden': 'true' },
    el('span', null, t('modelName')),
    el('span', null, t('cacheHit')),
    el('span', null, t('cacheMiss')),
    el('span', null, t('output')),
    el('span', null, t('actions')))

  return el('div', { className: 'dm-subsection' },
    el('div', { className: 'dm-toolbar' },
      el('h2', { className: 'dm-h' }, t('pricesTitle')),
      el('div', { className: 'dm-row-actions' },
        el('button', { type: 'button', className: 'dm-btn ghost', onClick: sync, disabled: syncing || busy }, t('syncFromDocs')),
        el('button', { type: 'button', className: 'dm-btn', onClick: save, disabled: busy }, t('save')))),
    el('p', { className: 'dm-intro' }, t('peakNotice')),
    el('p', { className: 'dm-note' }, t('lastSync', { time: now, source })),
    notice !== null && el('p', { className: 'dm-notice ' + (notice.kind === 'err' ? 'err' : 'ok') }, notice.text),
    el('div', { className: 'dm-price-table' },
      caption(),
      Object.keys(draft.models).map(modelId => {
        const model = draft.models[modelId]
        return el('div', { key: modelId, className: 'dm-price-row' },
          el('div', { className: 'dm-price-fields' },
            el('span', { className: 'dm-price-name', title: modelId }, modelId,
              model.legacy === true && el('span', { className: 'dm-price-legacy' }, t('legacy'))),
            numberInput(modelId, 'cacheHit', modelId + ' ' + t('cacheHit')),
            numberInput(modelId, 'cacheMiss', modelId + ' ' + t('cacheMiss')),
            numberInput(modelId, 'output', modelId + ' ' + t('output')),
            el('button', {
              type: 'button', className: 'dm-icon-btn danger', 'aria-label': t('remove') + ' ' + modelId,
              onClick: () => removeModel(modelId),
            }, '\u00d7')),
          el('details', { className: 'dm-tier-details' },
            el('summary', { className: 'dm-tier-summary' }, t('tiersLabel')),
            el('div', { className: 'dm-tier-grid' },
              el('div', null, el('strong', null, t('offPeak')), tierLine(model.offPeak)),
              el('div', null, el('strong', null, t('peak')), tierLine(model.peak)),
              el('div', null, el('strong', null, t('legacyBase')), tierLine(model.legacyBase)))))
      }),
      el('div', { className: 'dm-price-row' },
        el('div', { className: 'dm-price-fields' },
          el('span', { className: 'dm-price-name' }, t('defaultModel')),
          numberInput('default', 'cacheHit', t('defaultModel') + ' ' + t('cacheHit')),
          numberInput('default', 'cacheMiss', t('defaultModel') + ' ' + t('cacheMiss')),
          numberInput('default', 'output', t('defaultModel') + ' ' + t('output')),
          el('span', { 'aria-hidden': 'true' })))),
        el('div', { className: 'dm-add-block' },
          addingModel && el('div', { className: 'dm-editor' },
            el('div', { className: 'dm-editor-head' },
              el('span', { className: 'dm-editor-title' }, t('addModelTitle'))),
            el('div', { className: 'dm-field' },
              el('label', null, t('modelSelectHint')),
              el('select', { className: 'dm-input', value: pickedModel, onChange: e => setPickedModel(e.target.value) },
                el('option', { value: '', disabled: true }, '\u2026'),
                modelGroups.map(group => el('optgroup', { key: group.id, label: group.name },
                  group.models.map(m => el('option', { key: group.id + ':' + m.id, value: m.id }, m.name && m.name !== m.id ? `${m.name} (${m.id})` : m.id)))))),
            el('div', { className: 'dm-grid3' },
              el('div', { className: 'dm-field' }, el('label', null, t('cacheHit')),
                el('input', { className: 'dm-input', type: 'number', step: '0.000001', min: '0', value: newHit, onChange: e => setNewHit(e.target.value) })),
              el('div', { className: 'dm-field' }, el('label', null, t('cacheMiss')),
                el('input', { className: 'dm-input', type: 'number', step: '0.000001', min: '0', value: newMiss, onChange: e => setNewMiss(e.target.value) })),
              el('div', { className: 'dm-field' }, el('label', null, t('output')),
                el('input', { className: 'dm-input', type: 'number', step: '0.000001', min: '0', value: newOutput, onChange: e => setNewOutput(e.target.value) }))),
            el('div', { className: 'dm-row-actions end' },
              el('button', {
                type: 'button', className: 'dm-btn ghost',
                onClick: () => { setAddingModel(false); setPickedModel(''); setNewHit('0'); setNewMiss('0'); setNewOutput('0') },
              }, t('cancel')),
              el('button', { type: 'button', className: 'dm-btn', onClick: addPicked, disabled: String(pickedModel ?? '').trim().length === 0 }, t('addModel')))),
          !addingModel && el('button', { type: 'button', className: 'dm-btn add', onClick: () => setAddingModel(true) }, t('addModel'))))
}

// ── 设置页根 ───────────────────────────────────────────────────────────

function SettingsSection(props) {
  const { useMonitor, api, t } = props
  const snap = useMonitor ? useMonitor(s => s) : null
  const config = snap?.config
  const status = snap?.status
  const [catalog, setCatalog] = useState(null)
  useEffect(() => {
    let cancelled = false
    api.listCatalog().then(
      value => { if (!cancelled) setCatalog(value) },
      () => { /* 目录读取失败:选择器退化为纯手输 */ },
    )
    return () => { cancelled = true }
  }, [api])
  if (config === null || config === undefined) {
    return el('div', { className: 'dm-section' },
      el('div', { className: 'dm-empty' }, status === 'error' ? (snap?.error ?? '') : t('loading')))
  }
  return el('div', { className: 'dm-section' },
    el(ProvidersSection, { config, api, t, catalog }),
    el(PricesSection, { config, api, t, catalog }))
}

module.exports = { SettingsSection }