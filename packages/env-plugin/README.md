# @mipra-helper/env-plugin

环境配置插件，在项目根目录添加 .env 环境配置文件即可使用

> 注意：配置环境字段必须以 `MIPRA_` 为前缀，否则不会生效

## 配置文件选项

- 全局环境 `.env`
- 自定义环境 `.env.[mode]`
- 小程序环境 `.env.[type]`
- 本地环境 `*.local`，以上环境都支持本地环境配置

### 加载优先级

.env -> .env.[mode] -> .env.[type] -> \*.local
