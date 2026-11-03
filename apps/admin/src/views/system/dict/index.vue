<script setup lang="tsx">
import type { SchemaFormOptions } from '@sa/components'
import { SchemaForm, TableHeaderOperation } from '@sa/components'
import { useResetReactive } from '@sa/hooks'
import { NButton, NPopconfirm, NTag } from 'naive-ui'
import { ref } from 'vue'
import { defaultTransform, useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table'
import { useAppStore } from '@/store/modules/app'
import { type DictType, dictTypes } from './components/db'
import DictDataListDrawer from './components/dict-data-list-drawer.vue'
import DictTypeDrawer from './components/dict-type-drawer.vue'

defineOptions({
  name: 'SystemDict',
})

const appStore = useAppStore()

// ==========================================
// 1. 搜索参数 & 搜索表单配置
// ==========================================

// 搜索条件响应式参数
const [searchParams, resetSearchParams] = useResetReactive({
  pageNum: 1,
  pageSize: 10,
  name: '',
  code: '',
  status: null as string | null,
  createTimeRange: null as [number, number] | null,
})

// 状态下拉选项数据
const statusOptions = [
  { label: '正常', value: '1' },
  { label: '停用', value: '2' },
]

// 搜索过滤表单渲染配置
const searchFormOptions = ref<SchemaFormOptions[]>([
  {
    value: 'name',
    label: '字典名称',
    type: 'input',
    span: '24 s:8 m:5',
    attrs: {
      placeholder: '请输入字典名称',
      clearable: true,
    },
  },
  {
    value: 'code',
    label: '字典类型',
    type: 'input',
    span: '24 s:8 m:5',
    attrs: {
      placeholder: '请输入字典类型',
      clearable: true,
    },
  },
  {
    value: 'status',
    label: '状态',
    type: 'select',
    span: '24 s:8 m:4',
    options: statusOptions,
    attrs: {
      placeholder: '字典状态',
      clearable: true,
    },
  },
  {
    value: 'createTimeRange',
    label: '创建时间',
    type: 'date-picker',
    span: '24 s:12 m:6',
    attrs: {
      type: 'daterange',
      valueFormat: 'yyyy-MM-dd',
      clearable: true,
    },
  },
  {
    value: 'operate',
    label: '',
    type: 'slot',
    span: '24 s:12 m:4',
  },
])

// ==========================================
// 2. Mock 接口请求与数据服务
// ==========================================

/**
 * 模拟从后端获取字典类型的分页列表数据
 */
async function fetchGetDictTypes(params: typeof searchParams) {
  // 模拟网络延迟延延迟 300 毫秒
  await new Promise(resolve => setTimeout(resolve, 300))
  let list = [...dictTypes.value]

  // 前端过滤条件匹配
  if (params.name) {
    list = list.filter(item => item.name.includes(params.name))
  }
  if (params.code) {
    list = list.filter(item => item.code.includes(params.code))
  }
  if (params.status) {
    list = list.filter(item => item.status === params.status)
  }
  if (params.createTimeRange && params.createTimeRange.length === 2) {
    const [start, end] = params.createTimeRange
    list = list.filter((item) => {
      const itemTime = new Date(item.createTime).getTime()
      return itemTime >= start && itemTime <= end
    })
  }

  // 内存分页处理
  const total = list.length
  const pageNum = params.pageNum || 1
  const pageSize = params.pageSize || 10
  const startIndex = (pageNum - 1) * pageSize
  const records = list.slice(startIndex, startIndex + pageSize)

  return {
    error: null,
    data: {
      records,
      current: pageNum,
      size: pageSize,
      total,
    },
  }
}

// ==========================================
// 3. 表格 Hook & 列定义
// ==========================================

// 分页表格主要 Hook
const { columns, columnChecks, data, loading, getData, getDataByPage, mobilePagination } = useNaivePaginatedTable<any, DictType>({
  api: () => fetchGetDictTypes(searchParams),
  transform: defaultTransform,
  onPaginationParamsChange: (params) => {
    searchParams.pageNum = params.page ?? 1
    searchParams.pageSize = params.pageSize ?? 10
  },
  columns: () => [
    {
      type: 'selection',
      align: 'center',
      width: 48,
    },
    {
      key: 'index',
      title: '序号',
      align: 'center',
      width: 64,
      render: (_, index) => index + 1,
    },
    {
      key: 'name',
      title: '字典名称',
      align: 'center',
      ellipsis: { tooltip: true },
    },
    {
      key: 'code',
      title: '字典类型',
      align: 'center',
      render: row => (
        <NButton text type="primary" onClick={() => handleOpenDataList(row)}>
          {row.code}
        </NButton>
      ),
    },
    {
      key: 'status',
      title: '状态',
      align: 'center',
      render: (row) => {
        const type = row.status === '1' ? 'success' : 'error'
        const label = row.status === '1' ? '正常' : '停用'
        return <NTag type={type} bordered={false} size="small">{label}</NTag>
      },
    },
    {
      key: 'remark',
      title: '备注',
      align: 'center',
      ellipsis: { tooltip: true },
    },
    {
      key: 'createTime',
      title: '创建时间',
      align: 'center',
    },
    {
      key: 'operate',
      title: '操作',
      align: 'center',
      width: 170,
      render: row => (
        <div class="flex justify-center gap-8px">
          <NButton type="primary" ghost size="small" onClick={() => handleEdit(row.id)}>
            修改
          </NButton>
          <NButton type="warning" ghost size="small" onClick={() => handleOpenDataList(row)}>
            键值
          </NButton>
          <NPopconfirm onPositiveClick={() => handleDelete(row.id)}>
            {{
              default: () => '确认删除该字典类型吗？删除后其包含的所有字典数据也将丢失！',
              trigger: () => (
                <NButton type="error" ghost size="small">
                  删除
                </NButton>
              ),
            }}
          </NPopconfirm>
        </div>
      ),
    },
  ],
})

// 表格常见增删改查操作封装 Hook
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

/**
 * 重置搜索参数并刷新表格
 */
function handleReset() {
  resetSearchParams()
  getDataByPage()
}

/**
 * 删除单个字典类型
 * @param id 字典类型ID
 */
function handleDelete(id: string) {
  const index = dictTypes.value.findIndex(item => item.id === id)
  if (index > -1) {
    dictTypes.value.splice(index, 1)
    window.$message?.success('删除成功')
    onDeleted()
  }
}

/**
 * 批量删除选中的字典类型
 */
function handleBatchDelete() {
  checkedRowKeys.value.forEach((key) => {
    const index = dictTypes.value.findIndex(item => item.id === key)
    if (index > -1) {
      dictTypes.value.splice(index, 1)
    }
  })
  window.$message?.success('删除成功')
  onBatchDeleted()
}

// ==========================================
// 5. 字典键值管理 Drawer 控制
// ==========================================

const dataListVisible = ref(false)
const selectedDictType = ref<DictType | null>(null)

/**
 * 打开字典数据值管理抽屉
 * @param row 选中的字典类型行数据
 */
function handleOpenDataList(row: DictType) {
  selectedDictType.value = row
  dataListVisible.value = true
}
</script>

<template>
  <div class="h-full min-h-500px w-full flex-col-stretch gap-12px overflow-hidden p-4 lt-sm:overflow-auto">
    <!-- 顶部搜索栏 -->
    <NCard :bordered="false" size="small" class="card-wrapper">
      <SchemaForm
        v-model:model="searchParams"
        :options="searchFormOptions"
        :cols="24"
        :x-gap="16"
        :y-gap="12"
        responsive="screen"
        label-placement="left"
        :label-width="80"
        :show-feedback="false"
      >
        <template #operate>
          <NSpace class="w-full" justify="end">
            <NButton type="primary" ghost @click="() => getDataByPage()">
              <template #icon>
                <SvgIcon icon="ic:round-search" class="text-icon" />
              </template>
              搜索
            </NButton>
            <NButton @click="handleReset">
              <template #icon>
                <SvgIcon icon="ic:round-refresh" class="text-icon" />
              </template>
              重置
            </NButton>
          </NSpace>
        </template>
      </SchemaForm>
    </NCard>

    <!-- 列表及操作栏 -->
    <NCard title="字典列表" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
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
      <div class="h-full w-full flex flex-col gap-12px">
        <!-- 数据表格 -->
        <NDataTable
          v-model:checked-row-keys="checkedRowKeys"
          :columns="columns"
          :data="data"
          size="small"
          :flex-height="!appStore.isMobile"
          :scroll-x="960"
          :loading="loading"
          remote
          :row-key="row => row.id"
          :pagination="mobilePagination"
          class="flex-1 sm:h-full"
        />
      </div>

      <!-- 新增/编辑字典类型抽屉 -->
      <DictTypeDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :dict-id="editingData?.id"
        @submitted="getDataByPage"
      />

      <!-- 字典值数据管理侧边栏 -->
      <DictDataListDrawer
        v-model:visible="dataListVisible"
        :dict-type="selectedDictType"
      />
    </NCard>
  </div>
</template>

<style scoped></style>
