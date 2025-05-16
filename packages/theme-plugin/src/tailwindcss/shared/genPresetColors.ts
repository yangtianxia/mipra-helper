import type { MapToken } from '../../themes/interface'
import { findPresetColor, includePresetColor } from '../../themes/utils'

export const genPresetColors = (mapToken: MapToken) => {
  return Object.keys(mapToken).reduce(
    (prev, cur) => {
      const colorKey = findPresetColor(cur)
      if (colorKey) {
        let value: string
        if (includePresetColor(colorKey)) {
          value = `rgb(var(--${colorKey}) / <alpha-value>) /* ${mapToken[cur as keyof MapToken]} */`
        } else {
          value = `var(--${cur}) /* ${mapToken[cur as keyof MapToken]} */`
        }

        const foundAt = colorKey.indexOf('-')
        const partralMapToken = (prev[colorKey] ??= {})

        if (foundAt >= 0) {
          const idx = parseInt(cur.slice(foundAt + 1))
          partralMapToken[idx === 1 ? idx * 50 : (idx - 1) * 100] = value
        } else {
          partralMapToken['DEFAULT'] = value
        }
        prev[colorKey] = partralMapToken
      }
      return prev
    },
    {} as Record<string, Record<string, string>>
  )
}
