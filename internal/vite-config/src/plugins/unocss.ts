import type { ViteEnv } from '../types.js'
import { presetIcons } from 'unocss'
import unocss from 'unocss/vite'

export function setupUnocss(viteEnv: ViteEnv) {
  const { VITE_ICON_PREFIX = 'icon' } = viteEnv || {}

  return unocss({
    presets: [
      presetIcons({
        prefix: `${VITE_ICON_PREFIX}-`,
        scale: 1,
        extraProperties: {
          display: 'inline-block',
        },
        warn: true,
      }),
    ],
  })
}
