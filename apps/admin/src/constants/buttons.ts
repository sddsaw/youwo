/**
 * 按钮权限字典
 */
export const BUTTONS_PERMISSIONS = {
  /** 分类管理权限 */
  COPYRIGHT_LAWS: {
    /** 新增分类筛选树 */
    ADD: 'copyright_laws:guideCategory:add',
    /** 编辑重命名 */
    EDIT: 'copyright_laws:guideCategory:edit',
    /** 删除分类 */
    DELETE: 'copyright_laws:guideCategory:delete',
    /** 新建版权内容 */
    CREATE: 'copyright_laws:create',
    /** 编辑本人创建的版权内容 */
    UPDATE_OWN: 'copyright_laws:update:own',
    /** 编辑全部版权内容 */
    UPDATE_ALL: 'copyright_laws:update:all',
    /** 删除版权内容 */
    DELETE_CONTENT: 'copyright_laws:delete',
  },
  /** 典型案例 */
  COPYRIGHT_CASES: {
    /** 新增分类筛选树 */
    ADD: 'copyright_cases:guideCategory:add',
    /** 编辑分类筛选树 */
    EDIT: 'copyright_cases:guideCategory:edit',
    /** 删除分类 */
    DELETE: 'copyright_cases:guideCategory:delete',
    /** 新建典型案例 */
    CREATE: 'copyright_cases:create',
    /** 编辑本人创建的典型案例 */
    UPDATE_OWN: 'copyright_cases:update:own',
    /** 编辑全部典型案例 */
    UPDATE_ALL: 'copyright_cases:update:all',
    /** 删除典型案例 */
    DELETE_CONTENT: 'copyright_cases:delete',
  },
  /** 风险预警 */
  COPYRIGHT_RISK: {
    /** 新增分类筛选树 */
    ADD: 'copyright_risk:guideCategory:add',
    /** 编辑分类筛选树 */
    EDIT: 'copyright_risk:guideCategory:edit',
    /** 删除分类 */
    DELETE: 'copyright_risk:guideCategory:delete',
    /** 新建版权内容 */
    CREATE: 'copyright_risk:create',
    /** 编辑本人创建的版权内容 */
    UPDATE_OWN: 'copyright_risk:update:own',
    /** 编辑全部版权内容 */
    UPDATE_ALL: 'copyright_risk:update:all',
    /** 删除版权内容 */
    DELETE_CONTENT: 'copyright_risk:delete',
  },
  /** 实务指引 */
  COPYRIGHT_GUIDE: {
    /** 新增分类筛选树 */
    ADD: 'copyright_guide:guideCategory:add',
    /** 编辑分类筛选树 */
    EDIT: 'copyright_guide:guideCategory:edit',
    /** 删除分类 */
    DELETE: 'copyright_guide:guideCategory:delete',
    /** 新建版权内容 */
    CREATE: 'copyright_guide:create',
    /** 编辑本人创建的版权内容 */
    UPDATE_OWN: 'copyright_guide:update:own',
    /** 编辑全部版权内容 */
    UPDATE_ALL: 'copyright_guide:update:all',
    /** 删除版权内容 */
    DELETE_CONTENT: 'copyright_guide:delete',
  },
  /** 行业动态 */
  COPYRIGHT_DYNAMICS: {
    /** 新增分类筛选树 */
    ADD: 'copyright_dynamics:guideCategory:add',
    /** 编辑分类筛选树 */
    EDIT: 'copyright_dynamics:guideCategory:edit',
    /** 删除分类 */
    DELETE: 'copyright_dynamics:guideCategory:delete',
    /** 新建版权内容 */
    CREATE: 'copyright_dynamics:create',
    /** 编辑本人创建的版权内容 */
    UPDATE_OWN: 'copyright_dynamics:update:own',
    /** 编辑全部版权内容 */
    UPDATE_ALL: 'copyright_dynamics:update:all',
    /** 删除版权内容 */
    DELETE_CONTENT: 'copyright_dynamics:delete',
  },
  /** 出海指南 */
  OVERSEAS_GUIDE: {
    /** 新增分类筛选树 */
    ADD: 'overseas:guideCategory:add',
    /** 编辑分类筛选树 */
    EDIT: 'overseas:guideCategory:edit',
    /** 删除分类 */
    DELETE: 'overseas:guideCategory:delete',
    /** 新建出海指南 */
    CREATE: 'overseas:guide:add',
    /** 编辑本人创建的指南 */
    UPDATE_OWN: 'overseas:guide:editOwn',
    /** 编辑全部指南 */
    UPDATE_ALL: 'overseas:guide:editAll',
    /** 删除指南 */
    DELETE_CONTENT: 'overseas:guide:delete',
  },
  /** 新闻资讯 */
  NEWS: {
    /** 新建资讯 */
    CREATE: 'news:create',
    /** 编辑资讯 */
    UPDATE: 'news:update',
    /** 删除资讯 */
    DELETE: 'news:delete',
    /** 上下架资讯 */
    ON_OFF: 'news:onOrOfflin',
  },
  /** 咨询机构 */
  CONSULTING: {
    /** 新增咨询机构 */
    AGENCY_ADD: 'consulting:agency:add',
    /** 删除咨询机构 */
    AGENCY_DELETE: 'consulting:agency:delete',
    /** 编辑咨询机构 */
    AGENCY_EDIT: 'consulting:agency:edit',
    /** 新增咨询机构用户 */
    USER_ADD: 'consulting:agencyUser:add',
    /** 编辑咨询机构用户 */
    USER_EDIT: 'consulting:agencyUser:edit',
    /** 删除咨询机构用户 */
    USER_DELETE: 'consulting:agencyUser:delete',
    /** 禁用启用员工 */
    USER_DISABLE: 'consulting:agencyUser:disable',
  },
  /** 平台公告 */
  PLATFORM_NOTICE: {
    /** 查看平台公告 */
    VIEW: 'platform:notice:view',
    /** 新增平台公告 */
    ADD: 'platform:notice:add',
    /** 编辑平台公告 */
    EDIT: 'platform:notice:edit',
    /** 上下架平台公告 */
    ON_OFF: 'platform:notice:onOrOffline',
    /** 删除平台公告 */
    DELETE: 'platform:notice:delete',
  },
} as const
