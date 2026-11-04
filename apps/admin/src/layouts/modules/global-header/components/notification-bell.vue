<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useApprovalStore } from '@/store/modules/approval'

defineOptions({
  name: 'NotificationBell',
})

const router = useRouter()
const approvalStore = useApprovalStore()

interface NotificationItem {
  id: number
  title: string
  description: string
  time: string
  icon: string
  color: string
  read: boolean
}

// Mock Data
const notifications = ref<NotificationItem[]>([
  {
    id: 1,
    title: '系统重大升级通知',
    description: '为了提供更优质的服务，系统将于今晚 00:00 进行停机升级维护，预计持续 2 小时。',
    time: '10分钟前',
    icon: 'fluent:info-24-filled',
    color: '#3b82f6', // blue
    read: false,
  },
  {
    id: 2,
    title: '安全提醒：检测到异地登录',
    description: '您的账号于 2026-06-23 09:30 在上海市登录，若非本人操作，请尽快修改密码。',
    time: '1小时前',
    icon: 'fluent:warning-24-filled',
    color: '#ef4444', // red
    read: false,
  },
  {
    id: 3,
    title: '新功能上线：主题配色自由定制',
    description: '支持在系统右上角的主题配置中自由选择定制配色，快来体验吧！',
    time: '3小时前',
    icon: 'fluent:sparkle-24-filled',
    color: '#eab308', // yellow
    read: true,
  },
])

const messages = ref<NotificationItem[]>([
  {
    id: 4,
    title: '项目负责人 - 张经理',
    description: 'zhouenbo，今天下午两点的周会材料准备好了吗？麻烦提前发我一份。',
    time: '30分钟前',
    icon: 'fluent:person-feedback-24-filled',
    color: '#8b5cf6', // purple
    read: false,
  },
  {
    id: 5,
    title: '前端开发 - 小王',
    description: '新版的消息中心 UI 已经设计完了，帮我 review 一下代码。',
    time: '2小时前',
    icon: 'fluent:person-chat-24-filled',
    color: '#10b981', // green
    read: false,
  },
  {
    id: 6,
    title: 'HR 团队',
    description: '恭喜您已顺利通过转正考核，感谢您对公司做出的贡献！',
    time: '1天前',
    icon: 'fluent:ribbon-24-filled',
    color: '#ec4899', // pink
    read: true,
  },
])

const priorityColorMap: Record<Api.Approval.Priority, string> = {
  normal: '#3b82f6', // blue
  urgent: '#f97316', // orange
  critical: '#ef4444', // red
}

/** 待办审批流数据接入 ApprovalStore */
const todos = computed(() => {
  return approvalStore.pendingList.map(item => ({
    id: item.id,
    title: item.title,
    description: `${item.applicant} (${item.dept}) 申请 · ${item.reason}`,
    time: item.applyTime.slice(5),
    icon: 'fluent:clipboard-task-24-filled',
    color: priorityColorMap[item.priority] || '#f97316',
    read: false,
    raw: item,
  }))
})

// Tab Management
type TabKey = 'notification' | 'message' | 'todo'
const activeTab = ref<TabKey>('notification')

// Counts
const unreadNotificationCount = computed(() => notifications.value.filter(item => !item.read).length)
const unreadMessageCount = computed(() => messages.value.filter(item => !item.read).length)
const unreadTodoCount = computed(() => approvalStore.pendingCount)
const totalUnreadCount = computed(() => unreadNotificationCount.value + unreadMessageCount.value + unreadTodoCount.value)

// Actions
function handleItemClick(item: NotificationItem) {
  item.read = true
  window.$message?.success(`已读: ${item.title}`)
}

function handleTodoItemClick(item: (typeof todos.value)[0]) {
  showPopover.value = false
  router.push({
    name: 'workbench_approval',
    query: { id: item.id },
  })
}

function handleMarkAllRead() {
  if (activeTab.value === 'notification') {
    notifications.value.forEach(item => (item.read = true))
    window.$message?.success('已将当前分类全部标记为已读')
  }
  else if (activeTab.value === 'message') {
    messages.value.forEach(item => (item.read = true))
    window.$message?.success('已将当前分类全部标记为已读')
  }
  else if (activeTab.value === 'todo') {
    window.$message?.info('待办审批单需前往审批中心逐项审核')
  }
}

function handleClearTab() {
  if (activeTab.value === 'notification')
    notifications.value = []
  if (activeTab.value === 'message')
    messages.value = []
  if (activeTab.value === 'todo')
    window.$message?.info('待办审批单请前往审批中心进行审批处理')
}

function handleViewAll() {
  showPopover.value = false
  router.push({ name: 'workbench_approval' })
}

// 控制通知中心悬浮气泡的显示状态，用于在展示通知中心时禁用 Tooltip
const showPopover = ref(false)
</script>

<template>
  <NPopover
    v-model:show="showPopover"
    trigger="click"
    placement="bottom-end"
    :width="360"
    :z-index="99"
    raw
    :show-arrow="false"
    :theme-overrides="{ boxShadow: 'none' }"
  >
    <template #trigger>
      <div>
        <ButtonIcon :tooltip-content="showPopover ? '' : '消息通知'">
          <NBadge :value="totalUnreadCount" :max="99" :show-zero="false">
            <SvgIcon icon="fluent:alert-24-regular" class="hover-bell-swing text-icon-large" />
          </NBadge>
        </ButtonIcon>
      </div>
    </template>

    <DarkModeContainer class="w-360px flex flex-col overflow-hidden border border-gray-100 rounded-8px shadow-xl dark:border-zinc-800">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-gray-100 px-16px py-12px dark:border-gray-800">
        <span class="text-16px text-gray-800 font-semibold dark:text-gray-200">通知中心</span>
        <NButton
          v-if="totalUnreadCount > 0"
          text
          type="primary"
          size="small"
          class="text-12px"
          @click="handleMarkAllRead"
        >
          全部已读
        </NButton>
      </div>

      <!-- Tabs -->
      <NTabs
        v-model:value="activeTab"
        type="bar"
        justify-content="space-around"
        animated
        class="border-b border-gray-100 dark:border-gray-800"
        pane-style="padding: 0;"
      >
        <NTabPane name="notification" :tab="`通知 (${unreadNotificationCount})`">
          <NScrollbar style="max-height: 320px;">
            <div v-if="notifications.length > 0" class="divide-y divide-gray-50 dark:divide-gray-800/30">
              <div
                v-for="item in notifications"
                :key="item.id"
                class="flex cursor-pointer gap-12px px-16px py-12px transition-all duration-200 active:scale-99 hover:bg-gray-50 dark:hover:bg-gray-800/30"
                :class="{ 'opacity-60': item.read }"
                @click="handleItemClick(item)"
              >
                <div
                  class="h-36px w-36px flex-center flex-shrink-0 rounded-full text-white shadow-sm"
                  :style="{ backgroundColor: item.color }"
                >
                  <SvgIcon :icon="item.icon" class="text-18px" />
                </div>
                <div class="min-w-0 flex-1">
                  <div class="flex items-center justify-between gap-8px">
                    <span class="truncate text-14px text-gray-800 font-medium dark:text-gray-200" :class="{ 'font-semibold': !item.read }">
                      {{ item.title }}
                    </span>
                    <span class="flex-shrink-0 text-11px text-gray-400 dark:text-gray-500">{{ item.time }}</span>
                  </div>
                  <p class="line-clamp-2 mt-4px text-12px text-gray-500 leading-relaxed dark:text-gray-400">
                    {{ item.description }}
                  </p>
                </div>
                <div v-if="!item.read" class="mt-6px h-8px w-8px flex-shrink-0 rounded-full bg-primary" />
              </div>
            </div>
            <div v-else class="flex flex-col items-center justify-center py-40px">
              <NEmpty description="暂无通知" />
            </div>
          </NScrollbar>
        </NTabPane>

        <NTabPane name="message" :tab="`消息 (${unreadMessageCount})`">
          <NScrollbar style="max-height: 320px;">
            <div v-if="messages.length > 0" class="divide-y divide-gray-50 dark:divide-gray-800/30">
              <div
                v-for="item in messages"
                :key="item.id"
                class="flex cursor-pointer gap-12px px-16px py-12px transition-all duration-200 active:scale-99 hover:bg-gray-50 dark:hover:bg-gray-800/30"
                :class="{ 'opacity-60': item.read }"
                @click="handleItemClick(item)"
              >
                <div
                  class="h-36px w-36px flex-center flex-shrink-0 rounded-full text-white shadow-sm"
                  :style="{ backgroundColor: item.color }"
                >
                  <SvgIcon :icon="item.icon" class="text-18px" />
                </div>
                <div class="min-w-0 flex-1">
                  <div class="flex items-center justify-between gap-8px">
                    <span class="truncate text-14px text-gray-800 font-medium dark:text-gray-200" :class="{ 'font-semibold': !item.read }">
                      {{ item.title }}
                    </span>
                    <span class="flex-shrink-0 text-11px text-gray-400 dark:text-gray-500">{{ item.time }}</span>
                  </div>
                  <p class="line-clamp-2 mt-4px text-12px text-gray-500 leading-relaxed dark:text-gray-400">
                    {{ item.description }}
                  </p>
                </div>
                <div v-if="!item.read" class="mt-6px h-8px w-8px flex-shrink-0 rounded-full bg-primary" />
              </div>
            </div>
            <div v-else class="flex flex-col items-center justify-center py-40px">
              <NEmpty description="暂无消息" />
            </div>
          </NScrollbar>
        </NTabPane>

        <NTabPane name="todo" :tab="`待办 (${unreadTodoCount})`">
          <NScrollbar style="max-height: 320px;">
            <div v-if="todos.length > 0" class="divide-y divide-gray-50 dark:divide-gray-800/30">
              <div
                v-for="item in todos"
                :key="item.id"
                class="flex cursor-pointer gap-12px px-16px py-12px transition-all duration-200 active:scale-99 hover:bg-gray-50 dark:hover:bg-gray-800/30"
                @click="handleTodoItemClick(item)"
              >
                <div
                  class="h-36px w-36px flex-center flex-shrink-0 rounded-full text-white shadow-sm"
                  :style="{ backgroundColor: item.color }"
                >
                  <SvgIcon :icon="item.icon" class="text-18px" />
                </div>
                <div class="min-w-0 flex-1">
                  <div class="flex items-center justify-between gap-8px">
                    <span class="truncate text-14px text-gray-800 font-semibold dark:text-gray-200">
                      {{ item.title }}
                    </span>
                    <span class="flex-shrink-0 text-11px text-gray-400 dark:text-gray-500">{{ item.time }}</span>
                  </div>
                  <p class="line-clamp-2 mt-4px text-12px text-gray-500 leading-relaxed dark:text-gray-400">
                    {{ item.description }}
                  </p>
                </div>
                <div class="mt-6px h-8px w-8px flex-shrink-0 rounded-full bg-primary" />
              </div>
            </div>
            <div v-else class="flex flex-col items-center justify-center py-40px">
              <NEmpty description="暂无待办审批" />
            </div>
          </NScrollbar>
        </NTabPane>
      </NTabs>

      <!-- Footer -->
      <div class="flex border-t border-gray-100 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-900/30">
        <button
          class="flex-1 cursor-pointer border-none bg-transparent py-10px text-center text-13px text-gray-500 font-medium outline-none transition-colors duration-200 hover:bg-gray-100/50 hover:text-primary dark:hover:bg-gray-800/50"
          @click="handleClearTab"
        >
          清空当前
        </button>
        <div class="w-1px bg-gray-100 dark:bg-gray-800" />
        <button
          class="flex-1 cursor-pointer border-none bg-transparent py-10px text-center text-13px text-gray-500 font-medium outline-none transition-colors duration-200 hover:bg-gray-100/50 hover:text-primary dark:hover:bg-gray-800/50"
          @click="handleViewAll"
        >
          查看全部
        </button>
      </div>
    </DarkModeContainer>
  </NPopover>
</template>

<style scoped>
@keyframes bell-swing {
  0% { transform: rotate(0); }
  15% { transform: rotate(15deg); }
  30% { transform: rotate(-12deg); }
  45% { transform: rotate(10deg); }
  60% { transform: rotate(-8deg); }
  75% { transform: rotate(4deg); }
  90% { transform: rotate(-2deg); }
  100% { transform: rotate(0); }
}

.hover-bell-swing {
  transition: transform 0.2s ease-in-out;
  transform-origin: top center;
}

.hover-bell-swing:hover {
  animation: bell-swing 1s ease-in-out;
}
</style>
