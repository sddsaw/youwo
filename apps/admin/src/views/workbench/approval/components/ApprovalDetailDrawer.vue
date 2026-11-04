<script setup lang="ts">
import { useApprovalStore } from '@/store/modules/approval'

defineOptions({
  name: 'ApprovalDetailDrawer',
})

const props = defineProps<Props>()

interface Props {
  record: Api.Approval.RecordItem | null
}

const visible = defineModel<boolean>('visible', { default: false })
const approvalStore = useApprovalStore()
const approvalComment = ref('')

/** 优先级 Tag 映射 */
const priorityTagMap: Record<Api.Approval.Priority, { label: string, type: 'default' | 'error' | 'warning' }> = {
  normal: { label: '普通', type: 'default' },
  urgent: { label: '紧急', type: 'warning' },
  critical: { label: '特急', type: 'error' },
}

/** 状态 Tag 映射 */
const statusTagMap: Record<Api.Approval.Status, { label: string, type: 'error' | 'success' | 'warning' }> = {
  pending: { label: '待审批', type: 'warning' },
  approved: { label: '已通过', type: 'success' },
  rejected: { label: '已驳回', type: 'error' },
}

/** 监听选中的单据变更，重置或预填批注 */
watch(
  () => props.record,
  (val) => {
    approvalComment.value = val?.comment || ''
  },
  { immediate: true },
)

/** 审批通过操作 */
function handleApprove() {
  if (!props.record)
    return
  approvalStore.approve(props.record.id, approvalComment.value || '审核通过')
  window.$message?.success(`已同意单据：${props.record.id}`)
  visible.value = false
}

/** 审批驳回操作 */
function handleReject() {
  if (!props.record)
    return
  if (!approvalComment.value.trim()) {
    window.$message?.warning('驳回时请填写审批意见 / 驳回原因')
    return
  }
  approvalStore.reject(props.record.id, approvalComment.value)
  window.$message?.error(`已驳回单据：${props.record.id}`)
  visible.value = false
}
</script>

<template>
  <NDrawer v-model:show="visible" :width="520" placement="right">
    <NDrawerContent
      v-if="record"
      :title="record.status === 'pending' ? '审批处理' : '审批详情'"
      closable
    >
      <div class="flex flex-col gap-16px">
        <!-- 基础信息面板 -->
        <NDescriptions :column="2" bordered size="small">
          <NDescriptionsItem label="单据编号">
            {{ record.id }}
          </NDescriptionsItem>
          <NDescriptionsItem label="紧急程度">
            <NTag :type="priorityTagMap[record.priority].type">
              {{ priorityTagMap[record.priority].label }}
            </NTag>
          </NDescriptionsItem>
          <NDescriptionsItem label="申请人">
            {{ record.applicant }}（{{ record.dept }}）
          </NDescriptionsItem>
          <NDescriptionsItem label="申请时间">
            {{ record.applyTime }}
          </NDescriptionsItem>
          <NDescriptionsItem label="业务类型" :span="2">
            {{ record.bizType }}
          </NDescriptionsItem>
        </NDescriptions>

        <!-- 申请说明与变更原因 -->
        <div>
          <div class="mb-6px text-13px text-gray-700 font-semibold dark:text-gray-300">
            申请说明 / 变更原因：
          </div>
          <NAlert type="info" :show-icon="false">
            {{ record.reason }}
          </NAlert>
        </div>

        <!-- 提交内容详细摘要 -->
        <div v-if="record.content">
          <div class="mb-6px text-13px text-gray-700 font-semibold dark:text-gray-300">
            提交内容摘要：
          </div>
          <div class="border border-gray-100 rounded-6px bg-gray-50/60 p-12px text-13px text-gray-600 leading-relaxed dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-gray-300">
            {{ record.content }}
          </div>
        </div>

        <!-- 历史审批结果（已通过 / 已驳回） -->
        <div v-if="record.status !== 'pending'" class="mt-8px">
          <div class="mb-6px text-13px text-gray-700 font-semibold dark:text-gray-300">
            审批结果记录：
          </div>
          <NAlert
            :type="record.status === 'approved' ? 'success' : 'error'"
            :title="`审批状态：${statusTagMap[record.status].label}`"
          >
            <div>处理时间：{{ record.handleTime }}</div>
            <div>批注意见：{{ record.comment || '无' }}</div>
          </NAlert>
        </div>

        <!-- 审批意见填写区 (仅待审批状态) -->
        <div v-if="record.status === 'pending'" class="mt-8px flex flex-col gap-10px">
          <div class="text-13px text-gray-700 font-semibold dark:text-gray-300">
            审批意见：
          </div>
          <NInput
            v-model:value="approvalComment"
            type="textarea"
            :rows="3"
            placeholder="请输入审批意见（选填；驳回时必填）"
          />
        </div>
      </div>

      <template #footer>
        <div class="w-full flex items-center justify-end gap-12px">
          <NButton @click="visible = false">
            关闭
          </NButton>
          <template v-if="record.status === 'pending'">
            <NButton type="error" ghost @click="handleReject">
              驳回
            </NButton>
            <NButton type="primary" @click="handleApprove">
              同意并通过
            </NButton>
          </template>
        </div>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>
