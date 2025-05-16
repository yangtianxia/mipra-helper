import {
  WatchFile,
  type WatchFileOption,
} from '@mipra-helper/define-plugin/watch-file'

interface ThemeWatchFileOption extends WatchFileOption {
  change: (path?: string) => void
  close?: () => void
}

export class ThemeWatchFilePlugin extends WatchFile {
  declare option: ThemeWatchFileOption

  constructor(option: ThemeWatchFileOption) {
    super(option)
  }

  override name = 'themeWatchFilePlugin'

  override close() {
    this.option.close?.()
  }

  override update(path: string) {
    this.option.change(path)
  }
}
