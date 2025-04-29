# @mipra-helper/condition-plugin

小程序编译条件插件，配置需要快捷编译的页面，即可生成页面的快捷编译入口，是一个可以提高效率的插件。

## 使用插件

在项目根目录添加 `.conditionrc.ts` 文件

### 配置插件

```ts
{
  plugins: ['@mipra-helper/condition-plugin']
}
```

### 配置字段

| name       | 说明                           |
| ---------- | ------------------------------ |
| title      | 标题                           |
| page       | 页面地址                       |
| query      | 参数                           |
| launchMode | 启动模式，可默认设置 `default` |
| scene      | 启动小程序的场景值             |
| env        | 配置需要的环境，默认: `*`      |
| mipra      | 配置需要的小程序， 默认: `*`   |

### 配置编译

```ts
import { defineCondition } from '@mipra-helper/condition-plugin'

export default defineCondition(() => {
  return [
    {
      title: '测试页面',
      page: '/pages/index/index',
      env: 'dev',
    },
  ]
})
```
