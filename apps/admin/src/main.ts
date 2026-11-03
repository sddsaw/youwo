import { setupVueRootValidator } from 'vite-plugin-vue-transition-root-validator/client'
import { createApp } from 'vue'
import App from './App.vue'
import { getLocale, setupI18n } from './locales'
import { setupAppVersionNotification, setupDayjs, setupIconifyOffline, setupLoading, setupNProgress } from './plugins'
import { setupRouter } from './router'
import { setupStore } from './store'
import { localStg } from './utils/storage'
import './plugins/assets'

async function setupApp() {
  setupLoading()

  setupNProgress()

  setupIconifyOffline()

  setupDayjs()

  const app = createApp(App)

  setupStore(app)

  setupI18n(app, localStg.get('lang') || 'zh-CN')

  await setupRouter(app)

  setupAppVersionNotification()

  setupVueRootValidator(app, {
    lang: getLocale() === 'zh-CN' ? 'zh' : 'en',
  })

  app.mount('#app')
}

setupApp()
