<script setup lang="ts">
import { computed } from 'vue'
import SvgIcon from '../SvgIcon/index.vue'

interface Props {
  /** 面板位置：left | right | top | bottom */
  placement?: 'left' | 'right' | 'top' | 'bottom'
  /** 面板尺寸（宽度或高度），支持 px、%、vw、vh 等单位 */
  size?: string | number
  /** 动画持续时间（ms） */
  duration?: number
  /** 是否显示折叠按钮 */
  showToggle?: boolean
  /** 按钮尺寸配置 */
  toggleSize?: {
    width?: string
    height?: string
  }
  /** 是否显示边框 */
  showBorder?: boolean
}

interface Emits {
  /** 折叠状态切换事件 */
  (e: 'toggle', value: boolean): void
}

defineOptions({
  name: 'CollapsiblePanel',
})

const props = withDefaults(defineProps<Props>(), {
  placement: 'left',
  size: '370px',
  duration: 500,
  showToggle: true,
  toggleSize: () => ({ width: '20px', height: '80px' }),
  showBorder: true,
})

const emit = defineEmits<Emits>()

// --- 状态与双向绑定 (State & V-Model) ---

// 折叠状态的双向绑定 model
const collapsed = defineModel<boolean>('collapsed', {
  default: false,
})

// --- 布局与尺寸计算 (Layout & Size Computations) ---

/**
 * 判断面板是否为水平伸缩方向（左右折叠）
 */
const isHorizontal = computed(() => ['left', 'right'].includes(props.placement))

/**
 * 标准化尺寸数值（若为数字则自动补齐 px 单位）
 */
function normalizeSize(size: string | number): string {
  return typeof size === 'number' ? `${size}px` : size
}

/**
 * 获取面板的外层容器样式（动态控制宽度/高度的伸缩及动画时长）
 */
const panelStyle = computed(() => {
  const size = normalizeSize(props.size)
  const property = isHorizontal.value ? 'width' : 'height'

  return {
    [property]: collapsed.value ? '0' : size,
    transitionDuration: `${props.duration}ms`,
  }
})

/**
 * 获取内部内容容器样式（保持尺寸固定，防止折叠时内容被挤压变形）
 */
const innerStyle = computed(() => {
  const size = normalizeSize(props.size)
  const property = isHorizontal.value ? 'width' : 'height'

  return {
    [property]: size,
    height: isHorizontal.value ? '100%' : size,
  }
})

/**
 * 获取面板的边框样式类（在面板展开且显示边框时应用）
 */
const borderClass = computed(() => {
  if (!props.showBorder || collapsed.value)
    return ''

  // 根据放置位置确定边框方向：左侧面板在右侧有边框，右侧面板在左侧有边框，以此类推
  const borderSide = { left: 'r', right: 'l', top: 'b', bottom: 't' }[props.placement]
  return `border-${borderSide} border-gray-200`
})

// --- 折叠按钮样式计算 (Toggle Button Styles) ---

/**
 * 获取折叠按钮的位置定位样式
 */
const togglePositionStyle = computed(() => {
  const { placement, size, duration } = props
  const actualSize = normalizeSize(size)
  const offset = collapsed.value ? '0px' : actualSize

  if (isHorizontal.value) {
    return {
      [placement]: offset,
      top: '50%',
      transform: 'translateY(-50%)',
      transitionDuration: `${duration}ms`,
    }
  }

  return {
    [placement]: offset,
    left: '50%',
    transform: 'translateX(-50%)',
    transitionDuration: `${duration}ms`,
  }
})

/**
 * 获取折叠按钮的样式类（动态处理圆角及无边框侧的样式）
 */
const toggleClass = computed(() => {
  const { placement } = props
  // 按钮圆角在伸出侧，贴着面板的一侧则去掉边框以保持视觉一体性
  const roundedSide = { left: 'r', right: 'l', top: 'b', bottom: 't' }[placement]
  const borderSide = { left: 'l', right: 'r', top: 't', bottom: 'b' }[placement]

  return [
    `rounded-${roundedSide}-8px border-${borderSide}-0`,
    'border-gray-200',
    'hover:shadow-md',
    'duration-300',
  ]
})

/**
 * 获取折叠按钮的宽高尺寸样式（上下伸缩方向时将宽高对调）
 */
const toggleSizeStyle = computed(() => {
  const { width = '20px', height = '80px' } = props.toggleSize
  return isHorizontal.value ? { width, height } : { width: height, height: width }
})

/**
 * 根据面板方向选择对应的 Chevron 图标
 */
const iconName = computed(() => {
  const direction = { left: 'left', right: 'right', top: 'up', bottom: 'down' }[props.placement]
  return `mdi:chevron-${direction}`
})

/**
 * 控制图标的旋转角度（折叠状态下自动旋转 180 度）
 */
const iconClass = computed(() => {
  return collapsed.value ? 'rotate-180' : 'rotate-0'
})

/**
 * 获取悬浮提示线（Hover Indicator）样式类
 */
const indicatorClass = computed(() => {
  const { placement } = props
  if (isHorizontal.value) {
    const side = placement === 'left' ? 'left-0 rounded-r-2px' : 'right-0 rounded-l-2px'
    return `${side} top-1/2 h-40px w-2px -translate-y-1/2`
  }
  const side = placement === 'top' ? 'top-0 rounded-b-2px' : 'bottom-0 rounded-t-2px'
  return `${side} left-1/2 w-40px h-2px -translate-x-1/2`
})

// --- 组件方法 (Methods) ---

/**
 * 切换折叠状态
 */
function toggleCollapse() {
  collapsed.value = !collapsed.value
  emit('toggle', collapsed.value)
}

// --- 暴露给外部父组件的 API (Exposed API) ---

defineExpose({
  /** 切换折叠状态 */
  toggle: toggleCollapse,
  /** 展开面板 */
  expand: () => {
    collapsed.value = false
  },
  /** 折叠面板 */
  collapse: () => {
    collapsed.value = true
  },
  /** 当前折叠状态（只读） */
  isCollapsed: computed(() => collapsed.value),
})
</script>

<template>
  <div class="relative flex gap-0">
    <!-- 主面板容器 -->
    <div class="relative flex">
      <!-- 面板内容 -->
      <div
        class="shrink-0 overflow-hidden bg-white transition-all ease-in-out"
        :class="borderClass"
        :style="panelStyle"
      >
        <div class="h-full" :style="innerStyle">
          <slot />
        </div>
      </div>

      <!-- 折叠按钮 -->
      <div
        v-if="showToggle"
        class="absolute z-10 transition-all ease-in-out"
        :style="togglePositionStyle"
      >
        <div
          class="group relative flex cursor-pointer items-center justify-center border bg-white shadow-sm transition-all"
          :class="toggleClass"
          :style="toggleSizeStyle"
          @click="toggleCollapse"
        >
          <!-- 图标容器 - 根据折叠状态旋转 -->
          <div
            class="flex items-center justify-center transition-all duration-500 ease-in-out group-hover:scale-110"
            :class="iconClass"
          >
            <SvgIcon
              :icon="iconName"
              class="text-18px text-gray-500 transition-colors duration-300 group-hover:text-primary"
            />
          </div>

          <!-- 悬浮提示线 -->
          <div
            class="absolute bg-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            :class="indicatorClass"
          />
        </div>
      </div>
    </div>
  </div>
</template>
