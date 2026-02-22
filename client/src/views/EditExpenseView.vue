<template>
  <div class="edit-expense-page">
    <!-- Header -->
    <div class="edit-header">
      <button class="back-btn" @click="goBack">
        <ArrowLeft class="w-5 h-5" />
      </button>
      <div class="header-content">
        <h1 class="header-title">Edit Expense</h1>
        <p class="header-subtitle">{{ group?.name || 'Group' }}</p>
      </div>
    </div>

    <!-- Content Card -->
    <div class="edit-card">
      <!-- Loading State -->
      <div v-if="loading" class="edit-loading">
        <Loader2 class="w-8 h-8 animate-spin text-primary-500" />
      </div>

      <!-- Error State -->
      <div v-else-if="loadError" class="edit-error">
        <AlertCircle class="w-12 h-12 text-red-400 mb-3" />
        <p class="text-secondary-600 font-medium">{{ loadError }}</p>
        <button class="btn-retry" @click="loadData">Try Again</button>
      </div>

      <!-- Edit Form -->
      <form v-else @submit.prevent="submitEdit" class="edit-form">
        <!-- Description -->
        <div class="form-group">
          <label class="form-label">Description</label>
          <input
            v-model="form.description"
            type="text"
            class="form-input"
            placeholder="What's this expense for?"
            required
          />
        </div>

        <!-- Amount -->
        <div class="form-group">
          <label class="form-label">Amount (€)</label>
          <div class="amount-wrapper">
            <span class="amount-currency">€</span>
            <input
              v-model.number="form.amount"
              type="number"
              step="0.01"
              min="0.01"
              class="amount-input"
              placeholder="0.00"
              required
            />
          </div>
        </div>

        <!-- Paid By -->
        <div class="section">
          <div class="section-header">
            <label class="section-label">Paid by</label>
            <button 
              type="button" 
              class="section-toggle"
              @click="multiplePayersMode = !multiplePayersMode"
            >
              {{ multiplePayersMode ? 'Single payer' : 'Multiple payers' }}
            </button>
          </div>
          <div class="member-options">
            <button
              v-for="member in groupMembers"
              :key="member.id"
              type="button"
              class="member-option"
              :class="{ 'member-option--active': isPayerSelected(member.id) }"
              @click="togglePayer(member.id)"
            >
              <div class="member-option__avatar">
                {{ member.name.charAt(0) }}
              </div>
              <span class="member-option__name">{{ member.name }}</span>
            </button>
          </div>

          <!-- Split Amounts (when multiple payers) -->
          <div v-if="multiplePayersMode && selectedPayers.length > 0" class="split-amounts">
            <div class="split-amounts__header">
              <span class="split-amounts__label">Amount per person</span>
              <button 
                type="button" 
                class="split-amounts__even"
                @click="splitPayersEvenly"
              >
                Split evenly
              </button>
            </div>
            <div class="split-amounts__list">
              <div 
                v-for="payerId in selectedPayers" 
                :key="payerId" 
                class="split-item"
              >
                <div class="split-item__info">
                  <div class="split-item__avatar">
                    {{ getMemberName(payerId).charAt(0) }}
                  </div>
                  <span class="split-item__name">{{ getMemberName(payerId) }}</span>
                </div>
                <div class="split-item__input">
                  <span class="split-item__currency">€</span>
                  <input
                    v-model.number="payerAmounts[payerId]"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    class="split-item__field"
                  />
                </div>
              </div>
            </div>
            <p v-if="Math.abs(payerTotal - form.amount) > 0.01" class="split-amounts__warning">
              Total: €{{ payerTotal.toFixed(2) }} / €{{ form.amount.toFixed(2) }}
            </p>
          </div>
        </div>

        <!-- Split Among -->
        <div class="section">
          <div class="section-header">
            <label class="section-label">Split among</label>
            <span class="section-count">{{ selectedSplitMembers.length }} selected</span>
          </div>
          <div class="member-options">
            <button
              v-for="member in groupMembers"
              :key="member.id"
              type="button"
              class="member-option"
              :class="{ 'member-option--active': isSplitMemberSelected(member.id) }"
              @click="toggleSplitMember(member.id)"
            >
              <div class="member-option__avatar">
                {{ member.name.charAt(0) }}
              </div>
              <span class="member-option__name">{{ member.name }}</span>
            </button>
          </div>
          <p v-if="selectedSplitMembers.length > 0 && form.amount" class="split-preview">
            €{{ splitPreviewAmount }} per person (equal split)
          </p>
        </div>

        <!-- Error -->
        <div v-if="submitError" class="submit-error">
          <AlertCircle class="w-4 h-4" />
          {{ submitError }}
        </div>

        <!-- Actions -->
        <div class="form-actions">
          <button type="button" class="btn-cancel" @click="goBack">Cancel</button>
          <button type="submit" class="btn-submit" :disabled="submitting || !canSubmit">
            <Loader2 v-if="submitting" class="w-5 h-5 animate-spin" />
            <span v-else>Save Changes</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-vue-next'
import { useGroupsStore } from '../stores/groups'
import { useAuthStore } from '../stores/auth'
import { expenseService } from '../services/expenseService'

const route = useRoute()
const router = useRouter()
const groupsStore = useGroupsStore()
const authStore = useAuthStore()

const group = computed(() => groupsStore.currentGroup)
const expense = ref(null)
const loading = ref(true)
const loadError = ref('')
const submitting = ref(false)
const submitError = ref('')

const form = reactive({
  description: '',
  amount: 0
})

// Payer state
const multiplePayersMode = ref(false)
const selectedPayers = ref([])
const payerAmounts = reactive({})

// Split state
const selectedSplitMembers = ref([])

// Group members normalized
const groupMembers = computed(() => {
  if (!group.value?.members) return []
  return group.value.members.map(member => {
    const isCurrentUser = member._id === authStore.user?._id
    return {
      id: member._id,
      name: isCurrentUser ? 'You' : member.name
    }
  })
})

// Helpers
const getMemberName = (memberId) => {
  const member = groupMembers.value.find(m => m.id === memberId)
  return member?.name || 'Unknown'
}

const isPayerSelected = (memberId) => selectedPayers.value.includes(memberId)
const isSplitMemberSelected = (memberId) => selectedSplitMembers.value.includes(memberId)

const togglePayer = (memberId) => {
  if (multiplePayersMode.value) {
    const idx = selectedPayers.value.indexOf(memberId)
    if (idx >= 0) {
      selectedPayers.value.splice(idx, 1)
      delete payerAmounts[memberId]
    } else {
      selectedPayers.value.push(memberId)
      payerAmounts[memberId] = 0
    }
  } else {
    // Single payer mode
    selectedPayers.value = [memberId]
    payerAmounts[memberId] = form.amount
  }
}

const toggleSplitMember = (memberId) => {
  const idx = selectedSplitMembers.value.indexOf(memberId)
  if (idx >= 0) {
    selectedSplitMembers.value.splice(idx, 1)
  } else {
    selectedSplitMembers.value.push(memberId)
  }
}

const splitPayersEvenly = () => {
  if (selectedPayers.value.length === 0 || !form.amount) return
  const perPerson = Math.round((form.amount / selectedPayers.value.length) * 100) / 100
  selectedPayers.value.forEach(id => {
    payerAmounts[id] = perPerson
  })
  // Adjust first for rounding
  const total = selectedPayers.value.reduce((sum, id) => sum + (payerAmounts[id] || 0), 0)
  if (Math.abs(total - form.amount) > 0.001 && selectedPayers.value.length > 0) {
    payerAmounts[selectedPayers.value[0]] = Math.round((payerAmounts[selectedPayers.value[0]] + form.amount - total) * 100) / 100
  }
}

const payerTotal = computed(() => {
  return selectedPayers.value.reduce((sum, id) => sum + (payerAmounts[id] || 0), 0)
})

const splitPreviewAmount = computed(() => {
  if (selectedSplitMembers.value.length === 0 || !form.amount) return '0.00'
  return (form.amount / selectedSplitMembers.value.length).toFixed(2)
})

const canSubmit = computed(() => {
  if (!form.description?.trim() || !form.amount || form.amount <= 0) return false
  if (selectedPayers.value.length === 0) return false
  if (selectedSplitMembers.value.length === 0) return false
  if (multiplePayersMode.value && Math.abs(payerTotal.value - form.amount) > 0.01) return false
  return true
})

// Watch for amount changes in single payer mode
watch(() => form.amount, (newAmount) => {
  if (!multiplePayersMode.value && selectedPayers.value.length === 1) {
    payerAmounts[selectedPayers.value[0]] = newAmount
  }
})

const goBack = () => {
  const groupId = route.query.groupId
  if (groupId) {
    router.push(`/groups/${groupId}`)
  } else {
    router.back()
  }
}

const loadData = async () => {
  loading.value = true
  loadError.value = ''

  try {
    const expenseId = route.query.id
    const groupId = route.query.groupId

    if (!expenseId) {
      loadError.value = 'Expense ID is required'
      return
    }

    // Load group first if needed
    if (groupId) {
      await groupsStore.fetchGroup(groupId)
    }

    // Load expense
    const expenseData = await expenseService.getById(expenseId)
    expense.value = expenseData

    // Populate form
    form.description = expenseData.description || ''
    form.amount = expenseData.amount || 0

    // Populate payers
    if (expenseData.paidBy && expenseData.paidBy.length > 0) {
      multiplePayersMode.value = expenseData.paidBy.length > 1
      selectedPayers.value = expenseData.paidBy.map(p => p.user?._id || p.user)
      expenseData.paidBy.forEach(p => {
        const userId = p.user?._id || p.user
        payerAmounts[userId] = p.amount
      })
    }

    // Populate split members
    if (expenseData.splits && expenseData.splits.length > 0) {
      selectedSplitMembers.value = expenseData.splits.map(s => s.user?._id || s.user)
    }
  } catch (err) {
    loadError.value = err.response?.data?.error || 'Failed to load expense'
  } finally {
    loading.value = false
  }
}

const submitEdit = async () => {
  if (!canSubmit.value) return

  submitting.value = true
  submitError.value = ''

  try {
    const expenseId = route.query.id

    // Build paidBy
    const paidBy = selectedPayers.value.map(userId => ({
      user: userId,
      amount: multiplePayersMode.value ? (payerAmounts[userId] || 0) : form.amount
    }))

    // Build splits (equal)
    const splitAmount = Math.round((form.amount / selectedSplitMembers.value.length) * 100) / 100
    const splits = selectedSplitMembers.value.map(userId => ({
      user: userId,
      amount: splitAmount
    }))

    // Adjust for rounding errors in splits
    const splitTotal = splits.reduce((sum, s) => sum + s.amount, 0)
    if (Math.abs(splitTotal - form.amount) > 0.001 && splits.length > 0) {
      splits[0].amount = Math.round((splits[0].amount + form.amount - splitTotal) * 100) / 100
    }

    await expenseService.update(expenseId, {
      description: form.description.trim(),
      amount: form.amount,
      paidBy,
      splits
    })

    goBack()
  } catch (err) {
    submitError.value = err.response?.data?.error || 'Failed to update expense'
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.edit-expense-page {
  @apply min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 flex flex-col;
}

// Header
.edit-header {
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
.edit-card {
  @apply flex-1 bg-secondary-50 rounded-t-3xl p-6 overflow-y-auto;
}

.edit-loading,
.edit-error {
  @apply flex flex-col items-center justify-center py-20;
}

.btn-retry {
  @apply mt-4 px-6 py-2 bg-primary-500 text-white rounded-lg font-medium;
  @apply hover:bg-primary-600 transition-colors;
}

// Form
.edit-form {
  @apply space-y-6;
}

.form-group {
  @apply space-y-2;
}

.form-label {
  @apply block text-sm font-medium text-secondary-700;
}

.form-input {
  @apply w-full px-4 py-3 border border-secondary-300 rounded-xl bg-white;
  @apply focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent;
  @apply text-secondary-900;
}

.amount-wrapper {
  @apply relative;
}

.amount-currency {
  @apply absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-secondary-400;
}

.amount-input {
  @apply w-full pl-10 pr-4 py-3 text-xl font-bold text-secondary-900;
  @apply border border-secondary-300 rounded-xl bg-white;
  @apply focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent;
}

// Section
.section {
  @apply bg-white rounded-xl p-4;
}

.section-header {
  @apply flex items-center justify-between mb-3;
}

.section-label {
  @apply text-sm font-medium text-secondary-700;
}

.section-toggle {
  @apply text-xs text-primary-600 font-medium hover:text-primary-700;
}

.section-count {
  @apply text-xs text-secondary-500;
}

// Member Options
.member-options {
  @apply flex flex-wrap gap-2;
}

.member-option {
  @apply flex items-center gap-2 px-3 py-2 rounded-lg border border-secondary-200;
  @apply hover:border-primary-300 transition-colors bg-secondary-50;

  &--active {
    @apply border-primary-500 bg-primary-50;
  }

  &__avatar {
    @apply w-7 h-7 rounded-full bg-primary-100 text-primary-700 text-xs font-bold;
    @apply flex items-center justify-center;
  }

  &__name {
    @apply text-sm text-secondary-800;
  }
}

// Split Amounts
.split-amounts {
  @apply mt-4 pt-4 border-t border-secondary-100;

  &__header {
    @apply flex items-center justify-between mb-3;
  }

  &__label {
    @apply text-xs text-secondary-500;
  }

  &__even {
    @apply text-xs text-primary-600 font-medium hover:text-primary-700;
  }

  &__list {
    @apply space-y-2;
  }

  &__warning {
    @apply mt-2 text-xs text-amber-600 font-medium;
  }
}

.split-item {
  @apply flex items-center justify-between;

  &__info {
    @apply flex items-center gap-2;
  }

  &__avatar {
    @apply w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-bold;
    @apply flex items-center justify-center;
  }

  &__name {
    @apply text-sm text-secondary-700;
  }

  &__input {
    @apply relative w-24;
  }

  &__currency {
    @apply absolute left-2 top-1/2 -translate-y-1/2 text-sm text-secondary-400;
  }

  &__field {
    @apply w-full pl-6 pr-2 py-1.5 text-sm border border-secondary-200 rounded-lg;
    @apply focus:outline-none focus:ring-1 focus:ring-primary-500;
  }
}

// Split Preview
.split-preview {
  @apply mt-3 text-sm text-secondary-500;
}

// Error
.submit-error {
  @apply flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm;
}

// Actions
.form-actions {
  @apply flex gap-3 pt-4;
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
</style>
