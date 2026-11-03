<script setup lang="ts">
import type { PopoverPlacement } from 'naive-ui'
import { themeLayoutModeRecord } from '@/constants/app'

defineOptions({
  name: 'LayoutModeCard',
})

const props = defineProps<Props>()

const emit = defineEmits<Emits>()

const layoutModeDetailRecord: Record<UnionKey.ThemeLayoutMode, string> = {
  'vertical': '左侧菜单布局，菜单在左，内容在右。',
  'vertical-mix': '左侧双菜单布局，一级菜单在左侧深色区域，二级菜单在左侧浅色区域。',
  'vertical-hybrid-header-first': '左侧混合布局，一级菜单在顶部，二级菜单在左侧深色区域，三级菜单在左侧浅色区域。',
  'horizontal': '顶部菜单布局，菜单在顶部，内容在下方。',
  'top-hybrid-sidebar-first': '顶部混合布局，一级菜单在左侧，二级菜单在顶部。',
  'top-hybrid-header-first': '顶部混合布局，一级菜单在顶部，二级菜单在左侧。',
}

interface Props {
  /** Layout mode */
  mode: UnionKey.ThemeLayoutMode
  /** Disabled */
  disabled?: boolean
}

interface Emits {
  /** Layout mode change */
  (e: 'update:mode', mode: UnionKey.ThemeLayoutMode): void
}

type LayoutConfig = Record<
  UnionKey.ThemeLayoutMode,
  {
    placement: PopoverPlacement
    menuClass: string
    mainClass: string
  }
>

const layoutConfig: LayoutConfig = {
  'vertical': {
    placement: 'bottom',
    menuClass: 'w-1/3 h-full',
    mainClass: 'w-2/3 h-3/4',
  },
  'vertical-mix': {
    placement: 'bottom',
    menuClass: 'w-1/4 h-full',
    mainClass: 'w-2/3 h-3/4',
  },
  'vertical-hybrid-header-first': {
    placement: 'bottom',
    menuClass: 'w-1/4 h-full',
    mainClass: 'w-2/3 h-3/4',
  },
  'horizontal': {
    placement: 'bottom',
    menuClass: 'w-full h-1/4',
    mainClass: 'w-full h-3/4',
  },
  'top-hybrid-sidebar-first': {
    placement: 'bottom',
    menuClass: 'w-full h-1/4',
    mainClass: 'w-2/3 h-3/4',
  },
  'top-hybrid-header-first': {
    placement: 'bottom',
    menuClass: 'w-full h-1/4',
    mainClass: 'w-2/3 h-3/4',
  },
}

function handleChangeMode(mode: UnionKey.ThemeLayoutMode) {
  if (props.disabled)
    return

  emit('update:mode', mode)
}
</script>

<template>
  <div class="grid grid-cols-2 gap-x-16px gap-y-12px md:grid-cols-3">
    <div
      v-for="(item, key) in layoutConfig"
      :key="key"
      class="flex-col-center cursor-pointer"
      @click="handleChangeMode(key)"
    >
      <IconTooltip :placement="item.placement">
        <template #trigger>
          <div
            class="h-64px w-96px gap-6px rd-4px p-6px shadow ring-2 ring-transparent transition-all hover:ring-primary"
            :class="{ '!ring-primary': mode === key }"
          >
            <div class="h-full w-full gap-1" :class="[key.includes('vertical') ? 'flex' : 'flex-col']">
              <slot :name="key" />
            </div>
          </div>
        </template>
        {{ layoutModeDetailRecord[key] }}
      </IconTooltip>
      <p class="mt-8px text-12px">
        {{ themeLayoutModeRecord[key] }}
      </p>
    </div>
  </div>
</template>

<style scoped></style>
