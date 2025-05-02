import {
  WatchFile,
  type WatchFileOption,
} from '@mipra-helper/define-plugin/watch-file'

interface PlatformWatchFileOption extends WatchFileOption {
  change: (path: string) => void
  close?: () => void
}

export class PlatformWatchFilePlugin extends WatchFile {
  declare option: PlatformWatchFileOption

  constructor(option: PlatformWatchFileOption) {
    super(option)
  }

  override name = 'platformWatchFilePlugin'

  override close() {
    this.option.close?.()
  }

  override update(path: string) {
    this.option.change(path)
  }
}
