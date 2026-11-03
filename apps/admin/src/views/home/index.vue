<script setup lang="tsx">
import type { DataTableColumns, FormInst, FormRules } from 'naive-ui'
import { FileUpload, RichEditor, SvgIcon } from '@sa/components'
import { useResetReactive } from '@sa/hooks'
import {
  NButton,
  NCard,
  NCheckbox,
  NDataTable,
  NDrawer,
  NDrawerContent,
  NForm,
  NFormItem,
  NGrid,
  NGridItem,
  NInput,
  NPopconfirm,
  NScrollbar,
  NSelect,
  NTag,
  NTree,
} from 'naive-ui'
import { computed, reactive, ref } from 'vue'
import { useAppStore } from '@/store/modules/app'

defineOptions({
  name: 'HomePage',
})

const appStore = useAppStore()

// ── 1. 类型定义 ──────────────────────────────────────────────────────
interface CategoryNode {
  id: string
  name: string
  level: number
  count?: number
  parentId?: string | null
  children?: CategoryNode[]
  checkboxDisabled?: boolean
  [key: string]: unknown
}

interface ArticleItem {
  id: number
  title: string
  categoryL1Id: string
  categoryL1Name: string
  categoryL2Id?: string
  categoryL2Name?: string
  categoryL3Id?: string
  categoryL3Name?: string
  readingMode: 'open' | 'fulltext_apply'
  previewRatio: number
  bizReceiveEmail: string
  visible: boolean
  isRecommended: boolean
  publisherName: string
  contentSource: string
  viewCount: number
  publishedAt: string
  summary: string
  contentHtml: string
  coverUrl: string
  attachmentName?: string
  attachmentSize?: string
}

// ── 2. 左侧分类树状态与静态数据 ─────────────────────────────────────────
const selectedCategory = ref<string>('')
const checkedCategoryKeys = ref<string[]>([])

const categoryData = ref<CategoryNode[]>([
  {
    id: 'cat-1',
    name: '语料',
    level: 1,
    parentId: null,
    children: [
      { id: 'cat-1-1', name: '标准语料', level: 2, count: 12, parentId: 'cat-1' },
      { id: 'cat-1-2', name: 'legacy 归档', level: 2, count: 50, parentId: 'cat-1' },
    ],
  },
  {
    id: 'cat-2',
    name: '分类',
    level: 1,
    parentId: null,
    children: [
      { id: 'cat-2-1', name: '文件格式', level: 2, count: 21, parentId: 'cat-2' },
      { id: 'cat-2-2', name: '领域概念', level: 2, count: 12, parentId: 'cat-2' },
      { id: 'cat-2-3', name: '生成逻辑', level: 2, count: 11, parentId: 'cat-2' },
      { id: 'cat-2-4', name: 'API 用法', level: 2, count: 9, parentId: 'cat-2' },
      { id: 'cat-2-5', name: '调试经验', level: 2, count: 8, parentId: 'cat-2' },
      { id: 'cat-2-6', name: '分析指标', level: 2, count: 1, parentId: 'cat-2' },
    ],
  },
  {
    id: 'cat-3',
    name: '知识可信状态',
    level: 1,
    parentId: null,
    children: [
      { id: 'cat-3-1', name: '有效', level: 2, count: 10, parentId: 'cat-3' },
      { id: 'cat-3-2', name: '被取代', level: 2, count: 35, parentId: 'cat-3' },
      { id: 'cat-3-3', name: '已过时', level: 2, count: 16, parentId: 'cat-3' },
      { id: 'cat-3-4', name: '未登记', level: 2, count: 1, parentId: 'cat-3' },
    ],
  },
])

const treeData = computed(() => {
  const transform = (nodes: CategoryNode[]): CategoryNode[] => {
    return nodes.map((node) => {
      const hasChildren = Array.isArray(node.children) && node.children.length > 0
      return {
        ...node,
        children: hasChildren && node.level < 3 ? transform(node.children!) : undefined,
      }
    })
  }
  return [
    {
      id: '',
      name: '全部',
      level: 0,
      checkboxDisabled: true,
    },
    ...transform(categoryData.value),
  ]
})

const selectedKeys = computed({
  get: () => [selectedCategory.value],
  set: (keys) => {
    if (keys && keys.length > 0) {
      const key = String(keys[0])
      selectedCategory.value = key
      if (key === '') {
        checkedCategoryKeys.value = []
      }
    }
  },
})

function renderSwitcherIcon() {
  return (
    <span class="flex items-center text-16px text-gray-400 transition-colors duration-200 dark:text-zinc-500 hover:text-gray-600">
      <SvgIcon icon="material-symbols:chevron-right-rounded" />
    </span>
  )
}

function renderPrefix({ option }: { option: any }) {
  if (option.id === '') {
    return <SvgIcon icon="material-symbols:list-alt-outline-rounded" class="text-16px text-blue-500" />
  }
  if (option.level === 1) {
    return <SvgIcon icon="material-symbols:folder-open-outline" class="text-16px text-amber-500" />
  }
  if (option.level === 2) {
    return <SvgIcon icon="material-symbols:folder-zip-outline-rounded" class="text-16px text-orange-400" />
  }
  return <SvgIcon icon="material-symbols:description-outline" class="text-15px text-blue-400" />
}

function renderSuffix({ option }: { option: any }) {
  if (option.id === '' || option.count === undefined)
    return null

  return (
    <div class="ml-auto flex items-center pr-6px">
      <span class="min-w-20px text-right text-13px text-gray-500 font-medium tabular-nums dark:text-zinc-400">
        {option.count}
      </span>
    </div>
  )
}

function renderLabel({ option }: { option: any }) {
  return (
    <span class="text-14px text-gray-700 font-medium dark:text-zinc-300">
      {option.name}
    </span>
  )
}

// ── 3. 右侧列表与筛选状态 ─────────────────────────────────────────────
const STATUS_OPTIONS = [
  { label: '全部状态', value: '' },
  { label: '显示', value: 'published' },
  { label: '未显示', value: 'offline' },
]

const READING_MODE_OPTIONS = [
  { label: '开放阅读', value: 'open' },
  { label: '需申请完整版', value: 'fulltext_apply' },
]

const PREVIEW_RATIO_OPTIONS = [
  { label: '10%', value: 10 },
  { label: '20%', value: 20 },
  { label: '30%', value: 30 },
  { label: '50%', value: 50 },
]

const RECOMMEND_OPTIONS = [
  { label: '是', value: true as any },
  { label: '否', value: false as any },
]

const SHOW_STATUS_OPTIONS = [
  { label: '显示', value: true as any },
  { label: '未显示', value: false as any },
]

const searchQueryInfo = reactive({
  keyword: '',
  status: '',
  onlyMine: false,
  page: 1,
  pageSize: 10,
})

const articleList = ref<ArticleItem[]>([
  {
    id: 1,
    title: 'ATE 标准测试语料与向量格式规范',
    categoryL1Id: 'cat-1',
    categoryL1Name: '语料',
    categoryL2Id: 'cat-1-1',
    categoryL2Name: '标准语料',
    readingMode: 'open',
    previewRatio: 20,
    bizReceiveEmail: '',
    visible: true,
    isRecommended: true,
    publisherName: '管理员',
    contentSource: '测试工程部',
    viewCount: 1280,
    publishedAt: '2026-10-15 10:30',
    summary: '定义了标准语料库的数据结构、向量格式以及自动化测试脚本的生成准则。',
    contentHtml: '<p>标准语料用于指导 ATE 自动化测试程序生成与校准。</p>',
    coverUrl: '',
    attachmentName: 'ATE标准测试语料规范.pdf',
    attachmentSize: '1.8 MB',
  },
  {
    id: 2,
    title: 'STDF 文件格式解析与数据转换指南',
    categoryL1Id: 'cat-2',
    categoryL1Name: '分类',
    categoryL2Id: 'cat-2-1',
    categoryL2Name: '文件格式',
    readingMode: 'fulltext_apply',
    previewRatio: 30,
    bizReceiveEmail: 'ate-support@example.com',
    visible: true,
    isRecommended: false,
    publisherName: '管理员',
    contentSource: '数据平台组',
    viewCount: 856,
    publishedAt: '2026-10-20 14:15',
    summary: '详细说明标准测试数据格式（STDF v4）各记录类型字段定义与良率统计解析逻辑。',
    contentHtml: '<p>STDF（Standard Test Data Format）是半导体 ATE 测试通用的二进制数据日志格式。</p>',
    coverUrl: '',
    attachmentName: 'STDF文件格式解析指南.pdf',
    attachmentSize: '2.4 MB',
  },
  {
    id: 3,
    title: 'ATE 晶圆级与成品测试分析指标 Cpk 规范',
    categoryL1Id: 'cat-2',
    categoryL1Name: '分类',
    categoryL2Id: 'cat-2-6',
    categoryL2Name: '分析指标',
    readingMode: 'open',
    previewRatio: 20,
    bizReceiveEmail: '',
    visible: false,
    isRecommended: true,
    publisherName: '张工',
    contentSource: '质量与可靠性部',
    viewCount: 432,
    publishedAt: '2026-11-01 09:00',
    summary: '规定了量产芯片在 CP 及 FT 阶段的参数测试、制程能力指数 Cpk 评估与良率监控要求。',
    contentHtml: '<p>量产管控指标需满足 <span class="math-tex">\\(C_{pk} = \\min\\left(\\frac{\\text{USL} - \\mu}{3\\sigma}, \\frac{\\mu - \\text{LSL}}{3\\sigma}\\right) \\ge 1.33\\)</span>。</p>',
    coverUrl: '',
  },
])

const filteredData = computed(() => {
  return articleList.value.filter((item) => {
    if (checkedCategoryKeys.value.length > 0) {
      const matchChecked = checkedCategoryKeys.value.some(
        key =>
          item.categoryL1Id === key
          || item.categoryL2Id === key
          || item.categoryL3Id === key,
      )
      if (!matchChecked)
        return false
    }
    else if (selectedCategory.value) {
      const matchCat
        = item.categoryL1Id === selectedCategory.value
          || item.categoryL2Id === selectedCategory.value
          || item.categoryL3Id === selectedCategory.value
      if (!matchCat)
        return false
    }
    if (searchQueryInfo.status === 'published' && !item.visible)
      return false
    if (searchQueryInfo.status === 'offline' && item.visible)
      return false
    if (searchQueryInfo.onlyMine && item.publisherName !== '管理员')
      return false
    if (searchQueryInfo.keyword.trim()) {
      const kw = searchQueryInfo.keyword.trim().toLowerCase()
      const matchKw
        = item.title.toLowerCase().includes(kw)
          || item.publisherName.toLowerCase().includes(kw)
      if (!matchKw)
        return false
    }
    return true
  })
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
  onChange: (page: number) => {
    pagination.page = page
  },
  onUpdatePageSize: (pageSize: number) => {
    pagination.pageSize = pageSize
    pagination.page = 1
  },
})

function handleSearch() {
  pagination.page = 1
}

// ── 4. 新建/编辑抽屉与预览抽屉逻辑 ──────────────────────────────────
const createDrawerVisible = ref(false)
const drawerMode = ref<'add' | 'edit'>('add')
const drawerEditId = ref<number | null>(null)
const showPreview = ref(false)
const formRef = ref<FormInst | null>(null)

const [formModel, resetFormModel] = useResetReactive({
  title: '',
  readingMode: 'open' as 'open' | 'fulltext_apply',
  previewRatio: 20,
  bizReceiveEmail: '',
  publisherName: '管理员',
  contentSource: '',
  isRecommended: false,
  categoryL1Id: '',
  categoryL2Id: '',
  categoryL3Id: '',
  visible: true,
  coverUrl: '',
  summary: '',
  contentHtml: '',
  publishedAt: '2026-11-03 18:00',
  attachmentName: '',
  attachmentSize: '',
})

const coverUrls = computed<string[]>({
  get: () => (formModel.coverUrl ? [formModel.coverUrl] : []),
  set: (val) => {
    formModel.coverUrl = val[0] || ''
  },
})

const pdfUrls = ref<string[]>([])

const firstCategoryOptions = computed(() =>
  categoryData.value.map(item => ({ id: item.id, name: item.name })),
)

const secondCategoryOptions = computed(() => {
  const l1 = categoryData.value.find(item => item.id === formModel.categoryL1Id)
  return (l1?.children || []).map(item => ({ id: item.id, name: item.name }))
})

const thirdCategoryOptions = computed(() => {
  const l1 = categoryData.value.find(item => item.id === formModel.categoryL1Id)
  const l2 = l1?.children?.find(item => item.id === formModel.categoryL2Id)
  return (l2?.children || []).map(item => ({ id: item.id, name: item.name }))
})

function handleL1CategoryChange() {
  formModel.categoryL2Id = ''
  formModel.categoryL3Id = ''
}

function handleL2CategoryChange() {
  formModel.categoryL3Id = ''
}

const articleFormRules: FormRules = {
  title: { required: true, message: '请输入内容标题', trigger: 'blur' },
  publisherName: { required: true, message: '请输入发布人', trigger: 'blur' },
  contentSource: { required: true, message: '请输入内容来源', trigger: 'blur' },
  summary: { required: true, message: '请填写简介', trigger: ['input', 'blur'] },
  contentHtml: { required: true, message: '请填写正文内容', trigger: ['input', 'blur'] },
}

function handleCreateLaw() {
  drawerMode.value = 'add'
  drawerEditId.value = null
  resetFormModel()
  pdfUrls.value = []
  createDrawerVisible.value = true
}

function handleEditLaw(row: ArticleItem) {
  drawerMode.value = 'edit'
  drawerEditId.value = row.id
  Object.assign(formModel, {
    title: row.title,
    readingMode: row.readingMode,
    previewRatio: row.previewRatio,
    bizReceiveEmail: row.bizReceiveEmail,
    publisherName: row.publisherName,
    contentSource: row.contentSource,
    isRecommended: row.isRecommended,
    categoryL1Id: row.categoryL1Id,
    categoryL2Id: row.categoryL2Id || '',
    categoryL3Id: row.categoryL3Id || '',
    visible: row.visible,
    coverUrl: row.coverUrl,
    summary: row.summary,
    contentHtml: row.contentHtml,
    publishedAt: row.publishedAt,
    attachmentName: row.attachmentName || '',
    attachmentSize: row.attachmentSize || '',
  })
  pdfUrls.value = row.attachmentName ? [row.attachmentName] : []
  createDrawerVisible.value = true
}

function handleDeleteLaw(id: number) {
  articleList.value = articleList.value.filter(item => item.id !== id)
  window.$message?.success('删除成功')
}

function handleSave() {
  formRef.value?.validate((errors) => {
    if (errors)
      return

    const l1 = categoryData.value.find(c => c.id === formModel.categoryL1Id)
    const l2 = l1?.children?.find(c => c.id === formModel.categoryL2Id)
    const l3 = l2?.children?.find(c => c.id === formModel.categoryL3Id)

    if (drawerMode.value === 'add') {
      articleList.value.unshift({
        id: Date.now(),
        title: formModel.title,
        categoryL1Id: formModel.categoryL1Id,
        categoryL1Name: l1?.name || '未分类',
        categoryL2Id: formModel.categoryL2Id || undefined,
        categoryL2Name: l2?.name,
        categoryL3Id: formModel.categoryL3Id || undefined,
        categoryL3Name: l3?.name,
        readingMode: formModel.readingMode,
        previewRatio: formModel.previewRatio,
        bizReceiveEmail: formModel.bizReceiveEmail,
        visible: formModel.visible,
        isRecommended: formModel.isRecommended,
        publisherName: formModel.publisherName,
        contentSource: formModel.contentSource,
        viewCount: 0,
        publishedAt: formModel.publishedAt,
        summary: formModel.summary,
        contentHtml: formModel.contentHtml,
        coverUrl: formModel.coverUrl,
        attachmentName: formModel.attachmentName || undefined,
        attachmentSize: formModel.attachmentSize || undefined,
      })
      window.$message?.success('内容创建成功')
    }
    else if (drawerEditId.value !== null) {
      const target = articleList.value.find(item => item.id === drawerEditId.value)
      if (target) {
        Object.assign(target, {
          title: formModel.title,
          categoryL1Id: formModel.categoryL1Id,
          categoryL1Name: l1?.name || target.categoryL1Name,
          categoryL2Id: formModel.categoryL2Id || undefined,
          categoryL2Name: l2?.name,
          categoryL3Id: formModel.categoryL3Id || undefined,
          categoryL3Name: l3?.name,
          readingMode: formModel.readingMode,
          previewRatio: formModel.previewRatio,
          bizReceiveEmail: formModel.bizReceiveEmail,
          visible: formModel.visible,
          isRecommended: formModel.isRecommended,
          publisherName: formModel.publisherName,
          contentSource: formModel.contentSource,
          summary: formModel.summary,
          contentHtml: formModel.contentHtml,
          coverUrl: formModel.coverUrl,
        })
      }
      window.$message?.success('内容修改成功')
    }

    createDrawerVisible.value = false
  })
}

const columns: DataTableColumns<ArticleItem> = [
  {
    title: '标题',
    key: 'title',
    width: 240,
    align: 'center',
    fixed: 'left',
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: '分类',
    key: 'categoryPath',
    width: 180,
    align: 'center',
    ellipsis: {
      tooltip: true,
    },
    render(row) {
      const path = [row.categoryL1Name, row.categoryL2Name, row.categoryL3Name].filter(Boolean).join(' / ')
      return <span>{path || '未知分类'}</span>
    },
  },
  {
    title: '阅读模式',
    key: 'readingMode',
    width: 110,
    align: 'center',
    render(row) {
      const isOpen = row.readingMode === 'open'
      return (
        <NTag size="small" type={isOpen ? 'success' : 'warning'}>
          {isOpen ? '开放阅读' : '需申请完整版'}
        </NTag>
      )
    },
  },
  {
    title: '前台显示',
    key: 'showStatus',
    width: 90,
    align: 'center',
    render(row) {
      return (
        <NTag size="small" type={row.visible ? 'success' : 'default'}>
          {row.visible ? '显示' : '未显示'}
        </NTag>
      )
    },
  },
  {
    title: '发布人',
    key: 'publisherName',
    width: 120,
    align: 'center',
  },
  {
    title: '浏览',
    key: 'viewCount',
    width: 80,
    align: 'center',
  },
  {
    title: '操作',
    key: 'actions',
    width: 140,
    align: 'center',
    fixed: 'right',
    render(row) {
      return (
        <div class="flex items-center justify-center gap-16px">
          <NButton
            type="primary"
            ghost
            size="small"
            onClick={() => handleEditLaw(row)}
          >
            编辑
          </NButton>
          <NPopconfirm onPositiveClick={() => handleDeleteLaw(row.id)}>
            {{
              default: () => '确认删除吗？',
              trigger: () => (
                <NButton type="error" ghost size="small">
                  删除
                </NButton>
              ),
            }}
          </NPopconfirm>
        </div>
      )
    },
  },
]
</script>

<template>
  <div class="h-full min-h-500px flex gap-12px overflow-hidden bg-gray-50/50 p-12px lt-sm:overflow-auto dark:bg-zinc-950/20">
    <!-- Left Column: Category Tree Sidebar -->
    <NCard class="h-full w-280px shrink-0 overflow-hidden card-wrapper" content-style="height: 100%" :bordered="false" size="small">
      <div class="h-full flex flex-col gap-8px">
        <div class="flex items-center justify-between border-b border-gray-200 pb-8px dark:border-zinc-800">
          <span class="text-16px text-gray-800 font-bold dark:text-zinc-100">分类筛选</span>
        </div>

        <div class="min-h-0 flex-1">
          <NScrollbar class="h-full pr-2px">
            <NTree
              v-model:selected-keys="selectedKeys"
              v-model:checked-keys="checkedCategoryKeys"
              block-line
              checkable
              cascade
              multiple
              check-on-click
              expand-on-click
              default-expand-all
              :data="treeData"
              key-field="id"
              label-field="name"
              children-field="children"
              :render-prefix="renderPrefix"
              :render-suffix="renderSuffix"
              :render-label="renderLabel"
              :render-switcher-icon="renderSwitcherIcon"
              class="category-tree"
            />
          </NScrollbar>
        </div>
      </div>
    </NCard>

    <!-- Right Column: Search Form + DataTable Card -->
    <NCard :bordered="false" class="min-w-0 flex-1 card-wrapper sm:flex-1-hidden" size="small">
      <div class="h-full flex flex-col flex-1 gap-12px">
        <!-- Top Row: Search & Filters -->
        <div class="flex items-center justify-between gap-16px border-b border-gray-100 pb-12px dark:border-zinc-800">
          <div class="flex items-center gap-12px">
            <NInput
              v-model:value="searchQueryInfo.keyword"
              placeholder="搜索标题、发布人..."
              clearable
              class="w-180px"
              @update:value="handleSearch"
            >
              <template #prefix>
                <SvgIcon icon="material-symbols:search-rounded" class="text-gray-400" />
              </template>
            </NInput>

            <NSelect
              v-model:value="searchQueryInfo.status"
              :options="STATUS_OPTIONS"
              class="w-160px shrink-0"
              @update:value="handleSearch"
            />

            <NCheckbox
              v-model:checked="searchQueryInfo.onlyMine"
              class="ml-4px shrink-0 select-none text-14px"
              @update:checked="handleSearch"
            >
              仅看我的
            </NCheckbox>
          </div>

          <NButton type="primary" @click="handleCreateLaw">
            <template #icon>
              <SvgIcon icon="material-symbols:add" />
            </template>
            新建内容
          </NButton>
        </div>

        <!-- Table Area -->
        <NDataTable
          :columns="columns"
          :data="filteredData"
          :bordered="false"
          :scroll-x="960"
          :pagination="pagination"
          :flex-height="!appStore.isMobile"
          :row-key="(row: ArticleItem) => row.id"
          class="sm:h-full"
        />
      </div>

      <!-- 新建 / 编辑抽屉 -->
      <NDrawer v-model:show="createDrawerVisible" :width="780" placement="right" class="shadow-2xl">
        <NDrawerContent
          closable
          :native-scrollbar="false"
          class="bg-white dark:bg-zinc-900"
        >
          <template #header>
            <div class="flex flex-col">
              <span class="text-16px text-gray-800 font-bold dark:text-zinc-100">
                {{ drawerMode === 'add' ? '新建法律法规' : '编辑法律法规' }}
              </span>
            </div>
          </template>

          <NForm
            ref="formRef"
            :model="formModel"
            :rules="articleFormRules"
            label-placement="top"
            size="medium"
          >
            <NGrid :cols="2" :x-gap="20" item-responsive>
              <NGridItem :span="1">
                <NFormItem label="标题" path="title">
                  <NInput v-model:value="formModel.title" placeholder="请输入标题" />
                </NFormItem>
              </NGridItem>

              <NGridItem :span="1">
                <NFormItem label="阅读模式">
                  <NSelect
                    v-model:value="formModel.readingMode"
                    :options="READING_MODE_OPTIONS"
                    placeholder="请选择阅读模式"
                  />
                </NFormItem>
              </NGridItem>

              <NGridItem v-if="formModel.readingMode === 'fulltext_apply'" :span="1">
                <NFormItem label="预览比例">
                  <NSelect
                    v-model:value="formModel.previewRatio"
                    :options="PREVIEW_RATIO_OPTIONS"
                    placeholder="请选择预览比例"
                  />
                </NFormItem>
              </NGridItem>

              <NGridItem v-if="formModel.readingMode === 'fulltext_apply'" :span="1">
                <NFormItem label="商务接收邮箱" required>
                  <NInput v-model:value="formModel.bizReceiveEmail" placeholder="请输入商务接收邮箱" class="w-full" />
                </NFormItem>
              </NGridItem>

              <NGridItem :span="1">
                <NFormItem label="发布人" path="publisherName">
                  <NInput v-model:value="formModel.publisherName" disabled placeholder="请输入发布人" />
                </NFormItem>
              </NGridItem>

              <NGridItem :span="1">
                <NFormItem label="内容来源" path="contentSource">
                  <NInput v-model:value="formModel.contentSource" placeholder="请输入内容来源机构" />
                </NFormItem>
              </NGridItem>

              <NGridItem :span="1">
                <NFormItem label="是否推荐">
                  <NSelect
                    v-model:value="formModel.isRecommended as any"
                    :options="RECOMMEND_OPTIONS"
                    placeholder="请选择是否推荐"
                  />
                </NFormItem>
              </NGridItem>

              <NGridItem :span="1">
                <NFormItem label="一级分类">
                  <NSelect
                    v-model:value="formModel.categoryL1Id"
                    :options="firstCategoryOptions"
                    label-field="name"
                    value-field="id"
                    placeholder="请选择一级分类"
                    @update:value="handleL1CategoryChange"
                  />
                </NFormItem>
              </NGridItem>

              <NGridItem :span="1">
                <NFormItem label="二级分类 (可选)">
                  <NSelect
                    v-model:value="formModel.categoryL2Id"
                    :options="secondCategoryOptions"
                    label-field="name"
                    value-field="id"
                    placeholder="请选择二级分类"
                    clearable
                    @update:value="handleL2CategoryChange"
                  />
                </NFormItem>
              </NGridItem>

              <NGridItem v-if="formModel.categoryL2Id" :span="1">
                <NFormItem label="三级分类 (可选)">
                  <NSelect
                    v-model:value="formModel.categoryL3Id"
                    :options="thirdCategoryOptions"
                    label-field="name"
                    value-field="id"
                    placeholder="请选择三级分类"
                    clearable
                  />
                </NFormItem>
              </NGridItem>

              <NGridItem :span="1">
                <NFormItem label="是否显示到前台">
                  <NSelect
                    v-model:value="formModel.visible as any"
                    :options="SHOW_STATUS_OPTIONS"
                    placeholder="请选择是否前台展示"
                  />
                </NFormItem>
              </NGridItem>

              <NGridItem :span="1">
                <NFormItem label="封面图" path="coverUrl">
                  <FileUpload
                    v-model:model-value="coverUrls"
                    :multiple="false"
                    :max="1"
                    accept="image/*"
                    list-type="image-card"
                    class="w-full"
                  />
                </NFormItem>
              </NGridItem>

              <NGridItem :span="2">
                <NFormItem label="简介" path="summary">
                  <NInput
                    v-model:value="formModel.summary"
                    type="textarea"
                    placeholder="请输入法律法规内容简介说明"
                    :autosize="{ minRows: 4, maxRows: 8 }"
                    maxlength="300"
                    show-count
                  />
                </NFormItem>
              </NGridItem>

              <NGridItem :span="2">
                <NFormItem label="正文" path="contentHtml">
                  <RichEditor
                    v-model:value="formModel.contentHtml"
                    placeholder="请输入正文内容..."
                    min-height="200px"
                    class="w-full"
                  />
                </NFormItem>
              </NGridItem>

              <NGridItem :span="2">
                <NFormItem label="PDF 附件">
                  <div class="w-full">
                    <FileUpload
                      v-model:model-value="pdfUrls"
                      :multiple="false"
                      :max="1"
                      accept=".pdf,application/pdf"
                      list-type="text"
                      class="w-full"
                    />
                  </div>
                </NFormItem>
              </NGridItem>
            </NGrid>
          </NForm>

          <template #footer>
            <div class="w-full flex justify-end gap-12px">
              <NButton class="px-16px" @click="createDrawerVisible = false">
                取消
              </NButton>
              <NButton secondary type="info" class="px-16px" @click="showPreview = true">
                预览
              </NButton>
              <NButton type="primary" class="px-20px" @click="handleSave">
                保存并发布
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
                  法律法规
                </NTag>
                <NTag :bordered="false" type="primary" size="small">
                  {{ formModel.readingMode === 'fulltext_apply' ? '需申请完整版' : '开放阅读' }}
                </NTag>
              </div>
            </div>

            <h1 class="text-26px text-gray-900 font-bold leading-tight dark:text-zinc-100">
              {{ formModel.title || '-' }}
            </h1>

            <div class="text-13px text-gray-400 dark:text-zinc-500">
              {{ formModel.publishedAt || '-' }} · 发布人 {{ formModel.publisherName || '-' }}
            </div>

            <div v-if="formModel.attachmentName" class="flex flex-col gap-10px">
              <p class="text-14px text-gray-500 font-bold dark:text-zinc-400">
                附件下载
              </p>
              <div class="flex items-center justify-between border border-blue-100 rounded-8px bg-blue-50/20 p-16px dark:border-blue-950/30 dark:bg-blue-950/10">
                <div class="flex items-center gap-12px">
                  <div class="h-40px w-40px flex items-center justify-center rounded-8px bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400">
                    <SvgIcon icon="material-symbols:picture-as-pdf-outline-rounded" class="text-22px" />
                  </div>
                  <div class="flex flex-col gap-2px">
                    <span class="max-w-400px truncate text-14px text-gray-800 font-bold dark:text-zinc-200">
                      {{ formModel.attachmentName }}
                    </span>
                    <span v-if="formModel.attachmentSize" class="text-12px text-gray-400 dark:text-zinc-500">
                      {{ formModel.attachmentSize }}
                    </span>
                  </div>
                </div>
                <NButton
                  secondary
                  type="info"
                  size="small"
                  class="rounded-8px px-16px"
                >
                  下载
                </NButton>
              </div>
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
                编辑此文
              </NButton>
            </div>
          </template>
        </NDrawerContent>
      </NDrawer>
    </NCard>
  </div>
</template>
