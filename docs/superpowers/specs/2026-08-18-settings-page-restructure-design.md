# 设置→用量 页面重构 + 项目结构调整

日期:2026-08-18。状态:已批准(用户确认中等方案)。

## 背景

- `设置→用量`(dsh-monitor 通过 `settings.section` 注册)当前布局与 DSH 内置的
  `设置→模型`、`设置→通用设置` 设计语言不一致:13px 小字号、实心 `bg-layer-1`
  卡片、`border-l1`、蓝色实心按钮(`button-info-fill`)、价格三档信息挤成一行
  跑马灯文本(`峰: … · 峰: … · 历史: …`)、`<strong>` 代替正式小节标题。
- 项目结构问题:`lib/client.js` 1283 行(浏览器端单文件 bundle,DSH module loader
  只解析托管模块名,相对 `require` 会抛错,因此**最终产物必须是一个文件**);
  `lib/index.js` 752 行混装投影/三类查询/monitor 服务/插件入口。

## 目标

1. `设置→用量` 页面整体套用 DSH 设置面板设计语言(以「模型」页为主参照,
   「通用设置」的说明行层级为辅),行为逻辑零变化。
2. 项目结构:客户端源码拆成多文件 + 轻量 esbuild 构建,把拆分后的代码重新
   打包回单文件 `lib/client.js`(产物形态、加载方式不变);主机侧按职责拆模块;
   `index.js` 保持为薄入口并 re-export 公开 API,测试与外部调用方不变。

## 页面设计(视觉层)

设计 token 全部走 `--dsw-alias-*`:正文 14/22、说明 12/18 tertiary、
标题 16/500/24、输入 `h32 r8 border-l2`、按钮胶囊(r18;行内密集 h28 r14)、
卡片 `border-l2 r12`(透明底)、编辑面 `--dsw-alias-bg-module-platform r12 p14x16`、
添加按钮 `border-l3 dashed r12 h44`、聚焦 `--dsw-alias-brand-primary`。

### 区块骨架
- `.dm-section`: `max-width:720px; flex column; gap:12px`,字号 14/22。
- 两个子区各自 `<h2 class="dm-h">`(16/500/24)+ `<p class="dm-intro">`(14/22 tertiary)。

### 提供方用量配置(对齐「模型」)
- 列表 `gap:8px`;行 = 轻量卡 `border-l2 r12 p12x14`:
  - 行头:名称 14/500 + 预设徽标改 DSH tag(`border-l3`,11px)+ 右侧
    `启用` 开关 / `编辑` / `删除`(胶囊 h28 r14 描边)。
  - 元信息行 12/18 tertiary(刷新间隔 / 掩码 Key / 自定义 URL),允许换行。
- 编辑态 = 内嵌编辑卡(`dm-editor`, `bg-module-platform r12 p14x16,gap14`):
  - `grid2`:提供方 ID 下拉(编辑时禁用)| 刷新间隔。
  - 只读「查询预设」说明行;`启用` 开关。
  - deepseek:提示行;opencode:API Key 输入 + 提示;custom:URL、请求头
    textarea、用量条目列表。
  - 用量条目 = `dm-item`( `border-l2 r8` )内 `grid2` 字段行(key/label、
    kind/path、maxPath/resetsAtPath)+ 删除图标钮 + 「添加条目」小按钮。
  - 底部右对齐:取消(描边)/ 保存(主按钮)。
- 列表下方「添加提供方」= 全宽虚线添加按钮(DASH 样式,h44)。

### 计费价格(对齐「模型」model catalog)
- 标题 + 介绍(峰谷提示)+ 元信息(上次同步 · 来源)。
- 工具行:右侧「从官方文档同步」(描边)+「保存」(主按钮)。
- 模型添加:标签 + 按提供方分组的 `<select>` + 「添加模型」小按钮。
- 表格:表头一次(模型 / 命中 / 未命中 / 输出 / 操作,12/500 secondary);
  每模型一行(名称 + legacy 标记 + 3 个 `h32 r8` 数字输入 + 删除图标钮);
  「默认模型」并入同构末行(无删除)。
- 三档价格(offPeak / peak / legacyBase)从跑马灯文本改为行内 `<details>`
  折叠(DSH 旋转 chevron 模式),展开后按档位分列。

### 状态提示
- 成功/错误提示 12/18 文本色(success-primary / error-primary),`role="status"`。

## 项目结构

```
lib/
├── index.js            # 宿主入口:apply + llm/stream 包裹;re-export 公开 API
├── messages.js         # 服务端 zh/en 文案 + tmsg/localeOf        (从 index.js 拆出)
├── projection.js       # costUsage 会话投影工厂                   (从 index.js 拆出)
├── queries.js          # Go 额度/余额/自定义查询 + jsonByPath     (从 index.js 拆出)
├── monitor.js          # createService(含 listCatalog/fetchPrices)(从 index.js 拆出)
├── pricing.js / store.js / typert.host.js   # 不动
├── client.js           # 构建产物(仍是单文件 bundle,不再手改)
└── client-src/         # 客户端源码(esbuild 输入)
    ├── main.js         # 入口:window.__ModuleLoader__.load 包装 + apply/轮询/插槽注册
    ├── styles.js       # 全部 CSS(面板/角标 + 设置页两段)+ style 注入
    ├── i18n.js         # MESSAGES + detectBrowserLocale/resolveLocale/makeT
    ├── codecs.js       # 线路校验器 + CONTRIBUTION(Typert 贡献清单)
    ├── format.js       # 计价/显示助手(priceEntryFor/tierFor/costOfBuckets/format*)
    ├── panel.js        # 用量图标/悬浮面板/会话费用角标(仅搬迁,不改视觉)
    └── settings.js     # 设置页四组件(本次重构主体)+ delist
scripts/
└── build-client.mjs    # esbuild:client-src/main.js → lib/client.js
                        #   - 注入 BUILD_TAG(产物内容 sha1 前 7 位)
                        #   - 自检:node 语法 + 相对 require 残留 + 加载冒烟
                        #   - --watch 开发模式
```

- 构建命令:`npm run build:client` / `npm run dev:client`(--watch)。
- `package.json`:`scripts` 加构建、`devDependencies` 加 esbuild、`files` 增加新模块。
- 测试:主机侧公开 API 经 `index.js` re-export,`test/` 无需改动。

## 验证

- `npm test` 全绿(主机逻辑不变)。
- `npm run build:client` 产物自检通过(语法、无相对 require 残留、冒烟加载)。
- GUI:重新 `dsh plugin --profile web add <repo>` + 重启 web,刷新后核对新布局。

## 范围外

- 用量图标 / 悬浮面板 / 会话费用角标的视觉与行为(仅搬迁)。
- `lib/pricing.js`、`lib/store.js`、`lib/typert.host.js` 内容。
- 主机侧查询/服务逻辑。