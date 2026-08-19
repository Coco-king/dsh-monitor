import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createSweepReporter } from '../lib/index.js'

test('sweep reporter: 非 TTY 下打印开始行,按 20% 分段汇报,并输出完成行', () => {
  const lines = []
  const reporter = createSweepReporter({ total: 50, isTTY: false, line: s => lines.push(s) })
  reporter.start()
  reporter.update(0)
  reporter.update(10)
  reporter.update(20)
  reporter.update(25)
  reporter.update(45)
  reporter.update(50)
  reporter.finish(48, 1234)
  const text = lines.join('\n')
  assert.ok(text.includes('50 个会话待全量同步'))
  assert.ok(text.includes('0/50 (0%)'))
  assert.ok(text.includes('10/50 (20%)'))
  assert.ok(text.includes('20/50 (40%)'))
  assert.ok(text.includes('45/50 (90%)'))
  assert.ok(text.includes('50/50 (100%)'))
  assert.ok(!text.includes('(30%)') && !text.includes('(50%)') && !text.includes('(60%)'))
  assert.ok(text.includes('全量同步完成'))
  assert.ok(text.includes('回填/更新 48 个'))
  assert.ok(text.includes('1.2s'))
})

test('sweep reporter: TTY 下用 \\r 单行重绘进度条,完成时清行', () => {
  const prints = []
  const lines = []
  const reporter = createSweepReporter({ total: 100, isTTY: true, print: s => prints.push(s), line: s => lines.push(s) })
  reporter.start()
  reporter.update(25)
  reporter.update(100)
  reporter.finish(90, 500)
  assert.ok(prints.some(s => s.startsWith('\r[dsh-monitor] 全量同步 [') && s.includes('█') && s.includes('░')))
  assert.ok(prints[prints.length - 1].startsWith('\r' + ' '.repeat(72)))
  // TTY 下只输出开始行 + 完成行,没有中间的 20% 分段日志(进度条走 \r 重绘)。
  assert.equal(lines.length, 2)
  assert.ok(lines[1].includes('全量同步完成'))
})

test('sweep reporter: total=0 时视作完成,不除零', () => {
  const lines = []
  const reporter = createSweepReporter({ total: 0, isTTY: false, line: s => lines.push(s) })
  reporter.update(0)
  reporter.finish(0, 0)
  assert.ok(lines.join('\n').includes('(100%)'))
})
