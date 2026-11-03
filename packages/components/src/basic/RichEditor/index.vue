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
import { computed } from 'vue'
import { FormulaEntry, WavyUnderline, WpsPasteHandler } from './plugins'

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
  }>(),
  {
    placeholder: '请输入内容...',
    disabled: false,
    minHeight: '300px',
    maxHeight: '600px',
    mode: 'classic',
    shouldNotGroupWhenFull: false,
  },
)

// 定义 v-model:value 双向绑定 (适配 Naive UI 风格)
const editorData = defineModel<string>('value', { default: '' })

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
    FormulaEntry,
    Base64UploadAdapter,
  ]

  return {
    plugins,
    toolbar: {
      items: [
        'heading',
        '|',
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
        'formulaEntry',
        'strikethrough',
        'subscript',
        'superscript',
        'code',
        'removeFormat',
        'selectAll',
        '|',
        'alignment',
        '|',
        'numberedList',
        'bulletedList',
        'outdent',
        'indent',
        '|',
        'link',
        'insertImage',
        'mediaEmbed',
        'insertTable',
        'blockQuote',
        'horizontalLine',
        'specialCharacters',
      ],
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
  }
})
</script>

<template>
  <div class="w-100%" :style="{ '--min-height': props.minHeight, '--max-height': props.maxHeight }">
    <Ckeditor
      v-model="editorData"
      class="question-item"
      :class="{ 'is-disabled': props.disabled }"
      :editor="props.mode === 'inline' ? InlineEditor : ClassicEditor"
      :config="editorConfig"
      :disabled="props.disabled"
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

/* 解决内联模式工具栏定位闪烁问题：利用 @keyframes 避开 display: none -> block 无法触发 transition 的限制 */
/* @keyframes ck-balloon-fade-in {
  0%, 80% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

:global(.ck.ck-balloon-panel) {
  opacity: 0;
  pointer-events: none;
}

:global(.ck.ck-balloon-panel.ck-balloon-panel_visible) {
  pointer-events: auto;
  animation: ck-balloon-fade-in 80ms ease-out forwards;
} */

/* 编辑器容器样式 */
.question-item {
  flex: 1;
  background-color: #fff;
  border: 1px solid var(--border, #d9d9d9);
  border-radius: 4px !important;
  box-sizing: border-box;
  color: #333;
  margin-left: 8px;
  min-height: var(--min-height, 34px);
  max-height: var(--max-height, 600px);
  padding: 3px 8px;
  word-break: break-word;
  transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

/* 禁用状态样式 */
.question-item.is-disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
  opacity: 0.6;
}

/* 段落样式重置 */
.question-item :deep(p) {
  margin-bottom: 0 !important;
  margin-top: 0 !important;
}

/* 局部穿透覆盖 CKEditor 编辑区域样式 */
.question-item :deep(.ck-editor__editable_inline) {
  border: 1px solid #d9d9d9 !important;
  padding: 3px 8px !important;
  min-height: var(--min-height, 34px);
  max-height: var(--max-height, 600px);
  transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out !important;
}

/* 聚焦状态样式 */
.question-item :deep(.ck-editor__editable.ck-focused:not(.ck-editor__nested-editable)) {
  border: 1px solid #386bff !important;
  box-shadow: inset 2px 2px 3px rgba(0, 0, 0, 0.1) !important;
  outline: none !important;
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
</style>
