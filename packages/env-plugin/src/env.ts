import {
  DeclareTypes,
  type DeclareTypesOption,
} from '@mipra-helper/declare-plugin'
import { json2ts } from 'json-ts'
import { dotenv } from './dotenv'

export class EnvTypes extends DeclareTypes {
  declare option: DeclareTypesOption

  constructor(option?: DeclareTypesOption) {
    super(option)
  }

  override name = 'env'

  override eventName = 'onEnvUpdate'

  override build(): string {
    const content = json2ts(JSON.stringify(dotenv.loadEnv()), {
      prefix: '',
      rootName: 'ProcessEnv',
    })
    return `namespace NodeJS { ${content} }`
  }
}
