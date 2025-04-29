import {
  WatchFile,
  type WatchFileOption,
} from '@mipra-helper/define-plugin/watch-file'
import { type Compiler } from 'webpack'

interface PlatformWatchFileOption extends WatchFileOption {
  change: (compiler: Compiler) => void
  close?: () => void
}

export class PlatformWatchFilePlugin extends WatchFile {
  declare option: PlatformWatchFileOption

  constructor(option: PlatformWatchFileOption) {
    super(option)
  }

  override close() {
    this.option.close?.()
  }

  override update(compiler: Compiler) {
    this.option.change(compiler)
  }
}
