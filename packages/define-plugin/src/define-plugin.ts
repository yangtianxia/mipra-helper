import type { IPluginContext } from '@tarojs/service'
import kleur from 'kleur'
import dayjs from 'dayjs'
import path from 'node:path'
import { toArray, noop } from '@txjs/shared'
import { isNil } from '@txjs/bool'
import {
  getNodeEnv,
  getMipraEnv,
  resolve,
  isWatch,
  type MipraEnv,
  type NodeEnv,
} from './utils'

export { kleur }

export interface PluginContext extends IPluginContext {
  nodeEnv: NodeEnv
  mipraEnv: MipraEnv
  mipraRoot: string
  outputPath: string
  outputRoot: string
  isWatch: boolean
  logger(text: string): void
  warn(...args: any): void
}

interface Rule {
  test: RegExp
  message: string
}

interface DefinePluginOption {
  name?: string
  include?: MipraEnv[]
  rules?: Record<string, Rule | Rule[]>
}

type DefinePluginCallback<T> = (ctx: PluginContext, option: T) => void

const WHITE_LIST = ['weapp', 'tt', 'alipay'] as MipraEnv[]

let id = 0

const validator = <T extends Record<string, any>>(
  name: string,
  rules: Record<string, Rule | Rule[]>,
  values: T
) => {
  if (values) {
    const keys = Object.keys(values)
    for (const key of keys) {
      if (Reflect.has(rules, key)) {
        const value = values[key]
        const rule = toArray(rules[key])
        const err = rule.find((item) => !item.test.test(value))
        if (err) {
          throw new Error(`⚠️ [${name}] ${key}: ${err.message}`)
        }
      }
    }
  }
}

const getOutputPath = (ctx: PluginContext) => {
  let flag = false
  const target = Array.from(ctx.plugins.keys()).find((el) =>
    el.includes('@mipra-helper/runner-plugin')
  )
  if (target) {
    const plugin = ctx.plugins.get(target)
    flag = !!plugin?.opts.outputPlatform
  }
  if (
    flag &&
    !ctx.initialConfig.outputRoot?.endsWith(ctx.mipraEnv) &&
    !ctx.initialConfig.outputRoot?.endsWith(ctx.nodeEnv)
  ) {
    return `${ctx.initialConfig.outputRoot}/${ctx.mipraEnv}`
  }
  return ctx.paths.outputPath
}

export function definePlugin<T extends Record<string, any>>(
  callback: DefinePluginCallback<T>,
  option: DefinePluginOption = {}
): DefinePluginCallback<T> {
  const nodeEnv = getNodeEnv()
  const mipraEnv = getMipraEnv()
  const includeEnv = [...WHITE_LIST].concat(...(option.include || []))

  if (isNil(mipraEnv) || isNil(nodeEnv) || !includeEnv.includes(mipraEnv)) {
    return noop
  }

  id += 1

  const { name = `unknown-plugin-${id}`, rules = {} } = option

  return (ctx, option) => {
    validator(name, rules, option)

    const outputPath = getOutputPath(ctx)
    const rootParse = path.parse(ctx.initialConfig.outputRoot!)

    ctx.nodeEnv = nodeEnv
    ctx.mipraEnv = mipraEnv
    ctx.mipraRoot = '.mipra'
    ctx.outputPath = outputPath
    ctx.outputRoot = resolve(rootParse.dir || rootParse.name)
    ctx.isWatch = isWatch()
    ctx.logger = (text: string) => {
      console.log(
        kleur.green(`✔ [${name}]`),
        '\n',
        kleur.gray(`→ ${text} [${dayjs().format('YYYY/MM/DD HH:mm:ss')}]`),
        '\n'
      )
    }
    ctx.warn = (...args: any[]) => {
      console.log(
        kleur.red(`⚠️ [${name}]`),
        '\n',
        kleur.gray(`→ Warning... [${dayjs().format('YYYY/MM/DD HH:mm:ss')}]`),
        '\n',
        ...args,
        '\n'
      )
    }
    callback.apply(null, [ctx, option || {}])
  }
}
