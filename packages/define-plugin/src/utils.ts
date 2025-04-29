import path from 'node:path'
import shell from 'shelljs'
import minimist from 'minimist'
import { isNonEmptyString } from '@txjs/bool'

const ciArgs = minimist(process.argv.slice(2), {
  string: ['type', 'mode'],
  boolean: ['watch'],
})

export type NodeEnv =
  | 'development'
  | 'production'
  | (string & Record<never, never>)

export type MipraEnv = 'weapp' | 'alipay' | 'tt'

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

export const preprocessPath = (outputPath: string, path: string) => {
  let tempPath = path
  const foundAt = path.lastIndexOf('/')

  if (foundAt > 0) {
    const folder = path.slice(0, foundAt + 1)
    const folderPath = processResolve(outputPath, folder)
    if (!shell.test('-d', folderPath)) {
      shell.mkdir('-p', folderPath)
    }
    tempPath = path.slice(0, foundAt)
  }
  return tempPath
}

export const toJson = (inputString?: string) => {
  try {
    if (inputString) {
      return JSON.parse(inputString)
    }
    throw new Error('inputString is empty.')
  } catch (error) {
    console.error(error)
    return null
  }
}
