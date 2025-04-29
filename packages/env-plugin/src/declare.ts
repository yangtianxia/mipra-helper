import { defineDeclare } from '@mipra-helper/declare-plugin'
import { json2ts } from 'json-ts'
import { dotenv } from './dotenv'

export const envDeclare = defineDeclare('env', () => {
  const content = json2ts(JSON.stringify(dotenv.envObject), {
    prefix: '',
    rootName: 'ProcessEnv',
  })
  return `namespace NodeJS { ${content} }`
})
