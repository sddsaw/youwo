import type { ViteEnv } from '../types.js'
import VueDevtools from 'vite-plugin-vue-devtools'

export function setupDevtoolsPlugin(viteEnv: ViteEnv) {
  const { VITE_DEVTOOLS_LAUNCH_EDITOR } = viteEnv

  return VueDevtools({
    launchEditor: VITE_DEVTOOLS_LAUNCH_EDITOR,
  })
}
