# AGENTS.md — dsh-monitor 项目约定

供后续开发(含 AI 代理)遵循的项目规范。

## 本地化与文案

- **中文界面描述一律使用中文标点(全角)**:逗号 `，`、句号 `。`、冒号 `：`、分号 `；`、括号 `（）`、顿号 `、` 等,不得混入半角逗号/句号/冒号/分号。
- 例外:英文单词、程序标识、URL、占位符(如 `{id}`、`{i}`、`usage.weekly.percent`)、代码路径内的 `[{i}]` 等保持原样,不替换为全角。
- 中英双语必须成对维护(zh/en),新增键时两边都要加。

## 计费与价格

- 账本**独立存 USD 与 CNY 两套价格表**(`config.prices.usd` / `config.prices.cny`),各自可分别编辑/同步。
- 生效币种由界面语言决定:zh → `cny`,其余 → `usd`(`activeCurrency` / `priceTableFor`)。
- 价格记录含三桶基础价 + `offPeak` + `peak`;**不含** legacyBase / legacy(已移除)。
- 每模型可选 `windows: { peak: [], offPeak: [] }`(UTC 整点小时,可多组、可跨午夜);模型设了自己的窗口即按自己的窗口判定,完全没设才回退全局官方窗口。
- 每模型可选布尔 `peakEnabled`(模型级「峰谷」开关,持久化):显式 `false` 时禁用峰谷、只用基础价;`undefined` 视为开启。客户端默认 deepseek 开头模型 `true`、其余 `false`。
- 计费/同步逻辑集中在 `lib/pricing.js` 与 `lib/monitor.js`,客户端 `lib/client-src/format.js` 保持同口径。
- 计费页易混淆点:主行三个输入框是「基础价」;「峰谷」开关控制并决定该模型空闲/高峰档的显示与计费(关闭只用基础价)。`tierFor` 与客户端 `format.js` 需同步维护。

## 语言跟随

- 界面语言以宿主 DSH 的 `LocaleRuntime` 为权威来源(设置→语言),客户端解析后写回 `config.locale`;服务端计费据此决定币种。宿主不可用时回退浏览器探测。

## 工程约定

- 客户端源码在 `lib/client-src/`,改完必须 `npm run build:client` 重建 `lib/client.js`。
- 提交前跑 `npm test`,全部通过再提交。
- 只做外科手术式改动:不顺手重构无关代码;改动产生的孤儿函数/导入/样式要清理。

## 校验

合并前自查:
1. `lib/client-src/i18n.js`、`lib/messages.js`、`lib/store.js` 的中文文案无半角标点残留。
2. 新文案中英成对。
3. `npm test` 全绿。
4. bundle 已重建且包含最新更改。
