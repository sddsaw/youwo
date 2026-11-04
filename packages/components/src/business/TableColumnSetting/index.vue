<script setup lang="ts" generic="T extends Record<string, unknown>, K = never">
import type { TableColumnCheck } from '@sa/hooks'
import { NScrollbar } from 'naive-ui'
import { computed } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import { $t } from '@/locales'
import ButtonIcon from '../../basic/ButtonIcon/index.vue'
import SvgIcon from '../../basic/SvgIcon/index.vue'

defineOptions({
  name: 'TableColumnSetting',
})

const columns = defineModel<TableColumnCheck[]>('columns', {
  required: true,
})

const tooltipRecord: Record<'left' | 'right' | 'unFixed', string> = {
  left: '右固定',
  right: '取消固定',
  unFixed: '左固定',
}

function handleFixed(column: TableColumnCheck) {
  const fixedOptions: ('left' | 'right' | 'unFixed')[] = ['left', 'right', 'unFixed']
  const index = fixedOptions.findIndex(item => item === column.fixed)
  const nextIndex = index === fixedOptions.length - 1 ? 0 : index + 1
  column.fixed = fixedOptions[nextIndex]
}

const visibleStats = computed(() => {
  let total = 0
  let checked = 0

  columns.value.forEach((column) => {
    if (!column.visible)
      return

    total += 1
    if (column.checked)
      checked += 1
  })

  return { total, checked }
})

const selectAllChecked = computed(() => {
  const { total, checked } = visibleStats.value

  return total > 0 && checked === total
})

const selectAllIndeterminate = computed(() => {
  const { total, checked } = visibleStats.value

  return checked > 0 && checked < total
})

function toggleSelectAll(checked: boolean) {
  columns.value.forEach((column) => {
    if (!column.visible)
      return

    column.checked = checked
  })
}
</script>

<template>
  <NPopover placement="bottom-end" trigger="click">
    <template #trigger>
      <NButton size="small">
        <template #icon>
          <SvgIcon icon="ant-design:setting-outlined" class="text-icon" />
        </template>
        {{ $t('common.columnSetting') }}
      </NButton>
    </template>
    <div>
      <div class="h-36px flex-y-center rd-4px pl-26px hover:(bg-primary bg-opacity-20)">
        <NCheckbox
          :checked="selectAllChecked"
          :indeterminate="selectAllIndeterminate"
          :disabled="visibleStats.total === 0"
          class="flex-1"
          @update:checked="toggleSelectAll"
        >
          {{ $t('common.selectAll') }}
        </NCheckbox>
      </div>
      <NDivider class="!my-4px" />
      <NScrollbar class="max-h-[200px] pr-12px">
        <VueDraggable v-model="columns" :animation="150" filter=".none_draggable">
          <div
            v-for="item in columns"
            :key="item.key"
            class="h-36px flex-y-center justify-between gap-6px"
            :class="{ hidden: !item.visible }"
          >
            <div class="h-full flex-y-center flex-1 rd-4px hover:(bg-primary bg-opacity-20)">
              <SvgIcon icon="mdi:drag" class="mr-8px h-full cursor-move text-icon" />
              <NCheckbox v-model:checked="item.checked" class="none_draggable flex-1">
                <template v-if="typeof item.title === 'function'">
                  <component :is="item.title" />
                </template>
                <template v-else>
                  {{ item.title }}
                </template>
              </NCheckbox>
            </div>
            <ButtonIcon
              :disabled="!item.checked"
              :focusable="false"
              :tooltip-content="tooltipRecord[item.fixed! || 'unFixed']"
              @click="handleFixed(item)"
            >
              <SvgIcon v-if="!item.fixed || item.fixed === 'unFixed'" icon="octicon:pin-16" />
              <SvgIcon v-else-if="item.fixed === 'left'" icon="octicon:pin-16" class="rotate-270" />
              <SvgIcon v-else icon="octicon:pin-slash-16" />
            </ButtonIcon>
          </div>
        </VueDraggable>
      </NScrollbar>
    </div>
  </NPopover>
</template>

<style scoped></style>
