import {
  definePlugin,
  processResolve,
  toJson,
} from '@mipra-helper/define-plugin'
import shell from 'shelljs'
import fs from 'fs-extra'
import { cosmiconfigSync } from 'cosmiconfig'
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
    option.monitor ??= true

    const configFileName = Reflect.get(configFileNameMap, ctx.mipraEnv)
    const fields = Reflect.get(fieldNameMap, ctx.mipraEnv)
    const fieldKeys = Object.keys(fields)

    const configPath = processResolve(ctx.outputPath, configFileName)

    const transformer = (option: Record<string, any>) => {
      return fieldKeys.reduce(
        (obj, key) => {
          const fieldKey = fields[key as keyof typeof fields]
          obj[fieldKey] = option[key]
          return obj
        },
        {} as Record<string, any>
      )
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

    const readConfig = (): ConditionOption[] | undefined => {
      if (shell.test('-e', processResolve('.conditionrc.ts'))) {
        try {
          const explorer = cosmiconfigSync('condition', {
            cache: false,
          })
          const result = explorer.load('.conditionrc.ts')

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
    }

    const build = (callback?: () => void) => {
      if (!shell.test('-e', configPath)) {
        shell.touch(configPath)
        fs.writeFileSync(configPath, '{}')
      }

      const source = readConfig() || []

      try {
        const compiles = generate(source)
        const tempValue = shell.cat(configPath)
        const origalConfig = toJson(tempValue)
        const finalConfig = shallowMerge(origalConfig, compiles)

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
      if (ctx.isWatch) {
        chain
          .plugin('ConditionWatchFilePlugin')
          .use(ConditionWatchFilePlugin, [
            {
              monitor: option.monitor,
              path: processResolve('.conditionrc.ts'),
              change: () => {
                build(() => {
                  ctx.logger('Update completed')
                })
              },
            },
          ])
          .end()
      }
    })
  },
  {
    name: 'mipra-plugin-condition',
  }
)
