import { watch, type FSWatcher } from 'chokidar'
import { throttle } from 'throttle-debounce'
import { type Compiler } from 'webpack'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { glob } from 'glob'

export interface WatchFileOption {
  monitor: boolean
  path: string
}

export abstract class WatchFile {
  #cache: Map<string, string> = new Map()

  watcher: FSWatcher | null = null

  option: WatchFileOption

  constructor(option: WatchFileOption) {
    this.option = option
  }

  #getHash(path: string) {
    const buffer = readFileSync(path)
    return createHash('sha256').update(buffer).digest('hex')
  }

  async #initWatch() {
    if (this.option.monitor && !this.watcher) {
      this.watcher = watch(await glob(this.option.path), {
        ignored: 'node_modules/**',
        persistent: true,
        ignoreInitial: true,
        usePolling: true,
        cwd: process.cwd(),
      })
    }
  }

  #watch(compiler: Compiler) {
    if (this.watcher) {
      const watchFn = throttle(
        200,
        (event: string, path: string) => {
          if (event === 'unlink') {
            this.#cache.delete(path)
            this.update(compiler)
          } else if (event === 'unlinkDir') {
            Array.from(this.#cache.values()).forEach((el) => {
              if (el.startsWith(path)) {
                this.#cache.delete(el)
              }
            })
            this.update(compiler)
          } else {
            const cache = this.#cache.get(path)
            const hash = this.#getHash(path)
            if (cache && hash === cache) return
            this.update(compiler)
            this.#cache.set(path, hash)
          }
        },
        {
          noTrailing: true,
        }
      )
      this.watcher.on('all', watchFn)
    }
  }

  #watchAfter(compiler: Compiler) {
    if (this.watcher) {
      compiler.hooks.watchClose.tap('WatchFile', () => {
        this.#destroy()
      })
      process.on('SIGINT', () => {
        this.#signal(compiler)
      })
      process.on('SIGALRM', () => {
        this.#signal(compiler)
      })
    }
  }

  abstract update(compiler: Compiler): void

  abstract close(): void

  async apply(compiler: Compiler) {
    await this.#initWatch()
    this.#watch(compiler)
    this.#watchAfter(compiler)
  }

  #signal(compiler: Compiler) {
    compiler.close(() => {
      this.#destroy()
      process.exit(0)
    })
  }

  #destroy() {
    if (this.watcher) {
      this.watcher.off('all', () => {
        this.#cache.clear()
      })
      this.watcher = null
      this.close()
    }
  }
}
