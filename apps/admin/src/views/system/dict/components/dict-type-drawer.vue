<script setup lang="ts">
import { useNaiveForm, useResetReactive } from '@sa/hooks'
import { NButton, NDrawer, NDrawerContent, NForm, NFormItem, NInput, NRadio, NRadioGroup, NSpace } from 'naive-ui'
import { computed, watch } from 'vue'
import { dictDataMap, dictTypes } from './db'

defineOptions({
  name: 'DictTypeDrawer',
})

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

interface Props {
  operateType: NaiveUI.TableOperateType
  dictId?: string | null
}

interface Emits {
  (e: 'submitted'): void
}

const visible = defineModel<boolean>('visible', {
  default: false,
})

const { formRef, validate, restoreValidation } = useNaiveForm()

const title = computed(() => (props.operateType === 'add' ? '新增字典类型' : '编辑字典类型'))
const isEdit = computed(() => props.operateType === 'edit')

const [model, resetModel] = useResetReactive({
  id: '',
  name: '',
  code: '',
  status: '1' as '1' | '2',
  remark: '',
})

const rules = {
  name: { required: true, message: '请输入字典名称', trigger: 'blur' },
  code: { required: true, message: '请输入字典编码', trigger: 'blur' },
  status: { required: true, message: '请选择状态', trigger: 'change' },
}

async function handleInitModel() {
  resetModel()
  if (isEdit.value && props.dictId) {
    const data = dictTypes.value.find(item => item.id === props.dictId)
    if (data) {
      Object.assign(model, data)
    }
  }
}

function closeDrawer() {
  visible.value = false
}

async function handleSubmit() {
  await validate()

  const isEditMode = isEdit.value

  if (isEditMode) {
    const index = dictTypes.value.findIndex(item => item.id === props.dictId)
    if (index > -1) {
      const oldCode = dictTypes.value[index].code
      const newCode = model.code

      // Check code uniqueness if changed
      if (oldCode !== newCode && dictTypes.value.some((t, i) => i !== index && t.code === newCode)) {
        window.$message?.error('字典编码已存在，请重新输入')
        return
      }

      // Update data map code
      if (oldCode !== newCode) {
        dictDataMap.value[newCode] = dictDataMap.value[oldCode] || []
        delete dictDataMap.value[oldCode]
      }

      dictTypes.value[index] = {
        ...dictTypes.value[index],
        name: model.name,
        code: newCode,
        status: model.status,
        remark: model.remark,
      }
      window.$message?.success('更新成功')
      closeDrawer()
      emit('submitted')
    }
  }
  else {
    // Check code uniqueness
    if (dictTypes.value.some(t => t.code === model.code)) {
      window.$message?.error('字典编码已存在，请重新输入')
      return
    }

    const now = new Date()
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
    const newId = String(Date.now())

    dictTypes.value.push({
      id: newId,
      name: model.name,
      code: model.code,
      status: model.status,
      remark: model.remark,
      createTime: timeStr,
    })
    dictDataMap.value[model.code] = []

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
        <NFormItem label="字典名称" path="name">
          <NInput v-model:value="model.name" placeholder="请输入字典名称" />
        </NFormItem>
        <NFormItem label="字典类型" path="code">
          <NInput v-model:value="model.code" placeholder="请输入字典类型 (如 sys_sex)" :disabled="isEdit" />
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
