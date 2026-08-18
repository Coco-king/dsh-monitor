/**
 * dsh-monitor 提供方 id 归一化：把 modlens 生成的「模型变体」提供方 id 映射回其
 * 本体提供方 id，两侧（服务端 monitor.ensureUsage 与客户端 providerOf）共用同一
 * 份规则，避免各自维护导致漂移。
 *
 * modlens 包装提供方 id 的约定（见 modlens repo wrapperIdEncodes）：
 *  - deepseek-modlens  → deepseek-official（历史保留 id）；
 *  - modlens-<upstream> → <upstream>（自动发现模式）。
 * 自定义 config.providerId（pinned 模式）不编码本体、无法反推，保持原样返回。
 */

/** modlens 变体提供方 id → 本体提供方 id；非变体原样返回。 */
export function baseProviderId(providerId) {
  if (providerId === 'deepseek-modlens') return 'deepseek-official'
  if (typeof providerId === 'string' && providerId.startsWith('modlens-')) {
    return providerId.slice('modlens-'.length)
  }
  return providerId
}
