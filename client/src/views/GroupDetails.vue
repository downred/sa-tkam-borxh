<template>
  <div class="group-details-page">
    <!-- Header -->
    <div class="details-header">
      <button class="back-btn" @click="goBack">
        <ArrowLeft class="w-5 h-5" />
      </button>
      <div class="header-content">
        <h1 class="header-title">{{ group?.name || 'Group' }}</h1>
        <p class="header-subtitle">
          {{ group?.members?.length || 0 }} participant{{ group?.members?.length !== 1 ? 's' : '' }}
        </p>
      </div>
    </div>

    <!-- Content Card -->
    <div class="details-card">
      <!-- Loading State -->
      <div v-if="loading" class="details-loading">
        <Loader2 class="w-8 h-8 animate-spin text-primary-500" />
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="details-error">
        <AlertCircle class="w-12 h-12 text-red-400 mb-3" />
        <p class="text-secondary-600 font-medium">{{ error }}</p>
        <button class="btn-retry" @click="loadGroup">Try Again</button>
      </div>

      <!-- Group Info -->
      <div v-else-if="group" class="details-content">
        <!-- Group Summary -->
        <div class="group-summary">
          <div class="group-icon-large" :class="`group-icon-large--${group.type?.toLowerCase() || 'other'}`">
            <component :is="getGroupIcon(group.type)" />
          </div>
          <h2 class="group-title">{{ group.name }}</h2>
          <span class="group-type-badge">{{ group.type || 'Other' }}</span>
        </div>

        <!-- Participants Section -->
        <div class="section">
          <div class="section-header">
            <Users class="w-5 h-5 text-secondary-500" />
            <h3 class="section-title">Participants</h3>
            <span class="section-count">{{ group.members?.length || 0 }}</span>
          </div>
        </div>

        <!-- Balances Section -->
        <div v-if="!expensesLoading && expenses.length > 0" class="section">
          <div class="section-header">
            <Wallet class="w-5 h-5 text-secondary-500" />
            <h3 class="section-title">Balances</h3>
          </div>

          <!-- Overall Balance -->
          <div class="balance-overall">
            <div v-if="totalOwed === 0 && totalOwe === 0" class="balance-overall__row">
              <p class="balance-overall__amount balance-overall__amount--settled">All settled up</p>
            </div>
            <div v-else class="balance-overall__rows">
              <div v-if="totalOwed > 0" class="balance-overall__row">
                <p class="balance-overall__label">You are owed</p>
                <p class="balance-overall__amount balance-overall__amount--positive">€{{ totalOwed.toFixed(2) }}</p>
              </div>
              <div v-if="totalOwe > 0" class="balance-overall__row">
                <p class="balance-overall__label">You owe</p>
                <p class="balance-overall__amount balance-overall__amount--negative">€{{ totalOwe.toFixed(2) }}</p>
              </div>
            </div>
          </div>

          <!-- Per-member Balances -->
          <div v-if="memberBalances.length > 0" class="balance-members">
            <div
              v-for="entry in memberBalances"
              :key="entry.user._id"
              class="balance-member"
            >
              <div class="balance-member__avatar">
                {{ entry.user.name?.charAt(0)?.toUpperCase() || '?' }}
              </div>
              <p class="balance-member__name">{{ entry.user.name }}</p>
              <p
                class="balance-member__amount"
                :class="{
                  'balance-member__amount--positive': entry.balance > 0,
                  'balance-member__amount--negative': entry.balance < 0
                }"
              >
                <template v-if="entry.balance > 0">
                  owes you €{{ entry.balance.toFixed(2) }}
                </template>
                <template v-else>
                  you owe €{{ Math.abs(entry.balance).toFixed(2) }}
                </template>
              </p>
            </div>
          </div>
        </div>

        <!-- Suggested Settlements Section (Simplified Debts) -->
        <div v-if="!expensesLoading && expenses.length > 0 && (totalOwed > 0 || totalOwe > 0)" class="section">
          <div class="section-header">
            <ArrowRight class="w-5 h-5 text-secondary-500" />
            <h3 class="section-title">Suggested Settlements</h3>
          </div>
          
          <div v-if="simplifiedDebtsLoading" class="settlements-loading">
            <Loader2 class="w-5 h-5 animate-spin text-primary-500" />
          </div>

          <div v-else-if="simplifiedDebts.transactions?.length > 0" class="settlements-list">
            <p class="settlements-summary">{{ simplifiedDebts.summary }}</p>
            <div
              v-for="(txn, idx) in simplifiedDebts.transactions"
              :key="idx"
              class="settlement-item"
            >
              <div class="settlement-item__avatars">
                <div class="settlement-item__avatar settlement-item__avatar--from">
                  {{ txn.from.name?.charAt(0)?.toUpperCase() || '?' }}
                </div>
                <ArrowRight class="w-4 h-4 text-secondary-400" />
                <div class="settlement-item__avatar settlement-item__avatar--to">
                  {{ txn.to.name?.charAt(0)?.toUpperCase() || '?' }}
                </div>
              </div>
              <div class="settlement-item__info">
                <p class="settlement-item__names">
                  <span :class="{ 'font-semibold': txn.from._id === authStore.user?._id }">
                    {{ txn.from._id === authStore.user?._id ? 'You' : txn.from.name }}
                  </span>
                  <span class="text-secondary-400"> pays </span>
                  <span :class="{ 'font-semibold': txn.to._id === authStore.user?._id }">
                    {{ txn.to._id === authStore.user?._id ? 'You' : txn.to.name }}
                  </span>
                </p>
              </div>
              <p class="settlement-item__amount">€{{ txn.amount.toFixed(2) }}</p>
            </div>
          </div>

          <p v-else class="settlements-empty">All settled up!</p>
        </div>

        <!-- Expenses Section -->
        <div class="section">
          <div class="section-header">
            <Receipt class="w-5 h-5 text-secondary-500" />
            <h3 class="section-title">Expenses</h3>
            <span class="section-count">{{ expenses.length }}</span>
          </div>

          <!-- Expenses Loading -->
          <div v-if="expensesLoading" class="expenses-loading">
            <Loader2 class="w-5 h-5 animate-spin text-primary-500" />
          </div>

          <!-- Expenses List -->
          <div v-else-if="expenses.length > 0" class="expenses-list">
            <div 
              v-for="expense in expenses" 
              :key="expense._id" 
              class="expense-item"
            >
              <div class="expense-item__icon">
                <Receipt class="w-4 h-4" />
              </div>
              <div class="expense-item__info">
                <p class="expense-item__desc">{{ expense.description }}</p>
                <p class="expense-item__meta">
                  Paid by {{ formatPayers(expense.paidBy) }}
                  <span class="expense-item__dot">·</span>
                  {{ formatDate(expense.date) }}
                </p>
              </div>
              <div class="expense-item__right">
                <p class="expense-item__amount">€{{ expense.amount.toFixed(2) }}</p>
                <p 
                  class="expense-item__balance"
                  :class="{
                    'expense-item__balance--lent': getUserBalance(expense) > 0,
                    'expense-item__balance--borrowed': getUserBalance(expense) < 0
                  }"
                >
                  <template v-if="getUserBalance(expense) > 0">
                    you lent €{{ getUserBalance(expense).toFixed(2) }}
                  </template>
                  <template v-else-if="getUserBalance(expense) < 0">
                    you borrowed €{{ Math.abs(getUserBalance(expense)).toFixed(2) }}
                  </template>
                  <template v-else>
                    not involved
                  </template>
                </p>
              </div>
            </div>
          </div>

          <!-- No Expenses -->
          <p v-else class="expenses-empty">No expenses yet</p>
        </div>

        <!-- Add Expense Button -->
        <button class="btn-add-expense" @click="addExpense">
          <Plus class="w-5 h-5" />
          Add New Expense
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft,
  ArrowRight,
  Users,
  Plus,
  Loader2,
  AlertCircle,
  Receipt,
  Plane,
  Home,
  Heart,
  CreditCard,
  MoreHorizontal,
  Wallet
} from 'lucide-vue-next'
import { useGroupsStore } from '../stores/groups'
import { useExpensesStore } from '../stores/expenses'
import { useAuthStore } from '../stores/auth'
import { groupService } from '../services/groupService'

const route = useRoute()
const router = useRouter()
const groupsStore = useGroupsStore()
const expensesStore = useExpensesStore()
const authStore = useAuthStore()

const group = computed(() => groupsStore.currentGroup)
const loading = computed(() => groupsStore.loading)
const error = computed(() => groupsStore.error)
const expenses = computed(() => expensesStore.expenses)
const expensesLoading = computed(() => expensesStore.loading)

// Simplified debts state
const simplifiedDebts = ref({ transactions: [], transactionCount: 0, summary: '' })
const simplifiedDebtsLoading = ref(false)

const getGroupIcon = (type) => {
  const icons = {
    Trip: Plane,
    Home: Home,
    Family: Heart,
    Subscription: CreditCard,
    Other: MoreHorizontal
  }
  return icons[type] || MoreHorizontal
}

const formatPayers = (paidBy) => {
  if (!paidBy || paidBy.length === 0) return 'Unknown'
  return paidBy.map(p => {
    if (p.user?._id === authStore.user?._id) return 'You'
    return p.user?.name || 'Unknown'
  }).join(', ')
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

const getUserBalance = (expense) => {
  const userId = authStore.user?._id
  if (!userId) return 0

  const paid = (expense.paidBy || []).reduce((sum, p) => {
    return p.user?._id === userId ? sum + p.amount : sum
  }, 0)

  const owed = (expense.splits || []).reduce((sum, s) => {
    return s.user?._id === userId ? sum + s.amount : sum
  }, 0)

  return Math.round((paid - owed) * 100) / 100
}

// Overall totals derived from per-member balances
const totalOwed = computed(() => {
  return memberBalances.value
    .filter(e => e.balance > 0)
    .reduce((sum, e) => sum + e.balance, 0)
})

const totalOwe = computed(() => {
  return memberBalances.value
    .filter(e => e.balance < 0)
    .reduce((sum, e) => sum + Math.abs(e.balance), 0)
})

// Per-member pairwise balance computation
const memberBalances = computed(() => {
  const userId = authStore.user?._id
  if (!userId || !expenses.value.length) return []

  const pairwise = {} // memberId -> net amount (positive = they owe me)

  for (const expense of expenses.value) {
    // Compute each person's net in this expense (paid - split)
    const nets = {}
    for (const p of (expense.paidBy || [])) {
      const id = p.user?._id
      if (id) nets[id] = (nets[id] || 0) + p.amount
    }
    for (const s of (expense.splits || [])) {
      const id = s.user?._id
      if (id) nets[id] = (nets[id] || 0) - s.amount
    }

    // Split into creditors (lent) and debtors (borrowed)
    const creditors = []
    const debtors = []
    for (const [id, net] of Object.entries(nets)) {
      if (net > 0.001) creditors.push({ id, amount: net })
      else if (net < -0.001) debtors.push({ id, amount: -net })
    }

    const totalCredit = creditors.reduce((s, c) => s + c.amount, 0)
    if (totalCredit === 0) continue

    // Each debtor owes each creditor proportionally
    for (const debtor of debtors) {
      for (const creditor of creditors) {
        const debtAmount = debtor.amount * (creditor.amount / totalCredit)

        if (creditor.id === userId && debtor.id !== userId) {
          // Someone owes me
          pairwise[debtor.id] = (pairwise[debtor.id] || 0) + debtAmount
        } else if (debtor.id === userId && creditor.id !== userId) {
          // I owe someone
          pairwise[creditor.id] = (pairwise[creditor.id] || 0) - debtAmount
        }
      }
    }
  }

  // Build member info from group members
  const membersMap = {}
  if (group.value?.members) {
    for (const m of group.value.members) {
      membersMap[m._id] = m
    }
  }

  return Object.entries(pairwise)
    .filter(([, amount]) => Math.abs(amount) > 0.01)
    .map(([memberId, amount]) => ({
      user: membersMap[memberId] || { _id: memberId, name: 'Unknown' },
      balance: Math.round(amount * 100) / 100
    }))
    .sort((a, b) => b.balance - a.balance)
})

const goBack = () => {
  router.push('/groups')
}

const addExpense = () => {
  router.push({ path: '/create-expense', query: { groupId: route.params.id } })
}

const fetchSimplifiedDebts = async () => {
  simplifiedDebtsLoading.value = true
  try {
    const data = await groupService.getSimplifiedDebts(route.params.id)
    simplifiedDebts.value = data
  } catch (err) {
    console.error('Failed to load simplified debts:', err)
    simplifiedDebts.value = { transactions: [], transactionCount: 0, summary: '' }
  } finally {
    simplifiedDebtsLoading.value = false
  }
}

const loadGroup = async () => {
  await groupsStore.fetchGroup(route.params.id)
  await expensesStore.fetchGroupExpenses(route.params.id)
  fetchSimplifiedDebts()
}

onMounted(() => {
  loadGroup()
})
</script>

<style lang="scss" scoped>
.group-details-page {
  @apply min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 flex flex-col;
}

// Header
.details-header {
  @apply px-6 pt-12 pb-8 flex items-center gap-4;

  @media (min-width: 768px) {
    @apply pt-16;
  }
}

.back-btn {
  @apply w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center;
  @apply hover:bg-white/30 transition-colors;
}

.header-content {
  @apply flex-1;
}

.header-title {
  @apply text-2xl font-bold text-white;

  @media (min-width: 768px) {
    @apply text-3xl;
  }
}

.header-subtitle {
  @apply text-primary-200 text-sm mt-0.5;
}

// Card
.details-card {
  @apply flex-1 bg-white rounded-t-3xl px-6 pt-6 pb-24;

  @media (min-width: 768px) {
    @apply rounded-3xl mx-auto my-8 max-w-lg flex-none shadow-2xl pb-6;
  }
}

// Loading
.details-loading {
  @apply flex items-center justify-center py-20;
}

// Error
.details-error {
  @apply flex flex-col items-center justify-center py-12 text-center;
}

.btn-retry {
  @apply mt-4 px-6 py-2 bg-primary-600 text-white font-semibold rounded-xl;
  @apply hover:bg-primary-700 transition-colors;
}

// Content
.details-content {
  @apply space-y-6;
}

// Group Summary
.group-summary {
  @apply flex flex-col items-center text-center py-4;
}

.group-icon-large {
  @apply w-16 h-16 rounded-2xl flex items-center justify-center mb-4;

  &--trip {
    @apply bg-blue-100 text-blue-600;
  }

  &--home {
    @apply bg-green-100 text-green-600;
  }

  &--family {
    @apply bg-pink-100 text-pink-600;
  }

  &--subscription {
    @apply bg-purple-100 text-purple-600;
  }

  &--other {
    @apply bg-secondary-100 text-secondary-600;
  }

  svg {
    @apply w-8 h-8;
  }
}

.group-title {
  @apply text-xl font-bold text-secondary-800;
}

.group-type-badge {
  @apply mt-2 px-3 py-1 bg-secondary-100 text-secondary-600 text-xs font-medium rounded-full;
}

// Section
.section {
  @apply bg-secondary-50 rounded-xl p-4;
}

.section-header {
  @apply flex items-center gap-2;
}

.section-title {
  @apply flex-1 font-semibold text-secondary-800;
}

.section-count {
  @apply px-2.5 py-0.5 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full;
}

// Add Expense Button
.btn-add-expense {
  @apply w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary-600 text-white font-semibold rounded-xl;
  @apply hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/25;
}

// Expenses
.expenses-loading {
  @apply flex items-center justify-center py-6;
}

.expenses-list {
  @apply mt-3 space-y-2;
}

.expense-item {
  @apply flex items-center gap-3 p-3 bg-white rounded-lg;

  &__icon {
    @apply w-9 h-9 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0;
  }

  &__info {
    @apply flex-1 min-w-0;
  }

  &__right {
    @apply text-right flex-shrink-0;
  }

  &__desc {
    @apply text-sm font-semibold text-secondary-800 truncate;
  }

  &__meta {
    @apply text-xs text-secondary-500 mt-0.5;
  }

  &__dot {
    @apply text-secondary-300 mx-1;
  }

  &__amount {
    @apply text-sm font-bold text-secondary-800;
  }

  &__balance {
    @apply text-xs mt-0.5;

    &--lent {
      @apply text-green-600;
    }

    &--borrowed {
      @apply text-red-500;
    }
  }
}

.expenses-empty {
  @apply mt-3 text-sm text-secondary-400 text-center py-4;
}

// Balances
.balance-overall {
  @apply mt-3 p-4 bg-white rounded-lg;

  &__rows {
    @apply flex items-center justify-center gap-6;
  }

  &__row {
    @apply text-center;
  }

  &__label {
    @apply text-xs text-secondary-500 uppercase tracking-wide font-medium;
  }

  &__amount {
    @apply text-lg font-bold mt-0.5;

    &--positive {
      @apply text-green-600;
    }

    &--negative {
      @apply text-red-500;
    }

    &--settled {
      @apply text-secondary-400;
    }
  }
}

.balance-members {
  @apply mt-2 space-y-1;
}

.balance-member {
  @apply flex items-center gap-3 p-3 bg-white rounded-lg;

  &__avatar {
    @apply w-8 h-8 rounded-full bg-primary-100 text-primary-700 text-sm font-bold flex items-center justify-center flex-shrink-0;
  }

  &__name {
    @apply flex-1 text-sm font-medium text-secondary-800 truncate;
  }

  &__amount {
    @apply text-sm font-semibold flex-shrink-0;

    &--positive {
      @apply text-green-600;
    }

    &--negative {
      @apply text-red-500;
    }
  }
}

// Settlements (Simplified Debts)
.settlements-loading {
  @apply mt-3 flex justify-center py-4;
}

.settlements-summary {
  @apply text-xs text-secondary-500 mb-2 text-center;
}

.settlements-list {
  @apply mt-3 space-y-2;
}

.settlement-item {
  @apply flex items-center gap-3 p-3 bg-white rounded-lg;

  &__avatars {
    @apply flex items-center gap-1 flex-shrink-0;
  }

  &__avatar {
    @apply w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center;

    &--from {
      @apply bg-red-100 text-red-600;
    }

    &--to {
      @apply bg-green-100 text-green-600;
    }
  }

  &__info {
    @apply flex-1 min-w-0;
  }

  &__names {
    @apply text-sm text-secondary-700;
  }

  &__amount {
    @apply text-sm font-bold text-primary-600 flex-shrink-0;
  }
}

.settlements-empty {
  @apply mt-3 text-sm text-green-500 text-center py-4 font-medium;
}
</style>
