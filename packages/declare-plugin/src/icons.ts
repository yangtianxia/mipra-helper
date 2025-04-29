import shell from 'shelljs'
import { processResolve } from '@mipra-helper/define-plugin'
import { defineDeclare } from './utils'

const classPattern = /\.van-icon-(.+):before\s+{\n.+\n}/gi

export const iconsDeclare = defineDeclare('icons', () => {
  const vantIconsPath = processResolve('node_modules/@vant/icons')

  if (shell.test('-e', vantIconsPath)) {
    const temp = shell.cat(processResolve(vantIconsPath, 'src/common.less'))
    const strArr = [] as string[]
    temp.toString().replaceAll(classPattern, (_, $1) => {
      strArr.push(`'${$1}'`)
      return ''
    })
    return `type VantIcon = ${strArr.join(' | ')}`
  }
})
