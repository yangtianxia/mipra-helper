import { platforms } from '@mipra-helper/define-plugin'
import {
  DeclareTypes,
  type DeclareTypesOption,
} from '@mipra-helper/declare-plugin'
import { json2tsMulti } from 'json-ts'
import { dotenv } from './dotenv'

export class EnvTypes extends DeclareTypes {
  declare option: DeclareTypesOption

  constructor(option?: DeclareTypesOption) {
    super(option)
  }

  override name = 'env'

  override eventName = 'onEnvUpdate'

  override build(): string {
    const envInferface = json2tsMulti(
      [JSON.stringify({ TARO_ENV: '' }), JSON.stringify(dotenv.loadEnv())],
      {
        prefix: '',
        rootName: 'ProcessEnv',
      }
    ).replace(
      /(\n\s+TARO_ENV\?:\s+)(\w+);\n/,
      `$1${platforms.map((platform) => `'${platform}'`).join(' | ')};\n`
    )
    return `namespace NodeJS { ${envInferface} }`
  }
}
