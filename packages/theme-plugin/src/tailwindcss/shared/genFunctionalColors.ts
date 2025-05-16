import { camelToKebab } from '@txjs/shared'
import type { MapToken } from '../../themes/interface'
import { findFunctionalColor, includeFunctoinalColor } from '../../themes/utils'

const themeColorKey = 'colors'

const themeAlias: Record<string, string> = {
  text: 'textColor',
  border: 'borderColor',
  bg: 'backgroundColor',
}

const defaultTheme: Record<string, Record<string, any>> = {
  colors: {},
  textColor: {},
  borderColor: {},
  backgroundColor: {},
}

export const genFunctionalColors = (mapToken: MapToken) => {
  return Object.keys(mapToken).reduce((prev, cur) => {
    const colorKey = findFunctionalColor(cur)
    if (colorKey) {
      let value: string
      if (includeFunctoinalColor(cur)) {
        value = `rgb(var(--${camelToKebab(cur)}) / <alpha-value>) /* ${mapToken[cur as keyof MapToken]} */`
      } else {
        value = `var(--${camelToKebab(cur)}) /* ${mapToken[cur as keyof MapToken]} */`
      }

      // ''
      // ['bg', 'hover']
      // ['hover']
      // ['active']
      const [key, key2] = camelToKebab(cur.slice(colorKey.length)).split('-')
      const themeKey = themeAlias[key] || themeColorKey

      // 浅拷贝对象
      // 默认为color字符长度
      // 5 => 'color'.length
      const partralMapToken = (prev[themeKey][
        colorKey.slice(5).toLowerCase()
      ] ??= {})

      if (key2) {
        partralMapToken[key2] = value
      } else if (key && themeKey === themeColorKey) {
        partralMapToken[key] = value
      } else {
        partralMapToken['DEFAULT'] = value
      }
    }
    return prev
  }, defaultTheme)
}
