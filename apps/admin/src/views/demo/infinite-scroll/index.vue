<script setup lang="ts">
import { InfiniteScroll } from '@sa/components'
import { usePaginatedRequest } from '@sa/hooks'
import { NAlert, NButton, NCard, NSpace, NTag } from 'naive-ui'

// ==========================================
// 1. InfiniteScroll & usePaginatedRequest 数据获取与定义
// ==========================================
// 模拟分页用户列表获取 API
async function fetchUserListApi({ current, pageSize }: { current: number, pageSize: number }) {
  await new Promise(resolve => setTimeout(resolve, 800))
  const total = 60 // 总共 60 条模拟数据
  const list = Array.from({ length: pageSize }).map((_, index) => {
    const id = (current - 1) * pageSize + index + 1
    return {
      id,
      name: `用户-${id}`,
      email: `user${id}@soybean.com`,
      role: id % 3 === 0 ? '管理员' : '普通员工',
    }
  })
  return {
    error: null,
    data: {
      list,
      total,
      current,
      pageSize,
    },
    response: {} as any,
  }
}

const {
  data: userList,
  loading: firstLoading,
  loadingMore,
  pagination,
  loadMore,
  run: refreshList,
  reset: resetList,
} = usePaginatedRequest(fetchUserListApi, {
  defaultPageSize: 15,
  transform: res => ({
    list: res.list,
    total: res.total,
    current: res.current,
    pageSize: res.pageSize,
  }),
})
</script>

<template>
  <NSpace vertical :size="20" class="p-6">
    <NAlert title="InfiniteScroll 滚动加载组件与 usePaginatedRequest 演示" type="info" bordered>
      本页面展示了新增的 &lt;InfiniteScroll&gt;（滚动加载更多）组件以及配套的 usePaginatedRequest Hook 的使用。适用于移动端或后台大数据量的列表滚动加载场景，内置了首次加载的骨架屏占位、触底加载及加载完毕提示。
    </NAlert>

    <NCard title="🚀 InfiniteScroll 滚动加载演示">
      <template #header-extra>
        <NSpace>
          <NButton size="small" @click="resetList">
            清空重置
          </NButton>
          <NButton size="small" type="primary" :loading="firstLoading" @click="refreshList">
            重载第一页
          </NButton>
        </NSpace>
      </template>

      <div class="mb-4 text-14px text-gray-500">
        <span>当前累计加载条数：</span>
        <NTag type="success" size="small" class="mr-4">
          {{ userList.length }}
        </NTag>
        <span>数据总数：</span>
        <NTag type="info" size="small">
          {{ pagination.total }}
        </NTag>
      </div>

      <!-- 滚动加载视口（必须限制高度，内部使用 NScrollbar） -->
      <div class="h-450px border border-gray-100 rounded dark:border-gray-800">
        <InfiniteScroll
          :has-more="pagination.hasMore"
          :loading="loadingMore"
          content-class="p-4"
          @load="loadMore"
        >
          <!-- 首次加载骨架屏提示 -->
          <div v-if="firstLoading && userList.length === 0" class="flex flex-col gap-3">
            <div v-for="i in 6" :key="i" class="h-50px animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
          </div>

          <!-- 用户列表内容 -->
          <div v-else class="flex flex-col gap-2">
            <div
              v-for="user in userList"
              :key="user.id"
              class="flex items-center justify-between border border-gray-50 rounded bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-800/50 hover:bg-gray-100/50 dark:hover:bg-gray-800"
            >
              <NSpace align="center">
                <span class="text-14px text-gray-700 font-bold dark:text-gray-300">#{{ user.id }}</span>
                <span class="text-14px text-gray-800 dark:text-gray-200">{{ user.name }}</span>
                <NTag :type="user.role === '管理员' ? 'warning' : 'default'" size="small">
                  {{ user.role }}
                </NTag>
              </NSpace>
              <span class="text-12px text-gray-400">{{ user.email }}</span>
            </div>
          </div>
        </InfiniteScroll>
      </div>
    </NCard>
  </NSpace>
</template>

<style scoped>
.h-450px {
  height: 450px;
}
</style>
