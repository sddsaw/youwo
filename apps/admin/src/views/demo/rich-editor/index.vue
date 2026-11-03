<script setup lang="ts">
import { RichEditor, SchemaForm, type SchemaFormOptions } from '@sa/components'
import { useResetReactive } from '@sa/hooks'
import { NAlert, NButton, NCard, NGi, NGrid, NSelect, NSpace, NSwitch } from 'naive-ui'
import { ref } from 'vue'

// Standalone editor value
const editorContent = ref('<h2>欢迎体验 Soybean Admin CKEditor 5 GPL 富文本组件</h2><p>这是一个精心封装的富文本编辑器，支持：</p><ul><li>文字排版（加粗、斜体、下划线、删除线、代码块）</li><li>字体大小、字体系列、文字与背景颜色</li><li>对齐方式（左对齐、居中、右对齐、两端对齐）</li><li>列表、链接、表格、图片、媒体嵌入等</li></ul><p>支持默认的 <strong>Base64 上传</strong>。同时完美适配了系统的<strong>暗黑模式</strong>！</p>')

// Settings
const isDisabled = ref(false)
const editorMode = ref<'classic' | 'inline'>('inline')
const shouldNotGroupWhenFull = ref(true)

// ==========================================
// SchemaForm Integration Example
// ==========================================
const [formData, resetForm] = useResetReactive({
  title: '测试文档标题',
  content: '<p>通过 SchemaForm 初始化配置的富文本内容...</p>',
})

const formOptions = ref<SchemaFormOptions[]>([
  {
    value: 'title',
    label: '文档标题',
    type: 'input',
    rules: { required: true, message: '请输入文档标题', trigger: 'blur' },
    span: 24,
    attrs: {
      placeholder: '请输入文档标题',
    },
  },
  {
    value: 'content',
    label: '文档正文 (富文本)',
    type: 'rich-editor',
    span: 24,
    attrs: {
      placeholder: '请在此输入正文内容...',
      minHeight: '200px',
      maxHeight: '400px',
    },
  },
])

function handleSubmit() {
  window.$message?.success('表单数据提交成功，请在右侧观察数据！')
}
</script>

<template>
  <NSpace vertical :size="20" class="p-6">
    <NAlert title="CKEditor 5 (GPL 免费版) 封装演示" type="info" bordered>
      本页面展示了基于 CKEditor 5 封装的 RichEditor 富文本编辑器组件。组件原生适配系统暗黑模式，并完美支持独立的
      v-model 双向绑定、只读状态切换、以及在 Naive UI SchemaForm 配置化表单中的无缝集成。
    </NAlert>

    <NGrid :x-gap="16" :y-gap="16" cols="24" item-responsive responsive="screen">
      <!-- 左侧：富文本独立演示 -->
      <NGi span="24 l:15">
        <NCard title="🛠️ RichEditor 独立实例" class="shadow-sm">
          <template #header-extra>
            <NSpace align="center" :size="20">
              <NSpace align="center" :size="6">
                <span>编辑器展示</span>
                <NSelect
                  v-model:value="editorMode"
                  :options="[
                    { label: '内联 (inline)', value: 'inline' },
                    { label: '行联/经典 (classic)', value: 'classic' },
                  ]"
                  style="width: 150px"
                />
              </NSpace>
              <NSpace align="center" :size="6">
                <span>只读状态</span>
                <NSwitch v-model:value="isDisabled" />
              </NSpace>
              <NSpace align="center" :size="6">
                <span>工具栏全部展开</span>
                <NSwitch v-model:value="shouldNotGroupWhenFull" />
              </NSpace>
            </NSpace>
          </template>

          <RichEditor
            v-model:value="editorContent"
            :disabled="isDisabled"
            placeholder="请在此输入您的富文本内容..."
            :mode="editorMode"
            :should-not-group-when-full="shouldNotGroupWhenFull"
            min-height="34px"
            max-height="600px"
          />

          <template #action>
            <NSpace justify="end">
              <NButton type="warning" @click="editorContent = ''">
                清空内容
              </NButton>
              <NButton type="primary" @click="editorContent = '<h3>重置后的标题</h3><p>内容已被快速重填。</p>'">
                快捷填充
              </NButton>
            </NSpace>
          </template>
        </NCard>
      </NGi>

      <!-- 右侧：实时数据预览 -->
      <NGi span="24 l:9">
        <NCard title="📊 实时双向绑定数据源监视" class="h-full shadow-sm">
          <div class="h-full flex flex-col gap-4">
            <div>
              <div class="mb-2 text-14px text-gray-700 font-600 dark:text-gray-300">
                编辑区 HTML 源码：
              </div>
              <pre class="max-h-240px overflow-auto rounded bg-gray-50 p-4 text-11px text-gray-700 dark:bg-gray-800 dark:text-gray-300">{{ editorContent }}</pre>
            </div>
            <div>
              <div class="mb-2 text-14px text-gray-700 font-600 dark:text-gray-300">
                渲染效果预览：
              </div>
              <div class="preview-content ck-content max-h-240px overflow-auto border border-gray-200 rounded border-dashed bg-white p-4 dark:border-gray-700 dark:bg-gray-900" v-html="editorContent" />
            </div>
          </div>
        </NCard>
      </NGi>
    </NGrid>

    <!-- SchemaForm 集成演示 -->
    <NCard title="⚙️ SchemaForm 配置化表单集成" class="mt-4 shadow-sm">
      <NGrid :x-gap="16" :y-gap="16" cols="24" item-responsive responsive="screen">
        <NGi span="24 l:15">
          <SchemaForm
            v-model:model="formData"
            :options="formOptions"
            :cols="24"
            :x-gap="16"
            :y-gap="12"
            label-placement="top"
          />
          <div class="mt-4 flex justify-end">
            <NButton type="warning" class="mr-2" @click="resetForm">
              重置表单
            </NButton>
            <NButton type="primary" @click="handleSubmit">
              提交数据
            </NButton>
          </div>
        </NGi>
        <NGi span="24 l:9">
          <div class="mb-2 text-14px text-gray-700 font-600 dark:text-gray-300">
            formData 状态监控：
          </div>
          <pre class="max-h-340px overflow-auto rounded bg-gray-50 p-4 text-11px text-gray-700 dark:bg-gray-800 dark:text-gray-300">{{ JSON.stringify(formData, null, 2) }}</pre>
        </NGi>
      </NGrid>
    </NCard>
  </NSpace>
</template>

<style scoped>
.h-full {
  height: 100%;
}
.preview-content {
  min-height: 100px;
}
</style>
