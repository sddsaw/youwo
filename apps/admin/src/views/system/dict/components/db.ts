import { ref } from 'vue'

export interface DictType {
  id: string
  name: string
  code: string
  status: '1' | '2' // 1-正常, 2-停用
  remark: string
  createTime: string
}

export interface DictData {
  id: string
  label: string
  value: string
  sort: number
  status: '1' | '2' // 1-正常, 2-停用
  remark: string
}

export const dictTypes = ref<DictType[]>([
  { id: '1', name: '用户性别用户性别用户性别用户性别', code: 'sys_user_sex', status: '1', remark: '用户性别列表', createTime: '2026-01-18 10:58:21' },
  { id: '2', name: '菜单状态', code: 'sys_show_hide', status: '1', remark: '菜单状态列表', createTime: '2026-01-18 10:58:21' },
  { id: '3', name: '系统开关', code: 'sys_normal_disable', status: '1', remark: '系统开关列表', createTime: '2026-01-18 10:58:21' },
  { id: '4', name: '任务状态', code: 'sys_job_status', status: '1', remark: '任务状态列表', createTime: '2026-01-18 10:58:21' },
  { id: '5', name: '任务分组', code: 'sys_job_group', status: '1', remark: '任务分组列表', createTime: '2026-01-18 10:58:21' },
  { id: '6', name: '系统是否', code: 'sys_yes_no', status: '1', remark: '系统是否列表', createTime: '2026-01-18 10:58:21' },
  { id: '7', name: '通知类型', code: 'sys_notice_type', status: '1', remark: '通知类型列表', createTime: '2026-01-18 10:58:21' },
])

export const dictDataMap = ref<Record<string, DictData[]>>({
  sys_user_sex: [
    { id: '1', label: '男', value: '1', sort: 1, status: '1', remark: '性别男' },
    { id: '2', label: '女', value: '2', sort: 2, status: '1', remark: '性别女' },
    { id: '3', label: '未知', value: '3', sort: 3, status: '1', remark: '性别未知' },
  ],
  sys_show_hide: [
    { id: '4', label: '显示', value: '0', sort: 1, status: '1', remark: '显示菜单' },
    { id: '5', label: '隐藏', value: '1', sort: 2, status: '1', remark: '隐藏菜单' },
  ],
  sys_normal_disable: [
    { id: '6', label: '正常', value: '0', sort: 1, status: '1', remark: '正常状态' },
    { id: '7', label: '停用', value: '1', sort: 2, status: '1', remark: '停用状态' },
  ],
  sys_job_status: [
    { id: '8', label: '运行中', value: '0', sort: 1, status: '1', remark: '任务运行' },
    { id: '9', label: '已暂停', value: '1', sort: 2, status: '1', remark: '任务暂停' },
  ],
  sys_job_group: [
    { id: '10', label: '默认', value: 'DEFAULT', sort: 1, status: '1', remark: '默认定级分组' },
    { id: '11', label: '系统', value: 'SYSTEM', sort: 2, status: '1', remark: '系统默认分组' },
  ],
  sys_yes_no: [
    { id: '12', label: '是', value: 'Y', sort: 1, status: '1', remark: '是' },
    { id: '13', label: '否', value: 'N', sort: 2, status: '1', remark: '否' },
  ],
  sys_notice_type: [
    { id: '14', label: '通知', value: '1', sort: 1, status: '1', remark: '通知' },
    { id: '15', label: '公告', value: '2', sort: 2, status: '1', remark: '公告' },
  ],
})
