<script setup lang="tsx">
import type { FormInst, FormItemRule, FormProps } from 'naive-ui'
import type { SchemaFormOptions } from './types'
import { NForm, NFormItemGi, NGrid } from 'naive-ui'
import { computed, ref, watch } from 'vue'
import SchemaFormItem from './components/SchemaFormItem.vue'

/**
 * SchemaForm 组件 Props 类型定义
 * 继承 Naive UI 的 FormProps（去除 rules 和 model），确保能透传所有官方 Form 属性
 */
export interface SchemaFormProps extends /* @vue-ignore */ Omit<FormProps, 'rules' | 'model'> {
  /** 表单项配置列表 */
  options: SchemaFormOptions[]
  /** 网格布局总列数，默认 24 */
  cols?: number | string
  /** 网格横向间距，默认 16 */
  xGap?: number | string
  /** 网格纵向间距，默认 0 */
  yGap?: number | string
  /** 响应式模式，默认 'screen' */
  responsive?: 'screen' | 'self'
}

/**
 * SchemaForm 配置化表单组件
 * 采用数据配置项方式渲染表单，支持常用的 Naive UI 表单控件及插槽自定义扩展，内置完善的校验接口暴露。
 */
defineOptions({
  name: 'SchemaForm',
})

const props = withDefaults(
  defineProps<SchemaFormProps>(),
  {
    cols: 24,
    xGap: 16,
    yGap: 0,
    responsive: 'screen',
  },
)

const model = defineModel<Record<string, any>>('model', { required: true })

// Naive UI 内部 Form 实例引用
const formRef = ref<FormInst | null>(null)

// 动态提取配置项中的验证规则，并进行严格类型转换
const rules = computed(() =>
  props.options.reduce<Record<string, FormItemRule | FormItemRule[]>>((acc, item) => {
    if (item.value && item.rules) {
      acc[item.value] = item.rules
    }
    return acc
  }, {}),
)

// 提取用于传递给 NForm 的属性（过滤掉组件自身的配置属性）
const formAttrs = computed(() => {
  const { cols, options, xGap, yGap, responsive, ...rest } = props
  return rest
})

// 监听配置项字段变化，自动初始化默认值且不覆盖已有内容（避免对含函数/VNode的 options 进行 deep 深度监听）
watch(
  () => props.options.map(item => item.value),
  () => {
    props.options.forEach((item) => {
      if (item.value && model.value[item.value] === undefined) {
        model.value[item.value] = item.defaultValue !== undefined ? item.defaultValue : null
      }
    })
  },
  { immediate: true },
)

/** 表单校验方法 */
async function validate() {
  return formRef.value?.validate()
}

/** 还原表单校验状态 */
function restoreValidation() {
  formRef.value?.restoreValidation()
}

defineExpose({
  validate,
  restoreValidation,
})
</script>

<template>
  <NForm ref="formRef" :model="model" :rules="rules" v-bind="{ ...formAttrs, ...$attrs }">
    <NGrid :cols="props.cols" :x-gap="props.xGap" :y-gap="props.yGap" :responsive="props.responsive" item-responsive>
      <NFormItemGi
        v-for="(item, index) in props.options"
        :key="item.value || index"
        :label="item.label"
        :path="item.value"
        :span="item.span || 24"
        v-bind="item.formItemAttrs"
      >
        <!-- 支持自定义插槽渲染特定内容 -->
        <template v-if="item.type === 'slot'">
          <slot :name="item.value" :model="model" :value="model[item.value]" />
        </template>

        <!-- 渲染内置映射组件（委托给子组件 SchemaFormItem 处理） -->
        <SchemaFormItem
          v-else
          v-model="model[item.value]"
          :item="item"
          :form-model="model"
        />
      </NFormItemGi>
    </NGrid>
  </NForm>
</template>

<style scoped></style>
