<template>
  <div class="create-expense">
    <h2 class="create-expense__title">New Expense</h2>

    <!-- Group Indicator -->
    <div class="group-indicator">
      <div class="group-indicator__icon" :class="`group-indicator__icon--${group?.type?.toLowerCase() || 'other'}`">
        <component :is="groupIcon" />
      </div>
      <div class="group-indicator__info">
        <p class="group-indicator__label">Adding to</p>
        <p class="group-indicator__name">{{ groupName }}</p>
      </div>
    </div>

    <!-- Description -->
    <FormInput
      id="description"
      v-model="description"
      type="text"
      label="Description"
      placeholder="What's this expense for?"
    >
      <template #icon>
        <FileText />
      </template>
    </FormInput>

    <!-- Amount -->
    <div class="amount-input">
      <label for="amount" class="amount-input__label">Amount</label>
      <div class="amount-input__wrapper">
        <span class="amount-input__currency">€</span>
        <input
          id="amount"
          v-model="amount"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          class="amount-input__field"
        />
      </div>
    </div>

    <!-- Paid By -->
    <div class="paid-by">
      <div class="paid-by__header">
        <label class="paid-by__label">Paid by</label>
        <button 
          type="button" 
          class="paid-by__toggle"
          @click="multiplePayersMode = !multiplePayersMode"
        >
          {{ multiplePayersMode ? 'Single payer' : 'Multiple payers' }}
        </button>
      </div>
      <div class="paid-by__options">
        <button
          v-for="member in groupMembers"
          :key="member.id"
          type="button"
          class="payer-option"
          :class="{ 'payer-option--active': isPayerSelected(member.id) }"
          @click="togglePayer(member.id)"
        >
          <div class="payer-option__avatar">
            {{ member.name.charAt(0) }}
          </div>
          <span class="payer-option__name">{{ member.id === 'you' ? 'You' : member.name }}</span>
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
              <span class="split-item__name">{{ payerId === 'you' ? 'You' : getMemberName(payerId) }}</span>
            </div>
            <div class="split-item__input">
              <span class="split-item__currency">€</span>
              <input
                v-model="payerAmounts[payerId]"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                class="split-item__field"
              />
            </div>
          </div>
        </div>
        <p v-if="payerTotal !== parseFloat(amount || 0)" class="split-amounts__warning">
          Total: €{{ payerTotal.toFixed(2) }} / €{{ parseFloat(amount || 0).toFixed(2) }}
        </p>
      </div>
    </div>

    <!-- Split Among -->
    <div class="split-among">
      <div class="split-among__header">
        <label class="split-among__label">Split among</label>
        <span class="split-among__count">{{ selectedSplitMembers.length }} selected</span>
      </div>
      <div class="split-among__options">
        <button
          v-for="member in groupMembers"
          :key="member.id"
          type="button"
          class="payer-option"
          :class="{ 'payer-option--active': isSplitMemberSelected(member.id) }"
          @click="toggleSplitMember(member.id)"
        >
          <div class="payer-option__avatar">
            {{ member.name.charAt(0) }}
          </div>
          <span class="payer-option__name">{{ member.id === 'you' ? 'You' : member.name }}</span>
        </button>
      </div>
      <p v-if="selectedSplitMembers.length > 0 && amount" class="split-among__preview">
        €{{ splitPreviewAmount }} per person (equal split)
      </p>
    </div>

    <!-- Error -->
    <p v-if="submitError" class="submit-error">{{ submitError }}</p>

    <!-- Create Button -->
    <button 
      type="button" 
      class="btn-create" 
      :disabled="!canCreate || submitting"
      @click="handleCreate"
    >
      {{ submitting ? 'Adding...' : 'Add Expense' }}
    </button>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { Home, FileText, Plane, Heart, CreditCard, MoreHorizontal } from 'lucide-vue-next'
import FormInput from './FormInput.vue'
import { useAuthStore } from '../stores/auth'
import { useExpensesStore } from '../stores/expenses'

const props = defineProps({
  group: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['created'])

const authStore = useAuthStore()
const expensesStore = useExpensesStore()

const description = ref('')
const amount = ref('')
const multiplePayersMode = ref(false)
const selectedPayers = ref(['you'])
const payerAmounts = reactive({})
const selectedSplitMembers = ref([])
const submitting = ref(false)
const submitError = ref(null)

const groupName = computed(() => props.group?.name || 'Unknown Group')

const groupIcon = computed(() => {
  const icons = { Trip: Plane, Home, Family: Heart, Subscription: CreditCard, Other: MoreHorizontal }
  return icons[props.group?.type] || MoreHorizontal
})

const groupMembers = computed(() => {
  if (!props.group?.members) return [{ id: 'you', name: 'You' }]
  return props.group.members.map(member => {
    const isCurrentUser = member._id === authStore.user?._id
    return {
      id: isCurrentUser ? 'you' : member._id,
      name: isCurrentUser ? 'You' : member.name
    }
  })
})

// Initialize split members to all group members
const initSplitMembers = () => {
  selectedSplitMembers.value = groupMembers.value.map(m => m.id)
}

// Watch for group loading
import { watch } from 'vue'
watch(() => props.group, () => {
  if (props.group) initSplitMembers()
}, { immediate: true })

// Resolve 'you' to actual user ID
const resolveUserId = (id) => {
  if (id === 'you') return authStore.user?._id
  return id
}

const isPayerSelected = (id) => selectedPayers.value.includes(id)

const togglePayer = (id) => {
  if (multiplePayersMode.value) {
    const index = selectedPayers.value.indexOf(id)
    if (index === -1) {
      selectedPayers.value.push(id)
      payerAmounts[id] = ''
    } else {
      selectedPayers.value.splice(index, 1)
      delete payerAmounts[id]
    }
  } else {
    selectedPayers.value = [id]
  }
}

const isSplitMemberSelected = (id) => selectedSplitMembers.value.includes(id)

const toggleSplitMember = (id) => {
  const index = selectedSplitMembers.value.indexOf(id)
  if (index === -1) {
    selectedSplitMembers.value.push(id)
  } else if (selectedSplitMembers.value.length > 1) {
    selectedSplitMembers.value.splice(index, 1)
  }
}

const getMemberName = (id) => {
  const member = groupMembers.value.find(m => m.id === id)
  return member ? member.name : ''
}

const payerTotal = computed(() => {
  return selectedPayers.value.reduce((sum, id) => {
    return sum + (parseFloat(payerAmounts[id]) || 0)
  }, 0)
})

const splitPreviewAmount = computed(() => {
  if (!amount.value || selectedSplitMembers.value.length === 0) return '0.00'
  return (parseFloat(amount.value) / selectedSplitMembers.value.length).toFixed(2)
})

const splitPayersEvenly = () => {
  if (!amount.value || selectedPayers.value.length === 0) return
  const splitAmount = (parseFloat(amount.value) / selectedPayers.value.length).toFixed(2)
  selectedPayers.value.forEach(id => {
    payerAmounts[id] = splitAmount
  })
}

const canCreate = computed(() => {
  const hasBasics = description.value.trim() && amount.value && parseFloat(amount.value) > 0
  if (!hasBasics) return false
  if (selectedSplitMembers.value.length === 0) return false
  
  if (multiplePayersMode.value) {
    return selectedPayers.value.length > 0 && Math.abs(payerTotal.value - parseFloat(amount.value)) < 0.01
  }
  return selectedPayers.value.length === 1
})

const handleCreate = async () => {
  if (!canCreate.value || submitting.value) return

  submitting.value = true
  submitError.value = null

  try {
    const paidBy = multiplePayersMode.value
      ? selectedPayers.value.map(id => ({ user: resolveUserId(id), amount: parseFloat(payerAmounts[id]) }))
      : [{ user: resolveUserId(selectedPayers.value[0]), amount: parseFloat(amount.value) }]

    const splitAmong = selectedSplitMembers.value.map(id => resolveUserId(id))

    const expenseData = {
      description: description.value,
      amount: parseFloat(amount.value),
      groupId: props.group?._id,
      splitType: 'equal',
      paidBy,
      splitAmong
    }

    const created = await expensesStore.createExpense(expenseData)
    emit('created', created)
  } catch (err) {
    submitError.value = err.response?.data?.error || 'Failed to create expense'
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.create-expense {
  @apply space-y-6;

  &__title {
    @apply text-xl font-semibold text-secondary-800;
  }
}

// Group Indicator
.group-indicator {
  @apply flex items-center gap-3 p-4 bg-primary-50 rounded-xl;

  &__icon {
    @apply w-10 h-10 rounded-xl flex items-center justify-center;

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
      @apply w-5 h-5;
    }
  }

  &__label {
    @apply text-xs text-secondary-500;
  }

  &__name {
    @apply font-medium text-secondary-800;
  }
}

// Amount Input
.amount-input {
  &__label {
    @apply block text-sm font-medium text-secondary-700 mb-2;
  }

  &__wrapper {
    @apply flex items-center bg-secondary-50 border border-secondary-200 rounded-xl overflow-hidden;
    @apply focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent;
  }

  &__currency {
    @apply px-4 py-3 text-lg font-semibold text-secondary-500 bg-secondary-100;
  }

  &__field {
    @apply flex-1 px-4 py-3 text-lg font-semibold text-secondary-800 bg-transparent outline-none;

    &::placeholder {
      @apply text-secondary-400 font-normal;
    }

    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  }
}

// Paid By
.paid-by {
  &__header {
    @apply flex items-center justify-between mb-3;
  }

  &__label {
    @apply text-sm font-medium text-secondary-700;
  }

  &__toggle {
    @apply text-sm text-primary-600 font-medium hover:text-primary-700;
  }

  &__options {
    @apply flex gap-3 overflow-x-auto pb-1;
  }
}

// Split Amounts
.split-amounts {
  @apply mt-4 pt-4 border-t border-secondary-200;

  &__header {
    @apply flex items-center justify-between mb-3;
  }

  &__label {
    @apply text-sm font-medium text-secondary-700;
  }

  &__even {
    @apply text-sm text-primary-600 font-medium hover:text-primary-700;
  }

  &__list {
    @apply space-y-2;
  }

  &__warning {
    @apply mt-3 text-sm text-warning-600 font-medium;
  }
}

.split-item {
  @apply flex items-center justify-between gap-3 p-3 bg-secondary-50 rounded-xl;

  &__info {
    @apply flex items-center gap-2;
  }

  &__avatar {
    @apply w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-semibold;
  }

  &__name {
    @apply text-sm font-medium text-secondary-700;
  }

  &__input {
    @apply flex items-center bg-white border border-secondary-200 rounded-lg overflow-hidden;
  }

  &__currency {
    @apply px-2 py-1.5 text-sm text-secondary-500 bg-secondary-50;
  }

  &__field {
    @apply w-20 px-2 py-1.5 text-sm text-secondary-800 outline-none;

    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  }
}

.payer-option {
  @apply flex flex-col items-center gap-2 p-3 min-w-[70px] bg-secondary-50 rounded-xl transition-all;
  @apply hover:bg-secondary-100;
  @apply focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2;

  &--active {
    @apply bg-primary-100 ring-2 ring-primary-500;
  }

  &__avatar {
    @apply w-10 h-10 rounded-full bg-secondary-200 text-secondary-600 flex items-center justify-center font-semibold;

    .payer-option--active & {
      @apply bg-primary-200 text-primary-700;
    }
  }

  &__name {
    @apply text-xs font-medium text-secondary-600 truncate max-w-full;

    .payer-option--active & {
      @apply text-primary-600;
    }
  }
}

// Create Button
.btn-create {
  @apply w-full py-3.5 px-4 bg-primary-600 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/30 transition-all;
  @apply hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2;
  @apply disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary-600;
}

// Split Among
.split-among {
  &__header {
    @apply flex items-center justify-between mb-3;
  }

  &__label {
    @apply text-sm font-medium text-secondary-700;
  }

  &__count {
    @apply text-sm text-secondary-500;
  }

  &__options {
    @apply flex gap-3 overflow-x-auto pb-1;
  }

  &__preview {
    @apply mt-3 text-sm text-primary-600 font-medium;
  }
}

// Error
.submit-error {
  @apply text-sm text-red-600 font-medium;
}
</style>
