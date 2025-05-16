import { TinyColor } from '@ctrl/tinycolor'

export default function getRgbColor(color: string) {
  const instance = new TinyColor(color)
  if (instance.isValid) {
    const rgb = instance.toRgb()
    return [rgb.r, rgb.g, rgb.b].join(' ')
  }
  return color
}
