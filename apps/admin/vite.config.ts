import { createViteConfig } from '@internal/vite-config'
import { searchForWorkspaceRoot } from 'vite'

const workspaceRoot = searchForWorkspaceRoot(process.cwd())

export default createViteConfig({
  appName: 'admin',
  port: 9527,
  previewPort: 9725,
  server: {
    fs: {
      allow: [workspaceRoot],
    },
  },
  scss: {
    additionalData: `@use "@/styles/scss/global.scss" as *;`,
  },
  routerOptions: {
    routePathTransformer(routeName, routePath) {
      if (routeName === 'login') {
        const modules = ['pwd-login', 'code-login']
        return `/login/:module(${modules.join('|')})?`
      }
      return routePath
    },
    onRouteMetaGen(routeName) {
      const constantRoutes = ['login', '403', '404', '500']
      const metaMap: Record<string, Record<string, any>> = {
        'workbench': {
          title: '工作台',
          i18nKey: 'route.workbench',
          icon: 'material-symbols:space-dashboard-outline-rounded',
          order: 2,
        },
        'workbench_approval': {
          title: '审批中心',
          i18nKey: 'route.workbench_approval',
          icon: 'material-symbols:approval-delegation-outline-rounded',
          order: 2,
        },
        'workbench_knowledge': {
          title: '知识点',
          i18nKey: 'route.workbench_knowledge',
          icon: 'material-symbols:menu-book-outline-rounded',
          order: 1,
        },
        'workbench_knowledge-detail': {
          title: '知识点详情',
          i18nKey: 'route.workbench_knowledge-detail',
          icon: 'material-symbols:article-outline',
          hideInMenu: true,
          activeMenu: 'workbench_knowledge',
        },
      }
      const meta: Record<string, any> = {
        title: routeName,
        i18nKey: `route.${routeName}`,
        ...(metaMap[routeName] || {}),
      }
      if (constantRoutes.includes(routeName)) {
        meta.constant = true
      }
      return meta
    },
  },
})
