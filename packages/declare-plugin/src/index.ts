import shell from 'shelljs'
import { format } from 'prettier'
import { isPlainObject } from '@txjs/bool'
import { definePlugin, processResolve } from '@mipra-helper/define-plugin'
import type { DefineDeclare } from './utils'

export * from './utils'
export * from './icons'

interface TypesPluginOption {
  outputRoot?: string
  declare?: DefineDeclare[]
}

export default definePlugin<TypesPluginOption>(
  (ctx, option) => {
    option.outputRoot ||= 'types'
    option.declare ||= []

    const declare = option.declare
    const outputRoot = processResolve(
      ctx.initialConfig.outputRoot,
      option.outputRoot
    )

    let created = false

    function generate() {
      if (!shell.test('-e', outputRoot)) {
        shell.mkdir('-p', outputRoot)
      }

      declare
        .map((generate) => generate())
        .filter(isPlainObject)
        .forEach(async (config) => {
          shell
            .ShellString(
              await format(config.sourceString, {
                parser: 'typescript',
                semi: false,
                tabWidth: 2,
                useTabs: false,
                singleQuote: true,
                printWidth: 80,
                endOfLine: 'auto',
              })
            )
            .to(processResolve(outputRoot, config.fileName))
        })
    }

    ctx.onBuildComplete(() => {
      generate()
      created = true
      ctx.logger('Build completed')
    })

    ctx.onBuildFinish(() => {
      if (created) {
        generate()
        ctx.logger('Update completed')
      }
    })
  },
  {
    name: 'mipra-plugin-declare',
  }
)
