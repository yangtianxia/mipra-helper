import path from 'node:path'
import fs from 'fs-extra'
import minimist from 'minimist'
import { build, context, type BuildOptions, type Plugin } from 'esbuild'

enum ENUM_FORMAT {
  ESM = 'esm',
  CJS = 'cjs',
}

export interface BundleOptions {
  root?: boolean
  name: string
  filepath: string
  external?: string[]
}

const resolve = (...dir: string[]) => {
  return path.resolve(...dir)
}

const pkgPath = resolve(process.cwd(), 'package.json')

const ciArgs = minimist(process.argv.slice(2), {
  string: ['output', 'target', 'platform'],
  boolean: ['w', 't'],
})

const output = ciArgs.output || 'dist'
const target = ciArgs.target?.split(',') || []

const formatExt = (format: ENUM_FORMAT) => {
  switch (format) {
    case ENUM_FORMAT.ESM:
      return '.mjs'
    case ENUM_FORMAT.CJS:
    default:
      return '.js'
  }
}

export const finishLogger = (outfile: string) => {
  console.log('✅ Build finished:', outfile)
}

const bundle = async (format: ENUM_FORMAT, options: BundleOptions) => {
  const external = [] as string[]
  const ext = formatExt(format)

  let outfile = `${output}/`

  if (options.root) {
    outfile += `${options.name}.${format}${ext}`
  } else {
    outfile += `${options.name}${ext}`
  }

  const finish = () => {
    if (options.root) {
      finishLogger(outfile)
    }
  }

  if (!ciArgs.t) {
    if (options.external) {
      external.push(...options.external)
    }

    if (fs.pathExistsSync(pkgPath)) {
      const { dependencies, peerDependencies } = fs.readJSONSync(pkgPath)
      const ignoreDependencies = Object.assign(
        {},
        dependencies,
        peerDependencies
      )
      if (ignoreDependencies) {
        external.push(...Object.keys(ignoreDependencies))
      }
    }
  }

  const buildOptions: BuildOptions = {
    format,
    outfile,
    external,
    bundle: true,
    charset: 'utf8',
    target: ['chrome85', ...target],
    entryPoints: [`./src/${options.filepath}`],
  }

  if (ciArgs.platform) {
    buildOptions.platform = ciArgs.platform
  }

  if (ciArgs.w) {
    const loggerPlugin: Plugin = {
      name: 'loggerPlugin',
      setup(build) {
        build.onEnd(finish)
      },
    }
    const ctx = await context({
      ...buildOptions,
      plugins: [loggerPlugin],
    })
    await ctx.watch()
  } else {
    await build(buildOptions)
    finish()
  }
}

export async function builder(options: BundleOptions) {
  await bundle(ENUM_FORMAT.ESM, options)
  await bundle(ENUM_FORMAT.CJS, options)
}
