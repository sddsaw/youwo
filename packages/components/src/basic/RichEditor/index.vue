<script setup lang="ts">
import { Ckeditor } from '@ckeditor/ckeditor5-vue'
import {
  Alignment,
  AutoLink,
  Base64UploadAdapter,
  BlockQuote,
  Bold,
  ClassicEditor,
  Code,
  Essentials,
  FontBackgroundColor,
  FontColor,
  FontFamily,
  FontSize,
  Heading,
  Highlight,
  HorizontalLine,
  ImageBlock,
  ImageCaption,
  ImageInline,
  ImageInsert,
  ImageResize,
  ImageStyle,
  ImageUpload,
  Indent,
  IndentBlock,
  InlineEditor,
  Italic,
  Link,
  LinkImage,
  List,
  ListProperties,
  MediaEmbed,
  Paragraph,
  PasteFromOffice,
  RemoveFormat,
  SelectAll,
  SpecialCharacters,
  SpecialCharactersEssentials,
  Strikethrough,
  Subscript,
  Superscript,
  Table,
  TableCellProperties,
  TableProperties,
  TableToolbar,
  TextTransformation,
  Underline,
  Undo,
} from 'ckeditor5'
import translations from 'ckeditor5/translations/zh-cn.js'
import { computed, onBeforeUnmount, onMounted, shallowRef } from 'vue'
import { FormulaEntry, LineHeight, WavyUnderline, WpsPasteHandler } from './plugins'
import MathlivePanelview from './plugins/mathlive/components/panelview'
import Mathlive from './plugins/mathlive/mathlive'

import 'ckeditor5/ckeditor5.css'

defineOptions({
  name: 'RichEditor',
})

const props = withDefaults(
  defineProps<{
    /** 占位提示文字 */
    placeholder?: string
    /** 是否禁用 */
    disabled?: boolean
    /** 编辑器最小高度 */
    minHeight?: string
    /** 编辑器最大高度 */
    maxHeight?: string
    /** 编辑器展示形式: 'classic' (整行/经典) | 'inline' (内联) */
    mode?: 'classic' | 'inline'
    /** 工具栏溢出时是否不折叠分组 */
    shouldNotGroupWhenFull?: boolean
    /** 是否启用数学公式编辑 */
    enableMath?: boolean
    /** 自定义工具栏配置项 */
    toolbarItems?: string[]
  }>(),
  {
    placeholder: '请输入内容...',
    disabled: false,
    minHeight: '34px',
    maxHeight: '600px',
    mode: 'inline',
    shouldNotGroupWhenFull: false,
    enableMath: true,
  },
)

// 定义 v-model:value 双向绑定 (适配 Naive UI 风格)
const editorData = defineModel<string>('value', { default: '' })
const normalizedEditorData = computed<string>({
  get: () => editorData.value ?? '',
  set: (value) => {
    editorData.value = value
  },
})

const toolbarContainerRef = shallowRef<HTMLElement | null>(null)

// 默认工具栏配置（移除了段落[heading]、移除格式[removeFormat]、超链接[link]、水平线[horizontalLine]、块引用[blockQuote]）
const defaultToolbarItems = computed(() => {
  return [
    'fontFamily',
    'fontSize',
    'fontColor',
    'fontBackgroundColor',
    'highlight',
    '|',
    'bold',
    'italic',
    'underline',
    'wavyUnderline',
    props.enableMath ? 'mathlive' : 'formulaEntry',
    'strikethrough',
    'subscript',
    'superscript',
    'code',
    '|',
    'alignment',
    'lineHeight',
    '|',
    'numberedList',
    'bulletedList',
    'outdent',
    'indent',
    '|',
    'insertImage',
    'mediaEmbed',
    'insertTable',
    'specialCharacters',
  ]
})

const activeToolbarItems = computed(() => {
  if (props.toolbarItems && props.toolbarItems.length > 0) {
    return props.toolbarItems.map((item) => {
      if (item === 'mathlive' || item === 'formulaEntry') {
        return props.enableMath ? 'mathlive' : 'formulaEntry'
      }
      return item
    })
  }
  return defaultToolbarItems.value
})

// 数学公式配置
function getMathConfig() {
  return {
    processClass: 'math-tex',
    mathPanelDestroyOnClose: false,
    openPanelWhenEquationSelected: true,
    renderMathPanel: (element: HTMLElement) => {
      let panelView: MathlivePanelview | null = new MathlivePanelview()
      panelView.mount(element)
      return () => {
        panelView?.destroy()
        panelView = null
      }
    },
    output: {
      type: 'span',
      attributes: {
        class: 'math-tex',
      },
    },
  }
}

// 动态生成 CKEditor 配置
const editorConfig = computed(() => {
  const plugins: any[] = [
    Essentials,
    Paragraph,
    Heading,
    Bold,
    Italic,
    Underline,
    Strikethrough,
    Code,
    FontColor,
    FontBackgroundColor,
    FontSize,
    FontFamily,
    Alignment,
    Link,
    BlockQuote,
    HorizontalLine,
    List,
    ListProperties,
    Table,
    TableToolbar,
    TableProperties,
    TableCellProperties,
    ImageBlock,
    ImageInline,
    ImageCaption,
    ImageStyle,
    ImageResize,
    ImageUpload,
    ImageInsert,
    LinkImage,
    MediaEmbed,
    RemoveFormat,
    Undo,
    AutoLink,
    Highlight,
    Indent,
    IndentBlock,
    PasteFromOffice,
    SelectAll,
    SpecialCharacters,
    SpecialCharactersEssentials,
    Subscript,
    Superscript,
    TextTransformation,
    WavyUnderline,
    WpsPasteHandler,
    LineHeight,
    Base64UploadAdapter,
  ]

  if (props.enableMath) {
    plugins.push(Mathlive)
  }
  else {
    plugins.push(FormulaEntry)
  }

  return {
    plugins,
    toolbar: {
      items: activeToolbarItems.value,
      shouldNotGroupWhenFull: props.shouldNotGroupWhenFull,
    },
    image: {
      toolbar: [
        'imageStyle:inline',
        'imageStyle:block',
        'imageStyle:side',
        '|',
        'toggleImageCaption',
        'imageTextAlternative',
        '|',
        'linkImage',
      ],
    },
    table: {
      contentToolbar: [
        'tableColumn',
        'tableRow',
        'mergeTableCells',
        '|',
        'tableProperties',
        'tableCellProperties',
      ],
    },
    placeholder: props.placeholder,
    licenseKey: 'GPL', // GPL 免费模式声明
    translations: [translations],
    ...(props.enableMath && { mathlive: getMathConfig() }),
  }
})

/**
 * 在无界 (Wujie) 等微前端 Shadow DOM 环境下，
 * 子应用的 document.body 位于宿主页面的某一偏移位置（例如左侧侧边栏、顶部导航条后）。
 * CKEditor 的气泡工具栏 (BalloonPanel) 是通过 getBoundingClientRect() 计算相对于主视口的绝对坐标，
 * 当挂载在子应用的 ShadowRoot/body 时，会叠加宿主容器的左上角偏移，导致工具栏右移和下移。
 * 此处检测宿主容器的物理偏移，并通过 CSS 变量实时修正 translate。
 */
function syncWujieOffset() {
  if (typeof document === 'undefined')
    return

  let host: Element | null = null

  const win = window as any
  if (win.$wujie?.shadowRoot?.host) {
    host = win.$wujie.shadowRoot.host
  }

  if (!host && typeof document.body?.getRootNode === 'function') {
    const root = document.body.getRootNode()
    if (root instanceof ShadowRoot && root.host) {
      host = root.host
    }
  }

  if (!host) {
    host = document.querySelector('wujie-app')
  }

  if (host) {
    const rect = host.getBoundingClientRect()
    document.documentElement.style.setProperty('--wujie-offset-left', `${rect.left}px`)
    document.documentElement.style.setProperty('--wujie-offset-top', `${rect.top}px`)
  }
}

onMounted(() => {
  syncWujieOffset()
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', syncWujieOffset)
    window.addEventListener('scroll', syncWujieOffset, true)
    window.addEventListener('focusin', syncWujieOffset)
  }
})

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', syncWujieOffset)
    window.removeEventListener('scroll', syncWujieOffset, true)
    window.removeEventListener('focusin', syncWujieOffset)
  }
})
</script>

<template>
  <div
    class="w-100%"
    :style="{ '--min-height': props.minHeight, '--max-height': props.maxHeight }"
    @focusin="syncWujieOffset"
    @click="syncWujieOffset"
  >
    <div ref="toolbarContainerRef" />
    <Ckeditor
      v-model="normalizedEditorData"
      :editor="props.mode === 'inline' ? InlineEditor : ClassicEditor"
      :config="editorConfig"
      :disabled="props.disabled"
      class="question-item"
      :class="{ 'is-disabled': props.disabled }"
      @focus="syncWujieOffset"
    />
  </div>
</template>

<style scoped>
/* CKEditor 全局层级配置 */
:global(:root) {
  --ck-z-panel: 9999;
}

/* 隐藏 CKEditor 的 powered by 标识 */
:global(.ck.ck-balloon-panel.ck-powered-by-balloon) {
  display: none !important;
}

/* CKEditor 气泡浮层在无界微前端 (Shadow DOM) 环境下的定位偏差修正 */
:global(.ck.ck-balloon-panel) {
  transform: translate(calc(-1 * var(--wujie-offset-left, 0px)), calc(-1 * var(--wujie-offset-top, 0px))) !important;
}

/* 编辑器容器样式 —— 与 Naive UI Input/Select 完全一致 */
.question-item {
  flex: 1;
  background-color: rgba(255, 255, 255, 1);
  border: 1px solid rgb(224, 224, 230);
  border-radius: 6px !important;
  box-sizing: border-box;
  color: rgb(51, 54, 57);
  font-size: 14px;
  /* margin-left: 8px; */
  min-height: var(--min-height, 34px);
  max-height: var(--max-height, 600px);
  padding: 3px 8px;
  word-break: break-word;
  transition: border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.question-item:hover {
  border-color: #646cff;
}

/* 禁用状态样式 */
.question-item.is-disabled {
  background-color: rgb(250, 250, 252);
  cursor: not-allowed;
  opacity: 0.6;
}

/* 段落样式重置 */
.question-item :deep(p) {
  margin-bottom: 0 !important;
  margin-top: 0 !important;
}

/* 去掉 CKEditor 内部编辑区自带的边框，由外层容器统一管理 */
.question-item :deep(.ck-editor__editable_inline) {
  border: none !important;
  box-shadow: none !important;
  outline: none !important;
  padding: 0 !important;
  min-height: var(--min-height, 34px);
  max-height: var(--max-height, 600px);
}

/* 聚焦状态样式 */
.question-item:focus-within {
  border-color: #646cff;
  box-shadow: 0 0 0 2px rgba(100, 108, 255, 0.2);
}

/* 数学公式样式 */
.question-item :deep(.math-tex) {
  padding: 2px 4px;
  margin: 0 2px;
  font-family: 'Times New Roman', serif;
  font-size: 16px;
}

/* 波浪下划线样式 */
.question-item :deep(.wavy-underline) {
  text-decoration: underline wavy;
}

/* placeholder 样式 —— 与 Naive UI 的 placeholder 保持一致 */
.question-item :deep(.ck-placeholder::before) {
  color: var(--n-placeholder-color, #c2c2c2) !important;
  font-size: 14px;
  font-style: normal;
}
</style>
