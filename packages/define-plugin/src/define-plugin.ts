import type { IPluginContext } from '@tarojs/service'
import kleur from 'kleur'
import dayjs from 'dayjs'
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

export interface PluginContext extends IPluginContext {
  nodeEnv: NodeEnv
  mipraEnv: MipraEnv
  mipraRoot: string
  outputPath: string
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

const hasRunnerPlugin = (ctx: PluginContext) => {
  const foundAt = Array.from(ctx.plugins.keys()).find((el) =>
    el.includes('@mipra-helper/runner-plugin')
  )
  if (foundAt) {
    const plugin = ctx.plugins.get(foundAt)
    return !!plugin?.opts.outputPlatform
  }
  return false
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
    const outputPath = hasRunnerPlugin(ctx)
      ? resolve(ctx.paths.outputPath, mipraEnv)
      : ctx.paths.outputPath

    ctx.nodeEnv = nodeEnv
    ctx.mipraEnv = mipraEnv
    ctx.mipraRoot = '.mipra'
    ctx.outputPath = outputPath
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
        ...args
      )
    }
    callback.apply(null, [ctx, option || {}])
  }
}
