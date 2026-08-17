/**
 * dsh-monitor 宿主插件入口。
 *
 * 单一 Loader 行(见 cordis.patch.yml)挂载本模块,职责:
 *  1. 打开/维护账本($DSH_HOME/storages/dsh-monitor/ledger.json);
 *  2. 包裹 `llm/stream` 瀑布,捕获每次模型调用的 usage 块按官方价格计费(峰谷 + 历史基础价);
 *  3. 注册 `costUsage` 会话投影(纯 token 桶 + 按模型拆分,客户端按价表计价);
 *  4. 提供 `monitor` 服务(手写 typertRemote 绑定,配合 ./typert 清单走
 *     Typert 网关):按提供方查询配置用量(DeepSeek 官方余额 / OpenCode Go 套餐
 *     额度 / 自定义 HTTP 用量),以及配置与官方价格同步。
 *
 * 具体实现按职责拆在 ./projection.js(会话投影)、./monitor.js(monitor 服务)、
 * ./queries.js(三类用量查询)、./messages.js(服务端文案)、./pricing.js(价格数学)、
 * ./store.js(账本)中;本文件只保留插件接线,并对单元测试/外部调用方 re-export
 * 公开 API(createService/queryGoQuota/queryBalance/queryCustom/jsonByPath)。
 *
 * 会话计费与价格逻辑移植自 dsh-cost-meter(MIT);提供方用量查询为本插件自有。
 * 不导入 cordis/dsh-* 运行时包中的 Service/Context 类:仅用 ctx API 与 Node
 * 内建能力,因此与宿主进程共享同一套运行时实例;dsh-credentials 只用于
 * 凭证引用构造(credentialRef 为纯函数,无跨实例状态)。
 */

import { Ledger } from './store.js'
import { makeCostUsageProjection } from './projection.js'
import { createService } from './monitor.js'

export const name = 'monitor'

// ── 插件主体 ───────────────────────────────────────────────────────────────

/**
 * 挂载账本、llm/stream 计费包裹、会话投影与 monitor 服务。
 * @param ctx - 宿主插件上下文。
 */
export function apply(ctx) {
  const ledger = Ledger.open()
  console.log(`[dsh-monitor] 已加载,账本:${ledger.path}`)

  // 卸载/退出前最终落盘。
  ctx.effect(() => () => ledger.close(), 'dsh-monitor: ledger close')

  // 包裹 llm/stream:捕获 usage 块(位于 finish 之前),按价格表计入账本。
  // 本插件是链尾监听者,next() 即适配器流;仅透传数据块,不改变流协议。
  ctx.on('llm/stream', (options, next) => {
    const downstream = next()
    return (async function* monitorStream() {
      let usage = null
      try {
        for await (const chunk of downstream) {
          if (chunk !== null && chunk !== undefined && chunk.type === 'usage' && chunk.usage !== undefined) {
            usage = chunk.usage
          }
          yield chunk
        }
      } finally {
        if (usage !== null) {
          try {
            ledger.account({
              input: usage.inputTokens ?? 0,
              output: usage.outputTokens ?? 0,
              cacheRead: usage.cacheReadTokens ?? 0,
              cacheWrite: usage.cacheWriteTokens ?? 0,
            }, options?.model, options?.sessionId, Date.now())
          } catch (error) {
            ctx.logger?.warn?.(`[dsh-monitor] 计费失败: ${String(error)}`)
          }
        }
      }
    })()
  })

  // costUsage 投影:向会话历史页/推送帧提供 token 桶(客户端计价)。
  ctx.inject(['sessionProjections'], (projectionCtx) => {
    projectionCtx.sessionProjections.register(makeCostUsageProjection(ledger))
  })

  // RPC 服务:客户端经 remote.monitor.* 调用(./typert 清单由 typert-loader 注册)。
  ctx.provide('monitor', createService(ctx, ledger))
}

// 供单元测试直接驱动(生产 bundle 无需别处引用)。
export { createService } from './monitor.js'
export { queryGoQuota, queryBalance, queryCustom, jsonByPath } from './queries.js'