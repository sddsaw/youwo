<script setup lang="ts">
import { initialArticleList } from '@/views/workbench/mock'

defineOptions({
  name: 'WorkbenchKnowledgeDetailPage',
})

const router = useRouter()
const route = useRoute()

const currentId = computed(() => {
  return (route.query.id as string) || (route.params.id as string) || ''
})

const currentItem = computed(() => {
  if (!currentId.value)
    return null
  return initialArticleList.find(item => String(item.id) === String(currentId.value)) || null
})

function handleBack() {
  if (window.history.length > 1) {
    router.back()
  }
  else {
    router.push({ name: 'workbench_knowledge' })
  }
}

function handleDownloadAttachment() {
  if (currentItem.value?.attachmentName) {
    window.$message?.success(`已触发附件下载 (Download started): ${currentItem.value.attachmentName}`)
  }
}
</script>

<template>
  <div class="h-full flex flex-col gap-16px overflow-auto p-16px">
    <!-- Top Nav Bar -->
    <div class="flex items-center justify-between border-b border-gray-200/80 pb-12px dark:border-zinc-800">
      <div class="flex items-center gap-12px">
        <NButton
          secondary
          size="small"
          class="flex items-center gap-4px rounded-8px px-12px"
          @click="handleBack"
        >
          <template #icon>
            <SvgIcon icon="material-symbols:arrow-back-rounded" />
          </template>
          {{ $t('common.back') }} {{ $t('route.workbench_knowledge') }}
        </NButton>
        <span class="text-13px text-gray-400 dark:text-zinc-500">/</span>
        <span class="text-14px text-gray-500 font-medium dark:text-zinc-400">{{ $t('route.workbench') }}</span>
        <span class="text-13px text-gray-400 dark:text-zinc-500">/</span>
        <span class="text-14px text-gray-500 font-medium dark:text-zinc-400">{{ $t('route.workbench_knowledge-detail') }}</span>
        <span class="text-13px text-gray-400 dark:text-zinc-500">/</span>
        <span class="max-w-360px truncate text-14px text-gray-900 font-semibold dark:text-zinc-100">
          {{ currentItem?.title || $t('route.workbench_knowledge-detail') }}
        </span>
      </div>
    </div>

    <!-- Detail Card -->
    <NCard
      v-if="currentItem"
      :bordered="false"
      class="flex-1 card-wrapper shadow-sm"
      content-style="padding: 24px 32px;"
    >
      <div class="mx-auto max-w-1000px flex flex-col gap-24px">
        <!-- Badges & Title Header -->
        <div class="flex flex-col gap-12px border-b border-gray-100 pb-20px dark:border-zinc-800">
          <div class="flex flex-wrap items-center gap-10px">
            <NTag
              round
              :bordered="false"
              size="medium"
              class="bg-gray-100 px-12px text-gray-700 font-medium dark:bg-zinc-800 dark:text-zinc-300"
            >
              {{ currentItem.category }}
            </NTag>

            <NTag
              round
              size="medium"
              :type="currentItem.confidence === '高' ? 'success' : currentItem.confidence === '中' ? 'warning' : 'error'"
              bordered
              class="px-10px font-medium"
            >
              置信度 (Confidence)：{{ currentItem.confidence }}
            </NTag>

            <NTag
              round
              size="medium"
              :type="currentItem.trustStatus === '有效' ? 'success' : currentItem.trustStatus === '被取代' ? 'warning' : 'error'"
              bordered
              class="px-10px font-medium"
            >
              状态 (Status)：{{ currentItem.trustStatus }}
            </NTag>

            <span class="ml-auto text-13px text-gray-500 font-medium tabular-nums dark:text-zinc-400">
              最后核对日期 (Last Verified)：{{ currentItem.lastVerifiedAt || '-' }}
            </span>
          </div>

          <h1 class="text-26px text-gray-900 font-bold tracking-tight dark:text-zinc-100">
            {{ currentItem.title }}
          </h1>

          <div class="flex flex-wrap items-center gap-20px text-13px text-gray-400 dark:text-zinc-500">
            <span class="flex items-center gap-4px">
              <SvgIcon icon="material-symbols:person-outline" class="text-16px" />
              责任人 / 工程师 (Owner)：<strong class="text-gray-700 font-medium dark:text-zinc-300">{{ currentItem.publisherName || '-' }}</strong>
            </span>
            <span class="flex items-center gap-4px">
              <SvgIcon icon="material-symbols:domain-verification-outline" class="text-16px" />
              来源机构 (Source)：<strong class="text-gray-700 font-medium dark:text-zinc-300">{{ currentItem.contentSource || '-' }}</strong>
            </span>
            <span class="flex items-center gap-4px">
              <SvgIcon icon="material-symbols:schedule-outline" class="text-16px" />
              发布时间 (Published)：<span class="tabular-nums">{{ currentItem.publishedAt || '-' }}</span>
            </span>
          </div>
        </div>

        <!-- 知识概要说明 -->
        <div v-if="currentItem.summary" class="border-l-4 border-primary rounded-r-8px bg-blue-50/40 p-16px dark:bg-blue-950/20">
          <div class="mb-4px flex items-center gap-6px text-12px text-primary font-bold tracking-wider uppercase">
            <SvgIcon icon="material-symbols:info-outline-rounded" class="text-16px" />
            核心概要说明 (Summary)
          </div>
          <p class="text-14px text-gray-700 leading-relaxed dark:text-zinc-300">
            {{ currentItem.summary }}
          </p>
        </div>

        <!-- 关联规范附件 -->
        <div v-if="currentItem.attachmentName" class="flex flex-col gap-10px">
          <h3 class="text-15px text-gray-800 font-bold dark:text-zinc-200">
            关联规范附件 (Attachments)
          </h3>
          <div class="flex items-center justify-between border border-blue-100 rounded-10px bg-blue-50/20 p-16px transition-colors dark:border-blue-950/40 hover:border-blue-300 dark:bg-blue-950/15">
            <div class="flex items-center gap-14px">
              <div class="h-44px w-44px flex items-center justify-center rounded-10px bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                <SvgIcon icon="material-symbols:picture-as-pdf-outline-rounded" class="text-24px" />
              </div>
              <div class="flex flex-col gap-3px">
                <span class="text-15px text-gray-800 font-bold dark:text-zinc-200">
                  {{ currentItem.attachmentName }}
                </span>
                <span v-if="currentItem.attachmentSize" class="text-12px text-gray-400 dark:text-zinc-500">
                  文件大小 (Size)：{{ currentItem.attachmentSize }}
                </span>
              </div>
            </div>
            <NButton
              secondary
              type="info"
              class="rounded-8px px-20px font-medium"
              @click="handleDownloadAttachment"
            >
              <template #icon>
                <SvgIcon icon="material-symbols:download-rounded" />
              </template>
              下载附件 (Download)
            </NButton>
          </div>
        </div>

        <!-- 详细正文内容 -->
        <div class="flex flex-col gap-12px">
          <h3 class="text-15px text-gray-800 font-bold dark:text-zinc-200">
            详细正文内容 (Content)
          </h3>
          <div
            class="detail-html-content rounded-10px bg-gray-50/50 p-20px text-15px text-gray-700 leading-relaxed dark:bg-zinc-900/40 dark:text-zinc-300"
            v-html="currentItem.contentHtml || '<p class=\'text-gray-400 italic\'>暂无详细正文内容 (No detailed content available)</p>'"
          />
        </div>
      </div>
    </NCard>

    <!-- 空状态 -->
    <NCard v-else :bordered="false" class="flex flex-1 items-center justify-center card-wrapper py-60px">
      <NEmpty description="未找到对应 ID 的知识点条目 (Knowledge item not found)">
        <template #extra>
          <NButton type="primary" class="rounded-8px" @click="handleBack">
            返回知识点列表 (Back to List)
          </NButton>
        </template>
      </NEmpty>
    </NCard>
  </div>
</template>

<style scoped>
.detail-html-content :deep(h3) {
  font-size: 16px;
  font-weight: 700;
  margin-top: 16px;
  margin-bottom: 8px;
  color: #1f2937;
}

.dark .detail-html-content :deep(h3) {
  color: #f3f4f6;
}

.detail-html-content :deep(p) {
  margin-bottom: 12px;
  line-height: 1.7;
}

.detail-html-content :deep(ul),
.detail-html-content :deep(ol) {
  padding-left: 20px;
  margin-bottom: 12px;
}

.detail-html-content :deep(li) {
  margin-bottom: 6px;
}

.detail-html-content :deep(code) {
  padding: 2px 6px;
  border-radius: 4px;
  background-color: rgba(229, 231, 235, 0.6);
  color: #ef4444;
  font-size: 13px;
  font-family: monospace;
}

.dark .detail-html-content :deep(code) {
  background-color: rgba(63, 63, 70, 0.6);
  color: #f87171;
}
</style>
