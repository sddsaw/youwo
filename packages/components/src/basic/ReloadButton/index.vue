<script setup lang="ts">
import SvgIcon from '../SvgIcon/index.vue'

defineOptions({
  name: 'ReloadButton',
})

withDefaults(defineProps<Props>(), {
  tooltipText: '重新加载',
})

interface Props {
  loading?: boolean
  tooltipText?: string
}
</script>

<template>
  <ButtonIcon :tooltip-content="tooltipText">
    <SvgIcon icon="ant-design:reload-outlined" :class="{ 'animate-spin animate-duration-750': loading }" />
  </ButtonIcon>
</template>

<style scoped></style>
