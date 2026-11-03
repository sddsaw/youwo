<script setup lang="ts">
import { computed } from 'vue'
import { useAuth } from '@/hooks/business/auth'
import { useAuthStore } from '@/store/modules/auth'

defineOptions({
  name: 'AuthOrity',
})

const props = withDefaults(defineProps<Props>(), {
  disableMode: false,
  disabledTooltip: '暂无权限',
})

interface Props {
  /** 权限码，支持单个权限码或权限码数组（常用于“全部/管理员”权限） */
  permission: string | string[]
  /** 仅看/操作自己数据时的权限码 */
  ownPermission?: string | string[]
  /** 数据资源的创建者 ID */
  creatorId?: string | number
  /** 是否启用禁用模式，true时无权限显示禁用状态，false时无权限隐藏元素 */
  disableMode?: boolean
  /** 禁用时的提示文本 */
  disabledTooltip?: string
}

const { hasAuth } = useAuth()
const authStore = useAuthStore()

// 检查是否拥有权限
const hasPermission = computed(() => {
  if (props.creatorId !== undefined && props.ownPermission) {
    const isOwner = String(props.creatorId) === authStore.userInfo.userId
    if (isOwner && hasAuth(props.ownPermission)) {
      return true
    }
  }
  return hasAuth(props.permission)
})

// 是否应该显示插槽内容：禁用模式下始终显示，隐藏模式下只有拥有权限才显示
const showSlot = computed(() => props.disableMode || hasPermission.value)

// 是否应该处于禁用状态：仅在启用禁用模式且无权限时禁用
const shouldDisable = computed(() => props.disableMode && !hasPermission.value)
</script>

<template>
  <!-- 禁用模式且有提示文字时，用 NTooltip 包裹以显示提示 -->
  <NTooltip v-if="shouldDisable && disabledTooltip">
    <template #trigger>
      <slot :disabled="shouldDisable" :has-permission="hasPermission" />
    </template>
    {{ disabledTooltip }}
  </NTooltip>

  <!-- 其它情况下直接渲染插槽（如果 showSlot 为真） -->
  <slot v-else-if="showSlot" :disabled="shouldDisable" :has-permission="hasPermission" />
</template>

<style scoped></style>
