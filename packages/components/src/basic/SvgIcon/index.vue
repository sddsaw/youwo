<script setup lang="ts">
import { Icon } from '@iconify/vue/offline'
import { computed, useAttrs } from 'vue'

defineOptions({ name: 'SvgIcon', inheritAttrs: false })

const props = defineProps<Props>()

/**
 * Props
 *
 * - Support iconify and local svg icon
 * - If icon and localIcon are passed at the same time, localIcon will be rendered first
 */
interface Props {
  /** Iconify icon name */
  icon?: string
  /** Local svg icon name */
  localIcon?: string
}

const attrs = useAttrs()

const DEFAULT_LOCAL_ICON = 'no-icon'

const bindAttrs = computed<{ class: string, style: string }>(() => ({
  class: (attrs.class as string) || '',
  style: (attrs.style as string) || '',
}))

const normalizedIcon = computed(() => {
  if (!props.icon || props.icon.includes(':'))
    return props.icon

  const separatorIndex = props.icon.indexOf('-')
  if (separatorIndex < 0)
    return props.icon

  return `${props.icon.slice(0, separatorIndex)}:${props.icon.slice(separatorIndex + 1)}`
})

const symbolId = computed(() => {
  const prefix = (import.meta.env.VITE_ICON_LOCAL_PREFIX as string) || 'local-icon'
  const icon = props.localIcon || DEFAULT_LOCAL_ICON

  return `#${prefix}-${icon}`
})

/** If localIcon is passed, render localIcon first */
const renderLocalIcon = computed(() => Boolean(props.localIcon || !props.icon))
</script>

<template>
  <template v-if="renderLocalIcon">
    <svg aria-hidden="true" width="1em" height="1em" v-bind="bindAttrs">
      <use :xlink:href="symbolId" fill="currentColor" />
    </svg>
  </template>
  <Icon v-else-if="normalizedIcon" :icon="normalizedIcon" v-bind="bindAttrs" />
</template>

<style scoped></style>
