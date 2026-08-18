# dsh-monitor 设计文档

- 日期：2026-08-17
- 状态：已确认（方案 A + 修订项）
- 参考实现：`dsh-cost-meter`（MIT，位于 `C:\Workspace\Projects\OpenSource\dsh-plugin\dsh-cost-meter`）

## 1. 背景与目标

为 DeepSeek Harness Web 提供两个能力：

1. **会话计费**：包裹 `llm/stream` 捕获每次模型调用的 usage，按价格表实时计算会话累计费用，在会话头部显示费用角标。计费必须**保留峰谷计价**（空闲/高峰两档 + 历史基础价），并支持**官方价格一键同步**（`https://api-docs.deepseek.com/quick_start/pricing`，抓英文页解析）；默认价表预置 deepseek-v4-flash / deepseek-v4-pro 两个模型。
2. **通用提供方用量查询**：按模型提供方配置，每提供方一条配置，预设三选一（DeepSeek 官方 / OpenCode / 自定义），由 Host 抓取额度，在**模型切换器左侧**的用量图标面板中展示**当前会话所用提供方**的用量。

用户拍板的细节：

- 图标位置：`conversation.input.right`（模型座左侧；ContextMeter 右侧无 Slot，已向用户说明并确认）。
- 面板头部：提供方名字 + preset 徽标 + **刷新图标**；底部显示上次获取时间。
- 面板只展示当前会话提供方的额度，不做全列表。
- 会话费用角标：`conversation.session.header.actions`，中英双语。

## 2. 方案：独立双面包 npm 包

完全仿照 dsh-cost-meter 的包结构（MIT 参考），独立 repo `dsh-monitor`：

```
dsh-monitor/
├── package.json          # dsh.bundle.patch + dsh.client(platform: web) + exports(. /client /typert)
├── cordis.patch.yml      # - insert: [{ id: monitor, name: dsh-monitor }]
├── lib/
│   ├── index.js          # 插件主体 apply(ctx)
│   ├── store.js          # 账本 + 配置校验
│   ├── pricing.js        # 价格表/峰谷/官方页解析/计费数学（沿用 cost-meter，砍无关项）
│   ├── typert.host.js    # 手写 Typert 清单（zod v4 codec）
│   └── client.js         # 浏览器半边（图标/面板/角标/设置页）
├── test/                 # node:test 单元测试
└── README.md             # 中英
```

依赖：`@deepseek-ai/dsh-home-paths`、`@deepseek-ai/dsh-credentials`、`zod`。

安装：`dsh plugin --profile web add <本目录>`（pnpm 转发 → 包声明 `dsh.bundle.patch` 自动进入 `dsh.profile.bundles` 层栈）。

## 3. 架构与数据流

```
Host（Node）
  llm/stream 瀑布包裹 ─→ Ledger.account(usage, model, sessionId, now)
                            │  day→session 聚合，原子写落盘
                            │  $DSH_HOME/storages/dsh-monitor/ledger.json {version, config, days}
                            ▼
                      sessionProjections.register(costUsage)  ← 会话 token 桶投影（事件源回放）
  monitor 服务（typertRemote）
    getProviderUsage(providerId) ─→ preset 抓取器（deepseek|opencode|custom）
    refreshProvider(providerId)  ─→ 强制刷新
    getConfig / updateConfig(patch) → 校验 + 持久化
    fetchPrices() ─→ 抓官方定价页 → 应用价格表 + 峰谷窗口

Client（浏览器）
  conversation.input.right        → 用量图标按钮 → 点击面板（当前提供方额度）
  conversation.session.header.actions → 会话费用角标（useProjection('costUsage') + 价格配置，客户端计价，实时、零轮询）
  settings.section                → 提供方配置 + 价格表/官方同步 UI
  数据：remote.monitor.*（Typert RPC）；60s 轮询 + visibilitychange + connection/reset 重拉（getConfig 快照）
```

计费双轨与 cost-meter 一致：**Host 账本记账**（持久化、权威聚合），**客户端投影计价**（角标实时显示；投影随会话事件回放，刷新/重载后依然准确）。两侧价格数学读写同一份 `config.prices`。

## 4. Host 半边

### 4.1 账本（`store.js`）

- `Ledger`：`days[YYYY-MM-DD] → { date, input, output, cacheRead, cacheWrite, calls, cost, sessions: [{id, 同上}] }`。
- `account(tokens, modelId, sessionId, atMs)`：归一化 token 桶 → `costOf` 计费（按事件时刻的档位，保证历史正确）→ 日/会话聚合 → `prune()`（按 `historyDays` 保留）→ `scheduleWrite()`（2s 防抖原子写：tmp 文件 + rename）。
- `close()`：卸载/退出前最终落盘。
- 配置 `Ledger.config` 随 `ledger.json` 持久化，新键用默认值补齐。
- 会话上限 `MAX_SESSIONS_PER_DAY = 200`。

### 4.2 计费（`pricing.js`，沿用 cost-meter）

- 三桶价格：`{ cacheHit, cacheMiss, output }`（美元 / 1M tokens）；`completeTier` 补齐规则（cacheMiss 缺省取 input、cacheHit 缺省取 cacheMiss、output 缺省 0）。
- 峰谷：`DEFAULT_PEAK_WINDOWS = [{1,4},{6,10}]`（UTC）、`DEFAULT_PEAK_EFFECTIVE_AT = 2026-08-01T00:00:00Z`、历史分界 `LEGACY_BASE_BOUNDARY = 2026-08-16T16:00:00Z`；`tierFor(atMs)`：生效前按 `legacyBase`，生效后峰段取 `peak`、谷段取 `offPeak`。
- 默认价表 `DEFAULT_PRICE_TABLE`：**deepseek-v4-flash、deepseek-v4-pro**（三桶 + offPeak/peak/legacyBase），`default` 回退（flash 数值）。（2026-08-18 移除旧模型别名 deepseek-chat / deepseek-reasoner。）
- 官方同步：`OFFICIAL_PRICING_URL = https://api-docs.deepseek.com/quick_start/pricing`，`fetchPricingHtml`（20s 超时 + UA + 短页守卫）→ `parsePricingHtml`（表格解析出 models / effectiveAt / peakWindows）→ merge 进 `config.prices`，`priceSource = 'official'`。
- 客户端需要同款数学的轻量副本（`priceEntryFor` / `tierFor` / `costOf` / 金额格式化）。

### 4.3 提供方用量查询（新核心）

配置模型（`config.providers[providerId]`）：

```jsonc
{
  "enabled": true,
  "preset": "deepseek" | "opencode" | "custom",
  "refreshMinutes": 15,
  "apiKey": "",            // opencode/custom 可选；空 = 自动发现
  "custom": {              // 仅 preset=custom
    "url": "https://...",
    "headers": { "Authorization": "Bearer {apiKey}" }, // 支持 {apiKey} 占位替换
    "items": [
      { "key": "weekly", "label": "本周", "kind": "percent",
        "path": "usage.weekly.percent", "maxPath": null, "resetsAtPath": "usage.weekly.resetsAt" }
    ]
  }
}
```

- **deepseek 预设**：复用 `settings.get('llm-deepseek')` 的 baseURL / apiKeyEnv → 凭证解析（credentials → env）→ 官方域名守卫（仅 `api.deepseek.com`，否则拒绝且不发 Key）→ GET `{base}/user/balance` → 一条目 `余额`（kind money，value = total_balance，子项赠送/充值）。
- **opencode 预设**：GET `https://opencode.ai/zen/go/v1/usage`，Bearer Key（显式 → 凭证 `OPENCODE_GO_API_KEY` → env `OPENCODE_GO_API_KEY|OPENCODE_API_KEY` → `auth.json` 兜底），浏览器 UA（防 Cloudflare 1010），15s 超时 → 三条目：**5小时 / 本周 / 本月**（kind percent，`resetsAt` 显示重置时间）。
- **custom 预设**：`fetch(url, { method: 'GET', headers })`（v1 仅 GET + JSON 响应），按 `items[].path`（点路径）逐条提取；`maxPath: string | number | null`——`number` 为固定上限常量，`string` 为 JSON 路径（指向响应内的上限值），`null` 表示无上限；存在上限时计算 percent = value/max×100；`kind`：percent | number | money | text。
- 每提供方独立的进程内缓存 `{ fetchedAt, value, inFlight }`：`refreshMinutes` 过期、并发去重、失败落 error 且不阻塞其余字段（照 cost-meter balance 缓存写法）。
- 状态分级：`off`（未配置 Key / 无订阅 / 未启用 = 预期场景，中性提示）| `error`（网络/HTTP/解析失败，红色提示）| `ok`。
- 抓取器只发凭证给**配置中声明的目标**（deepseek 官方守卫；opencode 固定官方域；custom 用户自担）。

### 4.4 服务与 Typert 清单（`typert.host.js`）

手写 `TYPERT`（zod v4 codec，结构与 dsh-cost-meter 产物一致），服务 `monitor` / namespace `monitor`，invocations：

| method | 参数 | 返回 |
|---|---|---|
| `getProviderUsage` | `providerId: string` | `ProviderUsage` |
| `refreshProvider` | `providerId: string` | `ProviderUsage` |
| `getConfig` | — | `MonitorConfig` |
| `updateConfig` | `patch: record` | `MonitorConfig`（校验失败抛错） |
| `fetchPrices` | — | `{ ok, message, config? }` |

`ProviderUsage`：`{ provider, preset, status: ok|off|error, fetchedAt, message, items: [{ key, label, kind, value, max?, percent?, resetsAt? }] }`。
`MonitorConfig`：`{ locale, currency, symbol, decimals, exchangeRate, peakEnabled, peakEffectiveAt, peakWindows, prices, providers, fetchedAt, priceSource, historyDays }`。
服务对象带 `typertRemote` 绑定（`{ service, serviceKey: 'monitor', namespace: 'monitor' }`）。

## 5. Client 半边

### 5.1 用量图标与面板（`conversation.input.right`）

- 注册：`slots.inject('conversation.input.right', () => slots.register({ name, id: 'dsh-monitor-icon', order }, UsageIcon))`；`conversation.input.right` 为 list 协议、session 作用域，渲染位置在 trailing 行模型座**左侧**（已核实宿主 DOM：rightItems → model seat → ContextMeter → stop → send）。
- 当前提供方：`ctx.get('modelDirectories')`（dsh-client-ui-model-selection 提供的服务，软依赖 + 缺省降级）→ `directoryFor(sessionId).store.getSnapshot().current?.provider`；拿不到（无会话/已寻址 subagent/未加载）→ 图标灰态或面板空态。
- 图标按钮：16px 计量 SVG（沿用 cost-meter 的纯手绘 SVG 风格，不用第三方图标库）；当前提供方任一配额 percent ≥ 80% 时显示警示色小圆点。
- 面板（点击弹出，组件自管 popover，锚定按钮下方，点击外部 / Esc 关闭）：
  - 头部：**提供方名字** + preset 徽标（DeepSeek 官方 / OpenCode / 自定义）+ **刷新图标**（`refreshProvider`）
  - 条目列表：percent（进度条）/ number·money（有 max 显示"已用/上限+进度"，无 max 显数值）/ text；`resetsAt` 显示重置时间
  - 底部：上次获取时间；`off`/`error` 状态提示
  - 未配置当前提供方 → 空态"未配置该提供方" + "去设置"按钮
- 数据：`remote.monitor.getProviderUsage(providerId)`；面板打开时立即拉取，缓存复用 Host 侧。

### 5.2 会话费用角标（`conversation.session.header.actions`）

- 注册：list 协议、session 作用域，`order` 靠前。
- 组件：`useProjection('costUsage')`（Host 注册的会话投影，token 桶 + byModel）→ 客户端按 `config.prices` + 峰谷配置计算会话费用（客户端轻量价格数学副本）→ 窄 chip `¥0.0123`；悬停 Tooltip 显示输入/缓存/输出 token 明细；无用量不渲染。
- 币种：默认 CNY/¥、decimals 4、汇率 7.2，设置可改（UI 展示层换算，账本恒存美元）。

### 5.3 设置页（`settings.section`，"用量 / Usage"）

- **提供方配置**区：列表（启用开关 / preset 徽标 / 编辑 / 删除）；"添加提供方"：provider id 输入（建议列表 = `modelDirectories` 的 groups）+ 预设三选一，选中后展开对应字段（deepseek 无附加字段并注明复用 设置→模型；opencode 可选 Key + 刷新间隔；custom 为 url/headers JSON/条目编辑器），保存走 `updateConfig`。
- **计费价格**区：deepseek-v4-flash / deepseek-v4-pro 价格卡片（三桶 + offPeak/peak/legacyBase 可编辑）、default 回退行、新增模型行、"从官方文档同步"按钮（`fetchPrices`）+ 上次同步时间 + 价格来源；峰谷窗口只读展示。

### 5.4 客户端状态与生命周期

- `inject: ['remote']`，`remote.$mount(CONTRIBUTION)`；`ctx.get('remote.monitor')` 获取 RPC 面。
- 迷你 store（cost-meter 的 makeStore 模式）：`{ status, error, state }`；`getConfig` 快照 + 价格/币种配置。
- 刷新：60s 轮询（`document.hidden` 跳过）+ `visibilitychange` 可见即刷 + `connection/reset` 重拉；角标不依赖轮询（投影实时）。
- 样式：`styles.insert(css)`，`.dm-*` 命名空间（不触碰全局主题，用主题 CSS 变量取色）。
- 语言：中英双语字典 + `resolveLocale(config.locale)`（auto 跟随浏览器，不持久化探测结果；照 cost-meter）。

## 6. 配置校验（`store.js`）

`applyConfigPatch(current, patch)`：未知键拒绝、深合并、逐字段校验（locale/currency/symbol/decimals/exchangeRate/peak*/prices 规范化/providers 结构/refreshMinutes 1-1440/historyDays 7-3650），非法补丁整体不落盘并回传错误文案（中英）。

## 7. 错误处理

| 场景 | 处理 |
|---|---|
| 官方余额/额度接口 HTTP 或超时 | `status: error` + 具体消息（15s 超时） |
| DeepSeek 非官方端点 | 拒绝发起，提示（保护 Key） |
| 无 Key / 无订阅 / 401/403（opencode） | `status: off` 中性提示 |
| 官方价格页过短/解析不出模型 | `ERR_NO_MODELS` 类错误，UI 提示稍后重试 |
| 账本写入失败 | 原子写 + 防抖；失败仅告警不崩溃 |
| llm/stream 包裹内异常 | 记日志，绝不断流 |
| RPC/校验 | zod codec + updateConfig 白名单校验；客户端 store 显示 error 态 |
| connection/reset | 客户端重拉 getConfig |

## 8. 测试

- 单元（node:test，mock fetch）：
  - 账本：account 聚合、sumDays/sumRange、prune、原子写往返。
  - 价格：tierFor 边界（峰/谷/legacy 分界）、costOf 数学、parsePricingHtml 固定 fixture。
  - 配置：applyConfigPatch 合法/非法补丁。
  - 用量：custom 条目点路径提取、percent 计算、preset 抓取器对 mock 响应的 off/error/ok 分级。
- 手动验收：`dsh plugin --profile web add <目录>` 装入 → Web 图标/面板（opencode 真 Key、DeepSeek 真 Key 各验一次）、会话角标对照实际 usage、设置页增删改 + 官方同步、未配置空态、断网 401 错误态、中英切换。

## 9. 交付

1. 本 repo 完整实现 + 测试通过。
2. README（中英）：安装（`dsh plugin`）、功能、配置说明、预设字段说明。
3. 开发循环：改代码 → `dsh plugin --profile web add <目录>`（或重装）→ 刷新 GUI；如需 HMR 需 DSH checkout 内 `pnpm run dev:web`。
4. 后续可选项（本期不做）：custom POST/非 JSON、全局 overlay 面板、提供方全列表视图、budget/余额侧栏等 cost-meter 附加面。

## 10. 明确非目标（YAGNI）

- 不做 cost-meter 的预算图框、侧栏余额/今日费用、右下角 chips、币种多点位、价格自动定时同步。
- 不做自定义预设的 POST/非 JSON 响应。
- 不提供多提供方列表页；面板严格跟随当前会话提供方。
- 不 fork/修改宿主 `dsh-client-ui-conversation`（ContextMeter 右侧无 Slot，采用模型座左侧）。