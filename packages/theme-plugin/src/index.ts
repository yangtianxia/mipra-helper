import {
  definePlugin,
  processResolve,
  platforms,
  kleur,
  type MipraEnv,
} from '@mipra-helper/define-plugin'
import fs from 'fs-extra'
import postcss from 'postcss'
import pxtorem from 'postcss-pxtransform'
import cleanCSS from 'clean-css'
import webpack from 'webpack'
import dayjs from 'dayjs'
import { cosmiconfig, type PublicExplorer } from 'cosmiconfig'
import { TypeScriptLoader } from 'cosmiconfig-typescript-loader'
import { isFunction, isPlainObject } from '@txjs/bool'
import { pick, shallowMerge } from '@txjs/shared'
import { format } from 'prettier'

import { defaultSeed, genLegacyToken } from './themes'
import type { SeedToken } from './themes/interface'
import genCSSVarMapToken from './themes/shared/genCSSMapToken'
import formatTailwindConfig from './tailwindcss/alias'
import { ThemeWatchFilePlugin } from './watch-file'

interface ThemePluginOption {
  darkmode: boolean
  monitor?: boolean
}

const getStyleFileSuffix = (mipraEnv: MipraEnv) => {
  switch (mipraEnv) {
    case 'weapp':
      return 'wxss'
    case 'alipay':
      return 'acss'
    case 'tt':
      return 'ttss'
  }
}

export default definePlugin<ThemePluginOption>(
  (ctx, option) => {
    option.darkmode ||= false
    option.monitor ??= ctx.isWatch

    const { designWidth, deviceRatio } = ctx.initialConfig
    const { enable: pxtransformEnable, config: pxtransformConfig } =
      ctx.initialConfig.mini?.postcss?.pxtransform || {}

    const themeCssFile = `theme.${getStyleFileSuffix(ctx.mipraEnv)}`
    const themeCssPath = processResolve(ctx.outputPath, themeCssFile)

    const themePath = processResolve('.themerc.ts')

    let explorer: PublicExplorer
    const loadConfig = async (): Promise<Record<
      'config' | 'theme',
      Record<string, any>
    > | void> => {
      try {
        if (!fs.pathExistsSync(themePath)) return

        if (!explorer) {
          explorer = cosmiconfig('theme', {
            stopDir: process.cwd(),
            cache: false,
            searchPlaces: ['.themerc.ts'],
            loaders: {
              '.ts': TypeScriptLoader({
                fsCache: 'node_modules/.cache/mipra',
                moduleCache: false,
              }),
            },
          })
        }

        const result = await explorer.search(process.cwd())

        if (result) {
          let config: any
          let theme: any

          if (isFunction(result.config)) {
            config = result.config()
          } else if (isPlainObject(result.config)) {
            const source = result.config
            if (source.theme && source.callback) {
              config = source.callback()
              theme = source.theme
            } else {
              config = source
            }
          }
          if (isPlainObject(config) || isPlainObject(theme)) {
            return {
              config,
              theme,
            }
          }
        }
      } catch (error) {
        ctx.warn(error)
      }
    }

    const build = async (callback?: () => void) => {
      try {
        const { config = {}, theme = {} } = (await loadConfig()) || {}

        const partialSeed = pick(
          config,
          Object.keys(defaultSeed) as string[],
          true
        )
        const mipraSeed = config[ctx.mipraEnv] || {}
        const finalSeed = shallowMerge(
          {},
          partialSeed,
          pick(mipraSeed, Object.keys(defaultSeed), true)
        ) as unknown as SeedToken

        const partialTheme = pick(theme, ['light', 'dark'], true)
        const mipraTheme = theme[ctx.mipraEnv] || {}

        const lightTheme = shallowMerge(
          {},
          partialTheme.light,
          mipraTheme.light,
          true
        )
        const darkTheme = shallowMerge(
          {},
          partialTheme.dark,
          mipraTheme.dark,
          true
        )

        const { lightToken, darkToken } = genLegacyToken(finalSeed)

        shallowMerge(
          lightToken,
          pick(lightTheme, Object.keys(lightToken), true)
        )
        shallowMerge(darkToken, pick(darkTheme, Object.keys(darkToken), true))

        // 输出 CSS
        const light = genCSSVarMapToken(lightToken)
        const dark = genCSSVarMapToken(darkToken, {
          dark: true,
        })

        let styles = new cleanCSS().minify(`
          page {${light}}
          @media (prefers-colors-scheme: dark) {
            page {${dark}}
          }
        `).styles

        if (pxtransformEnable) {
          styles = postcss(
            pxtorem({
              platform: 'weapp',
              designWidth,
              deviceRatio,
              ...(pxtransformConfig || {}),
            })
          ).process(styles).css
        }

        await fs.outputFile(themeCssPath, styles)

        const tailwindTheme = formatTailwindConfig(lightToken)
        await fs.outputFile(
          processResolve('tailwind.mini.ts'),
          await format(
            `
            /**
             * This is the automatically generated tailwindcss configuration file.
             * https://v3.tailwindcss.com/docs/presets#extending-multiple-presets
             * generated form [@mipra-helper/theme-plugin]
             * @time: ${dayjs().format('YYYY-MM-DD HH:mm:ss').toString()}
             */

            import { type Config } from 'tailwindcss'
            import plugin from 'tailwindcss/plugin'
            import colors from 'tailwindcss/colors'

            export default {
              darkMode: 'media',
              content: ['./src/**/*.{html,vue,js,ts,jsx,tsx}'],
              corePlugins: {
                preflight: false,
              },
              theme: {
                colors: {
                  inherit: colors.inherit,
                  transparent: colors.transparent,
                  current: colors.current,
                  white: colors.white,
                  black: colors.black,
                },
                extend: ${JSON.stringify(tailwindTheme)}
              },
              plugins: [
                plugin(({ addVariant }) => {
                  ${JSON.stringify(platforms)}.forEach((platform) => {
                    if ('${ctx.mipraEnv}' === platform) {
                      addVariant(platform, '&')
                    } ${
                      ctx.nodeEnv !== 'production'
                        ? `else {
                     addVariant(platform, '&:not(&)')
                    }`
                        : ''
                    }
                  })
                })
              ]
            } as Config
            `,
            {
              parser: 'typescript',
              semi: false,
              tabWidth: 2,
              useTabs: false,
              singleQuote: true,
              printWidth: 80,
              endOfLine: 'auto',
            }
          )
        )
        callback?.()
      } catch (error) {
        ctx.warn(error)
      }
    }

    ctx.modifyBuildAssets(({ assets }) => {
      for (const path in assets) {
        // 匹配不同小程序app样式文件
        if (/^app\.(.+)ss$/.test(path)) {
          const content = Reflect.get(assets, path)
          const tempContent = `/**MIPRA-CSS-THEME-START*/@import "./${themeCssFile}";/**MIPRA-CSS-THEME-END*/\n${content.source()}`
          Reflect.set(assets, path, new webpack.sources.RawSource(tempContent))
          break
        }
      }
    })

    ctx.onBuildStart(async () => {
      build(() => {
        ctx.logger('Build completed')
      })
    })

    ctx.modifyWebpackChain(({ chain }) => {
      chain
        .plugin('themeWatchFilePlugin')
        .use(ThemeWatchFilePlugin, [
          {
            monitor: option.monitor,
            path: themePath,
            change: (path: string) => {
              build(() => {
                ctx.logger(`Update ${kleur.blue(path)}`)
              })
            },
          },
        ])
        .end()
    })
  },
  {
    name: 'mipra-plugin-theme',
  }
)
