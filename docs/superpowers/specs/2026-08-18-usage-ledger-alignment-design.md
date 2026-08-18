# 用量看板对齐 TokenLedger 用量账本（除余额）设计

日期：2026-08-18。状态：已批准（交互式评审通过：目标=侧边栏用量看板；补 project 归因；移除柱形图/会话列表；分布维度改用 providerId + 显示名）。

## 目标

把 dsh-monitor 侧边栏「用量看板」浮动面板（`lib/client-src/dashboard.js`）重构为与
TokenLedger「用量账本」页面**结构、分区、视觉完全一致**的形态，**余额卡除外**
（余额仍落在各提供方自己的用量面板 `panel.js` 里，不并入看板）。

数据上给账本补**项目（会话目录）归因**，让「按项目」分区渲染真实数据；分布分区
按 **providerId** 分组、显示 **provider 显示名**（用户否决了域名方案：域名太长；
也不做 baseURL→origin 归因，省掉整个 site 方案）。

**移除**现有「按天柱形图」与「会话列表」两节，页面只保留 TokenLedger 有的分区。

## 分区（自上而下）

1. **Header**：标题「用量账本」+ 刷新 + 关闭按钮（Escape/外点关闭保留）。
2. **Token 用量**：3 张统计卡（今日/本月/累计，兼范围切换，值取 `windows`）
   + 摘要行「{n} 请求 · 缓存命中 {rate} · 估算 {cost}」（费用按当前语言币种，
   未定价显示破折号）。
3. **提供方分布**（用户确认此命名）：按 providerId 分组的分布行
   （分段堆叠条 + 行：色块/名称/token/占比）；行标签 = 目录里的 displayName，
   `title` = providerId；点行 = 按该 provider 筛选整个面板，再点清除；
   选中时分区标题显示「只看 {name} ×」清除胶囊。`unknown` 提供方一行，
   灰色不占彩色。
4. **按项目**：静态行（目录 basename 为 label、完整路径 title、token、占比；
   `''` 目录显示「未记录目录」）。
5. **活跃度**：371 天周列网格（保留天数不足时空天 = level 0）、月份/星期标签、
   分位数 0–4 绿色渐变、悬停逐日 tooltip（该日各模型 token+占比）。
6. **模型**：可排序表（模型/请求/总计/输入/缓存[+命中率+写入↑]/输出/估算，
   费用按当前语言币种）。
7. **页脚**：`{ago}从会话日志读取 · 最近一次用量 {ago} · {n} 行认不出是哪个站`（warn）。

## 数据模型

- `token_usage` 表**不变**（provider 已是分布维度）。
- 新增 `sessions(sessionId TEXT PRIMARY KEY, project TEXT NOT NULL DEFAULT '')`
  （项目是会话的属性，独立成表避免为每行重复存 cwd）；`project` 索引。
  `CREATE TABLE IF NOT EXISTS`，无需版本号升级、不 DROP、不丢既有数据。
- `project` = 会话快照头 `snapshot.header.cwd` 规范化
  （`normalizeProject`：去尾部路径分隔符；缺省记 `''`，未记录目录要有可见行）。

## 宿主管道

- `lib/fold.js`：**不改路由键**（仍为 `provider\u0000model`；本轮不做 site 归因）。
  无需改动。
- `lib/store.js`：
  - 新表 `sessions` + 准备语句（upsert by sessionId、byProject 聚合 join）；
  - `setProject(sessionId, project)`：幂等 upsert，供 sweep 无条件写入；
  - `usageSummary(query)` 扩展聚合：
    - `byProvider`：`GROUP BY provider`（token 桶各列 + 双币费用）；
    - `byProject`：join `sessions`，按 project 分组（token 桶 + 双币费用，
      带 `project`/`path`/`unattributed` 标记）；
    - `byRoute`：按 `day, provider, model` 分组（供热力带逐日 tooltip）；
    - `windows`：`{today, month, all}`（各自范围 + 沿用 query 的
      providers/models 筛选）；
    - `activity`：`byDay` 限定近 `ACTIVITY_DAYS`（371）天窗口；
    - `diagnostics`：`{ lastUsageAt（sweep_progress 中 MAX）、
      unattributedRows（provider='unknown' OR model='unknown' 行数） }`；
    - `timeZone`：宿主时区标签 `{ offset, name }`；
    - 保留 `totals`（含 tokens/cacheHitRate 派生）、`byDay`、`models`
      （含每模型 cacheHitRate）、`sessions`（字段保留，页面不再渲染）。
- `lib/index.js` `runSweep`：
  - 每轮对每个快照**无条件** `ledger.setProject(sessionId, normalizeProject(header.cwd))`
    （已消费完的会话也要回填 project，否则升级后老会话永远没有项目行）；
  - 折叠逻辑不变（仅 logRevision 变化时才 `ledger.fold`）。
- `lib/monitor.js` `getUsage`：
  - 调 `ledger.usageSummary(query)`，再拼装 `lastSweepAt`（sweep 闭包注入）、
    `providers:[{id,name}]`（`ctx.get('llm').listProviders()` 目录映射，
    渲染显示名用；拿不到名字客户端回退 providerId）；
  - `createService(ctx, ledger, { sweepStats })` 注入 `lastSweepAt`。

## RPC / 契约

- `lib/typert.host.js`：扩展 `usageSummarySchema`（byProvider/byProject/byRoute/
  windows/activity/diagnostics/timeZone/lastSweepAt/providers 等）；
  `usageQuerySchema` 沿用（`providers` 已是筛选）。
- `lib/client-src/codecs.js`：`parseUsageSummary` 增加新字段；
  `usageQueryCodec` 已支持 `providers` 筛选，不需改。

## 客户端（dashboard.js 重写）

- `RANGES`（today/month/all）不变；`useUsage(open, range, filter, nonce)` 单次
  `api.getUsage({ range, providers: filter })`，重载/换范围保留旧数据不闪空白。
- 实现 `StatRow / StatCaption / ProviderRows / ProjectRows / ActivityStrip /
  DayTip / ModelTable / Footer / Skeleton / Header`，结构对齐 TokenLedger 客户端。
- 徽标「今日 token」沿用量轻量查询（或读 `windows.today`）。
- 移除 `BarChart` 引入/柱形图分区/会话列表分区/`chart.js` 相关代码。
- 关闭按钮新增；`providers` 字典做名称查找（title=providerId）。

## 样式（styles.js）

- 移植 TokenLedger 面板视觉进 `dm-dash-*` 命名：圆角 12/8/6、11–13px 紧凑字阶、
  alpha 边框；面板作用域内 `--dm-series-0..5` 中转入色板 + emerald 活动色阶
  `--dm-level-0..4` + `--dm-unknown`（灰），亮/暗两套；
- 新增/改写：摘要行、提供方堆叠条/色块/行、项目行、活跃度月份/星期网格、
  逐日 tooltip、表格排序符、页脚、骨架屏；现有卡片/热力带样式按对齐目标微调。

## 文案（i18n.js，中英成对、中文全角标点）

- `dashboardTitle` →「用量账本」/ "Token Ledger"；
- 新增：分区标题（Token 用量/提供方分布/按项目/活跃度/模型）、摘要行、
  提供方（未知提供方）、项目（未记录目录/暂无归因）、筛选（只看 {name} ×）、
  活跃度（等级/安静/月份/星期）、表头（模型/请求/总计/输入/缓存/输出/估算）、
  页脚（read from logs/just now/minutes/hours/days/never/last activity/unattributed）、
  状态空/读不到/重试/关闭；
- 移除孤儿键：`chartByDay`、`sessionListTitle`、`sessionTokens`、`sessionCalls`、
  `sessionCost`（`activityTitle` 改由 `sectionActivity` 取代；
  `noUsageSummary` 若仅图表用则移除）。

## 测试

- `test/store.test.js`：`sessions` 表与 `setProject/byProject`；`byProvider`；
  `windows/activity/diagnostics/timeZone`；usageSummary 扩展字段。
- `test/usage.test.js`：getUsage 载荷含 byProvider/providers/lastSweepAt。
- 复用既有 fold 测试（本轮不动 fold 归属逻辑）。

## 验收

- `npm test` 全绿；
- `npm run build:client` 重建 `lib/client.js` 且包含新文案与新组件；
- 自查 i18n 无半角标点残留、中英成对；
- 页面：刷新看板 → 卡片/摘要/提供方分布/按项目/活跃度/模型表/页脚齐全；
  提供方筛选、表格排序、热力带 tooltip 可用；柱形图与会话列表消失。
