<template>
  <div class="group-details-page">
    
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

    
    <div class="details-card">
      
      <div v-if="loading" class="details-loading">
        <Loader2 class="w-8 h-8 animate-spin text-primary-500" />
      </div>

      
      <div v-else-if="error" class="details-error">
        <AlertCircle class="w-12 h-12 text-red-400 mb-3" />
        <p class="text-secondary-600 font-medium">{{ error }}</p>
        <button class="btn-retry" @click="loadGroup">Try Again</button>
      </div>

      
      <div v-else-if="group" class="details-content">
        
        <div class="group-summary">
          <div class="group-icon-large" :class="`group-icon-large--${group.type?.toLowerCase() || 'other'}`">
            <component :is="getGroupIcon(group.type)" />
          </div>
          <h2 class="group-title">{{ group.name }}</h2>
          <span class="group-type-badge">{{ group.type || 'Other' }}</span>
        </div>

        
        <div class="section">
          <div class="section-header">
            <Users class="w-5 h-5 text-secondary-500" />
            <h3 class="section-title">Participants</h3>
            <span class="section-count">{{ group.members?.length || 0 }}</span>
            <button class="btn-add-member" @click="goToAddMembers" title="Add member">
              <UserPlus class="w-4 h-4" />
            </button>
          </div>
          <div class="members-list">
            <div v-for="member in group.members" :key="member._id" class="member-item">
              <div class="member-item__avatar">
                {{ member.name?.charAt(0)?.toUpperCase() || '?' }}
              </div>
              <div class="member-item__info">
                <p class="member-item__name">{{ member.name }}</p>
                <p class="member-item__email">{{ member.email }}</p>
              </div>
              <span v-if="member._id === group.createdBy?._id" class="member-item__badge">Creator</span>
            </div>
          </div>
        </div>

        
        <div v-if="!expensesLoading && expenses.length > 0" class="section">
          <div class="section-header">
            <Wallet class="w-5 h-5 text-secondary-500" />
            <h3 class="section-title">Balances</h3>
          </div>

          
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
          
          
          <button v-if="totalOwed > 0 || totalOwe > 0" class="btn-settle-up" @click="goToSettleUp">
            <Banknote class="w-5 h-5" />
            Settle Up
          </button>
        </div>

        
        <div v-if="settlements.length > 0" class="section">
          <div class="section-header">
            <Banknote class="w-5 h-5 text-secondary-500" />
            <h3 class="section-title">Settlement History</h3>
            <span class="section-count">{{ settlements.length }}</span>
          </div>

          <div class="history-list">
            <div
              v-for="settlement in settlements"
              :key="settlement._id"
              class="history-item"
            >
              <div class="history-item__icon">
                <Check class="w-4 h-4" />
              </div>
              <div class="history-item__info">
                <p class="history-item__desc">
                  <span class="font-medium">{{ formatSettlementFrom(settlement) }}</span>
                  <span class="text-secondary-500"> paid </span>
                  <span class="font-medium">{{ formatSettlementTo(settlement) }}</span>
                </p>
                <p class="history-item__meta">{{ formatDate(settlement.createdAt) }}</p>
              </div>
              <p class="history-item__amount">€{{ settlement.amount.toFixed(2) }}</p>
              <div v-if="canEditSettlement(settlement)" class="item-actions">
                <button class="action-btn action-btn--edit" @click="editSettlement(settlement)" title="Edit">
                  <Pencil class="w-4 h-4" />
                </button>
                <button class="action-btn action-btn--delete" @click="confirmDeleteSettlement(settlement)" title="Delete">
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        
        <div class="section">
          <div class="section-header">
            <Receipt class="w-5 h-5 text-secondary-500" />
            <h3 class="section-title">Expenses</h3>
            <span class="section-count">{{ expenses.length }}</span>
          </div>

          
          <div v-if="expensesLoading" class="expenses-loading">
            <Loader2 class="w-5 h-5 animate-spin text-primary-500" />
          </div>

          
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
              <div v-if="canEditExpense(expense)" class="item-actions">
                <button class="action-btn action-btn--edit" @click="editExpense(expense)" title="Edit">
                  <Pencil class="w-4 h-4" />
                </button>
                <button class="action-btn action-btn--delete" @click="confirmDeleteExpense(expense)" title="Delete">
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          
          <p v-else class="expenses-empty">No expenses yet</p>
        </div>

        
        <div class="section">
          <div class="section-header">
            <Receipt class="w-5 h-5 text-secondary-500" />
            <h3 class="section-title">Activity Log</h3>
            <span v-if="activities.length > 0" class="section-count">{{ activities.length }}</span>
          </div>

          
          <div v-if="activitiesLoading" class="activities-loading">
            <Loader2 class="w-5 h-5 animate-spin text-primary-500" />
          </div>

          
          <div v-else-if="activities.length > 0" class="activities-list">
            <div 
              v-for="activity in activities" 
              :key="activity._id" 
              class="activity-item"
            >
              <div class="activity-item__icon" :class="`activity-item__icon--${activity.type?.split('_')[0]}`">
                <component :is="getActivityIcon(activity.type)" class="w-4 h-4" />
              </div>
              <div class="activity-item__info">
                <p class="activity-item__desc">
                  <span class="font-medium">{{ activity.user?.name || 'Someone' }}</span>
                  {{ activity.description }}
                </p>
                <p class="activity-item__meta">{{ formatActivityTime(activity.createdAt) }}</p>
              </div>
            </div>
          </div>

          
          <p v-else class="activities-empty">No activity yet</p>
        </div>

        
        <button class="btn-add-expense" @click="addExpense">
          <Plus class="w-5 h-5" />
          Add New Expense
        </button>
      </div>
    </div>

    
    <div v-if="editingSettlement" class="modal-overlay" @click.self="closeEditSettlement">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">Edit Settlement</h3>
          <button class="modal-close" @click="closeEditSettlement">&times;</button>
        </div>
        <form @submit.prevent="submitEditSettlement" class="modal-form">
          <div class="form-group">
            <label class="form-label">Amount (€)</label>
            <input
              v-model.number="editSettlementAmount"
              type="number"
              step="0.01"
              min="0.01"
              class="form-input"
              required
            />
          </div>
          <div v-if="editSettlementError" class="form-error">
            <AlertCircle class="w-4 h-4" />
            {{ editSettlementError }}
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-cancel" @click="closeEditSettlement">Cancel</button>
            <button type="submit" class="btn-submit" :disabled="editSettlementLoading">
              <Loader2 v-if="editSettlementLoading" class="w-4 h-4 animate-spin" />
              <span v-else>Save</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    
    <div v-if="deleteConfirm.show" class="modal-overlay" @click.self="closeDeleteConfirm">
      <div class="modal-content modal-content--small">
        <div class="modal-header">
          <h3 class="modal-title">Confirm Delete</h3>
          <button class="modal-close" @click="closeDeleteConfirm">&times;</button>
        </div>
        <div class="modal-body">
          <p class="confirm-text">Are you sure you want to delete this {{ deleteConfirm.type }}?</p>
          <p class="confirm-subtext">This action cannot be undone.</p>
        </div>
        <div v-if="deleteConfirm.error" class="form-error mx-4">
          <AlertCircle class="w-4 h-4" />
          {{ deleteConfirm.error }}
        </div>
        <div class="modal-actions">
          <button type="button" class="btn-cancel" @click="closeDeleteConfirm">Cancel</button>
          <button type="button" class="btn-delete" :disabled="deleteConfirm.loading" @click="executeDelete">
            <Loader2 v-if="deleteConfirm.loading" class="w-4 h-4 animate-spin" />
            <span v-else>Delete</span>
          </button>
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
  Users,
  UserPlus,
  Plus,
  Loader2,
  AlertCircle,
  Receipt,
  Plane,
  Home,
  Heart,
  CreditCard,
  MoreHorizontal,
  Wallet,
  Banknote,
  Check,
  Pencil,
  Trash2
} from 'lucide-vue-next'
import { useGroupsStore } from '../stores/groups'
import { useExpensesStore } from '../stores/expenses'
import { useAuthStore } from '../stores/auth'
import { groupService } from '../services/groupService'
import { settlementService } from '../services/settlementService'
import { expenseService } from '../services/expenseService'
import { activityService } from '../services/activityService'

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

const goToAddMembers = () => {
  router.push(`/groups/${route.params.id}/add-members`)
}

const simplifiedDebts = ref({ transactions: [], transactionCount: 0, summary: '' })
const simplifiedDebtsLoading = ref(false)

const settlements = ref([])

const activities = ref([])
const activitiesLoading = ref(false)

const editingSettlement = ref(null)
const editSettlementAmount = ref(0)
const editSettlementLoading = ref(false)
const editSettlementError = ref('')

const deleteConfirm = ref({
  show: false,
  type: '', 
  item: null,
  loading: false,
  error: ''
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

const memberBalances = computed(() => {
  const userId = authStore.user?._id
  if (!userId) return []

  const pairwise = {} 

  
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

  
  for (const settlement of settlements.value) {
    const fromId = settlement.from?._id
    const toId = settlement.to?._id
    const amount = settlement.amount || 0

    if (fromId === userId && toId) {
      
      pairwise[toId] = (pairwise[toId] || 0) + amount
    } else if (toId === userId && fromId) {
      
      pairwise[fromId] = (pairwise[fromId] || 0) - amount
    }
  }

  
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

const goToSettleUp = () => {
  router.push(`/groups/${route.params.id}/settle-up`)
}

const canEditExpense = (expense) => {
  return expense.createdBy?._id === authStore.user?._id
}

const canEditSettlement = (settlement) => {
  return settlement.to?._id === authStore.user?._id
}

const editExpense = (expense) => {
  router.push({ path: '/edit-expense', query: { id: expense._id, groupId: route.params.id } })
}

const confirmDeleteExpense = (expense) => {
  deleteConfirm.value = {
    show: true,
    type: 'expense',
    item: expense,
    loading: false,
    error: ''
  }
}

const editSettlement = (settlement) => {
  editingSettlement.value = settlement
  editSettlementAmount.value = settlement.amount
  editSettlementError.value = ''
}

const closeEditSettlement = () => {
  editingSettlement.value = null
  editSettlementAmount.value = 0
  editSettlementError.value = ''
}

const submitEditSettlement = async () => {
  if (!editSettlementAmount.value || editSettlementAmount.value <= 0) {
    editSettlementError.value = 'Amount must be greater than 0'
    return
  }

  editSettlementLoading.value = true
  editSettlementError.value = ''

  try {
    await settlementService.update(editingSettlement.value._id, {
      amount: editSettlementAmount.value
    })
    closeEditSettlement()
    await loadGroup()
  } catch (err) {
    editSettlementError.value = err.response?.data?.error || 'Failed to update settlement'
  } finally {
    editSettlementLoading.value = false
  }
}

const confirmDeleteSettlement = (settlement) => {
  deleteConfirm.value = {
    show: true,
    type: 'settlement',
    item: settlement,
    loading: false,
    error: ''
  }
}

const closeDeleteConfirm = () => {
  deleteConfirm.value = {
    show: false,
    type: '',
    item: null,
    loading: false,
    error: ''
  }
}

const executeDelete = async () => {
  deleteConfirm.value.loading = true
  deleteConfirm.value.error = ''

  try {
    if (deleteConfirm.value.type === 'expense') {
      await expenseService.delete(deleteConfirm.value.item._id)
    } else if (deleteConfirm.value.type === 'settlement') {
      await settlementService.delete(deleteConfirm.value.item._id)
    }
    closeDeleteConfirm()
    await loadGroup()
  } catch (err) {
    deleteConfirm.value.error = err.response?.data?.error || `Failed to delete ${deleteConfirm.value.type}`
  } finally {
    deleteConfirm.value.loading = false
  }
}

const formatSettlementFrom = (settlement) => {
  if (settlement.from?._id === authStore.user?._id) return 'You'
  return settlement.from?.name || 'Unknown'
}

const formatSettlementTo = (settlement) => {
  if (settlement.to?._id === authStore.user?._id) return 'You'
  return settlement.to?.name || 'Unknown'
}

const fetchSettlements = async () => {
  try {
    const data = await settlementService.getByGroup(route.params.id)
    settlements.value = Array.isArray(data) ? data : (data.settlements || [])
  } catch (err) {
    console.error('Failed to load settlements:', err)
    settlements.value = []
  }
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

const fetchActivities = async () => {
  activitiesLoading.value = true
  try {
    const data = await activityService.getGroupActivities(route.params.id, { limit: 20 })
    activities.value = data
  } catch (err) {
    console.error('Failed to load activities:', err)
    activities.value = []
  } finally {
    activitiesLoading.value = false
  }
}

const formatActivityTime = (date) => {
  if (!date) return ''
  const now = new Date()
  const activityDate = new Date(date)
  const diffMs = now - activityDate
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return activityDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

const getActivityIcon = (type) => {
  if (type?.includes('expense')) return Receipt
  if (type?.includes('settlement')) return Banknote
  return Receipt
}

const loadGroup = async () => {
  await groupsStore.fetchGroup(route.params.id)
  await expensesStore.fetchGroupExpenses(route.params.id)
  await fetchSettlements()
  fetchSimplifiedDebts()
  fetchActivities()
}

onMounted(() => {
  loadGroup()
})
</script>

<style lang="scss" scoped>
.group-details-page {
  @apply min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 flex flex-col;
}

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

.details-card {
  @apply flex-1 bg-white rounded-t-3xl px-6 pt-6 pb-24;

  @media (min-width: 768px) {
    @apply rounded-3xl mx-auto my-8 max-w-lg flex-none shadow-2xl pb-6;
  }
}

.details-loading {
  @apply flex items-center justify-center py-20;
}

.details-error {
  @apply flex flex-col items-center justify-center py-12 text-center;
}

.btn-retry {
  @apply mt-4 px-6 py-2 bg-primary-600 text-white font-semibold rounded-xl;
  @apply hover:bg-primary-700 transition-colors;
}

.details-content {
  @apply space-y-6;
}

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

.btn-add-member {
  @apply w-7 h-7 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center;
  @apply hover:bg-primary-200 transition-colors;
}

.members-list {
  @apply mt-3 space-y-2;
}

.member-item {
  @apply flex items-center gap-3 p-2 bg-white rounded-lg;

  &__avatar {
    @apply w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-sm flex-shrink-0;
  }

  &__info {
    @apply flex-1 min-w-0;
  }

  &__name {
    @apply text-sm font-medium text-secondary-800 truncate;
  }

  &__email {
    @apply text-xs text-secondary-500 truncate;
  }

  &__badge {
    @apply px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-medium rounded-full flex-shrink-0;
  }
}

.btn-add-expense {
  @apply w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary-600 text-white font-semibold rounded-xl;
  @apply hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/25;
}

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

.activities-loading {
  @apply flex justify-center py-4;
}

.activities-list {
  @apply mt-3 space-y-2;
}

.activity-item {
  @apply flex items-start gap-3 p-3 bg-secondary-50 rounded-lg;

  &__icon {
    @apply w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0;

    &--expense {
      @apply bg-blue-100 text-blue-600;
    }

    &--settlement {
      @apply bg-green-100 text-green-600;
    }

    &--member {
      @apply bg-purple-100 text-purple-600;
    }
  }

  &__info {
    @apply flex-1 min-w-0;
  }

  &__desc {
    @apply text-sm text-secondary-700;
  }

  &__meta {
    @apply text-xs text-secondary-400 mt-0.5;
  }
}

.activities-empty {
  @apply mt-3 text-sm text-secondary-400 text-center py-4;
}

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

.btn-settle-up {
  @apply w-full mt-4 py-3 bg-green-600 text-white rounded-xl font-semibold;
  @apply flex items-center justify-center gap-2;
  @apply hover:bg-green-700 transition-colors;
}

.history-list {
  @apply mt-3 space-y-2;
}

.history-item {
  @apply flex items-center gap-3 p-3 bg-secondary-50 rounded-lg;

  &__icon {
    @apply w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0;
  }

  &__info {
    @apply flex-1 min-w-0;
  }

  &__desc {
    @apply text-sm text-secondary-800;
  }

  &__meta {
    @apply text-xs text-secondary-500 mt-0.5;
  }

  &__amount {
    @apply text-sm font-bold text-green-600 flex-shrink-0;
  }
}

.item-actions {
  @apply flex items-center gap-1 ml-2;
}

.action-btn {
  @apply w-8 h-8 rounded-full flex items-center justify-center transition-colors;

  &--edit {
    @apply text-secondary-500 hover:bg-secondary-100 hover:text-primary-600;
  }

  &--delete {
    @apply text-secondary-500 hover:bg-red-50 hover:text-red-600;
  }
}

.modal-overlay {
  @apply fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4;
}

.modal-content {
  @apply bg-white rounded-2xl w-full max-w-md shadow-xl;

  &--small {
    @apply max-w-sm;
  }
}

.modal-header {
  @apply flex items-center justify-between p-4 border-b border-secondary-200;
}

.modal-title {
  @apply text-lg font-bold text-secondary-900;
}

.modal-close {
  @apply w-8 h-8 rounded-full hover:bg-secondary-100 text-secondary-500;
  @apply flex items-center justify-center text-xl font-semibold transition-colors;
}

.modal-body {
  @apply p-4;
}

.confirm-text {
  @apply text-secondary-800 font-medium;
}

.confirm-subtext {
  @apply text-secondary-500 text-sm mt-1;
}

.modal-form {
  @apply p-4 space-y-4;
}

.form-group {
  @apply space-y-1;
}

.form-label {
  @apply block text-sm font-medium text-secondary-700;
}

.form-input {
  @apply w-full px-4 py-3 border border-secondary-300 rounded-xl;
  @apply focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent;
  @apply text-secondary-900;
}

.form-error {
  @apply flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg;
}

.modal-actions {
  @apply flex gap-3 p-4 pt-0;
}

.btn-cancel {
  @apply flex-1 py-3 border border-secondary-300 text-secondary-700 rounded-xl;
  @apply hover:bg-secondary-50 transition-colors font-medium;
}

.btn-submit {
  @apply flex-1 py-3 bg-primary-600 text-white rounded-xl font-semibold;
  @apply hover:bg-primary-700 transition-colors;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
  @apply flex items-center justify-center gap-2;
}

.btn-delete {
  @apply flex-1 py-3 bg-red-600 text-white rounded-xl font-semibold;
  @apply hover:bg-red-700 transition-colors;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
  @apply flex items-center justify-center gap-2;
}
</style>
