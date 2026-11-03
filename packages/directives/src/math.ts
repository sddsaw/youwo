import type { Directive } from 'vue'
import { renderMathInElement } from 'mathlive'

export const vMath: Directive = {
  mounted(el: HTMLElement) {
    renderMathInElement(el)
  },
  updated(el: HTMLElement) {
    renderMathInElement(el)
  },
}
