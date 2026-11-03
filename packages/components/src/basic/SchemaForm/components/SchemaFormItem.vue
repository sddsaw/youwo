<script setup lang="tsx">
import type { OptionItem, SchemaFormOptions } from '../types'
import {
  NDatePicker,
  NInput,
  NInputNumber,
  NSelect,
  NSwitch,
  NTimePicker,
} from 'naive-ui'
import { computed, defineAsyncComponent, ref, watchEffect } from 'vue'
import { OptionsCheckboxGroup, OptionsRadioGroup } from './OptionsGroup'

const props = defineProps<{
  item: SchemaFormOptions
  formModel: Record<string, any>
}>()

const FileUpload = defineAsyncComponent(() => import('../../../business/FileUpload/index.vue'))
const RichEditor = defineAsyncComponent(() => import('../../RichEditor/index.vue'))

const value = defineModel<any>()

const modelKey = computed(() => {
  if (props.item.type === 'date-picker' && props.item.attrs?.valueFormat) {
    return 'formatted-value'
  }
  return 'value'
})

// 映射组件关系
const componentMap = {
  'input': NInput,
  'select': NSelect,
  'switch': NSwitch,
  'date-picker': NDatePicker,
  'checkbox': OptionsCheckboxGroup,
  'radio': OptionsRadioGroup,
  'input-number': NInputNumber,
  'time-picker': NTimePicker,
  'rich-editor': RichEditor,
  'upload': FileUpload,
  'slot': null,
} as const

// 缓存解析后的选项列表
const localOptions = ref<OptionItem[]>([])

// 独立的 watchEffect 用于解析每个项的 options 配置，增加竞态过期清理守卫
let optionReqId = 0
watchEffect(async (onCleanup) => {
  let cancelled = false
  onCleanup(() => {
    cancelled = true
  })

  const optConfig = props.item.options
  if (Array.isArray(optConfig)) {
    localOptions.value = optConfig
  }
  else if (typeof optConfig === 'function') {
    const reqId = ++optionReqId
    try {
      const res = await optConfig(props.formModel)
      if (!cancelled && reqId === optionReqId) {
        localOptions.value = res
      }
    }
    catch (err) {
      console.error(`Failed to load options for field: ${props.item.value}`, err)
    }
  }
})

/**
 * 合并具体输入组件的透传属性（混入解析后的 options）
 */
function getComponentAttrs(): Record<string, unknown> {
  const baseAttrs = (props.item.attrs || {}) as Record<string, unknown>
  return localOptions.value.length ? { ...baseAttrs, options: localOptions.value } : baseAttrs
}
</script>

<template>
  <component
    :is="componentMap[props.item.type as keyof typeof componentMap]"
    v-if="componentMap[props.item.type as keyof typeof componentMap]"
    v-model:[modelKey]="value"
    class="w-full"
    v-bind="getComponentAttrs()"
  />
</template>
