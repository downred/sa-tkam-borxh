<template>
  <div class="create-expense-page">
    <div class="create-expense-header">
      <h1 class="header-title">Add Expense</h1>
    </div>

    <div class="create-expense-card">
      <CreateExpense @created="handleCreated" />
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import CreateExpense from '../components/CreateExpense.vue'

const router = useRouter()

const handleCreated = (data) => {
  console.log('Expense created:', data)
  router.push('/expenses')
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
</style>
