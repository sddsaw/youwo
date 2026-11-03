import { computed } from 'vue'
import { useDictStore } from '@/store/modules/dict'

/**
 * 通用字典/枚举 Hook
 * @param code 字典分类编码
 */
export function useDict(code: string) {
  const dictStore = useDictStore()

  // 响应式获取对应 code 的选项列表
  const options = computed(() => dictStore.dictMap[code] || [])

  /**
   * 将字典值（value）翻译成其对应的标签（label）
   * @param value 字典值
   */
  const translate = (value: any) => {
    const item = options.value.find(opt => opt.value === String(value))
    return item ? item.label : value
  }

  return {
    options,
    translate,
  }
}
