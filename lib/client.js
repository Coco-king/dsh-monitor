window.__ModuleLoader__.load({ id: "dsh-monitor", factory: (require) => {
var module = { exports: {} };
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// lib/client-src/styles.js
var styles_exports = {};
__export(styles_exports, {
  injectStyles: () => injectStyles
});
function injectStyles() {
  if (typeof document === "undefined") return;
  const selector = "style[data-plugin-css=" + JSON.stringify(cssTagId) + "]";
  if (document.querySelector(selector) !== null) return;
  const tag = document.createElement("style");
  tag.dataset.plugin = "dsh-monitor";
  tag.dataset.pluginCss = cssTagId;
  tag.textContent = css;
  document.head.appendChild(tag);
}
var css, cssTagId;
var init_styles = __esm({
  "lib/client-src/styles.js"() {
    css = [
      "/* dsh-monitor: \u7528\u91CF\u56FE\u6807/\u9762\u677F\u4E0E\u8BBE\u7F6E\u9875 */",
      // ── 用量图标 / 悬浮面板 / 会话角标(沿用原样式) ─────────────────────────
      ".dm-icon-btn{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border:none;border-radius:999px;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;flex:none}",
      ".dm-icon-btn:hover{background:var(--dsw-alias-interactive-bg-hover)}",
      ".dm-icon-btn:disabled{opacity:.5;cursor:default}",
      ".dm-icon-btn-open{background:var(--dsw-alias-interactive-bg-hover)}",
      ".dm-icon-btn .dm-spin{animation:dm-spin 1s linear infinite}",
      "@keyframes dm-spin{to{transform:rotate(360deg)}}",
      ".dm-dock{position:relative;display:inline-flex;align-items:center}",
      ".dm-panel{position:absolute;right:0;bottom:calc(100% + 8px);z-index:60;width:320px;max-width:calc(100vw - 32px);box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2-darkmode-thin);border-radius:12px;background:var(--dsw-specific-input-major);box-shadow:var(--dsw-shadow-lv2);padding:12px;font-size:14px;line-height:22px;color:var(--dsw-alias-label-primary)}",
      ".dm-panel-head{display:flex;align-items:center;gap:8px;margin-bottom:10px}",
      ".dm-panel-title{flex:1;min-width:0;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
      ".dm-preset{flex:none;font-size:12px;font-weight:500;color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-layer-2);border-radius:6px;padding:0 6px;height:18px;line-height:18px}",
      ".dm-items{display:flex;flex-direction:column;gap:10px}",
      ".dm-row{display:flex;align-items:center;gap:8px;font-size:13px}",
      ".dm-label{flex:none;width:auto;min-width:40px;color:var(--dsw-alias-label-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
      ".dm-bar{flex:1;height:6px;border-radius:3px;background:var(--dsw-alias-interactive-bg-hover);overflow:hidden}",
      ".dm-fill{height:100%;border-radius:3px;background:var(--dsw-alias-brand-primary)}",
      ".dm-fill.warn{background:var(--dsw-alias-state-warn-primary)}",
      ".dm-fill.over{background:var(--dsw-alias-state-error-primary)}",
      ".dm-num{flex:none;min-width:52px;text-align:right;font-weight:600;font-variant-numeric:tabular-nums}",
      ".dm-reset{font-size:12px;color:var(--dsw-alias-label-tertiary);padding-left:48px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
      ".dm-msg{font-size:13px;line-height:20px;border-radius:8px;padding:8px 10px;margin-bottom:8px}",
      ".dm-msg.err{color:var(--dsw-alias-state-error-primary);background:var(--dsw-alias-interactive-bg-hover-danger)}",
      ".dm-msg.off,.dm-empty{color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-interactive-bg-hover);border-radius:8px;padding:8px 10px;font-size:13px}",
      ".dm-panel-foot{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:10px;font-size:12px;color:var(--dsw-alias-label-tertiary);border-top:1px solid var(--dsw-alias-border-l1);padding-top:8px}",
      ".dm-chip{display:inline-flex;align-items:center;gap:4px;max-width:180px;padding:0 8px;height:24px;border-radius:8px;background:var(--dsw-alias-bg-layer-2);font-size:12px;line-height:24px;color:var(--dsw-alias-label-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
      // ── 设置页(用量):区块骨架 ────────────────────────────────────────────────
      ".dm-section{max-width:720px;display:flex;flex-direction:column;gap:20px;color:var(--dsw-alias-label-primary);font-size:14px;line-height:22px}",
      ".dm-subsection{display:flex;flex-direction:column;gap:12px;min-width:0}",
      ".dm-h{margin:0;font-size:16px;line-height:24px;font-weight:500;color:var(--dsw-alias-label-primary)}",
      ".dm-intro{margin:0;font-size:14px;line-height:22px;color:var(--dsw-alias-label-tertiary)}",
      ".dm-note{margin:0;font-size:12px;line-height:18px;color:var(--dsw-alias-label-tertiary)}",
      ".dm-custom-intro{color:var(--dsw-alias-label-secondary)}",
      ".dm-notice{margin:0;font-size:12px;line-height:18px}",
      ".dm-notice.err{color:var(--dsw-alias-state-error-primary)}",
      ".dm-notice.ok{color:var(--dsw-alias-state-success-primary)}",
      ".dm-toolbar{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}",
      // ── 设置页:提供方列表 ────────────────────────────────────────────────────
      ".dm-list{list-style:none;margin:12px 0 0;padding:0;display:flex;flex-direction:column;gap:8px}",
      ".dm-card{border:1px solid var(--dsw-alias-border-l2);border-radius:12px;padding:12px 14px;display:flex;flex-direction:column;gap:10px;background:transparent}",
      ".dm-card-head{display:flex;align-items:center;gap:8px}",
      ".dm-card-name{flex:1;min-width:0;display:flex;align-items:center;gap:6px;font-size:14px;line-height:22px;font-weight:500;color:var(--dsw-alias-label-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
      ".dm-tag{flex:none;padding:1px 6px;border:1px solid var(--dsw-alias-border-l3);border-radius:4px;font-size:11px;line-height:16px;color:var(--dsw-alias-label-secondary)}",
      ".dm-card-meta{margin:0;font-size:12px;line-height:18px;color:var(--dsw-alias-label-tertiary);overflow-wrap:anywhere}",
      ".dm-card-actions{display:inline-flex;align-items:center;gap:4px;margin-left:auto;flex:none}",
      ".dm-add-block{display:flex;flex-direction:column;gap:12px;margin-top:12px}",
      // ── 设置页:编辑面 / 表单 ─────────────────────────────────────────────────
      ".dm-editor{border-radius:12px;background:var(--dsw-alias-bg-module-platform);padding:14px 16px;display:flex;flex-direction:column;gap:14px}",
      ".dm-editor-head{display:flex;align-items:baseline;gap:8px}",
      ".dm-editor-title{font-size:14px;line-height:22px;font-weight:500;color:var(--dsw-alias-label-primary)}",
      ".dm-field{display:flex;flex-direction:column;gap:6px;min-width:0}",
      ".dm-field>label,.dm-field-caption>label{font-size:12px;line-height:18px;font-weight:500;color:var(--dsw-alias-label-secondary)}",
      ".dm-field-caption{display:inline-flex;align-items:center;gap:4px;min-width:0}",
      ".dm-hint{display:inline-flex;align-items:center;justify-content:center;width:14px;height:14px;border-radius:50%;border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-tertiary);font-size:10px;line-height:1;cursor:help;flex:none;user-select:none}",
      ".dm-hint:hover{color:var(--dsw-alias-label-secondary);border-color:var(--dsw-alias-border-l3);background:var(--dsw-alias-interactive-bg-hover)}",
      ".dm-input{box-sizing:border-box;width:100%;height:32px;padding:0 10px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:14px;line-height:22px;min-width:0}",
      ".dm-input:focus{outline:none;border-color:var(--dsw-alias-brand-primary)}",
      ".dm-input::placeholder{color:var(--dsw-alias-label-dimmed)}",
      ".dm-input:disabled{opacity:.6;cursor:default}",
      "select.dm-input{max-width:240px;cursor:pointer}",
      ".dm-textarea{box-sizing:border-box;min-height:64px;padding:6px 10px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;line-height:18px;font-family:var(--dsw-font-family-mono,monospace);width:100%;min-width:0;resize:vertical}",
      ".dm-textarea:focus{outline:none;border-color:var(--dsw-alias-brand-primary)}",
      ".dm-grid2{display:grid;grid-template-columns:1fr 1fr;gap:10px}",
      ".dm-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}",
      ".dm-switch{cursor:pointer;user-select:none;display:inline-flex;align-items:center;gap:6px;font-size:12px;line-height:18px;color:var(--dsw-alias-label-primary)}",
      // ── 设置页:自定义用量条目 ────────────────────────────────────────────────
      ".dm-item-list{display:flex;flex-direction:column;gap:8px}",
      ".dm-header-list{display:flex;flex-direction:column;gap:6px}",
      ".dm-header-row{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr) auto;gap:6px;align-items:center}",
      ".dm-item{border:1px solid var(--dsw-alias-border-l2);border-radius:8px;padding:10px;display:flex;flex-direction:column;gap:8px}",
      ".dm-item-head{display:flex;align-items:center;justify-content:space-between;gap:8px}",
      ".dm-item-title{font-size:12px;line-height:18px;font-weight:500;color:var(--dsw-alias-label-secondary)}",
      ".dm-custom-explain{font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary)}",
      ".dm-custom-explain>summary{display:flex;align-items:center;gap:6px;width:fit-content;padding:0 4px;margin-left:-4px;border-radius:6px;cursor:pointer;font-weight:500;color:var(--dsw-alias-label-secondary);list-style:none}",
      ".dm-custom-explain>summary::-webkit-details-marker{display:none}",
      ".dm-custom-explain>summary::before{content:'';width:5px;height:5px;border-right:1.5px solid currentcolor;border-bottom:1.5px solid currentcolor;transform:rotate(-45deg) translate(-1px,-1px);transition:transform 120ms ease}",
      ".dm-custom-explain[open]>summary::before{transform:rotate(45deg) translate(-1px,-1px)}",
      ".dm-custom-explain>summary:hover{color:var(--dsw-alias-label-primary)}",
      ".dm-custom-explain-body{display:flex;flex-direction:column;gap:8px;padding:8px 4px 2px;border-top:1px solid var(--dsw-alias-border-l2);margin-top:6px}",
      ".dm-custom-explain-body .dm-note{white-space:pre-line;color:var(--dsw-alias-label-secondary)}",
      // ── 设置页:按钮 ──────────────────────────────────────────────────────────
      ".dm-btn{box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;gap:4px;height:32px;padding:0 14px;border:none;border-radius:16px;background:var(--dsw-alias-button-primary-fill);color:var(--dsw-alias-label-primary-foreground);font:inherit;font-size:13px;line-height:20px;cursor:pointer}",
      ".dm-btn:hover:not(:disabled){background:var(--dsw-alias-button-primary-hover)}",
      ".dm-btn:disabled{opacity:.4;cursor:default}",
      ".dm-btn.ghost,.dm-btn.danger{border:1px solid var(--dsw-alias-border-l2);background:transparent}",
      ".dm-btn.ghost{color:var(--dsw-alias-label-primary)}",
      ".dm-btn.ghost:hover:not(:disabled),.dm-btn.add:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}",
      ".dm-btn.danger{color:var(--dsw-alias-state-error-primary)}",
      ".dm-btn.danger:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover-danger)}",
      ".dm-btn.small{height:28px;padding:0 10px;border-radius:14px;font-size:12px;line-height:18px}",
      ".dm-btn.add{flex:1 1 0;min-width:180px;gap:6px;height:44px;border:1px dashed var(--dsw-alias-border-l3);border-radius:12px;background:transparent;color:var(--dsw-alias-label-primary)}",
      ".dm-btn:focus-visible,.dm-input:focus-visible,.dm-textarea:focus-visible{outline:none;box-shadow:0 0 0 2px var(--dsw-alias-border-l3)}",
      ".dm-icon-btn.danger{color:var(--dsw-alias-label-tertiary)}",
      ".dm-icon-btn.danger:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover-danger);color:var(--dsw-alias-state-error-primary)}",
      ".dm-row-actions{display:flex;align-items:center;gap:6px}",
      ".dm-row-actions.end{justify-content:flex-end}",
      // ── 提供方用量查询绑定弹窗(设置→模型 行图标触发) ─────────────────────
      ".dm-bind-layer{position:fixed;inset:0;z-index:1100;display:flex;align-items:center;justify-content:center;background:var(--dsw-alias-bg-mask-1);backdrop-filter:var(--dsw-mask-blur)}",
      ".dm-bind-card{box-sizing:border-box;width:min(560px,calc(100vw - 32px));max-height:min(80vh,720px);overflow-y:auto;border-radius:16px;background:var(--dsw-alias-bg-layer-2);box-shadow:var(--dsw-shadow-lv3);padding:16px 18px;display:flex;flex-direction:column;gap:12px}",
      ".dm-bind-head{display:flex;align-items:center;gap:8px;min-width:0}",
      ".dm-bind-title{font-size:16px;line-height:24px;font-weight:500;color:var(--dsw-alias-label-primary)}",
      ".dm-bind-sub{flex:1;min-width:0;font-size:12px;line-height:18px;color:var(--dsw-alias-label-tertiary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
      ".dm-bind-foot{display:flex;justify-content:flex-end;border-top:1px solid var(--dsw-alias-border-l2);padding-top:10px}",
      ".dm-img-layer{position:fixed;inset:0;z-index:1200;display:flex;align-items:center;justify-content:center;background:var(--dsw-alias-bg-mask-1);backdrop-filter:var(--dsw-mask-blur);padding:24px;box-sizing:border-box}",
      ".dm-img-card{display:flex;flex-direction:column;gap:10px;max-width:min(1100px,100%);max-height:100%;align-items:center}",
      ".dm-img{max-width:100%;max-height:calc(100vh - 140px);object-fit:contain;border-radius:8px;background:#fff;box-shadow:var(--dsw-shadow-lv3)}",
      ".dm-img-actions{display:flex;justify-content:center}",
      // ── 设置页:计费价格表 ────────────────────────────────────────────────────
      ".dm-price-table{display:flex;flex-direction:column;gap:8px;margin-top:4px}",
      // 数字列收窄(够 0.0007 几位小数),名称列宽出基础价徽标的显示空间。
      ".dm-price-caption{display:grid;grid-template-columns:minmax(0,1.6fr) repeat(3,minmax(3.2em,4.2em)) auto;gap:8px;padding:0 6px;font-size:12px;line-height:18px;font-weight:500;color:var(--dsw-alias-label-secondary)}",
      ".dm-price-row{border:1px solid var(--dsw-alias-border-l2);border-radius:8px;padding:8px;display:flex;flex-direction:column;gap:6px}",
      ".dm-price-fields{display:grid;grid-template-columns:minmax(0,1.6fr) repeat(3,minmax(3.2em,4.2em)) auto;gap:8px;align-items:center}",
      ".dm-price-name{display:flex;align-items:center;gap:6px;min-width:0;font-size:14px;line-height:22px;font-weight:500;color:var(--dsw-alias-label-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
      ".dm-price-base{flex:none;padding:1px 6px;border:1px solid var(--dsw-alias-border-l3);border-radius:4px;font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary)}",
      ".dm-price-actions{display:flex;align-items:center;gap:2px;justify-content:flex-end}",
      ".dm-tier-edits{display:flex;flex-direction:column;gap:6px;padding:8px 4px 2px;font-size:12px;line-height:18px;border-top:1px solid var(--dsw-alias-border-l2)}",
      ".dm-tier-row{display:grid;grid-template-columns:minmax(0,1.6fr) repeat(3,minmax(3.2em,4.2em)) auto;gap:8px;align-items:center}",
      ".dm-tier-name{color:var(--dsw-alias-label-secondary);font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
      ".dm-tier-row .dm-icon-btn{width:24px;height:24px}",
      ".dm-tier-windows{display:flex;align-items:center;flex-wrap:wrap;gap:6px;padding:0 4px;font-size:12px;line-height:18px}",
      ".dm-window-label{color:var(--dsw-alias-label-tertiary);font-weight:500}",
      ".dm-window-tag{display:inline-flex;align-items:center;gap:4px;padding:1px 6px;border:1px solid var(--dsw-alias-border-l3);border-radius:999px;color:var(--dsw-alias-label-secondary);white-space:nowrap}",
      ".dm-window-tag .dm-window-remove{border:none;background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer;padding:0;font-size:12px;line-height:14px}",
      ".dm-window-tag .dm-window-remove:hover{color:var(--dsw-alias-state-error-primary)}",
      ".dm-window-add{display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border:1px dashed var(--dsw-alias-border-l3);border-radius:999px;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;font-size:14px;line-height:14px}",
      ".dm-window-add:hover{border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-brand-primary)}",
      ".dm-window-edit{display:inline-flex;align-items:center;gap:4px}",
      ".dm-window-edit .dm-input{width:auto;padding:0 4px;font-size:12px}",
      ".dm-window-error{color:var(--dsw-alias-state-error-primary)}",
      // 价格数字输入:去掉浏览器上下箭头,宽度由列约束。
      ".dm-num::-webkit-outer-spin-button,.dm-num::-webkit-inner-spin-button{-webkit-appearance:none;appearance:none;margin:0}",
      ".dm-num{-moz-appearance:textfield;appearance:textfield}",
      // ── 设置页:用量汇总(柱形图/卡片/会话列表) ──────────────────────────────
      ".dm-filter-row{flex-wrap:wrap;gap:6px}",
      ".dm-filter-label{flex:none;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}",
      ".dm-filter-range{flex-wrap:wrap}",
      ".dm-btn.small{height:24px;padding:0 10px;border-radius:999px;font-size:12px}",
      ".dm-btn.small.active{background:var(--dsw-alias-brand-primary);border-color:var(--dsw-alias-brand-primary);color:var(--dsw-specific-text-on-brand)}",
      ".dm-summary-cards{display:flex;gap:10px;flex-wrap:wrap}",
      ".dm-summary-card{flex:1 1 160px;max-width:220px;border:1px solid var(--dsw-alias-border-l2);border-radius:12px;padding:10px 12px;display:flex;flex-direction:column;gap:4px;background:transparent}",
      ".dm-summary-card-label{font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary)}",
      ".dm-summary-card-val{font-size:20px;line-height:28px;font-weight:600;font-variant-numeric:tabular-nums;color:var(--dsw-alias-label-primary)}",
      ".dm-summary-card-sub{font-size:12px;line-height:18px;color:var(--dsw-alias-label-tertiary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
      ".dm-chart{width:100%;background:transparent}",
      ".dm-chart-empty{padding:24px 10px;text-align:center}",
      ".dm-chart-tick{fill:var(--dsw-alias-label-tertiary)}",
      ".dm-chart-bar{fill:var(--dsw-alias-brand-primary)}",
      ".dm-table-wrap{width:100%;overflow-x:auto;border:1px solid var(--dsw-alias-border-l2);border-radius:8px}",
      ".dm-table{width:100%;border-collapse:collapse;font-size:13px;line-height:20px}",
      ".dm-table th,.dm-table td{padding:6px 10px;text-align:left;white-space:nowrap}",
      ".dm-table th{font-size:12px;font-weight:500;color:var(--dsw-alias-label-tertiary);border-bottom:1px solid var(--dsw-alias-border-l2)}",
      ".dm-table td{color:var(--dsw-alias-label-primary);border-bottom:1px solid var(--dsw-alias-border-l1)}",
      ".dm-table tr:last-child td{border-bottom:none}",
      ".dm-table td.num,.dm-table th.num{text-align:right;font-variant-numeric:tabular-nums}",
      ".dm-table td.id{max-width:200px;overflow:hidden;text-overflow:ellipsis;color:var(--dsw-alias-label-secondary)}",
      // ── 侧边栏用量看板(徽标 + 浮动面板) ─────────────────────────────────────
      // 徽标所在插槽 `sidebar.footer.action` 是 nowrap 行,occupant 需撑满/换行
      // (TokenLedger 同款坑:再加一个 occupant 会挤出侧栏)。
      'div:has(> [data-slot="sidebar.footer.action"]){flex-wrap:wrap}',
      ".dm-dash-layer{flex:0 0 100%;min-width:0;display:flex;flex-direction:column;align-items:center;margin-top:8px}",
      ".dm-dash-rail{flex:none;width:36px;height:36px;margin:0}",
      ".dm-dash-badge{width:100%;height:40px;border:none;border-radius:12px;background:transparent;color:var(--dsw-alias-label-primary);display:flex;align-items:center;gap:8px;padding:0 8px 0 6px;font:inherit;font-size:14px;line-height:20px;cursor:pointer;overflow:hidden}",
      ".dm-dash-badge:hover{background:var(--dsw-alias-interactive-bg-hover-solid)}",
      ".dm-dash-badge-open{background:var(--dsw-alias-interactive-bg-hover)}",
      ".dm-dash-badge-icon{flex:none;display:inline-flex;align-items:center}",
      ".dm-dash-badge-label{flex:1;min-width:0;text-overflow:ellipsis;white-space:nowrap;overflow:hidden;text-align:left}",
      ".dm-dash-badge-value{flex:none;color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums;font-size:12px;line-height:16px}",
      ".dm-dash-rail .dm-dash-badge{width:36px;height:36px;border-radius:50%;justify-content:center;padding:0}",
      ".dm-dash-rail .dm-dash-badge-label,.dm-dash-rail .dm-dash-badge-value{display:none}",
      // 面板
      // 作用域色板:分类色(提供方分布)+ emerald 活动色阶(亮/暗两套),只在面板内生效,
      // 从宿主外借不出去。TokenLedger 同款:green-for-activity 是数据不是 chrome。
      ".dm-dash-panel{position:fixed;left:12px;bottom:132px;z-index:80;width:640px;max-width:calc(100vw - 24px);max-height:76vh;box-sizing:border-box;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-overlay,var(--dsw-alias-bg-base));border-radius:12px;box-shadow:var(--dsw-shadow-lv2);display:flex;flex-direction:column;overflow:hidden;--dm-radius:12px;--dm-radius-sm:8px;--dm-radius-xs:6px;--dm-level-0:rgba(128,128,128,.16);--dm-level-1:#a7f3d0;--dm-level-2:#6ee7b7;--dm-level-3:#34d399;--dm-level-4:#10b981;--dm-unknown:rgba(128,128,128,.16);--dm-direct:#8b93a7;--dm-series-0:#0ea5e9;--dm-series-1:#f59e0b;--dm-series-2:#8b5cf6;--dm-series-3:#14b8a6;--dm-series-4:#ec4899;--dm-series-5:#84cc16}",
      "@media (prefers-color-scheme:dark){.dm-dash-panel{--dm-level-1:#065f46;--dm-level-2:#059669;--dm-level-3:#10b981;--dm-level-4:#34d399;--dm-unknown:rgba(128,128,128,.16);--dm-direct:#6b7280;--dm-series-0:#38bdf8;--dm-series-1:#fbbf24;--dm-series-2:#a78bfa;--dm-series-3:#2dd4bf;--dm-series-4:#f472b6;--dm-series-5:#a3e635}}",
      '[data-theme="dark"] .dm-dash-panel{--dm-level-1:#065f46;--dm-level-2:#059669;--dm-level-3:#10b981;--dm-level-4:#34d399;--dm-unknown:rgba(128,128,128,.16);--dm-direct:#6b7280;--dm-series-0:#38bdf8;--dm-series-1:#fbbf24;--dm-series-2:#a78bfa;--dm-series-3:#2dd4bf;--dm-series-4:#f472b6;--dm-series-5:#a3e635}',
      '[data-theme="light"] .dm-dash-panel{--dm-level-1:#a7f3d0;--dm-level-2:#6ee7b7;--dm-level-3:#34d399;--dm-level-4:#10b981;--dm-unknown:rgba(128,128,128,.16);--dm-direct:#8b93a7;--dm-series-0:#0ea5e9;--dm-series-1:#f59e0b;--dm-series-2:#8b5cf6;--dm-series-3:#14b8a6;--dm-series-4:#ec4899;--dm-series-5:#84cc16}',
      ".dm-dash-head{flex:none;display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:44px;padding:10px 12px;border-bottom:1px solid var(--dsw-alias-border-l2)}",
      ".dm-dash-title{font-size:13px;line-height:20px;font-weight:500;color:var(--dsw-alias-label-primary);white-space:nowrap}",
      ".dm-dash-actions{display:flex;align-items:center;gap:2px}",
      ".dm-dash-icon{width:26px;height:26px;border:none;background:transparent;border-radius:6px;display:inline-flex;align-items:center;justify-content:center;color:var(--dsw-alias-label-tertiary);cursor:pointer}",
      ".dm-dash-icon:hover{color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-interactive-bg-hover)}",
      ".dm-dash-icon:disabled{opacity:.5;cursor:default}",
      ".dm-dash-body{flex:1;min-height:0;overflow-y:auto;padding:12px 14px 14px;scrollbar-width:none;-ms-overflow-style:none}",
      ".dm-dash-body::-webkit-scrollbar{display:none}",
      ".dm-dash-note{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px;margin:0}",
      ".dm-dash-error{color:var(--dsw-alias-state-error-primary);font-size:12px;line-height:18px;margin:0}",
      // 统计卡片(兼范围切换)
      ".dm-dash-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px}",
      ".dm-dash-card{border:1px solid var(--dsw-alias-border-l2);border-radius:8px;padding:8px 10px;background:transparent;text-align:left;cursor:pointer;font:inherit;color:var(--dsw-alias-label-primary)}",
      ".dm-dash-card:hover{background:var(--dsw-alias-interactive-bg-hover)}",
      ".dm-dash-card-on{border-color:var(--dsw-alias-label-tertiary);background:var(--dsw-alias-interactive-bg-active)}",
      ".dm-dash-card-val{font-size:16px;line-height:22px;font-weight:600;font-variant-numeric:tabular-nums;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
      ".dm-dash-card-label{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px;margin-top:2px}",
      // 分区
      ".dm-dash-section{margin-top:14px}.dm-dash-section:first-of-type{margin-top:0}",
      ".dm-dash-section-title{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px;font-weight:500;margin:0 0 6px;display:flex;align-items:center;gap:4px;min-height:18px}",
      ".dm-dash-filter{color:var(--dsw-alias-label-secondary);cursor:pointer;background:var(--dsw-alias-interactive-bg-active);border:none;border-radius:999px;margin-left:6px;padding:1px 8px;font:inherit;font-size:11px;line-height:16px}",
      ".dm-dash-filter:hover{color:var(--dsw-alias-label-primary)}",
      ".dm-dash-zone{color:var(--dsw-alias-label-caption);margin-left:auto;font-size:10px;line-height:16px;font-variant-numeric:tabular-nums}",
      ".dm-dash-caption{color:var(--dsw-alias-label-tertiary);margin:6px 0 0;font-size:11px;line-height:16px;font-variant-numeric:tabular-nums}",
      // 热力带
      ".dm-dash-heat{display:flex;flex-direction:column;gap:6px}",
      // 右侧留 10px 内边距:热力带横向滚动且滚到底时,最新一周若紧贴右缘,
      // 最右列单元格的悬停效果(outline/微放大)右半边会被裁切容器遮住。
      ".dm-dash-strip{overflow-x:auto;padding:0 10px 2px 0;display:flex;gap:4px;scrollbar-width:none;-ms-overflow-style:none}",
      ".dm-dash-strip::-webkit-scrollbar{display:none}",
      ".dm-dash-weekdays{display:grid;grid-template-rows:repeat(7,12px);gap:3px;flex:none;padding-top:15px}",
      ".dm-dash-weekday{color:var(--dsw-alias-label-caption);font-size:9px;line-height:12px;text-align:right;width:14px}",
      ".dm-dash-strip-cols{min-width:0}",
      ".dm-dash-months{display:grid;grid-auto-flow:column;gap:3px;height:12px;margin-bottom:3px}",
      ".dm-dash-month{color:var(--dsw-alias-label-caption);font-size:9px;line-height:12px;white-space:nowrap;overflow:visible}",
      ".dm-dash-strip-grid{display:grid;grid-auto-flow:column;grid-auto-columns:12px;grid-template-rows:repeat(7,12px);gap:3px;justify-content:start}",
      ".dm-dash-heat-cell{width:12px;height:12px;border-radius:2px;background:var(--dm-level-0);border:0;padding:0;cursor:pointer}",
      ".dm-dash-heat-cell:hover{outline:1px solid var(--dsw-alias-label-tertiary);outline-offset:1px}",
      '.dm-dash-heat-cell[data-l="1"]{background:var(--dm-level-1)}',
      '.dm-dash-heat-cell[data-l="2"]{background:var(--dm-level-2)}',
      '.dm-dash-heat-cell[data-l="3"]{background:var(--dm-level-3)}',
      '.dm-dash-heat-cell[data-l="4"]{background:var(--dm-level-4)}',
      ".dm-dash-heat-pad{width:12px;height:12px}",
      ".dm-dash-heat-legend{align-items:center;gap:3px;margin-top:5px;font-size:10px;line-height:14px;color:var(--dsw-alias-label-caption);display:flex}",
      ".dm-dash-heat-swatch{width:10px;height:10px;border-radius:2px;background:var(--dm-level-0)}",
      '.dm-dash-heat-swatch[data-l="1"]{background:var(--dm-level-1)}',
      '.dm-dash-heat-swatch[data-l="2"]{background:var(--dm-level-2)}',
      '.dm-dash-heat-swatch[data-l="3"]{background:var(--dm-level-3)}',
      '.dm-dash-heat-swatch[data-l="4"]{background:var(--dm-level-4)}',
      // 分布行(提供方/项目共用骨架:色块 + 名称 + 数值 + 占比)
      ".dm-dash-stack{display:flex;height:8px;border-radius:4px;overflow:hidden;background:var(--dsw-alias-fill-l2);margin-bottom:8px}",
      ".dm-dash-stack-seg{height:8px;min-width:2px;transition:opacity .12s}",
      ".dm-dash-stack[data-dim] .dm-dash-stack-seg:not([data-on]){opacity:.32}",
      ".dm-dash-swatch{width:8px;height:8px;border-radius:2px;flex:none}",
      ".dm-dash-rows{flex-direction:column;display:flex}",
      ".dm-dash-row{width:100%;align-items:center;gap:8px;border:0;background:0 0;border-bottom:1px solid var(--dsw-alias-border-l1);padding:6px 4px;font:inherit;text-align:left;cursor:pointer;display:flex;border-radius:var(--dm-radius-xs)}",
      ".dm-dash-row:last-child{border-bottom:0}",
      ".dm-dash-row:hover{background:var(--dsw-alias-interactive-bg-hover)}",
      ".dm-dash-row[data-on]{background:var(--dsw-alias-interactive-bg-active)}",
      ".dm-dash-row-static{cursor:default}",
      ".dm-dash-row-static:hover{background:0 0}",
      ".dm-dash-row-name{color:var(--dsw-alias-label-primary);flex:none;width:150px;min-width:0;font-size:12px;line-height:18px;text-overflow:ellipsis;white-space:nowrap;overflow:hidden}",
      ".dm-dash-row-path{color:var(--dsw-alias-label-caption);font-size:10px;line-height:16px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;direction:rtl;text-align:left;min-width:0;flex:1}",
      ".dm-dash-row-value{color:var(--dsw-alias-label-primary);flex:none;font-size:12px;line-height:18px;font-variant-numeric:tabular-nums;text-align:right;min-width:64px}",
      ".dm-dash-row-meta{color:var(--dsw-alias-label-tertiary);flex:none;width:44px;font-size:11px;line-height:18px;font-variant-numeric:tabular-nums;text-align:right}",
      // 逐日 tooltip(悬停在热力带单元格上)
      ".dm-dash-tip{position:fixed;z-index:90;pointer-events:none;min-width:180px;max-width:250px;background:var(--dsw-alias-bg-overlay,var(--dsw-alias-bg-base));border:1px solid var(--dsw-alias-border-l2);border-radius:var(--dm-radius-sm);box-shadow:var(--dsw-shadow-lv2);padding:8px 10px}",
      ".dm-dash-tip-head{display:flex;align-items:center;gap:6px;justify-content:space-between}",
      ".dm-dash-tip-date{color:var(--dsw-alias-label-secondary);font-size:11px;line-height:16px;font-variant-numeric:tabular-nums}",
      ".dm-dash-tip-level{color:var(--dsw-alias-label-tertiary);font-size:10px;line-height:14px;border:1px solid var(--dsw-alias-border-l2);border-radius:999px;padding:0 6px;flex:none}",
      ".dm-dash-tip-total{color:var(--dsw-alias-label-primary);font-size:15px;line-height:22px;font-weight:600;font-variant-numeric:tabular-nums;margin-top:2px}",
      ".dm-dash-tip-unit{color:var(--dsw-alias-label-tertiary);font-size:10px;font-weight:400;margin-left:4px}",
      ".dm-dash-tip-models{margin-top:6px;border-top:1px solid var(--dsw-alias-border-l1);padding-top:6px;display:flex;flex-direction:column;gap:5px}",
      ".dm-dash-tip-row{font-size:11px;line-height:15px}",
      ".dm-dash-tip-row-head{display:flex;gap:6px;align-items:baseline}",
      ".dm-dash-tip-name{color:var(--dsw-alias-label-secondary);flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
      ".dm-dash-tip-value{color:var(--dsw-alias-label-primary);font-variant-numeric:tabular-nums;flex:none}",
      ".dm-dash-tip-pct{color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums;flex:none;width:30px;text-align:right}",
      ".dm-dash-tip-bar{background:var(--dsw-alias-fill-l2);border-radius:2px;height:3px;margin-top:2px;overflow:hidden}",
      ".dm-dash-tip-bar-fill{background:var(--dm-level-4);border-radius:2px;height:3px}",
      ".dm-dash-tip-quiet{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px;margin:6px 0 0}",
      // 模型表(可排序)
      ".dm-dash-table{width:100%;border-collapse:collapse;font-size:12px}",
      ".dm-dash-table th{color:var(--dsw-alias-label-tertiary);font-size:11px;font-weight:500;line-height:16px;text-align:right;padding:0 10px 5px;border-bottom:1px solid var(--dsw-alias-border-l2);white-space:nowrap;cursor:pointer;user-select:none}",
      ".dm-dash-table th:first-child{text-align:left;padding-left:4px}",
      ".dm-dash-table th:hover{color:var(--dsw-alias-label-secondary)}",
      ".dm-dash-table td{color:var(--dsw-alias-label-primary);font-size:12px;text-align:right;padding:5px 10px;border-bottom:1px solid var(--dsw-alias-border-l1);font-variant-numeric:tabular-nums;white-space:nowrap}",
      ".dm-dash-table td:first-child{text-align:left;max-width:180px;overflow:hidden;text-overflow:ellipsis;padding-left:4px}",
      ".dm-dash-table tr:last-child td{border-bottom:0}",
      ".dm-dash-table td.num{text-align:right}",
      ".dm-dash-sort-mark{color:var(--dsw-alias-label-secondary);margin-left:2px}",
      ".dm-dash-hit{color:var(--dsw-alias-label-tertiary);font-size:11px;margin-left:3px}",
      // 页脚
      ".dm-dash-footer{color:var(--dsw-alias-label-caption);border-top:1px solid var(--dsw-alias-border-l1);margin-top:14px;padding-top:8px;font-size:11px;line-height:16px;font-variant-numeric:tabular-nums}",
      ".dm-dash-warn{color:var(--dsw-alias-state-warn-primary)}",
      // 骨架屏 / 重试
      ".dm-dash-skel{background:var(--dsw-alias-bg-skeleton);border-radius:var(--dm-radius-xs);height:12px;animation:dm-pulse 1.4s ease-in-out infinite}",
      ".dm-dash-skel-stat{height:52px;border-radius:var(--dm-radius-sm)}",
      "@keyframes dm-pulse{0%,100%{opacity:1}50%{opacity:.45}}",
      "@media (prefers-reduced-motion:reduce){.dm-dash-skel{animation:none}}",
      ".dm-dash-retry{color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:1px solid var(--dsw-alias-border-l2);border-radius:var(--dm-radius-xs);margin-top:8px;padding:3px 10px;font:inherit;font-size:12px}",
      ".dm-dash-retry:hover{background:var(--dsw-alias-interactive-bg-hover)}",
      // ── 响应式 ───────────────────────────────────────────────────────────────
      "@media (max-width:640px){.dm-grid2,.dm-grid3{grid-template-columns:1fr}.dm-price-caption{display:none}.dm-price-fields{grid-template-columns:1fr 1fr}.dm-price-fields .dm-price-name{grid-column:1/-1}.dm-tier-row{grid-template-columns:1fr 1fr}.dm-summary-card{max-width:none;flex-basis:100%}}"
    ].join("\n");
    cssTagId = "dsh-monitor/client.css";
  }
});

// lib/client-src/i18n.js
var i18n_exports = {};
__export(i18n_exports, {
  MESSAGES: () => MESSAGES,
  detectBrowserLocale: () => detectBrowserLocale,
  makeT: () => makeT,
  resolveLocale: () => resolveLocale
});
function detectBrowserLocale() {
  const lang = typeof navigator !== "undefined" && typeof navigator.language === "string" ? navigator.language : "";
  return lang.toLowerCase().startsWith("zh") ? "zh" : "en";
}
function resolveLocale(configLocale) {
  if (configLocale === "zh" || configLocale === "en") return configLocale;
  return detectBrowserLocale();
}
function makeT(locale) {
  const dict = locale === "zh" ? MESSAGES.zh : MESSAGES.en;
  return (key, vars) => {
    let text = dict[key] ?? MESSAGES.en[key] ?? key;
    if (vars) for (const name of Object.keys(vars)) text = text.split("{" + name + "}").join(String(vars[name]));
    return text;
  };
}
var MESSAGES;
var init_i18n = __esm({
  "lib/client-src/i18n.js"() {
    MESSAGES = {
      zh: {
        // 用量图标/面板
        panelTitle: "\u7528\u91CF",
        refresh: "\u5237\u65B0",
        presetDeepseek: "DeepSeek \u5B98\u65B9",
        presetOpencode: "OpenCode",
        presetCustom: "\u81EA\u5B9A\u4E49",
        unknownProvider: "\u672A\u77E5\u63D0\u4F9B\u65B9",
        notConfiguredHint: "\u8BE5\u63D0\u4F9B\u65B9\u5C1A\u672A\u914D\u7F6E\u7528\u91CF\u67E5\u8BE2\u3002\u8BF7\u5230 \u8BBE\u7F6E\u2192\u6A21\u578B\uFF0C\u5728\u8BE5\u63D0\u4F9B\u65B9\u6761\u76EE\u4E0A\u70B9\u51FB\u7F16\u8F91\u6309\u94AE\u65C1\u7684\u7528\u91CF\u56FE\u6807\u914D\u7F6E\u3002",
        noUsageItems: "\u6682\u65E0\u7528\u6570\u636E\u3002",
        resetsAt: "\u91CD\u7F6E\u65F6\u95F4 {time}",
        updatedAt: "\u66F4\u65B0\u4E8E {time}",
        loading: "\u52A0\u8F7D\u4E2D\u2026",
        // 会话费用徽章
        sessionCostTitle: "\u672C\u4F1A\u8BDD\u8D39\u7528\uFF08\u6309\u6BCF\u6B21\u8C03\u7528\u5B9E\u9645\u65F6\u523B\u7CBE\u786E\u8BA1\u8D39\uFF09",
        sessionDetailTokens: "\u8F93\u5165 {input} \xB7 \u7F13\u5B58 {cache} \xB7 \u8F93\u51FA {output}",
        sessionDetailCache: "\u7F13\u5B58\uFF1A\u8BFB {read} \xB7 \u5199 {write}\uFF08\u5199\u5165\u6309\u547D\u4E2D\u4EF7\u8BA1\u8D39\uFF09",
        cost: "\u8D39\u7528 {amount}",
        // 设置页:提供方绑定用量查询(入口在 设置→模型 每行图标) 
        sectionLabel: "\u8BA1\u8D39",
        bindingTitle: "\u914D\u7F6E\u7528\u91CF\u67E5\u8BE2",
        bindingDesc: "\u4E3A\u8BE5\u63D0\u4F9B\u65B9\u7ED1\u5B9A\u4E00\u6761\u7528\u91CF\u67E5\u8BE2\u914D\u7F6E\uFF1B\u4FDD\u5B58\u4F1A\u8986\u76D6\u8BE5\u63D0\u4F9B\u65B9\u6B64\u524D\u7684\u914D\u7F6E\u3002",
        bindSaveNote: "\u5DF2\u4FDD\u5B58",
        bindRemoveNote: "\u5DF2\u89E3\u9664\u7ED1\u5B9A",
        bindRemove: "\u89E3\u9664\u7ED1\u5B9A",
        presetChoose: "\u67E5\u8BE2\u65B9\u5F0F",
        presetOptDeepseek: "DeepSeek \u5B98\u65B9\uFF08\u4F59\u989D\uFF09",
        presetOptOpencode: "OpenCode Go \u5957\u9910",
        presetOptCustom: "\u81EA\u5B9A\u4E49 HTTP",
        providerId: "\u63D0\u4F9B\u65B9 ID",
        providerIdDatalist: "\u9009\u62E9\u5DF2\u914D\u7F6E\u7684\u63D0\u4F9B\u65B9\u2026",
        modelSelectHint: "\u4ECE \u8BBE\u7F6E\u2192\u6A21\u578B \u4E2D\u9009\u62E9\u8981\u6DFB\u52A0\u4EF7\u683C\u7684\u6A21\u578B\uFF08\u6309\u63D0\u4F9B\u65B9\u5206\u7EC4\uFF09",
        noModelsLeft: "\u6240\u6709\u6A21\u578B\u5747\u5DF2\u8BBE\u7F6E\u4EF7\u683C",
        modelExists: "\u8BE5\u6A21\u578B\u5DF2\u8BBE\u7F6E\u4EF7\u683C",
        deepseekHint: "\u590D\u7528 \u8BBE\u7F6E\u2192\u6A21\u578B \u4E2D\u914D\u7F6E\u7684 DeepSeek API Key\uFF0C\u67E5\u8BE2\u5B98\u65B9\u8D26\u6237\u4F59\u989D\u3002",
        opencodeHint: "\u67E5\u8BE2 OpenCode Go \u5957\u9910\u989D\u5EA6\uFF085\u5C0F\u65F6 / \u672C\u5468 / \u672C\u6708\uFF09\uFF1BKey \u7559\u7A7A\u5219\u81EA\u52A8\u53D1\u73B0\uFF08\u51ED\u636E \u2192 \u73AF\u5883\u53D8\u91CF \u2192 opencode auth.json\uFF09\u3002",
        apiKey: "API Key\uFF08\u53EF\u9009\uFF09",
        apiKeyPlaceholder: "\u7559\u7A7A = \u81EA\u52A8\u53D1\u73B0",
        refreshMinutes: "\u5237\u65B0\u95F4\u9694\uFF08\u5206\u949F\uFF09",
        enabled: "\u542F\u7528",
        remove: "\u5220\u9664",
        save: "\u4FDD\u5B58",
        cancel: "\u53D6\u6D88",
        customUrl: "\u63A5\u53E3 URL",
        customUrlHint: "GET \u8BF7\u6C42\u7684\u5B8C\u6574\u5730\u5740\uFF1B\u8FD4\u56DE\u4F53 JSON \u7531\u4E0B\u65B9\u6761\u76EE\u7684\u300C\u53D6\u503C\u8DEF\u5F84\u300D\u9010\u6761\u63D0\u53D6\u3002",
        customHeaders: "\u8BF7\u6C42\u5934",
        customHeadersHint: "\u952E\u503C\u5BF9\u5F62\u5F0F\u7684\u8BF7\u6C42\u5934\uFF1B\u952E\u4E3A\u7A7A\u7684\u884C\u4F1A\u88AB\u5FFD\u7565\u3002",
        customHeadersNote: "\u503C\u652F\u6301 {apiKey} \u5360\u4F4D\u7B26\uFF0C\u4F1A\u88AB\u66FF\u6362\u4E3A\u8BE5\u63D0\u4F9B\u65B9\u586B\u5199\u7684 API Key\u3002",
        headerKey: "\u952E",
        headerValue: "\u503C",
        addHeader: "\u6DFB\u52A0\u8BF7\u6C42\u5934",
        exampleRolling: "5\u5C0F\u65F6",
        exampleWeekly: "\u672C\u5468",
        exampleMonthly: "\u672C\u6708",
        customIntro: "\u81EA\u5B9A\u4E49 = \u6307\u5B9A\u4EFB\u610F HTTP \u7528\u91CF\u63A5\u53E3\uFF1A\u586B GET \u5730\u5740\u548C\u8BF7\u6C42\u5934\uFF0C\u518D\u7528\u4E0B\u9762\u7684\u6761\u76EE\u4ECE\u54CD\u5E94 JSON \u91CC\u53D6\u503C\u5C55\u793A\u3002",
        customItems: "\u7528\u91CF\u6761\u76EE",
        customItemsExplainTitle: "\u6761\u76EE\u8BF4\u660E\u4E0E\u793A\u4F8B",
        customItemsExplain: "\u6BCF\u4E2A\u6761\u76EE\u4ECE\u63A5\u53E3\u8FD4\u56DE\u7684 JSON \u91CC\u53D6\u4E00\u4E2A\u503C\uFF0C\u5728\u7528\u91CF\u9762\u677F\u9010\u6761\u5C55\u793A\uFF1A\n\u2460 \u6807\u8BC6\uFF08key\uFF09\uFF1A\u6761\u76EE\u7684\u552F\u4E00 id\uFF0C\u7528\u4E8E\u53BB\u91CD\u66F4\u65B0\uFF0C\u5EFA\u8BAE\u7B80\u77ED\u82F1\u6587\uFF0C\u5982 weekly\uFF1B\n\u2461 \u663E\u793A\u540D\uFF08label\uFF09\uFF1A\u9762\u677F\u4E0A\u663E\u793A\u7684\u540D\u5B57\uFF0C\u5982\u300C\u672C\u5468\u300D\uFF1B\n\u2462 \u6570\u503C\u7C7B\u578B\uFF08kind\uFF09\uFF1Apercent \u76F4\u63A5\u7528\u767E\u5206\u6BD4\u753B\u8FDB\u5EA6\u6761\uFF0Cnumber \u663E\u793A\u6570\u5B57\uFF0Cmoney \u663E\u793A\u91D1\u989D\uFF0Ctext \u663E\u793A\u6587\u672C\uFF1B\n\u2463 \u53D6\u503C\u8DEF\u5F84\uFF08path\uFF09\uFF1A\u4ECE\u54CD\u5E94 JSON \u53D6\u503C\u7684\u70B9\u8DEF\u5F84\uFF0C\u5982 usage.weekly.percent\uFF08\u5373 data \u7684 usage.weekly.percent\uFF09\uFF1B\n\u2464 \u4E0A\u9650\uFF08maxPath\uFF09\uFF1A\u53EF\u9009\uFF0C\u586B\u6570\u5B57\u5E38\u91CF\u6216 JSON \u8DEF\u5F84\uFF1B\u586B\u4E86\u4F1A\u81EA\u52A8\u7B97\u767E\u5206\u6BD4 = \u503C \xF7 \u4E0A\u9650 \xD7 100\uFF08\u6570\u503C\u7C7B\u578B \u4E3A \u767E\u5206\u6BD4 \u65F6\u4E0D\u7528\u586B\uFF09\uFF1B\n\u2465 \u91CD\u7F6E\u65F6\u95F4\uFF08resetsAtPath\uFF09\uFF1A\u53EF\u9009\uFF0C\u6307\u793A\u54EA\u4E00\u5929\u91CD\u7F6E\uFF08\u5982 usage.weekly.resetsAt\uFF09\u3002\n\u67D0\u4E00\u6761\u7684\u8DEF\u5F84\u53D6\u4E0D\u5230\u503C\u65F6\uFF0C\u8BE5\u6761\u76EE\u4E0D\u663E\u793A\u3001\u4E0D\u62A5\u9519\uFF08\u4F8B\u5982 monthly \u4E3A null \u65F6\uFF09\u3002",
        viewSample: "\u67E5\u770B OpenCode \u63A5\u53E3\u54CD\u5E94\u793A\u4F8B\uFF08\u56FE\u7247\uFF09",
        itemField: "\u6761\u76EE",
        itemKey: "\u6807\u8BC6",
        itemKeyHint: "\u6761\u76EE\u7684\u552F\u4E00\u6807\u8BC6\uFF0C\u7528\u4E8E\u66F4\u65B0\u4E0E\u53BB\u91CD\uFF1B\u5EFA\u8BAE\u7B80\u77ED\u82F1\u6587\uFF0C\u5982 weekly\u3002",
        itemLabel: "\u663E\u793A\u540D",
        itemLabelHint: "\u7528\u91CF\u9762\u677F\u4E0A\u663E\u793A\u7684\u540D\u79F0\uFF0C\u5982\u300C5\u5C0F\u65F6\u300D\u3002",
        itemKind: "\u6570\u503C\u7C7B\u578B",
        itemKindHint: "\u6570\u503C\u7684\u5C55\u793A\u65B9\u5F0F\uFF1Apercent \u76F4\u63A5\u7528\u767E\u5206\u6BD4\uFF1Bnumber \u663E\u793A\u6570\u5B57\uFF1Bmoney \u663E\u793A\u91D1\u989D\uFF1Btext \u663E\u793A\u7EAF\u6587\u672C\u3002",
        itemPath: "\u53D6\u503C\u8DEF\u5F84",
        itemPathHint: "\u4ECE\u54CD\u5E94 JSON \u53D6\u503C\u7684\u70B9\u8DEF\u5F84\uFF0C\u5982 usage.weekly.percent\uFF08\u53D6 data \u7684 usage.weekly.percent\uFF09\u3002",
        itemMaxPath: "\u4E0A\u9650",
        itemMaxPathHint: "\u53EF\u9009\uFF1A\u586B\u6570\u5B57\u5E38\u91CF\uFF08\u5982 1000000\uFF09\u6216 JSON \u8DEF\u5F84\uFF08\u5982 usage.limit\uFF09\uFF1B\u5B58\u5728\u65F6\u81EA\u52A8\u8BA1\u7B97\u767E\u5206\u6BD4 = \u6570\u503C \xF7 \u4E0A\u9650 \xD7 100\u3002\u6570\u503C\u7C7B\u578B \u9009 \u767E\u5206\u6BD4 \u65F6\u4E0D\u7528\u586B\u3002",
        itemResetsAtPath: "\u91CD\u7F6E\u65F6\u95F4",
        itemResetsAtHint: "\u53EF\u9009\uFF1A\u91CD\u7F6E\u65F6\u95F4\u5728\u54CD\u5E94\u4E2D\u7684 JSON \u8DEF\u5F84\uFF0C\u5982 usage.weekly.resetsAt\uFF1B\u586B\u4E86\u4F1A\u5728\u9762\u677F\u91CC\u663E\u793A\u91CD\u7F6E\u65F6\u95F4\u3002",
        addItem: "\u6DFB\u52A0\u6761\u76EE",
        kindPercent: "\u767E\u5206\u6BD4\uFF08percent\uFF09",
        kindNumber: "\u6570\u5B57\uFF08number\uFF09",
        kindMoney: "\u91D1\u989D\uFF08money\uFF09",
        kindText: "\u6587\u672C\uFF08text\uFF09",
        saved: "\u5DF2\u4FDD\u5B58",
        saveFailed: "\u4FDD\u5B58\u5931\u8D25\uFF1A{message}",
        // 设置页:计费价格
        pricesTitle: "\u8BA1\u8D39\u4EF7\u683C\uFF08\u4EBA\u6C11\u5E01 / 1M tokens\uFF09",
        peakNotice: "\u7A7A\u95F2 / \u9AD8\u5CF0\u4E3A\u5CF0\u8C37\u8BA1\u4EF7\u4E24\u6863\uFF1B\u7F13\u5B58\u5199\u5165\u6309\u547D\u4E2D\u4EF7\u8BA1\u8D39\u3002",
        defaultModel: "default\uFF08\u672A\u5339\u914D\u6A21\u578B\u65F6\u56DE\u9000\uFF09",
        addModelTitle: "\u6DFB\u52A0\u6A21\u578B",
        addModel: "\u6DFB\u52A0\u6A21\u578B",
        modelName: "\u6A21\u578B",
        actions: "\u64CD\u4F5C",
        tiersToggle: "\u5CF0\u8C37",
        basePrice: "\u57FA\u7840\u4EF7",
        applyBase: "\u628A\u57FA\u7840\u4EF7\u586B\u5165\u7A7A\u95F2\u4EF7",
        cacheHit: "\u547D\u4E2D",
        cacheMiss: "\u672A\u547D\u4E2D",
        output: "\u8F93\u51FA",
        offPeak: "\u7A7A\u95F2",
        peak: "\u9AD8\u5CF0",
        windowsLabel: "\u65F6\u6BB5",
        addWindow: "\u6DFB\u52A0\u65F6\u6BB5",
        windowStart: "\u5F00\u59CB\u65F6\u95F4",
        windowEnd: "\u7ED3\u675F\u65F6\u95F4",
        windowsOverlap: "\u65F6\u6BB5\u91CD\u53E0\uFF0C\u8BF7\u5220\u9664\u6216\u8C03\u6574\u540E\u4FDD\u5B58",
        syncFromDocs: "\u4ECE\u5B98\u65B9\u6587\u6863\u540C\u6B65",
        syncFailed: "\u540C\u6B65\u5931\u8D25\uFF1A{message}",
        lastSync: "\u4E0A\u6B21\u540C\u6B65 {time} \xB7 \u6765\u6E90 {source}",
        neverSynced: "\u4ECE\u672A",
        sourceBundled: "\u5185\u7F6E",
        sourceOfficial: "\u5B98\u65B9",
        // 侧边栏用量看板(对齐 TokenLedger 用量账本,除余额)
        dashboardTitle: "\u7528\u91CF\u8D26\u672C",
        rangeToday: "\u4ECA\u65E5",
        rangeMonth: "\u672C\u6708",
        rangeAll: "\u7D2F\u8BA1",
        sectionUsage: "Token \u7528\u91CF",
        sectionProviders: "\u63D0\u4F9B\u65B9\u5206\u5E03",
        sectionProjects: "\u6309\u9879\u76EE",
        sectionActivity: "\u6D3B\u8DC3\u5EA6",
        sectionModels: "\u6A21\u578B",
        captionRequests: "{n} \u8BF7\u6C42",
        captionHit: "\u7F13\u5B58\u547D\u4E2D {rate}",
        captionCost: "\u4F30\u7B97 {cost}",
        providersNone: "\u8FD8\u6CA1\u6709\u63D0\u4F9B\u65B9\u8BB0\u5F55\u3002",
        providersUnknown: "\u672A\u77E5\u63D0\u4F9B\u65B9",
        filterClear: "\u53EA\u770B {name} \xD7",
        projectsNone: "\u8FD8\u6CA1\u6709\u80FD\u5F52\u5230\u9879\u76EE\u7684\u7528\u91CF\u3002",
        projectsUnattributed: "\u672A\u8BB0\u5F55\u76EE\u5F55",
        activityLevel: "\u7B49\u7EA7 {level}",
        activityQuiet: "\u8FD9\u5929\u6CA1\u6709\u8DD1\u8FC7\u8BF7\u6C42\u3002",
        stateEmpty: "\u8FD9\u4E2A\u533A\u95F4\u5185\u6CA1\u6709\u8BB0\u5F55\u5230\u4EFB\u4F55\u7528\u91CF\u3002",
        errorLoad: "\u8BFB\u4E0D\u5230\u7528\u91CF\u6570\u636E\u3002",
        actionRetry: "\u91CD\u8BD5",
        actionClose: "\u5173\u95ED",
        tableModel: "\u6A21\u578B",
        tableRequests: "\u8BF7\u6C42",
        tableTotal: "\u603B\u8BA1",
        tableInput: "\u8F93\u5165",
        tableCache: "\u7F13\u5B58",
        tableOutput: "\u8F93\u51FA",
        tableCost: "\u4F30\u7B97",
        tableNone: "\u6CA1\u6709\u6A21\u578B\u8BB0\u5F55\u3002",
        footerUpdated: "{ago}\u4ECE\u4F1A\u8BDD\u65E5\u5FD7\u8BFB\u53D6",
        footerJustNow: "\u521A\u521A",
        footerMinutes: "{n} \u5206\u949F\u524D",
        footerHours: "{n} \u5C0F\u65F6\u524D",
        footerDays: "{n} \u5929\u524D",
        footerNever: "\u5C1A\u672A",
        footerLastActivity: "\u6700\u8FD1\u4E00\u6B21\u7528\u91CF{ago}",
        footerUnattributed: "{n} \u884C\u8BA4\u4E0D\u51FA\u662F\u54EA\u4E2A\u7AD9",
        "month.0": "1\u6708",
        "month.1": "2\u6708",
        "month.2": "3\u6708",
        "month.3": "4\u6708",
        "month.4": "5\u6708",
        "month.5": "6\u6708",
        "month.6": "7\u6708",
        "month.7": "8\u6708",
        "month.8": "9\u6708",
        "month.9": "10\u6708",
        "month.10": "11\u6708",
        "month.11": "12\u6708",
        "weekday.0": "\u4E00",
        "weekday.1": "\u4E8C",
        "weekday.2": "\u4E09",
        "weekday.3": "\u56DB",
        "weekday.4": "\u4E94",
        "weekday.5": "\u516D",
        "weekday.6": "\u65E5",
        activityLess: "\u5C11",
        activityMore: "\u591A"
      },
      en: {
        // Usage icon/panel
        panelTitle: "Usage",
        refresh: "Refresh",
        presetDeepseek: "DeepSeek official",
        presetOpencode: "OpenCode",
        presetCustom: "Custom",
        unknownProvider: "Unknown provider",
        notConfiguredHint: "No usage query configured for this provider. Configure it in Settings \u2192 Models: click the usage icon beside the Edit button on this provider's row.",
        noUsageItems: "No usage data yet.",
        resetsAt: "Resets {time}",
        updatedAt: "Updated {time}",
        loading: "Loading\u2026",
        // Session cost badge
        sessionCostTitle: "Session cost (billed precisely at each call time)",
        sessionDetailTokens: "Input {input} \xB7 Cache {cache} \xB7 Output {output}",
        sessionDetailCache: "Cache: read {read} \xB7 write {write} (writes billed at hit price)",
        cost: "Cost {amount}",
        // Settings: per-provider usage query binding (entry icon on Settings → Models rows)
        sectionLabel: "Billing",
        bindingTitle: "Configure usage",
        bindingDesc: "Bind one usage-query config for this provider; saving overwrites the provider's previous config.",
        bindSaveNote: "Saved",
        bindRemoveNote: "Binding removed",
        bindRemove: "Remove binding",
        presetChoose: "Query type",
        presetOptDeepseek: "DeepSeek official (balance)",
        presetOptOpencode: "OpenCode Go plan",
        presetOptCustom: "Custom HTTP",
        providerId: "Provider ID",
        providerIdDatalist: "Pick a provider\u2026",
        modelSelectHint: "Pick a model from Settings \u2192 Models (grouped by provider)",
        noModelsLeft: "All models already have prices",
        modelExists: "This model already has a price",
        deepseekHint: "Reuses the DeepSeek API key configured in Settings \u2192 Models and queries the official account balance.",
        opencodeHint: "Queries the OpenCode Go plan quota (rolling 5h / weekly / monthly). Leave the key empty for auto-discovery (credentials \u2192 env \u2192 opencode auth.json).",
        apiKey: "API key (optional)",
        apiKeyPlaceholder: "Empty = auto-discover",
        refreshMinutes: "Refresh interval (minutes)",
        enabled: "Enabled",
        remove: "Remove",
        save: "Save",
        cancel: "Cancel",
        customUrl: "Endpoint URL",
        customUrlHint: "Full URL for the GET request; the response JSON is read by the items below via their paths.",
        customHeaders: "Headers",
        customHeadersHint: "Request headers as key/value pairs; rows with an empty key are ignored.",
        customHeadersNote: "Values support the {apiKey} placeholder, replaced by this provider's API key.",
        headerKey: "Key",
        headerValue: "Value",
        addHeader: "Add header",
        exampleRolling: "5 hours",
        exampleWeekly: "This week",
        exampleMonthly: "This month",
        customIntro: "Custom = point any HTTP usage endpoint: fill the GET URL and headers, then define items that read values from the response JSON.",
        customItems: "Usage items",
        customItemsExplainTitle: "Items: explanation & example",
        customItemsExplain: 'Each item reads one value from the response JSON and shows it in the usage panel:\n\u2460 Key: unique id for the item (dedupe/update), keep it short and English, e.g. weekly;\n\u2461 Display name: label shown in the panel, e.g. "This week";\n\u2462 Value kind: percent draws a progress bar from the percentage, number shows a plain number, money an amount, text plain text;\n\u2463 Path: dot path into the response JSON, e.g. usage.weekly.percent (i.e. data.usage.weekly.percent);\n\u2464 Max: optional \u2014 a number constant or a JSON path; when set, percent = value \xF7 max \xD7 100 (leave empty when kind is percent);\n\u2465 Resets at: optional \u2014 the JSON path of the reset time, e.g. usage.weekly.resetsAt.\nAn item whose path is missing is simply skipped (e.g. when monthly is null) \u2014 no error.',
        viewSample: "View the OpenCode response example (image)",
        itemField: "Item",
        itemKey: "Key",
        itemKeyHint: "Unique id for this item, used for updates and dedupe; keep it short and English, e.g. weekly.",
        itemLabel: "Display name",
        itemLabelHint: 'Name shown in the usage panel, e.g. "5 hours".',
        itemKind: "Value kind",
        itemKindHint: "How the value is displayed: percent shows it as a percentage, number as a plain number, money as an amount, text as plain text.",
        itemPath: "Path",
        itemPathHint: "Dot path into the response JSON, e.g. usage.weekly.percent reads data.usage.weekly.percent.",
        itemMaxPath: "Max",
        itemMaxPathHint: "Optional: a number constant (e.g. 1000000) or a JSON path (e.g. usage.limit); when set, percent = value \xF7 max \xD7 100. Leave empty when kind is percent.",
        itemResetsAtPath: "Resets at",
        itemResetsAtHint: "Optional: JSON path of the reset time, e.g. usage.weekly.resetsAt; the panel shows it when present.",
        addItem: "Add item",
        kindPercent: "Percent",
        kindNumber: "Number",
        kindMoney: "Money",
        kindText: "Text",
        saved: "Saved",
        saveFailed: "Save failed: {message}",
        // Settings: billing prices
        pricesTitle: "Billing prices (USD / 1M tokens)",
        peakNotice: "Off-peak / Peak are the two tiers; cache writes are billed at the cache-hit price.",
        defaultModel: "default (fallback for unmatched models)",
        addModelTitle: "Add model",
        addModel: "Add model",
        modelName: "Model",
        actions: "Actions",
        tiersToggle: "Peak/off-peak",
        basePrice: "Base price",
        applyBase: "Copy base price to off-peak",
        cacheHit: "Hit",
        cacheMiss: "Miss",
        output: "Output",
        offPeak: "Off-peak",
        peak: "Peak",
        windowsLabel: "Windows",
        addWindow: "Add window",
        windowStart: "Start",
        windowEnd: "End",
        windowsOverlap: "Overlapping windows \u2014 remove or adjust before saving",
        syncFromDocs: "Sync from official docs",
        syncFailed: "Sync failed: {message}",
        lastSync: "Last sync {time} \xB7 Source {source}",
        neverSynced: "Never",
        sourceBundled: "Bundled",
        sourceOfficial: "Official",
        // Sidebar usage ledger (aligned with TokenLedger's ledger page, minus balance)
        dashboardTitle: "Token Ledger",
        rangeToday: "Today",
        rangeMonth: "This month",
        rangeAll: "All time",
        sectionUsage: "Token usage",
        sectionProviders: "By provider",
        sectionProjects: "By project",
        sectionActivity: "Activity",
        sectionModels: "Models",
        captionRequests: "{n} requests",
        captionHit: "{rate} cached",
        captionCost: "est. {cost}",
        providersNone: "No provider records yet.",
        providersUnknown: "Unknown provider",
        filterClear: "{name} only \xD7",
        projectsNone: "No usage has been attributed to a project yet.",
        projectsUnattributed: "No directory recorded",
        activityLevel: "Level {level}",
        activityQuiet: "Nothing ran this day.",
        stateEmpty: "No usage recorded in this range.",
        errorLoad: "Could not read usage data.",
        actionRetry: "Retry",
        actionClose: "Close",
        tableModel: "Model",
        tableRequests: "Req",
        tableTotal: "Total",
        tableInput: "Input",
        tableCache: "Cache",
        tableOutput: "Output",
        tableCost: "Est.",
        tableNone: "No model records.",
        footerUpdated: "Read from your session logs {ago}",
        footerJustNow: "just now",
        footerMinutes: "{n} min ago",
        footerHours: "{n} h ago",
        footerDays: "{n} d ago",
        footerNever: "never",
        footerLastActivity: "last usage {ago}",
        footerUnattributed: "{n} rows could not be attributed",
        "month.0": "Jan",
        "month.1": "Feb",
        "month.2": "Mar",
        "month.3": "Apr",
        "month.4": "May",
        "month.5": "Jun",
        "month.6": "Jul",
        "month.7": "Aug",
        "month.8": "Sep",
        "month.9": "Oct",
        "month.10": "Nov",
        "month.11": "Dec",
        "weekday.0": "Mon",
        "weekday.1": "Tue",
        "weekday.2": "Wed",
        "weekday.3": "Thu",
        "weekday.4": "Fri",
        "weekday.5": "Sat",
        "weekday.6": "Sun",
        activityLess: "Less",
        activityMore: "More"
      }
    };
  }
});

// lib/client-src/codecs.js
var codecs_exports = {};
__export(codecs_exports, {
  CONTRIBUTION: () => CONTRIBUTION
});
function fail(path, expect) {
  throw new Error("dsh-monitor: \u670D\u52A1\u7AEF\u6570\u636E\u975E\u6CD5 (" + path + ": " + expect + ")");
}
function needNum(v, path) {
  if (typeof v !== "number" || !Number.isFinite(v)) fail(path, "number");
  return v;
}
function needStr(v, path) {
  if (typeof v !== "string") fail(path, "string");
  return v;
}
function parsePrice(v, path) {
  if (v === null || typeof v !== "object" || Array.isArray(v)) fail(path, "object");
  const out = {
    cacheHit: needNum(v.cacheHit, path + ".cacheHit"),
    cacheMiss: needNum(v.cacheMiss, path + ".cacheMiss"),
    output: needNum(v.output, path + ".output")
  };
  if (v.peakEnabled !== void 0) out.peakEnabled = v.peakEnabled === true;
  if (v.offPeak !== void 0 && v.offPeak !== null) {
    out.offPeak = {
      cacheHit: needNum(v.offPeak.cacheHit, path + ".offPeak.cacheHit"),
      cacheMiss: needNum(v.offPeak.cacheMiss, path + ".offPeak.cacheMiss"),
      output: needNum(v.offPeak.output, path + ".offPeak.output")
    };
  }
  if (v.peak !== void 0 && v.peak !== null) {
    out.peak = {
      cacheHit: needNum(v.peak.cacheHit, path + ".peak.cacheHit"),
      cacheMiss: needNum(v.peak.cacheMiss, path + ".peak.cacheMiss"),
      output: needNum(v.peak.output, path + ".peak.output")
    };
  }
  if (v.windows !== void 0 && v.windows !== null && typeof v.windows === "object" && !Array.isArray(v.windows)) {
    const norm = (list) => Array.isArray(list) ? list.filter((w) => w !== null && typeof w === "object").map((w) => ({ start: needNum(w.start, path + ".windows.start"), end: needNum(w.end, path + ".windows.end") })) : [];
    const peak = norm(v.windows.peak);
    const offPeak = norm(v.windows.offPeak);
    if (peak.length > 0 || offPeak.length > 0) {
      out.windows = {};
      if (peak.length > 0) out.windows.peak = peak;
      if (offPeak.length > 0) out.windows.offPeak = offPeak;
    }
  }
  return out;
}
function parseCustomItem(v, path) {
  if (v === null || typeof v !== "object" || Array.isArray(v)) fail(path, "object");
  const out = {
    key: needStr(v.key, path + ".key"),
    label: needStr(v.label, path + ".label"),
    kind: v.kind === "percent" || v.kind === "number" || v.kind === "money" || v.kind === "text" ? v.kind : "number",
    path: needStr(v.path, path + ".path"),
    maxPath: v.maxPath === null || v.maxPath === void 0 ? null : typeof v.maxPath === "string" || typeof v.maxPath === "number" ? v.maxPath : null,
    resetsAtPath: v.resetsAtPath === null || v.resetsAtPath === void 0 ? null : needStr(v.resetsAtPath, path + ".resetsAtPath")
  };
  return out;
}
function parseProvider(v, path) {
  if (v === null || typeof v !== "object" || Array.isArray(v)) fail(path, "object");
  const out = {
    enabled: v.enabled !== false,
    preset: v.preset === "deepseek" || v.preset === "opencode" || v.preset === "custom" ? v.preset : "custom",
    refreshMinutes: typeof v.refreshMinutes === "number" && Number.isFinite(v.refreshMinutes) ? v.refreshMinutes : 15,
    apiKey: typeof v.apiKey === "string" ? v.apiKey : ""
  };
  if (v.custom !== void 0 && v.custom !== null) {
    if (typeof v.custom !== "object" || Array.isArray(v.custom)) fail(path + ".custom", "object");
    out.custom = {
      url: needStr(v.custom.url, path + ".custom.url"),
      headers: typeof v.custom.headers === "object" && v.custom.headers !== null && !Array.isArray(v.custom.headers) ? v.custom.headers : {},
      items: Array.isArray(v.custom.items) ? v.custom.items.map((it, i) => parseCustomItem(it, path + ".custom.items[" + i + "]")) : []
    };
  }
  return out;
}
function parsePriceTable(v, path) {
  if (v === null || typeof v !== "object" || Array.isArray(v)) fail(path, "object");
  const models = {};
  if (v.models !== null && typeof v.models === "object" && !Array.isArray(v.models)) {
    for (const id of Object.keys(v.models)) models[id] = parsePrice(v.models[id], path + ".models." + id);
  }
  return {
    models,
    default: parsePrice(v.default ?? { cacheHit: 0, cacheMiss: 0, output: 0 }, path + ".default")
  };
}
function parseConfig(v, path) {
  if (v === null || typeof v !== "object" || Array.isArray(v)) fail(path, "object");
  const prices = { usd: null, cny: null };
  if (v.prices !== null && typeof v.prices === "object" && !Array.isArray(v.prices)) {
    prices.usd = parsePriceTable(v.prices.usd, path + ".prices.usd");
    prices.cny = parsePriceTable(v.prices.cny, path + ".prices.cny");
  }
  const providers = {};
  if (v.providers !== null && typeof v.providers === "object" && !Array.isArray(v.providers)) {
    for (const id of Object.keys(v.providers)) providers[id] = parseProvider(v.providers[id], path + ".providers." + id);
  }
  return {
    locale: v.locale === "zh" || v.locale === "en" || v.locale === "auto" ? v.locale : "auto",
    decimals: needNum(v.decimals, path + ".decimals"),
    peakEnabled: v.peakEnabled === true,
    peakEffectiveAt: typeof v.peakEffectiveAt === "string" ? v.peakEffectiveAt : "",
    peakWindows: Array.isArray(v.peakWindows) ? v.peakWindows.map((w, i) => ({ start: needNum(w.start, path + ".peakWindows[" + i + "].start"), end: needNum(w.end, path + ".peakWindows[" + i + "].end") })) : [],
    prices: prices.usd !== null && prices.cny !== null ? prices : { usd: null, cny: null },
    providers,
    historyDays: needNum(v.historyDays, path + ".historyDays"),
    fetchedAt: v.fetchedAt === null || v.fetchedAt === void 0 ? null : needStr(v.fetchedAt, path + ".fetchedAt"),
    priceSource: typeof v.priceSource === "string" ? v.priceSource : "bundled"
  };
}
function parseUsageItem(v, path) {
  if (v === null || typeof v !== "object" || Array.isArray(v)) fail(path, "object");
  const out = {
    key: needStr(v.key, path + ".key"),
    label: needStr(v.label, path + ".label"),
    kind: v.kind === "percent" || v.kind === "number" || v.kind === "money" || v.kind === "text" ? v.kind : "number",
    value: needNum(v.value, path + ".value"),
    resetsAt: v.resetsAt === null || v.resetsAt === void 0 ? null : needStr(v.resetsAt, path + ".resetsAt")
  };
  if (v.max !== void 0) out.max = needNum(v.max, path + ".max");
  if (v.percent !== void 0) out.percent = needNum(v.percent, path + ".percent");
  return out;
}
function parseProviderUsage(v, path) {
  if (v === null || typeof v !== "object" || Array.isArray(v)) fail(path, "object");
  return {
    provider: needStr(v.provider, path + ".provider"),
    preset: v.preset === "deepseek" || v.preset === "opencode" || v.preset === "custom" ? v.preset : "custom",
    status: v.status === "ok" || v.status === "error" ? v.status : "off",
    fetchedAt: typeof v.fetchedAt === "number" ? v.fetchedAt : 0,
    message: typeof v.message === "string" ? v.message : "",
    items: Array.isArray(v.items) ? v.items.map((it, i) => parseUsageItem(it, path + ".items[" + i + "]")) : []
  };
}
function parseFetchResult(v, path) {
  if (v === null || typeof v !== "object" || Array.isArray(v)) fail(path, "object");
  const out = {
    ok: v.ok === true,
    message: typeof v.message === "string" ? v.message : ""
  };
  if (v.config !== void 0 && v.config !== null) out.config = parseConfig(v.config, path + ".config");
  return out;
}
function parseCatalog(v, path) {
  if (v === null || typeof v !== "object" || Array.isArray(v)) fail(path, "object");
  const providers = Array.isArray(v.providers) ? v.providers.map((p, i) => ({
    id: needStr(p?.id, path + ".providers[" + i + "].id"),
    name: typeof p?.name === "string" ? p.name : ""
  })) : [];
  const models = Array.isArray(v.models) ? v.models.map((m, i) => ({
    provider: needStr(m?.provider, path + ".models[" + i + "].provider"),
    providerName: typeof m?.providerName === "string" ? m.providerName : "",
    id: needStr(m?.id, path + ".models[" + i + "].id"),
    name: typeof m?.name === "string" ? m.name : ""
  })) : [];
  return { providers, models };
}
function parseUsageSummary(v, path) {
  if (v === null || typeof v !== "object" || Array.isArray(v)) fail(path, "object");
  const totals = parseUsageTotals(v.totals, path + ".totals");
  const byDay = (Array.isArray(v.byDay) ? v.byDay : []).map((d, i) => ({
    date: needStr(d?.date, path + ".byDay[" + i + "].date"),
    ...parseUsageTotals(d, path + ".byDay[" + i + "]")
  }));
  const models = (Array.isArray(v.models) ? v.models : []).map((m, i) => ({
    provider: needStr(m?.provider, path + ".models[" + i + "].provider"),
    model: needStr(m?.model, path + ".models[" + i + "].model"),
    ...parseUsageTotals(m, path + ".models[" + i + "]")
  }));
  const sessions = (Array.isArray(v.sessions) ? v.sessions : []).map((s, i) => ({
    id: needStr(s?.id, path + ".sessions[" + i + "].id"),
    date: needStr(s?.date, path + ".sessions[" + i + "].date"),
    ...parseUsageTotals(s, path + ".sessions[" + i + "]")
  }));
  const byProvider = (Array.isArray(v.byProvider) ? v.byProvider : []).map((r, i) => ({
    provider: needStr(r?.provider, path + ".byProvider[" + i + "].provider"),
    ...parseUsageTotals(r, path + ".byProvider[" + i + "]")
  }));
  const byProject = (Array.isArray(v.byProject) ? v.byProject : []).map((r, i) => ({
    project: typeof r?.project === "string" ? r.project : "",
    ...parseUsageTotals(r, path + ".byProject[" + i + "]")
  }));
  const activity = (Array.isArray(v.activity) ? v.activity : []).map((r, i) => ({
    date: needStr(r?.date, path + ".activity[" + i + "].date"),
    ...parseUsageTotals(r, path + ".activity[" + i + "]")
  }));
  const activityModels = (Array.isArray(v.activityModels) ? v.activityModels : []).map((r, i) => ({
    day: needStr(r?.day, path + ".activityModels[" + i + "].day"),
    provider: needStr(r?.provider, path + ".activityModels[" + i + "].provider"),
    model: needStr(r?.model, path + ".activityModels[" + i + "].model"),
    ...parseUsageTotals(r, path + ".activityModels[" + i + "]")
  }));
  const windows = {
    today: v.windows?.today === void 0 || v.windows.today === null ? null : parseUsageTotals(v.windows.today, path + ".windows.today"),
    month: v.windows?.month === void 0 || v.windows.month === null ? null : parseUsageTotals(v.windows.month, path + ".windows.month"),
    all: v.windows?.all === void 0 || v.windows.all === null ? null : parseUsageTotals(v.windows.all, path + ".windows.all")
  };
  const timeZone = v.timeZone === void 0 || v.timeZone === null || typeof v.timeZone !== "object" || Array.isArray(v.timeZone) ? void 0 : { offset: typeof v.timeZone.offset === "string" ? v.timeZone.offset : "", name: typeof v.timeZone.name === "string" ? v.timeZone.name : void 0 };
  const lastSweepAt = typeof v.lastSweepAt === "number" ? v.lastSweepAt : void 0;
  const diagnostics = v.diagnostics === void 0 || v.diagnostics === null || typeof v.diagnostics !== "object" || Array.isArray(v.diagnostics) ? { lastUsageAt: void 0, unattributedRows: 0 } : {
    lastUsageAt: typeof v.diagnostics.lastUsageAt === "number" ? v.diagnostics.lastUsageAt : void 0,
    unattributedRows: needNum(v.diagnostics.unattributedRows, path + ".diagnostics.unattributedRows")
  };
  const providers = (Array.isArray(v.providers) ? v.providers : []).map((p, i) => ({
    id: needStr(p?.id, path + ".providers[" + i + "].id"),
    name: typeof p?.name === "string" ? p.name : ""
  }));
  return {
    totals,
    byDay,
    models,
    sessions,
    byProvider,
    byProject,
    activity,
    activityModels,
    windows,
    timeZone,
    lastSweepAt,
    diagnostics,
    providers
  };
}
function parseUsageTotals(v, path) {
  if (v === null || typeof v !== "object" || Array.isArray(v)) fail(path, "object");
  return {
    input: needNum(v.input, path + ".input"),
    output: needNum(v.output, path + ".output"),
    cacheRead: needNum(v.cacheRead, path + ".cacheRead"),
    cacheWrite: needNum(v.cacheWrite, path + ".cacheWrite"),
    calls: needNum(v.calls, path + ".calls"),
    costUsd: needNum(v.costUsd, path + ".costUsd"),
    costCny: needNum(v.costCny, path + ".costCny")
  };
}
function codecOf(parse) {
  return { parse };
}
var configCodec, patchCodec, usageCodec, fetchCodec, catalogCodec, usageSummaryCodec, usageQueryCodec, stringCodec, CONTRIBUTION;
var init_codecs = __esm({
  "lib/client-src/codecs.js"() {
    configCodec = codecOf(parseConfig);
    patchCodec = codecOf((v) => {
      if (v === null || typeof v !== "object" || Array.isArray(v)) fail("patch", "object");
      return v;
    });
    usageCodec = codecOf(parseProviderUsage);
    fetchCodec = codecOf(parseFetchResult);
    catalogCodec = codecOf(parseCatalog);
    usageSummaryCodec = codecOf(parseUsageSummary);
    usageQueryCodec = codecOf((v) => {
      if (v === null || typeof v !== "object" || Array.isArray(v)) fail("query", "object");
      return {
        range: v.range === void 0 || v.range === null ? void 0 : {
          start: typeof v.range.start === "string" ? v.range.start : void 0,
          end: typeof v.range.end === "string" ? v.range.end : void 0
        },
        providers: Array.isArray(v.providers) ? v.providers.filter((p) => typeof p === "string") : void 0,
        models: Array.isArray(v.models) ? v.models.filter((m) => typeof m === "string") : void 0
      };
    });
    stringCodec = codecOf((v) => {
      if (typeof v !== "string") fail("providerId", "string");
      return v;
    });
    CONTRIBUTION = {
      package: "dsh-monitor",
      descriptors: [
        {
          id: "dsh-monitor#monitor/getProviderUsage",
          service: "monitor",
          namespace: "monitor",
          method: "getProviderUsage",
          invocation: { kind: "direct" },
          parameters: [{ name: "providerId", wire: "providerId", source: "json", codec: { mode: "strict", typeSymbol: "string", schema: stringCodec } }],
          result: { mode: "strict", typeSymbol: "dsh-monitor#ProviderUsage", schema: usageCodec }
        },
        {
          id: "dsh-monitor#monitor/refreshProvider",
          service: "monitor",
          namespace: "monitor",
          method: "refreshProvider",
          invocation: { kind: "direct" },
          parameters: [{ name: "providerId", wire: "providerId", source: "json", codec: { mode: "strict", typeSymbol: "string", schema: stringCodec } }],
          result: { mode: "strict", typeSymbol: "dsh-monitor#ProviderUsage", schema: usageCodec }
        },
        {
          id: "dsh-monitor#monitor/getConfig",
          service: "monitor",
          namespace: "monitor",
          method: "getConfig",
          invocation: { kind: "direct" },
          parameters: [],
          result: { mode: "strict", typeSymbol: "dsh-monitor#MonitorConfig", schema: configCodec }
        },
        {
          id: "dsh-monitor#monitor/updateConfig",
          service: "monitor",
          namespace: "monitor",
          method: "updateConfig",
          invocation: { kind: "direct" },
          parameters: [{ name: "patch", wire: "patch", source: "json", codec: { mode: "strict", typeSymbol: "dsh-monitor#ConfigPatch", schema: patchCodec } }],
          result: { mode: "strict", typeSymbol: "dsh-monitor#MonitorConfig", schema: configCodec }
        },
        {
          id: "dsh-monitor#monitor/listCatalog",
          service: "monitor",
          namespace: "monitor",
          method: "listCatalog",
          invocation: { kind: "direct" },
          parameters: [],
          result: { mode: "strict", typeSymbol: "dsh-monitor#Catalog", schema: catalogCodec }
        },
        {
          id: "dsh-monitor#monitor/getUsage",
          service: "monitor",
          namespace: "monitor",
          method: "getUsage",
          invocation: { kind: "direct" },
          parameters: [{ name: "query", wire: "query", source: "json", codec: { mode: "strict", typeSymbol: "dsh-monitor#UsageQuery", schema: usageQueryCodec } }],
          result: { mode: "strict", typeSymbol: "dsh-monitor#UsageSummary", schema: usageSummaryCodec }
        },
        {
          id: "dsh-monitor#monitor/fetchPrices",
          service: "monitor",
          namespace: "monitor",
          method: "fetchPrices",
          invocation: { kind: "direct" },
          parameters: [],
          result: { mode: "strict", typeSymbol: "dsh-monitor#FetchPricesResult", schema: fetchCodec }
        }
      ]
    };
  }
});

// lib/client-src/format.js
var format_exports = {};
__export(format_exports, {
  activeCurrency: () => activeCurrency,
  billedInput: () => billedInput,
  costOfBuckets: () => costOfBuckets,
  formatMoneyUsd: () => formatMoneyUsd,
  formatMoneyValue: () => formatMoneyValue,
  formatPlain: () => formatPlain,
  formatTokens: () => formatTokens,
  formatWindow: () => formatWindow,
  hourInWindows: () => hourInWindows,
  localHourToUtc: () => localHourToUtc,
  priceEntryFor: () => priceEntryFor,
  priceTableFor: () => priceTableFor,
  tierFor: () => tierFor,
  usageCost: () => usageCost,
  utcHourToLocal: () => utcHourToLocal
});
function priceEntryFor(modelId, table) {
  const models = table?.models ?? {};
  if (typeof modelId === "string" && modelId.length > 0 && models[modelId] !== void 0) return models[modelId];
  return table?.default ?? { cacheHit: 0, cacheMiss: 0, output: 0 };
}
function activeCurrency(locale) {
  return (locale ?? "") === "en" ? "usd" : "cny";
}
function priceTableFor(config, locale) {
  const prices = config?.prices;
  if (prices === null || typeof prices !== "object") {
    return { models: {}, default: { cacheHit: 0, cacheMiss: 0, output: 0 } };
  }
  const table = prices[activeCurrency(locale)];
  if (table !== null && typeof table === "object" && table.models !== null && typeof table.models === "object") {
    return table;
  }
  const usd = prices.usd;
  if (usd !== null && typeof usd === "object" && usd.models !== null && typeof usd.models === "object") {
    return usd;
  }
  return { models: {}, default: { cacheHit: 0, cacheMiss: 0, output: 0 } };
}
function hourInWindows(hour, windows) {
  return (Array.isArray(windows) ? windows : []).some((w) => {
    const start = Number(w?.start);
    const end = Number(w?.end);
    if (!Number.isFinite(start) || !Number.isFinite(end)) return false;
    return start < end ? hour >= start && hour < end : hour >= start || hour < end;
  });
}
function localHourToUtc(localHour) {
  const d = new Date(2e3, 0, 1, Number(localHour) || 0, 0, 0, 0);
  return d.getUTCHours();
}
function utcHourToLocal(utcHour) {
  const d = new Date(2e3, 0, 1, 0, 0, 0, 0);
  d.setUTCHours(Number(utcHour) || 0, 0, 0, 0);
  return d.getHours();
}
function formatWindow(w) {
  const hh = (h) => String(h).padStart(2, "0") + ":00";
  return hh(utcHourToLocal(w?.start)) + "\u2013" + hh(utcHourToLocal(w?.end));
}
function tierFor(entry, atMs, peak) {
  const base = entry ?? { cacheHit: 0, cacheMiss: 0, output: 0 };
  const pick = (tier) => tier === void 0 || tier === null ? { cacheHit: base.cacheHit, cacheMiss: base.cacheMiss, output: base.output } : { cacheHit: tier.cacheHit, cacheMiss: tier.cacheMiss, output: tier.output };
  if (entry?.peakEnabled === false) return pick(void 0);
  if (peak?.enabled !== true) return pick(void 0);
  const effectiveAtMs = typeof peak.effectiveAtMs === "number" ? peak.effectiveAtMs : void 0;
  if (effectiveAtMs !== void 0 && atMs < effectiveAtMs) return pick(void 0);
  const own = entry?.windows;
  const hasOwn = own !== void 0 && (Array.isArray(own.peak) && own.peak.length > 0 || Array.isArray(own.offPeak) && own.offPeak.length > 0);
  const peakWins = hasOwn ? Array.isArray(own.peak) ? own.peak : [] : Array.isArray(peak.windows) && peak.windows.length > 0 ? peak.windows : [];
  const offWins = hasOwn ? Array.isArray(own.offPeak) ? own.offPeak : [] : [];
  const hour = new Date(atMs).getUTCHours();
  const inPeak = hourInWindows(hour, peakWins);
  const inOff = hourInWindows(hour, offWins);
  if (inPeak) return pick(base.peak);
  if (peakWins.length > 0) return pick(base.offPeak);
  if (offWins.length > 0) return pick(inOff ? base.offPeak : base.peak);
  return pick(base.offPeak);
}
function costOfBuckets(buckets, tier) {
  const input = Math.max(0, Number(buckets.input) || 0);
  const output = Math.max(0, Number(buckets.output) || 0);
  const cacheRead = Math.max(0, Number(buckets.cacheRead) || 0);
  const cacheWrite = Math.max(0, Number(buckets.cacheWrite) || 0);
  return (input * tier.cacheMiss + output * tier.output + (cacheRead + cacheWrite) * tier.cacheHit) / 1e6;
}
function formatMoneyValue(value, locale, decimals) {
  const symbol = activeCurrency(locale) === "cny" ? "\xA5" : "$";
  const d = Math.max(0, Math.min(10, Math.floor(Number(decimals) || 4)));
  let effective = d;
  if (value > 0 && value < Math.pow(10, -d)) effective = d + 2;
  const fixed = value.toFixed(effective);
  const trimmed = fixed.includes(".") ? fixed.replace(/0+$/, "").replace(/\.$/, "") : fixed;
  return symbol + trimmed;
}
function formatMoneyUsd(cost, locale, decimals) {
  return formatMoneyValue(cost, locale, decimals);
}
function formatPlain(value, decimals) {
  const d = Math.max(0, Math.min(10, Math.floor(Number(decimals) || 2)));
  const fixed = value.toFixed(d);
  return fixed.includes(".") ? fixed.replace(/0+$/, "").replace(/\.$/, "") : fixed;
}
function formatTokens(n) {
  const v = Math.max(0, Number(n) || 0);
  const scaled = (x) => x >= 100 ? String(Math.round(x)) : String(Math.round(x * 10) / 10);
  if (v < 1e3) return String(Math.round(v));
  if (v < 1e6) return scaled(v / 1e3) + "K";
  return scaled(v / 1e6) + "M";
}
function usageCost(usage, config) {
  if (!usage || !config) return 0;
  if (typeof usage.cost === "number" && Number.isFinite(usage.cost)) return usage.cost;
  const peak = {
    enabled: config.peakEnabled === true,
    effectiveAtMs: Date.parse(config.peakEffectiveAt || ""),
    windows: config.peakWindows
  };
  const table = priceTableFor(config, config?.locale);
  const now = Date.now();
  const byModel = usage.byModel ?? {};
  let total = 0;
  for (const modelId of Object.keys(byModel)) {
    const entry = priceEntryFor(modelId, table);
    total += costOfBuckets(byModel[modelId], tierFor(entry, now, peak));
  }
  const modeled = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 };
  for (const modelId of Object.keys(byModel)) {
    modeled.input += byModel[modelId].input ?? 0;
    modeled.output += byModel[modelId].output ?? 0;
    modeled.cacheRead += byModel[modelId].cacheRead ?? 0;
    modeled.cacheWrite += byModel[modelId].cacheWrite ?? 0;
  }
  const leftover = {
    input: Math.max(0, (usage.input ?? 0) - modeled.input),
    output: Math.max(0, (usage.output ?? 0) - modeled.output),
    cacheRead: Math.max(0, (usage.cacheRead ?? 0) - modeled.cacheRead),
    cacheWrite: Math.max(0, (usage.cacheWrite ?? 0) - modeled.cacheWrite)
  };
  total += costOfBuckets(leftover, tierFor(priceEntryFor("default", table), now, peak));
  return total;
}
function billedInput(usage) {
  return (usage?.input ?? 0) + (usage?.cacheRead ?? 0) + (usage?.cacheWrite ?? 0);
}
var init_format = __esm({
  "lib/client-src/format.js"() {
  }
});

// lib/client-src/panel.js
var require_panel = __commonJS({
  "lib/client-src/panel.js"(exports2, module2) {
    var { createElement: el, Fragment, useState, useEffect, useCallback, useRef } = require("react");
    var { Tooltip } = require("@deepseek-ai/dsh-client-ui-primitives");
    var { makeT: makeT3, resolveLocale: resolveLocale3 } = (init_i18n(), __toCommonJS(i18n_exports));
    var { formatPlain: formatPlain2, formatTokens: formatTokens2, formatMoneyUsd: formatMoneyUsd2, usageCost: usageCost2, billedInput: billedInput2 } = (init_format(), __toCommonJS(format_exports));
    function GaugeIcon({ size = 16, className }) {
      return el(
        "svg",
        { width: size, height: size, className, viewBox: "0 0 16 16", fill: "none", xmlns: "http://www.w3.org/2000/svg" },
        el("path", { d: "M1.5 10.4A6.5 6.5 0 1 1 14.5 10.4", stroke: "currentColor", strokeWidth: "1.7", strokeLinecap: "round" }),
        el("path", { d: "M8 10.4V4.2", stroke: "currentColor", strokeWidth: "1.7", strokeLinecap: "round" }),
        el("circle", { cx: "8", cy: "10.4", r: "1.4", fill: "currentColor" })
      );
    }
    function RefreshIcon({ size = 14, spin }) {
      return el(
        "svg",
        { width: size, height: size, className: spin ? "dm-spin" : void 0, viewBox: "0 0 16 16", fill: "none", xmlns: "http://www.w3.org/2000/svg" },
        el("path", {
          d: "M13.5 8A5.5 5.5 0 1 1 8 2.5M8 2.5v3M8 2.5h3",
          stroke: "currentColor",
          strokeWidth: "1.6",
          strokeLinecap: "round",
          strokeLinejoin: "round"
        })
      );
    }
    function UsageItemRow({ item, t }) {
      const pct = typeof item.percent === "number" && Number.isFinite(item.percent) ? Math.max(0, Math.min(100, item.percent)) : item.kind === "percent" ? Math.max(0, Math.min(100, item.value)) : null;
      let valueText;
      if (item.kind === "money") valueText = formatPlain2(item.value, 2);
      else if (item.kind === "text") valueText = String(item.value ?? "");
      else if (pct !== null) valueText = Math.round(pct) + "%";
      else valueText = formatPlain2(item.value, 2);
      const showMax = typeof item.max === "number" && Number.isFinite(item.max) && item.max > 0 && item.kind !== "percent";
      const fillClass = pct !== null ? pct >= 100 ? " dm-fill over" : pct >= 80 ? " dm-fill warn" : "" : "";
      const rows = [];
      rows.push(el(
        "div",
        { key: "r", className: "dm-row" },
        el("div", { className: "dm-label", title: item.label }, item.label),
        pct !== null ? el(
          Fragment,
          null,
          el("div", { className: "dm-bar" }, el("div", { className: "dm-fill" + fillClass, style: { width: pct + "%" } })),
          el("div", { className: "dm-num" }, valueText)
        ) : el("div", { className: "dm-num" }, valueText)
      ));
      if (showMax) {
        rows.push(el("div", { key: "max", className: "dm-reset" }, item.label + ": " + formatPlain2(item.value, 2) + " / " + formatPlain2(item.max, 2)));
      }
      if (item.resetsAt) {
        rows.push(el("div", { key: "reset", className: "dm-reset" }, t("resetsAt", { time: new Date(item.resetsAt).toLocaleString() })));
      }
      return el("div", null, rows);
    }
    function UsagePanel(props) {
      const { providerId, usage, loading, refreshing, error, onRefresh, config, t } = props;
      const BUILTIN_DEEPSEEK = "deepseek-official";
      const configured = config?.providers?.[providerId];
      const isBuiltinDeepseek = providerId === BUILTIN_DEEPSEEK;
      const preset = configured?.preset ?? (isBuiltinDeepseek ? "deepseek" : void 0);
      const presetLabel = preset === "deepseek" ? t("presetDeepseek") : preset === "opencode" ? t("presetOpencode") : preset === "custom" ? t("presetCustom") : null;
      let body;
      if (loading) {
        body = el("div", { className: "dm-msg off" }, t("loading"));
      } else if (!configured && !isBuiltinDeepseek) {
        body = el("div", { className: "dm-empty" }, t("notConfiguredHint"));
      } else if (error) {
        body = el("div", { className: "dm-msg err" }, error);
      } else if (usage !== null && (usage.status === "error" || usage.status === "off" && usage.message.length > 0)) {
        body = el("div", { className: "dm-msg " + (usage.status === "error" ? "err" : "off") }, usage.message);
      } else if (usage !== null && usage.items.length === 0) {
        body = el("div", { className: "dm-empty" }, t("noUsageItems"));
      } else {
        body = usage === null ? el("div", { className: "dm-msg off" }, t("loading")) : el("div", { className: "dm-items" }, usage.items.map((item) => el(UsageItemRow, { key: item.key, item, t })));
      }
      return el(
        "div",
        { className: "dm-panel", role: "dialog" },
        el(
          "div",
          { className: "dm-panel-head" },
          el("div", { className: "dm-panel-title", title: providerId || void 0 }, providerId || t("unknownProvider")),
          presetLabel !== null && el("span", { className: "dm-preset" }, presetLabel),
          el("button", { type: "button", className: "dm-icon-btn", "aria-label": t("refresh"), disabled: refreshing || loading, onClick: onRefresh }, RefreshIcon({ size: 14, spin: refreshing }))
        ),
        body,
        usage !== null && usage.fetchedAt > 0 && el(
          "div",
          { className: "dm-panel-foot" },
          el("span", null, t("updatedAt", { time: new Date(usage.fetchedAt).toLocaleTimeString() }))
        )
      );
    }
    function UsageButton2(props) {
      const { sessionId, api, providerOf, useMonitor, t } = props;
      const storeSnap = useMonitor ? useMonitor((s) => s) : {};
      const config = storeSnap.config;
      const [open, setOpen] = useState(false);
      const [usage, setUsage] = useState(null);
      const [loading, setLoading] = useState(false);
      const [refreshing, setRefreshing] = useState(false);
      const [error, setError] = useState(null);
      const wrapRef = useRef(null);
      const close = useCallback(() => setOpen(false), []);
      useEffect(() => {
        if (!open) return;
        const onDown = (e) => {
          if (wrapRef.current !== null && !wrapRef.current.contains(e.target)) close();
        };
        document.addEventListener("mousedown", onDown);
        return () => document.removeEventListener("mousedown", onDown);
      }, [open, close]);
      useEffect(() => {
        if (!open) return;
        let cancelled = false;
        setLoading(true);
        const providerId = providerOf(sessionId);
        if (providerId === void 0) {
          setUsage(null);
          setError(null);
          setLoading(false);
          return () => {
            cancelled = true;
          };
        }
        api.getProviderUsage(providerId).then(
          (v) => {
            if (!cancelled) {
              setUsage(v);
              setError(null);
            }
          },
          (err) => {
            if (!cancelled) {
              setUsage(null);
              setError(err?.message ?? String(err));
            }
          }
        ).finally(() => {
          if (!cancelled) setLoading(false);
        });
        return () => {
          cancelled = true;
        };
      }, [open, sessionId, api, providerOf]);
      const doRefresh = () => {
        const providerId = providerOf(sessionId);
        if (providerId === void 0) return;
        setRefreshing(true);
        api.refreshProvider(providerId).then(
          (v) => {
            setUsage(v);
            setError(null);
          },
          (err) => setError(err?.message ?? String(err))
        ).finally(() => setRefreshing(false));
      };
      return el(
        "div",
        { className: "dm-dock", ref: wrapRef },
        el(
          Tooltip,
          { label: t("panelTitle"), side: "top", delayMs: 500 },
          el("button", {
            type: "button",
            className: "dm-icon-btn" + (open ? " dm-icon-btn-open" : ""),
            "aria-label": t("panelTitle"),
            "aria-expanded": open,
            onClick: () => setOpen((v) => !v)
          }, GaugeIcon({ size: 16 }))
        ),
        open && el(UsagePanel, {
          providerId: providerOf(sessionId),
          usage,
          loading,
          refreshing,
          error,
          onRefresh: doRefresh,
          config,
          t
        })
      );
    }
    function SessionCost2(props) {
      const usage = props.useProjection ? props.useProjection("costUsage") : void 0;
      const costStore = props.useMonitor ? props.useMonitor((s) => s) : void 0;
      const config = costStore?.config;
      const cost = usageCost2(usage, config);
      const input = billedInput2(usage);
      if (!usage || !config || input + (usage?.output ?? 0) === 0) return null;
      const locale = costStore?.locale ?? resolveLocale3(config.locale);
      const t = makeT3(locale);
      const money = (amount) => formatMoneyUsd2(amount, locale, config.decimals);
      const detail = [
        t("sessionCostTitle"),
        t("sessionDetailTokens", {
          input: formatTokens2(usage?.input ?? 0),
          cache: formatTokens2((usage?.cacheRead ?? 0) + (usage?.cacheWrite ?? 0)),
          output: formatTokens2(usage?.output ?? 0)
        }),
        t("sessionDetailCache", {
          read: formatTokens2(usage?.cacheRead ?? 0),
          write: formatTokens2(usage?.cacheWrite ?? 0)
        }),
        t("cost", { amount: money(cost) })
      ].join("; ");
      return el(
        Tooltip,
        { label: detail, side: "top", delayMs: 500 },
        el("div", { className: "dm-chip" }, t("cost", { amount: money(cost) }))
      );
    }
    module2.exports = { UsageButton: UsageButton2, UsagePanel, SessionCost: SessionCost2 };
  }
});

// lib/client-src/assets/opencode-usage-sample.png
var require_opencode_usage_sample = __commonJS({
  "lib/client-src/assets/opencode-usage-sample.png"(exports2, module2) {
    module2.exports = "data:image/png;base64,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";
  }
});

// lib/client-src/settings.js
var require_settings = __commonJS({
  "lib/client-src/settings.js"(exports2, module2) {
    var { createElement: el, useState, useEffect } = require("react");
    var { createPortal } = require("react-dom");
    var { Tooltip } = require("@deepseek-ai/dsh-client-ui-primitives");
    var { activeCurrency: activeCurrency2, formatWindow: formatWindow2, localHourToUtc: localHourToUtc2, utcHourToLocal: utcHourToLocal2 } = (init_format(), __toCommonJS(format_exports));
    function FieldHint({ text }) {
      return el(
        Tooltip,
        { label: text, side: "top", delayMs: 400 },
        el("span", { className: "dm-hint", role: "img", "aria-label": text, tabIndex: 0 }, "?")
      );
    }
    var SAMPLE_IMG = require_opencode_usage_sample();
    function ProviderForm(props) {
      const { initial, onSave, onCancel, t, options } = props;
      const [provider, setProvider] = useState(initial?.provider ?? "");
      const [enabled, setEnabled] = useState(initial?.enabled !== false);
      const [refreshMinutes, setRefreshMinutes] = useState(String(initial?.refreshMinutes ?? 15));
      const [apiKey, setApiKey] = useState(initial?.apiKey ?? "");
      const [url, setUrl] = useState(initial?.custom?.url ?? "");
      const [headerPairs, setHeaderPairs] = useState(() => {
        const h = initial?.custom?.headers ?? {};
        const entries = Object.keys(h).map((key) => ({ key, value: String(h[key] ?? "") }));
        return entries.length > 0 ? entries : [{ key: "", value: "" }];
      });
      const [items, setItems] = useState(
        initial?.custom?.items && initial.custom.items.length > 0 ? initial.custom.items.map((it) => ({ ...it, maxPath: it.maxPath ?? "", resetsAtPath: it.resetsAtPath ?? "" })) : [{ key: "", label: "", kind: "percent", path: "", maxPath: "", resetsAtPath: "" }]
      );
      const updateItem = (index, field2, value) => {
        setItems((list) => list.map((it, i) => i === index ? { ...it, [field2]: value } : it));
      };
      const updateHeader = (index, field2, value) => {
        setHeaderPairs((list) => list.map((pair, i) => i === index ? { ...pair, [field2]: value } : pair));
      };
      const GO_EXAMPLES = [
        { key: "rolling", labelKey: "exampleRolling" },
        { key: "weekly", labelKey: "exampleWeekly" },
        { key: "monthly", labelKey: "exampleMonthly" }
      ];
      const goExample = (index) => GO_EXAMPLES[index] ?? GO_EXAMPLES[GO_EXAMPLES.length - 1];
      const tItem = (field2) => t("item" + field2[0].toUpperCase() + field2.slice(1));
      const derivePreset = (id) => {
        const s = String(id ?? "").trim().toLowerCase();
        if (s === "deepseek-official" || s === "deepseek") return "deepseek";
        if (s.includes("opencode")) return "opencode";
        return "custom";
      };
      const [preset, setPreset] = useState(initial?.preset ?? derivePreset(provider));
      const submit = () => {
        const headers = {};
        for (const pair of headerPairs) {
          const key = String(pair?.key ?? "").trim();
          const value = String(pair?.value ?? "");
          if (key.length > 0) headers[key] = value;
        }
        const cleanItems = items.filter((it) => typeof it.path === "string" && it.path.length > 0).map((it) => ({
          key: (it.key || it.path).trim(),
          label: (it.label || it.key || it.path).trim(),
          kind: ["percent", "number", "money", "text"].includes(it.kind) ? it.kind : "number",
          path: it.path.trim(),
          maxPath: typeof it.maxPath === "string" && it.maxPath.trim().length > 0 ? it.maxPath.trim() : typeof it.maxPath === "number" ? it.maxPath : null,
          resetsAtPath: typeof it.resetsAtPath === "string" && it.resetsAtPath.trim().length > 0 ? it.resetsAtPath.trim() : null
        }));
        onSave({
          provider: provider.trim(),
          preset,
          enabled,
          refreshMinutes: Math.max(1, Math.min(1440, Number(refreshMinutes) || 15)),
          apiKey: apiKey.trim(),
          custom: preset === "custom" ? { url: url.trim(), headers, items: cleanItems } : void 0
        });
      };
      const field = (label, control, hint) => el(
        "div",
        { className: "dm-field" },
        el(
          "span",
          { className: "dm-field-caption" },
          el("label", null, label),
          hint !== void 0 && el(FieldHint, { text: hint })
        ),
        control
      );
      const providerOptions = options ?? [];
      const [showSample, setShowSample] = useState(false);
      return el(
        "div",
        { className: "dm-editor" },
        el(
          "div",
          { className: "dm-grid2" },
          field(t("providerId"), el(
            "select",
            {
              className: "dm-input",
              value: provider,
              disabled: initial !== null,
              // 编辑时提供方 ID 不可改
              onChange: (e) => setProvider(e.target.value)
            },
            el("option", { value: "", disabled: true }, t("providerIdDatalist")),
            providerOptions.map((o) => el("option", { key: o.value, value: o.value }, o.label))
          )),
          field(t("refreshMinutes"), el("input", {
            className: "dm-input",
            type: "number",
            min: "1",
            max: "1440",
            value: refreshMinutes,
            onChange: (e) => setRefreshMinutes(e.target.value)
          }))
        ),
        field(t("presetChoose"), el(
          "select",
          { className: "dm-input", value: preset, onChange: (e) => setPreset(e.target.value) },
          el("option", { value: "deepseek" }, t("presetOptDeepseek")),
          el("option", { value: "opencode" }, t("presetOptOpencode")),
          el("option", { value: "custom" }, t("presetOptCustom"))
        )),
        el(
          "label",
          { className: "dm-switch", style: { width: "fit-content" } },
          el("input", { type: "checkbox", checked: enabled, onChange: (e) => setEnabled(e.target.checked) }),
          t("enabled")
        ),
        preset === "deepseek" && el("p", { className: "dm-note" }, t("deepseekHint")),
        preset === "opencode" && el(
          "div",
          { className: "dm-field" },
          field(t("apiKey"), el("input", {
            className: "dm-input",
            type: "password",
            value: apiKey,
            placeholder: t("apiKeyPlaceholder"),
            onChange: (e) => setApiKey(e.target.value)
          })),
          el("p", { className: "dm-note" }, t("opencodeHint"))
        ),
        preset === "custom" && el(
          "div",
          { className: "dm-field" },
          el("p", { className: "dm-note dm-custom-intro" }, t("customIntro")),
          field(t("customUrl"), el("input", { className: "dm-input", type: "text", value: url, onChange: (e) => setUrl(e.target.value) }), t("customUrlHint")),
          field(t("customHeaders"), el(
            "div",
            { className: "dm-header-list" },
            headerPairs.map((pair, i) => el(
              "div",
              { key: i, className: "dm-header-row" },
              el("input", { className: "dm-input", "aria-label": t("headerKey"), placeholder: "Authorization", value: pair.key, onChange: (e) => updateHeader(i, "key", e.target.value) }),
              el("input", { className: "dm-input", "aria-label": t("headerValue"), placeholder: "Bearer {apiKey}", value: pair.value, onChange: (e) => updateHeader(i, "value", e.target.value) }),
              el("button", {
                type: "button",
                className: "dm-icon-btn danger",
                "aria-label": t("remove"),
                onClick: () => setHeaderPairs((list) => list.filter((_, j) => j !== i))
              }, "\xD7")
            )),
            el("button", { type: "button", className: "dm-btn ghost small", style: { justifySelf: "start" }, onClick: () => setHeaderPairs((list) => [...list, { key: "", value: "" }]) }, t("addHeader")),
            el("p", { className: "dm-note" }, t("customHeadersNote"))
          ), t("customHeadersHint")),
          el(
            "div",
            { className: "dm-field" },
            el("label", null, t("customItems")),
            el(
              "div",
              { className: "dm-item-list" },
              items.map((it, i) => el(
                "div",
                { key: i, className: "dm-item" },
                el(
                  "div",
                  { className: "dm-item-head" },
                  el("span", { className: "dm-item-title" }, t("itemField") + " " + String(i + 1)),
                  el("button", {
                    type: "button",
                    className: "dm-icon-btn danger",
                    "aria-label": t("remove"),
                    onClick: () => setItems((list) => list.filter((_, j) => j !== i))
                  }, "\xD7")
                ),
                el(
                  "div",
                  { className: "dm-grid2" },
                  field(tItem("key"), el("input", { className: "dm-input", type: "text", placeholder: goExample(i).key, value: it.key, onChange: (e) => updateItem(i, "key", e.target.value) }), t("itemKeyHint")),
                  field(tItem("label"), el("input", { className: "dm-input", type: "text", placeholder: t(goExample(i).labelKey), value: it.label, onChange: (e) => updateItem(i, "label", e.target.value) }), t("itemLabelHint"))
                ),
                el(
                  "div",
                  { className: "dm-grid2" },
                  field(tItem("kind"), el(
                    "select",
                    { className: "dm-input", value: it.kind, onChange: (e) => updateItem(i, "kind", e.target.value) },
                    el("option", { value: "percent" }, t("kindPercent")),
                    el("option", { value: "number" }, t("kindNumber")),
                    el("option", { value: "money" }, t("kindMoney")),
                    el("option", { value: "text" }, t("kindText"))
                  ), t("itemKindHint")),
                  field(tItem("path"), el("input", { className: "dm-input", type: "text", placeholder: "usage." + goExample(i).key + ".percent", value: it.path, onChange: (e) => updateItem(i, "path", e.target.value) }), t("itemPathHint"))
                ),
                el(
                  "div",
                  { className: "dm-grid2" },
                  field(tItem("maxPath"), el("input", { className: "dm-input", type: "text", placeholder: "1000000", value: String(it.maxPath ?? ""), onChange: (e) => updateItem(i, "maxPath", e.target.value) }), t("itemMaxPathHint")),
                  field(tItem("resetsAtPath"), el("input", { className: "dm-input", type: "text", placeholder: "usage." + goExample(i).key + ".resetsAt", value: String(it.resetsAtPath ?? ""), onChange: (e) => updateItem(i, "resetsAtPath", e.target.value) }), t("itemResetsAtHint"))
                )
              ))
            ),
            el("button", { type: "button", className: "dm-btn ghost small", style: { alignSelf: "flex-start" }, onClick: () => setItems((list) => [...list, { key: "", label: "", kind: "percent", path: "", maxPath: "", resetsAtPath: "" }]) }, t("addItem"))
          ),
          el(
            "details",
            { className: "dm-custom-explain" },
            el("summary", null, t("customItemsExplainTitle")),
            el(
              "div",
              { className: "dm-custom-explain-body" },
              el("p", { className: "dm-note" }, t("customItemsExplain")),
              el(
                "div",
                { className: "dm-row-actions" },
                el("button", { type: "button", className: "dm-btn ghost small", onClick: () => setShowSample(true) }, t("viewSample"))
              )
            )
          )
        ),
        el(
          "div",
          { className: "dm-row-actions end" },
          el("button", { type: "button", className: "dm-btn ghost", onClick: onCancel }, t("cancel")),
          el("button", { type: "button", className: "dm-btn", onClick: submit, disabled: provider.trim().length === 0 || preset === "custom" && url.trim().length === 0 }, t("save"))
        ),
        showSample && createPortal(
          el(
            "div",
            { className: "dm-img-layer", onClick: (e) => {
              if (e.target === e.currentTarget) setShowSample(false);
            } },
            el(
              "div",
              { className: "dm-img-card" },
              el("img", { src: SAMPLE_IMG, alt: t("viewSample"), className: "dm-img" }),
              el(
                "div",
                { className: "dm-img-actions" },
                el("button", { type: "button", className: "dm-btn ghost small", onClick: () => setShowSample(false) }, t("cancel"))
              )
            )
          ),
          document.body
        )
      );
    }
    function PricesSection(props) {
      const { config, api, t, catalog, locale } = props;
      const currency = activeCurrency2(locale ?? config?.locale);
      const table = config?.prices?.[currency];
      const [draft, setDraft] = useState(() => ({
        models: Object.fromEntries(Object.entries(table?.models ?? {}).map(([id, p]) => [id, { ...p }])),
        default: { ...table?.default ?? { cacheHit: 0, cacheMiss: 0, output: 0 } }
      }));
      const [pickedModel, setPickedModel] = useState("");
      const [addingModel, setAddingModel] = useState(false);
      const [newHit, setNewHit] = useState("0");
      const [newMiss, setNewMiss] = useState("0");
      const [newOutput, setNewOutput] = useState("0");
      const [busy, setBusy] = useState(false);
      const [notice, setNotice] = useState(null);
      const [syncing, setSyncing] = useState(false);
      const isDeepseek = (id) => String(id ?? "").toLowerCase().startsWith("deepseek");
      const peakEnabledOf = (modelId) => draft.models[modelId]?.peakEnabled ?? isDeepseek(modelId);
      const toggleTier = (modelId) => setDraft((d) => ({
        ...d,
        models: {
          ...d.models,
          [modelId]: { ...d.models[modelId] ?? {}, peakEnabled: !(d.models[modelId]?.peakEnabled ?? isDeepseek(modelId)) }
        }
      }));
      const [winEdit, setWinEdit] = useState(null);
      const [winStart, setWinStart] = useState("09:00");
      const [winEnd, setWinEnd] = useState("12:00");
      const beginWinEdit = (modelId, tier) => {
        if (winEdit !== null && winEdit.modelId === modelId && winEdit.tier === tier) setWinEdit(null);
        else {
          setWinEdit({ modelId, tier });
          setWinStart("09:00");
          setWinEnd("12:00");
        }
      };
      const windowsOf = (modelId, tier) => Array.isArray(draft.models[modelId]?.windows?.[tier]) ? draft.models[modelId].windows[tier] : [];
      const windowsOverlap = (a, b) => {
        const inner = (w, h) => {
          const s = w.start, e = w.end;
          if (s === void 0 || e === void 0) return false;
          if (s === e) return true;
          return s < e ? h >= s && h < e : h >= s || h < e;
        };
        for (let h = 0; h < 24; h += 1) if (inner(a, h) && inner(b, h)) return true;
        return false;
      };
      const findOverlap = (wins) => {
        for (let i = 0; i < wins.length; i += 1) {
          for (let j = i + 1; j < wins.length; j += 1) {
            if (windowsOverlap(wins[i], wins[j])) return [wins[i], wins[j]];
          }
        }
        return null;
      };
      const setWindows = (modelId, tier, wins) => {
        setDraft((d) => {
          const entry = d.models[modelId] ?? {};
          const windows = { ...entry.windows ?? {} };
          if (wins.length === 0) delete windows[tier];
          else windows[tier] = wins;
          const next = { ...entry };
          if (Object.keys(windows).length === 0) delete next.windows;
          else next.windows = windows;
          return { ...d, models: { ...d.models, [modelId]: next } };
        });
      };
      const [winError, setWinError] = useState(null);
      const addWindow = () => {
        if (winEdit === null) return;
        const parse = (hhmm) => {
          const m = /^(\d{1,2}):(\d{2})$/.exec(String(hhmm ?? ""));
          if (m === null) return null;
          const h = Number(m[1]);
          return h >= 0 && h <= 23 ? h : null;
        };
        const from = parse(winStart);
        const to = parse(winEnd || winStart);
        if (from === null || to === null) return;
        const candidate = { start: localHourToUtc2(from), end: localHourToUtc2(to) };
        if (windowsOf(winEdit.modelId, winEdit.tier).some((w) => windowsOverlap(w, candidate))) {
          setWinError(t("windowsOverlap"));
          return;
        }
        setWinError(null);
        const wins = [...windowsOf(winEdit.modelId, winEdit.tier), candidate];
        setWindows(winEdit.modelId, winEdit.tier, wins);
        setWinEdit(null);
      };
      const modelGroups = [];
      {
        const byProvider = /* @__PURE__ */ new Map();
        for (const m of catalog?.models ?? []) {
          if (typeof m?.id !== "string" || m.id.length === 0) continue;
          let group = byProvider.get(m.provider);
          if (group === void 0) {
            group = { id: m.provider, name: m.providerName || m.provider, models: [] };
            byProvider.set(m.provider, group);
          }
          group.models.push(m);
        }
        for (const group of byProvider.values()) modelGroups.push(group);
      }
      useEffect(() => {
        const cur = config?.prices?.[currency];
        setDraft({
          models: Object.fromEntries(Object.entries(cur?.models ?? {}).map(([id, p]) => [id, { ...p }])),
          default: { ...cur?.default ?? { cacheHit: 0, cacheMiss: 0, output: 0 } }
        });
      }, [config?.fetchedAt]);
      const setTier = (modelId, field, value) => {
        const num = Number(value);
        const next = Number.isFinite(num) && num >= 0 ? num : 0;
        setDraft((d) => ({
          ...d,
          models: { ...d.models, [modelId]: { ...d.models[modelId] ?? {}, [field]: next } }
        }));
      };
      const addPicked = () => {
        const id = String(pickedModel ?? "").trim().toLowerCase();
        if (id.length === 0 || draft.models[id] !== void 0) return;
        const num = (v) => {
          const n = Number(v);
          return Number.isFinite(n) && n >= 0 ? n : 0;
        };
        setDraft((d) => ({ ...d, models: { ...d.models, [id]: { cacheHit: num(newHit), cacheMiss: num(newMiss), output: num(newOutput) } } }));
        setAddingModel(false);
        setPickedModel("");
        setNewHit("0");
        setNewMiss("0");
        setNewOutput("0");
      };
      const removeModel = (modelId) => {
        const models = { ...draft.models };
        delete models[modelId];
        setDraft((d) => ({ ...d, models }));
      };
      const save = async () => {
        for (const modelId of Object.keys(draft.models)) {
          const windows = draft.models[modelId]?.windows;
          if (windows === void 0 || windows === null) continue;
          for (const tier of ["peak", "offPeak"]) {
            if (Array.isArray(windows[tier]) && findOverlap(windows[tier]) !== null) {
              setNotice({ kind: "err", text: t("windowsOverlap") + " \xB7 " + modelId + " \xB7 " + t(tier) });
              return;
            }
          }
        }
        setBusy(true);
        try {
          await api.updateConfig({
            prices: {
              ...config?.prices ?? {},
              [currency]: { models: draft.models, default: draft.default }
            }
          });
          setNotice({ kind: "ok", text: t("saved") });
        } catch (err) {
          setNotice({ kind: "err", text: t("saveFailed", { message: err?.message ?? String(err) }) });
        } finally {
          setBusy(false);
        }
      };
      const sync = async () => {
        setSyncing(true);
        try {
          await api.fetchPrices();
          setNotice({ kind: "ok", text: t("saved") });
        } catch (err) {
          setNotice({ kind: "err", text: t("syncFailed", { message: err?.message ?? String(err) }) });
        } finally {
          setSyncing(false);
        }
      };
      const numberInput = (modelId, field, label) => el("input", {
        className: "dm-input dm-num",
        type: "number",
        step: "0.000001",
        min: "0",
        "aria-label": label,
        value: String(modelId === "default" ? draft.default?.[field] ?? 0 : draft.models[modelId]?.[field] ?? 0),
        onChange: (e) => {
          const num = Number(e.target.value);
          const next = Number.isFinite(num) && num >= 0 ? num : 0;
          if (modelId === "default") setDraft((d) => ({ ...d, default: { ...d.default, [field]: next } }));
          else setTier(modelId, field, e.target.value);
        }
      });
      const tierNumberInput = (modelId, tierKey, field, label) => el("input", {
        className: "dm-input dm-num",
        type: "number",
        step: "0.000001",
        min: "0",
        "aria-label": label,
        value: String(draft.models[modelId]?.[tierKey]?.[field] ?? 0),
        onChange: (e) => {
          const num = Number(e.target.value);
          const next = Number.isFinite(num) && num >= 0 ? num : 0;
          setDraft((d) => ({
            ...d,
            models: {
              ...d.models,
              [modelId]: {
                ...d.models[modelId] ?? {},
                [tierKey]: { ...d.models[modelId]?.[tierKey] ?? {}, [field]: next }
              }
            }
          }));
        }
      });
      const applyBaseTier = (modelId) => setDraft((d) => {
        const entry = d.models[modelId] ?? {};
        return {
          ...d,
          models: {
            ...d.models,
            [modelId]: {
              ...entry,
              offPeak: { cacheHit: entry.cacheHit ?? 0, cacheMiss: entry.cacheMiss ?? 0, output: entry.output ?? 0 }
            }
          }
        };
      });
      const ApplyDownIcon = ({ size = 14 } = {}) => el(
        "svg",
        { width: size, height: size, viewBox: "0 0 16 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", "aria-hidden": "true" },
        el("path", { d: "M8 2.5V10.5M4.5 7l3.5 3.5L11.5 7", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round" }),
        el("path", { d: "M3 12.5h10v1H3z", fill: "currentColor" })
      );
      const now = config?.fetchedAt !== null && config?.fetchedAt !== void 0 ? new Date(config.fetchedAt).toLocaleString() : t("neverSynced");
      const source = config?.priceSource === "official" ? t("sourceOfficial") : t("sourceBundled");
      const caption = () => el(
        "div",
        { className: "dm-price-caption", role: "presentation", "aria-hidden": "true" },
        el("span", null, t("modelName")),
        el("span", null, t("cacheHit")),
        el("span", null, t("cacheMiss")),
        el("span", null, t("output")),
        el("span", null, t("actions"))
      );
      const tierWindowsBlock = (modelId, tier) => {
        const wins = windowsOf(modelId, tier);
        const editing = winEdit !== null && winEdit.modelId === modelId && winEdit.tier === tier;
        const tag = (w, i) => el(
          "span",
          { key: tier + ":" + i, className: "dm-window-tag" },
          formatWindow2(w),
          el("button", {
            type: "button",
            className: "dm-window-remove",
            "aria-label": t("remove"),
            onClick: () => setWindows(modelId, tier, wins.filter((_, j) => j !== i))
          }, "\xD7")
        );
        return el(
          "div",
          { className: "dm-tier-windows" },
          el("span", { className: "dm-window-label" }, t("windowsLabel")),
          wins.map(tag),
          !editing && el("button", {
            type: "button",
            className: "dm-window-add",
            "aria-label": t("addWindow"),
            title: t("addWindow"),
            onClick: () => beginWinEdit(modelId, tier)
          }, "+"),
          editing && el(
            "span",
            { className: "dm-window-edit" },
            el("input", { className: "dm-input dm-num", type: "time", step: "3600", value: winStart, "aria-label": t("windowStart"), onChange: (e) => setWinStart(e.target.value) }),
            "\u2013",
            el("input", { className: "dm-input dm-num", type: "time", step: "3600", value: winEnd, "aria-label": t("windowEnd"), onChange: (e) => setWinEnd(e.target.value) }),
            el("button", { type: "button", className: "dm-btn ghost small", onClick: addWindow }, t("save")),
            el("button", { type: "button", className: "dm-icon-btn", "aria-label": t("cancel"), onClick: () => {
              setWinEdit(null);
              setWinError(null);
            } }, "\xD7")
          ),
          editing && winError !== null && el("span", { className: "dm-window-error" }, winError)
        );
      };
      return el(
        "div",
        { className: "dm-subsection" },
        el(
          "div",
          { className: "dm-toolbar" },
          el("h2", { className: "dm-h" }, t("pricesTitle")),
          el(
            "div",
            { className: "dm-row-actions" },
            el("button", { type: "button", className: "dm-btn ghost", onClick: sync, disabled: syncing || busy }, t("syncFromDocs")),
            el("button", { type: "button", className: "dm-btn", onClick: save, disabled: busy }, t("save"))
          )
        ),
        el("p", { className: "dm-intro" }, t("peakNotice")),
        el("p", { className: "dm-note" }, t("lastSync", { time: now, source })),
        notice !== null && el("p", { className: "dm-notice " + (notice.kind === "err" ? "err" : "ok") }, notice.text),
        el(
          "div",
          { className: "dm-price-table" },
          caption(),
          Object.keys(draft.models).map((modelId) => {
            const open = peakEnabledOf(modelId);
            return el(
              "div",
              { key: modelId, className: "dm-price-row" },
              el(
                "div",
                { className: "dm-price-fields" },
                el(
                  "span",
                  { className: "dm-price-name", title: modelId },
                  modelId,
                  el("span", { className: "dm-price-base" }, t("basePrice"))
                ),
                numberInput(modelId, "cacheHit", modelId + " " + t("cacheHit")),
                numberInput(modelId, "cacheMiss", modelId + " " + t("cacheMiss")),
                numberInput(modelId, "output", modelId + " " + t("output")),
                el(
                  "span",
                  { className: "dm-price-actions" },
                  el(
                    "label",
                    { className: "dm-switch", title: t("tiersToggle"), style: { whiteSpace: "nowrap" } },
                    el("input", { type: "checkbox", checked: open, onChange: () => toggleTier(modelId) }),
                    t("tiersToggle")
                  ),
                  el("button", {
                    type: "button",
                    className: "dm-icon-btn danger",
                    "aria-label": t("remove") + " " + modelId,
                    onClick: () => removeModel(modelId)
                  }, "\xD7")
                )
              ),
              open && el(
                "div",
                { className: "dm-tier-edits" },
                el(
                  "div",
                  { className: "dm-tier-row" },
                  el("span", { className: "dm-tier-name" }, t("offPeak")),
                  tierNumberInput(modelId, "offPeak", "cacheHit", modelId + " " + t("offPeak") + " " + t("cacheHit")),
                  tierNumberInput(modelId, "offPeak", "cacheMiss", modelId + " " + t("offPeak") + " " + t("cacheMiss")),
                  tierNumberInput(modelId, "offPeak", "output", modelId + " " + t("offPeak") + " " + t("output")),
                  el("button", {
                    type: "button",
                    className: "dm-icon-btn",
                    "aria-label": t("applyBase"),
                    title: t("applyBase"),
                    onClick: () => applyBaseTier(modelId)
                  }, ApplyDownIcon({ size: 14 }))
                ),
                tierWindowsBlock(modelId, "offPeak"),
                el(
                  "div",
                  { className: "dm-tier-row" },
                  el("span", { className: "dm-tier-name" }, t("peak")),
                  tierNumberInput(modelId, "peak", "cacheHit", modelId + " " + t("peak") + " " + t("cacheHit")),
                  tierNumberInput(modelId, "peak", "cacheMiss", modelId + " " + t("peak") + " " + t("cacheMiss")),
                  tierNumberInput(modelId, "peak", "output", modelId + " " + t("peak") + " " + t("output"))
                ),
                tierWindowsBlock(modelId, "peak")
              )
            );
          }),
          el(
            "div",
            { className: "dm-price-row" },
            el(
              "div",
              { className: "dm-price-fields" },
              el("span", { className: "dm-price-name" }, t("defaultModel")),
              numberInput("default", "cacheHit", t("defaultModel") + " " + t("cacheHit")),
              numberInput("default", "cacheMiss", t("defaultModel") + " " + t("cacheMiss")),
              numberInput("default", "output", t("defaultModel") + " " + t("output")),
              el("span", { "aria-hidden": "true" })
            )
          )
        ),
        el(
          "div",
          { className: "dm-add-block" },
          addingModel && el(
            "div",
            { className: "dm-editor" },
            el(
              "div",
              { className: "dm-editor-head" },
              el("span", { className: "dm-editor-title" }, t("addModelTitle"))
            ),
            el(
              "div",
              { className: "dm-field" },
              el("label", null, t("modelSelectHint")),
              el(
                "select",
                { className: "dm-input", value: pickedModel, onChange: (e) => setPickedModel(e.target.value) },
                el("option", { value: "", disabled: true }, "\u2026"),
                // 排除已设置过定价的模型(已在草稿中的)。
                modelGroups.map((group) => {
                  const pending = group.models.filter((m) => draft.models[m.id] === void 0);
                  if (pending.length === 0) return null;
                  return el(
                    "optgroup",
                    { key: group.id, label: group.name },
                    pending.map((m) => el("option", { key: group.id + ":" + m.id, value: m.id }, m.name && m.name !== m.id ? `${m.name} (${m.id})` : m.id))
                  );
                })
              ),
              // 所有模型都已定价:明确提示,避免下拉空白令人困惑(目录为空时不算)。
              (catalog?.models?.length ?? 0) > 0 && modelGroups.every((g) => g.models.every((m) => draft.models[m.id] !== void 0)) && el("p", { className: "dm-note" }, t("noModelsLeft"))
            ),
            el(
              "div",
              { className: "dm-grid3" },
              el(
                "div",
                { className: "dm-field" },
                el("label", null, t("cacheHit")),
                el("input", { className: "dm-input", type: "number", step: "0.000001", min: "0", value: newHit, onChange: (e) => setNewHit(e.target.value) })
              ),
              el(
                "div",
                { className: "dm-field" },
                el("label", null, t("cacheMiss")),
                el("input", { className: "dm-input", type: "number", step: "0.000001", min: "0", value: newMiss, onChange: (e) => setNewMiss(e.target.value) })
              ),
              el(
                "div",
                { className: "dm-field" },
                el("label", null, t("output")),
                el("input", { className: "dm-input", type: "number", step: "0.000001", min: "0", value: newOutput, onChange: (e) => setNewOutput(e.target.value) })
              )
            ),
            el(
              "div",
              { className: "dm-row-actions end" },
              el("button", {
                type: "button",
                className: "dm-btn ghost",
                onClick: () => {
                  setAddingModel(false);
                  setPickedModel("");
                  setNewHit("0");
                  setNewMiss("0");
                  setNewOutput("0");
                }
              }, t("cancel")),
              el("button", { type: "button", className: "dm-btn", onClick: addPicked, disabled: String(pickedModel ?? "").trim().length === 0 }, t("addModel"))
            )
          ),
          !addingModel && el("button", { type: "button", className: "dm-btn add", onClick: () => setAddingModel(true) }, t("addModel"))
        )
      );
    }
    function SettingsSection2(props) {
      const { useMonitor, api, t, locale } = props;
      const snap = useMonitor ? useMonitor((s) => s) : null;
      const config = snap?.config;
      const status = snap?.status;
      const [catalog, setCatalog] = useState(null);
      useEffect(() => {
        let cancelled = false;
        api.listCatalog().then(
          (value) => {
            if (!cancelled) setCatalog(value);
          },
          () => {
          }
        );
        return () => {
          cancelled = true;
        };
      }, [api]);
      if (config === null || config === void 0) {
        return el(
          "div",
          { className: "dm-section" },
          el("div", { className: "dm-empty" }, status === "error" ? snap?.error ?? "" : t("loading"))
        );
      }
      return el(
        "div",
        { className: "dm-section" },
        el(PricesSection, { config, api, t, catalog, locale: locale ?? config?.locale })
      );
    }
    module2.exports = { ProviderForm, SettingsSection: SettingsSection2 };
  }
});

// lib/client-src/dashboard.js
var require_dashboard = __commonJS({
  "lib/client-src/dashboard.js"(exports2, module2) {
    var { createElement: el, Fragment, useState, useEffect, useMemo, useRef, useCallback } = require("react");
    var { activeCurrency: activeCurrency2 } = (init_format(), __toCommonJS(format_exports));
    var ACTIVITY_DAYS = 371;
    var RANGES = [
      { id: "today", key: "today", label: "rangeToday", range: () => ({ start: dayKey(0) }) },
      // 本月 = 日历月首日(非滚动 30 天)。
      { id: "month", key: "month", label: "rangeMonth", range: () => monthStartRange() },
      { id: "all", key: "all", label: "rangeAll", range: () => ({}) }
    ];
    function fmt(value) {
      return typeof value === "number" && Number.isFinite(value) ? value.toLocaleString() : "\u2014";
    }
    function share(part, whole) {
      return typeof part === "number" && typeof whole === "number" && whole > 0 ? part / whole * 100 : 0;
    }
    function hitRateOf(row) {
      const denom = Number(row?.input ?? 0) + Number(row?.cacheRead ?? 0);
      return denom > 0 ? Math.round(Number(row?.cacheRead ?? 0) / denom * 100) : null;
    }
    function fmtHit(rate) {
      return typeof rate === "number" && Number.isFinite(rate) ? `${rate}%` : "";
    }
    function tokensOf(row) {
      return Number(row?.input ?? 0) + Number(row?.cacheRead ?? 0) + Number(row?.cacheWrite ?? 0) + Number(row?.output ?? 0);
    }
    function dayKey(offset = 0) {
      const d = /* @__PURE__ */ new Date();
      d.setDate(d.getDate() + offset);
      const pad = (n) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    }
    function monthStartRange() {
      const d = /* @__PURE__ */ new Date();
      const pad = (n) => String(n).padStart(2, "0");
      return { start: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-01` };
    }
    function localKey(date) {
      const pad = (n) => String(n).padStart(2, "0");
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    }
    function basenameOf(path) {
      const parts = String(path ?? "").split(/[\\/]/).filter(Boolean);
      return parts.length > 0 ? parts[parts.length - 1] : String(path ?? "");
    }
    function makeLevelScale(values) {
      const active = values.filter((v) => v > 0).sort((a, b) => a - b);
      if (active.length === 0) return () => 0;
      const distinct = [...new Set(active)];
      if (distinct.length < 4) {
        const rank = new Map(distinct.map((v, i) => [v, distinct.length === 1 ? 4 : 1 + Math.round(i * 3 / (distinct.length - 1))]));
        return (value) => value > 0 ? rank.get(value) ?? 4 : 0;
      }
      const at = (q) => {
        const pos = (active.length - 1) * q;
        const base = Math.floor(pos);
        const rest = pos - base;
        return active[base] + (active[Math.min(active.length - 1, base + 1)] - active[base]) * rest;
      };
      const t1 = at(0.5);
      const t2 = at(0.75);
      const t3 = at(0.9);
      return (value) => {
        if (!(value > 0)) return 0;
        if (value <= t1) return 1;
        if (value <= t2) return 2;
        if (value <= t3) return 3;
        return 4;
      };
    }
    function Section({ title, action, children }) {
      return el(
        "div",
        { className: "dm-dash-section" },
        el("div", { className: "dm-dash-section-title" }, title, action),
        children
      );
    }
    function StatRow({ data, range, onRange, t }) {
      const windows = data.windows ?? {};
      return el(
        "div",
        { className: "dm-dash-cards" },
        RANGES.map((r) => el(
          "button",
          {
            key: r.id,
            type: "button",
            className: "dm-dash-card" + (range === r.id ? " dm-dash-card-on" : ""),
            onClick: () => onRange(r.id)
          },
          el("div", { className: "dm-dash-card-val" }, fmt(tokensOf(windows[r.key]))),
          el("div", { className: "dm-dash-card-label" }, t(r.label))
        ))
      );
    }
    function StatCaption({ data, t, money }) {
      const totals = data.totals ?? {};
      const rate = hitRateOf(totals);
      const parts = [
        t("captionRequests", { n: fmt(totals.calls) }),
        t("captionHit", { rate: rate === null ? "\u2014" : fmtHit(rate) }),
        t("captionCost", { cost: money.fmt(money.of(totals)) })
      ];
      return el("p", { className: "dm-dash-caption" }, parts.join(" \xB7 "));
    }
    function ProviderRows({ data, filter, onSelect, t }) {
      const rows = data.byProvider ?? [];
      if (rows.length === 0) return el("p", { className: "dm-dash-note" }, t("providersNone"));
      const total = rows.reduce((sum, r) => sum + tokensOf(r), 0);
      const nameOf = (id) => {
        if (id === "unknown") return t("providersUnknown");
        const hit = (data.providers ?? []).find((p) => p.id === id);
        return hit !== void 0 && hit.name !== "" ? hit.name : id;
      };
      let idx = -1;
      const coloured = rows.map((row) => {
        const isUnknown = row.provider === "unknown";
        if (!isUnknown) idx += 1;
        return { ...row, color: isUnknown ? "var(--dm-unknown)" : `var(--dm-series-${idx % 6})` };
      });
      const stackNode = el(
        "div",
        {
          className: "dm-dash-stack",
          ...filter === void 0 ? {} : { "data-dim": "" }
        },
        coloured.map((row) => el("span", {
          key: row.provider,
          className: "dm-dash-stack-seg",
          ...row.provider === filter ? { "data-on": "" } : {},
          title: `${nameOf(row.provider)} \xB7 ${fmt(tokensOf(row))}`,
          style: { width: `${share(tokensOf(row), total)}%`, background: row.color }
        }))
      );
      const rowNode = (row) => {
        const id = row.provider;
        return el(
          "button",
          {
            key: id,
            type: "button",
            className: "dm-dash-row",
            ...id === filter ? { "data-on": "" } : {},
            title: id,
            onClick: () => onSelect(id === filter ? void 0 : id)
          },
          el("span", { className: "dm-dash-swatch", style: { background: row.color } }),
          el("span", { className: "dm-dash-row-name" }, nameOf(id)),
          el("span", { className: "dm-dash-row-value" }, fmt(tokensOf(row))),
          el("span", { className: "dm-dash-row-meta" }, `${Math.round(share(tokensOf(row), total))}%`)
        );
      };
      return el(Fragment, null, stackNode, el("div", { className: "dm-dash-rows" }, coloured.map(rowNode)));
    }
    function ProjectRows({ data, t }) {
      const rows = data.byProject ?? [];
      if (rows.length === 0) return el("p", { className: "dm-dash-note" }, t("projectsNone"));
      const total = rows.reduce((sum, r) => sum + tokensOf(r), 0);
      return el(
        "div",
        { className: "dm-dash-rows" },
        rows.map((row) => {
          const unattributed = row.project === "";
          return el(
            "div",
            {
              key: unattributed ? "__nopath__" : row.project,
              className: "dm-dash-row dm-dash-row-static",
              title: unattributed ? t("projectsUnattributed") : row.project
            },
            el("span", { className: "dm-dash-row-name" }, unattributed ? t("projectsUnattributed") : basenameOf(row.project)),
            unattributed ? null : el("span", { className: "dm-dash-row-path" }, row.project),
            el("span", { className: "dm-dash-row-value" }, fmt(tokensOf(row))),
            el("span", { className: "dm-dash-row-meta" }, `${Math.round(share(tokensOf(row), total))}%`)
          );
        })
      );
    }
    function ActivityStrip({ data, t }) {
      const [hover, setHover] = useState(null);
      const scroller = useRef(null);
      const days = data.activity ?? [];
      const byDay = new Map(days.map((d) => [d.date, tokensOf(d)]));
      const modelsByDay = useMemo(() => {
        const out = /* @__PURE__ */ new Map();
        for (const row of data.activityModels ?? []) {
          if (!out.has(row.day)) out.set(row.day, []);
          out.get(row.day).push(row);
        }
        for (const rows of out.values()) rows.sort((a, b) => tokensOf(b) - tokensOf(a));
        return out;
      }, [data.activityModels]);
      const levelAt = makeLevelScale([...byDay.values()]);
      const today = /* @__PURE__ */ new Date();
      today.setHours(0, 0, 0, 0);
      const cells = [];
      for (let back = ACTIVITY_DAYS - 1; back >= 0; back -= 1) {
        const date = new Date(today.getTime() - back * 864e5);
        cells.push({ day: localKey(date), date, tokens: byDay.get(localKey(date)) ?? 0 });
      }
      const startPad = (cells[0].date.getDay() + 6) % 7;
      for (let i = 0; i < startPad; i += 1) cells.unshift(null);
      const endPad = (7 - cells.length % 7) % 7;
      for (let i = 0; i < endPad; i += 1) cells.push(null);
      const weeks = cells.length / 7;
      const monthLabels = [];
      let lastMonth = -1;
      for (let w = 0; w < weeks; w += 1) {
        const first = cells.slice(w * 7, w * 7 + 7).find(Boolean);
        const month = first === void 0 ? lastMonth : first.date.getMonth();
        monthLabels.push(month !== lastMonth && first !== void 0 ? t(`month.${month}`) : "");
        if (first !== void 0) lastMonth = month;
      }
      useEffect(() => {
        const el2 = scroller.current;
        if (el2) el2.scrollLeft = el2.scrollWidth;
      }, [days.length]);
      const show = (cell) => (event) => {
        const box = event.currentTarget.getBoundingClientRect();
        const strip = scroller.current;
        const rect = strip === null ? null : strip.getBoundingClientRect();
        setHover({
          cell,
          x: box.left + box.width / 2,
          y: box.top,
          clamp: rect === null ? null : { left: rect.left, right: rect.right }
        });
      };
      return el(
        Fragment,
        null,
        el(
          "div",
          { className: "dm-dash-strip", ref: scroller },
          el(
            "div",
            { className: "dm-dash-weekdays" },
            [0, 1, 2, 3, 4, 5, 6].map((d) => el("span", { key: d, className: "dm-dash-weekday" }, d === 1 || d === 4 ? t(`weekday.${d}`) : ""))
          ),
          el(
            "div",
            { className: "dm-dash-strip-cols" },
            el(
              "div",
              { className: "dm-dash-months", style: { gridTemplateColumns: `repeat(${weeks}, 12px)` } },
              monthLabels.map((label, i) => el("span", { key: i, className: "dm-dash-month" }, label))
            ),
            el(
              "div",
              { className: "dm-dash-strip-grid" },
              cells.map((cell, i) => cell === null ? el("span", { key: "p" + i, className: "dm-dash-heat-pad" }) : el("span", {
                key: cell.day,
                className: "dm-dash-heat-cell",
                "data-l": String(levelAt(cell.tokens)),
                onMouseEnter: show(cell),
                onMouseLeave: () => setHover(null)
              }))
            )
          )
        ),
        el(
          "div",
          { className: "dm-dash-heat-legend" },
          el("span", null, t("activityLess")),
          [0, 1, 2, 3, 4].map((level) => el("span", { key: level, className: "dm-dash-heat-swatch", "data-l": String(level) })),
          el("span", null, t("activityMore"))
        ),
        hover === null ? null : el(DayTip, {
          cell: hover.cell,
          x: hover.x,
          y: hover.y,
          level: levelAt(hover.cell.tokens),
          models: modelsByDay.get(hover.cell.day) ?? [],
          clamp: hover.clamp,
          t
        })
      );
    }
    function DayTip({ cell, x, y, level, models, t, clamp }) {
      const total = cell.tokens ?? 0;
      const W = 250;
      const minX = clamp === null ? 8 : clamp.left + 8;
      const maxX = clamp === null ? Math.max(8, window.innerWidth - W - 8) : Math.max(minX, clamp.right - W - 8);
      const left = Math.min(Math.max(x - 110, minX), maxX);
      return el(
        "div",
        {
          className: "dm-dash-tip",
          style: { left: `${left}px`, top: `${Math.max(8, y - 8)}px`, transform: "translateY(-100%)" }
        },
        el(
          "div",
          { className: "dm-dash-tip-head" },
          el("span", { className: "dm-dash-tip-date" }, cell.day),
          el("span", { className: "dm-dash-tip-level" }, t("activityLevel", { level }))
        ),
        el(
          "div",
          { className: "dm-dash-tip-total" },
          fmt(total),
          el("span", { className: "dm-dash-tip-unit" }, "tokens")
        ),
        models.length === 0 ? el("p", { className: "dm-dash-tip-quiet" }, t("activityQuiet")) : el(
          "div",
          { className: "dm-dash-tip-models" },
          models.slice(0, 4).map((row) => el(
            "div",
            { key: row.provider + ":" + row.model, className: "dm-dash-tip-row" },
            el(
              "div",
              { className: "dm-dash-tip-row-head" },
              el("span", { className: "dm-dash-tip-name", title: row.model }, row.model),
              el("span", { className: "dm-dash-tip-value" }, fmt(tokensOf(row))),
              el("span", { className: "dm-dash-tip-pct" }, `${Math.round(share(tokensOf(row), total))}%`)
            ),
            el(
              "div",
              { className: "dm-dash-tip-bar" },
              el("div", { className: "dm-dash-tip-bar-fill", style: { width: `${Math.max(2, share(tokensOf(row), total))}%` } })
            )
          ))
        )
      );
    }
    function ModelTable({ data, t, money }) {
      const [sort, setSort] = useState(null);
      const rows = data.models ?? [];
      if (rows.length === 0) return el("p", { className: "dm-dash-note" }, t("tableNone"));
      const columns = [
        { id: "model", label: "tableModel", get: (m) => m.model, numeric: false },
        { id: "requests", label: "tableRequests", get: (m) => Number(m.calls ?? 0) },
        { id: "tokens", label: "tableTotal", get: (m) => tokensOf(m) },
        { id: "input", label: "tableInput", get: (m) => Number(m.input ?? 0) },
        { id: "cache", label: "tableCache", get: (m) => Number(m.cacheRead ?? 0) },
        { id: "output", label: "tableOutput", get: (m) => Number(m.output ?? 0) },
        { id: "cost", label: "tableCost", get: (m) => money.of(m) }
      ];
      const column = sort === null ? null : columns.find((c) => c.id === sort.by) ?? columns[2];
      const sorted = sort === null || column === null ? rows.slice() : rows.slice().sort((a, b) => {
        const x = column.get(a);
        const y = column.get(b);
        const order = column.numeric === false ? String(x).localeCompare(String(y)) : Number(x) - Number(y);
        return sort.desc ? -order : order;
      });
      const toggle = (id) => setSort((prev) => {
        if (prev === null || prev.by !== id) return { by: id, desc: true };
        return prev.desc ? { by: id, desc: false } : null;
      });
      return el(
        "table",
        { className: "dm-dash-table" },
        el("thead", null, el(
          "tr",
          null,
          columns.map((c) => el(
            "th",
            { key: c.id, title: t(c.label), onClick: () => toggle(c.id) },
            t(c.label),
            sort !== null && sort.by === c.id ? el("span", { className: "dm-dash-sort-mark" }, sort.desc ? "\u2193" : "\u2191") : null
          ))
        )),
        el("tbody", null, sorted.map((m) => {
          const hit = hitRateOf(m);
          return el(
            "tr",
            { key: m.provider + ":" + m.model },
            el("td", { title: m.provider + " \xB7 " + m.model }, m.model),
            el("td", null, fmt(m.calls)),
            el("td", null, fmt(tokensOf(m))),
            el("td", null, fmt(m.input)),
            el(
              "td",
              null,
              fmt(m.cacheRead),
              hit !== null ? el("span", { className: "dm-dash-hit" }, fmtHit(hit)) : null,
              Number(m.cacheWrite ?? 0) > 0 ? el("span", { className: "dm-dash-hit" }, ` \u2191${fmt(m.cacheWrite)}`) : null
            ),
            el("td", null, fmt(m.output)),
            el("td", null, money.fmt(money.of(m)))
          );
        }))
      );
    }
    function Footer({ data, t }) {
      const now = Date.now();
      const ago = (at) => {
        if (typeof at !== "number") return t("footerNever");
        const seconds = Math.max(0, Math.round((now - at) / 1e3));
        if (seconds < 90) return t("footerJustNow");
        const minutes = Math.round(seconds / 60);
        if (minutes < 60) return t("footerMinutes", { n: minutes });
        const hours = Math.round(minutes / 60);
        if (hours < 24) return t("footerHours", { n: hours });
        return t("footerDays", { n: Math.round(hours / 24) });
      };
      const checked = data.lastSweepAt;
      const d = data.diagnostics ?? {};
      return el(
        "div",
        { className: "dm-dash-footer" },
        el(
          "span",
          { title: typeof checked === "number" ? new Date(checked).toLocaleString() : "" },
          t("footerUpdated", { ago: ago(checked) })
        ),
        typeof d.lastUsageAt === "number" ? el("span", { title: new Date(d.lastUsageAt).toLocaleString() }, ` \xB7 ${t("footerLastActivity", { ago: ago(d.lastUsageAt) })}`) : null,
        Number(d.unattributedRows ?? 0) > 0 ? el("span", { className: "dm-dash-warn" }, ` \xB7 ${t("footerUnattributed", { n: fmt(d.unattributedRows) })}`) : null
      );
    }
    function Skeleton() {
      return el(
        Fragment,
        null,
        el(
          "div",
          { className: "dm-dash-cards" },
          [0, 1, 2].map((i) => el("div", { key: i, className: "dm-dash-skel dm-dash-skel-stat" }))
        ),
        el("div", { className: "dm-dash-section" }, el("div", { className: "dm-dash-skel", style: { height: "76px" } }))
      );
    }
    function Body({ data, range, onRange, filter, onSelect, money, t }) {
      const empty = Number(data.totals?.calls ?? 0) === 0;
      const filterName = filter === void 0 ? "" : (data.providers ?? []).find((p) => p.id === filter)?.name ?? filter;
      return el(
        Fragment,
        null,
        el(
          Section,
          { title: t("sectionUsage") },
          el(
            "div",
            null,
            el(StatRow, { data, range, onRange, t }),
            empty ? el("p", { className: "dm-dash-note" }, t("stateEmpty")) : el(StatCaption, { data, t, money })
          )
        ),
        el(
          Section,
          {
            title: t("sectionProviders"),
            action: filter === void 0 ? null : el(
              "button",
              { type: "button", className: "dm-dash-filter", onClick: () => onSelect(void 0) },
              t("filterClear", { name: filterName })
            )
          },
          el(ProviderRows, { data, filter, onSelect, t })
        ),
        empty ? null : el(Section, { title: t("sectionProjects") }, el(ProjectRows, { data, t })),
        empty ? null : el(
          Section,
          {
            title: t("sectionActivity"),
            action: data.timeZone === void 0 ? null : el("span", { className: "dm-dash-zone", title: data.timeZone.name ?? "" }, data.timeZone.offset)
          },
          el(ActivityStrip, { data, t })
        ),
        empty ? null : el(Section, { title: t("sectionModels") }, el(ModelTable, { data, t, money })),
        el(Footer, { data, t })
      );
    }
    function Dashboard2({ wide, useMonitor, api, t, locale }) {
      const storeSnap = useMonitor ? useMonitor((s) => s) : {};
      const config = storeSnap.config;
      const decimals = Math.max(0, Math.min(10, Math.floor(Number(config?.decimals) || 4)));
      const cny = activeCurrency2(locale ?? config?.locale) === "cny";
      const symbol = cny ? "\xA5" : "$";
      const money = {
        of: (row) => cny ? Number(row?.costCny ?? 0) : Number(row?.costUsd ?? 0),
        fmt: (v) => symbol + Number(v ?? 0).toFixed(decimals).replace(/\.?0+$/, "")
      };
      const [open, setOpen] = useState(false);
      const [range, setRange] = useState("today");
      const [filter, setFilter] = useState(void 0);
      const [data, setData] = useState(null);
      const [error, setError] = useState(null);
      const [busy, setBusy] = useState(false);
      const [todayTotal, setTodayTotal] = useState(null);
      const [nonce, setNonce] = useState(0);
      const root = useRef(null);
      useEffect(() => {
        let alive = true;
        const loadBadge = () => {
          api.getUsage({ range: RANGES[0].range() }).then(
            (v) => {
              if (alive && v !== null && v.totals !== void 0) setTodayTotal(tokensOf(v.totals));
            },
            () => {
            }
          );
        };
        loadBadge();
        const timer = setInterval(loadBadge, 6e4);
        return () => {
          alive = false;
          clearInterval(timer);
        };
      }, [api, nonce]);
      useEffect(() => {
        if (!open) return void 0;
        let alive = true;
        setBusy(true);
        const sel = RANGES.find((r) => r.id === range) ?? RANGES[0];
        const query = { range: sel.range() };
        if (filter !== void 0) query.providers = [filter];
        api.getUsage(query).then(
          (v) => {
            if (alive) {
              setData(v);
              setError(null);
            }
          },
          (err) => {
            if (alive) {
              setError(err?.message ?? String(err));
            }
          }
        ).finally(() => {
          if (alive) setBusy(false);
        });
        return () => {
          alive = false;
        };
      }, [open, range, filter, nonce, api]);
      useEffect(() => {
        if (!open) return void 0;
        const onKey = (e) => {
          if (e.key === "Escape") setOpen(false);
        };
        const onDown = (e) => {
          if (root.current !== null && !root.current.contains(e.target)) setOpen(false);
        };
        window.addEventListener("keydown", onKey);
        document.addEventListener("pointerdown", onDown, true);
        return () => {
          window.removeEventListener("keydown", onKey);
          document.removeEventListener("pointerdown", onDown, true);
        };
      }, [open]);
      const reload = useCallback(() => setNonce((n) => n + 1), []);
      const badgeValue = todayTotal !== null ? fmt(todayTotal) : "\u2026";
      return el(
        "div",
        { className: "dm-dash-layer" + (wide === false ? " dm-dash-rail" : ""), ref: root },
        el(
          "button",
          {
            type: "button",
            className: "dm-dash-badge" + (open ? " dm-dash-badge-open" : ""),
            title: t("dashboardTitle"),
            "aria-label": t("dashboardTitle"),
            "aria-expanded": open,
            onClick: () => setOpen((v) => !v)
          },
          el("span", { className: "dm-dash-badge-icon" }, GaugeIcon({ size: 16 })),
          el("span", { className: "dm-dash-badge-label" }, t("dashboardTitle")),
          el("span", { className: "dm-dash-badge-value" }, badgeValue)
        ),
        open && el(
          "div",
          { className: "dm-dash-panel", role: "dialog", "aria-label": t("dashboardTitle") },
          el(
            "div",
            { className: "dm-dash-head" },
            el("div", { className: "dm-dash-title" }, t("dashboardTitle")),
            el(
              "div",
              { className: "dm-dash-actions" },
              el("button", { type: "button", className: "dm-dash-icon", "aria-label": t("refresh"), disabled: busy, onClick: reload }, RefreshIcon({ size: 14 })),
              el("button", { type: "button", className: "dm-dash-icon", "aria-label": t("actionClose"), onClick: () => setOpen(false) }, CloseIcon({ size: 16 }))
            )
          ),
          el(
            "div",
            { className: "dm-dash-body" },
            error !== null ? el(
              Fragment,
              null,
              el("p", { className: "dm-dash-error" }, t("errorLoad")),
              el("p", { className: "dm-dash-note" }, error),
              el("button", { type: "button", className: "dm-dash-retry", onClick: reload }, t("actionRetry"))
            ) : data === null ? el(Skeleton) : el(Body, { data, range, onRange: setRange, filter, onSelect: setFilter, money, t })
          )
        )
      );
    }
    module2.exports = { Dashboard: Dashboard2 };
    function GaugeIcon({ size = 16, className }) {
      return el(
        "svg",
        { width: size, height: size, className, viewBox: "0 0 16 16", fill: "none", xmlns: "http://www.w3.org/2000/svg" },
        el("path", { d: "M1.5 10.4A6.5 6.5 0 1 1 14.5 10.4", stroke: "currentColor", strokeWidth: "1.7", strokeLinecap: "round" }),
        el("path", { d: "M8 10.4V4.2", stroke: "currentColor", strokeWidth: "1.7", strokeLinecap: "round" }),
        el("circle", { cx: "8", cy: "10.4", r: "1.4", fill: "currentColor" })
      );
    }
    function RefreshIcon({ size = 14, spin }) {
      return el(
        "svg",
        { width: size, height: size, className: spin ? "dm-spin" : void 0, viewBox: "0 0 16 16", fill: "none", xmlns: "http://www.w3.org/2000/svg" },
        el("path", {
          d: "M13.5 8A5.5 5.5 0 1 1 8 2.5M8 2.5v3M8 2.5h3",
          stroke: "currentColor",
          strokeWidth: "1.6",
          strokeLinecap: "round",
          strokeLinejoin: "round"
        })
      );
    }
    function CloseIcon({ size = 16 }) {
      return el(
        "svg",
        { width: size, height: size, viewBox: "0 0 16 16", fill: "none", xmlns: "http://www.w3.org/2000/svg" },
        el("path", { d: "M4 4l8 8M12 4l-8 8", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round" })
      );
    }
  }
});

// lib/client-src/binding.js
var require_binding = __commonJS({
  "lib/client-src/binding.js"(exports2, module2) {
    var { createElement: el, useState } = require("react");
    var { createRoot } = require("react-dom/client");
    var { ProviderForm } = require_settings();
    var GAUGE_SVG = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M1.5 10.4A6.5 6.5 0 1 1 14.5 10.4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M8 10.4V4.2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><circle cx="8" cy="10.4" r="1.4" fill="currentColor"/></svg>';
    function BindPopup(props) {
      const { providerId, displayName, config, api, t, onClose } = props;
      const existing = config?.providers?.[providerId];
      const [busy, setBusy] = useState(false);
      const [notice, setNotice] = useState(null);
      const save = async (draft) => {
        setBusy(true);
        try {
          const providers = { ...config?.providers ?? {} };
          const { provider, ...body } = draft;
          providers[provider] = body;
          await api.updateConfig({ providers });
          setNotice({ kind: "ok", text: t("bindSaveNote") });
          setTimeout(onClose, 700);
        } catch (err) {
          setNotice({ kind: "err", text: t("saveFailed", { message: err?.message ?? String(err) }) });
        } finally {
          setBusy(false);
        }
      };
      const remove = async () => {
        setBusy(true);
        try {
          const providers = { ...config?.providers ?? {} };
          delete providers[providerId];
          await api.updateConfig({ providers });
          setNotice({ kind: "ok", text: t("bindRemoveNote") });
          setTimeout(onClose, 700);
        } catch (err) {
          setNotice({ kind: "err", text: t("saveFailed", { message: err?.message ?? String(err) }) });
        } finally {
          setBusy(false);
        }
      };
      const title = displayName !== providerId ? `${displayName} (${providerId})` : providerId;
      return el(
        "div",
        { className: "dm-bind-layer", onClick: (e) => {
          if (e.target === e.currentTarget) onClose();
        } },
        el(
          "div",
          { className: "dm-bind-card", role: "dialog", "aria-label": t("bindingTitle") },
          el(
            "div",
            { className: "dm-bind-head" },
            el("span", { className: "dm-bind-title" }, t("bindingTitle")),
            el("span", { className: "dm-bind-sub" }, title),
            el("button", { type: "button", className: "dm-icon-btn danger", style: { marginLeft: "auto" }, "aria-label": t("cancel"), onClick: onClose }, "\xD7")
          ),
          el("p", { className: "dm-note" }, t("bindingDesc")),
          notice !== null && el("p", { className: "dm-notice " + (notice.kind === "err" ? "err" : "ok") }, notice.text),
          el(ProviderForm, {
            initial: existing !== void 0 ? { ...existing, provider: providerId } : { provider: providerId, enabled: true },
            onSave: save,
            onCancel: onClose,
            t,
            options: [{ value: providerId, label: title }]
          }),
          existing !== void 0 && el(
            "div",
            { className: "dm-bind-foot" },
            el("button", { type: "button", className: "dm-btn danger small", onClick: remove, disabled: busy }, t("bindRemove"))
          )
        )
      );
    }
    function startBinding2(ctx, deps) {
      const { api, configOf, tOf } = deps;
      let popHost = null;
      let popRoot = null;
      let popAnchor = null;
      const closePopup = () => {
        if (popRoot !== null) {
          popRoot.unmount();
          popRoot = null;
        }
        if (popHost !== null) {
          popHost.remove();
          popHost = null;
        }
        popAnchor = null;
      };
      const parseEditLabel = (label) => {
        const m = /^(?:编辑|Edit) (.+)$/.exec(String(label ?? ""));
        if (m === null) return null;
        const rest = m[1].trim();
        const pm = /\(([^)]+)\)$/.exec(rest);
        if (pm !== null) return { id: pm[1], displayName: rest.slice(0, rest.length - pm[0].length).trim() };
        return { id: rest, displayName: rest };
      };
      const openPopup = (providerId, displayName, anchor) => {
        if (popHost !== null) closePopup();
        popAnchor = anchor;
        popHost = document.createElement("div");
        document.body.appendChild(popHost);
        popRoot = createRoot(popHost);
        popRoot.render(el(BindPopup, {
          providerId,
          displayName,
          config: configOf(),
          api,
          t: tOf(),
          onClose: closePopup
        }));
      };
      const injectRow = (root) => {
        if (root === null) return;
        const buttons = root.querySelectorAll("button[aria-label]");
        for (const btn of buttons) {
          const parsed = parseEditLabel(btn.getAttribute("aria-label"));
          if (parsed === null) continue;
          if (btn.parentElement === null) continue;
          if (btn.parentElement.querySelector("[data-dsh-bind]") !== null) continue;
          const icon = document.createElement("button");
          icon.type = "button";
          icon.setAttribute("data-dsh-bind", parsed.id);
          icon.setAttribute("aria-label", tOf()("bindingTitle"));
          icon.setAttribute("title", tOf()("bindingTitle"));
          icon.className = "dm-icon-btn";
          icon.innerHTML = GAUGE_SVG;
          icon.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (popAnchor === icon) closePopup();
            else openPopup(parsed.id, parsed.displayName, icon);
          });
          btn.parentElement.insertBefore(icon, btn);
        }
      };
      let scanTimer = null;
      const scan = () => {
        scanTimer = null;
        const dialog = document.querySelector('[role="dialog"]');
        if (dialog !== null) injectRow(dialog);
        if (popAnchor !== null && popAnchor.isConnected !== true) closePopup();
      };
      const scheduleScan = () => {
        if (scanTimer === null) scanTimer = setTimeout(scan, 80);
      };
      const observer = new MutationObserver(scheduleScan);
      observer.observe(document.body, { childList: true, subtree: true });
      scheduleScan();
      const pollTimer = setInterval(scan, 1500);
      const onKeyDown = (e) => {
        if (e.key === "Escape") closePopup();
      };
      document.addEventListener("keydown", onKeyDown);
      const stop = () => {
        observer.disconnect();
        clearInterval(pollTimer);
        clearTimeout(scanTimer);
        document.removeEventListener("keydown", onKeyDown);
        closePopup();
      };
      ctx.effect(() => stop, "dsh-monitor: models-page binding injection");
      return stop;
    }
    module2.exports = { startBinding: startBinding2 };
  }
});

// lib/client-src/main.js
var { injectStyles: injectStyles2 } = (init_styles(), __toCommonJS(styles_exports));
var { MESSAGES: MESSAGES2, makeT: makeT2, resolveLocale: resolveLocale2 } = (init_i18n(), __toCommonJS(i18n_exports));
var { CONTRIBUTION: CONTRIBUTION2 } = (init_codecs(), __toCommonJS(codecs_exports));
var { UsageButton, SessionCost } = require_panel();
var { SettingsSection } = require_settings();
var { Dashboard } = require_dashboard();
var { startBinding } = require_binding();
injectStyles2();
function makeStore(initial) {
  let snapshot = initial;
  const listeners = /* @__PURE__ */ new Set();
  return {
    getSnapshot: () => snapshot,
    subscribe: (fn) => {
      listeners.add(fn);
      return () => {
        listeners.delete(fn);
      };
    },
    set: (next) => {
      if (next === snapshot) return;
      snapshot = next;
      for (const fn of [...listeners]) fn();
    }
  };
}
var inject = ["remote"];
var BUILD_TAG = "61f287c";
async function apply(ctx) {
  console.log("[dsh-monitor] client build " + BUILD_TAG);
  const remote = ctx.remote;
  if (remote === void 0 || typeof remote.$mount !== "function") return;
  const unmount = await remote.$mount(CONTRIBUTION2);
  ctx.effect(() => () => {
    unmount();
  }, "dsh-monitor: remote contribution");
  const monitor = ctx.get("remote.monitor");
  if (monitor === void 0) return;
  const store = makeStore({ status: "loading", error: null, config: null, locale: "zh" });
  const hostLocale = ctx.get("locale");
  const hostActive = () => {
    if (hostLocale !== void 0 && typeof hostLocale.getLocale === "function") {
      const active = hostLocale.getLocale()?.active;
      if (active === "zh" || active === "en") return active;
    }
    return void 0;
  };
  const effectiveLocale = () => {
    const host = hostActive();
    if (host !== void 0) return host;
    return resolveLocale2(store.getSnapshot().config?.locale);
  };
  const refreshStoreLocale = () => {
    const snap = store.getSnapshot();
    const next = effectiveLocale();
    if (next !== snap.locale) {
      store.set({ ...snap, locale: next });
      return true;
    }
    return false;
  };
  const syncBackLocale = async () => {
    const snap = store.getSnapshot();
    const host = hostActive();
    if (host !== void 0 && snap.config?.locale !== host) {
      try {
        await api.updateConfig({ locale: host });
      } catch {
      }
      refreshStoreLocale();
    }
  };
  const call = async (method, args) => {
    const result = await monitor[method](...args ?? []);
    if (result === null || typeof result !== "object" || result.ok !== true) {
      throw new Error(result?.error?.message ?? `monitor.${method} failed`);
    }
    return result.value;
  };
  let reloading = false;
  const setReady = (config) => {
    store.set({ status: "ready", error: null, config, locale: effectiveLocale() });
  };
  const reload = async () => {
    if (reloading) return;
    reloading = true;
    const prev = store.getSnapshot();
    try {
      const config = await call("getConfig");
      setReady(config);
    } catch (error) {
      store.set({ status: "error", error: error?.message ?? String(error), config: prev.config, locale: prev.locale });
    } finally {
      reloading = false;
    }
  };
  ctx.effect(() => ctx.on("connection/reset", () => {
    void reload();
  }), "dsh-monitor: reconnect reload");
  const pollTimer = setInterval(() => {
    if (!document.hidden) void reload();
  }, 6e4);
  ctx.effect(() => () => {
    clearInterval(pollTimer);
  }, "dsh-monitor: poll timer");
  const onVisible = () => {
    if (document.visibilityState === "visible") void reload();
  };
  document.addEventListener("visibilitychange", onVisible);
  ctx.effect(() => () => {
    document.removeEventListener("visibilitychange", onVisible);
  }, "dsh-monitor: visibility reload");
  const api = {
    reload,
    updateConfig: async (patch) => {
      const config = await call("updateConfig", [patch]);
      setReady(config);
      return config;
    },
    getProviderUsage: async (providerId) => call("getProviderUsage", [providerId]),
    refreshProvider: async (providerId) => call("refreshProvider", [providerId]),
    getUsage: async (query) => call("getUsage", [query ?? {}]),
    listCatalog: async () => call("listCatalog"),
    fetchPrices: async () => {
      const result = await monitor.fetchPrices();
      if (result === null || typeof result !== "object" || result.ok !== true) {
        throw new Error(result?.error?.message ?? "monitor.fetchPrices failed");
      }
      if (result.value?.ok !== true) throw new Error(result.value.message || "sync failed");
      if (result.value.config !== void 0) {
        setReady(result.value.config);
      }
      return result.value;
    }
  };
  void reload();
  void syncBackLocale();
  const slots = ctx.get("slots");
  if (slots === void 0) return;
  const providerOf = (sessionId) => {
    const dirs = ctx.get("modelDirectories");
    if (dirs === void 0 || typeof dirs.directoryFor !== "function") return void 0;
    try {
      const directory = dirs.directoryFor(sessionId);
      const snapshot = typeof directory?.store?.getSnapshot === "function" ? directory.store.getSnapshot() : void 0;
      return snapshot?.current?.provider;
    } catch {
      return void 0;
    }
  };
  const tOf = () => makeT2(store.getSnapshot().locale);
  const injected = () => ({
    api,
    providerOf,
    t: tOf(),
    locale: store.getSnapshot().locale,
    hooks: { monitor: store }
  });
  startBinding(ctx, { api, configOf: () => store.getSnapshot().config, tOf });
  slots.inject("conversation.input.right", () => slots.register({
    name: "conversation.input.right",
    id: "dsh-monitor-icon",
    order: 0,
    inject: (sessionId) => ({ sessionId, api, providerOf, t: tOf(), hooks: { monitor: store } })
  }, UsageButton));
  slots.inject("conversation.session.header.actions", () => slots.register({
    name: "conversation.session.header.actions",
    id: "dsh-monitor-cost",
    order: -5,
    inject: () => ({ hooks: { monitor: store } })
  }, SessionCost));
  slots.inject("sidebar.footer.action", () => slots.register({
    name: "sidebar.footer.action",
    id: "dsh-monitor-dashboard",
    order: 20,
    inject: () => ({ api, t: tOf(), locale: store.getSnapshot().locale, hooks: { monitor: store } })
  }, Dashboard));
  const sectionActive = { gen: 0, dispose: null };
  const registerSection = (locale) => {
    if (sectionActive.dispose !== null) {
      sectionActive.dispose();
      sectionActive.dispose = null;
    }
    sectionActive.gen += 1;
    const gen = sectionActive.gen;
    slots.inject("settings.section", () => {
      if (sectionActive.gen !== gen) return;
      const dispose = slots.register({
        name: "settings.section",
        id: "dsh-monitor-" + locale,
        order: 30,
        label: locale === "en" ? MESSAGES2.en.sectionLabel : MESSAGES2.zh.sectionLabel,
        inject: injected
      }, SettingsSection);
      if (sectionActive.gen !== gen) {
        dispose();
        return;
      }
      sectionActive.dispose = dispose;
      return () => {
        if (sectionActive.dispose === dispose) sectionActive.dispose = null;
        dispose();
      };
    });
  };
  let lastSectionLocale = null;
  const sync = () => {
    const locale = store.getSnapshot().locale;
    if (locale !== lastSectionLocale) {
      registerSection(locale);
      lastSectionLocale = locale;
    }
  };
  sync();
  const stopSync = store.subscribe(sync);
  let stopLocaleWatch = null;
  if (hostLocale !== void 0 && typeof hostLocale.subscribe === "function") {
    stopLocaleWatch = ctx.effect(() => hostLocale.subscribe(() => {
      const changed = refreshStoreLocale();
      if (changed) sync();
      void syncBackLocale();
    }), "dsh-monitor: host locale watch");
  }
  return () => {
    stopSync();
    if (stopLocaleWatch !== null) stopLocaleWatch();
  };
}
module.exports = { apply, inject };

Object.defineProperty(module.exports, Symbol.toStringTag, { value: 'Module' });
return module.exports;
}});
