<script setup lang="tsx">
import { defaultTransform, useNaivePaginatedTable } from '@/hooks/common/table'
import { useAppStore } from '@/store/modules/app'
import { useApprovalStore } from '@/store/modules/approval'
import ApprovalDetailDrawer from './components/ApprovalDetailDrawer.vue'

defineOptions({
  name: 'WorkbenchApprovalPage',
})

const route = useRoute()
const appStore = useAppStore()
const approvalStore = useApprovalStore()

// ==========================================
// 1. Tab 与 筛选条件状态
// ==========================================
type TabKey = 'pending' | 'handled' | 'all'
const activeTab = ref<TabKey>('pending')

/** 查询参数（集成通用分页结构） */
const searchParams = reactive({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  priority: '' as Api.Approval.Priority | '',
})

/** 优先级下拉选项 */
const priorityOptions: { label: string, value: Api.Approval.Priority | '' }[] = [
  { label: '全部优先级', value: '' },
  { label: '普通', value: 'normal' },
  { label: '紧急', value: 'urgent' },
  { label: '特急', value: 'critical' },
]

/** 优先级 Tag 渲染映射 */
const priorityTagMap: Record<Api.Approval.Priority, { label: string, type: 'default' | 'error' | 'warning' }> = {
  normal: { label: '普通', type: 'default' },
  urgent: { label: '紧急', type: 'warning' },
  critical: { label: '特急', type: 'error' },
}

/** 状态 Tag 渲染映射 */
const statusTagMap: Record<Api.Approval.Status, { label: string, type: 'error' | 'success' | 'warning' }> = {
  pending: { label: '待审批', type: 'warning' },
  approved: { label: '已通过', type: 'success' },
  rejected: { label: '已驳回', type: 'error' },
}

// ==========================================
// 2. 表格数据获取 API 模拟
// ==========================================
async function fetchGetApprovalList() {
  let list = approvalStore.records

  // 1. Tab 状态过滤
  if (activeTab.value === 'pending') {
    list = list.filter(item => item.status === 'pending')
  }
  else if (activeTab.value === 'handled') {
    list = list.filter(item => item.status !== 'pending')
  }

  // 2. 关键字搜索过滤
  if (searchParams.keyword.trim()) {
    const kw = searchParams.keyword.trim().toLowerCase()
    list = list.filter(
      item => item.title.toLowerCase().includes(kw) || item.applicant.toLowerCase().includes(kw),
    )
  }

  // 3. 优先级过滤
  if (searchParams.priority) {
    list = list.filter(item => item.priority === searchParams.priority)
  }

  const total = list.length
  const pageNum = searchParams.pageNum || 1
  const pageSize = searchParams.pageSize || 10
  const start = (pageNum - 1) * pageSize
  const end = start + pageSize
  const records = list.slice(start, end)

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
// 3. 使用统一 Table Hook: useNaivePaginatedTable
// ==========================================
const {
  columns,
  data,
  loading,
  getDataByPage,
  mobilePagination,
} = useNaivePaginatedTable<Api.Approval.RecordItem>({
  api: fetchGetApprovalList,
  transform: defaultTransform,
  onPaginationParamsChange: (params) => {
    searchParams.pageNum = params.page ?? 1
    searchParams.pageSize = params.pageSize ?? 10
  },
  columns: () => [
    {
      title: '申请标题 / 变更说明',
      key: 'title',
      minWidth: 260,
      render(row) {
        return (
          <div class="py-4px">
            <div class="text-gray-800 font-medium dark:text-gray-100">{row.title}</div>
            <div class="line-clamp-1 mt-2px text-12px text-gray-400">{row.reason}</div>
          </div>
        )
      },
    },
    {
      title: '业务类型',
      key: 'bizType',
      width: 120,
      render(row) {
        return <NTag size="small" bordered={false}>{row.bizType}</NTag>
      },
    },
    {
      title: '申请人 / 部门',
      key: 'applicant',
      width: 160,
      render(row) {
        return (
          <div>
            <div class="text-gray-700 font-medium dark:text-gray-200">{row.applicant}</div>
            <div class="text-11px text-gray-400">{row.dept}</div>
          </div>
        )
      },
    },
    {
      title: '提交时间',
      key: 'applyTime',
      width: 150,
      render(row) {
        return <span class="text-12px text-gray-500 dark:text-gray-400">{row.applyTime}</span>
      },
    },
    {
      title: '紧急度',
      key: 'priority',
      width: 90,
      render(row) {
        const config = priorityTagMap[row.priority]
        return <NTag type={config.type}>{config.label}</NTag>
      },
    },
    {
      title: '状态',
      key: 'status',
      width: 90,
      render(row) {
        const config = statusTagMap[row.status]
        return <NTag type={config.type}>{config.label}</NTag>
      },
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      align: 'center',
      render(row) {
        if (row.status === 'pending') {
          return (
            <NSpace justify="center" size="small">
              <NButton
                type="primary"
                ghost
                size="small"
                onClick={() => handleOpenDetail(row)}
              >
                审批
              </NButton>
              <NPopconfirm onPositiveClick={() => handleInlineApprove(row)}>
                {{
                  default: () => '确认直接同意并发布该单据吗？',
                  trigger: () => (
                    <NButton
                      size="small"
                      type="success"
                      ghost
                    >
                      同意
                    </NButton>
                  ),
                }}
              </NPopconfirm>
            </NSpace>
          )
        }
        return (
          <NButton size="tiny" quaternary onClick={() => handleOpenDetail(row)}>
            查看详情
          </NButton>
        )
      },
    },
  ],
})

// 监听 Tab 切换或 Store 数据变更，自动刷新表格
watch(
  [activeTab, () => approvalStore.records],
  () => {
    getDataByPage(1)
  },
  { deep: true },
)

function handleResetSearch() {
  searchParams.keyword = ''
  searchParams.priority = ''
  getDataByPage(1)
}

// ==========================================
// 4. 抽屉控制与行内操作
// ==========================================
const drawerVisible = ref(false)
const currentRecord = ref<Api.Approval.RecordItem | null>(null)

/** 打开审批抽屉 */
function handleOpenDetail(record: Api.Approval.RecordItem) {
  currentRecord.value = record
  drawerVisible.value = true
}

/** 行内快捷同意并通过 */
function handleInlineApprove(record: Api.Approval.RecordItem) {
  approvalStore.approve(record.id, '审核通过')
  window.$message?.success(`已同意单据：${record.id}`)
}

// ==========================================
// 5. 路由参数联动 (小铃铛点击直达指定审批单)
// ==========================================
function checkRouteQuery() {
  const targetId = route.query.id as string
  if (targetId) {
    const target = approvalStore.getRecord(targetId)
    if (target) {
      if (target.status === 'pending') {
        activeTab.value = 'pending'
      }
      else {
        activeTab.value = 'handled'
      }
      handleOpenDetail(target)
    }
  }
}

onMounted(() => {
  checkRouteQuery()
})

watch(() => route.query.id, () => {
  checkRouteQuery()
})
</script>

<template>
  <div class="h-full min-h-0 flex flex-col gap-12px overflow-hidden p-12px">
    <!-- 顶部状态切换与搜索栏卡片 -->
    <NCard size="small" :bordered="false" class="rounded-8px shadow-sm">
      <div class="flex flex-wrap items-center justify-between gap-16px">
        <!-- 分类切换 Tabs (移除半截断裂的导轨底线) -->
        <NTabs
          v-model:value="activeTab"
          type="line"
          animated
          size="medium"
          class="w-auto"
          :theme-overrides="{
            tabBorderColor: 'transparent',
          }"
        >
          <NTabPane name="pending">
            <template #tab>
              <NSpace align="center" :size="6" class="px-4px">
                <span>待我审批</span>
                <NBadge
                  :value="approvalStore.pendingCount"
                  :max="99"
                  :show-zero="false"
                  type="warning"
                />
              </NSpace>
            </template>
          </NTabPane>
          <NTabPane name="handled">
            <template #tab>
              <NSpace align="center" :size="6" class="px-4px">
                <span>已处理</span>
                <span class="text-12px text-gray-400">({{ approvalStore.handledList.length }})</span>
              </NSpace>
            </template>
          </NTabPane>
          <NTabPane name="all">
            <template #tab>
              <NSpace align="center" :size="6" class="px-4px">
                <span>全部单据</span>
                <span class="text-12px text-gray-400">({{ approvalStore.records.length }})</span>
              </NSpace>
            </template>
          </NTabPane>
        </NTabs>

        <!-- 筛选查询区域 -->
        <NSpace align="center" :size="10" class="flex-nowrap">
          <NInput
            v-model:value="searchParams.keyword"
            placeholder="搜索申请标题 / 申请人"
            clearable
            style="width: 220px;"
            @update:value="() => getDataByPage(1)"
          >
            <template #prefix>
              <SvgIcon icon="material-symbols:search-rounded" class="text-gray-400" />
            </template>
          </NInput>
          <NSelect
            v-model:value="searchParams.priority"
            :options="priorityOptions"
            placeholder="紧急程度"
            style="width: 130px;"
            @update:value="() => getDataByPage(1)"
          />
          <NButton @click="handleResetSearch">
            <template #icon>
              <SvgIcon icon="mdi:refresh" />
            </template>
            重置
          </NButton>
        </NSpace>
      </div>
    </NCard>

    <!-- 列表展示卡片 -->
    <NCard
      :bordered="false"
      size="small"
      class="min-h-0 flex-1 overflow-hidden rounded-8px shadow-sm"
      content-style="height: 100%; display: flex; flex-direction: column; min-width: 0; padding: 12px;"
    >
      <div class="h-full min-h-0 w-full flex-1 overflow-hidden">
        <NDataTable
          :columns="columns"
          :data="data"
          size="small"
          :scroll-x="960"
          :flex-height="!appStore.isMobile"
          :loading="loading"
          remote
          :row-key="(row: Api.Approval.RecordItem) => row.id"
          :pagination="mobilePagination"
          class="h-full"
        />
      </div>
    </NCard>

    <!-- 抽离出的审批详情抽屉组件 -->
    <ApprovalDetailDrawer
      v-model:visible="drawerVisible"
      :record="currentRecord"
    />
  </div>
</template>

<style scoped>
/* 彻底清除 NTabs 默认截断的半截灰色分割线 */
:deep(.n-tabs.n-tabs--line-type .n-tabs-nav-scroll-content) {
  border-bottom: none !important;
  box-shadow: none !important;
}
:deep(.n-tabs-nav::before),
:deep(.n-tabs-nav::after),
:deep(.n-tabs-nav-scroll-content::after) {
  display: none !important;
  border-bottom: none !important;
}
</style>
