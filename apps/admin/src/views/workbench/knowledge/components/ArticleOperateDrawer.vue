<script setup lang="ts">
import type { SchemaFormOptions } from '@sa/components'
import { SchemaForm } from '@sa/components'
import { useNaiveForm, useResetReactive } from '@sa/hooks'
import {
  CATEGORY_OPTIONS,
  CONFIDENCE_OPTIONS,
  SHOW_STATUS_OPTIONS,
  TRUST_STATUS_OPTIONS,
} from '@/views/workbench/mock'

defineOptions({
  name: 'ArticleOperateDrawer',
})

const props = defineProps<Props>()

const emit = defineEmits<{
  submitted: [item: Api.Knowledge.ArticleItem]
}>()

interface Props {
  operateType: 'add' | 'edit'
  rowData?: Api.Knowledge.ArticleItem | null
  categoryData: Api.Knowledge.CategoryNode[]
}

const visible = defineModel<boolean>('visible', { default: false })

const { formRef, validate, restoreValidation } = useNaiveForm()
const showPreview = ref(false)

const [formModel, resetFormModel] = useResetReactive({
  title: '',
  summary: '',
  category: 'API 用法',
  confidence: '高' as Api.Knowledge.ConfidenceLevel,
  trustStatus: '有效' as Api.Knowledge.TrustStatus,
  publisherName: '测试工程架构组',
  contentSource: 'ATE 机台规范库',
  visible: true,
  coverUrl: '',
  contentHtml: '',
  attachmentName: '',
  attachmentSize: '',
  pdfUrls: [] as string[],
})

const formOptions: SchemaFormOptions[] = [
  {
    value: 'title',
    label: '知识名称 / 标题',
    type: 'input',
    span: 24,
    rules: { required: true, message: '请输入知识名称/标题', trigger: 'blur' },
    attrs: {
      placeholder: '例如: 硬件可用 API 范围（红标清单）',
    },
  },
  {
    value: 'category',
    label: '分类',
    type: 'select',
    span: '24 s:12',
    rules: { required: true, message: '请选择分类', trigger: 'change' },
    options: CATEGORY_OPTIONS,
    attrs: {
      placeholder: '请选择分类',
    },
  },
  {
    value: 'confidence',
    label: '置信度',
    type: 'select',
    span: '24 s:12',
    rules: { required: true, message: '请选择置信度', trigger: 'change' },
    options: CONFIDENCE_OPTIONS.filter(o => o.value),
    attrs: {
      placeholder: '请选择置信度',
    },
  },
  {
    value: 'trustStatus',
    label: '可信状态',
    type: 'select',
    span: '24 s:12',
    rules: { required: true, message: '请选择可信状态', trigger: 'change' },
    options: TRUST_STATUS_OPTIONS.filter(o => o.value),
    attrs: {
      placeholder: '请选择可信状态',
    },
  },
  {
    value: 'publisherName',
    label: '责任人 / 工程师',
    type: 'input',
    span: '24 s:12',
    attrs: {
      placeholder: '例如: 测试架构组',
    },
  },
  {
    value: 'contentSource',
    label: '来源机构 / 团队',
    type: 'input',
    span: '24 s:12',
    attrs: {
      placeholder: '例如: ATE 机台规范库',
    },
  },
  {
    value: 'visible',
    label: '是否显示到前台',
    type: 'select',
    span: '24 s:12',
    options: SHOW_STATUS_OPTIONS,
    attrs: {
      placeholder: '请选择是否前台展示',
    },
  },
  {
    value: 'summary',
    label: '知识概要描述 (展示在列表名称下方)',
    type: 'input',
    span: 24,
    rules: { required: true, message: '请输入简要描述说明', trigger: ['input', 'blur'] },
    attrs: {
      type: 'textarea',
      placeholder: '请输入核心规范说明与摘要',
      autosize: { minRows: 3, maxRows: 6 },
      maxlength: 300,
      showCount: true,
    },
  },
  {
    value: 'contentHtml',
    label: '正文详细内容',
    type: 'rich-editor',
    span: 24,
    attrs: {
      placeholder: '请输入正文详细技术内容...',
      minHeight: '200px',
    },
  },
  {
    value: 'pdfUrls',
    label: 'PDF 规范附件',
    type: 'upload',
    span: 24,
    attrs: {
      multiple: false,
      max: 1,
      accept: '.pdf,application/pdf',
      listType: 'text',
    },
  },
]

watch(visible, (val) => {
  if (val) {
    if (props.operateType === 'add') {
      resetFormModel()
      restoreValidation()
    }
    else if (props.rowData) {
      Object.assign(formModel, {
        title: props.rowData.title,
        summary: props.rowData.summary || '',
        category: props.rowData.category || 'API 用法',
        confidence: props.rowData.confidence || '高',
        trustStatus: props.rowData.trustStatus || '有效',
        publisherName: props.rowData.publisherName || '测试工程师',
        contentSource: props.rowData.contentSource || 'ATE 知识规范库',
        visible: props.rowData.visible !== false,
        coverUrl: props.rowData.coverUrl || '',
        contentHtml: props.rowData.contentHtml || '',
        attachmentName: props.rowData.attachmentName || '',
        attachmentSize: props.rowData.attachmentSize || '',
        pdfUrls: props.rowData.attachmentName ? [props.rowData.attachmentName] : [],
      })
      restoreValidation()
    }
    showPreview.value = false
  }
})

async function handleSave() {
  try {
    await validate()
  }
  catch {
    return
  }

  const catNode = props.categoryData
    .flatMap(c => c.children || [])
    .find(c => c.name === formModel.category)

  const pdfUrl = Array.isArray(formModel.pdfUrls) ? formModel.pdfUrls[0] : formModel.pdfUrls

  if (props.operateType === 'add') {
    const newItem: Api.Knowledge.ArticleItem = {
      id: Date.now(),
      title: formModel.title,
      summary: formModel.summary,
      categoryId: catNode?.id || 'cat-2-4',
      category: formModel.category,
      confidence: formModel.confidence,
      trustStatus: formModel.trustStatus,
      lastVerifiedAt: new Date().toISOString().slice(0, 10),
      visible: formModel.visible,
      isRecommended: true,
      publisherName: formModel.publisherName,
      contentSource: formModel.contentSource,
      viewCount: 0,
      publishedAt: `${new Date().toISOString().slice(0, 10)} 10:00`,
      contentHtml: formModel.contentHtml,
      coverUrl: formModel.coverUrl,
      attachmentName: formModel.attachmentName || (pdfUrl ? 'ATE相关测试规范.pdf' : undefined),
      attachmentSize: formModel.attachmentSize || (pdfUrl ? '1.5 MB' : undefined),
    }
    emit('submitted', newItem)
  }
  else if (props.rowData) {
    const updatedItem: Api.Knowledge.ArticleItem = {
      ...props.rowData,
      title: formModel.title,
      summary: formModel.summary,
      categoryId: catNode?.id || props.rowData.categoryId || 'cat-2-4',
      category: formModel.category,
      confidence: formModel.confidence,
      trustStatus: formModel.trustStatus,
      visible: formModel.visible,
      publisherName: formModel.publisherName,
      contentSource: formModel.contentSource,
      contentHtml: formModel.contentHtml,
      coverUrl: formModel.coverUrl,
      attachmentName: formModel.attachmentName || (pdfUrl ? props.rowData.attachmentName || '附件文档.pdf' : undefined),
      attachmentSize: formModel.attachmentSize || (pdfUrl ? props.rowData.attachmentSize || '1.2 MB' : undefined),
    }
    emit('submitted', updatedItem)
  }

  visible.value = false
}
</script>

<template>
  <div>
    <!-- 新建 / 编辑抽屉 -->
    <NDrawer v-model:show="visible" :width="780" placement="right" class="shadow-2xl" :trap-focus="false" :auto-focus="false">
      <NDrawerContent
        closable
        :native-scrollbar="false"
        class="bg-white dark:bg-zinc-900"
      >
        <template #header>
          <div class="flex flex-col">
            <span class="text-16px text-gray-800 font-bold dark:text-zinc-100">
              {{ operateType === 'add' ? '新建 ATE 测试知识' : '编辑 ATE 测试知识' }}
            </span>
          </div>
        </template>

        <SchemaForm
          ref="formRef"
          v-model:model="formModel"
          :options="formOptions"
          :cols="24"
          :x-gap="20"
          label-placement="top"
          size="medium"
        />

        <template #footer>
          <div class="w-full flex justify-end gap-12px">
            <NButton class="px-16px" @click="visible = false">
              取消
            </NButton>
            <NButton secondary type="info" class="px-16px" @click="showPreview = true">
              预览
            </NButton>
            <NButton type="primary" class="px-20px" @click="handleSave">
              保存并生效
            </NButton>
          </div>
        </template>
      </NDrawerContent>
    </NDrawer>

    <!-- 预览抽屉 -->
    <NDrawer
      v-model:show="showPreview"
      :width="780"
      placement="right"
      class="z-[2001] shadow-2xl"
    >
      <NDrawerContent
        :native-scrollbar="false"
        class="bg-white dark:bg-zinc-900"
      >
        <div class="flex flex-col gap-12px">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-8px">
              <NTag :bordered="false" type="primary" size="small">
                {{ formModel.category }}
              </NTag>
              <NTag :bordered="false" type="info" size="small">
                置信度：{{ formModel.confidence }}
              </NTag>
              <NTag :bordered="false" type="success" size="small">
                状态：{{ formModel.trustStatus }}
              </NTag>
            </div>
          </div>

          <h1 class="text-24px text-gray-900 font-bold leading-tight dark:text-zinc-100">
            {{ formModel.title || '-' }}
          </h1>

          <div class="text-13px text-gray-400 dark:text-zinc-500">
            责任人：{{ formModel.publisherName || '-' }} · 来源：{{ formModel.contentSource || '-' }}
          </div>

          <div v-if="formModel.summary" class="rounded-8px bg-gray-50 p-12px text-14px text-gray-600 dark:bg-zinc-800/40 dark:text-zinc-300">
            {{ formModel.summary }}
          </div>

          <div class="my-8px h-1px w-full bg-gray-100 dark:bg-zinc-800" />

          <div
            class="preview-content-view max-w-none text-15px text-gray-700 leading-relaxed dark:text-zinc-300"
            v-html="formModel.contentHtml"
          />
        </div>

        <template #footer>
          <div class="flex items-center gap-12px">
            <NButton
              secondary
              type="info"
              class="border border-blue-500 rounded-8px px-20px font-medium"
              @click="showPreview = false"
            >
              继续编辑
            </NButton>
          </div>
        </template>
      </NDrawerContent>
    </NDrawer>
  </div>
</template>
