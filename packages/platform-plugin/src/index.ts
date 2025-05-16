import {
  definePlugin,
  processResolve,
  kleur,
  type MipraEnv,
} from '@mipra-helper/define-plugin'
import { dotenv } from '@mipra-helper/env-plugin'
import fs from 'fs-extra'
import extend from 'extend'
import { notNil } from '@txjs/bool'

import { PlatformWatchFilePlugin } from './watch-file'
import AlipayConfigModify from './mp/alipay-config'
import AlipayCli from './mp/alipay'
import TtCli from './mp/tt'

import { envVariableMap, configFileNameMap } from './utils'

type MipraConfig = Record<string, any>

type MpConfig = Record<MipraEnv, MipraConfig>

interface PlatformPluginOption extends Partial<MpConfig> {
  monitor?: boolean
  global?: MipraConfig
}

const mpCli = {
  alipay: AlipayCli,
  tt: TtCli,
}

function defaultMerged(config: MipraConfig) {
  return config
}

export default definePlugin<PlatformPluginOption>(
  (ctx, option) => {
    option.monitor ??= ctx.isWatch

    let merged = defaultMerged
    let cacheConfig: Record<string, any>

    if (Reflect.has(mpCli, ctx.mipraEnv)) {
      merged = Reflect.get(mpCli, ctx.mipraEnv)
    }

    // 小程序项目配置原文件
    const mpConfigPath = processResolve(ctx.mipraRoot, ctx.mipraEnv)

    // 小程序项目配置
    const configFileName = Reflect.get(configFileNameMap, ctx.mipraEnv)
    const configPath = processResolve(ctx.outputPath, configFileName)

    // 小程序单独配置
    const independentConfig = Reflect.get(option, ctx.mipraEnv)
    // 小程序全局配置
    const globalConfig = Reflect.get(option, 'global')
    // 环境keys
    const envVariableKeys = Object.keys(envVariableMap)

    const getPrivateEnv = () => {
      const newObject = {} as Record<string, string>
      envVariableKeys.forEach((key) => {
        const name = Reflect.get(envVariableMap, key)
        const value = Reflect.get(dotenv.loadEnv(), key)
        if (notNil(value)) {
          Reflect.set(newObject, name, dotenv.formatValue(value))
        }
      })
      return newObject
    }

    const build = async (callback?: () => void) => {
      try {
        // 读取小程序平台原始配置
        let tempConfig: any
        if (fs.pathExistsSync(configPath)) {
          tempConfig = fs.readJSONSync(configPath)
        }

        // 私有配置
        cacheConfig = getPrivateEnv()
        // 合并自定义配置
        const mergeConfig = extend(
          true,
          {},
          cacheConfig,
          globalConfig,
          independentConfig
        )
        const finalConfig = extend(true, tempConfig, merged(mergeConfig))
        await fs.outputJSON(configPath, finalConfig, {
          spaces: 2,
        })
        callback?.()
      } catch (error) {
        ctx.warn(error)
      }
    }

    ctx.modifyMiniConfigs(({ configMap }) => {
      if (ctx.mipraEnv === 'alipay') {
        AlipayConfigModify(configMap)
      }
    })

    ctx.onBuildComplete(async () => {
      if (!fs.existsSync(mpConfigPath)) return

      try {
        await fs.copy(mpConfigPath, ctx.outputPath, {
          overwrite: true,
        })
        build(() => {
          ctx.logger('Build completed')
        })
      } catch (error) {
        ctx.warn(error)
      }
    })

    ctx.modifyWebpackChain(({ chain }) => {
      chain
        .plugin('platformWatchFilePlugin')
        .use(PlatformWatchFilePlugin, [
          {
            monitor: option.monitor,
            path: processResolve(ctx.mipraRoot, ctx.mipraEnv),
            change: (path: string) => {
              if (path.endsWith(configFileName)) {
                build(() => {
                  ctx.logger(`Update ${kleur.blue(path)}`)
                })
              }
            },
          },
        ])
        .end()
    })

    ctx.register({
      name: 'onEnvUpdate',
      fn: (opts: any) => {
        const newCacheConfig = getPrivateEnv()
        if (JSON.stringify(newCacheConfig) !== JSON.stringify(cacheConfig)) {
          build(() => {
            ctx.logger(`Dependency env update ${kleur.blue(opts.path)}`)
          })
          cacheConfig = newCacheConfig
        }
      },
    })
  },
  {
    name: 'mipra-plugin-platform',
  }
)
