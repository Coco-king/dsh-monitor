/**
 * dsh-monitor 客户端构建:把 lib/client-src/ 下的模块用 esbuild 打包回
 * 单个浏览器 bundle(lib/client.js)——DSH 的 module loader 只解析托管模块名,
 * 最终产物必须是一个文件;拆分后的相对 require 由本脚本内联。
 *
 * 装载包装:esbuild 无法静态内联「函数形参名为 require 的内部调用」,因此
 * 本脚本用 banner/footer 把打包结果整体包进
 * `window.__ModuleLoader__.load({ id:'dsh-monitor', factory:(require)=>… })`;
 * 产物中的外部 require(react 等)在运行时绑定到这个 factory 形参。
 *
 * 特性:
 *  - BUILD_TAG 按产物内容 sha1(前 7 位)注入(保留「确认热更生效」日志);
 *  - 自检:加载冒烟(桩 window/document/module-loader)+ 无相对 require 残留;
 *  - --watch:监听 client-src/ 增量重建(开发模式)。
 *
 * 用法:node scripts/build-client.mjs [--watch]
 */

import { createHash } from 'node:crypto'
import { writeFileSync } from 'node:fs'
import vm from 'node:vm'
import esbuild from 'esbuild'

const OUT = 'lib/client.js'
const TAG_SENTINEL = '__DSH_TAG__'
const ENTRY_ID = 'dsh-monitor'

/** 装载包装:banner 打开 load({factory:(require)=>…, footer 收尾并返回 module.exports。 */
const LOAD_BANNER = `${'window.__ModuleLoader__.load({ id: '}${JSON.stringify(ENTRY_ID)}, factory: (require) => {\nvar module = { exports: {} };`
const LOAD_FOOTER = `\nObject.defineProperty(module.exports, Symbol.toStringTag, { value: 'Module' });\nreturn module.exports;\n}});`

/** 公共打包参数:单文件 cjs(经 banner/footer 包进 loader factory),外部依赖保持为原位 require。 */
function bundleOptions(plugins) {
  return {
    entryPoints: ['lib/client-src/main.js'],
    outfile: OUT,
    bundle: true,
    format: 'cjs',
    platform: 'browser',
    target: ['es2020'],
    external: ['react', '@deepseek-ai/dsh-client-ui-primitives'],
    define: { __DSH_BUILD_TAG__: JSON.stringify(TAG_SENTINEL) },
    banner: { js: LOAD_BANNER },
    footer: { js: LOAD_FOOTER },
    write: false,
    logLevel: 'info',
    ...(plugins !== undefined ? { plugins } : {}),
  }
}

/** 输出文本 → 注入 BUILD_TAG + 落盘 + 自检。 */
function finalize(result) {
  const file = result.outputFiles.find(f => f.path === OUT || f.path.endsWith('/' + OUT))
  if (file === undefined) throw new Error('build: no output file')
  const text = file.text
  const tag = createHash('sha1').update(text).digest('hex').slice(0, 7)
  const out = text.replace(`"${TAG_SENTINEL}"`, JSON.stringify(tag))
  writeFileSync(OUT, out)
  smokeCheck(out, tag)
  console.log(`[build-client] ${OUT} written (BUILD_TAG ${tag})`)
}

/** 冒烟:语法 + 无相对 require 残留 + module-loader 桩加载 + 导出形状。 */
function smokeCheck(code, tag) {
  if (code.includes(tag) !== true) throw new Error('build: BUILD_TAG missing from output')
  if (/require\(["']\.\.?\//.test(code)) throw new Error('build: relative require left in bundle (esbuild 未内联)')

  let record = null
  const document = {
    querySelector: () => null,
    createElement: () => ({ dataset: {}, textContent: '' }),
    head: { appendChild: () => {} },
  }
  const fn = () => {}
  const sandbox = {
    console,
    window: { __ModuleLoader__: { load: rec => { record = rec } } },
    document,
    navigator: { language: 'zh-CN' },
    setTimeout, clearInterval, Symbol, Object, Array, String, Number, Boolean, Math, Date, JSON, Map, Set,
  }
  sandbox.globalThis = sandbox
  vm.createContext(sandbox)
  vm.runInContext(code, sandbox, { filename: OUT })

  if (record === null || record.id !== ENTRY_ID) throw new Error('build: module-loader record not registered')
  if (typeof record.factory !== 'function') throw new Error('build: factory missing')
  const moduleStub = new Proxy({}, { get: (target, key) => (key === Symbol.toStringTag ? 'Module' : fn) })
  const moduleExports = record.factory(spec => {
    if (spec === 'react' || spec === '@deepseek-ai/dsh-client-ui-primitives') return moduleStub
    throw new Error(`build: unexpected external require "${spec}"`)
  })
  if (Array.isArray(moduleExports.inject) !== true || moduleExports.inject.join(',') !== 'remote') {
    throw new Error('build: exports.inject wrong')
  }
  if (typeof moduleExports.apply !== 'function') throw new Error('build: exports.apply missing')
}

const watch = process.argv.includes('--watch')

if (watch) {
  const ctx = await esbuild.context(bundleOptions([{
    name: 'dsh-monitor-finalize',
    setup(build) {
      build.onEnd(result => {
        if (result.errors.length > 0) return
        try { finalize(result) } catch (error) { console.error('[build-client]', error.message) }
      })
    },
  }]))
  await ctx.watch()
  console.log('[build-client] watching lib/client-src/ …')
} else {
  finalize(await esbuild.build(bundleOptions()))
}