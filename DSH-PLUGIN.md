[提交插件] dsh-monitor

## 插件信息

- **GitHub 仓库地址**：https://github.com/Coco-king/dsh-monitor
- **插件类型**：cordis-plugin
- **一句话简介**：DeepSeek Harness 会话计费与用量查询插件：会话头部实时显示费用角标，用量图标一键查看当前提供方额度（DeepSeek 官方余额 / OpenCode 5 小时·周·月套餐 / 自定义 HTTP 用量接口），支持官方价格一键同步与 Token 台账统计。
- **作者自述简介**：[这个插件源于我自己「总想知道这个月 DeepSeek 花了多少钱、OpenCode 套餐还剩多少额度」的诉求：费用角标挂在会话头部实时更新，悬停可见 token 明细；点一下用量图标就能看到当前提供方的余额或套餐余量及重置时间。另外附带 Token 台账（今日/周/月/累计、按提供方与项目分布、活跃热力图）和官方定价一键同步，界面中英双语，欢迎试用反馈。]
- **是否已打 dsh-plugin 相关 topic**：已打（GitHub topic：`dsh-plugin`、`dsh-plugins`）

## 补充说明（可选）

- **独特功能/使用场景**：
  - 费用按 DeepSeek 官方刊例价实时累计，支持高峰/低谷时段计费（含旧版基础价，模型可各自声明峰谷窗口，默认按官方 2026-08-30 起的工作日峰谷规则）；数据以事件溯源方式写入本地 SQLite 台账，刷新、重启后费用依然准确，首次启动会自动回填历史会话记录。
  - 用量面板内置三种预设：DeepSeek 官方余额（无需绑定，直接复用模型设置里的 API Key，且只请求官方主机 `api.deepseek.com`）；OpenCode Go 套餐（5 小时/周/月额度百分比与重置时间）；自定义 HTTP 用量接口（URL + 请求头 + JSON path，可按百分比/数值/金额/文本逐项展示，支持可选上限与重置时间字段）。
  - 价格表支持从 DeepSeek 官方定价页一键同步（高峰窗口同步更新），预置 deepseek-v4-flash / deepseek-v4-pro 价格，USD / CNY 双币种独立保存并随界面语言自动切换。
- **额外配置**：DeepSeek 官方余额查询与费用计费零额外配置；OpenCode 用量需已有 opencode 登录凭据（或 `OPENCODE_GO_API_KEY` 环境变量/DSH credential）；自定义用量接口需自行填写 URL、请求头与 JSON path。
- **截图/演示**：仓库 `docs/screenshots/` 下有运行截图（提供方用量绑定弹窗、DeepSeek 余额面板、OpenCode 套餐面板、会话费用角标、价格设置、Token 台账等，目前以中文界面截图为主）。
