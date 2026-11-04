<script setup lang="tsx">
import { SvgIcon } from '@sa/components'
import { NButton, NCard, NIcon, NScrollbar, NTree } from 'naive-ui'
import { computed } from 'vue'
import { $t } from '@/locales'

defineOptions({
  name: 'CategorySidebar',
})

const props = defineProps<Props>()

interface Props {
  categoryData: Api.Knowledge.CategoryNode[]
}

const selectedCategory = defineModel<string>('selectedCategory', { default: '' })
const checkedCategoryKeys = defineModel<string[]>('checkedCategoryKeys', { default: () => [] })

const treeData = computed(() => {
  const transform = (nodes: Api.Knowledge.CategoryNode[]): Api.Knowledge.CategoryNode[] => {
    return nodes.map((node) => {
      const hasChildren = Array.isArray(node.children) && node.children.length > 0
      return {
        ...node,
        children: hasChildren && node.level < 3 ? transform(node.children!) : undefined,
      }
    })
  }
  return transform(props.categoryData || [])
})

const selectedKeys = computed({
  get: () => (selectedCategory.value ? [selectedCategory.value] : []),
  set: (keys) => {
    if (keys && keys.length > 0) {
      selectedCategory.value = String(keys[0])
    }
    else {
      selectedCategory.value = ''
    }
  },
})

function handleClearSelection() {
  selectedCategory.value = ''
  checkedCategoryKeys.value = []
}

function renderSwitcherIcon() {
  return (
    <NIcon class="text-16px text-gray-400 transition-colors duration-200 dark:text-zinc-500 hover:text-gray-600">
      <SvgIcon icon="material-symbols:chevron-right-rounded" />
    </NIcon>
  )
}

function renderPrefix({ option }: { option: any }) {
  if (option.level === 1) {
    return <SvgIcon icon="material-symbols:folder-open-outline" class="text-16px text-amber-500" />
  }
  if (option.level === 2) {
    return <SvgIcon icon="material-symbols:folder-zip-outline-rounded" class="text-16px text-orange-400" />
  }
  return <SvgIcon icon="material-symbols:description-outline" class="text-15px text-blue-400" />
}

function renderSuffix({ option }: { option: any }) {
  if (option.count === undefined)
    return null

  return (
    <div class="ml-auto flex items-center pr-6px">
      <span class="min-w-20px text-right text-13px text-gray-500 font-medium tabular-nums dark:text-zinc-400">
        {option.count}
      </span>
    </div>
  )
}

function renderLabel({ option }: { option: any }) {
  return (
    <span class="text-14px text-gray-700 font-medium dark:text-zinc-300">
      {option.name}
    </span>
  )
}
</script>

<template>
  <NCard class="h-full w-280px shrink-0 overflow-hidden card-wrapper" content-style="height: 100%" :bordered="false" size="small">
    <div class="h-full flex flex-col gap-8px">
      <div class="flex items-center justify-between border-b border-gray-200 pb-8px dark:border-zinc-800">
        <span class="text-16px text-gray-800 font-bold dark:text-zinc-100">{{ $t('page.workbench_knowledge.categoryFilter') }}</span>
        <NButton
          v-if="selectedCategory || checkedCategoryKeys.length > 0"
          text
          type="primary"
          size="tiny"
          @click="handleClearSelection"
        >
          {{ $t('page.workbench_knowledge.clearFilter') }}
        </NButton>
      </div>

      <div class="min-h-0 flex-1">
        <NScrollbar class="h-full pr-2px">
          <NTree
            v-model:selected-keys="selectedKeys"
            v-model:checked-keys="checkedCategoryKeys"
            block-line
            checkable
            cascade
            multiple
            cancelable
            check-on-click
            expand-on-click
            default-expand-all
            :data="treeData"
            key-field="id"
            label-field="name"
            children-field="children"
            :render-prefix="renderPrefix"
            :render-suffix="renderSuffix"
            :render-label="renderLabel"
            :render-switcher-icon="renderSwitcherIcon"
            class="category-tree"
          />
        </NScrollbar>
      </div>
    </div>
  </NCard>
</template>
