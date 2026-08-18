# dsh-monitor 用量汇总:按天柱形 + 筛选 + 会话列表

日期:2026-08-18。状态:已确认(数据模型与范围按用户拍板定稿)。

## 背景

现有账本只按「天」和「会话」双层聚合,不区分 provider / model,且 `account()`
拿到的 `model` 只用来查单价、provider 压根没接收,因此无法回答「dsh 用了多少
token,按提供方、按提供方下的模型怎么分布」这类问题。本期新增一条**按天 → 提供方
→ 模型**的聚合维度,支撑:

- 按天柱形图(唯一图表形态,支持时间范围 + 提供方 + 提供方下模型的筛选);
- 会话列表(费用 / token / 调用次数,不展开明细);
- 「今日 / 本月累计」汇总卡片。

## 目标

1. 账本升 v2,新增按天 → 提供方 → 模型的聚合树,`cost` 沿用调用时刻峰谷计费口径。
2. 新增查询 RPC,服务端做筛选与聚合,客户端只画图与渲染列表。
3. 设置页新增「用量汇总」分节:汇总卡片 + 筛选 + 按天柱形 + 会话列表。
4. 图表手写 SVG 柱形,不引入第三方库(客户端 bundle 单文件、external 仅 react/primitives)。
5. 会话列表保留每会话一行(费用 / token / 调用次数),不做展开明细。

## 范围外

- 按提供方、按提供方模型的**柱形图**(已砍掉,只保留按天柱形;提供方/模型仅作筛选)。
- 会话明细展开、逐模型下钻。
- 历史账本回填(已落的 v1 天无 provider/model,只能从本期生效后开始累计)。
- 现有会话费用角标、用量图标/面板行为(不动)。

## 数据模型(账本 v2)

### 存储结构

```jsonc
{
  "version": 2,                            // v1 → v2:旧天补空 usage 树
  "days": {
    "2026-08-18": {
      "date": "2026-08-18",
      "input": 12345, "output": 2345, "cacheRead": 3000, "cacheWrite": 100,
      "calls": 4, "cost": 0.99, "currency": "cny",        // 原有,不动
      "usage": {                                           // 新增:按提供方→模型
        "deepseek-official": {
          "totals":  { "input": 10000, "output": 2000, "cacheRead": 3000, "cacheWrite": 100, "calls": 3, "cost": 0.8 },
          "byModel": {
            "deepseek-v4-flash": { "input": 8000, "output": 1500, "cacheRead": 3000, "cacheWrite": 100, "calls": 2, "cost": 0.5 },
            "deepseek-v4-pro":   { "input": 2000, "output": 500,  "cacheRead": 0,    "cacheWrite": 0,   "calls": 1, "cost": 0.3 }
          }
        }
      },
      "sessions": [                                        // 现有;增强归属字段
        { "id": "s1", "input": 1000, "output": 500, "calls": 3, "cost": 0.4,
          "currency": "cny", "provider": "deepseek-official", "model": "deepseek-v4-flash" }
      ]
    }
  }
}
```

### 充实规则

- `Ledger.account()` 增加 `provider` 入参:`llm/stream` 的 `options.provider`(DSH
  `GenerateOptions` 必填字段)。每次调用把四桶 token 与 `cost` 累加到:
  `day` 原四桶(照旧)→ `day.usage[provider].totals` → `day.usage[provider].byModel[model]`,
  同时 `day.calls` / 各层 `calls` +1。
- 每层叶子结构统一:`{ input, output, cacheRead, cacheWrite, calls, cost }`。
- 会话记录新增 `provider` / `model` 字段 = 该会话**最近一次**调用所用;旧会话缺省
  不补(undefined,列表按「未归属」处理)。
- `historyDays` 剪枝、2s 防抖原子写、`MAX_SESSIONS_PER_DAY = 200` 均维持现状
  (会话列表是近期列表,提高上限会让文件线性变大,不做)。

### 叶子有界性

每天叶子数 = 当天 provider×model 组合数(典型 1-5 × 1-10),180 天也仅几千条;
已实测最坏账本(180 天 × 200 会话/天)约 4.5MB / 44ms 落盘,新增这一层体积变化可忽略。

## 查询接口

新增 `monitor.getUsage`,服务端**筛选 + 聚合**,返回已组织好的结构,客户端按需取数:

```
request:  { range?:    { start: 'YYYY-MM-DD', end: 'YYYY-MM-DD' },  // 默认近 7 天
            providers?: string[],                                    // 空 = 全部
            models?:    string[] }                                   // 空 = 全部(仅对 provider 生效)
response: {
  totals:   { input, output, cacheRead, cacheWrite, calls, cost },   // 筛选后合计
  byDay:    [ { date, input, output, cacheRead, cacheWrite, calls, cost } ],  // 按天序列(柱形)
  sessions: [ { id, date, provider, model, input, output, cacheRead, cacheWrite, calls, cost, currency } ]  // 按时间倒序
}
```

- 服务端按 `range` 过滤天,再按 `providers` / `models` 从 `usage` 树里筛出匹配叶子求和;
  `byDay` 是每个命中天、命中叶子两层的累计,保证柱形图和 `totals` 同口径。
- `models` 筛选同时作用于 `usage` 树与会话列表归属(会话行按 `provider`/`model` 匹配)。

## UI(设置 → 用量 →「用量汇总」分区)

自上而下:

1. **汇总卡片 ×2**:"今日" 与 "本月累计"(token 总数 + 费用 + 调用次数),
   **不随筛选变化**,全局概览。
2. **筛选行**:时间范围(今日 / 近 7 天 / 近 30 天 / 本月 / 自定义区间)
   + 提供方下拉(来自 `listCatalog` 的 active 提供方)+ 该提供方下模型多选。
3. **按天柱形图**:横轴日期、纵轴 token 数(输入+缓存+输出,或可按图例切换),
   悬停 tooltip 显示当日四项数值与费用。
4. **会话列表**:每行 = 会话(id 截断)+ 日期 + 提供方/模型 + 费用 + token 总数
   + 调用次数;按时间倒序;不做展开。

## 工程实现

- `lib/store.js`:`Ledger.account()` 加 provider 入参并充实 `usage` 树;`open()` 做
  v1→v2 迁移(旧天补空 `usage`,会话 `provider`/`model` 缺省);新增 `usageSummary(query)`
  聚合方法 + 单测。
- `lib/index.js`:`llm/stream` 包裹把 `options?.provider` 传入 `account()`。
- `lib/monitor.js`:`getUsage` 服务方法(复用 `ledger.usageSummary`,locale 处理文案);
  `lib/typert.host.js` 补 `getUsage` 的 codec 与 invocation。
- `lib/client-src/`:新增 `chart.js`(手写 SVG 柱形 + tooltip);`settings.js` 新增
  「用量汇总」区块组件;`main.js` 把该分区并入 `settings.section` 的 `SettingsSection`;
  `i18n.js` 中英成对新文案(全角标点);`codecs.js` 补 `getUsage` 线路校验。
- 改完 `npm run build:client` 重建 `lib/client.js`。

## 测试与验证

- `test/store.test.js` 增补:`account()` 带 provider/model 后的 `usage` 树聚合、
  v1→v2 迁移、`usageSummary` 的筛选/合计/会话列表。
- `test/` 其余用例不动,`npm test` 全绿。
- `npm run build:client` 产物自检通过。
- GUI:重新 `dsh plugin --profile web add <repo>` + 重启 web,核对卡片/筛选/柱形/列表;
  次日核对按天柱形持续累积。
