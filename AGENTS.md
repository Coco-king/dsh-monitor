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

## 版本发布(仅限用户明确要求)

- **铁律:仅当用户明确要求升级版本时才执行发版;AI 代理不得自行改版本号、打 tag 或推送发布提交。**
- 命令:
  - 正式发布:`npm run release -- <X.Y.Z>`,如 `npm run release -- 0.1.1`。
  - 预演(只打印计划,不改文件、不推送):`npm run release -- <X.Y.Z> --dry-run`。
- 脚本 `scripts/release.mjs` 自动完成:
  1. 校验:参数是语义化版本且**严格高于**当前 `package.json` 版本;工作区干净;位于 `master` 分支。
  2. 先跑 `npm test` 与 `npm run build:client`,全绿才继续。
  3. 同步版本号:`package.json` + `package-lock.json`(顶层与 `packages[""]`)。
  4. 重写 `README.md` / `README.zh-CN.md` 安装命令的钉定版本(GitHub 与 Gitee 两行,`#vX.Y.Z`,无号则插入)——保证「README 版本 = 最新 tag」。
  5. 提交 `release: vX.Y.Z` → 打 tag `vX.Y.Z` → `git push origin master` 与 `git push origin vX.Y.Z`,并打印带版本号的安装命令。
- 版本约定:唯一版本源 = `package.json` 的 `version`;tag 统一 `vX.Y.Z`;README 展示精确钉定版本,`#semver:^X.Y` 只作给用户的可选备注,不在 README 正文使用。
- 发版前自查:tag 必须打在包含最新代码且 `npm test` 全绿的 commit 上;git 安装按 `package.json` 的 `files` 白名单打包,发布前确认 `files` 覆盖全部被 import 的 lib 文件(教训:曾漏 `lib/fold.js` 导致启动 `ERR_MODULE_NOT_FOUND`)。
- Gitee 为手动镜像,脚本只负责 GitHub(origin);要同步 Gitee 的用户自行推 tag。
