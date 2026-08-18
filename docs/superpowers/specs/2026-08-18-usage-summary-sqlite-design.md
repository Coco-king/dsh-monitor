# dsh-monitor 用量汇总:SQLite 全盘移植(日志为事实、账本为投影)

日期:2026-08-18。状态:草案(方向已确认——用户选定全盘移植 TokenLedger 架构)。

> 取代 `2026-08-18-usage-summary-charts-design.md`(旧版为 JSON 账本加维度方案,已弃)。

## 背景与决策

现有 dsh-monitor 账本 `ledger.json` 是**请求路径(llm/stream)实时记账 + JSON 全文件
重写**:插件不在跑的时段丢数据、历史无法回填、无 provider/model 维度、会话有 200/天
上限、无重建能力。参考实现 [TokenLedger](https://github.com/zh667/TokenLedger) 提供
了已被证明可行的替代架构:

- **事实源 = DSH 会话持久化日志**(`sessionPersistence` 缝,`listSnapshots()` +
  `readFrom(id, seq)`),**不在请求路径上**;
- **SQLite 账本 = 可丢弃的投影**,随时可从日志重建(`reindex` / schema 换代即弃);
- **按会话一行 rollup + `GROUP BY`**,不做全局计数器,替换语义精确;
- **增量 sweep + per-session checkpoint**,幂等自愈。

用户拍板:**全盘移植**为这套架构。本 spec 是移植设计与用量汇总 UI 的完整方案。

## 前置验证(已实测)

- 宿主 Node **v24.19.0**,`node:sqlite` 可用(实测建表/插入/查询通过,无 ExperimentalWarning)。
- `sessionPersistence` 服务在当前 DSH 中存在(`dsh-session-persistence` +
  jsonl 后端),与 TokenLedger 同 profile 用法一致。
- `readFrom` 返回 `{ meta, events }`,事件带 `seq`;`listSnapshots` 返回
  `[{ header, revision }]`,`header.id` 为会话 id、`header.cwd` 为工作目录。

## 目标

1. 账本从 JSON 全量移植为 **SQLite**(`node:sqlite`,零新增运行时依赖),架构改为
   「日志为事实、账本为投影」:支持历史回填、重启不丢、`reindex` 重建。
2. rollup 行按 `(sessionId, day, provider, model)` 聚合,**同一会话切换模型=多行**,
   `GROUP BY` 切分准确(含 cost,折叠时按事件时刻峰谷计费,延续现有精确计费卖点)。
3. 查询接口 `monitor.getUsage`:时间范围 + 提供方 + 模型筛选,返回
   `totals`(卡片)/`byDay`(按天柱形)/`sessions`(会话列表)。
4. 设置→用量新增「用量汇总」分区:今日/本月卡片 + 筛选 + 按天柱形 + 会话列表,
   图表手写 SVG,零第三方依赖。
5. 保留:会话费用角标(costUsage 投影)、提供方用量面板、价格表/峰谷/配置
   (applyConfigPatch 校验与 API 不变)。

## 架构

### 数据流

```
DSH 会话日志(事实)                        SQLite 账本(投影)
┌─────────────────────┐   每个会话一条     ┌──────────────────────────────┐
│ listSnapshots()     │ ──进度表──▶      │ ledger_meta / sweep_progress │
│ readFrom(id, seq)   │  增量折叠(60s)    │ token_usage                 │
│   → {meta, events}  │ ───────────────▶ │ (sessionId,day,provider,model)│
└─────────────────────┘  事件→usage 行    └──────────────┬───────────────┘
                                                        │ GROUP BY / index
                                                        ▼
                                          monitor.getUsage(RPC) → 客户端图表
```

- 事实源是日志;SQLite 只是索引投影。`reindex` / schema 不匹配 → `store.reset()` +
  下次 sweep 从 seq 0 重建。**插件停摆期间的用量不丢**(重启后从 checkpoint 续扫)。
- 归因在折叠时解析:provider/model 取自 `assistant/message` 的 `message.source`
  或 `request/header` 的 `header.config`;usage chunk 无归属 → 回退最近路线;
  仍无 → 显式 `unknown` 桶。

## 数据模型(SQLite,schema 版本 1)

表名按本项目语境命名(不照搬 TokenLedger),三张表:

| 表名 | 通俗含义 |
|---|---|
| `token_usage` | 用量统计主表:每个会话、每天、每个提供方、每个模型用了多少 token 与费用 |
| `sweep_progress` | 记账扫描进度:每个会话扫到哪个事件了(增量续扫 / 日志没变就跳过) |
| `ledger_meta` | 账本元信息(schema 版本等) |

```sql
PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS ledger_meta (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS token_usage (
  sessionId        TEXT    NOT NULL,
  day              TEXT    NOT NULL,   -- 本地日历 YYYY-MM-DD
  provider         TEXT    NOT NULL,   -- DSH provider 路由名;未知 = 'unknown'
  model            TEXT    NOT NULL,   -- 模型 id;未知 = 'unknown'
  inputTokens      INTEGER NOT NULL DEFAULT 0,
  outputTokens     INTEGER NOT NULL DEFAULT 0,
  cacheReadTokens  INTEGER NOT NULL DEFAULT 0,
  cacheWriteTokens INTEGER NOT NULL DEFAULT 0,
  requests         INTEGER NOT NULL DEFAULT 0,   -- 调用次数
  cost             REAL    NOT NULL DEFAULT 0,   -- 折叠时按事件时刻峰谷计
  currency         TEXT    NOT NULL DEFAULT 'usd', -- 该行最后写入事件的生效币种
  PRIMARY KEY (sessionId, day, provider, model)
) WITHOUT ROWID;

CREATE INDEX IF NOT EXISTS idx_usage_day   ON token_usage (day);
CREATE INDEX IF NOT EXISTS idx_usage_route ON token_usage (provider, model, day);

CREATE TABLE IF NOT EXISTS sweep_progress (
  sessionId   TEXT PRIMARY KEY,
  consumedSeq INTEGER NOT NULL,        -- 已消费到的事件 seq
  logRevision TEXT,                    -- 日志修订(未变则跳过)
  cursor      TEXT NOT NULL,           -- JSON: 折叠状态(lastSample/currentRoute)
  lastUsageAt INTEGER,
  updatedAt   INTEGER NOT NULL
) WITHOUT ROWID;
```

### 与 TokenLedger 的差异(外科手术,保留 dsh-monitor 特性)

| 点 | TokenLedger | dsh-monitor |
|---|---|---|
| 维度 | `(sessionId,day,site,provider,model)` | **去掉 site**(无中转站需求),`(sessionId,day,provider,model)` |
| 费用 | 不存,查询时按 rates 现算 | **存 cost**,折叠时按事件时刻峰谷计(`pricing.js`)+ 双币,历史固定不回溯 |
| 归属 | site 在折叠时解析 | 无 site;provider/model 即路线 |
| 会话列表 | 按 project(cwd)分组 | 按 sessionId 聚合(费用/token/次数),不做 project 维度 |

### 折叠语义(沿用 usage.js 的替换而非累加)

- 收集 `assistant/chunk`(`chunk.type === 'usage'`)**和** `assistant/message`(`usage`)
  两种样本:只有 message 会漏掉「报了 usage 但流失败」的已计费调用。
- 同一 `(turn, step)` 重复样本 = **替换**而非累加,并归属到后继事件的日子/路线。
- `cost` 每个 usage 事件按 `tierFor(entry, atMs, peak)`(现有 pricing.js)算后累加
  进所在行;`day = localDayKey(event.time)`,币种 `activeCurrency(config)`。

### 写入(替换语义,无污染)

`commitSession(sessionId, state)` 单事务:
1. `DELETE FROM token_usage WHERE sessionId = ?`;
2. 写该会话新折叠出的全部行(全零行跳过);
3. upsert `sweep_progress`(`consumedSeq` / `logRevision` / `cursor`)。

**一个会话内切换模型** → 不同 `(provider, model)` 各自成行,费用/token/次数各归其行,
`GROUP BY provider, model` 全部切分准确。

### 文件位置与配置边界

- 账本:`$DSH_HOME/storages/dsh-monitor/ledger.sqlite`(与现有 `ledger.json` 同目录,
  `dshHomePath('storages/dsh-monitor/ledger.sqlite')`)。
- **配置仍留 `ledger.json`**(价格表/峰谷/提供方/历史天数):applyConfigPatch 校验、
  `getConfig/updateConfig` RPC、价格同步逻辑零改动,55 个现有测试大部分不受影响。
- 旧 JSON 账本的 `days` 数据不再读取(日志可完整回填,含安装前的历史)。

## 查询接口

新增 `monitor.getUsage`,服务端 SQL 筛选聚合,客户端只画图:

```
request:  { range?:    { start: 'YYYY-MM-DD', end: 'YYYY-MM-DD' },  // 默认近 7 天
            providers?: string[], models?: string[] }               // 空 = 全部
response: {
  totals:   { input, output, cacheRead, cacheWrite, calls, cost, currency },
  byDay:    [ { date, input, output, cacheRead, cacheWrite, calls, cost } ],   // 按天柱形
  sessions: [ { id, date, provider, model, input, output, cacheRead, cacheWrite, calls, cost, currency } ]
}
```

- 实现:`token_usage` 上按 `day BETWEEN` + `provider IN` + `model IN` 过滤,
  `GROUP BY`。会话列表 `GROUP BY sessionId`,取该会话涉及的 provider/model 与
  `MAX(day)`(日期列),按 `lastUsageAt`(`sweep_progress`)倒序。
- 筛选同时作用于按天柱形与会话列表(与会话行匹配的 `provider`/`model`)。

## UI(设置 → 用量 →「用量汇总」分区)

自上而下:

1. **汇总卡片 ×2**:"今日" 与 "本月累计"(token 总数 + 费用 + 调用次数),
   **不随筛选变化**,全局概览。
2. **筛选行**:时间范围(今日 / 近 7 天 / 近 30 天 / 本月 / 自定义区间)
   + 提供方下拉(来自 `listCatalog` 的 active 提供方)+ 该提供方下模型多选。
3. **按天柱形图**:横轴日期、纵轴 token 数,悬停 tooltip 显示当日四项与费用;
   手写 SVG(`chart.js`,零第三方依赖,沿用 GaugeIcon 先例)。
4. **会话列表**:每行 = 会话(id 截断)+ 日期 + 提供方/模型 + 费用 + token 总数
   + 调用次数;按时间倒序;不做展开。

## 工程实现

- `lib/store.js`:重写 `Ledger` 为 SQLite 驱动——保留 `getConfig/applyConfigPatch`
  及 config 持久化(JSON 文件),账本数据(`account` 路径)改为折叠写入
  `token_usage`;新增 `sweep`/`commitSession`/`usageSummary`/`reset`;
  `Ledger.open` 建库建表 + schema 版本管理。`node:sqlite`(DatabaseSync)同步 API,
  与 TokenLedger 用法一致。
- 新增 `lib/fold.js`:从 `sessionPersistence` 读事件尾巴,折叠进会话状态
  (移植 TokenLedger usage.js 的核心,去掉 site、加 cost 计算;语义与
  `dsh-token-meter` 一致)。
- `lib/index.js`:注入 `sessionPersistence`;启动/定时 60s `sweep`;移除 llm/stream
  包裹(sweep 不再依赖请求路径);会话角标投影与 monitor 服务保留。
- `lib/monitor.js`:`getUsage` 服务方法;`lib/typert.host.js` 补 codec 与 invocation。
- `lib/client-src/`:新增 `chart.js`;`settings.js` 增「用量汇总」分区;
  `main.js` 并入 `SettingsSection`;`i18n.js` 中英成对新文案(全角标点);
  `codecs.js` 补 `getUsage` 线路校验。改完 `npm run build:client`。
- 配置/价格表逻辑(`pricing.js`、monitor 的 listCatalog/fetchPrices)不动。

## 测试与验证

- `test/store.test.js`:改为 SQLite 折叠用例——折叠 `(sessionId,day,provider,model)`
  行、同会话切模型成多行、替换语义、checkpoint 增量、usageSummary 筛选/合计、
  reset 重建、schema 换代即弃。
- `test/fold.test.js`(新):事件样本 → 折叠状态(切模型 / usage+message 双收 /
  unknown 归因 / cost 峰谷计)。
- 其余测试(config 校验、monitor 服务、queries)不动,`npm test` 全绿。
- `npm run build:client` 产物自检通过。
- GUI:重新 `dsh plugin --profile web add <repo>` + 重启 web,核对卡片/筛选/柱形/列表,
  并确认**安装前历史日志回填**生效;次日核对按天柱形持续累积。

## 范围外

- 按提供方、按提供方模型的柱形图(已砍,只保留按天柱形;提供方/模型仅作筛选)。
- 会话明细展开、逐模型下钻、项目(cwd)维度、中转站(site)维度。
- 现有会话费用角标、用量图标/面板、价格表/峰谷/配置 API 行为(不动)。
- 旧 `ledger.json` 的 days 数据迁移(由日志回填取代)。
