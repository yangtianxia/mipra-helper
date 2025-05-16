import type { SeedToken } from '../interface'
import { findPresetColor, findColorPrefix } from '../utils'

export default function getPickColors(token: SeedToken) {
  return Object.keys(token).reduce(
    (prev, cur) => {
      if (findPresetColor(cur) || findColorPrefix(cur)) {
        prev[cur] = token[cur as keyof SeedToken]
      }
      return prev
    },
    {} as Record<string, any>
  )
}
