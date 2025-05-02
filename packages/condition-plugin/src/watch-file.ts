import {
  WatchFile,
  type WatchFileOption,
} from '@mipra-helper/define-plugin/watch-file'

interface ConditionWatchFileOption extends WatchFileOption {
  change: (path: string) => void
  close?: () => void
}

export class ConditionWatchFilePlugin extends WatchFile {
  declare option: ConditionWatchFileOption

  constructor(option: ConditionWatchFileOption) {
    super(option)
  }

  override name = 'conditionWatchFilePlugin'

  override close() {
    this.option.close?.()
  }

  override update(path: string) {
    this.option.change(path)
  }
}
