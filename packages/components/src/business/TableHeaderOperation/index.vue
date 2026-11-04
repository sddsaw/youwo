<script setup lang="ts">
import type { TableColumnCheck } from '@sa/hooks'
import { $t } from '@/locales'
import SvgIcon from '../../basic/SvgIcon/index.vue'
import TableColumnSetting from '../TableColumnSetting/index.vue'

defineOptions({
  name: 'TableHeaderOperation',
})

defineProps<Props>()

const emit = defineEmits<Emits>()

type Align = 'stretch' | 'baseline' | 'start' | 'end' | 'center' | 'flex-end' | 'flex-start'

interface Props {
  itemAlign?: Align
  disabledDelete?: boolean
  loading?: boolean
}

interface Emits {
  (e: 'add'): void
  (e: 'delete'): void
  (e: 'refresh'): void
}

const columns = defineModel<TableColumnCheck[]>('columns', {
  default: () => [],
})

function add() {
  emit('add')
}

function batchDelete() {
  emit('delete')
}

function refresh() {
  emit('refresh')
}
</script>

<template>
  <NSpace :align="itemAlign" wrap justify="end" class="lt-sm:w-200px">
    <slot name="prefix" />
    <slot name="default">
      <NButton size="small" ghost type="primary" @click="add">
        <template #icon>
          <SvgIcon icon="ic:round-plus" class="text-icon" />
        </template>
        {{ $t('common.add') }}
      </NButton>
      <NPopconfirm @positive-click="batchDelete">
        <template #trigger>
          <NButton size="small" ghost type="error" :disabled="disabledDelete">
            <template #icon>
              <SvgIcon icon="ic:round-delete" class="text-icon" />
            </template>
            {{ $t('common.batchDelete') }}
          </NButton>
        </template>
        {{ $t('common.confirmDelete') }}
      </NPopconfirm>
    </slot>
    <NButton size="small" @click="refresh">
      <template #icon>
        <SvgIcon icon="mdi:refresh" class="text-icon" :class="{ 'animate-spin': loading }" />
      </template>
      {{ $t('common.refresh') }}
    </NButton>
    <TableColumnSetting v-model:columns="columns" />
    <slot name="suffix" />
  </NSpace>
</template>

<style scoped></style>
