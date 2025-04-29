import extend from 'extend'
import { pick } from '@txjs/shared'

const baseConfigKeys = [
  'format',
  'compileType',
  'miniprogramRoot',
  'pluginRoot',
  'compileOptions',
  'uploadExclude',
  'assetsInclude',
  'developOptions',
  'pluginResolution',
  'scripts',
]

const compileOptionKeys = [
  'component2',
  'typescript',
  'less',
  'treeShaking',
  'resolveAlias',
  'globalObjectMode',
  'transpile',
]

export default function alipay(config: Record<string, any> = {}) {
  const { compileOptions = {}, ...partial } = pick(config, baseConfigKeys, true)

  return extend(partial, {
    compileOptions: pick(compileOptions, compileOptionKeys, true),
  })
}
