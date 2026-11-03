import type { App } from 'vue'
import type { $T, LangType } from './types'
import { createI18n } from 'vue-i18n'
import messages from './locale'

export * from './dayjs'
export { locales, default as messages } from './locale'
export * from './naive'
export * from './types'

export const i18n = createI18n({
  locale: 'zh-CN',
  fallbackLocale: 'en-US',
  messages: messages as any,
  legacy: false,
})

/**
 * Setup plugin i18n
 *
 * @param app Vue App instance
 * @param defaultLocale Initial locale
 */
export function setupI18n(app: App, defaultLocale: LangType = 'zh-CN') {
  setLocale(defaultLocale)
  app.use(i18n)
}

export const $t = i18n.global.t as unknown as $T

export function setLocale(locale: LangType) {
  (i18n.global.locale as any).value = locale

  if (typeof document !== 'undefined') {
    document.querySelector('html')?.setAttribute('lang', locale)
  }
}

export function getLocale(): LangType {
  return (i18n.global.locale as any).value as LangType
}
