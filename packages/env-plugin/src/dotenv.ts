import * as _dotenv from 'dotenv'
import extend from 'extend'
import { isNonEmptyString } from '@txjs/bool'
import {
  getNodeEnv,
  getMipraEnv,
  processResolve,
} from '@mipra-helper/define-plugin'

interface EnvObject {
  [x: string]: string
}

type FilterCallback = (
  key: string,
  value: string,
  index: number
) => boolean | void

type ForEachCallback = (key: string, value: string, index: number) => void

const nodeEnv = getNodeEnv()
const mipraEnv = getMipraEnv()

export class Dotenv {
  #envObject: EnvObject = {}

  constructor() {}

  #resolve(...dir: (string | undefined)[]) {
    return processResolve(['.env', ...dir].join('.'))
  }

  get #isReady() {
    for (const key in this.#envObject) {
      return true
    }
    return false
  }

  get envObject() {
    if (!this.#isReady) {
      this.loadEnv()
    }
    return this.#envObject
  }

  loadEnv() {
    const envObject = {} as EnvObject

    const globalConfig = _dotenv.config({
      path: this.#resolve(),
    })
    const localGlobalConfig = _dotenv.config({
      path: this.#resolve('local'),
    })

    const nodeEnvConfig = _dotenv.config({
      path: this.#resolve(nodeEnv),
    })
    const localNodeEnvConfig = _dotenv.config({
      path: this.#resolve(nodeEnv, 'local'),
    })

    const mipraEnvConfig = _dotenv.config({
      path: this.#resolve(mipraEnv),
    })
    const localMipraEnvConfig = _dotenv.config({
      path: this.#resolve(mipraEnv, 'local'),
    })

    extend(
      true,
      envObject,
      !globalConfig.error && globalConfig.parsed,
      !nodeEnvConfig.error && nodeEnvConfig.parsed,
      !mipraEnvConfig.error && mipraEnvConfig.parsed,
      !localGlobalConfig.error && localGlobalConfig.parsed,
      !localNodeEnvConfig.error && localNodeEnvConfig.parsed,
      !localMipraEnvConfig.error && localMipraEnvConfig.parsed
    )

    this.#envObject = Object.keys(envObject).reduce((ret, key) => {
      if (this.startsWithKey(key)) {
        const value = this.parsed(Reflect.get(envObject, key), envObject)
        Reflect.set(envObject, key, JSON.parse(value))
        Reflect.set(ret, key, value)
      }
      return ret
    }, {} as EnvObject)
    return this.#envObject
  }

  object() {
    const envObject = this.loadEnv()
    return Object.keys(envObject).reduce(
      (ret, key) => {
        const value = Reflect.get(envObject, key)
        Reflect.set(ret, this.spliceKey(key), value)
        return ret
      },
      {} as Record<string, string>
    )
  }

  parsed(input: string, envObject: EnvObject) {
    if (input.startsWith('@')) {
      const strArr = input.split('@')
      input = strArr
        .reduce((chunks, str) => {
          if (Reflect.has(envObject, str)) {
            chunks.push(Reflect.get(envObject, str))
          }
          return chunks
        }, [] as string[])
        .join('')
    }
    return JSON.stringify(input)
  }

  forEach(callback: ForEachCallback) {
    const envObject = this.envObject
    const keys = Object.keys(envObject)
    let i = 0

    while (i < keys.length) {
      const key = keys[i]
      const value = Reflect.get(envObject, key)
      callback(key, this.formatValue(value), i)
      i++
    }
  }

  filter(callback: FilterCallback) {
    const newObject = {} as EnvObject
    const envObject = this.envObject
    const keys = Object.keys(envObject)
    let i = 0

    while (keys.length) {
      const key = keys.shift()!
      const value = Reflect.get(envObject, key)
      const result = callback(key, value, i)
      if (result === true) {
        Reflect.set(newObject, key, this.formatValue(value))
      }
      i++
    }
  }

  startsWithKey(key: string) {
    return key.startsWith('MIPRA_')
  }

  spliceKey(name?: string) {
    return isNonEmptyString(name) ? `process.env.${name}` : ''
  }

  formatKey(name?: string) {
    return isNonEmptyString(name) ? name.replace(/^process\.env\./, '') : ''
  }

  formatValue(value?: string) {
    return isNonEmptyString(value) ? JSON.parse(value) : ''
  }

  isTruly(value?: string) {
    return isNonEmptyString(value) ? /^true$/i.test(value) : false
  }
}

export const dotenv = new Dotenv()
