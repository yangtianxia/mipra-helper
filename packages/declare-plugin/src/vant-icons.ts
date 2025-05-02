import shell from 'shelljs'
import { processResolve } from '@mipra-helper/define-plugin'
import { DeclareTypes, type DeclareTypesOption } from './declare-types'

const CLS_REGEX = /\.van-icon-(.+):before\s+{\n.+\n}/gi

export class VantIconTypes extends DeclareTypes {
  declare option: DeclareTypesOption

  constructor(option?: DeclareTypesOption) {
    super(option)
  }

  override name = 'vant-icon'

  override eventName?: string

  override build(): string | undefined {
    const vantIconsPath = processResolve('node_modules/@vant/icons')
    if (shell.test('-e', vantIconsPath)) {
      const tempValue = shell.cat(
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
