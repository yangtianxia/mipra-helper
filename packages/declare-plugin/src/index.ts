import shell from 'shelljs'
import {
  definePlugin,
  processResolve,
  kleur,
} from '@mipra-helper/define-plugin'

import { DeclareTypes } from './declare-types'

export * from './declare-types'

interface TypesPluginOption {
  outputRoot?: string
  declare?: DeclareTypes[]
}

export default definePlugin<TypesPluginOption>(
  (ctx, option) => {
    option.outputRoot ||= 'types'
    option.declare ||= []

    const outputRoot = processResolve(
      ctx.initialConfig.outputRoot,
      option.outputRoot
    )

    function build() {
      if (!shell.test('-e', outputRoot)) {
        shell.mkdir('-p', outputRoot)
      }

      option.declare?.forEach(async (declare) => {
        const sourceString = await declare.output()
        if (sourceString) {
          shell
            .ShellString(sourceString)
            .to(processResolve(outputRoot, declare.fileName))
        }
      })
    }

    ctx.onBuildComplete(() => {
      build()
      ctx.logger('Build completed')
    })

    option.declare?.forEach((declare) => {
      if (declare.eventName) {
        ctx.register({
          name: declare.eventName,
          fn: async (opts: any) => {
            const sourceString = await declare.output()
            if (sourceString) {
              shell
                .ShellString(sourceString)
                .to(processResolve(outputRoot, declare.fileName))
            }
            ctx.logger(
              `Dependency ${kleur.white(declare.eventName!)} update ${kleur.blue(opts.path)}`
            )
          },
        })
      }
    })
  },
  {
    name: 'mipra-plugin-declare',
  }
)
