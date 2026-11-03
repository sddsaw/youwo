<script setup lang="ts">
import { useNaiveForm, useResetReactive } from '@sa/hooks'
import { NButton, NDrawer, NDrawerContent, NForm, NFormItem, NInput, NInputNumber, NRadio, NRadioGroup, NSpace } from 'naive-ui'
import { computed, watch } from 'vue'
import { dictDataMap } from './db'

defineOptions({
  name: 'DictDataDrawer',
})

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

interface Props {
  operateType: NaiveUI.TableOperateType
  dictTypeCode: string
  dataId?: string | null
}

interface Emits {
  (e: 'submitted'): void
}

const visible = defineModel<boolean>('visible', {
  default: false,
})

const { formRef, validate, restoreValidation } = useNaiveForm()

const title = computed(() => (props.operateType === 'add' ? '新增字典数据' : '编辑字典数据'))
const isEdit = computed(() => props.operateType === 'edit')

const [model, resetModel] = useResetReactive({
  id: '',
  label: '',
  value: '',
  sort: 1,
  status: '1' as '1' | '2',
  remark: '',
})

const rules = {
  label: { required: true, message: '请输入数据标签', trigger: 'blur' },
  value: { required: true, message: '请输入数据键值', trigger: 'blur' },
  status: { required: true, message: '请选择状态', trigger: 'change' },
}

async function handleInitModel() {
  resetModel()
  if (isEdit.value && props.dataId && props.dictTypeCode) {
    const list = dictDataMap.value[props.dictTypeCode] || []
    const data = list.find(item => item.id === props.dataId)
    if (data) {
      Object.assign(model, data)
    }
  }
  else if (props.dictTypeCode) {
    model.sort = (dictDataMap.value[props.dictTypeCode]?.length || 0) + 1
  }
}

function closeDrawer() {
  visible.value = false
}

async function handleSubmit() {
  await validate()

  const list = dictDataMap.value[props.dictTypeCode] || []
  const isEditMode = isEdit.value

  if (isEditMode) {
    const index = list.findIndex(item => item.id === props.dataId)
    if (index > -1) {
      // Check value uniqueness
      if (list.some((d, i) => i !== index && d.value === model.value)) {
        window.$message?.error('数据键值已存在，请重新输入')
        return
      }
      list[index] = {
        id: model.id,
        label: model.label,
        value: model.value,
        sort: model.sort,
        status: model.status,
        remark: model.remark,
      }
      list.sort((a, b) => a.sort - b.sort)
      window.$message?.success('更新成功')
      closeDrawer()
      emit('submitted')
    }
  }
  else {
    // Check value uniqueness
    if (list.some(d => d.value === model.value)) {
      window.$message?.error('数据键值已存在，请重新输入')
      return
    }

    const newId = String(Date.now())
    list.push({
      id: newId,
      label: model.label,
      value: model.value,
      sort: model.sort,
      status: model.status,
      remark: model.remark,
    })
    list.sort((a, b) => a.sort - b.sort)

    window.$message?.success('添加成功')
    closeDrawer()
    emit('submitted')
  }
}

watch(visible, async (val) => {
  if (val) {
    await handleInitModel()
    restoreValidation()
  }
})
</script>

<template>
  <NDrawer v-model:show="visible" display-directive="show" :width="360">
    <NDrawerContent :title="title" :native-scrollbar="false" closable>
      <NForm ref="formRef" :model="model" :rules="rules" label-placement="left" :label-width="80">
        <NFormItem label="字典类型" path="dictTypeCode">
          <NInput :value="props.dictTypeCode" disabled />
        </NFormItem>
        <NFormItem label="数据标签" path="label">
          <NInput v-model:value="model.label" placeholder="请输入数据标签" />
        </NFormItem>
        <NFormItem label="数据键值" path="value">
          <NInput v-model:value="model.value" placeholder="请输入数据键值" />
        </NFormItem>
        <NFormItem label="显示排序" path="sort">
          <NInputNumber v-model:value="model.sort" :min="1" />
        </NFormItem>
        <NFormItem label="状态" path="status">
          <NRadioGroup v-model:value="model.status">
            <NSpace>
              <NRadio value="1">
                正常
              </NRadio>
              <NRadio value="2">
                停用
              </NRadio>
            </NSpace>
          </NRadioGroup>
        </NFormItem>
        <NFormItem label="备注" path="remark">
          <NInput v-model:value="model.remark" type="textarea" placeholder="请输入备注" :rows="3" />
        </NFormItem>
      </NForm>
      <template #footer>
        <NSpace :size="16">
          <NButton @click="closeDrawer">
            取消
          </NButton>
          <NButton type="primary" @click="handleSubmit">
            确认
          </NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>

<style scoped></style>
