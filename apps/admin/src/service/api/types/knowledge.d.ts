declare namespace Api {
  /**
   * namespace Knowledge
   *
   * backend api module: "knowledge" - ATE 测试知识库
   */
  namespace Knowledge {
    type ConfidenceLevel = '高' | '中' | '低'
    type TrustStatus = '有效' | '被取代' | '已过时' | '未登记'

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
      /** 名称 / 标题 */
      title: string
      /** 简介 / 描述 (表格中展示在标题下方) */
      summary: string
      /** 分类 (如: API 用法、文件格式、生成逻辑、调试经验等) */
      category?: string
      /** 置信度: 高 | 中 | 低 */
      confidence?: ConfidenceLevel
      /** 可信状态: 有效 | 被取代 | 已过时 | 未登记 */
      trustStatus?: TrustStatus
      /** 最后核对日期 YYYY-MM-DD */
      lastVerifiedAt?: string

      /** 关联分类节点主键 ID */
      categoryId?: string

      visible?: boolean
      isRecommended?: boolean

      /** 发布人 / 工程师 */
      publisherName: string
      /** 来源机构 / 团队 */
      contentSource: string
      /** 浏览量 */
      viewCount: number
      /** 发布时间 */
      publishedAt: string
      /** 正文 HTML */
      contentHtml: string
      /** 封面图 */
      coverUrl?: string
      /** 附件 */
      attachmentName?: string
      attachmentSize?: string
    }
  }
}
