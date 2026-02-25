<template>
  <div class="create-expense-page">
    <div class="create-expense-header">
      <button class="back-btn" @click="goBack">
        <ArrowLeft class="w-5 h-5" />
      </button>
      <h1 class="header-title">Add Expense</h1>
    </div>

    <div class="create-expense-card">
      
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
import { Loader2, ArrowLeft } from 'lucide-vue-next'
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

const goBack = () => {
  router.back()
}

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
  @apply px-6 pt-12 pb-8 flex items-center gap-4;

  @media (min-width: 768px) {
    @apply pt-16;
  }
}

.back-btn {
  @apply w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center;
  @apply hover:bg-white/30 transition-colors;
}

.header-title {
  @apply text-2xl font-bold text-white flex-1;

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
