import { definePlugin, processResolve } from '@mipra-helper/define-plugin'
import { shallowMerge } from '@txjs/shared'

import { dotenv } from './dotenv'
import { EnvWatchFilePlugin } from './watch-file'

export * from './declare'

export { dotenv }

interface EnvPluginOption {
  monitor?: boolean
}

export default definePlugin<EnvPluginOption>(
  (ctx, option) => {
    option.monitor ??= true

    ctx.modifyWebpackChain(({ chain }) => {
      chain
        .plugin('definePlugin')
        .tap((args: any[]) => {
          shallowMerge(args[0], dotenv.object())
          return args
        })
        .end()

      if (ctx.isWatch) {
        chain
          .plugin('EnvWatchFilePlugin')
          .use(EnvWatchFilePlugin, [
            {
              monitor: option.monitor,
              path: processResolve('.env*'),
              change: () => {
                ctx.logger('Update completed')
              },
            },
          ])
          .end()
      }

      ctx.logger('Injection completed')
    })
  },
  {
    name: 'mipra-plugin-env',
  }
)
