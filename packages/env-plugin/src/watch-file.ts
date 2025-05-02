import {
  WatchFile,
  type WatchFileOption,
} from '@mipra-helper/define-plugin/watch-file'
import { type Compiler } from 'webpack'
import { shallowMerge } from '@txjs/shared'
import { dotenv } from './dotenv'

interface EnvWatchFileOption extends WatchFileOption {
  change(path: string): void
  close?(): void
}

export class EnvWatchFilePlugin extends WatchFile {
  declare option: EnvWatchFileOption

  constructor(option: EnvWatchFileOption) {
    super(option)
  }

  override name = 'envWatchFilePlugin'

  override close() {
    this.option.close?.()
  }

  override update(path: string, compiler: Compiler) {
    compiler.options.plugins.forEach((plugin: any) => {
      if (plugin && plugin.constructor.name === 'DefinePlugin') {
        const definitions = plugin.definitions
        const envObject = dotenv.object()
        Object.keys(definitions).forEach((key) => {
          if (
            dotenv.startsWithKey(dotenv.formatKey(key)) &&
            !(key in envObject)
          ) {
            delete plugin.definitions[key]
          }
        })
        plugin.definitions = shallowMerge(plugin.definitions, envObject)
        this.option?.change(path)
      }
    })
  }
}
