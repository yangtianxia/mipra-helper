import {
  WatchFile,
  type WatchFileOption,
} from '@mipra-helper/define-plugin/watch-file'
import { type Compiler } from 'webpack'

interface ConditionWatchFileOption extends WatchFileOption {
  change: (compiler: Compiler) => void
  close?: () => void
}

export class ConditionWatchFilePlugin extends WatchFile {
  declare option: ConditionWatchFileOption

  constructor(option: ConditionWatchFileOption) {
    super(option)
  }

  override close() {
    this.option.close?.()
  }

  override update(compiler: Compiler) {
    this.option.change(compiler)
  }
}
