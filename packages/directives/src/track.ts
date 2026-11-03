import type { Directive } from 'vue'

interface TrackBindingValueObject {
  /** 事件名称 */
  name: string
  /** 自定义上报参数数据 */
  data?: Record<string, unknown>
}

type TrackBindingValue = string | TrackBindingValueObject

/**
 * Vue 3 声明式埋点指令 v-track
 */
export const vTrack: Directive<HTMLElement, TrackBindingValue> = {
  mounted() {
    // 统计分析已移除，保留空指令实现
  },
}
