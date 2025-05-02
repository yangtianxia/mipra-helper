import {
  definePlugin,
  processResolve,
  kleur,
} from '@mipra-helper/define-plugin'
import { shallowMerge } from '@txjs/shared'

import { dotenv } from './dotenv'
import { EnvWatchFilePlugin } from './watch-file'

export { dotenv }

interface EnvPluginOption {
  monitor?: boolean
}

export default definePlugin<EnvPluginOption>(
  (ctx, option) => {
    option.monitor ??= ctx.isWatch

    ctx.modifyWebpackChain(({ chain }) => {
      chain
        .plugin('definePlugin')
        .tap((args: any[]) => {
          shallowMerge(args[0], dotenv.object())
          return args
        })
        .end()

      chain
        .plugin('envWatchFilePlugin')
        .use(EnvWatchFilePlugin, [
          {
            monitor: option.monitor,
            path: processResolve('.env*'),
            change: (path: string) => {
              ctx.logger(`Update injection ${kleur.blue(path)}`)
              ctx.applyPlugins({
                name: 'onEnvUpdate',
                opts: { path },
              })
            },
          },
        ])
        .end()
    })
  },
  {
    name: 'mipra-plugin-env',
  }
)
