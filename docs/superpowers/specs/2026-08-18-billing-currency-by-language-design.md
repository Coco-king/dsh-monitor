# 设置→计费 价格与成本按界面语言区分币种(USD / CNY)

日期:2026-08-18。状态:已批准(用户逐段确认)。
前置:2026-08-18-settings-page-restructure-design.md(页面结构)、
2026-08-17-dsh-monitor-design.md(插件整体)。

## 背景

- 目前 `config.prices` 只有一张美元价目表(`USD / 1M tokens`),账本成本恒以美元
  存储;展示层用 `config.currency`(默认 CNY)/`symbol`(默认 ¥)/`exchangeRate`
  (默认 7.2)做乘法换算。设置→计费面板编辑的就是这张 USD 表,标题写死
  「美元 / 1M tokens」。
- 官方 **英文定价页**(`/quick_start/pricing`)只有 `$` 价格;官方 **中文定价页**
  (`/zh-cn/quick_start/pricing`)有独立人民币价格(如 flash 空闲命中 0.05元 /
  未命中 1.5元 / 输出 4.5元,高峰翻倍),HTML 结构与英文页同构、可解析。
- 界面语言:`config.locale` 为 `auto|zh|en`,客户端按浏览器解析(`resolveLocale`);
  服务端 `localeOf` 把 auto 视为 zh。

## 目标(用户确认的决策)

1. 账本**独立存 USD + CNY 两套价格表**,各自可分别编辑 / 同步。
2. 设置→计费面板**与会话成本都随当前界面语言切换币种**:zh → 人民币,其他 → 美元。
3. `auto` 语言由客户端解析后**写回配置**,服务端计费读配置决定币种。
4. 账本成本**直接存当前生效币种的数值**,并带 `currency` 标记(币种标记方案 A)。

## 设计

### 1. 配置与价格表结构

- `config.prices` 从 `{ models, default }` 升级为容器:
  `prices.usd` 与 `prices.cny`,各是一个 `{ models, default }`,相互独立。
- 内置默认 CNY 表采用官方中文页数字(镜像结构,含 oﬀPeak/peak;legacyBase
  按 7.2 汇率由 USD 旧基础价折算填入,保证峰谷时代前历史计费也存在):
  - `deepseek-v4-flash`:cacheHit 0.05 / cacheMiss 1.5 / output 4.5(oﬀPeak 即基础档);
    peak 0.10 / 3.0 / 9.0;legacyBase ≈ (0.0028, 0.14, 0.28)×7.2。
  - `deepseek-v4-pro`:cacheHit 0.15 / cacheMiss 4.5 / output 13.5;peak 0.30 / 9.0 / 27.0;
    legacyBase ≈ (0.003625, 0.435, 0.87)×7.2。
  - `default` 与 flash 基础档一致(同 USD 表的镜像比例)。
- **旧账本迁移**:`Ledger.open()` 检测旧 `prices`(有 `models` 而无 `usd/cny` 键)时,
  自动包装为 `prices.usd = 旧表`,并生成一份初始 CNY 表(由 USD × exchangeRate 折算),
  不丢数据。
- **移除展示层换算字段**(决策:方案 A——币种完全由语言决定,不做双口径):
  `config.currency / symbol / exchangeRate` 从展示路径移除;`exchangeRate` 仅保留
  在迁移时用作一次性折算基准。配置校验对这三个字段放宽为“可选忽略”(旧配置里
  读到了也不报错、不持久化),新配置不再发送、不再校验其合法性。

### 2. 计费口径(服务端)

- 新增纯函数(放 `pricing.js`,两端共用逻辑):
  - `activeCurrency(config)` → `config.locale === 'zh' ? 'cny' : 'usd'`
    (服务端 `localeOf` 视 auto 为 zh,因此 auto → CNY,与现行默认币种一致);
  - `priceTableFor(config)` → `config.prices[activeCurrency(config)]`。
- 调用点改造(现在直接读 `config.prices`,改为经 `priceTableFor` 选表):
  - `store.js` `Ledger.account()`(llm/stream 计费落账);
  - `projection.js` `makeCostUsageProjection()`(会话投影 usage.cost / byModel);
  - `lib/index.js` 包裹的 llm/stream 记账调用。
- **成本币种标记**(决策 2a 方案 A):
  - `store.js` `zeroDay()` / `zeroSession()` 各增一字段 `currency: 'usd' | 'cny'`,
    记录该账目行的成本币种;`account()` 存入的 `cost` 数值即当前生效币种的
    数字(CNY 生效时存人民币数值),同时写 `currency`。
  - 若同一日 / 同会话内界面语言切换,会混两种币种数值——各自带 `currency` 标记,
    展示时按记录自身币种展示,不做统一换算。

### 3. 设置 → 计费面板

- `PricesSection` 按生效语言决定编辑哪张表:zh 编辑 `prices.cny`,其他编辑
  `prices.usd`。标题、数值输入、三档明细、新增模型全部作用于当前语言对应的表。
- 文案(i18n.js):
  - zh:`pricesTitle` → `计费价格(人民币 / 1M tokens)`;新增说明提示
    「中文界面按人民币展示与编辑,存回账本也是人民币」。
  - en:`pricesTitle` 保持 `Billing prices (USD / 1M tokens)`。
- 保存:`api.updateConfig({ prices: { models, default } })` 改为提交**当前语言对应
  的那一张子表**(写入 `prices.usd` 或 `prices.cny`,另一张不受影响)。
- 显示换算移除:`format.js` `formatMoneyUsd` 不再乘 `config.exchangeRate`;
  改为按生效币种直接显示符号与数值(zh → ¥…,其他 → $…)。会话费用角标
  `panel.js SessionCost` 随界面语言显示对应币种金额。

### 4. 从官方同步(两表)

- `pricing.js` `parsePricingHtml` 改造:接受**币种目标 / 语言**参数,英文页 → USD,
  中文页(`/zh-cn/quick_start/pricing`)→ CNY(中文页「空闲时段 / 高峰时段」+
  `x元`,与英文页同构,已实测可解析)。
- `monitor.js` `fetchPrices`:**一次同步 = 同时抓英文页 + 中文页**,分别写
  `prices.usd` 与 `prices.cny`(同步按钮只需点一次)。任一侧解析失败不影响另一侧。
- 同步成功提示按语言展示(zh:「已同步 USD 与 CNY 价格…」;en 对应)。

### 数据流

1. 客户端 `main.js`:启动轮询 `getConfig`;若 `config.locale === 'auto'`,用浏览器
   `resolveLocale` 解析并 `updateConfig({ locale })` 写回一次(幂等,仅 auto 时写)。
2. 服务端 llm/stream → `Ledger.account()`:按 `priceTableFor(config)` 选表计费,
   记 `cost`(当前币种)+ `currency`。
3. 会话投影 costUsage:按当前生效语言选表计算 usage.cost / byModel(币种随语言)。
4. 设置面板:按生效语言读写对应子表;保存提交单张子表。
5. 同步:一次抓两页写两表。

### 错误处理

- 迁移:旧表包装失败时保持原直读路径(视为单 USD 表),不影响启动。
- 同步:中文页解析失败 → 仅 USD 表更新,提示中说明 CNY 未更新;反之亦然。
- 面板:编辑时用户切语言,草稿按生效语言重建(现有关键字 `fetchedAt` 守卫沿用)。

### 测试

- `store.test.js`:两表结构、迁移旧表、`account()` 记录 `currency` 与当前币种数值;
  `priceTableFor` 按 locale 选表。
- `pricing.test.js`:CNY 默认表数字、中文页 `parsePricingHtml`(CNY 目标)解析、
  两页同步各写各表。
- `usage.test.js`(如有涉及):投影按生效语言计算成本的关键路径。

### 范围外(不做)

- 不做双币种同时展示的开关(不引入手动币种切换 UI);
- 不重建历史账本既有金额(旧 USD 账目保留,仅打上 `currency:'usd'`);
- 汇率不实时抓取、不做每日换算(CNY 表独立于 USD 表)。
