import type { PluginOption } from 'vite'
import type { ElegantRouterOptions } from '../types.js'
import ElegantVueRouter from '@elegant-router/vue/vite'

export function setupElegantRouter(options?: ElegantRouterOptions) {
  return ElegantVueRouter({
    layouts: {
      base: 'src/layouts/base-layout/index.vue',
      blank: 'src/layouts/blank-layout/index.vue',
    },
    routePathTransformer: options?.routePathTransformer,
    onRouteMetaGen: options?.onRouteMetaGen,
  }) as PluginOption
}
