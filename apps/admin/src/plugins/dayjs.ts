import { extend, locale } from 'dayjs'
import localeData from 'dayjs/plugin/localeData'
import 'dayjs/locale/zh-cn'

export function setupDayjs() {
  extend(localeData)
  locale('zh-cn')
}
