declare namespace Api {
  /**
   * namespace Approval
   *
   * 审批中心相关类型定义
   */
  namespace Approval {
    /** 审批状态: pending(待审批) | approved(已通过) | rejected(已驳回) */
    type Status = 'pending' | 'approved' | 'rejected'

    /** 紧急程度: normal(普通) | urgent(紧急) | critical(特急) */
    type Priority = 'normal' | 'urgent' | 'critical'

    /** 审批单据记录 */
    interface RecordItem {
      id: string
      /** 申请标题 */
      title: string
      /** 业务类型 (例如: 知识点发布、知识点更新、权限申请) */
      bizType: string
      /** 关联的业务主键 (如知识点 ID) */
      bizId?: number | string
      /** 申请人 */
      applicant: string
      /** 申请人所属部门 */
      dept: string
      /** 申请时间 (YYYY-MM-DD HH:mm) */
      applyTime: string
      /** 紧急程度 */
      priority: Priority
      /** 当前审批状态 */
      status: Status
      /** 申请说明 / 变更原因 */
      reason: string
      /** 详细内容或更新摘要 */
      content?: string
      /** 审批处理时间 */
      handleTime?: string
      /** 审批意见 */
      comment?: string
    }
  }
}
