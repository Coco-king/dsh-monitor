/**
 * dsh-monitor 设置页「计费 / Billing」:模型价格配置 + 自官方同步;
 * 以及提供方用量查询的绑定表单(ProviderForm,由设置→模型 每行的
 * 「配置用量查询」图标触发,见 ./binding.js)。呈现对齐 DSH 设置页设计语言。
 */

const { createElement: el, useState, useEffect } = require('react')
const { createPortal } = require('react-dom')
const { Tooltip } = require('@deepseek-ai/dsh-client-ui-primitives')
const { activeCurrency } = require('./format.js')

/** 问号图标:悬浮(或聚焦)显示字段含义。 */
function FieldHint({ text }) {
  return el(Tooltip, { label: text, side: 'top', delayMs: 400 },
    el('span', { className: 'dm-hint', role: 'img', 'aria-label': text, tabIndex: 0 }, '?'))
}

/** OpenCode Go 用量接口响应示例截图(build 时经 esbuild dataurl loader 内联为 data URI)。 */
const SAMPLE_IMG = require('./assets/opencode-usage-sample.png')

// ── 设置页:提供方配置 ─────────────────────────────────────────────────

function ProviderForm(props) {
  const { initial, onSave, onCancel, t, options } = props
  const [provider, setProvider] = useState(initial?.provider ?? '')
  const [enabled, setEnabled] = useState(initial?.enabled !== false)
  const [refreshMinutes, setRefreshMinutes] = useState(String(initial?.refreshMinutes ?? 15))
  const [apiKey, setApiKey] = useState(initial?.apiKey ?? '')
  const [url, setUrl] = useState(initial?.custom?.url ?? '')
  const [headerPairs, setHeaderPairs] = useState(() => {
    const h = initial?.custom?.headers ?? {}
    const entries = Object.keys(h).map(key => ({ key, value: String(h[key] ?? '') }))
    return entries.length > 0 ? entries : [{ key: '', value: '' }]
  })
  const [items, setItems] = useState(
    initial?.custom?.items && initial.custom.items.length > 0
      ? initial.custom.items.map(it => ({ ...it, maxPath: it.maxPath ?? '', resetsAtPath: it.resetsAtPath ?? '' }))
      : [{ key: '', label: '', kind: 'percent', path: '', maxPath: '', resetsAtPath: '' }],
  )
  const updateItem = (index, field, value) => {
    setItems(list => list.map((it, i) => (i === index ? { ...it, [field]: value } : it)))
  }
  const updateHeader = (index, field, value) => {
    setHeaderPairs(list => list.map((pair, i) => (i === index ? { ...pair, [field]: value } : pair)))
  }
  // OpenCode Go 额度接口的示例窗口:用于条目输入框 placeholder 引导(按条目序滚动/本周/本月)。
  const GO_EXAMPLES = [
    { key: 'rolling', labelKey: 'exampleRolling' },
    { key: 'weekly', labelKey: 'exampleWeekly' },
    { key: 'monthly', labelKey: 'exampleMonthly' },
  ]
  const goExample = index => GO_EXAMPLES[index] ?? GO_EXAMPLES[GO_EXAMPLES.length - 1]
  const tItem = field => t('item' + field[0].toUpperCase() + field.slice(1))
  // 查询方式:绑定场景由用户在下拉框选择 deepseek官方 / opencode-go / 自定义(默认按 ID 推导)。
  const derivePreset = id => {
    const s = String(id ?? '').trim().toLowerCase()
    if (s === 'deepseek-official' || s === 'deepseek') return 'deepseek'
    if (s.includes('opencode')) return 'opencode'
    return 'custom'
  }
  const [preset, setPreset] = useState(initial?.preset ?? derivePreset(provider))
  const submit = () => {
    const headers = {}
    for (const pair of headerPairs) {
      const key = String(pair?.key ?? '').trim()
      const value = String(pair?.value ?? '')
      if (key.length > 0) headers[key] = value // 键为空的行忽略;值为空照常保留
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
  const [showSample, setShowSample] = useState(false)
  return el('div', { className: 'dm-editor' },
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
    field(t('presetChoose'), el('select', { className: 'dm-input', value: preset, onChange: e => setPreset(e.target.value) },
        el('option', { value: 'deepseek' }, t('presetOptDeepseek')),
        el('option', { value: 'opencode' }, t('presetOptOpencode')),
        el('option', { value: 'custom' }, t('presetOptCustom')))),
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
      field(t('customHeaders'), el('div', { className: 'dm-header-list' },
        headerPairs.map((pair, i) => el('div', { key: i, className: 'dm-header-row' },
          el('input', { className: 'dm-input', 'aria-label': t('headerKey'), placeholder: 'Authorization', value: pair.key, onChange: e => updateHeader(i, 'key', e.target.value) }),
          el('input', { className: 'dm-input', 'aria-label': t('headerValue'), placeholder: 'Bearer {apiKey}', value: pair.value, onChange: e => updateHeader(i, 'value', e.target.value) }),
          el('button', {
            type: 'button', className: 'dm-icon-btn danger', 'aria-label': t('remove'),
            onClick: () => setHeaderPairs(list => list.filter((_, j) => j !== i)),
          }, '\u00d7'))),
        el('button', { type: 'button', className: 'dm-btn ghost small', style: { justifySelf: 'start' }, onClick: () => setHeaderPairs(list => [...list, { key: '', value: '' }]) }, t('addHeader')),
        el('p', { className: 'dm-note' }, t('customHeadersNote'))), t('customHeadersHint')),
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
              field(tItem('key'), el('input', { className: 'dm-input', type: 'text', placeholder: goExample(i).key, value: it.key, onChange: e => updateItem(i, 'key', e.target.value) }), t('itemKeyHint')),
              field(tItem('label'), el('input', { className: 'dm-input', type: 'text', placeholder: t(goExample(i).labelKey), value: it.label, onChange: e => updateItem(i, 'label', e.target.value) }), t('itemLabelHint'))),
            el('div', { className: 'dm-grid2' },
              field(tItem('kind'), el('select', { className: 'dm-input', value: it.kind, onChange: e => updateItem(i, 'kind', e.target.value) },
                el('option', { value: 'percent' }, t('kindPercent')),
                el('option', { value: 'number' }, t('kindNumber')),
                el('option', { value: 'money' }, t('kindMoney')),
                el('option', { value: 'text' }, t('kindText'))), t('itemKindHint')),
              field(tItem('path'), el('input', { className: 'dm-input', type: 'text', placeholder: 'usage.' + goExample(i).key + '.percent', value: it.path, onChange: e => updateItem(i, 'path', e.target.value) }), t('itemPathHint'))),
            el('div', { className: 'dm-grid2' },
              field(tItem('maxPath'), el('input', { className: 'dm-input', type: 'text', placeholder: '1000000', value: String(it.maxPath ?? ''), onChange: e => updateItem(i, 'maxPath', e.target.value) }), t('itemMaxPathHint')),
              field(tItem('resetsAtPath'), el('input', { className: 'dm-input', type: 'text', placeholder: 'usage.' + goExample(i).key + '.resetsAt', value: String(it.resetsAtPath ?? ''), onChange: e => updateItem(i, 'resetsAtPath', e.target.value) }), t('itemResetsAtHint')))))),
        el('button', { type: 'button', className: 'dm-btn ghost small', style: { alignSelf: 'flex-start' }, onClick: () => setItems(list => [...list, { key: '', label: '', kind: 'percent', path: '', maxPath: '', resetsAtPath: '' }]) }, t('addItem'))),
        el('details', { className: 'dm-custom-explain' },
          el('summary', null, t('customItemsExplainTitle')),
          el('div', { className: 'dm-custom-explain-body' },
            el('p', { className: 'dm-note' }, t('customItemsExplain')),
            el('div', { className: 'dm-row-actions' },
              el('button', { type: 'button', className: 'dm-btn ghost small', onClick: () => setShowSample(true) }, t('viewSample')))))),
    el('div', { className: 'dm-row-actions end' },
      el('button', { type: 'button', className: 'dm-btn ghost', onClick: onCancel }, t('cancel')),
      el('button', { type: 'button', className: 'dm-btn', onClick: submit, disabled: provider.trim().length === 0 || (preset === 'custom' && url.trim().length === 0) }, t('save'))),
    showSample && createPortal(
      el('div', { className: 'dm-img-layer', onClick: e => { if (e.target === e.currentTarget) setShowSample(false) } },
        el('div', { className: 'dm-img-card' },
          el('img', { src: SAMPLE_IMG, alt: t('viewSample'), className: 'dm-img' }),
          el('div', { className: 'dm-img-actions' },
            el('button', { type: 'button', className: 'dm-btn ghost small', onClick: () => setShowSample(false) }, t('cancel'))))),
      document.body))
}

// ── 设置页:计费价格 + 官方同步 ─────────────────────────────────────────

function PricesSection(props) {
  const { config, api, t, catalog, locale } = props
  // 按生效语言选表(zh → cny,其余 → usd):当前展示/编辑/保存都作用于该子表。
  const currency = activeCurrency(locale ?? config?.locale)
  const table = config?.prices?.[currency]
  const [draft, setDraft] = useState(() => ({
    models: Object.fromEntries(Object.entries(table?.models ?? {}).map(([id, p]) => [id, { ...p }])),
    default: { ...(table?.default ?? { cacheHit: 0, cacheMiss: 0, output: 0 }) },
  }))
  const [pickedModel, setPickedModel] = useState('')
  const [addingModel, setAddingModel] = useState(false)
  const [newHit, setNewHit] = useState('0')
  const [newMiss, setNewMiss] = useState('0')
  const [newOutput, setNewOutput] = useState('0')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState(null)
  const [syncing, setSyncing] = useState(false)
  // 峰谷档位编辑区(空闲/高峰)的展示开关:deepseek 模型默认展开(开启),其余默认收起。
  const isDeepseek = id => String(id ?? '').toLowerCase().startsWith('deepseek')
  const [openTiers, setOpenTiers] = useState(() => new Set(Object.keys(table?.models ?? {}).filter(isDeepseek)))
  const toggleTier = modelId => setOpenTiers(s => {
    const next = new Set(s)
    if (next.has(modelId)) next.delete(modelId)
    else next.add(modelId)
    return next
  })
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

  // 官方同步后按生效币种的新价格表重建草稿(仅在 fetchedAt 变化时,避免覆盖用户编辑)。
  useEffect(() => {
    const cur = config?.prices?.[currency]
    setDraft({
      models: Object.fromEntries(Object.entries(cur?.models ?? {}).map(([id, p]) => [id, { ...p }])),
      default: { ...(cur?.default ?? { cacheHit: 0, cacheMiss: 0, output: 0 }) },
    })
    // 同步新增的 deepseek 模型默认展开峰谷档位(与初始开关语义一致)。
    setOpenTiers(s => {
      const next = new Set(s)
      for (const id of Object.keys(cur?.models ?? {})) if (isDeepseek(id)) next.add(id)
      return next
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
      // 只提交当前生效币种的子表,另一张价格表保持不变。
      await api.updateConfig({
        prices: {
          ...(config?.prices ?? {}),
          [currency]: { models: draft.models, default: draft.default },
        },
      })
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
  const numberInput = (modelId, field, label) => el('input', {
    className: 'dm-input dm-num', type: 'number', step: '0.000001', min: '0', 'aria-label': label,
    value: String(modelId === 'default' ? draft.default?.[field] ?? 0 : draft.models[modelId]?.[field] ?? 0),
    onChange: e => {
      const num = Number(e.target.value)
      const next = Number.isFinite(num) && num >= 0 ? num : 0
      if (modelId === 'default') setDraft(d => ({ ...d, default: { ...d.default, [field]: next } }))
      else setTier(modelId, field, e.target.value)
    },
  })
  // 折叠区的峰谷档位输入(offPeak/peak 各三桶):写 models[id][tierKey][field]。
  const tierNumberInput = (modelId, tierKey, field, label) => el('input', {
    className: 'dm-input dm-num', type: 'number', step: '0.000001', min: '0', 'aria-label': label,
    value: String(draft.models[modelId]?.[tierKey]?.[field] ?? 0),
    onChange: e => {
      const num = Number(e.target.value)
      const next = Number.isFinite(num) && num >= 0 ? num : 0
      setDraft(d => ({
        ...d,
        models: {
          ...d.models,
          [modelId]: {
            ...(d.models[modelId] ?? {}),
            [tierKey]: { ...(d.models[modelId]?.[tierKey] ?? {}), [field]: next },
          },
        },
      }))
    },
  })
  // 把该模型「基础价」(主行三桶)复制到空闲价。
  const applyBaseTier = modelId => setDraft(d => {
    const entry = d.models[modelId] ?? {}
    return {
      ...d,
      models: {
        ...d.models,
        [modelId]: {
          ...entry,
          offPeak: { cacheHit: entry.cacheHit ?? 0, cacheMiss: entry.cacheMiss ?? 0, output: entry.output ?? 0 },
        },
      },
    }
  })
  // 「应用基础价」图标(下灌箭头,语义:把基础价复制下来)。
  const ApplyDownIcon = ({ size = 14 } = {}) => el('svg', { width: size, height: size, viewBox: '0 0 16 16', fill: 'none', xmlns: 'http://www.w3.org/2000/svg', 'aria-hidden': 'true' },
    el('path', { d: 'M8 2.5V10.5M4.5 7l3.5 3.5L11.5 7', stroke: 'currentColor', strokeWidth: '1.6', strokeLinecap: 'round', strokeLinejoin: 'round' }),
    el('path', { d: 'M3 12.5h10v1H3z', fill: 'currentColor' }))
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
        const open = openTiers.has(modelId)
        return el('div', { key: modelId, className: 'dm-price-row' },
          el('div', { className: 'dm-price-fields' },
            el('span', { className: 'dm-price-name', title: modelId }, modelId,
              el('span', { className: 'dm-price-base' }, t('basePrice'))),
            numberInput(modelId, 'cacheHit', modelId + ' ' + t('cacheHit')),
            numberInput(modelId, 'cacheMiss', modelId + ' ' + t('cacheMiss')),
            numberInput(modelId, 'output', modelId + ' ' + t('output')),
            el('span', { className: 'dm-price-actions' },
              el('label', { className: 'dm-switch', title: t('tiersToggle'), style: { whiteSpace: 'nowrap' } },
                el('input', { type: 'checkbox', checked: open, onChange: () => toggleTier(modelId) }),
                t('tiersToggle')),
              el('button', {
                type: 'button', className: 'dm-icon-btn danger', 'aria-label': t('remove') + ' ' + modelId,
                onClick: () => removeModel(modelId),
              }, '\u00d7'))),
          open && el('div', { className: 'dm-tier-edits' },
            el('div', { className: 'dm-tier-row' },
              el('span', { className: 'dm-tier-name' }, t('offPeak')),
              tierNumberInput(modelId, 'offPeak', 'cacheHit', modelId + ' ' + t('offPeak') + ' ' + t('cacheHit')),
              tierNumberInput(modelId, 'offPeak', 'cacheMiss', modelId + ' ' + t('offPeak') + ' ' + t('cacheMiss')),
              tierNumberInput(modelId, 'offPeak', 'output', modelId + ' ' + t('offPeak') + ' ' + t('output')),
              el('button', {
                type: 'button', className: 'dm-icon-btn', 'aria-label': t('applyBase'), title: t('applyBase'),
                onClick: () => applyBaseTier(modelId),
              }, ApplyDownIcon({ size: 14 }))),
            el('div', { className: 'dm-tier-row' },
              el('span', { className: 'dm-tier-name' }, t('peak')),
              tierNumberInput(modelId, 'peak', 'cacheHit', modelId + ' ' + t('peak') + ' ' + t('cacheHit')),
              tierNumberInput(modelId, 'peak', 'cacheMiss', modelId + ' ' + t('peak') + ' ' + t('cacheMiss')),
              tierNumberInput(modelId, 'peak', 'output', modelId + ' ' + t('peak') + ' ' + t('output')))))
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
  const { useMonitor, api, t, locale } = props
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
    el(PricesSection, { config, api, t, catalog, locale: locale ?? config?.locale }))
}

module.exports = { ProviderForm, SettingsSection }