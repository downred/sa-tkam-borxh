<template>
  <div class="expenses-page">
    
    <div class="expenses-header">
      <p class="header-label">You are owed</p>
      <h1 class="header-amount">€{{ totalOwed.toFixed(2) }}</h1>
    </div>

    
    <div class="expenses-card">
      <h2 class="expenses-title">Recent Expenses</h2>
      
      <div class="expenses-list">
        <div 
          v-for="expense in expenses" 
          :key="expense.id" 
          class="expense-item"
        >
          <div class="expense-icon">
            <component :is="expense.icon" />
          </div>
          <div class="expense-info">
            <p class="expense-name">{{ expense.name }}</p>
            <p class="expense-owed">
              <span class="owed-label">You are owed</span>
              <span class="owed-amount">€{{ expense.owedAmount.toFixed(2) }}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { 
  ShoppingCart, 
  Utensils, 
  Home, 
  Car, 
  Zap, 
  Film 
} from 'lucide-vue-next'

const expenses = [
  { id: 1, name: 'Groceries', owedAmount: 24.50, icon: ShoppingCart },
  { id: 2, name: 'Dinner at Mario\'s', owedAmount: 18.75, icon: Utensils },
  { id: 3, name: 'Monthly Rent', owedAmount: 150.00, icon: Home },
  { id: 4, name: 'Gas', owedAmount: 35.00, icon: Car },
  { id: 5, name: 'Electricity Bill', owedAmount: 42.30, icon: Zap },
  { id: 6, name: 'Movie Night', owedAmount: 12.00, icon: Film }
]

const totalOwed = computed(() => {
  return expenses.reduce((sum, expense) => sum + expense.owedAmount, 0)
})
</script>

<style lang="scss" scoped>
.expenses-page {
  @apply min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 flex flex-col;
}

.expenses-header {
  @apply px-6 pt-12 pb-8 text-center;

  @media (min-width: 768px) {
    @apply pt-16;
  }
}

.header-label {
  @apply text-primary-200 text-sm uppercase tracking-wide mb-1;
}

.header-amount {
  @apply text-4xl font-bold text-white;

  @media (min-width: 768px) {
    @apply text-5xl;
  }
}

.expenses-card {
  @apply flex-1 bg-white rounded-t-3xl px-6 pt-6 pb-6;

  @media (min-width: 768px) {
    @apply rounded-3xl mx-auto my-8 max-w-lg flex-none shadow-2xl;
  }
}

.expenses-title {
  @apply text-lg font-semibold text-secondary-800 mb-4;
}

.expenses-list {
  @apply space-y-3;
}

.expense-item {
  @apply flex items-center gap-4 p-4 bg-secondary-50 rounded-xl transition-all;
  @apply hover:bg-secondary-100;
}

.expense-icon {
  @apply flex items-center justify-center w-12 h-12 bg-primary-100 text-primary-600 rounded-xl flex-shrink-0;

  :deep(svg) {
    @apply w-6 h-6;
  }
}

.expense-info {
  @apply flex-1 min-w-0;
}

.expense-name {
  @apply font-medium text-secondary-800 truncate;
}

.expense-owed {
  @apply flex items-center gap-1 mt-0.5;
}

.owed-label {
  @apply text-sm text-secondary-500;
}

.owed-amount {
  @apply text-sm font-semibold text-owed;
}
</style>