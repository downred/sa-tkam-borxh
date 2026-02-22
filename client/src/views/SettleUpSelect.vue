<template>
  <div class="settle-up-page">
    <!-- Header -->
    <div class="settle-header">
      <button class="back-btn" @click="goBack">
        <ArrowLeft class="w-5 h-5" />
      </button>
      <div class="header-content">
        <h1 class="header-title">Settle Up</h1>
        <p class="header-subtitle">{{ group?.name || 'Group' }}</p>
      </div>
    </div>

    <!-- Content Card -->
    <div class="settle-card">
      <!-- Loading State -->
      <div v-if="loading" class="settle-loading">
        <Loader2 class="w-8 h-8 animate-spin text-primary-500" />
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="settle-error">
        <AlertCircle class="w-12 h-12 text-red-400 mb-3" />
        <p class="text-secondary-600 font-medium">{{ error }}</p>
        <button class="btn-retry" @click="loadData">Try Again</button>
      </div>

      <!-- Content -->
      <div v-else class="settle-content">
        <p class="settle-instruction">Select a member to settle up with</p>

        <!-- Members who owe you -->
        <div v-if="membersOwingYou.length > 0" class="member-section">
          <h3 class="section-label section-label--positive">They owe you</h3>
          <div class="member-list">
            <div
              v-for="member in membersOwingYou"
              :key="member._id"
              class="member-item member-item--positive"
              @click="selectMember(member, 'receive')"
            >
              <div class="member-item__avatar member-item__avatar--positive">
                {{ member.name?.charAt(0)?.toUpperCase() || '?' }}
              </div>
              <div class="member-item__info">
                <p class="member-item__name">{{ member.name }}</p>
                <p class="member-item__email">{{ member.email }}</p>
              </div>
              <div class="member-item__amount">
                <p class="member-item__owes">owes you</p>
                <p class="member-item__value member-item__value--positive">€{{ member.balance.toFixed(2) }}</p>
              </div>
              <ArrowRight class="w-5 h-5 text-secondary-400" />
            </div>
          </div>
        </div>

        <!-- Members you owe -->
        <div v-if="membersYouOwe.length > 0" class="member-section">
          <h3 class="section-label section-label--negative">You owe them</h3>
          <div class="member-list">
            <div
              v-for="member in membersYouOwe"
              :key="member._id"
              class="member-item member-item--negative"
              @click="selectMember(member, 'pay')"
            >
              <div class="member-item__avatar member-item__avatar--negative">
                {{ member.name?.charAt(0)?.toUpperCase() || '?' }}
              </div>
              <div class="member-item__info">
                <p class="member-item__name">{{ member.name }}</p>
                <p class="member-item__email">{{ member.email }}</p>
              </div>
              <div class="member-item__amount">
                <p class="member-item__owes">you owe</p>
                <p class="member-item__value member-item__value--negative">€{{ member.balance.toFixed(2) }}</p>
              </div>
              <ArrowRight class="w-5 h-5 text-secondary-400" />
            </div>
          </div>
        </div>

        <!-- No balances -->
        <div v-if="membersOwingYou.length === 0 && membersYouOwe.length === 0" class="settle-empty">
          <Wallet class="w-12 h-12 text-secondary-300 mb-3" />
          <p class="settle-empty__text">All settled up!</p>
          <p class="settle-empty__subtext">No outstanding balances in this group</p>
        </div>
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
  Loader2,
  AlertCircle,
  Wallet
} from 'lucide-vue-next'
import { useGroupsStore } from '../stores/groups'
import { useExpensesStore } from '../stores/expenses'
import { useAuthStore } from '../stores/auth'
import { settlementService } from '../services/settlementService'

const route = useRoute()
const router = useRouter()
const groupsStore = useGroupsStore()
const expensesStore = useExpensesStore()
const authStore = useAuthStore()

const group = computed(() => groupsStore.currentGroup)
const loading = computed(() => groupsStore.loading || expensesStore.loading)
const error = computed(() => groupsStore.error || expensesStore.error)
const expenses = computed(() => expensesStore.expenses)

// Settlements state
const settlements = ref([])

const goBack = () => {
  router.push(`/groups/${route.params.id}`)
}

const selectMember = (member, direction) => {
  router.push({
    path: `/groups/${route.params.id}/settle-up/${member._id}`,
    query: { 
      amount: member.balance.toFixed(2), 
      name: member.name,
      direction // 'receive' = they pay you, 'pay' = you pay them
    }
  })
}

// Calculate balances per member
const memberBalances = computed(() => {
  const userId = authStore.user?._id
  if (!userId) return {}

  const pairwise = {} // memberId -> net amount (positive = they owe me)

  // Calculate from expenses
  for (const expense of expenses.value) {
    const nets = {}
    for (const p of (expense.paidBy || [])) {
      const id = p.user?._id
      if (id) nets[id] = (nets[id] || 0) + p.amount
    }
    for (const s of (expense.splits || [])) {
      const id = s.user?._id
      if (id) nets[id] = (nets[id] || 0) - s.amount
    }

    const creditors = []
    const debtors = []
    for (const [id, net] of Object.entries(nets)) {
      if (net > 0.001) creditors.push({ id, amount: net })
      else if (net < -0.001) debtors.push({ id, amount: -net })
    }

    const totalCredit = creditors.reduce((s, c) => s + c.amount, 0)
    if (totalCredit === 0) continue

    for (const debtor of debtors) {
      for (const creditor of creditors) {
        const debtAmount = debtor.amount * (creditor.amount / totalCredit)

        if (creditor.id === userId && debtor.id !== userId) {
          pairwise[debtor.id] = (pairwise[debtor.id] || 0) + debtAmount
        } else if (debtor.id === userId && creditor.id !== userId) {
          pairwise[creditor.id] = (pairwise[creditor.id] || 0) - debtAmount
        }
      }
    }
  }

  // Apply settlements to reduce balances
  for (const settlement of settlements.value) {
    const fromId = settlement.from?._id
    const toId = settlement.to?._id
    const amount = settlement.amount || 0

    if (fromId === userId && toId) {
      // I paid someone - reduces what I owe them
      pairwise[toId] = (pairwise[toId] || 0) + amount
    } else if (toId === userId && fromId) {
      // Someone paid me - reduces what they owe me
      pairwise[fromId] = (pairwise[fromId] || 0) - amount
    }
  }

  return pairwise
})

// Members who owe you (positive balance)
const membersOwingYou = computed(() => {
  const membersMap = {}
  if (group.value?.members) {
    for (const m of group.value.members) {
      membersMap[m._id] = m
    }
  }

  const result = []
  for (const [memberId, balance] of Object.entries(memberBalances.value)) {
    if (balance > 0.01 && membersMap[memberId]) {
      result.push({
        _id: memberId,
        name: membersMap[memberId].name,
        email: membersMap[memberId].email,
        balance: Math.round(balance * 100) / 100
      })
    }
  }

  return result.sort((a, b) => b.balance - a.balance)
})

// Members you owe (negative balance)
const membersYouOwe = computed(() => {
  const membersMap = {}
  if (group.value?.members) {
    for (const m of group.value.members) {
      membersMap[m._id] = m
    }
  }

  const result = []
  for (const [memberId, balance] of Object.entries(memberBalances.value)) {
    if (balance < -0.01 && membersMap[memberId]) {
      result.push({
        _id: memberId,
        name: membersMap[memberId].name,
        email: membersMap[memberId].email,
        balance: Math.round(Math.abs(balance) * 100) / 100
      })
    }
  }

  return result.sort((a, b) => b.balance - a.balance)
})

const fetchSettlements = async () => {
  try {
    const data = await settlementService.getByGroup(route.params.id)
    settlements.value = Array.isArray(data) ? data : (data.settlements || [])
  } catch (err) {
    console.error('Failed to load settlements:', err)
    settlements.value = []
  }
}

const loadData = async () => {
  await groupsStore.fetchGroup(route.params.id)
  await expensesStore.fetchGroupExpenses(route.params.id)
  await fetchSettlements()
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.settle-up-page {
  @apply min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 flex flex-col;
}

// Header
.settle-header {
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
}

.header-subtitle {
  @apply text-white/70 text-sm mt-0.5;
}

// Card
.settle-card {
  @apply flex-1 bg-secondary-50 rounded-t-3xl p-6;
}

.settle-loading {
  @apply flex flex-col items-center justify-center py-20;
}

.settle-error {
  @apply flex flex-col items-center justify-center py-20;

  .btn-retry {
    @apply mt-4 px-6 py-2 bg-primary-500 text-white rounded-lg font-medium;
    @apply hover:bg-primary-600 transition-colors;
  }
}

.settle-content {
  @apply space-y-6;
}

.settle-instruction {
  @apply text-secondary-600 text-sm mb-4;
}

// Section
.member-section {
  @apply space-y-3;
}

.section-label {
  @apply text-sm font-semibold uppercase tracking-wide px-1;

  &--positive {
    @apply text-green-600;
  }

  &--negative {
    @apply text-red-500;
  }
}

// Member List
.member-list {
  @apply space-y-3;
}

.member-item {
  @apply flex items-center gap-3 p-4 bg-white rounded-xl cursor-pointer;
  @apply hover:bg-secondary-50 transition-colors;

  &--positive {
    @apply border-l-4 border-green-500;
  }

  &--negative {
    @apply border-l-4 border-red-400;
  }

  &__avatar {
    @apply w-12 h-12 rounded-full text-lg font-bold;
    @apply flex items-center justify-center flex-shrink-0;

    &--positive {
      @apply bg-green-100 text-green-700;
    }

    &--negative {
      @apply bg-red-100 text-red-600;
    }
  }

  &__info {
    @apply flex-1 min-w-0;
  }

  &__name {
    @apply font-semibold text-secondary-900 truncate;
  }

  &__email {
    @apply text-sm text-secondary-500 truncate;
  }

  &__amount {
    @apply text-right;
  }

  &__owes {
    @apply text-xs text-secondary-500;
  }

  &__value {
    @apply text-lg font-bold;

    &--positive {
      @apply text-green-600;
    }

    &--negative {
      @apply text-red-500;
    }
  }
}

// Empty State
.settle-empty {
  @apply flex flex-col items-center justify-center py-16;

  &__text {
    @apply text-secondary-700 font-medium;
  }

  &__subtext {
    @apply text-secondary-500 text-sm mt-1;
  }
}
</style>
