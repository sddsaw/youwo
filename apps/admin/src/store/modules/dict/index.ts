import { defineStore } from 'pinia'
import { ref } from 'vue'
import { SetupStoreId } from '@/enum'

export interface DictItem {
  label: string
  value: string
  type?: 'default' | 'primary' | 'info' | 'success' | 'warning' | 'error'
}

export const useDictStore = defineStore(SetupStoreId.Dict, () => {
  const dictMap = ref<Record<string, DictItem[]>>({})

  /**
   * 模拟从后端接口获取全部字典配置
   */
  async function fetchAllDicts() {
    await new Promise(resolve => setTimeout(resolve, 150))
  }

  return {
    dictMap,
    fetchAllDicts,
  }
})
