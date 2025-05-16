import { generate } from '@ant-design/colors'
import type {
  ColorPalettes,
  MapToken,
  PresetColorType,
  SeedToken,
} from '../interface'
import { defaultPresetColors } from '../seed'
import genColorMapToken from '../shared/genColorMapToken'
import { generateColorPalettes, generateNeutralColorPalettes } from './colors'
import defaultAlgorithm from '../default'

export default function derivative(token: SeedToken, mapToken: MapToken) {
  const colorPalettes = Object.keys(defaultPresetColors)
    .map((colorKey) => {
      const colors = generate(token[colorKey as keyof PresetColorType], {
        theme: 'dark',
      })

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

  const mergedMapToken = mapToken ?? defaultAlgorithm(token)

  return {
    ...mergedMapToken,

    // Dark tokens
    ...colorPalettes,
    // Colors
    ...genColorMapToken(token, {
      generateColorPalettes,
      generateNeutralColorPalettes,
    }),
  }
}
