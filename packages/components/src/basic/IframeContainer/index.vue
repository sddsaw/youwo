<script setup lang="ts">
import type { IframeContainerProps } from './types'
import { onMounted, ref, watch } from 'vue'

interface Emits {
  /** iframe加载完成事件 */
  (e: 'load'): void
  /** iframe加载错误事件 */
  (e: 'error', error: Event): void
}

defineOptions({
  name: 'IframeContainer',
})

const props = withDefaults(defineProps<IframeContainerProps>(), {
  title: '',
  loading: true,
  height: '100%',
  width: '100%',
  allowFullscreen: true,
  frameBorder: false,
  sandbox: 'allow-same-origin allow-scripts allow-popups allow-forms',
  customClass: '',
})

const emit = defineEmits<Emits>()

// --- 状态与引用 (State & Refs) ---

const iframeRef = ref<HTMLIFrameElement>()
const isLoading = ref(props.loading)
const hasError = ref(false)

// --- 核心方法 (Methods) ---

/**
 * 处理 iframe 加载成功
 */
function handleLoad() {
  isLoading.value = false
  hasError.value = false
  emit('load')
}

/**
 * 处理 iframe 加载失败
 */
function handleError(error: Event) {
  isLoading.value = false
  hasError.value = true
  emit('error', error)
}

/**
 * 手动刷新 iframe
 */
function refresh() {
  if (!iframeRef.value)
    return

  isLoading.value = true
  hasError.value = false

  if (props.url) {
    // 重新设置 src 触发加载
    const currentSrc = iframeRef.value.src
    iframeRef.value.src = ''
    iframeRef.value.src = currentSrc
  }
  else if (props.srcdoc) {
    // 重新设置 srcdoc 触发加载
    const currentSrcdoc = iframeRef.value.srcdoc
    iframeRef.value.srcdoc = ''
    iframeRef.value.srcdoc = currentSrcdoc
  }
}

/**
 * 获取 iframe 内部的 window 对象
 */
function getIframeWindow() {
  return iframeRef.value?.contentWindow
}

/**
 * 获取 iframe 内部的 document 对象
 */
function getIframeDocument() {
  return iframeRef.value?.contentDocument
}

// --- 监听器 (Watchers) ---

// 监听数据源变化，自动重置状态并展示 loading
watch(
  () => [props.url, props.srcdoc],
  ([url, srcdoc]) => {
    if (url || srcdoc) {
      isLoading.value = true
      hasError.value = false
    }
  },
)

// --- 生命周期 (Lifecycle) ---

onMounted(() => {
  if (props.url && props.srcdoc) {
    console.warn('IframeContainer: url 和 srcdoc 不能同时使用，优先使用 url')
  }
  if (!props.url && !props.srcdoc) {
    console.warn('IframeContainer: 必须提供 url 或 srcdoc 中的一个')
  }
})

// --- 暴露给外部父组件 of API (Exposed API) ---

defineExpose({
  /** 刷新 iframe */
  refresh,
  /** 获取 window 对象 */
  getIframeWindow,
  /** 获取 document 对象 */
  getIframeDocument,
  /** iframe 元素引用 */
  iframeRef,
})
</script>

<template>
  <div
    class="relative h-full w-full"
    :class="customClass"
  >
    <!-- 加载中状态 -->
    <div
      v-if="isLoading"
      class="absolute inset-0 z-10 flex items-center justify-center bg-gray-50"
    >
      <div class="flex flex-col items-center space-y-32px">
        <div class="size-32px animate-spin border-b-32px border-blue-600 rounded-full" />
        <span class="text-14px text-gray-600">加载中...</span>
      </div>
    </div>

    <!-- 加载失败状态 -->
    <div
      v-if="hasError"
      class="absolute inset-0 z-10 flex items-center justify-center bg-gray-50"
    >
      <div class="flex flex-col items-center space-y-4">
        <div class="text-red-500">
          <svg class="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <div class="text-center">
          <p class="mb-2 text-gray-600">
            页面加载失败
          </p>
          <button
            class="rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
            @click="refresh"
          >
            重新加载
          </button>
        </div>
      </div>
    </div>

    <!-- iframe 元素 -->
    <iframe
      ref="iframeRef"
      :src="url"
      :srcdoc="srcdoc"
      :title="title"
      :width="width"
      :height="height"
      :allowfullscreen="allowFullscreen"
      :frameborder="frameBorder ? '1' : '0'"
      :sandbox="sandbox"
      class="block h-full w-full border-0"
      @load="handleLoad"
      @error="handleError"
    />
  </div>
</template>
