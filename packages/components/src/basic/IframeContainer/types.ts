export interface IframeContainerProps {
  /** iframe的URL地址 */
  url?: string
  /** iframe的HTML内容 */
  srcdoc?: string
  /** iframe的标题 */
  title?: string
  /** 是否显示加载状态 */
  loading?: boolean
  /** iframe的高度，默认为100% */
  height?: string | number
  /** iframe的宽度，默认为100% */
  width?: string | number
  /** 是否允许全屏 */
  allowFullscreen?: boolean
  /** 是否显示边框 */
  frameBorder?: boolean
  /** sandbox属性 */
  sandbox?: string
  /** 自定义样式类名 */
  customClass?: string
}

export const IFRAME_SANDBOX_PRESETS = {
  /** 完全限制 */
  STRICT: '',
  /** 基本权限：同源、脚本、弹窗、表单 */
  BASIC: 'allow-same-origin allow-scripts allow-popups allow-forms',
  /** 扩展权限：基本权限 + 下载、模态框 */
  EXTENDED: 'allow-same-origin allow-scripts allow-popups allow-forms allow-downloads allow-modals',
  /** 完全权限（不推荐） */
  FULL: 'allow-same-origin allow-scripts allow-popups allow-forms allow-downloads allow-modals allow-pointer-lock allow-presentation allow-top-navigation',
} as const
