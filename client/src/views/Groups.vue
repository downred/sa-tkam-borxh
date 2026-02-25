<template>
  <div class="groups-page">
    
    <div class="groups-header">
      <h1 class="header-title">Your Groups</h1>
      <p class="header-subtitle">{{ groups.length }} group{{ groups.length !== 1 ? 's' : '' }}</p>
      
      
      <div v-if="groups.length > 0" class="balance-card">
        <p class="balance-label">Overall Balance</p>
        <p class="balance-amount" :class="balanceClass">
          {{ balanceDisplay }}
        </p>
        <p v-if="totalBalance > 0" class="balance-info">You are owed</p>
        <p v-else-if="totalBalance < 0" class="balance-info">You owe</p>
        <p v-else class="balance-info">All settled up!</p>
      </div>
    </div>

    
    <div class="groups-card">
      
      <div v-if="loading" class="groups-loading">
        <Loader2 class="w-8 h-8 animate-spin text-primary-500" />
      </div>

      
      <div v-else-if="groups.length === 0" class="groups-empty">
        <Users class="w-16 h-16 text-secondary-300 mb-4" />
        <p class="text-secondary-600 text-lg font-medium">No groups yet</p>
        <p class="text-secondary-400 text-sm mt-1 mb-6">Create a group to start splitting expenses</p>
        <router-link to="/create-group" class="btn-create">
          <Plus class="w-5 h-5" />
          Create Group
        </router-link>
      </div>

      
      <div v-else class="groups-list">
        <div 
          v-for="group in groups" 
          :key="group._id" 
          class="group-item"
          @click="viewGroup(group._id)"
        >
          <div class="group-icon" :class="`group-icon--${group.type?.toLowerCase() || 'other'}`">
            <component :is="getGroupIcon(group.type)" />
          </div>
          <div class="group-info">
            <p class="group-name">{{ group.name }}</p>
            <p class="group-meta">
              <span class="group-type">{{ group.type || 'Other' }}</span>
              <span class="group-separator">•</span>
              <span class="group-members">{{ group.members?.length || 1 }} member{{ group.members?.length !== 1 ? 's' : '' }}</span>
            </p>
          </div>
          <div class="group-balance" :class="getGroupBalanceClass(group.userBalance)">
            <span class="group-balance-amount">{{ formatGroupBalance(group.userBalance) }}</span>
            <span class="group-balance-status">{{ getGroupBalanceStatus(group.userBalance) }}</span>
          </div>
          <ChevronRight class="group-arrow" />
        </div>
      </div>

      
      <router-link 
        v-if="groups.length > 0" 
        to="/create-group" 
        class="fab-create"
      >
        <Plus class="w-6 h-6" />
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Users, 
  Plus, 
  Loader2, 
  ChevronRight,
  Plane,
  Home,
  Heart,
  CreditCard,
  MoreHorizontal
} from 'lucide-vue-next'
import { useGroupsStore } from '../stores/groups'

const router = useRouter()
const groupsStore = useGroupsStore()

const groups = computed(() => groupsStore.groups)
const loading = computed(() => groupsStore.loading)
const totalBalance = computed(() => groupsStore.totalBalance)

const balanceDisplay = computed(() => {
  const amount = Math.abs(totalBalance.value)
  return `€${amount.toFixed(2)}`
})

const balanceClass = computed(() => {
  if (totalBalance.value > 0) return 'balance-positive'
  if (totalBalance.value < 0) return 'balance-negative'
  return 'balance-neutral'
})

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

const formatGroupBalance = (balance) => {
  const amount = Math.abs(balance || 0)
  return `€${amount.toFixed(2)}`
}

const getGroupBalanceClass = (balance) => {
  if (balance > 0) return 'group-balance--positive'
  if (balance < 0) return 'group-balance--negative'
  return 'group-balance--settled'
}

const getGroupBalanceStatus = (balance) => {
  if (balance > 0) return 'you are owed'
  if (balance < 0) return 'you owe'
  return 'settled'
}

const viewGroup = (groupId) => {
  router.push(`/groups/${groupId}`)
}

onMounted(() => {
  groupsStore.fetchGroups()
})
</script>

<style lang="scss" scoped>
.groups-page {
  @apply min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 flex flex-col;
}

.groups-header {
  @apply px-6 pt-12 pb-8 text-center;

  @media (min-width: 768px) {
    @apply pt-16;
  }
}

.header-title {
  @apply text-2xl font-bold text-white mb-1;

  @media (min-width: 768px) {
    @apply text-3xl;
  }
}

.header-subtitle {
  @apply text-primary-200 text-sm;
}

.balance-card {
  @apply mt-6 mx-auto max-w-md bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center;
  @apply border border-white/20;
}

.balance-label {
  @apply text-primary-100 text-sm font-medium mb-2;
}

.balance-amount {
  @apply text-4xl font-bold mb-1;
  
  &.balance-positive {
    @apply text-green-300;
  }
  
  &.balance-negative {
    @apply text-red-300;
  }
  
  &.balance-neutral {
    @apply text-white;
  }
}

.balance-info {
  @apply text-primary-200 text-sm;
}

.groups-card {
  @apply flex-1 bg-white rounded-t-3xl px-6 pt-6 pb-24 relative;

  @media (min-width: 768px) {
    @apply rounded-3xl mx-auto my-8 max-w-lg flex-none shadow-2xl pb-6;
  }
}

.groups-loading {
  @apply flex items-center justify-center py-20;
}

.groups-empty {
  @apply flex flex-col items-center justify-center py-12 text-center;
}

.btn-create {
  @apply inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl;
  @apply hover:bg-primary-700 transition-colors;
}

.groups-list {
  @apply space-y-3;
}

.group-item {
  @apply flex items-center gap-4 p-4 bg-secondary-50 rounded-xl cursor-pointer transition-all;
  @apply hover:bg-secondary-100 hover:shadow-sm;
}

.group-icon {
  @apply w-12 h-12 rounded-xl flex items-center justify-center;

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
    @apply w-6 h-6;
  }
}

.group-info {
  @apply flex-1 min-w-0;
}

.group-name {
  @apply font-semibold text-secondary-800 truncate;
}

.group-meta {
  @apply text-sm text-secondary-500 flex items-center gap-1.5;
}

.group-separator {
  @apply text-secondary-300;
}

.group-balance {
  @apply text-right mr-2;
}

.group-balance-amount {
  @apply block font-semibold text-sm;
}

.group-balance-status {
  @apply block text-xs;
}

.group-balance--positive {
  .group-balance-amount {
    @apply text-green-600;
  }
  .group-balance-status {
    @apply text-green-500;
  }
}

.group-balance--negative {
  .group-balance-amount {
    @apply text-red-600;
  }
  .group-balance-status {
    @apply text-red-500;
  }
}

.group-balance--settled {
  .group-balance-amount {
    @apply text-secondary-400;
  }
  .group-balance-status {
    @apply text-secondary-400;
  }
}

.group-arrow {
  @apply w-5 h-5 text-secondary-400;
}

.fab-create {
  @apply fixed bottom-24 right-6 w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg;
  @apply flex items-center justify-center;
  @apply hover:bg-primary-700 transition-colors;

  @media (min-width: 768px) {
    @apply absolute bottom-6 right-6;
  }
}
</style>
