<script setup lang="ts">
import type { SchemaFormOptions } from '@sa/components'
import { SchemaForm } from '@sa/components'
import { useNaiveForm, useResetReactive } from '@sa/hooks'

// ==========================================
// 1. SchemaForm 响应式表单数据源定义
// ==========================================
const [formData, resetForm] = useResetReactive({
  username: '',
  password: '',
  age: null,
  gender: 'male',
  roleId: null,
  city: null,
  birthday: null,
  workRange: null,
  meetingTime: null,
  enableStatus: true,
  interests: [],
  bio: '',
  customRemark: '',
  avatar: '',
  files: [],
})

// 模拟异步请求角色选项数据的 API
async function fetchRoleListApi() {
  await new Promise(resolve => setTimeout(resolve, 500))
  return {
    error: null,
    data: [
      { id: 'admin', name: '超级管理员' },
      { id: 'editor', name: '系统编辑' },
      { id: 'user', name: '普通用户' },
      { id: 'guest', name: '访客' },
    ],
    response: {} as any,
  }
}

const { formRef, validate, restoreValidation } = useNaiveForm()

// ==========================================
// 2. SchemaForm 配置项定义 (全功能展示)
// ==========================================
const formOptions = ref<SchemaFormOptions[]>([
  {
    value: 'username',
    label: '用户名',
    type: 'input',
    defaultValue: 'SoybeanAdmin',
    rules: { required: true, message: '请输入用户名', trigger: 'blur' },
    span: '24 s:12',
    attrs: {
      placeholder: '请输入用户名',
      clearable: true,
      maxlength: 20,
    },
  },
  {
    value: 'password',
    label: '密码',
    type: 'input',
    rules: { required: true, message: '请输入密码', trigger: 'blur' },
    span: '24 s:12',
    attrs: {
      type: 'password',
      showPasswordOn: 'click',
      placeholder: '请输入密码',
    },
  },
  {
    value: 'age',
    label: '年龄',
    type: 'input-number',
    span: '24 s:12',
    attrs: {
      min: 1,
      max: 120,
      placeholder: '请输入年龄',
      clearable: true,
    },
  },
  {
    value: 'gender',
    label: '性别',
    type: 'radio',
    defaultValue: 'male',
    span: '24 s:12',
    options: [
      { label: '男', value: 'male' },
      { label: '女', value: 'female' },
    ],
  },
  {
    value: 'roleId',
    label: '所属角色 (异步加载)',
    type: 'select',
    span: '24 s:12',
    options: async () => {
      const res = await fetchRoleListApi()
      return (res.data || []).map(item => ({
        label: item.name,
        value: item.id,
      }))
    },
    attrs: {
      placeholder: '请选择角色',
      clearable: true,
    },
  },
  {
    value: 'city',
    label: '常住城市 (静态选项)',
    type: 'select',
    span: '24 s:12',
    options: [
      { label: '北京', value: 'bj' },
      { label: '上海', value: 'sh' },
      { label: '广州', value: 'gz' },
      { label: '深圳', value: 'sz' },
    ],
    attrs: {
      placeholder: '请选择城市',
      clearable: true,
    },
  },
  {
    value: 'birthday',
    label: '出生日期',
    type: 'date-picker',
    span: '24 s:12',
    attrs: {
      type: 'date',
      placeholder: '请选择出生日期',
      clearable: true,
    },
  },
  {
    value: 'workRange',
    label: '在职时间 (日期范围)',
    type: 'date-picker',
    span: '24 s:12',
    attrs: {
      type: 'daterange',
      startPlaceholder: '开始日期',
      endPlaceholder: '结束日期',
      clearable: true,
      valueFormat: 'yyyy-MM-dd',
      format: 'yyyy-MM-dd',
    },
  },
  {
    value: 'meetingTime',
    label: '日常例会时间',
    type: 'time-picker',
    span: '24 s:12',
    attrs: {
      placeholder: '请选择时间',
      clearable: true,
    },
  },
  {
    value: 'enableStatus',
    label: '启用状态',
    type: 'switch',
    defaultValue: true,
    span: '24 s:12',
  },
  {
    value: 'interests',
    label: '兴趣爱好',
    type: 'checkbox',
    span: '24 s:12',
    options: [
      { label: '阅读', value: 'read' },
      { label: '运动', value: 'sport' },
      { label: '音乐', value: 'music' },
      { label: '旅游', value: 'travel' },
    ],
  },
  {
    value: 'bio',
    label: '个人简介',
    type: 'input',
    span: 24,
    attrs: {
      type: 'textarea',
      placeholder: '请简单介绍一下自己...',
      rows: 3,
      maxlength: 200,
      showCount: true,
    },
  },
  {
    value: 'avatar',
    label: '上传头像',
    type: 'upload',
    span: 24,
    attrs: {
      max: 1,
      multiple: false,
      accept: 'image/*',
      listType: 'image-card',
      cropper: true,
      cropperAspectRatio: 1,
      cropperPreviewRound: true,
      // 监听上传成功事件
      onUploadSuccess: (url) => {
        window.$message?.success(`上传文件成功！云端地址为: ${url}`)
      },
    },
  },
  {
    value: 'files',
    label: '拖拽上传文件',
    type: 'upload',
    span: 24,
    attrs: {
      max: 5,
      accept: '*',
      listType: 'text',
      isDirectoryDnd: true,
    },
  },
  {
    value: 'customRemark',
    label: '自定义插槽扩展',
    type: 'slot',
    span: 24,
  },
])

// ==========================================
// 3. 表单操作方法
// ==========================================
async function handleValidate() {
  try {
    await validate()
    window.$message?.success('表单校验通过！')
  }
  catch {
    window.$message?.error('表单校验失败，请检查输入项')
  }
}

function handleReset() {
  restoreValidation()
  resetForm()
}
</script>

<template>
  <NSpace vertical :size="20" class="p-6">
    <NAlert title="SchemaForm 配置化表单全功能演示" type="info" bordered>
      本页面展示了基于 Naive UI 封装的 SchemaForm 表单组件。通过高度配置化的 JSON 结构即可快速生成各种类型的表单项，并支持内置规则校验、异步数据获取、响应式栅格布局（span）以及自定义插槽扩展。
    </NAlert>

    <NGrid :x-gap="16" :y-gap="16" cols="24" item-responsive responsive="screen">
      <!-- 左侧：SchemaForm 演示 -->
      <NGi span="24 l:15">
        <NCard title="🛠️ SchemaForm 表单实例" class="h-full">
          <SchemaForm
            ref="formRef"
            v-model:model="formData"
            :options="formOptions"
            :cols="24"
            :x-gap="16"
            :y-gap="12"
            label-placement="left"
            :label-width="150"
          >
            <!-- 绑定对应 value 为 'customRemark' 的自定义插槽 -->
            <template #customRemark="{ model }">
              <NSpace align="center" :wrap="false" class="w-full">
                <NInput
                  v-model:value="model.customRemark"
                  placeholder="在自定义插槽中输入备注..."
                  clearable
                />
                <NButton type="primary" @click="model.customRemark = '已通过插槽按钮快速填充'">
                  快捷填充
                </NButton>
              </NSpace>
            </template>
          </SchemaForm>

          <template #action>
            <NSpace justify="end">
              <NButton v-track="'form_reset_click'" @click="handleReset">
                重置表单
              </NButton>
              <NButton type="primary" @click="handleValidate">
                提交校验
              </NButton>
            </NSpace>
          </template>
        </NCard>
      </NGi>

      <!-- 右侧：SchemaForm 实时绑定的数据 JSON 展示 -->
      <NGi span="24 l:9">
        <NCard title="📊 formData 响应式数据源监视" class="h-full">
          <pre class="rounded bg-gray-50 p-4 text-12px text-gray-700 dark:bg-gray-800 dark:text-gray-300">{{ JSON.stringify(formData, null, 2) }}</pre>
        </NCard>
      </NGi>
    </NGrid>
  </NSpace>
</template>

<style scoped>
.h-full {
  height: 100%;
}
</style>
