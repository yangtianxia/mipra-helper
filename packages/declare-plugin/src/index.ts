import {
  definePlugin,
  processResolve,
  kleur,
} from '@mipra-helper/define-plugin'
import fs from 'fs-extra'
import { DeclareTypes } from './declare-types'
export * from './declare-types'

interface TypesPluginOption {
  outputDir?: string
  declare?: DeclareTypes[]
}

export default definePlugin<TypesPluginOption>(
  (ctx, option) => {
    option.outputDir ||= 'types'
    option.declare ||= []

    const outputRoot = processResolve(ctx.outputRoot, option.outputDir)

    function build() {
      try {
        if (!fs.existsSync(outputRoot)) {
          fs.mkdirSync(outputRoot)
        }

        option.declare?.forEach(async (declare) => {
          const sourceString = await declare.output(ctx)
          if (sourceString) {
            fs.outputFileSync(
              processResolve(outputRoot, declare.fileName),
              sourceString
            )
          }
        })
      } catch (error) {
        ctx.warn(error)
      }
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
            const sourceString = await declare.output(ctx)
            if (sourceString) {
              fs.outputFileSync(
                processResolve(outputRoot, declare.fileName),
                sourceString
              )
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
