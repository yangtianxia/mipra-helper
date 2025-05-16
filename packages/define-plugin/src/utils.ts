import path from 'node:path'
import minimist from 'minimist'
import { isNonEmptyString } from '@txjs/bool'

const ciArgs = minimist(process.argv.slice(2), {
  string: ['type', 'mode'],
  boolean: ['watch'],
})

export const platforms = ['weapp', 'alipay', 'tt'] as const

export type NodeEnv =
  | 'development'
  | 'production'
  | (string & Record<never, never>)

export type MipraEnv = (typeof platforms)[number]

export const isWatch = () => {
  return !!ciArgs.watch
}

export const getNodeEnv = () => {
  return (
    isNonEmptyString(ciArgs.mode) ? ciArgs.mode : process.env.NODE_ENV
  ) as NodeEnv
}

export const getMipraEnv = () => {
  return (
    isNonEmptyString(ciArgs.type) ? ciArgs.type : process.env.TARO_ENV
  ) as MipraEnv
}

export const resolve = (...dir: string[]) => {
  return path.resolve(...dir)
}

export const processResolve = (...dir: string[]) => {
  return resolve(process.cwd(), ...dir)
}

export const toJson = (inputString?: string) => {
  try {
    if (inputString) {
      return JSON.parse(inputString)
    }
    throw new Error('inputString is empty.')
  } catch {
    return null
  }
}
