import type { App } from 'vue'
import { vMath } from './math'
import { vTrack } from './track'

export { vMath, vTrack }

export function setupDirectives(app: App) {
  app.directive('track', vTrack)
  app.directive('math', vMath)
  app.directive('katex', vMath) // Maps v-katex to mathlive rendering for backward compatibility
}
