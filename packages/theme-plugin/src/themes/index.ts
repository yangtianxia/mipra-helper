import { shallowMerge } from '@txjs/shared'
import type { SeedToken } from './interface'
import defaultSeed from './seed'
import defaultAlgorithm from './default'
import darkAlgorithm from './dark'

export { defaultSeed, defaultAlgorithm, darkAlgorithm }

export const genLegacyToken = (token?: SeedToken) => {
  const seedToken = shallowMerge({}, defaultSeed, token)
  const lightToken = defaultAlgorithm(seedToken)
  const darkToken = darkAlgorithm(seedToken, lightToken)
  return { lightToken, darkToken }
}
