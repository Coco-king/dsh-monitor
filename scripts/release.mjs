/**
 * dsh-monitor 版本发布脚本:升版本 → 同步 README 安装版本号 → 打 tag → 推送。
 *
 * 用法:
 *   npm run release -- <X.Y.Z>              # 正式发布(commit + tag vX.Y.Z + push)
 *   npm run release -- <X.Y.Z> --dry-run    # 预演:只打印计划,不改文件、不推送
 *
 * 约定:
 *   - 唯一版本源 = package.json 的 version;tag 恒为 vX.Y.Z。
 *   - README 安装命令(GitHub / Gitee 两行)里的版本号由本脚本强制重写,
 *     保证「README 展示的版本 = 最新发布 tag」。
 *   - 仅当用户明确要求升版本时才运行本脚本,AI 代理不得自行调用。
 *
 * 步骤:校验(分支 / 工作区 / 版本递增)→ npm test + build:client → 同步
 * package.json / package-lock.json 版本 → 重写两份 README → commit → tag → push。
 * 任一步失败即中断,不产生半成品 commit/tag。
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const PKG_PATH = join(ROOT, 'package.json')
const LOCK_PATH = join(ROOT, 'package-lock.json')
const README_PATHS = ['README.md', 'README.zh-CN.md']
const DEFAULT_BRANCH = 'master'

/** 安装命令里的 git URL(仓库定名 dsh-monitor.git,允许已带旧 #v 后缀)。 */
const INSTALL_URL_RE = /(https:\/\/(?:github\.com|gitee\.com)\/[^\s#]*?dsh-monitor\.git)(?:#[^\s]+)?/g

/**
 * 纯函数:把文本里所有 dsh-monitor 安装 URL 的版本号钉为新版本;无号则插入。
 * 幂等:已钉旧版本 → 换成新版本;裸 URL → 追加 `#vX.Y.Z`。
 * @param text - README 全文。
 * @param version - 语义化版本(如 '0.1.1')。
 * @returns 重写后的文本。
 */
export function rewriteInstallVersions(text, version) {
  const pin = `#v${version}`
  return text.replace(INSTALL_URL_RE, (whole, base) => `${base}${pin}`)
}

/** 语义化版本解析;非法返回 null。 */
export function parseVersion(text) {
  if (!/^\d{1,4}\.\d{1,4}\.\d{1,4}$/.test(text)) return null
  const [major, minor, patch] = text.split('.').map(Number)
  return { major, minor, patch, text }
}

/** a 是否严格新于 b(两者均为 parseVersion 结果)。 */
export function isNewerVersion(a, b) {
  return a.major > b.major
    || (a.major === b.major && a.minor > b.minor)
    || (a.major === b.major && a.minor === b.minor && a.patch > b.patch)
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`)
}

function exec(cmd, args, { silent = false } = {}) {
  const result = spawnSync(cmd, args, {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: silent ? ['ignore', 'pipe', 'pipe'] : 'inherit',
  })
  if (result.error !== undefined) throw result.error
  if (result.status !== 0) {
    const detail = silent && result.stderr ? `: ${result.stderr.trim()}` : ''
    throw new Error(`${cmd} ${args.join(' ')} failed (exit ${result.status})${detail}`)
  }
  return (result.stdout ?? '').trim()
}

const git = (args, opts) => exec('git', args, opts)
const npm = (args, opts) => exec('npm', args, opts)

function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const versionArg = args.find(a => !a.startsWith('--'))
  const target = parseVersion(versionArg ?? '')
  if (target === null) {
    throw new Error('用法:npm run release -- <X.Y.Z> [--dry-run](如 0.1.1)')
  }

  const currentVersion = readJson(PKG_PATH).version
  const current = parseVersion(currentVersion)
  if (current === null) throw new Error(`package.json 版本非法:${currentVersion}`)
  if (!isNewerVersion(target, current)) {
    throw new Error(`新版本 ${target.text} 必须严格高于当前版本 ${current.text}`)
  }

  const branch = git(['rev-parse', '--abbrev-ref', 'HEAD'], { silent: true })
  if (branch !== DEFAULT_BRANCH) throw new Error(`仅允许在 ${DEFAULT_BRANCH} 分支发版(当前分支 ${branch})`)
  const dirty = git(['status', '--porcelain'], { silent: true })
  if (dirty !== '') throw new Error(`工作区不干净,发版需先提交或清理:\n${dirty}`)

  const tag = `v${target.text}`

  // ── README 重写计划(先算好,便于 dry-run 展示与核对) ──────────────────────
  const readmeEdits = README_PATHS.map(name => {
    const path = join(ROOT, name)
    const before = readFileSync(path, 'utf8')
    const after = rewriteInstallVersions(before, target.text)
    const hits = (before.match(INSTALL_URL_RE) ?? []).length
    if (hits === 0) console.warn(`[release] 警告:${name} 中没有匹配到安装 URL,未改动`)
    return { name, after, changed: after !== before }
  })

  console.log(`\n== 发布计划 v${target.text} ==`)
  console.log(`  分支:${branch}  版本:${current.text} → ${target.text}  tag:${tag}`)
  for (const edit of readmeEdits) {
    console.log(`  ${edit.name}:${edit.changed ? ' 已更新安装版本号' : ' 无改动'}`)
    for (const line of edit.after.split('\n')) {
      if (/dsh plugin --profile web add .*dsh-monitor\.git#/.test(line)) console.log(`    ${line.trim()}`)
    }
  }
  console.log(`  提交:release: ${tag}  推送:origin ${DEFAULT_BRANCH} + tag ${tag}\n`)

  if (dryRun) {
    console.log('[release] --dry-run 预演完成,未做任何修改。')
    return
  }

  // ── 真实流程:测试 → 构建 → 同步版本 → 重写 README → commit → tag → push ──
  npm(['test'])
  npm(['run', 'build:client'])

  const pkg = readJson(PKG_PATH)
  pkg.version = target.text
  writeJson(PKG_PATH, pkg)

  const lock = readJson(LOCK_PATH)
  lock.version = target.text
  if (lock.packages?.[''] !== undefined) lock.packages[''].version = target.text
  writeJson(LOCK_PATH, lock)

  for (const edit of readmeEdits) writeFileSync(join(ROOT, edit.name), edit.after)

  git(['add', 'package.json', 'package-lock.json', ...README_PATHS])
  git(['commit', '-m', `release: ${tag}`])
  git(['tag', tag])
  git(['push', 'origin', DEFAULT_BRANCH])
  git(['push', 'origin', tag])

  console.log(`[release] 已发布 ${tag}(commit + tag + push 完成)。`)
  console.log(`用户安装命令:`)
  console.log(`  dsh plugin --profile web add https://github.com/Coco-king/dsh-monitor.git#${tag}`)
  console.log(`  dsh plugin --profile web add https://gitee.com/kkcoco/dsh-monitor.git#${tag}`)
}

const isMain = process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href
if (isMain) {
  try {
    main()
  } catch (error) {
    console.error(`[release] ${error.message}`)
    process.exitCode = 1
  }
}
