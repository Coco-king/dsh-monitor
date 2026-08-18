/**
 * dsh-monitor 宿主插件入口。
 *
 * 单一 Loader 行(见 cordis.patch.yml)挂载本模块,职责:
 *  1. 打开/维护账本(SQLite 用量账本 + ledger.json 配置);
 *  2. 注入 `sessionPersistence`,定时 sweep 把会话日志事件折叠进 SQLite 账本
 *     (事实源 = 日志,库 = 可丢弃投影;增量续扫 + 历史回填);
 *  3. 注册 `costUsage` 会话投影(纯 token 桶 + 按模型拆分,客户端按价表计价);
 *  4. 提供 `monitor` 服务(手写 typertRemote 绑定,配合 ./typert 清单走
 *     Typert 网关):按提供方查询配置用量(DeepSeek 官方余额 / OpenCode Go 套餐
 *     额度 / 自定义 HTTP 用量)、用量汇总(getUsage)、配置与官方价格同步。
 *
 * 具体实现按职责拆在 ./projection.js(会话投影)、./monitor.js(monitor 服务)、
 * ./fold.js(会话事件折叠)、./queries.js(三类用量查询)、./messages.js(服务端文案)、
 * ./pricing.js(价格数学)、./store.js(账本)中;本文件只保留插件接线,并对外
 * re-export 公开 API(createService/queryGoQuota/queryBalance/queryCustom/jsonByPath)。
 *
 * 会话计费与价格逻辑移植自 dsh-cost-meter(MIT);sqlite 折叠架构借鉴
 * dsh-tokenledger(日志为事实、账本为投影)。不导入 cordis/dsh-* 运行时包中的
 * Service/Context 类:仅用 ctx API 与 Node 内建能力,因此与宿主进程共享同一套
 * 运行时实例;dsh-credentials 只用于凭证引用构造(credentialRef 为纯函数)。
 */

import { Ledger, normalizeProject } from './store.js'
import { makeCostUsageProjection } from './projection.js'
import { createService } from './monitor.js'

export const name = 'monitor'

// ── 插件主体 ───────────────────────────────────────────────────────────────

/**
 * 挂载账本、sweep、会话投影与 monitor 服务。
 * @param ctx - 宿主插件上下文。
 */
export function apply(ctx) {
  const ledger = Ledger.open()
  // console.log(`[dsh-monitor] 已加载,账本:${ledger.dbPath}`)

  // 卸载/退出前最终落盘。
  ctx.effect(() => () => ledger.close(), 'dsh-monitor: ledger close')

  // ── sweep:把会话日志折叠进 SQLite 账本(事实源 = 日志,库 = 投影) ─────────
  // 不在请求路径上;每 60s 增量续扫,未变会话跳过,历史可回填、重启不丢。
  // 任一会话失败只记日志,绝不拖垮宿主。
  let sweeping = false
  let lastSweepAt = 0
  const runSweep = async () => {
    if (sweeping) return undefined
    sweeping = true
    try {
      const persistence = ctx.get('sessionPersistence')
      if (persistence === undefined || typeof persistence.listSnapshots !== 'function') return undefined
      const snapshots = await persistence.listSnapshots()
      let scanned = 0
      let updated = 0
      for (const snapshot of snapshots ?? []) {
        const sessionId = snapshot?.header?.id ?? snapshot?.id
        if (sessionId === undefined) continue
        scanned += 1
        try {
          // 项目归属无条件回填(即使日志未变):项目是会话属性,老会话也要有行。
          ledger.setProject(sessionId, normalizeProject(snapshot?.header?.cwd))
          const revision = snapshot?.revision === undefined ? undefined : String(snapshot.revision)
          const progress = ledger.progressFor(sessionId)
          // 日志未变:不重读、不重写(增量续扫的便宜之处)。
          if (progress !== undefined && revision !== undefined && progress.logRevision === revision) continue
          const fromSeq = (progress?.consumedSeq ?? -1) + 1
          const { events } = await persistence.readFrom(sessionId, fromSeq)
          if ((events?.length ?? 0) > 0) {
            ledger.fold(sessionId, events, { logRevision: revision })
            updated += 1
          } else {
            // 无新事件但修订变了(罕见):仅推进进度。
            ledger.fold(sessionId, [], { logRevision: revision })
          }
        } catch (error) {
          ctx.logger?.warn?.(`[dsh-monitor] 会话 ${String(sessionId)} 折叠失败: ${String(error?.message ?? error)}`)
        }
      }
      lastSweepAt = Date.now()
      return { scanned, updated }
    } finally {
      sweeping = false
    }
  }
  ctx.provide('monitorSweeper', { runSweep, lastSweepAt: () => lastSweepAt })

  // 启动时先扫一轮(回填历史),之后每 60s 续扫。
  void runSweep()
  const sweepTimer = setInterval(() => void runSweep(), 60_000)
  sweepTimer.unref?.()
  ctx.effect(() => () => { clearInterval(sweepTimer) }, 'dsh-monitor: sweep timer')

  // costUsage 投影:向会话历史页/推送帧提供 token 桶(客户端计价)。
  ctx.inject(['sessionProjections'], (projectionCtx) => {
    projectionCtx.sessionProjections.register(makeCostUsageProjection(ledger))
  })

  // RPC 服务:客户端经 remote.monitor.* 调用(./typert 清单由 typert-loader 注册)。
  ctx.provide('monitor', createService(ctx, ledger, { sweepStats: () => ({ lastSweepAt }) }))
}

// 供单元测试直接驱动(生产 bundle 无需别处引用)。
export { createService } from './monitor.js'
export { queryGoQuota, queryBalance, queryCustom, jsonByPath } from './queries.js'
