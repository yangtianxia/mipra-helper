import {
  definePlugin,
  processResolve,
  kleur,
} from '@mipra-helper/define-plugin'
import fs from 'fs-extra'
import { cosmiconfig, type PublicExplorer } from 'cosmiconfig'
import { TypeScriptLoader } from 'cosmiconfig-typescript-loader'
import { isNil, isFunction, isArray } from '@txjs/bool'
import { toArray, shallowMerge } from '@txjs/shared'

import { ConditionWatchFilePlugin } from './watch-file'
import { type Option } from './define-config'
import { configFileNameMap, fieldNameMap } from './utils'

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
        let value = Reflect.get(options, key)

        // 抖音编译模式页面路径不支持 '/' 开头
        if (ctx.mipraEnv === 'tt') {
          if (key === 'page' && value) {
            value = value.slice(1)
          }
        }

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

    const generate = (options: Option[]) => {
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

    const loadConfig = async (): Promise<Option[] | void> => {
      if (!fs.pathExistsSync(conditionPath)) return

      if (!explorer) {
        explorer = cosmiconfig('condition', {
          stopDir: process.cwd(),
          cache: false,
          searchPlaces: ['.conditionrc.ts'],
          loaders: {
            '.ts': TypeScriptLoader({
              fsCache: 'node_modules/.cache/mipra',
              moduleCache: false,
            }),
          },
        })
      }

      try {
        const result = await explorer.search(process.cwd())

        if (result) {
          let config: any
          if (isFunction(result.config)) {
            config = result.config()
          } else if (isArray(result.config)) {
            config = result.config
          }
          if (isArray(config)) {
            return config
          }
        }
      } catch (error) {
        ctx.warn(error)
      }
    }

    const build = async (callback?: () => void) => {
      try {
        let tempCompiles: any
        if (fs.pathExistsSync(configPath)) {
          tempCompiles = fs.readJSONSync(configPath)
        }

        const compiles = generate((await loadConfig()) || [])
        const finalConfig = shallowMerge({}, tempCompiles, compiles)
        await fs.outputJSON(configPath, finalConfig, {
          spaces: 2,
        })
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
            path: conditionPath,
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
