import { generate } from '@ant-design/colors'
import type {
  ColorPalettes,
  MapToken,
  PresetColorType,
  SeedToken,
} from '../interface'
import { defaultPresetColors } from '../seed'
import genColorMapToken from '../shared/genColorMapToken'
import genCommonMapToken from '../shared/genCommonMapToken'
import { generateColorPalettes, generateNeutralColorPalettes } from './colors'
import genFontMapToken from '../shared/genFontMapToken'

export default function derivative(token: SeedToken): MapToken {
  const colorPalettes = Object.keys(defaultPresetColors)
    .map((colorKey) => {
      const colors = generate(token[colorKey as keyof PresetColorType])
      return new Array(10).fill(1).reduce((prev, _, i) => {
        prev[`${colorKey}-${i + 1}`] = colors[i]
        return prev
      }, {}) as ColorPalettes
    })
    .reduce((prev, cur) => {
      prev = {
        ...prev,
        ...cur,
      }
      return prev
    }, {} as ColorPalettes)

  return {
    ...token,
    ...colorPalettes,
    // Colors
    ...genColorMapToken(token, {
      generateColorPalettes,
      generateNeutralColorPalettes,
    }),
    // Font
    ...genFontMapToken(token.fontSize),
    // Others
    ...genCommonMapToken(token),
  }
}
