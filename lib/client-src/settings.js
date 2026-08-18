/**
 * dsh-monitor 设置页「计费 / Billing」:模型价格配置 + 自官方同步;
 * 以及提供方用量查询的绑定表单(ProviderForm,由设置→模型 每行的
 * 「配置用量查询」图标触发,见 ./binding.js)。呈现对齐 DSH 设置页设计语言。
 */

const { createElement: el, useState, useEffect } = require('react')
const { createPortal } = require('react-dom')
const { Tooltip } = require('@deepseek-ai/dsh-client-ui-primitives')
const { activeCurrency, formatWindow, localHourToUtc, utcHourToLocal } = require('./format.js')

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
  // 模型级「峰谷」开关(存于价格条目 peakEnabled,持久化):关闭则只用基础价计费。
  // 默认:deepseek 开头模型开启,其余关闭。开关同时控制 空闲/高峰 编辑区显隐。
  const isDeepseek = id => String(id ?? '').toLowerCase().startsWith('deepseek')
  const peakEnabledOf = modelId => draft.models[modelId]?.peakEnabled ?? isDeepseek(modelId)
  const toggleTier = modelId => setDraft(d => ({
    ...d,
    models: {
      ...d.models,
      [modelId]: { ...(d.models[modelId] ?? {}), peakEnabled: !(d.models[modelId]?.peakEnabled ?? isDeepseek(modelId)) },
    },
  }))
  // 时间窗口编辑器:正在给哪个模型的哪个档位加窗口({modelId, tier}),以及新窗口的本地起止。
  const [winEdit, setWinEdit] = useState(null) // { modelId, tier }
  const [winStart, setWinStart] = useState('09:00')
  const [winEnd, setWinEnd] = useState('12:00')
  const beginWinEdit = (modelId, tier) => {
    if (winEdit !== null && winEdit.modelId === modelId && winEdit.tier === tier) setWinEdit(null)
    else { setWinEdit({ modelId, tier }); setWinStart('09:00'); setWinEnd('12:00') }
  }
  // 当前模型某档位的窗口数组(UTC {start,end})。
  const windowsOf = (modelId, tier) => Array.isArray(draft.models[modelId]?.windows?.[tier]) ? draft.models[modelId].windows[tier] : []
  // 两个窗口(半开 [start,end) 小时,支持跨午夜)是否有重叠:按单位小时集合判断。
  const windowsOverlap = (a, b) => {
    const inner = (w, h) => {
      const s = w.start, e = w.end
      if (s === undefined || e === undefined) return false
      if (s === e) return true // 全天窗口
      return s < e ? h >= s && h < e : h >= s || h < e
    }
    for (let h = 0; h < 24; h += 1) if (inner(a, h) && inner(b, h)) return true
    return false
  }
  // 一档位窗口组内是否存在两两重叠(返回首个冲突说明文案所需信息或缺省)。
  const findOverlap = wins => {
    for (let i = 0; i < wins.length; i += 1) {
      for (let j = i + 1; j < wins.length; j += 1) {
        if (windowsOverlap(wins[i], wins[j])) return [wins[i], wins[j]]
      }
    }
    return null
  }
  // 保存模型某档位窗口(写进草稿;空窗口移除该档,两档都空移除 windows)。
  const setWindows = (modelId, tier, wins) => {
    setDraft(d => {
      const entry = d.models[modelId] ?? {}
      const windows = { ...(entry.windows ?? {}) }
      if (wins.length === 0) delete windows[tier]
      else windows[tier] = wins
      const next = { ...entry }
      if (Object.keys(windows).length === 0) delete next.windows
      else next.windows = windows
      return { ...d, models: { ...d.models, [modelId]: next } }
    })
  }
  // 提交一个本地时间窗口(转为 UTC);与同档位已有窗口重叠时提示并拒绝。
  const [winError, setWinError] = useState(null)
  const addWindow = () => {
    if (winEdit === null) return
    const parse = hhmm => {
      const m = /^(\d{1,2}):(\d{2})$/.exec(String(hhmm ?? ''))
      if (m === null) return null
      const h = Number(m[1])
      return h >= 0 && h <= 23 ? h : null
    }
    const from = parse(winStart)
    const to = parse(winEnd || winStart)
    if (from === null || to === null) return
    const candidate = { start: localHourToUtc(from), end: localHourToUtc(to) }
    if (windowsOf(winEdit.modelId, winEdit.tier).some(w => windowsOverlap(w, candidate))) {
      setWinError(t('windowsOverlap'))
      return
    }
    setWinError(null)
    const wins = [...windowsOf(winEdit.modelId, winEdit.tier), candidate]
    setWindows(winEdit.modelId, winEdit.tier, wins)
    setWinEdit(null)
  }
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
    // 注意:同步重建时若模型尚无显式 peakEnabled,peakEnabledOf 会回退到默认规则
    // (deepseek 开/其余关),无需额外维护开关集合。
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
    // 保存前校验:任意模型任一时段档位的窗口存在重叠 → 拒绝保存。
    for (const modelId of Object.keys(draft.models)) {
      const windows = draft.models[modelId]?.windows
      if (windows === undefined || windows === null) continue
      for (const tier of ['peak', 'offPeak']) {
        if (Array.isArray(windows[tier]) && findOverlap(windows[tier]) !== null) {
          setNotice({ kind: 'err', text: t('windowsOverlap') + ' · ' + modelId + ' · ' + t(tier) })
          return
        }
      }
    }
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

  // 某档位的时间窗口块:已加窗口标签(可删)+「添加」按钮;点击后内联输入本地起止时间。
  const tierWindowsBlock = (modelId, tier) => {
    const wins = windowsOf(modelId, tier)
    const editing = winEdit !== null && winEdit.modelId === modelId && winEdit.tier === tier
    const tag = (w, i) => el('span', { key: tier + ':' + i, className: 'dm-window-tag' },
      formatWindow(w),
      el('button', {
        type: 'button', className: 'dm-window-remove', 'aria-label': t('remove'),
        onClick: () => setWindows(modelId, tier, wins.filter((_, j) => j !== i)),
      }, '\u00d7'))
    return el('div', { className: 'dm-tier-windows' },
      el('span', { className: 'dm-window-label' }, t('windowsLabel')),
      wins.map(tag),
      !editing && el('button', {
        type: 'button', className: 'dm-window-add', 'aria-label': t('addWindow'), title: t('addWindow'),
        onClick: () => beginWinEdit(modelId, tier),
      }, '+'),
      editing && el('span', { className: 'dm-window-edit' },
        el('input', { className: 'dm-input dm-num', type: 'time', step: '3600', value: winStart, 'aria-label': t('windowStart'), onChange: e => setWinStart(e.target.value) }),
        '\u2013',
        el('input', { className: 'dm-input dm-num', type: 'time', step: '3600', value: winEnd, 'aria-label': t('windowEnd'), onChange: e => setWinEnd(e.target.value) }),
        el('button', { type: 'button', className: 'dm-btn ghost small', onClick: addWindow }, t('save')),
        el('button', { type: 'button', className: 'dm-icon-btn', 'aria-label': t('cancel'), onClick: () => { setWinEdit(null); setWinError(null) } }, '\u00d7')),
      editing && winError !== null && el('span', { className: 'dm-window-error' }, winError))
  }

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
        const open = peakEnabledOf(modelId)
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
            tierWindowsBlock(modelId, 'offPeak'),
            el('div', { className: 'dm-tier-row' },
              el('span', { className: 'dm-tier-name' }, t('peak')),
              tierNumberInput(modelId, 'peak', 'cacheHit', modelId + ' ' + t('peak') + ' ' + t('cacheHit')),
              tierNumberInput(modelId, 'peak', 'cacheMiss', modelId + ' ' + t('peak') + ' ' + t('cacheMiss')),
              tierNumberInput(modelId, 'peak', 'output', modelId + ' ' + t('peak') + ' ' + t('output'))),
            tierWindowsBlock(modelId, 'peak')))
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
                // 排除已设置过定价的模型(已在草稿中的)。
                modelGroups.map(group => {
                  const pending = group.models.filter(m => draft.models[m.id] === undefined)
                  if (pending.length === 0) return null
                  return el('optgroup', { key: group.id, label: group.name },
                    pending.map(m => el('option', { key: group.id + ':' + m.id, value: m.id }, m.name && m.name !== m.id ? `${m.name} (${m.id})` : m.id)))
                })),
              // 所有模型都已定价:明确提示,避免下拉空白令人困惑(目录为空时不算)。
              (catalog?.models?.length ?? 0) > 0 && modelGroups.every(g => g.models.every(m => draft.models[m.id] !== undefined)) && el('p', { className: 'dm-note' }, t('noModelsLeft'))),
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

// ── 设置页:用量汇总(柱形图 + 汇总卡片 + 会话列表) ─────────────────────

const { BarChart, dayKey, monthStartKey, shortLabel, tokensOf } = require('./chart.js')

const RANGE_PRESETS = ['today', '7d', '30d', 'month', 'custom']
const RANGE_KEY = { today: 'rangeToday', '7d': 'range7d', '30d': 'range30d', month: 'rangeMonth', custom: 'rangeCustom' }
const CARD_RANGE = { today: { start: dayKey(0) }, month: { start: monthStartKey() } }

/** 从某个日期字符串的本地零点向当前月推进(仅在展开区间时用于端到端补齐)。 */
function padToToday(next) {
  const today = dayKey(0)
  return next < today ? next : today
}

function UsageSummarySection(props) {
  const { api, t, locale, config, catalog } = props
  const currencyFor = () => {
    const active = require('./format.js').activeCurrency
    return active(locale ?? config?.locale)
  }
  const symbol = currencyFor() === 'cny' ? '¥' : '$'
  const decimals = Math.max(0, Math.min(10, Math.floor(Number(config?.decimals) || 4)))
  const fmtMoney = v => symbol + Number(v ?? 0).toFixed(decimals).replace(/\.?0+$/, '')
  const fmtTokens = v => {
    const n = Number(v ?? 0)
    if (n < 1000) return String(Math.round(n))
    if (n < 1000000) return String(Math.round(n / 1000 * 10) / 10) + 'K'
    return String(Math.round(n / 1000000 * 10) / 10) + 'M'
  }

  const [preset, setPreset] = useState('7d')
  const [customFrom, setCustomFrom] = useState(dayKey(-6))
  const [customTo, setCustomTo] = useState(dayKey(0))
  const [provider, setProvider] = useState('')
  const [model, setModel] = useState('')
  const [data, setData] = useState(null)
  const [cards, setCards] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  // 从目录取当前提供方下的模型列表(默认全部)。
  const providerModels = catalog?.models
    ?.filter(m => m.provider === provider)
    .map(m => ({ id: m.id, name: m.name || m.id })) ?? []
  // 提供方列表:设置→模型 目录里的 providers 优先,其次用量数据里出现过的。
  const providerOptions = catalog?.providers ?? []

  const rangeOf = () => {
    if (preset === 'custom') return { start: customFrom, end: customTo }
    if (preset === 'today') return { start: dayKey(0) }
    if (preset === '7d') return { start: dayKey(-6) }
    if (preset === '30d') return { start: dayKey(-29) }
    return { start: monthStartKey() }
  }

  const load = () => {
    setLoading(true)
    const query = { range: rangeOf() }
    if (provider !== '') query.providers = [provider]
    if (model !== '') query.models = [model]
    Promise.all([
      api.getUsage(query),
      api.getUsage({ range: CARD_RANGE.today }),
      api.getUsage({ range: CARD_RANGE.month }),
    ]).then(
      ([summary, today, month]) => {
        setData(summary)
        setCards({ today, month })
        setError(null)
      },
      err => { setError(err?.message ?? String(err)) },
    ).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [preset, provider, model]) // eslint-disable-line react-hooks/exhaustive-deps

  const card = (label, summary) => el('div', { key: label, className: 'dm-summary-card' },
    el('div', { className: 'dm-summary-card-label' }, label),
    el('div', { className: 'dm-summary-card-val' }, fmtTokens(summary?.totals ? tokensOf(summary.totals) : 0)),
    el('div', { className: 'dm-summary-card-sub' },
      t('cardCost', { amount: fmtMoney(summary?.totals?.cost ?? 0) }) + ' · '
      + t('cardCalls', { calls: Number(summary?.totals?.calls ?? 0) })))

  return el('div', { className: 'dm-subsection' },
    el('div', { className: 'dm-toolbar' },
      el('h2', { className: 'dm-h' }, t('usageSummaryTitle'))),
    el('p', { className: 'dm-intro' }, t('usageSummaryIntro')),

    el('div', { className: 'dm-row dm-filter-row' },
      RANGE_PRESETS.map(key => el('button', {
        key, type: 'button',
        className: 'dm-btn small' + (preset === key ? ' active' : ''),
        onClick: () => setPreset(key),
      }, t(RANGE_KEY[key]))),
      preset === 'custom' && el('div', { className: 'dm-row dm-filter-range' },
        el('input', { className: 'dm-input', type: 'date', value: customFrom, 'aria-label': t('rangeStart'), onChange: e => setCustomFrom(e.target.value) }),
        '\u2013',
        el('input', { className: 'dm-input', type: 'date', value: customTo, 'aria-label': t('rangeEnd'), onChange: e => setCustomTo(e.target.value) }))),

    el('div', { className: 'dm-row dm-filter-row' },
      el('label', { className: 'dm-filter-label' }, t('providerFilter')),
      el('select', { className: 'dm-input', value: provider, onChange: e => { setProvider(e.target.value); setModel('') } },
        el('option', { value: '' }, t('providerAll')),
        providerOptions.map(p => el('option', { key: p.id, value: p.id }, p.name || p.id))),
      el('label', { className: 'dm-filter-label' }, t('modelFilter')),
      el('select', { className: 'dm-input', value: model, onChange: e => setModel(e.target.value), disabled: provider === '' },
        el('option', { value: '' }, t('modelAll')),
        providerModels.map(m => el('option', { key: m.id, value: m.id }, m.name || m.id)))),

    el('div', { className: 'dm-summary-cards' },
      cards === null ? el('div', { className: 'dm-empty' }, t('loading')) : el('div', { className: 'dm-summary-cards' },
        card(t('todayCard'), cards.today),
        card(t('monthCard'), cards.month))),

    (loading && data === null) && el('div', { className: 'dm-empty' }, t('loading')),
    error !== null && el('div', { className: 'dm-empty' }, error),
    data !== null && el('div', { className: 'dm-subsection' },
      el('div', { className: 'dm-toolbar' },
        el('h2', { className: 'dm-h' }, t('chartByDay'))),
      el(BarChart, {
        data: data.byDay, t, height: 150,
        valueOf: row => tokensOf(row),
        labelOf: row => shortLabel(row.date),
        tipOf: row => `${row.date} · ${t('cardTokens', { tokens: fmtTokens(tokensOf(row)) })} · ${t('cardCost', { amount: fmtMoney(row.cost) })}`,
      }),
      el('div', { className: 'dm-toolbar' },
        el('h2', { className: 'dm-h' }, t('sessionListTitle'))),
      data.sessions.length === 0
        ? el('div', { className: 'dm-empty' }, t('noUsageSummary'))
        : el('div', { className: 'dm-table-wrap' },
          el('table', { className: 'dm-table' },
            el('thead', null, el('tr', null,
              el('th', null, t('sessionId')),
              el('th', null, t('sessionDate')),
              el('th', { className: 'num' }, t('sessionTokens')),
              el('th', { className: 'num' }, t('sessionCalls')),
              el('th', { className: 'num' }, t('sessionCost')))),
            el('tbody', null, data.sessions.slice(0, 100).map(row =>
              el('tr', { key: row.id },
                el('td', { className: 'id', title: row.id }, row.id.length > 20 ? row.id.slice(0, 20) + '…' : row.id),
                el('td', null, row.date),
                el('td', { className: 'num' }, fmtTokens(tokensOf(row))),
                el('td', { className: 'num' }, String(Number(row.calls ?? 0))),
                el('td', { className: 'num' }, fmtMoney(row.cost)))))))))
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
    el(PricesSection, { config, api, t, catalog, locale: locale ?? config?.locale }),
    el(UsageSummarySection, { config, api, t, catalog }))
}

module.exports = { ProviderForm, SettingsSection }