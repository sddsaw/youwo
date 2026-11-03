import type { Router } from 'vue-router'
import { useTitle } from '@vueuse/core'
import { $t } from '@/locales'

export function createDocumentTitleGuard(router: Router) {
  router.afterEach((to) => {
    const { i18nKey, title } = to.meta
    const resolvedKey = (i18nKey || (to.name ? `route.${String(to.name)}` : '')) as App.I18n.I18nKey
    const translated = resolvedKey ? $t(resolvedKey) : ''
    const documentTitle = (translated && translated !== resolvedKey) ? translated : title

    useTitle(documentTitle)
  })
}
