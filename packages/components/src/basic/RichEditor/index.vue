<script setup lang="ts">
import { Ckeditor } from '@ckeditor/ckeditor5-vue'
import { addColorAlpha } from '@sa/color'
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
import { useThemeVars } from 'naive-ui'
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

const themeVars = useThemeVars()

const editorStyle = computed(() => ({
  '--min-height': props.minHeight,
  '--max-height': props.maxHeight,
  '--editor-bg': themeVars.value.inputColor,
  '--editor-bg-disabled': themeVars.value.inputColorDisabled,
  '--editor-text-color': themeVars.value.textColor2,
  '--editor-text-color-disabled': themeVars.value.textColorDisabled,
  '--editor-border-color': themeVars.value.borderColor,
  '--editor-border-radius': themeVars.value.borderRadius,
  '--editor-border-hover': themeVars.value.primaryColorHover,
  '--editor-border-focus': themeVars.value.primaryColor,
  '--editor-focus-shadow': `0 0 0 2px ${addColorAlpha(themeVars.value.primaryColor, 0.2)}`,
  '--editor-placeholder-color': themeVars.value.placeholderColor,
}))

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
    :style="editorStyle"
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

/* CKEditor 5 暗黑模式适配 */
:global(html.dark) {
  --ck-color-base-foreground: #2d2d30;
  --ck-color-base-background: #1e1e20;
  --ck-color-base-border: #3f3f46;
  --ck-color-base-text: #e0e0e0;
  --ck-color-base-action: #53a336;
  --ck-color-base-focus: #6cb5f9;
  --ck-color-toolbar-background: #252528;
  --ck-color-toolbar-border: #3f3f46;
  --ck-color-dropdown-panel-background: #252528;
  --ck-color-dropdown-panel-border: #3f3f46;
  --ck-color-button-default-hover-background: #333338;
  --ck-color-button-default-active-background: #3a3a40;
  --ck-color-button-on-background: #2c384a;
  --ck-color-button-on-hover-background: #35465e;
  --ck-color-button-on-active-background: #35465e;
  --ck-color-list-background: #252528;
  --ck-color-list-button-hover-background: #333338;
  --ck-color-input-background: #1e1e20;
  --ck-color-input-border: #3f3f46;
  --ck-color-input-text: #e0e0e0;
  --ck-color-panel-background: #252528;
  --ck-color-panel-border: #3f3f46;
  --ck-color-dialog-background: #252528;
}

/* 编辑器容器样式 —— 动态继承 Naive UI Input/Select 主题变量 */
.question-item {
  flex: 1;
  background-color: var(--editor-bg, rgba(255, 255, 255, 1));
  border: 1px solid var(--editor-border-color, rgb(224, 224, 230));
  border-radius: var(--editor-border-radius, 6px) !important;
  box-sizing: border-box;
  color: var(--editor-text-color, rgb(51, 54, 57));
  font-size: 14px;
  /* margin-left: 8px; */
  min-height: var(--min-height, 34px);
  max-height: var(--max-height, 600px);
  padding: 3px 8px;
  word-break: break-word;
  transition: border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.question-item:hover {
  border-color: var(--editor-border-hover, #646cff);
}

/* 禁用状态样式 */
.question-item.is-disabled {
  background-color: var(--editor-bg-disabled, rgb(250, 250, 252));
  color: var(--editor-text-color-disabled, rgba(194, 194, 194, 1));
  cursor: not-allowed;
  opacity: 0.6;
}

/* 段落样式重置 */
.question-item :deep(p) {
  margin-bottom: 0 !important;
  margin-top: 0 !important;
}

/* 去掉 CKEditor 内部编辑区自带的边框和默认背景，由外层容器统一管理 */
.question-item :deep(.ck-editor__editable_inline) {
  border: none !important;
  box-shadow: none !important;
  outline: none !important;
  padding: 0 !important;
  background: transparent !important;
  min-height: var(--min-height, 34px);
  max-height: var(--max-height, 600px);
}

.question-item :deep(.ck.ck-editor__main > .ck-editor__editable) {
  border: none !important;
  box-shadow: none !important;
  background: transparent !important;
}

/* 聚焦状态样式 */
.question-item:focus-within {
  border-color: var(--editor-border-focus, #646cff);
  box-shadow: var(--editor-focus-shadow, 0 0 0 2px rgba(100, 108, 255, 0.2));
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
  color: var(--editor-placeholder-color, var(--n-placeholder-color, #c2c2c2)) !important;
  font-size: 14px;
  font-style: normal;
}
</style>
