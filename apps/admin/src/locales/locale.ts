import type { LangType, Schema } from './types'
import enUS from './langs/en-us'
import zhCN from './langs/zh-cn'

export const locales: Record<LangType, Schema> = {
  'zh-CN': zhCN,
  'en-US': enUS,
}

export default locales
