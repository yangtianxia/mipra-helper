import { type PluginContext } from '@mipra-helper/define-plugin'
import { format } from 'prettier'

export interface DeclareTypesOption {
  [x: string]: any
}

export abstract class DeclareTypes {
  option?: DeclareTypesOption

  constructor(option?: DeclareTypesOption) {
    this.option = option
  }

  abstract name: string

  abstract eventName?: string

  abstract build(ctx: PluginContext): string | undefined

  get fileName() {
    return `${this.name}.d.ts`
  }

  async output(ctx: PluginContext) {
    let sourceString = this.build(ctx)
    if (sourceString) {
      sourceString = `declare global{
        ${sourceString}
      }
      export {}`

      return await format(sourceString, {
        parser: 'typescript',
        semi: false,
        tabWidth: 2,
        useTabs: false,
        singleQuote: true,
        printWidth: 80,
        endOfLine: 'auto',
      })
    }
  }
}
