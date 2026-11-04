import type { ConfigEnv, UserConfig } from 'vite'
import type { CreateViteConfigOptions, ViteEnv } from './types.js'
import path from 'node:path'
import process from 'node:process'
import { defu } from 'defu'
import { defineConfig, loadEnv, searchForWorkspaceRoot } from 'vite'
import { createViteProxy, getBuildTime } from './config/index.js'
import { setupVitePlugins } from './plugins.js'

/**
 * 创建 Vite 配置的工厂函数
 *
 * 封装了 Soybean Admin 各子应用所需的通用构建配置和核心插件，
 * 使用 `defu` 库对子应用自定义的配置和默认配置进行深度合并，确保配置的高可读性与健壮性。
 *
 * @param options - 配置选项，支持 Soybean 专属参数及 Vite 原生配置
 */
export function createViteConfig(options?: CreateViteConfigOptions) {
  return defineConfig((configEnv: ConfigEnv): UserConfig => {
    const root = process.cwd()

    // 加载当前环境的环境变量与构建时间
    const viteEnv = loadEnv(configEnv.mode, root) as unknown as ViteEnv
    const buildTime = getBuildTime()
    const enableProxy = configEnv.command === 'serve' && !configEnv.isPreview

    // 解构配置项，设定默认回退值
    const {
      appName = 'app',
      port,
      previewPort,
      scss,
      base,
      css: customCss = {},
      plugins: customPlugins = [],
      server: customServer = {},
      preview: customPreview = {},
      build: customBuild = {},
      define: customDefine = {},
      resolve: customResolve = {},
    } = options || {}

    // 处理 SCSS 预处理器全局样式注入
    const cssConfig: UserConfig['css'] = { ...customCss }
    if (scss) {
      cssConfig.preprocessorOptions = {
        scss: {
          api: scss.api || 'modern-compiler',
          additionalData: scss.additionalData,
        } as any,
        ...customCss.preprocessorOptions,
      }
    }

    // 默认配置对象
    const defaultConfig: UserConfig = {
      base: viteEnv.VITE_BASE_URL || '/',
      resolve: {
        alias: {
          '@': path.resolve(root, './src'),
          '~': path.resolve(root, './'),
        },
      },
      css: cssConfig,
      plugins: setupVitePlugins(viteEnv, buildTime, root, options, configEnv.command === 'build'),
      define: {
        BUILD_TIME: JSON.stringify(buildTime),
      },
      server: {
        host: '0.0.0.0',
        port: port || Number(viteEnv.VITE_SVR_PORT) || 9527,
        open: true,
        proxy: createViteProxy(viteEnv, enableProxy),
        fs: {
          allow: [searchForWorkspaceRoot(root)],
        },
      },
      preview: {
        port: previewPort || 9725,
      },
      esbuild:
        configEnv.command === 'build' && configEnv.mode === 'prod'
          ? {
              drop: ['console', 'debugger'],
            }
          : {},
      build: {
        outDir: `../../dist/${appName}`,
        emptyOutDir: true,
        reportCompressedSize: false,
        sourcemap: viteEnv.VITE_SOURCE_MAP === 'Y',
        commonjsOptions: {
          ignoreTryCatch: false,
        },
        rollupOptions: {
          output: {
            entryFileNames: 'static/js/[name]-[hash].js',
            chunkFileNames: 'static/js/[name]-[hash].js',
            assetFileNames: 'static/[ext]/[name]-[hash].[ext]',
            manualChunks(id) {
              if (!id.includes('node_modules'))
                return

              const matchRules: [string, string[]][] = [
                ['vue', ['vue', '@vue', 'vue-router', 'pinia']],
                ['echarts', ['echarts', 'zrender']],
                ['ckeditor', ['ckeditor', '@ckeditor']],
                ['ui', ['naive-ui']],
                [
                  'vendor-utils',
                  [
                    'axios',
                    'dayjs',
                    'crypto-js',
                    'qs',
                    'nprogress',
                    'clipboard',
                    '@vueuse/core',
                    '@vueuse/shared',
                    'defu',
                  ],
                ],
              ]

              for (const [chunkName, pkgs] of matchRules) {
                if (pkgs.some(pkg => id.includes(`/node_modules/${pkg}/`) || id.includes(`/.pnpm/${pkg}`))) {
                  return chunkName
                }
              }
            },
          },
        },
      },
    }

    // 用户覆盖或额外配置对象
    const customOverrides: UserConfig = {
      base,
      resolve: customResolve,
      plugins: customPlugins as any[],
      define: customDefine,
      server: customServer,
      preview: customPreview,
      build: customBuild,
    }

    // 使用 defu 深度合并（customOverrides 覆盖 defaultConfig，同时防丢失子属性）
    return defu(customOverrides, defaultConfig)
  })
}
