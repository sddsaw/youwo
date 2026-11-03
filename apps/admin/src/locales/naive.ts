import type { NDateLocale, NLocale } from 'naive-ui'
import type { LangType } from './types'
import { dateEnUS, dateZhCN, enUS, zhCN } from 'naive-ui'

export const naiveLocales: Record<LangType, NLocale> = {
  'zh-CN': zhCN,
  'en-US': enUS,
}

export const naiveDateLocales: Record<LangType, NDateLocale> = {
  'zh-CN': dateZhCN,
  'en-US': dateEnUS,
}
