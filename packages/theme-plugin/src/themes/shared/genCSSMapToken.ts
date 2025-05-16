import { camelToKebab } from '@txjs/shared'
import { type SeedToken } from '../interface'
import { includePresetColor, includeFunctoinalColor } from '../utils'
import getRgbColor from '../utils/getRgbColor'
import getPickColors from '../utils/getPickColors'

export type pxToRpx = (key: string, value: any) => any

interface CSSVarMapTokenOpts {
  dark?: boolean
}

const BAN_LIST = [
  'motionUnit',
  'motionBase',
  'colorWhite',
  'colorTextBase',
  'colorBgBase',
]

const FONT_SIZE_LIST = [
  'fontSize',
  'fontSizeSM',
  'fontSizeLG',
  'fontSizeXL',
  'fontSizeHeading1',
  'fontSizeHeading2',
  'fontSizeHeading3',
  'fontSizeHeading4',
  'fontSizeHeading5',
]

const RADIUS_LIST = [
  'borderRadius',
  'borderRadiusXS',
  'borderRadiusSM',
  'borderRadiusLG',
  'borderRadiusOuter',
]

export const getCSSVarValue = (key: string, value: any) => {
  let tempValue = value

  if (FONT_SIZE_LIST.includes(key) || RADIUS_LIST.includes(key)) {
    tempValue = `${value}px`
  } else if (includePresetColor(key) || includeFunctoinalColor(key)) {
    tempValue = getRgbColor(value)
  }

  return tempValue.toString()
}

export default function genCSSVarMapToken(
  token: SeedToken,
  opts: CSSVarMapTokenOpts = {}
) {
  let tempObject: Record<string, any> = token

  if (opts?.dark) {
    tempObject = getPickColors(token)
  }

  return Object.keys(tempObject)
    .reduce((prev, cur) => {
      if (!BAN_LIST.includes(cur)) {
        prev.push(
          `--${camelToKebab(cur)}: ${getCSSVarValue(cur, tempObject[cur])}`
        )
      }
      return prev
    }, [] as string[])
    .join(';')
}
