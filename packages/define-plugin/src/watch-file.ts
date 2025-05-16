import { watch, type FSWatcher } from 'chokidar'
import { Compiler } from 'webpack'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { globSync } from 'glob'

export interface WatchFileOption {
  monitor: boolean
  path: string
}

export abstract class WatchFile {
  option: WatchFileOption

  constructor(option: WatchFileOption) {
    this.option = option
  }

  abstract name: string

  abstract update(path: string, compiler?: Compiler): void

  abstract close(): void

  #cache: Map<string, string> = new Map()

  watcher: FSWatcher | null = null

  #getHash(path: string) {
    const buffer = readFileSync(path)
    return createHash('sha256').update(buffer).digest('hex')
  }

  apply(compiler: Compiler) {
    if (!this.option.monitor) return

    compiler.hooks.initialize.tap(this.name, () => {
      if (!this.watcher) {
        this.watcher = watch(globSync(this.option.path), {
          ignored: 'node_modules/**',
          persistent: true,
          ignoreInitial: true,
          cwd: process.cwd(),
        })
      }

      this.watcher.on('all', (event: string, path: string) => {
        if (event === 'unlink') {
          this.#cache.delete(path)
          this.update(path, compiler)
        } else if (event === 'unlinkDir') {
          Array.from(this.#cache.values()).forEach((el) => {
            if (el.startsWith(path)) {
              this.#cache.delete(el)
            }
          })
          this.update(path, compiler)
        } else {
          const cache = this.#cache.get(path)
          const hash = this.#getHash(path)
          if (cache && hash === cache) return
          this.update(path, compiler)
          this.#cache.set(path, hash)
        }
      })

      process.on('SIGINT', () => {
        this.#signal(compiler)
      })

      process.on('SIGALRM', () => {
        this.#signal(compiler)
      })
    })
  }

  async #signal(compiler: Compiler) {
    await this.watcher!.close()
    compiler.close(() => {
      this.#cache.clear()
      this.watcher = null
      this.close()
      process.exit(0)
    })
  }
}
