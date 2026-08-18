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
  '.dm-panel{position:absolute;right:0;bottom:calc(100% + 8px);z-index:60;width:320px;max-width:calc(100vw - 32px);box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2-darkmode-thin);border-radius:12px;background:var(--dsw-specific-input-major);box-shadow:var(--dsw-shadow-lv2);padding:12px;font-size:13px;line-height:20px;color:var(--dsw-alias-label-primary)}',
  '.dm-panel-head{display:flex;align-items:center;gap:8px;margin-bottom:10px}',
  '.dm-panel-title{flex:1;min-width:0;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
  '.dm-preset{flex:none;font-size:11px;font-weight:500;color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-layer-2);border-radius:6px;padding:0 6px;height:18px;line-height:18px}',
  '.dm-items{display:flex;flex-direction:column;gap:10px}',
  '.dm-row{display:flex;align-items:center;gap:8px;font-size:12px}',
  '.dm-label{flex:none;width:auto;min-width:56px;color:var(--dsw-alias-label-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
  '.dm-bar{flex:1;height:6px;border-radius:3px;background:var(--dsw-alias-interactive-bg-hover);overflow:hidden}',
  '.dm-fill{height:100%;border-radius:3px;background:var(--dsw-alias-brand-primary)}',
  '.dm-fill.warn{background:var(--dsw-alias-state-warn-primary)}',
  '.dm-fill.over{background:var(--dsw-alias-state-error-primary)}',
  '.dm-num{flex:none;min-width:52px;text-align:right;font-weight:600;font-variant-numeric:tabular-nums}',
  '.dm-reset{font-size:11px;color:var(--dsw-alias-label-tertiary);padding-left:64px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
  '.dm-msg{font-size:12px;line-height:18px;border-radius:8px;padding:8px 10px;margin-bottom:8px}',
  '.dm-msg.err{color:var(--dsw-alias-state-error-primary);background:var(--dsw-alias-interactive-bg-hover-danger)}',
  '.dm-msg.off,.dm-empty{color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-interactive-bg-hover);border-radius:8px;padding:8px 10px;font-size:12px}',
  '.dm-panel-foot{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:10px;font-size:11px;color:var(--dsw-alias-label-tertiary);border-top:1px solid var(--dsw-alias-border-l1);padding-top:8px}',
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
  // 价格数字输入:去掉浏览器上下箭头,宽度由列约束。
  '.dm-num::-webkit-outer-spin-button,.dm-num::-webkit-inner-spin-button{-webkit-appearance:none;appearance:none;margin:0}',
  '.dm-num{-moz-appearance:textfield;appearance:textfield}',

  // ── 响应式 ───────────────────────────────────────────────────────────────
  '@media (max-width:640px){.dm-grid2,.dm-grid3{grid-template-columns:1fr}.dm-price-caption{display:none}.dm-price-fields{grid-template-columns:1fr 1fr}.dm-price-fields .dm-price-name{grid-column:1/-1}.dm-tier-row{grid-template-columns:1fr 1fr}}',
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