import {
  definePlugin,
  processResolve,
  toJson,
  type MipraEnv,
} from '@mipra-helper/define-plugin'
import shell from 'shelljs'
import fs from 'fs-extra'
import extend from 'extend'
import { dotenv } from '@mipra-helper/env-plugin'

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
    option.monitor ??= true

    let merged = defaultMerged

    if (Reflect.has(mpCli, ctx.mipraEnv)) {
      merged = Reflect.get(mpCli, ctx.mipraEnv)
    }

    const configFileName = Reflect.get(configFileNameMap, ctx.mipraEnv)
    const configPath = processResolve(ctx.outputPath, configFileName)

    // 小程序单独配置
    const independentConfig = Reflect.get(option, ctx.mipraEnv)
    // 小程序全局配置
    const globalConfig = Reflect.get(option, 'global')

    const build = (callback?: () => void) => {
      if (!shell.test('-e', configPath)) {
        shell.touch(configPath)
        fs.writeFileSync(configPath, '{}')
      }

      // 私有配置
      const privateConfig = {} as Record<string, any>
      dotenv.forEach((key, value) => {
        if (Reflect.has(envVariableMap, key)) {
          const tempValue = Reflect.get(envVariableMap, key)
          Reflect.set(privateConfig, tempValue, value)
        }
      })

      try {
        // 读取小程序平台原始配置
        const tempValue = shell.cat(configPath)
        const origalConfig = toJson(tempValue)

        // 合并自定义配置
        const mergeConfig = extend(
          true,
          privateConfig,
          globalConfig,
          independentConfig
        )
        const finalConfig = extend(true, origalConfig, merged(mergeConfig))
        shell.ShellString(JSON.stringify(finalConfig, null, 2)).to(configPath)
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
      const mpConfigPath = processResolve(ctx.mipraRoot, ctx.mipraEnv)
      // 拷贝配置到指定小程序打包目录
      if (shell.test('-d', mpConfigPath)) {
        await fs.copy(mpConfigPath, ctx.outputPath, {
          overwrite: true,
        })
      }
      build(() => {
        ctx.logger('Build completed')
      })
    })

    ctx.modifyWebpackChain(({ chain }) => {
      if (ctx.isWatch) {
        chain
          .plugin('PlatformWatchFilePlugin')
          .use(PlatformWatchFilePlugin, [
            {
              monitor: option.monitor,
              path: processResolve(ctx.mipraRoot, ctx.mipraEnv),
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
    name: 'mipra-plugin-platform',
  }
)
