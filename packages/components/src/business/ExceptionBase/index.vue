<script lang="ts" setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

defineOptions({ name: 'ExceptionBase' })

const props = withDefaults(defineProps<Props>(), {
  homePath: '/',
  backToHomeText: '返回首页',
})

type ExceptionType = '403' | '404' | '500'

interface Props {
  /**
   * Exception type
   *
   * - 403: no permission
   * - 404: not found
   * - 500: service error
   */
  type: ExceptionType
  homePath?: string
  backToHomeText?: string
}

const router = useRouter()

const iconMap: Record<ExceptionType, string> = {
  403: 'no-permission',
  404: 'not-found',
  500: 'service-error',
}

const icon = computed(() => iconMap[props.type])
</script>

<template>
  <div class="size-full min-h-520px flex-col-center gap-24px overflow-hidden">
    <div class="flex text-400px text-primary">
      <SvgIcon :local-icon="icon" />
    </div>
    <NButton type="primary" @click="router.push(props.homePath)">
      {{ backToHomeText }}
    </NButton>
  </div>
</template>

<style scoped></style>
