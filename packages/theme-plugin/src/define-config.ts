import { type MipraEnv } from '@mipra-helper/define-plugin'
import { notNil, isPlainObject } from '@txjs/bool'
import type {
  SeedToken as SeedToken2,
  MapToken as MapToken2,
} from './themes/interface'

interface SeedToken extends Record<MipraEnv, Partial<SeedToken2>>, SeedToken2 {}

interface ThemeMapToken {
  light: Partial<MapToken2>
  dark: Partial<MapToken2>
}

interface MapToken
  extends Record<MipraEnv, Partial<ThemeMapToken>>,
    ThemeMapToken {}

type DefineConfigCallback = () => Partial<SeedToken>

export function defineConfig(
  callback: DefineConfigCallback
): DefineConfigCallback
export function defineConfig(
  callback: DefineConfigCallback,
  theme: Partial<MapToken>
): {
  callback: DefineConfigCallback
  theme: Partial<MapToken>
}
export function defineConfig(callback: any, theme?: any) {
  if (notNil(theme) && isPlainObject(theme)) {
    return {
      callback,
      theme,
    }
  }
  return callback
}
