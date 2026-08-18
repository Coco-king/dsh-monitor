import { test } from 'node:test'
import assert from 'node:assert/strict'
import { isNewerVersion, parseVersion, rewriteInstallVersions } from '../scripts/release.mjs'

test('release:parseVersion 合法语义版本', () => {
  assert.deepEqual(parseVersion('0.1.1'), { major: 0, minor: 1, patch: 1, text: '0.1.1' })
  assert.deepEqual(parseVersion('1.2.30'), { major: 1, minor: 2, patch: 30, text: '1.2.30' })
})

test('release:parseVersion 拒绝非法输入', () => {
  assert.equal(parseVersion(''), null)
  assert.equal(parseVersion('1.2'), null)
  assert.equal(parseVersion('v1.2.3'), null)
  assert.equal(parseVersion('1.2.3-beta'), null)
  assert.equal(parseVersion('1.2.x'), null)
})

test('release:isNewerVersion 严格递增', () => {
  const v = t => parseVersion(t)
  assert.equal(isNewerVersion(v('0.1.1'), v('0.1.0')), true)
  assert.equal(isNewerVersion(v('1.0.0'), v('0.9.9')), true)
  assert.equal(isNewerVersion(v('0.1.0'), v('0.1.0')), false)
  assert.equal(isNewerVersion(v('0.1.0'), v('0.1.1')), false)
  assert.equal(isNewerVersion(v('0.2.0'), v('1.0.0')), false)
})

test('release:rewriteInstallVersions 无号时给 GitHub/Gitee 两行插入钉定版本', () => {
  const before = [
    'dsh plugin --profile web add https://github.com/Coco-king/dsh-monitor.git  # GitHub',
    'dsh plugin --profile web add https://gitee.com/kkcoco/dsh-monitor.git      # Gitee',
  ].join('\n')
  const after = rewriteInstallVersions(before, '0.1.1')
  assert.ok(after.includes('https://github.com/Coco-king/dsh-monitor.git#v0.1.1'))
  assert.ok(after.includes('https://gitee.com/kkcoco/dsh-monitor.git#v0.1.1'))
})

test('release:rewriteInstallVersions 旧钉替成新钉(GitHub/Gitee 都换)', () => {
  const before = [
    'dsh plugin --profile web add https://github.com/Coco-king/dsh-monitor.git#v0.1.0  # GitHub',
    'dsh plugin --profile web add https://gitee.com/kkcoco/dsh-monitor.git#v0.1.0      # Gitee',
  ].join('\n')
  const after = rewriteInstallVersions(before, '0.2.3')
  assert.ok(after.includes('#v0.2.3'))
  assert.ok(!after.includes('v0.1.0'))
  assert.ok(!after.includes('.git#v0.2.3#'))
})

test('release:rewriteInstallVersions 幂等且不误伤其他内容', () => {
  const before = [
    'Iterating: re-run `dsh plugin --profile web add <this repo path>` after changes.',
    'Source: https://github.com/Han-1413141/dsh-cost-meter (MIT).',
  ].join('\n')
  const after = rewriteInstallVersions(before, '0.1.1')
  assert.equal(after, before)
})
