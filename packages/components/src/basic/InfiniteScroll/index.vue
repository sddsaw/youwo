<script setup lang="ts">
/**
 * InfiniteScroll 无限滚动加载更多组件
 * 采用 Intersection Observer API 实现高性能滚动触底触发，外层封装 Naive UI NScrollbar 提供精致滚动条体验。
 */
import { useIntersectionObserver } from '@vueuse/core'
import { NScrollbar } from 'naive-ui'
import { ref } from 'vue'

// 声明组件的 Props 类型接口
interface InfiniteScrollProps {
  /** 是否还有更多数据 */
  hasMore?: boolean
  /** 是否处于加载中状态 */
  loading?: boolean
  /** 滚动内容包装器的 class */
  contentClass?: string
  /** 透传给 NScrollbar 组件的属性 */
  scrollbarProps?: Record<string, any>
  /** 交叉观察器 IntersectionObserver 的配置参数 */
  observerOptions?: {
    rootMargin?: string
    threshold?: number | number[]
  }
}

defineOptions({
  name: 'InfiniteScroll',
})

// 定义组件 Props 并设置默认值
const props = withDefaults(
  defineProps<InfiniteScrollProps>(),
  {
    hasMore: true,
    loading: false,
    contentClass: '',
    scrollbarProps: () => ({}),
    observerOptions: () => ({
      rootMargin: '0px 0px 100px 0px', // 默认距离底部 100px 时自动提前加载
    }),
  },
)

// 定义组件 Emit 事件
const emit = defineEmits<{
  /** 滚动触底触发加载的回调事件 */
  (e: 'load'): void
}>()

// 底部监测哨兵元素
const sentinelRef = ref<HTMLElement | null>(null)

// 挂载交叉观察器监听触底行为
useIntersectionObserver(
  sentinelRef,
  ([entry]) => {
    // 哨兵元素可见，且拥有更多数据，且当前未在加载中，则触发 load 事件
    if (entry.isIntersecting && props.hasMore && !props.loading) {
      emit('load')
    }
  },
  props.observerOptions,
)
</script>

<template>
  <!-- 滚动条外壳组件 -->
  <NScrollbar v-bind="scrollbarProps" class="h-full">
    <div :class="contentClass">
      <!-- 默认列表内容插槽 -->
      <slot />
      <!-- 底部哨兵及加载状态指示器 -->
      <div ref="sentinelRef" class="flex items-center justify-center py-4">
        <!-- 加载中插槽及默认态 -->
        <template v-if="loading">
          <slot name="loading">
            <span class="text-14px text-gray-400">加载中...</span>
          </slot>
        </template>
        <!-- 没有更多数据插槽及默认态 -->
        <template v-else-if="!hasMore">
          <slot name="no-more">
            <span class="text-14px text-gray-400">没有更多了</span>
          </slot>
        </template>
      </div>
    </div>
  </NScrollbar>
</template>

<style scoped></style>
