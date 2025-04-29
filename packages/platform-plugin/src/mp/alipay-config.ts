/**
 * 兼容支付宝小程序配置
 * */
export default function (config: Record<string, any> = {}) {
  for (const key in config) {
    const tempValue = Reflect.get(config, key) || {}
    const tempContent = Reflect.get(tempValue, 'content')

    if (!tempContent) continue

    if (key === 'app.config') {
      const windowConfig = Reflect.get(tempContent, 'window') || {}
      if (windowConfig.navigationStyle === 'custom') {
        Reflect.deleteProperty(windowConfig, 'navigationStyle')
        Reflect.set(windowConfig, 'transparentTitle', 'always')
        Reflect.set(windowConfig, 'titlePenetrate', 'YES')
        Reflect.set(tempContent, 'window', windowConfig)
      }
    } else if (tempContent.navigationStyle === 'default') {
      Reflect.deleteProperty(tempContent, 'navigationStyle')
      Reflect.set(tempContent, 'transparentTitle', 'none')
      Reflect.set(tempContent, 'titlePenetrate', 'no')
    }
    Reflect.set(tempValue, 'content', tempContent)
  }
}
