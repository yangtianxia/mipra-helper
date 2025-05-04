import {
  definePlugin,
  processResolve,
  toJson,
  kleur,
} from '@mipra-helper/define-plugin'
import shell from 'shelljs'
import fs from 'fs-extra'
import { cosmiconfig, type PublicExplorer } from 'cosmiconfig'
import { TypeScriptLoader } from 'cosmiconfig-typescript-loader'
import { isNil, isFunction, isArray } from '@txjs/bool'
import { toArray, shallowMerge } from '@txjs/shared'

import { ConditionWatchFilePlugin } from './watch-file'
import { type ConditionOption } from './define-condition'
import { configFileNameMap, fieldNameMap } from './utils'

export * from './define-condition'

interface ConditionPluginOption {
  monitor?: boolean
}

export default definePlugin<ConditionPluginOption>(
  (ctx, option) => {
    option.monitor ??= ctx.isWatch

    const configFileName = Reflect.get(configFileNameMap, ctx.mipraEnv)
    const fields = Reflect.get(fieldNameMap, ctx.mipraEnv)
    const fieldKeys = Object.keys(fields)

    const configPath = processResolve(ctx.outputPath, configFileName)

    const transformer = (options: Record<string, any>) => {
      const newObject = {} as Record<string, any>
      fieldKeys.forEach((key) => {
        const name = Reflect.get(fields, key)
        const value = Reflect.get(options, key)
        if (name && value) {
          Reflect.set(newObject, name, value)
        }
      })
      return newObject
    }

    const getNodeEnv = (env?: string) => {
      switch (env) {
        case 'dev':
          return 'development'
        case 'prod':
          return 'production'
        default:
          return env
      }
    }

    const generate = (options: ConditionOption[]) => {
      const compiles = options
        .filter((el) => {
          const allEnv = isNil(el.env)
          const allMipra = isNil(el.mipra)

          if (allEnv && allMipra) {
            return true
          }

          const env = toArray(allEnv ? '*' : el.env).map(getNodeEnv)
          const mipra = toArray(allMipra ? '*' : el.mipra)

          return (
            (env.includes('*') || env.includes(ctx.nodeEnv)) &&
            (mipra.includes('*') || mipra.includes(ctx.mipraEnv))
          )
        })
        .map(transformer)

      switch (ctx.mipraEnv) {
        case 'alipay':
          return { modes: compiles }
        case 'weapp':
        case 'tt':
          return {
            condition: {
              miniprogram: { list: compiles },
            },
          }
      }
    }

    const conditionPath = processResolve('.conditionrc.ts')
    let explorer: PublicExplorer

    const readConfig = async (): Promise<ConditionOption[] | void> => {
      if (!shell.test('-e', conditionPath)) return

      if (!explorer) {
        explorer = cosmiconfig('condition', {
          searchPlaces: ['.conditionrc.ts'],
          loaders: {
            '.ts': TypeScriptLoader(),
          },
          stopDir: process.cwd(),
          cache: false,
        })
      }

      try {
        const result = await explorer.search()

        // 存在编译条件配置
        if (result) {
          let source: any
          if (isFunction(result.config)) {
            source = result.config()
          } else if (isArray(result.config)) {
            source = result.config
          }
          if (isArray(source)) {
            return source
          }
        }
      } catch (error) {
        ctx.warn(error)
      }
    }

    const build = async (callback?: () => void) => {
      if (!shell.test('-e', configPath)) {
        shell.touch(configPath)
        fs.writeFileSync(configPath, '{}')
      }

      const source = (await readConfig()) || []

      try {
        const compiles = generate(source)
        const tempValue = shell.cat(configPath)
        const origalConfig = toJson(tempValue)
        const finalConfig = shallowMerge({}, origalConfig, compiles)
        shell.ShellString(JSON.stringify(finalConfig, null, 2)).to(configPath)
        callback?.()
      } catch (error) {
        ctx.warn(error)
      }
    }

    ctx.onBuildComplete(async () => {
      build(() => {
        ctx.logger('Build completed')
      })
    })

    ctx.modifyWebpackChain(({ chain }) => {
      chain
        .plugin('conditionWatchFilePlugin')
        .use(ConditionWatchFilePlugin, [
          {
            monitor: option.monitor,
            path: processResolve('.conditionrc.ts'),
            change: (path: string) => {
              build(() => {
                ctx.logger(`Update ${kleur.blue(path)}`)
              })
            },
          },
        ])
        .end()
    })
  },
  {
    name: 'mipra-plugin-condition',
  }
)
