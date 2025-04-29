import { type NodeEnv, type MipraEnv } from '@mipra-helper/define-plugin'

type NodeEnv2 = NodeEnv | 'dev' | 'prod'

export interface ConditionOption {
  title: string
  page: string
  launchMode?: string
  query?: string | Record<string, any>
  scene?: string | Record<string, any>
  env?: NodeEnv2 | NodeEnv2[]
  mipra?: MipraEnv | MipraEnv[]
}

export const defineCondition = (callback: () => ConditionOption[]) => callback
