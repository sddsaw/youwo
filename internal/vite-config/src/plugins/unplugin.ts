import type { PluginOption } from 'vite'
import type { ViteEnv } from '../types.js'
import fs from 'node:fs'
import path from 'node:path'
import AutoImport from 'unplugin-auto-import/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Icons from 'unplugin-icons/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'

function createSharedComponentsResolver(root: string) {
  return (componentName: string) => {
    const packageSrcPath = path.resolve(root, '../../packages/components/src')
    const basicPath = path.join(packageSrcPath, 'basic', componentName, 'index.vue')
    if (fs.existsSync(basicPath)) {
      return { from: `@sa/components/basic/${componentName}/index.vue` }
    }
    const businessPath = path.join(packageSrcPath, 'business', componentName, 'index.vue')
    if (fs.existsSync(businessPath)) {
      return { from: `@sa/components/business/${componentName}/index.vue` }
    }
  }
}

export function setupUnplugin(viteEnv: ViteEnv, root: string, extraResolvers: any[] = []) {
  const { VITE_ICON_PREFIX = 'icon' } = viteEnv

  const plugins: PluginOption[] = [
    AutoImport({
      imports: [
        'vue',
        'vue-router',
        'pinia',
        '@vueuse/core',
      ],
      dts: 'src/typings/auto-imports.d.ts',
    }),
    Icons({
      compiler: 'vue3',
      scale: 1,
      defaultClass: 'inline-block',
    }),
    Components({
      dts: 'src/typings/components.d.ts',
      types: [{ from: 'vue-router', names: ['RouterLink', 'RouterView'] }],
      resolvers: [
        NaiveUiResolver(),
        IconsResolver({ componentPrefix: VITE_ICON_PREFIX }),
        createSharedComponentsResolver(root),
        ...extraResolvers,
      ],
    }),
    setupSvgIconsPlugin(viteEnv, root),
  ]

  return plugins
}

export function setupSvgIconsPlugin(viteEnv: ViteEnv, root: string): PluginOption {
  const localIconPath = path.join(root, 'src/assets/svg-icon')
  const prefix = viteEnv.VITE_ICON_LOCAL_PREFIX || 'local-icon'

  return createSvgIconsPlugin({
    iconDirs: [localIconPath],
    symbolId: `${prefix}-[dir]-[name]`,
    inject: 'body-last',
    customDomId: '__SVG_ICON_LOCAL__',
  })
}
