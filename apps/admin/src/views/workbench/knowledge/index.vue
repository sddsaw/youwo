<script setup lang="ts">
import { ref } from 'vue'
import { initialCategoryData } from '@/views/workbench/mock'
import ArticleTable from './components/ArticleTable.vue'
import CategorySidebar from './components/CategorySidebar.vue'

defineOptions({
  name: 'WorkbenchKnowledgePage',
})

const categoryData = ref(initialCategoryData)
const selectedCategory = ref<string>('')
const checkedCategoryKeys = ref<string[]>([])
</script>

<template>
  <div class="h-full min-h-500px flex gap-12px overflow-hidden bg-gray-50/50 p-12px lt-sm:overflow-auto dark:bg-zinc-950/20">
    <!-- Left Column: Category Tree Sidebar -->
    <CategorySidebar
      v-model:selected-category="selectedCategory"
      v-model:checked-category-keys="checkedCategoryKeys"
      :category-data="categoryData"
    />

    <!-- Right Column: Search Form + DataTable Card -->
    <ArticleTable
      :selected-category="selectedCategory"
      :checked-category-keys="checkedCategoryKeys"
      :category-data="categoryData"
    />
  </div>
</template>
