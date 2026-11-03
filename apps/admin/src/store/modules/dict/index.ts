import { defineStore } from 'pinia'
import { SetupStoreId } from '@/enum'
import { dictDataMap } from '@/views/system/dict/components/db'

export const useDictStore = defineStore(SetupStoreId.Dict, () => {
  // 直接引用 db.ts 中的响应式数据。
  // 页面上增删改 dictDataMap 时，全局 useDict 会通过引用自动实时拿到更新，不需要任何手动同步逻辑。
  const dictMap = dictDataMap

  /**
   * 模拟从后端接口获取全部字典配置
   */
  async function fetchAllDicts() {
    // 模拟接口网络延时
    await new Promise(resolve => setTimeout(resolve, 150))
    // 实际项目中在这里请求并赋值给 dictMap:
    // const { data } = await fetchGetAllDicts()
    // dictMap.value = data
  }

  return {
    dictMap,
    fetchAllDicts,
  }
})
