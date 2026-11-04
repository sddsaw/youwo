import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { SetupStoreId } from '@/enum'

/** 初始 Mock 审批数据 */
const initialMockRecords: Api.Approval.RecordItem[] = [
  {
    id: 'AP-20261104-001',
    title: '硬件可用 API 范围（红标清单）规范更新',
    bizType: '知识库更新',
    bizId: 1,
    applicant: '周工',
    dept: '测试工程架构组',
    applyTime: '2026-11-04 09:30',
    priority: 'urgent',
    status: 'pending',
    reason: '根据最新机台规范，补充了 2 项限制调用说明，需架构组审核。',
    content: '本次更新涉及红标清单中的 setChannelVoltage 与 pulseSync 规范，补充了高压测试下的保护机制条款。',
  },
  {
    id: 'AP-20261104-002',
    title: '新发布：ChipTest ATE 极限耐压测试调试指南',
    bizType: '知识库发布',
    applicant: '李工程师',
    dept: '芯片验证二组',
    applyTime: '2026-11-04 10:15',
    priority: 'critical',
    status: 'pending',
    reason: '新增测试经验指南，提请纳入知识库正式分类。',
    content: '总结了近期在 3nm 晶圆耐压测试中出现的 3 处击穿隐患及调优参数配置，附带测试报告与时序曲线。',
  },
  {
    id: 'AP-20261104-003',
    title: 'STDF 格式解析规则修正文档申请',
    bizType: '知识库更新',
    bizId: 2,
    applicant: '王工',
    dept: '数据分析团队',
    applyTime: '2026-11-04 11:00',
    priority: 'normal',
    status: 'pending',
    reason: '修正了 STDF V4 解析脚本中的字节对齐偏差说明。',
    content: '修复了第 4 章节关于 Record Header 长度计算的描述偏差，避免新进工程师理解错误。',
  },
  {
    id: 'AP-20261103-004',
    title: 'ATE 机台系统环境变量配置手册',
    bizType: '知识库发布',
    applicant: '赵工程师',
    dept: '系统运维组',
    applyTime: '2026-11-03 14:20',
    priority: 'normal',
    status: 'approved',
    reason: '环境搭建常用手册归档。',
    content: '包含了 Linux 环境下 tester-agent 守护进程的环境变量与端口规范。',
    handleTime: '2026-11-03 16:00',
    comment: '符合规范，同意归档发布。',
  },
]

export const useApprovalStore = defineStore(SetupStoreId.Approval, () => {
  /** 全部审批记录列表 */
  const records = ref<Api.Approval.RecordItem[]>([...initialMockRecords])

  /** 待我审批列表 */
  const pendingList = computed(() => records.value.filter(item => item.status === 'pending'))

  /** 已处理列表 */
  const handledList = computed(() => records.value.filter(item => item.status !== 'pending'))

  /** 待审批总数（用于 Header 铃铛徽标） */
  const pendingCount = computed(() => pendingList.value.length)

  /** 根据 ID 查询单条记录 */
  function getRecord(id: string) {
    return records.value.find(item => item.id === id)
  }

  /**
   * 审批通过
   * @param id 审批单号
   * @param comment 审批批注
   */
  function approve(id: string, comment = '审核通过') {
    const target = getRecord(id)
    if (!target)
      return
    target.status = 'approved'
    target.handleTime = new Date().toISOString().replace('T', ' ').slice(0, 16)
    target.comment = comment
  }

  /**
   * 审批驳回
   * @param id 审批单号
   * @param comment 驳回原因
   */
  function reject(id: string, comment = '审核驳回') {
    const target = getRecord(id)
    if (!target)
      return
    target.status = 'rejected'
    target.handleTime = new Date().toISOString().replace('T', ' ').slice(0, 16)
    target.comment = comment
  }

  return {
    records,
    pendingList,
    handledList,
    pendingCount,
    getRecord,
    approve,
    reject,
  }
})
