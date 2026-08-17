# dsh-monitor 实施计划

设计文档：`docs/superpowers/specs/2026-08-17-dsh-monitor-design.md`

## 阶段与验证

| # | 阶段 | 产物 | 验证 |
|---|---|---|---|
| 0 | 脚手架 | `package.json`、`cordis.patch.yml` | `node -e "JSON.parse(require('fs').readFileSync('package.json'))"`；manifest 含 `dsh.bundle.patch` 与 `dsh.client` |
| 1 | 计费 | `lib/pricing.js` | `node --test test/pricing.test.js`：tierFor 峰/谷/legacy 分界、costOf、parsePricingHtml fixture |
| 2 | 账本 | `lib/store.js` | `node --test test/store.test.js`：account 聚合、sumRange、prune、原子写往返、applyConfigPatch 合法/非法 |
| 3 | RPC 清单 | `lib/typert.host.js` | 结构检查：TYPERT.invocations 与 index.js 服务方法一一对应 |
| 4 | 插件主体 | `lib/index.js` | `node --test test/usage.test.js`：custom 点路径提取、percent 计算、preset 抓取器 off/error/ok 分级（mock fetch） |
| 5 | 客户端 | `lib/client.js` | 语法检查 `node --check`（CJS 包裹内函数体无法直接 check，改用构建期校验/装入实测） |
| 6 | 测试收口 | `test/` 全部 | `node --test test/` 全绿 |
| 7 | 文档 | `README.md`（中英） | 安装/配置/预设字段说明齐全 |
| 8 | 实测（需用户） | 装入 web profile | `dsh plugin --profile web add <本目录>` → 图标/面板/角标/设置页验收清单 |

## 实现要点（防漂）

- 所有金额恒存美元；币种/汇率仅展示层（角标默认 CNY/¥、decimals 4、汇率 7.2）。
- 计费数学 Host/Client 各持一份轻量副本（`priceEntryFor/tierFor/costOf`），两侧读写同一 `config.prices`。
- 投影 `costUsage` 与 cost-meter 一致（事件源回放，保证刷新/重载后角标准确）。
- 每提供方独立缓存 `{fetchedAt, value, inFlight}`；off（无 Key/无订阅）与 error（网络/HTTP/解析）分级。
- 客户端无 JSX：全部 `React.createElement`；样式 `styles.insert` + `.dm-*` 命名空间 + 主题 CSS 变量。
- 服务 `monitor`（serviceKey/namespace 均 'monitor'），方法：getProviderUsage / refreshProvider / getConfig / updateConfig / fetchPrices。
- 只 import `@deepseek-ai/dsh-home-paths`、`@deepseek-ai/dsh-credentials`、`zod`；不导入 cordis 类，只用 ctx API（照 cost-meter）。

## 验收清单（手动，Phase 8）

1. 图标出现在模型切换器左侧（`conversation.input.right`）。
2. 点击面板：头部为当前提供方名字 + preset 徽标 + 刷新图标；条目按 kind 渲染（percent 进度条 / money / number / text）；`resetsAt` 可见；off/error 分级显示。
3. 未配置当前提供方 → 空态 + "去设置"。
4. 会话头部费用角标实时更新，悬停显示 token 明细，刷新页面后仍准确。
5. 设置页：增删提供方、三预设字段切换、价格卡片编辑、官方同步、峰谷窗口只读。
6. opencode 真 Key 与 DeepSeek 真 Key 各验证一次；断网/401 错误态。
7. 中英切换。