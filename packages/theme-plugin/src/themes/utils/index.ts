import { PresetColors, FunctionalColors } from '../interface'

export const findPresetColor = (colorKey: string) => {
  return PresetColors.find((el) => colorKey.startsWith(el))
}

export const includePresetColor = (colorKey: any) => {
  return PresetColors.includes(colorKey)
}

export const findFunctionalColor = (colorKey: string) => {
  return FunctionalColors.find((el) => colorKey.startsWith(el))
}

export const findColorPrefix = (colorKey: string) => {
  return colorKey.startsWith('color')
}

export const includeFunctoinalColor = (colorKey: any) => {
  return FunctionalColors.includes(colorKey)
}
