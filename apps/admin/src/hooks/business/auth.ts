import { computed } from 'vue'
import { useAuthStore } from '@/store/modules/auth'

/**
 * 认证权限Hook
 * @returns 包含权限检查方法的对象
 */
export function useAuth() {
  const authStore = useAuthStore()
  const buttons = computed(() => authStore.userInfo.buttons)

  /**
   * 检查是否拥有指定权限码
   * @param codes 单个权限码或权限码数组
   * @returns 是否拥有权限
   */
  function hasAuth(codes: string | string[]) {
    // 如果未登录
    if (!authStore.isLogin) {
      return false
    }
    // 如果是单个权限码
    if (typeof codes === 'string') {
      return buttons.value.includes(codes)
    }
    // 如果是多个权限码
    return codes.some(code => buttons.value.includes(code))
  }

  return {
    hasAuth,
  }
}
