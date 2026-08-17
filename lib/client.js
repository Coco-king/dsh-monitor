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
      ".dm-panel{position:absolute;right:0;bottom:calc(100% + 8px);z-index:60;width:320px;max-width:calc(100vw - 32px);box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2-darkmode-thin);border-radius:12px;background:var(--dsw-specific-input-major);box-shadow:var(--dsw-shadow-lv2);padding:12px;font-size:13px;line-height:20px;color:var(--dsw-alias-label-primary)}",
      ".dm-panel-head{display:flex;align-items:center;gap:8px;margin-bottom:10px}",
      ".dm-panel-title{flex:1;min-width:0;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
      ".dm-preset{flex:none;font-size:11px;font-weight:500;color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-layer-2);border-radius:6px;padding:0 6px;height:18px;line-height:18px}",
      ".dm-items{display:flex;flex-direction:column;gap:10px}",
      ".dm-row{display:flex;align-items:center;gap:8px;font-size:12px}",
      ".dm-label{flex:none;width:auto;min-width:56px;color:var(--dsw-alias-label-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
      ".dm-bar{flex:1;height:6px;border-radius:3px;background:var(--dsw-alias-interactive-bg-hover);overflow:hidden}",
      ".dm-fill{height:100%;border-radius:3px;background:var(--dsw-alias-brand-primary)}",
      ".dm-fill.warn{background:var(--dsw-alias-state-warn-primary)}",
      ".dm-fill.over{background:var(--dsw-alias-state-error-primary)}",
      ".dm-num{flex:none;min-width:52px;text-align:right;font-weight:600;font-variant-numeric:tabular-nums}",
      ".dm-reset{font-size:11px;color:var(--dsw-alias-label-tertiary);padding-left:64px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
      ".dm-msg{font-size:12px;line-height:18px;border-radius:8px;padding:8px 10px;margin-bottom:8px}",
      ".dm-msg.err{color:var(--dsw-alias-state-error-primary);background:var(--dsw-alias-interactive-bg-hover-danger)}",
      ".dm-msg.off,.dm-empty{color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-interactive-bg-hover);border-radius:8px;padding:8px 10px;font-size:12px}",
      ".dm-panel-foot{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:10px;font-size:11px;color:var(--dsw-alias-label-tertiary);border-top:1px solid var(--dsw-alias-border-l1);padding-top:8px}",
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
      // ── 设置页:计费价格表 ────────────────────────────────────────────────────
      ".dm-price-table{display:flex;flex-direction:column;gap:8px;margin-top:4px}",
      ".dm-price-caption{display:grid;grid-template-columns:minmax(0,1.4fr) repeat(3,minmax(0,1fr)) auto;gap:8px;padding:0 6px;font-size:12px;line-height:18px;font-weight:500;color:var(--dsw-alias-label-secondary)}",
      ".dm-price-row{border:1px solid var(--dsw-alias-border-l2);border-radius:8px;padding:8px;display:flex;flex-direction:column;gap:6px}",
      ".dm-price-fields{display:grid;grid-template-columns:minmax(0,1.4fr) repeat(3,minmax(0,1fr)) auto;gap:8px;align-items:center}",
      ".dm-price-name{display:flex;align-items:center;gap:6px;min-width:0;font-size:14px;line-height:22px;font-weight:500;color:var(--dsw-alias-label-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
      ".dm-price-legacy{flex:none;padding:1px 6px;border:1px solid var(--dsw-alias-border-l3);border-radius:4px;font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary)}",
      ".dm-tier-details{font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary);border-top:1px solid var(--dsw-alias-border-l2);padding-top:6px}",
      ".dm-tier-summary{display:flex;align-items:center;gap:6px;width:fit-content;padding:0 4px;margin-left:-4px;border-radius:6px;cursor:pointer;font-weight:500;color:var(--dsw-alias-label-secondary);list-style:none}",
      ".dm-tier-summary::-webkit-details-marker{display:none}",
      ".dm-tier-summary::before{content:'';width:5px;height:5px;border-right:1.5px solid currentcolor;border-bottom:1.5px solid currentcolor;transform:rotate(-45deg) translate(-1px,-1px);transition:transform 120ms ease}",
      ".dm-tier-details[open]>.dm-tier-summary::before{transform:rotate(45deg) translate(-1px,-1px)}",
      ".dm-tier-summary:hover{color:var(--dsw-alias-label-primary)}",
      ".dm-tier-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:8px 4px 2px;font-size:12px;line-height:18px;color:var(--dsw-alias-label-tertiary)}",
      ".dm-tier-grid strong{display:block;font-weight:500;color:var(--dsw-alias-label-secondary);margin-bottom:2px}",
      // ── 响应式 ───────────────────────────────────────────────────────────────
      "@media (max-width:640px){.dm-grid2,.dm-grid3{grid-template-columns:1fr}.dm-price-caption{display:none}.dm-price-fields{grid-template-columns:1fr 1fr}.dm-price-fields .dm-price-name{grid-column:1/-1}}",
      "@media (prefers-reduced-motion:reduce){.dm-tier-summary::before{transition:none}}"
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
        notConfiguredHint: "\u8BE5\u63D0\u4F9B\u65B9\u5C1A\u672A\u914D\u7F6E\u7528\u91CF\u67E5\u8BE2,\u8BF7\u5728 \u8BBE\u7F6E\u2192\u7528\u91CF \u4E2D\u914D\u7F6E\u3002",
        noUsageItems: "\u6682\u65E0\u7528\u6570\u636E\u3002",
        resetsAt: "\u91CD\u7F6E\u65F6\u95F4 {time}",
        updatedAt: "\u66F4\u65B0\u4E8E {time}",
        loading: "\u52A0\u8F7D\u4E2D\u2026",
        // 会话费用徽章
        sessionCostTitle: "\u672C\u4F1A\u8BDD\u8D39\u7528(\u6309\u6BCF\u6B21\u8C03\u7528\u5B9E\u9645\u65F6\u523B\u7CBE\u786E\u8BA1\u8D39)",
        sessionDetailTokens: "\u8F93\u5165 {input} \xB7 \u7F13\u5B58 {cache} \xB7 \u8F93\u51FA {output}",
        sessionDetailCache: "\u7F13\u5B58:\u8BFB {read} \xB7 \u5199 {write}(\u5199\u5165\u6309\u547D\u4E2D\u4EF7\u8BA1\u8D39)",
        cost: "\u8D39\u7528 {amount}",
        // 设置页:提供方配置
        sectionLabel: "\u7528\u91CF",
        providersTitle: "\u63D0\u4F9B\u65B9\u7528\u91CF\u914D\u7F6E",
        providersIntro: "\u6309\u63D0\u4F9B\u65B9\u914D\u7F6E\u7528\u91CF\u67E5\u8BE2;\u67E5\u8BE2\u9884\u8BBE(\u5B98\u65B9\u4F59\u989D / OpenCode \u5957\u9910 / \u81EA\u5B9A\u4E49 HTTP)\u6309\u63D0\u4F9B\u65B9 ID \u81EA\u52A8\u5224\u5B9A,DeepSeek \u5B98\u65B9\u514D\u914D\u7F6E\u3002",
        addProviderTitle: "\u6DFB\u52A0\u63D0\u4F9B\u65B9",
        editProviderTitle: "\u7F16\u8F91\u63D0\u4F9B\u65B9",
        noProviders: "\u5C1A\u672A\u914D\u7F6E\u4EFB\u4F55\u63D0\u4F9B\u65B9\u3002",
        addProvider: "\u6DFB\u52A0\u63D0\u4F9B\u65B9",
        providerId: "\u63D0\u4F9B\u65B9 ID",
        providerIdPlaceholder: "\u8F93\u5165\u81EA\u5B9A\u4E49 ID\u2026",
        providerIdDatalist: "\u9009\u62E9\u5DF2\u914D\u7F6E\u7684\u63D0\u4F9B\u65B9\u2026",
        modelSelectHint: "\u4ECE \u8BBE\u7F6E\u2192\u6A21\u578B \u4E2D\u9009\u62E9\u8981\u6DFB\u52A0\u4EF7\u683C\u7684\u6A21\u578B(\u6309\u63D0\u4F9B\u65B9\u5206\u7EC4)",
        addModelManual: "\u6216\u624B\u52A8\u8F93\u5165\u6A21\u578B ID(\u4E0D\u5728\u76EE\u5F55\u4E2D\u65F6)",
        deepseekHint: "\u590D\u7528 \u8BBE\u7F6E\u2192\u6A21\u578B \u4E2D\u914D\u7F6E\u7684 DeepSeek API Key,\u67E5\u8BE2\u5B98\u65B9\u8D26\u6237\u4F59\u989D\u3002",
        opencodeHint: "\u67E5\u8BE2 OpenCode Go \u5957\u9910\u989D\u5EA6(\u6EDA\u52A8 5 \u5C0F\u65F6 / \u672C\u5468 / \u672C\u6708);Key \u7559\u7A7A\u5219\u81EA\u52A8\u53D1\u73B0(\u51ED\u636E \u2192 \u73AF\u5883\u53D8\u91CF \u2192 opencode auth.json)\u3002",
        apiKey: "API Key(\u53EF\u9009)",
        apiKeyPlaceholder: "\u7559\u7A7A = \u81EA\u52A8\u53D1\u73B0",
        presetLabel: "\u67E5\u8BE2\u9884\u8BBE(\u6309\u63D0\u4F9B\u65B9\u81EA\u52A8)",
        refreshMinutes: "\u5237\u65B0\u95F4\u9694(\u5206\u949F)",
        enabled: "\u542F\u7528",
        edit: "\u7F16\u8F91",
        remove: "\u5220\u9664",
        save: "\u4FDD\u5B58",
        cancel: "\u53D6\u6D88",
        customUrl: "\u63A5\u53E3 URL",
        customUrlHint: "GET \u8BF7\u6C42\u7684\u5B8C\u6574\u5730\u5740;\u8FD4\u56DE\u4F53 JSON \u7531\u4E0B\u65B9\u6761\u76EE\u7684\u300C\u53D6\u503C\u8DEF\u5F84\u300D\u9010\u6761\u63D0\u53D6\u3002",
        customHeaders: "\u8BF7\u6C42\u5934",
        customHeadersHint: "\u952E\u503C\u5BF9\u5F62\u5F0F\u7684\u8BF7\u6C42\u5934;\u952E\u4E3A\u7A7A\u7684\u884C\u4F1A\u88AB\u5FFD\u7565\u3002",
        customHeadersNote: "\u503C\u652F\u6301 {apiKey} \u5360\u4F4D\u7B26,\u4F1A\u88AB\u66FF\u6362\u4E3A\u8BE5\u63D0\u4F9B\u65B9\u586B\u5199\u7684 API Key\u3002",
        headerKey: "\u952E",
        headerValue: "\u503C",
        addHeader: "\u6DFB\u52A0\u8BF7\u6C42\u5934",
        customIntro: "\u81EA\u5B9A\u4E49 = \u6307\u5B9A\u4EFB\u610F HTTP \u7528\u91CF\u63A5\u53E3:\u586B GET \u5730\u5740\u548C\u8BF7\u6C42\u5934,\u518D\u7528\u4E0B\u9762\u7684\u6761\u76EE\u4ECE\u54CD\u5E94 JSON \u91CC\u53D6\u503C\u5C55\u793A\u3002",
        customItems: "\u7528\u91CF\u6761\u76EE",
        itemField: "\u6761\u76EE",
        itemKey: "\u6807\u8BC6",
        itemKeyHint: "\u6761\u76EE\u7684\u552F\u4E00\u6807\u8BC6,\u7528\u4E8E\u66F4\u65B0\u4E0E\u53BB\u91CD;\u5EFA\u8BAE\u7B80\u77ED\u82F1\u6587,\u5982 weekly\u3002",
        itemLabel: "\u663E\u793A\u540D",
        itemLabelHint: "\u7528\u91CF\u9762\u677F\u4E0A\u663E\u793A\u7684\u540D\u79F0,\u5982\u300C\u6EDA\u52A8 5 \u5C0F\u65F6\u300D\u3002",
        itemKind: "\u6570\u503C\u7C7B\u578B",
        itemKindHint: "\u6570\u503C\u7684\u5C55\u793A\u65B9\u5F0F:percent \u76F4\u63A5\u7528\u767E\u5206\u6BD4;number \u663E\u793A\u6570\u5B57;money \u663E\u793A\u91D1\u989D;text \u663E\u793A\u7EAF\u6587\u672C\u3002",
        itemPath: "\u53D6\u503C\u8DEF\u5F84",
        itemPathHint: "\u4ECE\u54CD\u5E94 JSON \u53D6\u503C\u7684\u70B9\u8DEF\u5F84,\u5982 usage.weekly.percent(\u53D6 data \u7684 usage.weekly.percent)\u3002",
        itemMaxPath: "\u4E0A\u9650",
        itemMaxPathHint: "\u53EF\u9009:\u586B\u6570\u5B57\u5E38\u91CF(\u5982 1000000)\u6216 JSON \u8DEF\u5F84(\u5982 usage.limit);\u5B58\u5728\u65F6\u81EA\u52A8\u8BA1\u7B97\u767E\u5206\u6BD4 = \u6570\u503C \xF7 \u4E0A\u9650 \xD7 100\u3002\u6570\u503C\u7C7B\u578B \u9009 \u767E\u5206\u6BD4 \u65F6\u4E0D\u7528\u586B\u3002",
        itemResetsAtPath: "\u91CD\u7F6E\u65F6\u95F4",
        itemResetsAtHint: "\u53EF\u9009:\u91CD\u7F6E\u65F6\u95F4\u5728\u54CD\u5E94\u4E2D\u7684 JSON \u8DEF\u5F84,\u5982 usage.weekly.resetsAt;\u586B\u4E86\u4F1A\u5728\u9762\u677F\u91CC\u663E\u793A\u91CD\u7F6E\u65F6\u95F4\u3002",
        addItem: "\u6DFB\u52A0\u6761\u76EE",
        kindPercent: "\u767E\u5206\u6BD4(percent)",
        kindNumber: "\u6570\u5B57(number)",
        kindMoney: "\u91D1\u989D(money)",
        kindText: "\u6587\u672C(text)",
        providerSaved: "\u5DF2\u4FDD\u5B58 {id}",
        providerRemoved: "\u5DF2\u5220\u9664 {id}",
        saved: "\u5DF2\u4FDD\u5B58",
        saveFailed: "\u4FDD\u5B58\u5931\u8D25:{message}",
        providersUpdated: "\u63D0\u4F9B\u65B9\u914D\u7F6E\u5DF2\u66F4\u65B0",
        // 设置页:计费价格
        pricesTitle: "\u8BA1\u8D39\u4EF7\u683C(\u7F8E\u5143 / 1M tokens)",
        peakNotice: "\u7A7A\u95F2 / \u9AD8\u5CF0\u4E3A\u5CF0\u8C37\u8BA1\u4EF7\u4E24\u6863;\u751F\u6548\u524D\u6309\u5386\u53F2\u57FA\u7840\u4EF7(legacyBase)\u8BA1\u8D39;\u7F13\u5B58\u5199\u5165\u6309\u547D\u4E2D\u4EF7\u8BA1\u8D39\u3002",
        defaultModel: "default(\u672A\u5339\u914D\u6A21\u578B\u65F6\u56DE\u9000)",
        addModelTitle: "\u6DFB\u52A0\u6A21\u578B",
        addModel: "\u6DFB\u52A0\u6A21\u578B",
        modelName: "\u6A21\u578B",
        actions: "\u64CD\u4F5C",
        tiersLabel: "\u6863\u4F4D\u4EF7\u683C(\u7A7A\u95F2 / \u9AD8\u5CF0 / \u5386\u53F2\u57FA\u7840\u4EF7)",
        cacheHit: "\u547D\u4E2D",
        cacheMiss: "\u672A\u547D\u4E2D",
        output: "\u8F93\u51FA",
        offPeak: "\u7A7A\u95F2",
        peak: "\u9AD8\u5CF0",
        legacyBase: "\u5386\u53F2\u57FA\u7840\u4EF7",
        legacy: "\u65E7\u6A21\u578B",
        syncFromDocs: "\u4ECE\u5B98\u65B9\u6587\u6863\u540C\u6B65",
        syncFailed: "\u540C\u6B65\u5931\u8D25:{message}",
        lastSync: "\u4E0A\u6B21\u540C\u6B65 {time} \xB7 \u6765\u6E90 {source}",
        neverSynced: "\u4ECE\u672A",
        sourceBundled: "\u5185\u7F6E",
        sourceOfficial: "\u5B98\u65B9"
      },
      en: {
        // Usage icon/panel
        panelTitle: "Usage",
        refresh: "Refresh",
        presetDeepseek: "DeepSeek official",
        presetOpencode: "OpenCode",
        presetCustom: "Custom",
        unknownProvider: "Unknown provider",
        notConfiguredHint: "No usage query configured for this provider. Configure it in Settings \u2192 Usage.",
        noUsageItems: "No usage data yet.",
        resetsAt: "Resets {time}",
        updatedAt: "Updated {time}",
        loading: "Loading\u2026",
        // Session cost badge
        sessionCostTitle: "Session cost (billed precisely at each call time)",
        sessionDetailTokens: "Input {input} \xB7 Cache {cache} \xB7 Output {output}",
        sessionDetailCache: "Cache: read {read} \xB7 write {write} (writes billed at hit price)",
        cost: "Cost {amount}",
        // Settings: provider usage config
        sectionLabel: "Usage",
        providersTitle: "Provider usage config",
        providersIntro: "Configure usage queries per provider. The query type (official balance / OpenCode plan / custom HTTP) follows the provider ID; DeepSeek official works with no config.",
        addProviderTitle: "Add provider",
        editProviderTitle: "Edit provider",
        noProviders: "No providers configured yet.",
        addProvider: "Add provider",
        providerId: "Provider ID",
        providerIdPlaceholder: "Type a custom ID\u2026",
        providerIdDatalist: "Pick a provider\u2026",
        modelSelectHint: "Pick a model from Settings \u2192 Models (grouped by provider)",
        addModelManual: "Or type a model ID manually (if not in the catalog)",
        deepseekHint: "Reuses the DeepSeek API key configured in Settings \u2192 Models and queries the official account balance.",
        opencodeHint: "Queries the OpenCode Go plan quota (rolling 5h / weekly / monthly). Leave the key empty for auto-discovery (credentials \u2192 env \u2192 opencode auth.json).",
        apiKey: "API key (optional)",
        apiKeyPlaceholder: "Empty = auto-discover",
        presetLabel: "Query type (auto from provider)",
        refreshMinutes: "Refresh interval (minutes)",
        enabled: "Enabled",
        edit: "Edit",
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
        customIntro: "Custom = point any HTTP usage endpoint: fill the GET URL and headers, then define items that read values from the response JSON.",
        customItems: "Usage items",
        itemField: "Item",
        itemKey: "Key",
        itemKeyHint: "Unique id for this item, used for updates and dedupe; keep it short and English, e.g. weekly.",
        itemLabel: "Display name",
        itemLabelHint: 'Name shown in the usage panel, e.g. "Rolling 5 hours".',
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
        providerSaved: "Saved {id}",
        providerRemoved: "Removed {id}",
        saved: "Saved",
        saveFailed: "Save failed: {message}",
        providersUpdated: "Provider config updated",
        // Settings: billing prices
        pricesTitle: "Billing prices (USD / 1M tokens)",
        peakNotice: "Off-peak / Peak are the two tiers; calls before the effective boundary are billed at the legacy base prices; cache writes are billed at the cache-hit price.",
        defaultModel: "default (fallback for unmatched models)",
        addModelTitle: "Add model",
        addModel: "Add model",
        modelName: "Model",
        actions: "Actions",
        tiersLabel: "Tier pricing (off-peak / peak / legacy base)",
        cacheHit: "Hit",
        cacheMiss: "Miss",
        output: "Output",
        offPeak: "Off-peak",
        peak: "Peak",
        legacyBase: "Legacy base",
        legacy: "Legacy",
        syncFromDocs: "Sync from official docs",
        syncFailed: "Sync failed: {message}",
        lastSync: "Last sync {time} \xB7 Source {source}",
        neverSynced: "Never",
        sourceBundled: "Bundled",
        sourceOfficial: "Official"
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
function needBool(v, path) {
  if (typeof v !== "boolean") fail(path, "boolean");
  return v;
}
function parsePrice(v, path) {
  if (v === null || typeof v !== "object" || Array.isArray(v)) fail(path, "object");
  const out = {
    cacheHit: needNum(v.cacheHit, path + ".cacheHit"),
    cacheMiss: needNum(v.cacheMiss, path + ".cacheMiss"),
    output: needNum(v.output, path + ".output")
  };
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
  if (v.legacyBase !== void 0 && v.legacyBase !== null) {
    out.legacyBase = {
      cacheHit: needNum(v.legacyBase.cacheHit, path + ".legacyBase.cacheHit"),
      cacheMiss: needNum(v.legacyBase.cacheMiss, path + ".legacyBase.cacheMiss"),
      output: needNum(v.legacyBase.output, path + ".legacyBase.output")
    };
  }
  if (v.legacy !== void 0) out.legacy = needBool(v.legacy, path + ".legacy");
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
function parseConfig(v, path) {
  if (v === null || typeof v !== "object" || Array.isArray(v)) fail(path, "object");
  const models = {};
  if (v.prices !== null && typeof v.prices === "object" && v.prices.models !== null && typeof v.prices.models === "object") {
    for (const id of Object.keys(v.prices.models)) models[id] = parsePrice(v.prices.models[id], path + ".prices.models." + id);
  }
  const providers = {};
  if (v.providers !== null && typeof v.providers === "object" && !Array.isArray(v.providers)) {
    for (const id of Object.keys(v.providers)) providers[id] = parseProvider(v.providers[id], path + ".providers." + id);
  }
  return {
    locale: v.locale === "zh" || v.locale === "en" || v.locale === "auto" ? v.locale : "auto",
    currency: typeof v.currency === "string" ? v.currency : "CNY",
    symbol: typeof v.symbol === "string" ? v.symbol : "\xA5",
    decimals: needNum(v.decimals, path + ".decimals"),
    exchangeRate: needNum(v.exchangeRate, path + ".exchangeRate"),
    peakEnabled: v.peakEnabled === true,
    peakEffectiveAt: typeof v.peakEffectiveAt === "string" ? v.peakEffectiveAt : "",
    peakWindows: Array.isArray(v.peakWindows) ? v.peakWindows.map((w, i) => ({ start: needNum(w.start, path + ".peakWindows[" + i + "].start"), end: needNum(w.end, path + ".peakWindows[" + i + "].end") })) : [],
    prices: {
      models,
      default: parsePrice(v.prices?.default ?? { cacheHit: 0, cacheMiss: 0, output: 0 }, path + ".prices.default")
    },
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
function codecOf(parse) {
  return { parse };
}
var configCodec, patchCodec, usageCodec, fetchCodec, catalogCodec, stringCodec, CONTRIBUTION;
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
  billedInput: () => billedInput,
  costOfBuckets: () => costOfBuckets,
  formatMoneyUsd: () => formatMoneyUsd,
  formatMoneyValue: () => formatMoneyValue,
  formatPlain: () => formatPlain,
  formatTokens: () => formatTokens,
  isPeakHour: () => isPeakHour,
  priceEntryFor: () => priceEntryFor,
  tierFor: () => tierFor,
  usageCost: () => usageCost
});
function priceEntryFor(modelId, table) {
  const models = table?.models ?? {};
  if (typeof modelId === "string" && modelId.length > 0 && models[modelId] !== void 0) return models[modelId];
  return table?.default ?? { cacheHit: 0, cacheMiss: 0, output: 0 };
}
function isPeakHour(atMs, effectiveAtMs, windows) {
  if (!Array.isArray(windows) || windows.length === 0) return false;
  if (Number.isFinite(effectiveAtMs) && atMs < effectiveAtMs) return false;
  const hour = new Date(atMs).getUTCHours();
  return windows.some((w) => {
    const start = Number(w.start);
    const end = Number(w.end);
    if (!Number.isFinite(start) || !Number.isFinite(end)) return false;
    return start < end ? hour >= start && hour < end : hour >= start || hour < end;
  });
}
function tierFor(entry, atMs, peak) {
  const base = entry ?? { cacheHit: 0, cacheMiss: 0, output: 0 };
  if (peak?.enabled !== true) return { cacheHit: base.cacheHit, cacheMiss: base.cacheMiss, output: base.output };
  const effectiveAtMs = typeof peak.effectiveAtMs === "number" ? peak.effectiveAtMs : void 0;
  if (isPeakHour(atMs, effectiveAtMs, peak.windows)) {
    const p = base.peak;
    return p === void 0 ? { ...base } : { cacheHit: p.cacheHit, cacheMiss: p.cacheMiss, output: p.output };
  }
  if (effectiveAtMs !== void 0 && atMs >= effectiveAtMs) {
    const off = base.offPeak;
    return off === void 0 ? { ...base } : { cacheHit: off.cacheHit, cacheMiss: off.cacheMiss, output: off.output };
  }
  return { cacheHit: base.cacheHit, cacheMiss: base.cacheMiss, output: base.output };
}
function costOfBuckets(buckets, tier) {
  const input = Math.max(0, Number(buckets.input) || 0);
  const output = Math.max(0, Number(buckets.output) || 0);
  const cacheRead = Math.max(0, Number(buckets.cacheRead) || 0);
  const cacheWrite = Math.max(0, Number(buckets.cacheWrite) || 0);
  return (input * tier.cacheMiss + output * tier.output + (cacheRead + cacheWrite) * tier.cacheHit) / 1e6;
}
function formatMoneyValue(value, config) {
  const symbol = typeof config?.symbol === "string" && config.symbol.length > 0 ? config.symbol : "$";
  const decimals = Math.max(0, Math.min(10, Math.floor(Number(config?.decimals) || 2)));
  let effective = decimals;
  if (value > 0 && value < Math.pow(10, -decimals)) effective = decimals + 2;
  const fixed = value.toFixed(effective);
  const trimmed = fixed.includes(".") ? fixed.replace(/0+$/, "").replace(/\.$/, "") : fixed;
  return symbol + trimmed;
}
function formatMoneyUsd(usd, config) {
  const rate = Number(config?.exchangeRate);
  const value = usd * (Number.isFinite(rate) && rate > 0 ? rate : 1);
  return formatMoneyValue(value, config);
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
  const now = Date.now();
  const byModel = usage.byModel ?? {};
  let total = 0;
  for (const modelId of Object.keys(byModel)) {
    const entry = priceEntryFor(modelId, config.prices);
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
  total += costOfBuckets(leftover, tierFor(priceEntryFor("default", config.prices), now, peak));
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
      const t = makeT3(resolveLocale3(config.locale));
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
        t("cost", { amount: formatMoneyUsd2(cost, config) })
      ].join("; ");
      return el(
        Tooltip,
        { label: detail, side: "top", delayMs: 500 },
        el("div", { className: "dm-chip" }, t("cost", { amount: formatMoneyUsd2(cost, config) }))
      );
    }
    module2.exports = { UsageButton: UsageButton2, UsagePanel, SessionCost: SessionCost2 };
  }
});

// lib/client-src/settings.js
var require_settings = __commonJS({
  "lib/client-src/settings.js"(exports2, module2) {
    var { createElement: el, useState, useEffect } = require("react");
    var { Tooltip } = require("@deepseek-ai/dsh-client-ui-primitives");
    var { formatPlain: formatPlain2 } = (init_format(), __toCommonJS(format_exports));
    function delist(list) {
      const seen = /* @__PURE__ */ new Set();
      const out = [];
      for (const item of list) {
        if (seen.has(item.value)) continue;
        seen.add(item.value);
        out.push(item);
      }
      return out;
    }
    function FieldHint({ text }) {
      return el(
        Tooltip,
        { label: text, side: "top", delayMs: 400 },
        el("span", { className: "dm-hint", role: "img", "aria-label": text, tabIndex: 0 }, "?")
      );
    }
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
      const tItem = (field2) => t("item" + field2[0].toUpperCase() + field2.slice(1));
      const derivePreset = (id) => {
        const s = String(id ?? "").trim().toLowerCase();
        if (s === "deepseek-official" || s === "deepseek") return "deepseek";
        if (s.includes("opencode")) return "opencode";
        return "custom";
      };
      const preset = initial?.preset ? initial.preset : derivePreset(provider);
      const presetLabel = preset === "deepseek" ? t("presetDeepseek") : preset === "opencode" ? t("presetOpencode") : t("presetCustom");
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
      return el(
        "div",
        { className: "dm-editor" },
        el(
          "div",
          { className: "dm-editor-head" },
          el("span", { className: "dm-editor-title" }, initial !== null ? t("editProviderTitle") : t("addProviderTitle"))
        ),
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
        el("p", { className: "dm-note" }, t("presetLabel") + ": " + presetLabel),
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
              el("input", { className: "dm-input", "aria-label": t("headerKey"), placeholder: t("headerKey"), value: pair.key, onChange: (e) => updateHeader(i, "key", e.target.value) }),
              el("input", { className: "dm-input", "aria-label": t("headerValue"), placeholder: t("headerValue"), value: pair.value, onChange: (e) => updateHeader(i, "value", e.target.value) }),
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
                  field(tItem("key"), el("input", { className: "dm-input", type: "text", value: it.key, onChange: (e) => updateItem(i, "key", e.target.value) }), t("itemKeyHint")),
                  field(tItem("label"), el("input", { className: "dm-input", type: "text", value: it.label, onChange: (e) => updateItem(i, "label", e.target.value) }), t("itemLabelHint"))
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
                  field(tItem("path"), el("input", { className: "dm-input", type: "text", value: it.path, onChange: (e) => updateItem(i, "path", e.target.value) }), t("itemPathHint"))
                ),
                el(
                  "div",
                  { className: "dm-grid2" },
                  field(tItem("maxPath"), el("input", { className: "dm-input", type: "text", value: String(it.maxPath ?? ""), onChange: (e) => updateItem(i, "maxPath", e.target.value) }), t("itemMaxPathHint")),
                  field(tItem("resetsAtPath"), el("input", { className: "dm-input", type: "text", value: String(it.resetsAtPath ?? ""), onChange: (e) => updateItem(i, "resetsAtPath", e.target.value) }), t("itemResetsAtHint"))
                )
              ))
            ),
            el("button", { type: "button", className: "dm-btn ghost small", style: { alignSelf: "flex-start" }, onClick: () => setItems((list) => [...list, { key: "", label: "", kind: "percent", path: "", maxPath: "", resetsAtPath: "" }]) }, t("addItem"))
          )
        ),
        el(
          "div",
          { className: "dm-row-actions end" },
          el("button", { type: "button", className: "dm-btn ghost", onClick: onCancel }, t("cancel")),
          el("button", { type: "button", className: "dm-btn", onClick: submit, disabled: provider.trim().length === 0 || preset === "custom" && url.trim().length === 0 }, t("save"))
        )
      );
    }
    function ProvidersSection(props) {
      const { config, api, t, catalog } = props;
      const [adding, setAdding] = useState(false);
      const [editing, setEditing] = useState(null);
      const [busy, setBusy] = useState(false);
      const [notice, setNotice] = useState(null);
      const providerIds = Object.keys(config?.providers ?? {});
      const providerCandidates = delist([
        ...(catalog?.providers ?? []).map((p) => ({ value: p.id, label: p.name || p.id })),
        ...Object.keys(config?.providers ?? {}).map((id) => ({ value: id, label: id }))
      ]);
      const save = async (draft) => {
        setBusy(true);
        try {
          const providers = { ...config?.providers ?? {} };
          if (draft.provider.length === 0) return;
          if (editing === "new" && providers[draft.provider] !== void 0) {
            setNotice({ kind: "err", text: t("providerSaved", { id: draft.provider }) + " (exists)" });
            return;
          }
          const { provider, ...body } = draft;
          if (editing !== "new") delete providers[provider];
          providers[provider] = body;
          await api.updateConfig({ providers });
          setNotice({ kind: "ok", text: t("providersUpdated") });
          setAdding(false);
          setEditing(null);
        } catch (err) {
          setNotice({ kind: "err", text: t("saveFailed", { message: err?.message ?? String(err) }) });
        } finally {
          setBusy(false);
        }
      };
      const remove = async (providerId) => {
        setBusy(true);
        try {
          const providers = { ...config?.providers ?? {} };
          delete providers[providerId];
          await api.updateConfig({ providers });
          setNotice({ kind: "ok", text: t("providerRemoved", { id: providerId }) });
        } catch (err) {
          setNotice({ kind: "err", text: t("saveFailed", { message: err?.message ?? String(err) }) });
        } finally {
          setBusy(false);
        }
      };
      const toggle = async (providerId, enabled) => {
        try {
          const providers = { ...config?.providers ?? {} };
          if (providers[providerId] !== void 0) providers[providerId] = { ...providers[providerId], enabled };
          await api.updateConfig({ providers });
        } catch (err) {
          setNotice({ kind: "err", text: t("saveFailed", { message: err?.message ?? String(err) }) });
        }
      };
      return el(
        "div",
        { className: "dm-subsection" },
        el("h2", { className: "dm-h" }, t("providersTitle")),
        el("p", { className: "dm-intro" }, t("providersIntro")),
        notice !== null && el("p", { className: "dm-notice " + (notice.kind === "err" ? "err" : "ok") }, notice.text),
        el(
          "ul",
          { className: "dm-list" },
          providerIds.map((providerId) => {
            const provider = config.providers[providerId];
            const badge = provider.preset === "deepseek" ? t("presetDeepseek") : provider.preset === "opencode" ? t("presetOpencode") : t("presetCustom");
            if (editing === providerId) {
              return el("li", { key: providerId, style: { listStyle: "none" } }, el(ProviderForm, {
                initial: { ...provider, provider: providerId },
                onSave: save,
                onCancel: () => setEditing(null),
                t,
                options: providerCandidates
              }));
            }
            const meta = [
              t("refreshMinutes") + ": " + String(provider.refreshMinutes ?? 15)
            ];
            if (provider.preset === "opencode" && provider.apiKey) meta.push(t("apiKey") + ": ****");
            if (provider.preset === "custom" && provider.custom?.url) meta.push(provider.custom.url);
            return el(
              "li",
              { key: providerId, className: "dm-card" },
              el(
                "div",
                { className: "dm-card-head" },
                el("span", { className: "dm-card-name", title: providerId }, providerId, el("span", { className: "dm-tag" }, badge)),
                el(
                  "span",
                  { className: "dm-card-actions" },
                  el(
                    "label",
                    { className: "dm-switch", title: t("enabled") },
                    el("input", { type: "checkbox", checked: provider.enabled !== false, onChange: (e) => toggle(providerId, e.target.checked) })
                  ),
                  el("button", { type: "button", className: "dm-btn ghost small", onClick: () => setEditing(providerId), disabled: busy }, t("edit")),
                  el("button", { type: "button", className: "dm-btn danger small", onClick: () => remove(providerId), disabled: busy }, t("remove"))
                )
              ),
              el("p", { className: "dm-card-meta" }, meta.join(" \xB7 "))
            );
          })
        ),
        providerIds.length === 0 && !adding && editing === null && el("p", { className: "dm-empty" }, t("noProviders")),
        el(
          "div",
          { className: "dm-add-block" },
          adding && editing === "new" && el(ProviderForm, { key: "__new", initial: null, onSave: save, onCancel: () => {
            setAdding(false);
            setEditing(null);
          }, t, options: providerCandidates }),
          !adding && el("button", {
            type: "button",
            className: "dm-btn add",
            disabled: busy,
            onClick: () => {
              setAdding(true);
              setEditing("new");
            }
          }, t("addProvider"))
        )
      );
    }
    function PricesSection(props) {
      const { config, api, t, catalog } = props;
      const [draft, setDraft] = useState(() => ({
        models: Object.fromEntries(Object.entries(config?.prices?.models ?? {}).map(([id, p]) => [id, { ...p }])),
        default: { ...config?.prices?.default ?? { cacheHit: 0, cacheMiss: 0, output: 0 } }
      }));
      const [pickedModel, setPickedModel] = useState("");
      const [addingModel, setAddingModel] = useState(false);
      const [newHit, setNewHit] = useState("0");
      const [newMiss, setNewMiss] = useState("0");
      const [newOutput, setNewOutput] = useState("0");
      const [busy, setBusy] = useState(false);
      const [notice, setNotice] = useState(null);
      const [syncing, setSyncing] = useState(false);
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
        setDraft({
          models: Object.fromEntries(Object.entries(config?.prices?.models ?? {}).map(([id, p]) => [id, { ...p }])),
          default: { ...config?.prices?.default ?? { cacheHit: 0, cacheMiss: 0, output: 0 } }
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
        setBusy(true);
        try {
          await api.updateConfig({ prices: { models: draft.models, default: draft.default } });
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
      const tierLine = (tier) => {
        if (tier === void 0) return "\u2014";
        const n = (v) => formatPlain2(v, 4);
        return t("cacheHit") + " " + n(tier.cacheHit) + " \xB7 " + t("cacheMiss") + " " + n(tier.cacheMiss) + " \xB7 " + t("output") + " " + n(tier.output);
      };
      const numberInput = (modelId, field, label) => el("input", {
        className: "dm-input",
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
            const model = draft.models[modelId];
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
                  model.legacy === true && el("span", { className: "dm-price-legacy" }, t("legacy"))
                ),
                numberInput(modelId, "cacheHit", modelId + " " + t("cacheHit")),
                numberInput(modelId, "cacheMiss", modelId + " " + t("cacheMiss")),
                numberInput(modelId, "output", modelId + " " + t("output")),
                el("button", {
                  type: "button",
                  className: "dm-icon-btn danger",
                  "aria-label": t("remove") + " " + modelId,
                  onClick: () => removeModel(modelId)
                }, "\xD7")
              ),
              el(
                "details",
                { className: "dm-tier-details" },
                el("summary", { className: "dm-tier-summary" }, t("tiersLabel")),
                el(
                  "div",
                  { className: "dm-tier-grid" },
                  el("div", null, el("strong", null, t("offPeak")), tierLine(model.offPeak)),
                  el("div", null, el("strong", null, t("peak")), tierLine(model.peak)),
                  el("div", null, el("strong", null, t("legacyBase")), tierLine(model.legacyBase))
                )
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
                modelGroups.map((group) => el(
                  "optgroup",
                  { key: group.id, label: group.name },
                  group.models.map((m) => el("option", { key: group.id + ":" + m.id, value: m.id }, m.name && m.name !== m.id ? `${m.name} (${m.id})` : m.id))
                ))
              )
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
      const { useMonitor, api, t } = props;
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
        el(ProvidersSection, { config, api, t, catalog }),
        el(PricesSection, { config, api, t, catalog })
      );
    }
    module2.exports = { SettingsSection: SettingsSection2 };
  }
});

// lib/client-src/main.js
var { injectStyles: injectStyles2 } = (init_styles(), __toCommonJS(styles_exports));
var { MESSAGES: MESSAGES2, makeT: makeT2, resolveLocale: resolveLocale2 } = (init_i18n(), __toCommonJS(i18n_exports));
var { CONTRIBUTION: CONTRIBUTION2 } = (init_codecs(), __toCommonJS(codecs_exports));
var { UsageButton, SessionCost } = require_panel();
var { SettingsSection } = require_settings();
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
var BUILD_TAG = "18ab369";
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
  const store = makeStore({ status: "loading", error: null, config: null });
  const call = async (method, args) => {
    const result = await monitor[method](...args ?? []);
    if (result === null || typeof result !== "object" || result.ok !== true) {
      throw new Error(result?.error?.message ?? `monitor.${method} failed`);
    }
    return result.value;
  };
  let reloading = false;
  const reload = async () => {
    if (reloading) return;
    reloading = true;
    const prev = store.getSnapshot();
    try {
      const config = await call("getConfig");
      store.set({ status: "ready", error: null, config });
    } catch (error) {
      store.set({ status: "error", error: error?.message ?? String(error), config: prev.config });
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
      store.set({ status: "ready", error: null, config });
      return config;
    },
    getProviderUsage: async (providerId) => call("getProviderUsage", [providerId]),
    refreshProvider: async (providerId) => call("refreshProvider", [providerId]),
    listCatalog: async () => call("listCatalog"),
    fetchPrices: async () => {
      const result = await monitor.fetchPrices();
      if (result === null || typeof result !== "object" || result.ok !== true) {
        throw new Error(result?.error?.message ?? "monitor.fetchPrices failed");
      }
      if (result.value?.ok !== true) throw new Error(result.value.message || "sync failed");
      if (result.value.config !== void 0) {
        store.set({ status: "ready", error: null, config: result.value.config });
      }
      return result.value;
    }
  };
  void reload();
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
  const tOf = () => makeT2(resolveLocale2(store.getSnapshot().config?.locale));
  const injected = () => ({ api, providerOf, t: tOf(), hooks: { monitor: store } });
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
    const locale = resolveLocale2(store.getSnapshot().config?.locale);
    if (locale !== lastSectionLocale) {
      registerSection(locale);
      lastSectionLocale = locale;
    }
  };
  sync();
  const stopSync = store.subscribe(sync);
  return () => {
    stopSync();
  };
}
module.exports = { apply, inject };

Object.defineProperty(module.exports, Symbol.toStringTag, { value: 'Module' });
return module.exports;
}});
