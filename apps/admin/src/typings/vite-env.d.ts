/**
 * 命名空间 Env
 *
 * 用于声明 import.meta 对象的类型定义
 */
declare namespace Env {
  /** 路由历史模式 */
  type RouterHistoryMode = 'hash' | 'history' | 'memory'

  /** import.meta 接口类型定义 */
  interface ImportMeta extends ImportMetaEnv {
    /** 应用的基础路径 */
    readonly VITE_BASE_URL: string
    /** 应用标题 */
    readonly VITE_APP_TITLE: string
    /** 应用描述 */
    readonly VITE_APP_DESC: string
    /** 路由历史模式 */
    readonly VITE_ROUTER_HISTORY_MODE?: RouterHistoryMode
    /** 图标库图标前缀 */
    readonly VITE_ICON_PREFIX: 'icon'
    /**
     * 本地图标前缀
     *
     * 该前缀必须以图标前缀开头
     */
    readonly VITE_ICON_LOCAL_PREFIX: 'icon-local'
    /** 后端服务基础路径 */
    readonly VITE_SERVICE_BASE_URL: string
    /**
     * 后端服务成功状态码
     *
     * 收到此代码表示请求成功
     */
    readonly VITE_SERVICE_SUCCESS_CODE: string
    /**
     * 后端服务直接登出状态码
     *
     * 收到此代码后，用户将被登出并重定向到登录页面
     *
     * 使用 "," 分隔多个状态码
     */
    readonly VITE_SERVICE_LOGOUT_CODES: string
    /**
     * 后端服务弹窗确认登出状态码
     *
     * 收到此代码后，将显示弹窗提示并登出用户
     *
     * 使用 "," 分隔多个状态码
     */
    readonly VITE_SERVICE_MODAL_LOGOUT_CODES: string
    /**
     * 后端服务 Token 过期状态码
     *
     * 收到此代码后，将尝试刷新 Token 并重新发送请求
     *
     * 使用 "," 分隔多个状态码
     */
    readonly VITE_SERVICE_EXPIRED_TOKEN_CODES: string
    /** 当路由模式为静态路由时，所定义的超级管理员角色 */
    readonly VITE_STATIC_SUPER_ROLE: string
    /**
     * 其它后端服务的基础路径
     *
     * 值通常为 JSON 格式字符串
     */
    readonly VITE_OTHER_SERVICE_BASE_URL: string
    /**
     * 是否启用 HTTP 代理
     *
     * 仅在开发环境有效
     */
    readonly VITE_HTTP_PROXY?: CommonType.YesOrNo
    /**
     * 路由权限模式
     *
     * - static: 路由由前端生成（静态路由模式）
     * - dynamic: 路由由后端动态生成返回（动态路由模式）
     */
    readonly VITE_AUTH_ROUTE_MODE: 'static' | 'dynamic'
    /**
     * 主页路由键
     *
     * 仅在静态路由权限模式下生效。如果是动态路由模式，主页路由键由后端返回定义
     */
    readonly VITE_ROUTE_HOME: import('@elegant-router/types').LastLevelRouteKey
    /**
     * 默认菜单图标（未设置时使用）
     *
     * Iconify 图标名称
     */
    readonly VITE_MENU_ICON: string
    /** 构建打包时是否生成 sourcemap */
    readonly VITE_SOURCE_MAP?: CommonType.YesOrNo
    /**
     * Iconify 接口服务地址
     *
     * 如果项目部署在内网，可以设置此地址为本地私有 Iconify 服务器
     *
     * @link https://docs.iconify.design/api/providers.html
     */
    readonly VITE_ICONIFY_URL?: string
    /** 用于区分不同域名的本地存储（LocalStorage等）前缀 */
    readonly VITE_STORAGE_PREFIX?: string
    /** 应用构建打包后，是否开启自动检测更新 */
    readonly VITE_AUTOMATICALLY_DETECT_UPDATE?: CommonType.YesOrNo
    /** 是否在终端中打印代理请求的日志 */
    readonly VITE_PROXY_LOG?: CommonType.YesOrNo
    /** 调试工具唤起的本地编辑器名称 */
    readonly VITE_DEVTOOLS_LAUNCH_EDITOR?: import('vite-plugin-vue-devtools').VitePluginVueDevToolsOptions['launchEditor']
    /** Apifox Mock 鉴权 Token */
    readonly VITE_APIFOX_TOKEN?: string
  }
}

interface ImportMeta {
  readonly env: Env.ImportMeta
}
