module.exports = {
  types: [
    { value: 'feat', name: 'feat:     新增功能 ' },
    { value: 'fix', name: 'fix:      修复缺陷 ' },
    { value: 'docs', name: 'docs:     文档更新 ' },
    { value: 'style', name: 'style:    代码格式 ' },
    { value: 'refactor', name: 'refactor: 代码重构 ' },
    { value: 'perf', name: 'perf:     性能提升 ' },
    { value: 'test', name: 'test:     测试相关 ' },
    { value: 'build', name: 'build:    构建相关 ' },
    { value: 'ci', name: 'ci:       持续集成 ' },
    { value: 'chore', name: 'chore:    其他修改 ' },
    { value: 'revert', name: 'revert:   回退代码 ' },
  ],

  scopes: [
    { value: 'projects', name: 'projects:   项目/包管理' },
    { value: 'components', name: 'components: 组件相关' },
    { value: 'hooks', name: 'hooks:      Composition API' },
    { value: 'utils', name: 'utils:      工具函数' },
    { value: 'types', name: 'types:      类型声明' },
    { value: 'styles', name: 'styles:     样式相关' },
    { value: 'deps', name: 'deps:       项目依赖' },
    { value: 'other', name: 'other:      其他修改' },
  ],

  messages: {
    type: '选择你要提交的类型 ',
    scope: '选择一个解析范围(可选) ',
    customScope: '输入自定义的解析范围 ',
    subject: '简要描述此次变更(必填) ',
    body: '详细描述此次变更(可选) ',
    breaking: '列出任何非兼容性说明(可选) ',
    footer: '列出此次变更关联的 Issues(可选)，例如: #31, #34 ',
    confirmCommit: '确定提交此说明吗？(y/n) ',
  },

  allowCustomScopes: true,
  allowBreakingChanges: ['feat', 'fix'],
  subjectLimit: 100,
}
