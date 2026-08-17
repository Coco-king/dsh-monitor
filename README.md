# dsh-monitor

DeepSeek Harness 会话计费 + 通用提供方用量查询插件。

- **会话费用角标**：包裹 `llm/stream` 捕获每次模型调用 usage，按官方价格（含峰谷计价与历史基础价）精确计费，在会话头部实时显示本会话费用与 token 明细；刷新/重载后依然准确（会话投影事件源回放）。
- **提供方用量面板**：按模型提供方配置用量查询（每个提供方一条配置），在模型切换器左侧的用量图标处点击查看**当前会话所用提供方**的额度。
- **三种预设**：
  - **DeepSeek 官方**：复用 设置→模型 中配置的 API Key，查询官方账户余额（仅发往 `api.deepseek.com`，非官方端点拒绝）。
  - **OpenCode**：查询 OpenCode Go 套餐额度——**滚动 5 小时 / 本周 / 本月** 用量百分比与重置时间（`opencode.ai/zen/go/v1/usage`）。
  - **自定义**：任意 HTTP 用量接口——URL + 请求头（支持 `{apiKey}` 占位）+ JSON 取值路径，逐条展示（percent / number / money / text，可带上限与重置时间）。
- **官方价格同步**：一键从 DeepSeek 官方定价页同步价格表与峰谷窗口；默认预置 deepseek-v4-flash / deepseek-v4-pro。

## 安装

```sh
dsh plugin --profile web add <本仓库路径>
```

包声明了 `dsh.bundle.patch`，安装后自动加入 web profile 的 bundle 层栈；`dsh plugin --profile web remove dsh-monitor` 可卸载。重启 web 服务（或刷新页面 + HMR）后生效。

> 开发迭代：改代码后重新 `dsh plugin --profile web add <本仓库路径>`；若在 DeepSeek Harness 仓库内跑 `pnpm run dev:web`，客户端改动可经 client HMR 热更新。

## 使用

1. **配置提供方**：设置 → 用量 → 提供方用量配置 → 添加提供方。提供方 ID 需与模型切换器中的提供方一致（如 `deepseek`、`opencode`，具体以当前会话模型目录为准）。选择预设并填写字段后保存。
2. **查看用量**：输入栏右侧（模型切换器左侧）点击用量图标，面板展示当前会话提供方的额度；头部显示提供方名字与预设徽标，右上角刷新图标强制刷新。
3. **会话费用**：会话头部显示本会话费用 chip，悬停查看输入/缓存/输出 token 明细。
4. **价格**：设置 → 用量 → 计费价格，可手动编辑价格、新增模型、或从官方文档同步。

## 配置模型

持久化于 `$DSH_HOME/storages/dsh-monitor/ledger.json`（`config` 字段）：

```jsonc
{
  "locale": "auto",            // auto | zh | en
  "currency": "CNY",           // 角标展示币种(账本恒存美元)
  "symbol": "¥",
  "decimals": 4,
  "exchangeRate": 7.2,
  "peakEnabled": true,         // 峰谷计价
  "peakEffectiveAt": "2026-08-01T00:00:00Z",
  "peakWindows": [{ "start": 1, "end": 4 }, { "start": 6, "end": 10 }],
  "prices": {                  // 美元 / 1M tokens;cacheWrite 按命中价计
    "models": { "deepseek-v4-flash": { "cacheHit": 0.007, "cacheMiss": 0.22, "output": 0.66, "offPeak": {}, "peak": {}, "legacyBase": {} }, "deepseek-v4-pro": {} },
    "default": { "cacheHit": 0.007, "cacheMiss": 0.22, "output": 0.66 }
  },
  "providers": {
    "deepseek": { "enabled": true, "preset": "deepseek", "refreshMinutes": 5, "apiKey": "" },
    "opencode": { "enabled": true, "preset": "opencode", "refreshMinutes": 15, "apiKey": "" },
    "custom1": {
      "enabled": true, "preset": "custom", "refreshMinutes": 10, "apiKey": "k",
      "custom": {
        "url": "https://example.com/usage",
        "headers": { "Authorization": "Bearer {apiKey}" },
        "items": [
          { "key": "weekly", "label": "本周", "kind": "percent", "path": "usage.weekly.percent", "maxPath": null, "resetsAtPath": "usage.weekly.resetsAt" },
          { "key": "tokens", "label": "Tokens", "kind": "number", "path": "usage.tokens", "maxPath": 1000000, "resetsAtPath": null }
        ]
      }
    }
  },
  "historyDays": 180,
  "fetchedAt": null,
  "priceSource": "bundled"     // bundled | official
}
```

自定义条目字段：

| 字段 | 说明 |
|---|---|
| `key` | 条目唯一 id |
| `label` | 展示名 |
| `kind` | `percent`(值即百分比) / `number` / `money` / `text` |
| `path` | 响应 JSON 点路径,如 `usage.weekly.percent` |
| `maxPath` | 上限:数字常量或 JSON 路径;存在时自动计算 percent = value/max×100 |
| `resetsAtPath` | 重置时间 JSON 路径(可选) |

## 权限说明

- DeepSeek 余额：仅请求官方域名 `api.deepseek.com`，其余端点一律拒绝且不发送 Key。
- OpenCode：仅请求官方域名 `opencode.ai`，Key 解析顺序：配置 `apiKey` → DSH 凭据 `OPENCODE_GO_API_KEY` → 环境变量 `OPENCODE_GO_API_KEY` / `OPENCODE_API_KEY` → `opencode auth.json`。
- 自定义：请求目标与头由用户配置，凭证自担风险。

## 开发

```sh
npm install --cache ./.npm-cache   # 沙箱环境缓存须落在工作区内
npm test                           # node --test,33 个用例
```

结构：`lib/index.js`(Host 主体)、`lib/store.js`(账本+配置校验)、`lib/pricing.js`(价格/峰谷/官方解析)、`lib/typert.host.js`(Typert 清单)、`lib/client.js`(浏览器半边)。计费与价格数学移植自 [dsh-cost-meter](https://github.com/Han-1413141/dsh-cost-meter)(MIT)。

## License

MIT