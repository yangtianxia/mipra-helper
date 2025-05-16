import { processResolve, type PluginContext } from '@mipra-helper/define-plugin'
import fs from 'fs-extra'
import { DeclareTypes, type DeclareTypesOption } from './declare-types'

const CLS_REGEX = /\.van-icon-(.+):before\s+{\n.+\n}/gi

export class VantIconTypes extends DeclareTypes {
  declare option: DeclareTypesOption

  constructor(option?: DeclareTypesOption) {
    super(option)
  }

  override name = 'vant-icon'

  override eventName?: string

  override build(ctx: PluginContext) {
    const vantIconsPath = processResolve(
      ctx.paths.nodeModulesPath,
      '@vant/icons'
    )
    if (fs.existsSync(vantIconsPath)) {
      const tempValue = fs.readFileSync(
        processResolve(vantIconsPath, 'src/common.less')
      )
      const arrString = [] as string[]
      tempValue.toString().replaceAll(CLS_REGEX, (_, $1) => {
        arrString.push(`'${$1}'`)
        return ''
      })
      return `type VantIcons = ${arrString.join(' | ')}`
    }
  }
}
