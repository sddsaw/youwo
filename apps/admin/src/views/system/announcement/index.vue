<script setup lang="ts">
import type { DataTableColumns } from 'naive-ui'
import {
  NButton,
  NCard,
  NDataTable,
  NDrawer,
  NDrawerContent,
  NForm,
  NFormItem,
  NGi,
  NGrid,
  NInput,
  NModal,
  NPopconfirm,
  NScrollbar,
  NSelect,
  NSpace,
  NTag,
} from 'naive-ui'
import { computed, h, reactive, ref } from 'vue'

defineOptions({
  name: 'SystemAnnouncement',
})

// Mock Data Structure
interface NoticeItem {
  id: string
  title: string
  type: '1' | '2' | '3' | '4' // 1-通知, 2-公告, 3-会议, 4-要闻
  status: '1' | '2' // 1-启用, 2-禁用
  publisher: string
  createTime: string
  releaseTime: string
  content: string
}

const typeOptions = [
  { label: '通知', value: '1', type: 'info' },
  { label: '公告', value: '2', type: 'warning' },
  { label: '会议', value: '3', type: 'success' },
  { label: '要闻', value: '4', type: 'error' },
]

const statusOptions = [
  { label: '启用', value: '1', type: 'success' },
  { label: '禁用', value: '2', type: 'error' },
]

// Sample static data
const initialData: NoticeItem[] = [
  {
    id: '1',
    title: '关于2026年国庆节放假安排的通知',
    type: '1',
    status: '1',
    publisher: '校办公室',
    createTime: '2026-06-25 09:00:00',
    releaseTime: '2026-06-26 10:00:00',
    content: '各位师生：根据国家法定节假日安排，现将2026年国庆节放假安排通知如下：10月1日至10月7日放假调休，共7天。9月27日（星期日）、10月10日（星期六）上班上课。请各部门妥善安排好值班和安全、保卫等工作，遇有重大突发事件，要按规定及时报告并妥善处置，确保师生员工祥和平安度过节日假期。',
  },
  {
    id: '2',
    title: '智慧校园管理系统停机升级维护公告',
    type: '2',
    status: '1',
    publisher: '信息技术中心',
    createTime: '2026-06-28 14:00:00',
    releaseTime: '2026-06-28 18:00:00',
    content: '为提供更优质、稳定的系统服务，我校智慧校园系统将于本周五（7月2日）22:00至次日06:00进行版本停机升级维护。届时，统一身份认证、办事大厅及相关教务、系统等部分在线业务将暂停访问，给您带来不便，敬请谅解。',
  },
  {
    id: '3',
    title: '2026年秋季学期教学工作部署会议通知',
    type: '3',
    status: '1',
    publisher: '教务处',
    createTime: '2026-06-29 08:30:00',
    releaseTime: '2026-06-29 09:00:00',
    content: '校属各教学单位：定于6月30日（星期二）下午14:30在行政楼一楼多功能报告厅召开2026年秋季学期教学工作部署会，请各学院院长、教学副院长、教学秘书准时参加。会议将重点讨论新学期课程大纲优化、教学计划排课及新校区实验室软硬件建设等工作。',
  },
  {
    id: '4',
    title: '关于防范夏季网络电信诈骗的紧急安全提示',
    type: '4',
    status: '1',
    publisher: '保卫处',
    createTime: '2026-06-20 10:00:00',
    releaseTime: '2026-06-20 10:30:00',
    content: '近期网络诈骗与兼职刷单骗局频发，保卫处特此紧急提示：请广大师生务必提高警惕，切勿轻信陌生短信、QQ群兼职赚取高额佣金的诱惑，更不可将个人银行卡号、手机验证码透露给陌生人。如遇可疑转账情况，请立即拨打保卫处24小时校园值班电话或联系辖区民警进行查证核实。',
  },
  {
    id: '5',
    title: '关于开展全校楼宇安全生产大检查的通知（草稿）',
    type: '1',
    status: '2',
    publisher: '资产与后勤处',
    createTime: '2026-06-29 10:00:00',
    releaseTime: '-',
    content: '为切实排查并消除校园火灾与用电隐患，确保广大师生暑期生命财产安全，拟于本周开展全校范围的安全大排查。重点检查各实验室危化品存放、后勤食堂燃气管线及高层宿舍消防通道。此通知草稿待校委审批后正式下发。',
  },
]

const listData = ref<NoticeItem[]>([...initialData])

// Search Params
const searchParams = reactive({
  title: '',
  type: null as string | null,
  status: null as string | null,
})

// Filtered list
const filteredData = computed(() => {
  return listData.value.filter((item) => {
    const matchTitle = !searchParams.title || item.title.includes(searchParams.title)
    const matchType = !searchParams.type || item.type === searchParams.type
    const matchStatus = !searchParams.status || item.status === searchParams.status
    return matchTitle && matchType && matchStatus
  })
})

function handleSearch() {
  window.$message?.success('查询成功')
}

function handleReset() {
  searchParams.title = ''
  searchParams.type = null
  searchParams.status = null
  window.$message?.info('已重置搜索条件')
}

// Drawer controls
const drawerVisible = ref(false)
const drawerTitle = ref('')
const drawerType = ref<'add' | 'edit'>('add')
const formRef = ref<any>(null)

const formModel = reactive({
  id: '',
  title: '',
  type: '1' as '1' | '2' | '3' | '4',
  status: '1' as '1' | '2',
  publisher: '',
  content: '',
})

const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  type: [{ required: true, message: '请选择公告类型', trigger: 'change' }],
  status: [{ required: true, message: '请选择启用状态', trigger: 'change' }],
  publisher: [{ required: true, message: '请输入发布人/发布部门', trigger: 'blur' }],
  content: [{ required: true, message: '请输入公告详细内容', trigger: 'blur' }],
}

function openAddDrawer() {
  drawerType.value = 'add'
  drawerTitle.value = '新增通知公告'
  formModel.id = ''
  formModel.title = ''
  formModel.type = '1'
  formModel.status = '1'
  formModel.publisher = '系统管理员'
  formModel.content = ''
  drawerVisible.value = true
}

function openEditDrawer(row: NoticeItem) {
  drawerType.value = 'edit'
  drawerTitle.value = '编辑通知公告'
  formModel.id = row.id
  formModel.title = row.title
  formModel.type = row.type
  formModel.status = row.status
  formModel.publisher = row.publisher
  formModel.content = row.content
  drawerVisible.value = true
}

function handleSave() {
  formRef.value?.validate((errors: any) => {
    if (errors) {
      window.$message?.error('表单校验未通过，请完善红字信息')
      return
    }

    const now = new Date()
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`

    if (drawerType.value === 'add') {
      const newId = String(Number(listData.value.reduce((max, item) => Number(item.id) > max ? Number(item.id) : max, 0)) + 1)
      const newItem: NoticeItem = {
        id: newId,
        title: formModel.title,
        type: formModel.type,
        status: formModel.status,
        publisher: formModel.publisher,
        createTime: timeStr,
        releaseTime: formModel.status === '1' ? timeStr : '-',
        content: formModel.content,
      }
      listData.value.unshift(newItem)
      window.$message?.success('新增公告成功！')
    }
    else {
      const index = listData.value.findIndex(item => item.id === formModel.id)
      if (index > -1) {
        listData.value[index] = {
          ...listData.value[index],
          title: formModel.title,
          type: formModel.type,
          status: formModel.status,
          publisher: formModel.publisher,
          releaseTime: formModel.status === '1' && listData.value[index].releaseTime === '-' ? timeStr : listData.value[index].releaseTime,
          content: formModel.content,
        }
        window.$message?.success('保存公告成功！')
      }
    }
    drawerVisible.value = false
  })
}

// Delete Handler
function handleDelete(id: string) {
  const index = listData.value.findIndex(item => item.id === id)
  if (index > -1) {
    listData.value.splice(index, 1)
    window.$message?.success('删除公告成功！')
  }
}

// View Details Modal
const viewModalVisible = ref(false)
const activeNotice = ref<NoticeItem | null>(null)

function handleView(row: NoticeItem) {
  activeNotice.value = row
  viewModalVisible.value = true
}

// Table columns setup
const columns: DataTableColumns<NoticeItem> = [
  {
    title: '序号',
    key: 'index',
    width: 60,
    align: 'center',
    render: (_, index) => index + 1,
  },
  {
    title: '标题',
    key: 'title',
    minWidth: 220,
    ellipsis: { tooltip: true },
  },
  {
    title: '类型',
    key: 'type',
    width: 100,
    align: 'center',
    render(row) {
      const typeOpt = typeOptions.find(o => o.value === row.type)
      return h(
        NTag,
        { type: typeOpt?.type as any, bordered: false, round: true },
        { default: () => typeOpt?.label || '未知' },
      )
    },
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    align: 'center',
    render(row) {
      const statusOpt = statusOptions.find(o => o.value === row.status)
      return h(
        NTag,
        { type: statusOpt?.type as any, bordered: false },
        { default: () => statusOpt?.label || '未知' },
      )
    },
  },
  {
    title: '发布人/部门',
    key: 'publisher',
    width: 120,
    align: 'center',
  },
  {
    title: '创建时间',
    key: 'createTime',
    width: 170,
    align: 'center',
  },
  {
    title: '发布时间',
    key: 'releaseTime',
    width: 170,
    align: 'center',
  },
  {
    title: '操作',
    key: 'actions',
    width: 180,
    align: 'center',
    render(row) {
      return h(NSpace, { size: 'small', justify: 'center' }, {
        default: () => [
          h(
            NButton,
            { size: 'small', quaternary: true, type: 'info', onClick: () => handleView(row) },
            { default: () => '详情' },
          ),
          h(
            NButton,
            { size: 'small', quaternary: true, type: 'primary', onClick: () => openEditDrawer(row) },
            { default: () => '编辑' },
          ),
          h(
            NPopconfirm,
            {
              onPositiveClick: () => handleDelete(row.id),
              trigger: 'click',
            },
            {
              trigger: () => h(
                NButton,
                { size: 'small', quaternary: true, type: 'error' },
                { default: () => '删除' },
              ),
              default: () => '确定要删除此条通知公告吗？',
            },
          ),
        ],
      })
    },
  },
]
</script>

<template>
  <NSpace vertical :size="16" class="w-full p-4">
    <!-- Filter Card -->
    <NCard :bordered="false" class="card-wrapper">
      <NForm inline label-placement="left" :model="searchParams" class="w-full">
        <NGrid :x-gap="16" :y-gap="16" cols="24">
          <NGi span="24 m:6">
            <NFormItem label="公告标题">
              <NInput v-model:value="searchParams.title" placeholder="请输入公告标题" clearable />
            </NFormItem>
          </NGi>
          <NGi span="24 m:5">
            <NFormItem label="类型">
              <NSelect
                v-model:value="searchParams.type"
                placeholder="请选择类型"
                :options="typeOptions"
                clearable
              />
            </NFormItem>
          </NGi>
          <NGi span="24 m:5">
            <NFormItem label="状态">
              <NSelect
                v-model:value="searchParams.status"
                placeholder="请选择状态"
                :options="statusOptions"
                clearable
              />
            </NFormItem>
          </NGi>
          <NGi span="24 m:8" class="flex justify-end">
            <NSpace>
              <NButton @click="handleReset">
                重置
              </NButton>
              <NButton type="primary" @click="handleSearch">
                <template #icon>
                  <SvgIcon icon="mdi:magnify" />
                </template>
                查询
              </NButton>
            </NSpace>
          </NGi>
        </NGrid>
      </NForm>
    </NCard>

    <!-- Table Content Card -->
    <NCard :bordered="false" title="通知公告列表" class="card-wrapper">
      <template #header-extra>
        <NButton type="primary" @click="openAddDrawer">
          <template #icon>
            <SvgIcon icon="ic:round-plus" />
          </template>
          新增通知
        </NButton>
      </template>

      <NDataTable
        :columns="columns"
        :data="filteredData"
        :bordered="false"
        :pagination="{ pageSize: 10 }"
      />
    </NCard>

    <!-- Add/Edit Drawer -->
    <NDrawer v-model:show="drawerVisible" :width="500" placement="right">
      <NDrawerContent :title="drawerTitle" closable>
        <NForm
          ref="formRef"
          :model="formModel"
          :rules="rules"
          label-placement="left"
          :label-width="90"
          require-mark-placement="left"
        >
          <NFormItem label="公告标题" path="title">
            <NInput v-model:value="formModel.title" placeholder="请输入标题" maxlength="100" show-count />
          </NFormItem>

          <NFormItem label="公告类型" path="type">
            <NSelect v-model:value="formModel.type" :options="typeOptions" placeholder="请选择类型" />
          </NFormItem>

          <NFormItem label="启用状态" path="status">
            <NSelect v-model:value="formModel.status" :options="statusOptions" placeholder="请选择状态" />
          </NFormItem>

          <NFormItem label="发布者" path="publisher">
            <NInput v-model:value="formModel.publisher" placeholder="请输入发布人/发布部门" />
          </NFormItem>

          <NFormItem label="公告内容" path="content">
            <NInput
              v-model:value="formModel.content"
              type="textarea"
              placeholder="请输入公告正文内容..."
              :rows="8"
            />
          </NFormItem>
        </NForm>

        <template #footer>
          <NSpace justify="end">
            <NButton @click="drawerVisible = false">
              取消
            </NButton>
            <NButton type="primary" @click="handleSave">
              保存
            </NButton>
          </NSpace>
        </template>
      </NDrawerContent>
    </NDrawer>

    <!-- Details View Modal -->
    <NModal
      v-model:show="viewModalVisible"
      preset="card"
      style="width: 600px; max-width: 90%"
      title="通知公告详情"
    >
      <div v-if="activeNotice" class="flex flex-col gap-4">
        <h2 class="m-0 text-center text-18px text-gray-800 font-bold dark:text-gray-100">
          {{ activeNotice.title }}
        </h2>
        <div class="flex flex-wrap justify-center gap-x-4 gap-y-2 border-b border-gray-100 pb-3 text-12px text-gray-400 dark:border-gray-800">
          <span>
            类型：
            <NTag size="small" :type="typeOptions.find(o => o.value === activeNotice?.type)?.type as any" :bordered="false">
              {{ typeOptions.find(o => o.value === activeNotice?.type)?.label }}
            </NTag>
          </span>
          <span>发布单位/发布人：{{ activeNotice.publisher }}</span>
          <span>创建时间：{{ activeNotice.createTime }}</span>
          <span>发布时间：{{ activeNotice.releaseTime }}</span>
        </div>
        <NScrollbar style="max-height: 350px;" class="pr-2">
          <div class="whitespace-pre-wrap text-14px text-gray-600 leading-6 dark:text-gray-300">
            {{ activeNotice.content }}
          </div>
        </NScrollbar>
      </div>
      <template #action>
        <div class="flex justify-end">
          <NButton type="primary" @click="viewModalVisible = false">
            关闭
          </NButton>
        </div>
      </template>
    </NModal>
  </NSpace>
</template>

<style scoped></style>
