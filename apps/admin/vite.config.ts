import { createViteConfig } from '@internal/vite-config'

export default createViteConfig({
  appName: 'admin',
  port: 9527,
  previewPort: 9725,
  scss: {
    additionalData: `@use "@/styles/scss/global.scss" as *;`,
  },
  routerOptions: {
    routePathTransformer(routeName, routePath) {
      if (routeName === 'login') {
        const modules = ['pwd-login', 'code-login', 'register', 'reset-pwd', 'bind-wechat']
        return `/login/:module(${modules.join('|')})?`
      }
      return routePath
    },
    onRouteMetaGen(routeName) {
      const constantRoutes = ['login', '403', '404', '500']
      const meta: Record<string, any> = {
        title: routeName,
      }
      if (constantRoutes.includes(routeName)) {
        meta.constant = true
      }
      return meta
    },
  },
})
