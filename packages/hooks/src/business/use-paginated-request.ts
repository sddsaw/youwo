import type { AxiosError, FlatResponseData } from '@sa/axios'
import type { Ref } from 'vue'
import { computed, onMounted, ref } from 'vue'
import useLoading from '../basic/use-loading'

/**
 * 分页请求参数接口
 */
interface PaginationParams {
  /** 当前页码，从 1 开始 */
  current: number
  /** 每页条数 */
  pageSize: number
}

/**
 * 分页响应数据标准格式
 * @template T 列表数据项类型
 */
interface PaginatedData<T = any> {
  /** 当前页列表数据 */
  list: T[]
  /** 数据总条数 */
  total?: number
  /** 当前页码 */
  current?: number
  /** 单页大小 */
  pageSize?: number
  /** 是否还有更多数据（不传则基于 total 自动计算） */
  hasMore?: boolean
}

/**
 * 分页请求配置项
 * @template T 列表数据项类型
 * @template RawData 接口返回的原始数据类型
 */
interface UsePaginatedRequestOptions<T = any, RawData = any> {
  /** 是否手动触发请求，默认 false（即组件挂载时自动请求） */
  manual?: boolean
  /** 默认单页条数，默认 10 */
  defaultPageSize?: number
  /** 默认起始页码，默认 1 */
  defaultCurrent?: number
  /** 列表初始值 */
  initialValue?: T[]
  /** 接口响应数据转换器，用于兼容不同的后端分页结构 */
  transform?: (data: RawData) => PaginatedData<T>
}

/**
 * 分页元信息
 */
interface PaginationInfo {
  /** 当前页码 */
  current: number
  /** 每页条数 */
  pageSize: number
  /** 总数据量 */
  total: number
  /** 是否还有更多数据 */
  hasMore: boolean
}

/**
 * 搭配 InfiniteScroll 组件使用的分页/滚动加载请求 Hook
 *
 * @template T 列表数据项类型
 * @template ResponseData 接口响应的错误/辅助类型，默认 any
 * @template RawData 接口成功响应的原始数据类型，默认 any
 *
 * @param promiseFunction 请求执行器，接收当前页码与条数，返回 FlatResponse 格式数据
 * @param options 配置选项
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { usePaginatedRequest } from '@sa/hooks'
 * import { InfiniteScroll } from '@sa/components'
 * import { fetchUserList } from '@/service/api'
 *
 * const {
 *   data: list,
 *   loading,
 *   loadingMore,
 *   pagination,
 *   loadMore,
 *   run
 * } = usePaginatedRequest(fetchUserList, {
 *   defaultPageSize: 20,
 *   transform: (res) => ({
 *     list: res.records,
 *     total: res.total,
 *   })
 * })
 * </script>
 *
 * <template>
 *   <div class="h-400px">
 *     <InfiniteScroll
 *       :has-more="pagination.hasMore"
 *       :loading="loadingMore"
 *       @load="loadMore"
 *     >
 *       <div v-for="item in list" :key="item.id" class="p-4 border-b">
 *         {{ item.name }}
 *       </div>
 *     </InfiniteScroll>
 *   </div>
 * </template>
 * ```
 */
export function usePaginatedRequest<T = any, ResponseData = any, RawData = any>(
  promiseFunction: (params: PaginationParams) => Promise<FlatResponseData<ResponseData, RawData>>,
  options: UsePaginatedRequestOptions<T, RawData> = {},
) {
  const {
    manual = false,
    defaultPageSize = 10,
    defaultCurrent = 1,
    initialValue = [],
    transform,
  } = options

  // 首次加载与加载更多的 loading 状态
  const { loading, startLoading, endLoading } = useLoading()
  const { loading: loadingMore, startLoading: startLoadingMore, endLoading: endLoadingMore } = useLoading()

  // 累积的数据列表与请求错误状态
  const data = ref<T[]>([...initialValue]) as Ref<T[]>
  const error = ref<AxiosError<ResponseData> | null>(null) as Ref<AxiosError<ResponseData> | null>

  // 核心分页元信息状态
  const paginationInfo = ref<PaginationInfo>({
    current: defaultCurrent,
    pageSize: defaultPageSize,
    total: 0,
    hasMore: false,
  })

  // 计算属性向外部暴露只读的 pagination 信息
  const pagination = computed(() => paginationInfo.value)

  /**
   * 执行网络请求的核心函数
   * @param isLoadMore 是否为加载更多操作
   * @param targetPage 目标请求页码
   * @param shouldReset 是否重置整个列表
   */
  const executeRequest = async (isLoadMore = false, targetPage?: number, shouldReset = false): Promise<void> => {
    try {
      error.value = null
      isLoadMore ? startLoadingMore() : startLoading()

      const requestPage = targetPage ?? paginationInfo.value.current
      const result = await promiseFunction({
        current: requestPage,
        pageSize: paginationInfo.value.pageSize,
      })

      if (result.error) {
        error.value = result.error
        return
      }

      const rawData = result.data
      // 兼容接口数据可能为 null 的情况，确保数据安全
      const paginatedData = transform && rawData
        ? transform(rawData)
        : (rawData as unknown as PaginatedData<T>) || { list: [] }

      const currentPage = paginatedData.current ?? targetPage ?? paginationInfo.value.current
      const pageSize = paginatedData.pageSize ?? paginationInfo.value.pageSize
      const total = paginatedData.total ?? 0
      const hasMore = paginatedData.hasMore ?? (currentPage * pageSize < total)

      paginationInfo.value = {
        current: currentPage,
        pageSize,
        total,
        hasMore,
      }

      // 拼接或重置列表数据
      data.value = (isLoadMore && !shouldReset)
        ? [...data.value, ...paginatedData.list]
        : paginatedData.list
    }
    catch (err) {
      error.value = err as AxiosError<ResponseData>
    }
    finally {
      isLoadMore ? endLoadingMore() : endLoading()
    }
  }

  /**
   * 重新启动请求（重置到第一页并触发加载）
   * 避开 nextTick 以免页面高度折叠瞬间触底二次触发 loadMore
   */
  const run = async (): Promise<void> => {
    data.value = []
    await executeRequest(false, defaultCurrent, true)
  }

  /**
   * 加载下一页数据
   */
  const loadMore = async (): Promise<void> => {
    if (!paginationInfo.value.hasMore || loadingMore.value || loading.value) {
      return
    }
    await executeRequest(true, paginationInfo.value.current + 1)
  }

  /**
   * 刷新当前页数据
   */
  const refresh = async (): Promise<void> => {
    await executeRequest(false)
  }

  /**
   * 重置所有状态为初始状态
   */
  const reset = (): void => {
    data.value = [...initialValue]
    error.value = null
    paginationInfo.value = {
      current: defaultCurrent,
      pageSize: defaultPageSize,
      total: 0,
      hasMore: false,
    }
  }

  if (!manual) {
    onMounted(() => {
      run()
    })
  }

  return {
    data,
    loading,
    loadingMore,
    error,
    pagination,
    run,
    loadMore,
    refresh,
    reset,
  }
}

export default usePaginatedRequest
