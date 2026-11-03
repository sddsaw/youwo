<script setup lang="ts">
defineOptions({
  name: 'MonitorOnline',
})
</script>

<template>
  <div class="h-full min-h-500px w-full flex-col-stretch gap-12px overflow-hidden p-4">
    <NCard title="在线用户" :bordered="false" size="small" class="card-wrapper">
      <div class="p-4">
        在线用户（路由占位页面）
      </div>
    </NCard>
  </div>
</template>

<style scoped></style>
