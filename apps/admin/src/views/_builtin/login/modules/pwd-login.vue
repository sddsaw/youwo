<script setup lang="ts">
import { computed, reactive } from 'vue'
import { loginModuleRecord } from '@/constants/app'
import { useFormRules, useNaiveForm } from '@/hooks/common/form'
import { useRouterPush } from '@/hooks/common/router'
import { useAuthStore } from '@/store/modules/auth'

defineOptions({
  name: 'PwdLogin',
})

const authStore = useAuthStore()
const { toggleLoginModule } = useRouterPush()
const { formRef, validate } = useNaiveForm()

interface FormModel {
  userName: string
  password: string
}

const model: FormModel = reactive({
  userName: 'Soybean',
  password: '123456',
})

const rules = computed<Record<keyof FormModel, App.Global.FormRule[]>>(() => {
  const { formRules } = useFormRules()

  return {
    userName: formRules.userName,
    password: formRules.pwd,
  }
})

async function handleSubmit() {
  await validate()
  await authStore.login(model.userName, model.password)
}
</script>

<template>
  <NForm ref="formRef" :model="model" :rules="rules" size="large" :show-label="false" @keyup.enter="handleSubmit">
    <NFormItem path="userName">
      <NInput v-model:value="model.userName" placeholder="请输入用户名" />
    </NFormItem>
    <NFormItem path="password">
      <NInput
        v-model:value="model.password"
        type="password"
        show-password-on="click"
        placeholder="请输入密码"
      />
    </NFormItem>
    <NSpace vertical :size="24">
      <div class="flex-y-center justify-between">
        <NCheckbox>{{ '记住我' }}</NCheckbox>
        <NButton quaternary @click="toggleLoginModule('reset-pwd')">
          {{ '忘记密码？' }}
        </NButton>
      </div>
      <NButton type="primary" size="large" round block :loading="authStore.loginLoading" @click="handleSubmit">
        {{ '确认' }}
      </NButton>
      <div class="flex-y-center justify-between gap-12px">
        <NButton class="flex-1" block @click="toggleLoginModule('code-login')">
          {{ loginModuleRecord['code-login'] }}
        </NButton>
        <NButton class="flex-1" block @click="toggleLoginModule('register')">
          {{ loginModuleRecord.register }}
        </NButton>
      </div>
    </NSpace>
  </NForm>
</template>

<style scoped></style>
