import type { ComponentResolver } from 'unplugin-vue-components'
import type { UserConfig } from 'vite'

export interface ViteEnv {
  VITE_BASE_URL: string
  VITE_ROUTE_HOME: string
  VITE_ICON_PREFIX: string
  VITE_ICON_LOCAL_PREFIX: string
  VITE_SERVICE_BASE_URL: string
  VITE_OTHER_SERVICE_BASE_URL: string
  VITE_SVR_PORT?: string
  VITE_VISUALIZER?: string
  VITE_DEVTOOLS?: string
  VITE_HTTP_PROXY?: string
  VITE_PROXY_LOG?: string
  VITE_SOURCE_MAP?: string
  VITE_DEVTOOLS_LAUNCH_EDITOR?: string
  [key: string]: any
}

export interface ElegantRouterOptions {
  routePathTransformer?: (routeName: string, routePath: string) => string
  onRouteMetaGen?: (routeName: string) => Record<string, any>
}

export interface ScssOptions {
  api?: 'modern-compiler' | 'modern' | 'legacy'
  additionalData?: string
}

export interface CreateViteConfigOptions {
  // --- Soybean Specific Options ---
  appName?: string

  port?: number
  previewPort?: number
  routerOptions?: ElegantRouterOptions
  componentResolvers?: ComponentResolver[]
  scss?: ScssOptions

  // --- Vite Native Configurations for Direct Overrides ---
  base?: string
  css?: UserConfig['css']
  plugins?: UserConfig['plugins']
  server?: UserConfig['server']
  preview?: UserConfig['preview']
  build?: UserConfig['build']
  define?: UserConfig['define']
  resolve?: UserConfig['resolve']
}
