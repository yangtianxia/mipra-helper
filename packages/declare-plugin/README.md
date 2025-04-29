# @mipra-helper/declare-plugin

用于生成typescript类型声明的插件，目前内置 @vant/icons `iconDeclare` 的图标类型方法

## 示例

```ts
// env-plugin 环境插件内置类型声明方法
import { envDeclare } from '@mipra-helper/env-plugin'
import { iconsDeclare } from '@mipra-helper/declare-plugin'

{
  plugins: [
    [
      '@mipra-helper/declare-plugin',
      {
        declare: [envDeclare, iconsDeclare],
      },
    ],
  ]
}
```

生成结果：

- /dist/types/env.d.ts

  ```ts
  declare global {
    namespace NodeJS {
      interface ProcessEnv {
        MIPRA_EP: string
        MIPRA_EP1: string
        MIPRA_MP_ID: string
      }
    }
  }
  export {}
  ```

- /dist/types/icons.d.ts

  ```ts
  declare global {
    type VantIcon =
      | 'contact'
      | 'notes'
      | 'records'
      ...
  }
  export {}
  ```
