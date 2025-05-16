import type { ColorPalettes } from '../presetColors'
import type { SeedToken } from '../seeds'
import type { ColorMapToken } from './colors'
import type { StyleMapToken } from './style'
import type { FontMapToken } from './font'

export * from './style'
export * from './font'

export interface CommonMapToken extends StyleMapToken {
  // Motion
  motionDurationFast: string
  motionDurationMid: string
  motionDurationSlow: string
}

export interface MapToken
  extends SeedToken,
    ColorPalettes,
    ColorMapToken,
    FontMapToken,
    CommonMapToken {}
