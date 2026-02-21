<template>
  <div class="create-expense-page">
    <div class="create-expense-header">
      <h1 class="header-title">Add Expense</h1>
    </div>

    <div class="create-expense-card">
      <!-- Loading -->
      <div v-if="loading" class="loading-state">
        <Loader2 class="w-8 h-8 animate-spin text-primary-500" />
      </div>
      <CreateExpense v-else :group="group" @created="handleCreated" />
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Loader2 } from 'lucide-vue-next'
import { useGroupsStore } from '../stores/groups'
import CreateExpense from '../components/CreateExpense.vue'

const route = useRoute()
const router = useRouter()
const groupsStore = useGroupsStore()

const group = computed(() => groupsStore.currentGroup)
const loading = computed(() => groupsStore.loading)

onMounted(async () => {
  const groupId = route.query.groupId
  if (groupId) {
    await groupsStore.fetchGroup(groupId)
  }
})

const handleCreated = (data) => {
  console.log('Expense created:', data)
  const groupId = route.query.groupId
  if (groupId) {
    router.push(`/groups/${groupId}`)
  } else {
    router.push('/expenses')
  }
}
</script>

<style lang="scss" scoped>
.create-expense-page {
  @apply min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 flex flex-col;
}

.create-expense-header {
  @apply px-6 pt-12 pb-8 text-center;

  @media (min-width: 768px) {
    @apply pt-16;
  }
}

.header-title {
  @apply text-2xl font-bold text-white;

  @media (min-width: 768px) {
    @apply text-3xl;
  }
}

.create-expense-card {
  @apply flex-1 bg-white rounded-t-3xl px-6 pt-8 pb-6;

  @media (min-width: 768px) {
    @apply rounded-3xl mx-auto my-8 max-w-md flex-none shadow-2xl;
  }
}

.loading-state {
  @apply flex items-center justify-center py-20;
}
</style>
