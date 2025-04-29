# @mipra-helper/platform-plugin

小程序项目配置插件

## 小程序项目配置

```ts
export const configFileNameMap = {
  weapp: 'project.config.json',
  tt: 'project.config.json',
  alipay: 'mini.project.json',
}
```

## 内置环境字段

- MIPRA_MP_ID：（小程序 `appid` 配置字段）
- MIPRA_PROJECT_NAME：（小程序 `projectname` 配置字段）

```ts
export const envVariableMap = {
  MIPRA_MP_ID: 'appid',
  MIPRA_PROJECT_NAME: 'projectname',
}
```
