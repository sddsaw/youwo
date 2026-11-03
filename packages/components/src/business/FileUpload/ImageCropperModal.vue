<script setup lang="ts">
import Cropper from 'cropperjs'
import { NButton, NModal } from 'naive-ui'
import { onBeforeUnmount, ref } from 'vue'
import ButtonIcon from '../../basic/ButtonIcon/index.vue'
import 'cropperjs/dist/cropper.css'

// 1. 组件选项定义
defineOptions({
  name: 'ImageCropperModal',
})

// 2. 类型与接口声明
interface OpenOptions {
  aspectRatio?: number
  previewRound?: boolean
}

// 3. 组件响应式状态
const visible = ref(false)
const imageSrc = ref('')
const previewRound = ref(false)
const aspectRatio = ref<number | undefined>(undefined)
const fileType = ref('image/png')

// 4. DOM 引用与非响应式变量
const imageRef = ref<HTMLImageElement | null>(null)
let cropper: Cropper | null = null
let resolvePromise: ((value: Blob | null) => void) | null = null

// 5. 核心控制方法 (打开/关闭)
function open(file: File, options?: OpenOptions): Promise<Blob | null> {
  aspectRatio.value = options?.aspectRatio
  previewRound.value = options?.previewRound ?? false
  fileType.value = file.type || 'image/png'
  imageSrc.value = URL.createObjectURL(file)
  visible.value = true

  return new Promise((resolve) => {
    resolvePromise = resolve
  })
}

function close(result: Blob | null) {
  visible.value = false
  if (resolvePromise) {
    resolvePromise(result)
    resolvePromise = null
  }

  // 销毁裁剪器实例，防止内存泄漏
  if (cropper) {
    cropper.destroy()
    cropper = null
  }

  // 释放图片内存
  if (imageSrc.value) {
    URL.revokeObjectURL(imageSrc.value)
    imageSrc.value = ''
  }
}

// 6. 裁剪器初始化
function initCropper() {
  if (!imageRef.value)
    return

  if (cropper) {
    cropper.destroy()
    cropper = null
  }

  cropper = new Cropper(imageRef.value, {
    aspectRatio: aspectRatio.value,
    preview: '.cropper-preview',
    viewMode: 1,
    dragMode: 'move',
    autoCropArea: 0.8,
    background: true,
    movable: true,
    rotatable: true,
    scalable: true,
    zoomable: true,
    zoomOnTouch: true,
    zoomOnWheel: true,
    cropBoxMovable: true,
    cropBoxResizable: true,
    toggleDragModeOnDblclick: true,
  })
}

// 7. 工具栏操作方法
function handleZoom(ratio: number) {
  cropper?.zoom(ratio)
}

function handleRotate(degree: number) {
  cropper?.rotate(degree)
}

function handleScale(direction: 'x' | 'y') {
  if (!cropper)
    return
  const data = cropper.getImageData()
  if (direction === 'x') {
    cropper.scaleX(data.scaleX === 1 ? -1 : 1)
  }
  else {
    cropper.scaleY(data.scaleY === 1 ? -1 : 1)
  }
}

function handleReset() {
  cropper?.reset()
}

// 8. 确认与取消处理
function handleCancel() {
  close(null)
}

function handleConfirm() {
  if (!cropper) {
    close(null)
    return
  }

  // 获取裁剪后的 canvas 对象
  const canvas = cropper.getCroppedCanvas({
    maxWidth: 4096,
    maxHeight: 4096,
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'high',
  })

  if (!canvas) {
    close(null)
    return
  }

  // 导出为 Blob 对象（保持原图片的 MIME 类型）
  canvas.toBlob((blob: Blob | null) => {
    close(blob)
  }, fileType.value)
}

// 9. 生命周期销毁钩子
onBeforeUnmount(() => {
  if (cropper) {
    cropper.destroy()
  }
  if (imageSrc.value) {
    URL.revokeObjectURL(imageSrc.value)
  }
})

// 10. 暴露 API 给父组件
defineExpose({
  open,
})
</script>

<template>
  <NModal
    v-model:show="visible"
    preset="card"
    title="图片裁剪"
    class="max-w-640px w-full"
    :mask-closable="false"
    :segmented="{ content: true, action: true }"
    @after-enter="initCropper"
    @close="handleCancel"
  >
    <div class="flex flex-col gap-4 md:flex-row">
      <!-- 左侧：裁剪工作区 -->
      <div class="relative max-h-400px min-h-320px flex flex-1 items-center justify-center overflow-hidden rounded bg-neutral-100 dark:bg-dark-300">
        <!-- 透明背景网格 -->
        <div class="checkerboard-bg absolute inset-0 z-0 opacity-40" />
        <div class="z-10 h-full w-full flex items-center justify-center p-2">
          <img
            ref="imageRef"
            :src="imageSrc"
            alt="Source Image"
            class="block max-h-380px max-w-full"
          >
        </div>
      </div>

      <!-- 右侧：实时预览区域 -->
      <div class="border-gray-150 w-full flex flex-col items-center justify-start gap-4 border-t pt-4 md:w-160px md:border-l md:border-t-0 dark:border-dark-100 md:pl-4 md:pt-0">
        <div class="text-12px text-gray-400 font-medium tracking-wider uppercase dark:text-gray-500">
          裁剪预览
        </div>

        <!-- 大尺寸预览 -->
        <div class="flex flex-col items-center gap-1">
          <div
            class="cropper-preview checkerboard-bg h-120px w-120px overflow-hidden border border-gray-200 shadow-sm dark:border-dark-100"
            :class="previewRound ? 'rounded-full' : 'rounded-8px'"
          />
          <div class="text-10px text-gray-400 dark:text-gray-500">
            120 x 120
          </div>
        </div>

        <!-- 中尺寸预览 -->
        <div class="flex flex-col items-center gap-1">
          <div
            class="cropper-preview checkerboard-bg h-80px w-80px overflow-hidden border border-gray-200 shadow-sm dark:border-dark-100"
            :class="previewRound ? 'rounded-full' : 'rounded-8px'"
          />
          <div class="text-10px text-gray-400 dark:text-gray-500">
            80 x 80
          </div>
        </div>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <template #action>
      <div class="w-full flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <!-- 图片调节工具按钮 -->
        <div class="flex flex-wrap items-center gap-1">
          <ButtonIcon icon="mdi:magnify-plus-outline" tooltip-content="放大" @click="handleZoom(0.1)" />
          <ButtonIcon icon="mdi:magnify-minus-outline" tooltip-content="缩小" @click="handleZoom(-0.1)" />
          <ButtonIcon icon="mdi:rotate-left" tooltip-content="向左旋转90°" @click="handleRotate(-90)" />
          <ButtonIcon icon="mdi:rotate-right" tooltip-content="向右旋转90°" @click="handleRotate(90)" />
          <ButtonIcon icon="mdi:flip-horizontal" tooltip-content="水平翻转" @click="handleScale('x')" />
          <ButtonIcon icon="mdi:flip-vertical" tooltip-content="垂直翻转" @click="handleScale('y')" />
          <ButtonIcon icon="mdi:restore" tooltip-content="重置" @click="handleReset" />
        </div>

        <!-- 提交与关闭 -->
        <div class="flex items-center justify-end gap-3">
          <NButton @click="handleCancel">
            取消
          </NButton>
          <NButton type="primary" @click="handleConfirm">
            确定裁剪
          </NButton>
        </div>
      </div>
    </template>
  </NModal>
</template>

<style scoped>
/* 棋盘格透明背景样式（适配明暗主题） */
.checkerboard-bg {
  background-image: linear-gradient(45deg, var(--checkerboard-color, #f0f0f0) 25%, transparent 25%),
                    linear-gradient(-45deg, var(--checkerboard-color, #f0f0f0) 25%, transparent 25%),
                    linear-gradient(45deg, transparent 75%, var(--checkerboard-color, #f0f0f0) 75%),
                    linear-gradient(-45deg, transparent 75%, var(--checkerboard-color, #f0f0f0) 75%);
  background-size: 16px 16px;
  background-position: 0 0, 0 8px, 8px -8px, -8px 0px;
  --checkerboard-color: #e5e5e5;
}

.dark .checkerboard-bg {
  --checkerboard-color: #2a2a2a;
}

/* 保持 cropperjs 预览图片定位的默认机制 */
:deep(.cropper-preview) {
  display: block;
}

:deep(.cropper-preview img) {
  max-width: none !important;
  max-height: none !important;
}
</style>
