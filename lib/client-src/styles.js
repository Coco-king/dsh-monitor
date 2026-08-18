/**
 * dsh-monitor 客户端样式:全部经 --dsw-* 主题变量,跟随全局亮/暗主题。
 * 两段组织:
 *  - 「用量图标/面板/会话角标」:沿用原样式(视觉不变,仅搬迁);
 *  - 「设置页(用量)」:对齐 DSH 设置→模型/通用设置 的设计语言
 *    (14/22 正文、12/18 说明、16/500 标题、h32 r8 输入、胶囊按钮、
 *    border-l2 卡片、bg-module-platform 编辑面)。
 */

const css = [
  '/* dsh-monitor: 用量图标/面板与设置页 */',

  // ── 用量图标 / 悬浮面板 / 会话角标(沿用原样式) ─────────────────────────
  '.dm-icon-btn{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border:none;border-radius:999px;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;flex:none}',
  '.dm-icon-btn:hover{background:var(--dsw-alias-interactive-bg-hover)}',
  '.dm-icon-btn:disabled{opacity:.5;cursor:default}',
  '.dm-icon-btn-open{background:var(--dsw-alias-interactive-bg-hover)}',
  '.dm-icon-btn .dm-spin{animation:dm-spin 1s linear infinite}',
  '@keyframes dm-spin{to{transform:rotate(360deg)}}',
  '.dm-dock{position:relative;display:inline-flex;align-items:center}',
  '.dm-panel{position:absolute;right:0;bottom:calc(100% + 8px);z-index:60;width:320px;max-width:calc(100vw - 32px);box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2-darkmode-thin);border-radius:12px;background:var(--dsw-specific-input-major);box-shadow:var(--dsw-shadow-lv2);padding:12px;font-size:14px;line-height:22px;color:var(--dsw-alias-label-primary)}',
  '.dm-panel-head{display:flex;align-items:center;gap:8px;margin-bottom:10px}',
  '.dm-panel-title{flex:1;min-width:0;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
  '.dm-preset{flex:none;font-size:12px;font-weight:500;color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-layer-2);border-radius:6px;padding:0 6px;height:18px;line-height:18px}',
  '.dm-items{display:flex;flex-direction:column;gap:10px}',
  '.dm-row{display:flex;align-items:center;gap:8px;font-size:13px}',
  '.dm-label{flex:none;width:auto;min-width:40px;color:var(--dsw-alias-label-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
  '.dm-bar{flex:1;height:6px;border-radius:3px;background:var(--dsw-alias-interactive-bg-hover);overflow:hidden}',
  '.dm-fill{height:100%;border-radius:3px;background:var(--dsw-alias-brand-primary)}',
  '.dm-fill.warn{background:var(--dsw-alias-state-warn-primary)}',
  '.dm-fill.over{background:var(--dsw-alias-state-error-primary)}',
  '.dm-num{flex:none;min-width:52px;text-align:right;font-weight:600;font-variant-numeric:tabular-nums}',
  '.dm-reset{font-size:12px;color:var(--dsw-alias-label-tertiary);padding-left:48px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
  '.dm-msg{font-size:13px;line-height:20px;border-radius:8px;padding:8px 10px;margin-bottom:8px}',
  '.dm-msg.err{color:var(--dsw-alias-state-error-primary);background:var(--dsw-alias-interactive-bg-hover-danger)}',
  '.dm-msg.off,.dm-empty{color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-interactive-bg-hover);border-radius:8px;padding:8px 10px;font-size:13px}',
  '.dm-panel-foot{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:10px;font-size:12px;color:var(--dsw-alias-label-tertiary);border-top:1px solid var(--dsw-alias-border-l1);padding-top:8px}',
  '.dm-chip{display:inline-flex;align-items:center;gap:4px;max-width:180px;padding:0 8px;height:24px;border-radius:8px;background:var(--dsw-alias-bg-layer-2);font-size:12px;line-height:24px;color:var(--dsw-alias-label-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',

  // ── 设置页(用量):区块骨架 ────────────────────────────────────────────────
  '.dm-section{max-width:720px;display:flex;flex-direction:column;gap:20px;color:var(--dsw-alias-label-primary);font-size:14px;line-height:22px}',
  '.dm-subsection{display:flex;flex-direction:column;gap:12px;min-width:0}',
  '.dm-h{margin:0;font-size:16px;line-height:24px;font-weight:500;color:var(--dsw-alias-label-primary)}',
  '.dm-intro{margin:0;font-size:14px;line-height:22px;color:var(--dsw-alias-label-tertiary)}',
  '.dm-note{margin:0;font-size:12px;line-height:18px;color:var(--dsw-alias-label-tertiary)}',
  '.dm-custom-intro{color:var(--dsw-alias-label-secondary)}',
  '.dm-notice{margin:0;font-size:12px;line-height:18px}',
  '.dm-notice.err{color:var(--dsw-alias-state-error-primary)}',
  '.dm-notice.ok{color:var(--dsw-alias-state-success-primary)}',
  '.dm-toolbar{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}',

  // ── 设置页:提供方列表 ────────────────────────────────────────────────────
  '.dm-list{list-style:none;margin:12px 0 0;padding:0;display:flex;flex-direction:column;gap:8px}',
  '.dm-card{border:1px solid var(--dsw-alias-border-l2);border-radius:12px;padding:12px 14px;display:flex;flex-direction:column;gap:10px;background:transparent}',
  '.dm-card-head{display:flex;align-items:center;gap:8px}',
  '.dm-card-name{flex:1;min-width:0;display:flex;align-items:center;gap:6px;font-size:14px;line-height:22px;font-weight:500;color:var(--dsw-alias-label-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
  '.dm-tag{flex:none;padding:1px 6px;border:1px solid var(--dsw-alias-border-l3);border-radius:4px;font-size:11px;line-height:16px;color:var(--dsw-alias-label-secondary)}',
  '.dm-card-meta{margin:0;font-size:12px;line-height:18px;color:var(--dsw-alias-label-tertiary);overflow-wrap:anywhere}',
  '.dm-card-actions{display:inline-flex;align-items:center;gap:4px;margin-left:auto;flex:none}',
  '.dm-add-block{display:flex;flex-direction:column;gap:12px;margin-top:12px}',

  // ── 设置页:编辑面 / 表单 ─────────────────────────────────────────────────
  '.dm-editor{border-radius:12px;background:var(--dsw-alias-bg-module-platform);padding:14px 16px;display:flex;flex-direction:column;gap:14px}',
  '.dm-editor-head{display:flex;align-items:baseline;gap:8px}',
  '.dm-editor-title{font-size:14px;line-height:22px;font-weight:500;color:var(--dsw-alias-label-primary)}',
  '.dm-field{display:flex;flex-direction:column;gap:6px;min-width:0}',
  '.dm-field>label,.dm-field-caption>label{font-size:12px;line-height:18px;font-weight:500;color:var(--dsw-alias-label-secondary)}',
  '.dm-field-caption{display:inline-flex;align-items:center;gap:4px;min-width:0}',
  '.dm-hint{display:inline-flex;align-items:center;justify-content:center;width:14px;height:14px;border-radius:50%;border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-tertiary);font-size:10px;line-height:1;cursor:help;flex:none;user-select:none}',
  '.dm-hint:hover{color:var(--dsw-alias-label-secondary);border-color:var(--dsw-alias-border-l3);background:var(--dsw-alias-interactive-bg-hover)}',
  '.dm-input{box-sizing:border-box;width:100%;height:32px;padding:0 10px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:14px;line-height:22px;min-width:0}',
  '.dm-input:focus{outline:none;border-color:var(--dsw-alias-brand-primary)}',
  '.dm-input::placeholder{color:var(--dsw-alias-label-dimmed)}',
  '.dm-input:disabled{opacity:.6;cursor:default}',
  'select.dm-input{max-width:240px;cursor:pointer}',
  '.dm-textarea{box-sizing:border-box;min-height:64px;padding:6px 10px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;line-height:18px;font-family:var(--dsw-font-family-mono,monospace);width:100%;min-width:0;resize:vertical}',
  '.dm-textarea:focus{outline:none;border-color:var(--dsw-alias-brand-primary)}',
  '.dm-grid2{display:grid;grid-template-columns:1fr 1fr;gap:10px}',
  '.dm-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}',
  '.dm-switch{cursor:pointer;user-select:none;display:inline-flex;align-items:center;gap:6px;font-size:12px;line-height:18px;color:var(--dsw-alias-label-primary)}',

  // ── 设置页:自定义用量条目 ────────────────────────────────────────────────
  '.dm-item-list{display:flex;flex-direction:column;gap:8px}',
  '.dm-header-list{display:flex;flex-direction:column;gap:6px}',
  '.dm-header-row{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr) auto;gap:6px;align-items:center}',
  '.dm-item{border:1px solid var(--dsw-alias-border-l2);border-radius:8px;padding:10px;display:flex;flex-direction:column;gap:8px}',
  '.dm-item-head{display:flex;align-items:center;justify-content:space-between;gap:8px}',
  '.dm-item-title{font-size:12px;line-height:18px;font-weight:500;color:var(--dsw-alias-label-secondary)}',
  '.dm-custom-explain{font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary)}',
  '.dm-custom-explain>summary{display:flex;align-items:center;gap:6px;width:fit-content;padding:0 4px;margin-left:-4px;border-radius:6px;cursor:pointer;font-weight:500;color:var(--dsw-alias-label-secondary);list-style:none}',
  '.dm-custom-explain>summary::-webkit-details-marker{display:none}',
  '.dm-custom-explain>summary::before{content:\'\';width:5px;height:5px;border-right:1.5px solid currentcolor;border-bottom:1.5px solid currentcolor;transform:rotate(-45deg) translate(-1px,-1px);transition:transform 120ms ease}',
  '.dm-custom-explain[open]>summary::before{transform:rotate(45deg) translate(-1px,-1px)}',
  '.dm-custom-explain>summary:hover{color:var(--dsw-alias-label-primary)}',
  '.dm-custom-explain-body{display:flex;flex-direction:column;gap:8px;padding:8px 4px 2px;border-top:1px solid var(--dsw-alias-border-l2);margin-top:6px}',
  '.dm-custom-explain-body .dm-note{white-space:pre-line;color:var(--dsw-alias-label-secondary)}',

  // ── 设置页:按钮 ──────────────────────────────────────────────────────────
  '.dm-btn{box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;gap:4px;height:32px;padding:0 14px;border:none;border-radius:16px;background:var(--dsw-alias-button-primary-fill);color:var(--dsw-alias-label-primary-foreground);font:inherit;font-size:13px;line-height:20px;cursor:pointer}',
  '.dm-btn:hover:not(:disabled){background:var(--dsw-alias-button-primary-hover)}',
  '.dm-btn:disabled{opacity:.4;cursor:default}',
  '.dm-btn.ghost,.dm-btn.danger{border:1px solid var(--dsw-alias-border-l2);background:transparent}',
  '.dm-btn.ghost{color:var(--dsw-alias-label-primary)}',
  '.dm-btn.ghost:hover:not(:disabled),.dm-btn.add:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}',
  '.dm-btn.danger{color:var(--dsw-alias-state-error-primary)}',
  '.dm-btn.danger:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover-danger)}',
  '.dm-btn.small{height:28px;padding:0 10px;border-radius:14px;font-size:12px;line-height:18px}',
  '.dm-btn.add{flex:1 1 0;min-width:180px;gap:6px;height:44px;border:1px dashed var(--dsw-alias-border-l3);border-radius:12px;background:transparent;color:var(--dsw-alias-label-primary)}',
  '.dm-btn:focus-visible,.dm-input:focus-visible,.dm-textarea:focus-visible{outline:none;box-shadow:0 0 0 2px var(--dsw-alias-border-l3)}',
  '.dm-icon-btn.danger{color:var(--dsw-alias-label-tertiary)}',
  '.dm-icon-btn.danger:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover-danger);color:var(--dsw-alias-state-error-primary)}',
  '.dm-row-actions{display:flex;align-items:center;gap:6px}',
  '.dm-row-actions.end{justify-content:flex-end}',

  // ── 提供方用量查询绑定弹窗(设置→模型 行图标触发) ─────────────────────
  '.dm-bind-layer{position:fixed;inset:0;z-index:1100;display:flex;align-items:center;justify-content:center;background:var(--dsw-alias-bg-mask-1);backdrop-filter:var(--dsw-mask-blur)}',
  '.dm-bind-card{box-sizing:border-box;width:min(560px,calc(100vw - 32px));max-height:min(80vh,720px);overflow-y:auto;border-radius:16px;background:var(--dsw-alias-bg-layer-2);box-shadow:var(--dsw-shadow-lv3);padding:16px 18px;display:flex;flex-direction:column;gap:12px}',
  '.dm-bind-head{display:flex;align-items:center;gap:8px;min-width:0}',
  '.dm-bind-title{font-size:16px;line-height:24px;font-weight:500;color:var(--dsw-alias-label-primary)}',
  '.dm-bind-sub{flex:1;min-width:0;font-size:12px;line-height:18px;color:var(--dsw-alias-label-tertiary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
  '.dm-bind-foot{display:flex;justify-content:flex-end;border-top:1px solid var(--dsw-alias-border-l2);padding-top:10px}',
  '.dm-img-layer{position:fixed;inset:0;z-index:1200;display:flex;align-items:center;justify-content:center;background:var(--dsw-alias-bg-mask-1);backdrop-filter:var(--dsw-mask-blur);padding:24px;box-sizing:border-box}',
  '.dm-img-card{display:flex;flex-direction:column;gap:10px;max-width:min(1100px,100%);max-height:100%;align-items:center}',
  '.dm-img{max-width:100%;max-height:calc(100vh - 140px);object-fit:contain;border-radius:8px;background:#fff;box-shadow:var(--dsw-shadow-lv3)}',
  '.dm-img-actions{display:flex;justify-content:center}',

  // ── 设置页:计费价格表 ────────────────────────────────────────────────────
  '.dm-price-table{display:flex;flex-direction:column;gap:8px;margin-top:4px}',
  // 数字列收窄(够 0.0007 几位小数),名称列宽出基础价徽标的显示空间。
  '.dm-price-caption{display:grid;grid-template-columns:minmax(0,1.6fr) repeat(3,minmax(3.2em,4.2em)) auto;gap:8px;padding:0 6px;font-size:12px;line-height:18px;font-weight:500;color:var(--dsw-alias-label-secondary)}',
  '.dm-price-row{border:1px solid var(--dsw-alias-border-l2);border-radius:8px;padding:8px;display:flex;flex-direction:column;gap:6px}',
  '.dm-price-fields{display:grid;grid-template-columns:minmax(0,1.6fr) repeat(3,minmax(3.2em,4.2em)) auto;gap:8px;align-items:center}',
  '.dm-price-name{display:flex;align-items:center;gap:6px;min-width:0;font-size:14px;line-height:22px;font-weight:500;color:var(--dsw-alias-label-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
  '.dm-price-base{flex:none;padding:1px 6px;border:1px solid var(--dsw-alias-border-l3);border-radius:4px;font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary)}',
  '.dm-price-actions{display:flex;align-items:center;gap:2px;justify-content:flex-end}',
  '.dm-tier-edits{display:flex;flex-direction:column;gap:6px;padding:8px 4px 2px;font-size:12px;line-height:18px;border-top:1px solid var(--dsw-alias-border-l2)}',
  '.dm-tier-row{display:grid;grid-template-columns:minmax(0,1.6fr) repeat(3,minmax(3.2em,4.2em)) auto;gap:8px;align-items:center}',
  '.dm-tier-name{color:var(--dsw-alias-label-secondary);font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
  '.dm-tier-row .dm-icon-btn{width:24px;height:24px}',
  '.dm-tier-windows{display:flex;align-items:center;flex-wrap:wrap;gap:6px;padding:0 4px;font-size:12px;line-height:18px}',
  '.dm-window-label{color:var(--dsw-alias-label-tertiary);font-weight:500}',
  '.dm-window-tag{display:inline-flex;align-items:center;gap:4px;padding:1px 6px;border:1px solid var(--dsw-alias-border-l3);border-radius:999px;color:var(--dsw-alias-label-secondary);white-space:nowrap}',
  '.dm-window-tag .dm-window-remove{border:none;background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer;padding:0;font-size:12px;line-height:14px}',
  '.dm-window-tag .dm-window-remove:hover{color:var(--dsw-alias-state-error-primary)}',
  '.dm-window-add{display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border:1px dashed var(--dsw-alias-border-l3);border-radius:999px;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;font-size:14px;line-height:14px}',
  '.dm-window-add:hover{border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-brand-primary)}',
  '.dm-window-edit{display:inline-flex;align-items:center;gap:4px}',
  '.dm-window-edit .dm-input{width:auto;padding:0 4px;font-size:12px}',
  '.dm-window-error{color:var(--dsw-alias-state-error-primary)}',
  // 价格数字输入:去掉浏览器上下箭头,宽度由列约束。
  '.dm-num::-webkit-outer-spin-button,.dm-num::-webkit-inner-spin-button{-webkit-appearance:none;appearance:none;margin:0}',
  '.dm-num{-moz-appearance:textfield;appearance:textfield}',

  // ── 设置页:用量汇总(柱形图/卡片/会话列表) ──────────────────────────────
  '.dm-filter-row{flex-wrap:wrap;gap:6px}',
  '.dm-filter-label{flex:none;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}',
  '.dm-filter-range{flex-wrap:wrap}',
  '.dm-btn.small{height:24px;padding:0 10px;border-radius:999px;font-size:12px}',
  '.dm-btn.small.active{background:var(--dsw-alias-brand-primary);border-color:var(--dsw-alias-brand-primary);color:var(--dsw-specific-text-on-brand)}',
  '.dm-summary-cards{display:flex;gap:10px;flex-wrap:wrap}',
  '.dm-summary-card{flex:1 1 160px;max-width:220px;border:1px solid var(--dsw-alias-border-l2);border-radius:12px;padding:10px 12px;display:flex;flex-direction:column;gap:4px;background:transparent}',
  '.dm-summary-card-label{font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary)}',
  '.dm-summary-card-val{font-size:20px;line-height:28px;font-weight:600;font-variant-numeric:tabular-nums;color:var(--dsw-alias-label-primary)}',
  '.dm-summary-card-sub{font-size:12px;line-height:18px;color:var(--dsw-alias-label-tertiary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
  '.dm-chart{width:100%;background:transparent}',
  '.dm-chart-empty{padding:24px 10px;text-align:center}',
  '.dm-chart-tick{fill:var(--dsw-alias-label-tertiary)}',
  '.dm-chart-bar{fill:var(--dsw-alias-brand-primary)}',
  '.dm-table-wrap{width:100%;overflow-x:auto;border:1px solid var(--dsw-alias-border-l2);border-radius:8px}',
  '.dm-table{width:100%;border-collapse:collapse;font-size:13px;line-height:20px}',
  '.dm-table th,.dm-table td{padding:6px 10px;text-align:left;white-space:nowrap}',
  '.dm-table th{font-size:12px;font-weight:500;color:var(--dsw-alias-label-tertiary);border-bottom:1px solid var(--dsw-alias-border-l2)}',
  '.dm-table td{color:var(--dsw-alias-label-primary);border-bottom:1px solid var(--dsw-alias-border-l1)}',
  '.dm-table tr:last-child td{border-bottom:none}',
  '.dm-table td.num,.dm-table th.num{text-align:right;font-variant-numeric:tabular-nums}',
  '.dm-table td.id{max-width:200px;overflow:hidden;text-overflow:ellipsis;color:var(--dsw-alias-label-secondary)}',

  // ── 侧边栏用量看板(徽标 + 浮动面板) ─────────────────────────────────────
  // 徽标所在插槽 `sidebar.footer.action` 是 nowrap 行,occupant 需撑满/换行
  // (TokenLedger 同款坑:再加一个 occupant 会挤出侧栏)。
  'div:has(> [data-slot="sidebar.footer.action"]){flex-wrap:wrap}',
  '.dm-dash-layer{flex:0 0 100%;min-width:0;display:flex;flex-direction:column;align-items:center;margin-top:8px}',
  '.dm-dash-rail{flex:none;width:36px;height:36px;margin:0}',
  '.dm-dash-badge{width:100%;height:40px;border:none;border-radius:12px;background:transparent;color:var(--dsw-alias-label-primary);display:flex;align-items:center;gap:8px;padding:0 8px 0 6px;font:inherit;font-size:14px;line-height:20px;cursor:pointer;overflow:hidden}',
  '.dm-dash-badge:hover{background:var(--dsw-alias-interactive-bg-hover-solid)}',
  '.dm-dash-badge-open{background:var(--dsw-alias-interactive-bg-hover)}',
  '.dm-dash-badge-icon{flex:none;display:inline-flex;align-items:center}',
  '.dm-dash-badge-label{flex:1;min-width:0;text-overflow:ellipsis;white-space:nowrap;overflow:hidden;text-align:left}',
  '.dm-dash-badge-value{flex:none;color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums;font-size:12px;line-height:16px}',
  '.dm-dash-rail .dm-dash-badge{width:36px;height:36px;border-radius:50%;justify-content:center;padding:0}',
  '.dm-dash-rail .dm-dash-badge-label,.dm-dash-rail .dm-dash-badge-value{display:none}',
  // 面板
  '.dm-dash-panel{position:fixed;left:12px;bottom:132px;z-index:80;width:460px;max-width:calc(100vw - 24px);max-height:76vh;box-sizing:border-box;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-overlay,var(--dsw-alias-bg-base));border-radius:12px;box-shadow:var(--dsw-shadow-lv2);display:flex;flex-direction:column;overflow:hidden}',
  '.dm-dash-head{flex:none;display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:44px;padding:10px 12px;border-bottom:1px solid var(--dsw-alias-border-l2)}',
  '.dm-dash-title{font-size:13px;line-height:20px;font-weight:500;color:var(--dsw-alias-label-primary);white-space:nowrap}',
  '.dm-dash-actions{display:flex;align-items:center;gap:2px}',
  '.dm-dash-icon{width:26px;height:26px;border:none;background:transparent;border-radius:6px;display:inline-flex;align-items:center;justify-content:center;color:var(--dsw-alias-label-tertiary);cursor:pointer}',
  '.dm-dash-icon:hover{color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-interactive-bg-hover)}',
  '.dm-dash-icon:disabled{opacity:.5;cursor:default}',
  '.dm-dash-body{flex:1;min-height:0;overflow-y:auto;padding:12px 14px 14px}',
  '.dm-dash-note{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px;margin:0}',
  '.dm-dash-error{color:var(--dsw-alias-state-error-primary);font-size:12px;line-height:18px;margin:0}',
  // 统计卡片(兼范围切换)
  '.dm-dash-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px}',
  '.dm-dash-card{border:1px solid var(--dsw-alias-border-l2);border-radius:8px;padding:8px 10px;background:transparent;text-align:left;cursor:pointer;font:inherit;color:var(--dsw-alias-label-primary)}',
  '.dm-dash-card:hover{background:var(--dsw-alias-interactive-bg-hover)}',
  '.dm-dash-card-on{border-color:var(--dsw-alias-label-tertiary);background:var(--dsw-alias-interactive-bg-active)}',
  '.dm-dash-card-val{font-size:16px;line-height:22px;font-weight:600;font-variant-numeric:tabular-nums;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
  '.dm-dash-card-label{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px;margin-top:2px}',
  // 分区
  '.dm-dash-section{margin-top:14px}.dm-dash-section:first-of-type{margin-top:0}',
  '.dm-dash-section-title{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px;font-weight:500;margin:0 0 6px}',
  // 热力带
  '.dm-dash-heat{display:flex;flex-direction:column;gap:6px}',
  '.dm-dash-heat-grid{display:grid;grid-auto-flow:column;grid-auto-columns:12px;grid-template-rows:repeat(7,12px);gap:3px;overflow-x:auto}',
  '.dm-dash-heat-cell{width:12px;height:12px;border-radius:2px;background:rgba(128,128,128,.16)}',
  '.dm-dash-heat-cell[data-l="1"]{background:var(--dsw-alias-state-success-primary)}',
  '.dm-dash-heat-cell[data-l="2"]{background:var(--dsw-alias-state-success-primary);opacity:.75}',
  '.dm-dash-heat-cell[data-l="3"]{background:var(--dsw-alias-state-success-primary);opacity:.5}',
  '.dm-dash-heat-cell[data-l="4"]{background:var(--dsw-alias-state-success-primary);opacity:.3}',
  '.dm-dash-heat-pad{width:12px;height:12px}',
  '.dm-dash-heat-legend{display:flex;align-items:center;gap:3px;font-size:10px;line-height:14px;color:var(--dsw-alias-label-caption)}',
  '.dm-dash-heat-swatch{width:10px;height:10px;border-radius:2px;background:rgba(128,128,128,.16)}',
  '.dm-dash-heat-swatch[data-l="1"]{background:var(--dsw-alias-state-success-primary)}',
  '.dm-dash-heat-swatch[data-l="2"]{background:var(--dsw-alias-state-success-primary);opacity:.75}',
  '.dm-dash-heat-swatch[data-l="3"]{background:var(--dsw-alias-state-success-primary);opacity:.5}',
  '.dm-dash-heat-swatch[data-l="4"]{background:var(--dsw-alias-state-success-primary);opacity:.3}',
  // 模型表
  '.dm-dash-table{width:100%;border-collapse:collapse;font-size:12px}',
  '.dm-dash-table th{color:var(--dsw-alias-label-tertiary);font-size:11px;font-weight:500;line-height:16px;text-align:right;padding:0 0 5px;border-bottom:1px solid var(--dsw-alias-border-l2);white-space:nowrap}',
  '.dm-dash-table th:first-child{text-align:left}',
  '.dm-dash-table td{color:var(--dsw-alias-label-primary);font-size:12px;text-align:right;padding:5px 0;border-bottom:1px solid var(--dsw-alias-border-l1);font-variant-numeric:tabular-nums;white-space:nowrap}',
  '.dm-dash-table td:first-child{text-align:left;max-width:150px;overflow:hidden;text-overflow:ellipsis}',
  '.dm-dash-table tr:last-child td{border-bottom:0}',
  '.dm-dash-table td.num{text-align:right}',
  // 会话列表
  '.dm-dash-sessions{display:flex;flex-direction:column}',
  '.dm-dash-session{display:flex;align-items:center;gap:8px;padding:6px 2px;border-bottom:1px solid var(--dsw-alias-border-l1);font-size:12px;line-height:18px}',
  '.dm-dash-session:last-child{border-bottom:0}',
  '.dm-dash-session-id{flex:1;min-width:0;color:var(--dsw-alias-label-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
  '.dm-dash-session-date{flex:none;color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums}',
  '.dm-dash-session-tokens{flex:none;color:var(--dsw-alias-label-primary);font-variant-numeric:tabular-nums;min-width:48px;text-align:right}',
  '.dm-dash-session-cost{flex:none;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums;min-width:56px;text-align:right}',

  // ── 响应式 ───────────────────────────────────────────────────────────────
  '@media (max-width:640px){.dm-grid2,.dm-grid3{grid-template-columns:1fr}.dm-price-caption{display:none}.dm-price-fields{grid-template-columns:1fr 1fr}.dm-price-fields .dm-price-name{grid-column:1/-1}.dm-tier-row{grid-template-columns:1fr 1fr}.dm-summary-card{max-width:none;flex-basis:100%}}',
].join('\n')

const cssTagId = 'dsh-monitor/client.css'

/** 注入 <style> 标签(幂等:已存在则跳过)。 */
export function injectStyles() {
  if (typeof document === 'undefined') return
  const selector = 'style[data-plugin-css=' + JSON.stringify(cssTagId) + ']'
  if (document.querySelector(selector) !== null) return
  const tag = document.createElement('style')
  tag.dataset.plugin = 'dsh-monitor'
  tag.dataset.pluginCss = cssTagId
  tag.textContent = css
  document.head.appendChild(tag)
}