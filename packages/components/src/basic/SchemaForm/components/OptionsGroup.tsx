import type { OptionItem } from '../types'
import {
  NCheckbox,
  NCheckboxGroup,
  NRadio,
  NRadioGroup,
  NSpace,
} from 'naive-ui'
import { defineComponent } from 'vue'

/**
 * 多选框组封装组件 (TSX)
 * 包装 NCheckboxGroup 并自动循环渲染子 NCheckbox 选项
 */
export const OptionsCheckboxGroup = defineComponent({
  name: 'OptionsCheckboxGroup',
  props: {
    value: Array as () => (string | number)[],
    options: Array as () => OptionItem[],
  },
  emits: ['update:value'],
  setup(props, { emit, attrs }) {
    return () => (
      <NCheckboxGroup
        value={props.value}
        onUpdateValue={val => emit('update:value', val)}
        class="w-full"
        {...attrs}
      >
        <NSpace>
          {props.options?.map(opt => (
            <NCheckbox key={String(opt.value)} value={opt.value} label={opt.label} />
          ))}
        </NSpace>
      </NCheckboxGroup>
    )
  },
})

/**
 * 单选框组封装组件 (TSX)
 * 包装 NRadioGroup 并自动循环渲染子 NRadio 选项
 */
export const OptionsRadioGroup = defineComponent({
  name: 'OptionsRadioGroup',
  props: {
    value: [String, Number, Boolean] as unknown as () => string | number | boolean | null,
    options: Array as () => OptionItem[],
  },
  emits: ['update:value'],
  setup(props, { emit, attrs }) {
    return () => (
      <NRadioGroup
        value={props.value as string | number | null}
        onUpdateValue={val => emit('update:value', val)}
        class="w-full"
        {...attrs}
      >
        <NSpace>
          {props.options?.map(opt => (
            <NRadio key={String(opt.value)} value={opt.value} label={opt.label} />
          ))}
        </NSpace>
      </NRadioGroup>
    )
  },
})
