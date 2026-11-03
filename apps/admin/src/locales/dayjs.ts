import type { LangType } from './types'
import { locale } from 'dayjs'
import 'dayjs/locale/zh-cn'
import 'dayjs/locale/en'

/**
 * Set dayjs locale
 *
 * @param lang
 */
export function setDayjsLocale(lang: LangType = 'zh-CN') {
  const localMap: Record<LangType, string> = {
    'zh-CN': 'zh-cn',
    'en-US': 'en',
  }

  const l = lang || 'zh-CN'

  locale(localMap[l])
}
