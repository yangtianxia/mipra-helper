import { type NodeEnv, type MipraEnv } from '@mipra-helper/define-plugin'

type NodeEnv2 = NodeEnv | 'dev' | 'prod'

export interface Option {
  title: string
  page: string
  launchMode?: string
  /** 支持环境 @weapp */
  extraInfo?: string
  /** 支持环境 @alipay */
  extraQuery?: string
  query?: string | Record<string, any>
  scene?: string | Record<string, any>
  env?: NodeEnv2 | NodeEnv2[]
  mipra?: MipraEnv | MipraEnv[]
  [x: string]: any
}

export const defineConfig = (callback: () => Option[]) => callback
