<script setup lang="ts">
import type { PopoverPlacement } from 'naive-ui'
import { computed } from 'vue'
import ButtonIcon from '../../basic/ButtonIcon/index.vue'

defineOptions({ name: 'ThemeSchemaSwitch' })

const props = withDefaults(defineProps<Props>(), {
  showTooltip: true,
  tooltipPlacement: 'bottom',
  tooltipText: '主题模式',
})

const emit = defineEmits<Emits>()

interface Props {
  /** Theme schema */
  themeSchema: 'light' | 'dark' | 'auto'
  /** Show tooltip */
  showTooltip?: boolean
  /** Tooltip placement */
  tooltipPlacement?: PopoverPlacement
  /** Tooltip text */
  tooltipText?: string
}

interface Emits {
  (e: 'switch'): void
}

function handleSwitch() {
  emit('switch')
}

const icons: Record<'light' | 'dark' | 'auto', string> = {
  light: 'material-symbols:sunny',
  dark: 'material-symbols:nightlight-rounded',
  auto: 'material-symbols:hdr-auto',
}

const icon = computed(() => icons[props.themeSchema])

const tooltipContent = computed(() => {
  if (!props.showTooltip)
    return ''

  return props.tooltipText
})
</script>

<template>
  <ButtonIcon
    :icon="icon"
    :tooltip-content="tooltipContent"
    :tooltip-placement="tooltipPlacement"
    @click="handleSwitch"
  />
</template>

<style scoped></style>
