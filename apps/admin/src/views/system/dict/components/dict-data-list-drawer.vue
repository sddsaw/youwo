<script setup lang="tsx">
import { NButton, NCard, NDataTable, NDrawer, NDrawerContent, NForm, NFormItemGi, NGrid, NInput, NPopconfirm, NSpace, NTag } from 'naive-ui'
import { reactive, ref, watch } from 'vue'
import { useTableOperate } from '@/hooks/common/table'
import { type DictData, dictDataMap, type DictType } from './db'
import DictDataDrawer from './dict-data-drawer.vue'

defineOptions({
  name: 'DictDataListDrawer',
})

const props = defineProps<Props>()

interface Props {
  dictType: DictType | null
}

const visible = defineModel<boolean>('visible', {
  default: false,
})

// Search parameter
const searchParams = reactive({
  label: '',
})

// Local reactive list for dict data
const localData = ref<DictData[]>([])

function loadData() {
  if (props.dictType) {
    const list = dictDataMap.value[props.dictType.code] || []
    localData.value = list.filter((item) => {
      return !searchParams.label || item.label.includes(searchParams.label)
    })
  }
  else {
    localData.value = []
  }
}

function handleReset() {
  searchParams.label = ''
  loadData()
}

// Columns definition in JSX
const columns = ref<any[]>([
  {
    type: 'selection',
    align: 'center',
    width: 48,
  },
  {
    key: 'label',
    title: '数据标签',
    align: 'center',
  },
  {
    key: 'value',
    title: '数据键值',
    align: 'center',
  },
  {
    key: 'sort',
    title: '排序',
    align: 'center',
    width: 70,
  },
  {
    key: 'status',
    title: '状态',
    align: 'center',
    width: 80,
    render: (row: DictData) => {
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
    key: 'operate',
    title: '操作',
    align: 'center',
    width: 130,
    render: (row: DictData) => (
      <div class="flex justify-center gap-8px">
        <NButton type="primary" ghost size="small" onClick={() => edit(row.id)}>
          编辑
        </NButton>
        <NPopconfirm onPositiveClick={() => handleDelete(row.id)}>
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
    ),
  },
])

const {
  drawerVisible: childDrawerVisible,
  operateType: childOperateType,
  editingData: childEditingData,
  handleAdd: handleAddData,
  handleEdit: handleEditData,
  checkedRowKeys,
} = useTableOperate(localData, 'id', async () => loadData())

function edit(id: string) {
  handleEditData(id)
}

function handleDelete(id: string) {
  if (props.dictType) {
    const list = dictDataMap.value[props.dictType.code] || []
    const idx = list.findIndex(item => item.id === id)
    if (idx > -1) {
      list.splice(idx, 1)
      window.$message?.success('删除成功')
      loadData()
    }
  }
}

function handleBatchDelete() {
  if (props.dictType) {
    const list = dictDataMap.value[props.dictType.code] || []
    checkedRowKeys.value.forEach((key) => {
      const idx = list.findIndex(item => item.id === key)
      if (idx > -1) {
        list.splice(idx, 1)
      }
    })
    window.$message?.success('删除成功')
    checkedRowKeys.value = []
    loadData()
  }
}

watch([visible, () => props.dictType], () => {
  if (visible.value) {
    loadData()
  }
}, { deep: true })
</script>

<template>
  <NDrawer v-model:show="visible" display-directive="show" :width="750">
    <NDrawerContent :title="props.dictType ? `字典数据项 - ${props.dictType.name}` : '字典数据管理'" closable>
      <div class="flex-col-stretch gap-12px overflow-hidden">
        <NCard :bordered="false" size="small" class="card-wrapper">
          <NForm :model="searchParams" label-placement="left" :label-width="80" :show-feedback="false">
            <NGrid responsive="screen" item-responsive>
              <NFormItemGi span="24 s:12 m:14" label="数据标签" path="label" class="pr-24px">
                <NInput v-model:value="searchParams.label" placeholder="请输入数据标签" clearable />
              </NFormItemGi>
              <NFormItemGi span="24 s:12 m:10">
                <NSpace class="w-full" justify="end">
                  <NButton @click="handleReset">
                    重置
                  </NButton>
                  <NButton type="primary" ghost @click="loadData">
                    搜索
                  </NButton>
                </NSpace>
              </NFormItemGi>
            </NGrid>
          </NForm>
        </NCard>

        <NCard :bordered="false" size="small" class="flex-1 card-wrapper">
          <template #header-extra>
            <NSpace>
              <NButton size="small" ghost type="primary" @click="handleAddData">
                新增
              </NButton>
              <NPopconfirm @positive-click="handleBatchDelete">
                <template #trigger>
                  <NButton size="small" ghost type="error" :disabled="checkedRowKeys.length === 0">
                    删除
                  </NButton>
                </template>
                确认删除选中的数据吗？
              </NPopconfirm>
            </NSpace>
          </template>
          <NDataTable
            v-model:checked-row-keys="checkedRowKeys"
            :columns="columns"
            :data="localData"
            size="small"
            :row-key="row => row.id"
            class="h-full"
          />
        </NCard>
      </div>

      <DictDataDrawer
        v-model:visible="childDrawerVisible"
        :operate-type="childOperateType"
        :dict-type-code="props.dictType?.code || ''"
        :data-id="childEditingData?.id"
        @submitted="loadData"
      />
    </NDrawerContent>
  </NDrawer>
</template>

<style scoped></style>
