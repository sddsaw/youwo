<script setup lang="ts">
import SvgIcon from '../SvgIcon/index.vue'

defineOptions({
  name: 'FullScreen',
})

withDefaults(defineProps<Props>(), {
  exitText: '退出全屏',
  enterText: '全屏',
})

interface Props {
  full?: boolean
  exitText?: string
  enterText?: string
}
</script>

<template>
  <ButtonIcon :key="String(full)" :tooltip-content="full ? exitText : enterText">
    <SvgIcon :icon="full ? 'gridicons:fullscreen-exit' : 'gridicons:fullscreen'" />
  </ButtonIcon>
</template>

<style scoped></style>
