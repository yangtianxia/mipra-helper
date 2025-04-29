import { definePlugin } from '@mipra-helper/define-plugin'

interface RunnerPluginOption {
  outputPlatform?: boolean
}

export default definePlugin<RunnerPluginOption>(
  (ctx, option) => {
    option.outputPlatform ||= true

    ctx.modifyRunnerOpts(({ opts }) => {
      if (option.outputPlatform) {
        opts.outputRoot = `${opts.outputRoot}/${ctx.mipraEnv}`
      }
      ctx.logger('Configuration modification completed')
    })
  },
  {
    name: 'mipra-plugin-runner',
  }
)
