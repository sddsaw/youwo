<script lang="ts" setup>
import { computed } from 'vue'
import SvgIcon from '../SvgIcon/index.vue'

defineOptions({ name: 'PinToggler' })

const props = withDefaults(defineProps<Props>(), {
  unpinText: '取消固定',
  pinText: '固定',
})

interface Props {
  pin?: boolean
  unpinText?: string
  pinText?: string
}

const icon = computed(() => (props.pin ? 'mdi-pin-off' : 'mdi-pin'))
</script>

<template>
  <ButtonIcon
    :tooltip-content="pin ? unpinText : pinText"
    tooltip-placement="bottom-start"
    :z-index="100"
  >
    <SvgIcon :icon="icon" />
  </ButtonIcon>
</template>

<style scoped></style>
