import { format } from 'prettier'

export interface DeclareTypesOption {}

export abstract class DeclareTypes {
  option?: DeclareTypesOption

  constructor(option?: DeclareTypesOption) {
    this.option = option
  }

  abstract name: string

  abstract eventName?: string

  abstract build(): string | undefined

  get fileName() {
    return `${this.name}.d.ts`
  }

  async output() {
    let sourceString = this.build()
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
