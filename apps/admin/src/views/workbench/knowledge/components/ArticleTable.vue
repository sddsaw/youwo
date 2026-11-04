<script setup lang="tsx">
import type { SchemaFormOptions } from '@sa/components'
import { SchemaForm, SvgIcon, TableHeaderOperation } from '@sa/components'
import { useResetReactive } from '@sa/hooks'
import { defaultTransform, useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table'
import { $t } from '@/locales'
import { useAppStore } from '@/store/modules/app'
import {
  CONFIDENCE_OPTIONS,
  initialArticleList,
  TRUST_STATUS_OPTIONS,
} from '@/views/workbench/mock'
import ArticleOperateDrawer from './ArticleOperateDrawer.vue'

defineOptions({
  name: 'ArticleTable',
})

const props = defineProps<Props>()

interface Props {
  selectedCategory: string
  checkedCategoryKeys: string[]
  categoryData: Api.Knowledge.CategoryNode[]
}

interface ArticleSearchParams {
  pageNum: number
  pageSize: number
  keyword: string
  trustStatus: string
  confidence: string
}

const router = useRouter()
const appStore = useAppStore()

// ==========================================
// 1. 搜索参数 & 搜索表单配置 (SchemaForm)
// ==========================================
const [searchParams, resetSearchParams] = useResetReactive<ArticleSearchParams>({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  trustStatus: '',
  confidence: '',
})

const searchFormOptions = computed<SchemaFormOptions[]>(() => [
  {
    value: 'keyword',
    label: $t('page.workbench_knowledge.name'),
    type: 'input',
    span: '24 s:12 m:7',
    attrs: {
      placeholder: $t('common.keywordSearch'),
      clearable: true,
    },
  },
  {
    value: 'trustStatus',
    label: $t('page.workbench_knowledge.trustStatus'),
    type: 'select',
    span: '24 s:6 m:5',
    options: TRUST_STATUS_OPTIONS,
    attrs: {
      placeholder: $t('page.workbench_knowledge.trustStatus'),
    },
  },
  {
    value: 'confidence',
    label: $t('page.workbench_knowledge.confidence'),
    type: 'select',
    span: '24 s:6 m:5',
    options: CONFIDENCE_OPTIONS,
    attrs: {
      placeholder: $t('page.workbench_knowledge.confidence'),
    },
  },
  {
    value: 'operate',
    label: '',
    type: 'slot',
    span: '24 s:24 m:7',
    formItemAttrs: {
      showLabel: false,
    },
  },
])

// ==========================================
// 2. 数据源与 Mock 查询 API
// ==========================================
const articleList = ref<Api.Knowledge.ArticleItem[]>([...initialArticleList])

function handleOpenDetail(id: number) {
  router.push({
    name: 'workbench_knowledge-detail',
    query: { id: String(id) },
  })
}

function getCategoryIds(targetId: string, nodes: Api.Knowledge.CategoryNode[]): string[] {
  const ids: string[] = [targetId]
  const findNode = (list: Api.Knowledge.CategoryNode[]): Api.Knowledge.CategoryNode | undefined => {
    for (const node of list) {
      if (node.id === targetId)
        return node
      if (node.children) {
        const found = findNode(node.children)
        if (found)
          return found
      }
    }
    return undefined
  }
  const targetNode = findNode(nodes)
  if (targetNode?.children) {
    const collect = (children: Api.Knowledge.CategoryNode[]) => {
      for (const child of children) {
        ids.push(child.id)
        if (child.children)
          collect(child.children)
      }
    }
    collect(targetNode.children)
  }
  return ids
}

async function fetchGetArticleList(params: typeof searchParams) {
  const checkedIds = props.checkedCategoryKeys.flatMap(k => getCategoryIds(k, props.categoryData || []))
  const selectedIds = props.selectedCategory ? getCategoryIds(props.selectedCategory, props.categoryData || []) : []

  const filtered = articleList.value.filter((item) => {
    // 1. 左侧分类树过滤 (关联分类主键 categoryId)
    if (checkedIds.length > 0) {
      if (!item.categoryId || !checkedIds.includes(item.categoryId))
        return false
    }
    else if (selectedIds.length > 0) {
      if (!item.categoryId || !selectedIds.includes(item.categoryId))
        return false
    }

    // 2. 状态与置信度过滤
    if (params.trustStatus && item.trustStatus !== params.trustStatus)
      return false
    if (params.confidence && item.confidence !== params.confidence)
      return false

    // 3. 关键字过滤
    if (params.keyword.trim()) {
      const kw = params.keyword.trim().toLowerCase()
      const matchKw
        = item.title.toLowerCase().includes(kw)
          || (item.summary && item.summary.toLowerCase().includes(kw))
          || (item.publisherName && item.publisherName.toLowerCase().includes(kw))
          || (item.category && item.category.toLowerCase().includes(kw))
      if (!matchKw)
        return false
    }
    return true
  })

  const total = filtered.length
  const pageNum = params.pageNum || 1
  const pageSize = params.pageSize || 10
  const start = (pageNum - 1) * pageSize
  const end = start + pageSize
  const records = filtered.slice(start, end)

  return {
    data: {
      records,
      current: pageNum,
      size: pageSize,
      total,
    },
    error: null,
  }
}

// ==========================================
// 3. 独立列配置变量 (Columns)
// ==========================================
function getTableColumns(): NaiveUI.TableColumn<Api.Knowledge.ArticleItem>[] {
  return [
    {
      type: 'selection',
      align: 'center',
      width: 48,
    },
    {
      key: 'index',
      title: $t('common.index'),
      align: 'center',
      width: 64,
      render: (_, index) => index + 1,
    },
    {
      key: 'title',
      title: $t('page.workbench_knowledge.name'),
      minWidth: 260,
      render(row) {
        return (
          <div class="flex flex-col gap-4px py-6px text-left">
            <span
              class="line-clamp-1 cursor-pointer text-14px text-gray-900 font-semibold transition-colors dark:text-zinc-100 hover:text-primary"
              title={row.title}
              onClick={() => handleOpenDetail(row.id)}
            >
              {row.title}
            </span>
            {row.summary && (
              <span
                class="line-clamp-1 text-12px text-gray-500 leading-normal dark:text-zinc-400"
                title={row.summary}
              >
                {row.summary}
              </span>
            )}
          </div>
        )
      },
    },
    {
      key: 'category',
      title: $t('page.workbench_knowledge.category'),
      width: 130,
      align: 'center',
      render(row) {
        return (
          <NTag
            round
            bordered={false}
            size="small"
            class="bg-gray-100/90 px-10px text-gray-700 font-medium dark:bg-zinc-800 dark:text-zinc-300"
          >
            {row.category || 'API 用法'}
          </NTag>
        )
      },
    },
    {
      key: 'confidence',
      title: $t('page.workbench_knowledge.confidence'),
      width: 100,
      align: 'center',
      render(row) {
        const typeMap: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
          高: 'success',
          中: 'warning',
          低: 'error',
        }
        const tagType = (row.confidence && typeMap[row.confidence]) || 'default'
        return (
          <NTag
            type={tagType}
            bordered
            class="px-8px font-medium"
          >
            {row.confidence || '-'}
          </NTag>
        )
      },
    },
    {
      key: 'trustStatus',
      title: $t('page.workbench_knowledge.trustStatus'),
      width: 110,
      align: 'center',
      render(row) {
        const statusMap: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
          有效: 'success',
          被取代: 'warning',
          已过时: 'error',
          未登记: 'default',
        }
        const tagType = (row.trustStatus && statusMap[row.trustStatus]) || 'default'
        return (
          <NTag
            type={tagType}
            bordered
            class="px-10px font-medium"
          >
            {row.trustStatus || '-'}
          </NTag>
        )
      },
    },
    {
      key: 'lastVerifiedAt',
      title: $t('page.workbench_knowledge.lastVerifiedAt'),
      width: 140,
      align: 'center',
      render(row) {
        return (
          <span class="text-gray-600 font-normal tabular-nums dark:text-zinc-300">
            {row.lastVerifiedAt || '-'}
          </span>
        )
      },
    },
    {
      key: 'operate',
      title: $t('common.action'),
      width: 220,
      align: 'center',
      fixed: 'right',
      render(row) {
        return (
          <div class="flex items-center justify-center gap-8px whitespace-nowrap">
            <NButton
              type="info"
              ghost
              size="small"
              onClick={() => handleOpenDetail(row.id)}
            >
              {$t('common.detail')}
            </NButton>
            <NButton
              type="primary"
              ghost
              size="small"
              onClick={() => handleEdit(row.id)}
            >
              {$t('common.edit')}
            </NButton>
            <NPopconfirm onPositiveClick={() => handleDelete(row.id)}>
              {{
                default: () => $t('common.confirmDelete'),
                trigger: () => (
                  <NButton type="error" ghost size="small">
                    {$t('common.delete')}
                  </NButton>
                ),
              }}
            </NPopconfirm>
          </div>
        )
      },
    },
  ]
}

// ==========================================
// 4. 表格 Hook 实例
// ==========================================
const { columns, columnChecks, data, loading, getData, getDataByPage, mobilePagination } = useNaivePaginatedTable<Api.Knowledge.ArticleItem>({
  api: () => fetchGetArticleList(searchParams),
  transform: defaultTransform,
  onPaginationParamsChange: (params) => {
    searchParams.pageNum = params.page ?? 1
    searchParams.pageSize = params.pageSize ?? 10
  },
  columns: getTableColumns,
})

// 表格增删改查操作 Hook
const {
  drawerVisible,
  operateType,
  editingData,
  handleAdd,
  handleEdit,
  checkedRowKeys,
  onBatchDeleted,
  onDeleted,
} = useTableOperate(data, 'id', getData)

// ==========================================
// 4. 事件处理器 & 操作逻辑
// ==========================================
function handleReset() {
  resetSearchParams()
  getDataByPage(1)
}

function handleSearch() {
  getDataByPage(1)
}

watch(
  () => [props.selectedCategory, props.checkedCategoryKeys],
  () => {
    searchParams.pageNum = 1
    getDataByPage(1)
  },
  { deep: true },
)

async function handleDelete(id: number) {
  articleList.value = articleList.value.filter(item => item.id !== id)
  await onDeleted()
}

async function handleBatchDelete() {
  if (!checkedRowKeys.value.length)
    return

  const ids = new Set(checkedRowKeys.value.map(Number))
  articleList.value = articleList.value.filter(item => !ids.has(item.id))
  await onBatchDeleted()
}

function handleSubmitted(item: Api.Knowledge.ArticleItem) {
  if (operateType.value === 'add') {
    articleList.value.unshift(item)
    window.$message?.success('知识条目创建成功')
  }
  else {
    const target = articleList.value.find(row => row.id === item.id)
    if (target) {
      Object.assign(target, item)
    }
    window.$message?.success('知识条目修改成功')
  }
  getDataByPage(1)
}
</script>

<template>
  <div class="h-full min-w-0 flex flex-col flex-1 gap-12px overflow-hidden">
    <!-- 顶部搜索栏 -->
    <NCard :bordered="false" size="small" class="shrink-0 card-wrapper">
      <SchemaForm
        v-model:model="searchParams"
        :options="searchFormOptions"
        :cols="24"
        :x-gap="16"
        :y-gap="12"
        responsive="screen"
        label-placement="left"
        label-width="100"
        :show-feedback="false"
      >
        <template #operate>
          <NSpace class="w-full" justify="end">
            <NButton type="primary" ghost @click="handleSearch">
              <template #icon>
                <SvgIcon icon="material-symbols:search-rounded" class="text-icon" />
              </template>
              {{ $t('common.search') }}
            </NButton>
            <NButton @click="handleReset">
              <template #icon>
                <SvgIcon icon="mdi:refresh" class="text-icon" />
              </template>
              {{ $t('common.reset') }}
            </NButton>
          </NSpace>
        </template>
      </SchemaForm>
    </NCard>

    <!-- 列表及操作栏 -->
    <NCard
      :title="$t('page.workbench_knowledge.tableTitle')"
      :bordered="false"
      size="small"
      class="min-h-0 flex-1 overflow-hidden card-wrapper sm:flex-1-hidden"
      content-style="height: 100%; display: flex; flex-direction: column; min-width: 0; overflow: hidden;"
    >
      <template #header-extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :disabled-delete="checkedRowKeys.length === 0"
          :loading="loading"
          @add="handleAdd"
          @delete="handleBatchDelete"
          @refresh="getData"
        />
      </template>

      <div class="h-full min-h-0 w-full flex-1 overflow-hidden">
        <NDataTable
          v-model:checked-row-keys="checkedRowKeys"
          :columns="columns"
          :data="data"
          size="small"
          :flex-height="!appStore.isMobile"
          :scroll-x="1040"
          :loading="loading"
          remote
          :row-key="(row: Api.Knowledge.ArticleItem) => row.id"
          :pagination="mobilePagination"
          class="h-full"
        />
      </div>

      <!-- 新增 / 编辑抽屉组件 -->
      <ArticleOperateDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="editingData"
        :category-data="categoryData"
        @submitted="handleSubmitted"
      />
    </NCard>
  </div>
</template>
