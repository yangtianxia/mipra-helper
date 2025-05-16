export const configFileNameMap = {
  weapp: 'project.private.config.json',
  alipay: '.mini-ide/compileMode.json',
  tt: 'project.private.config.json',
}

export const fieldNameMap = {
  weapp: {
    title: 'name',
    page: 'pathName',
    query: 'query',
    launchMode: 'launchMode',
    scene: 'scene',
    extraInfo: 'referrerInfo',
  },
  alipay: {
    title: 'title',
    page: 'page',
    query: 'pageQuery',
    launchMode: 'launchMode',
    scene: 'scene',
    extraQuery: 'page',
  },
  tt: {
    title: 'name',
    page: 'pathName',
    query: 'query',
    launchMode: 'launchFrom',
    scene: 'scene',
  },
}
