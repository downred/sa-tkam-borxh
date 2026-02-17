<template>
  <div class="create-expense">
    <h2 class="create-expense__title">New Expense</h2>

    <!-- Group Indicator -->
    <div class="group-indicator">
      <div class="group-indicator__icon">
        <Home />
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
            @click="splitEvenly"
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
        <p v-if="splitTotal !== parseFloat(amount || 0)" class="split-amounts__warning">
          Total: €{{ splitTotal.toFixed(2) }} / €{{ parseFloat(amount || 0).toFixed(2) }}
        </p>
      </div>
    </div>

    <!-- Create Button -->
    <button 
      type="button" 
      class="btn-create" 
      :disabled="!canCreate"
      @click="handleCreate"
    >
      Add Expense
    </button>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { Home, FileText } from 'lucide-vue-next'
import FormInput from './FormInput.vue'

const emit = defineEmits(['created'])

const description = ref('')
const amount = ref('')
const multiplePayersMode = ref(false)
const selectedPayers = ref(['you'])
const payerAmounts = reactive({})

// Hardcoded group
const groupName = 'Roommates'

// Hardcoded group members
const groupMembers = [
  { id: 'you', name: 'You' },
  { id: '1', name: 'John' },
  { id: '2', name: 'Jane' },
  { id: '3', name: 'Mike' }
]

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

const getMemberName = (id) => {
  const member = groupMembers.find(m => m.id === id)
  return member ? member.name : ''
}

const splitTotal = computed(() => {
  return selectedPayers.value.reduce((sum, id) => {
    return sum + (parseFloat(payerAmounts[id]) || 0)
  }, 0)
})

const splitEvenly = () => {
  if (!amount.value || selectedPayers.value.length === 0) return
  const splitAmount = (parseFloat(amount.value) / selectedPayers.value.length).toFixed(2)
  selectedPayers.value.forEach(id => {
    payerAmounts[id] = splitAmount
  })
}

const canCreate = computed(() => {
  const hasBasics = description.value.trim() && amount.value && parseFloat(amount.value) > 0
  if (!hasBasics) return false
  
  if (multiplePayersMode.value) {
    return selectedPayers.value.length > 0 && splitTotal.value === parseFloat(amount.value)
  }
  return selectedPayers.value.length === 1
})

const handleCreate = () => {
  const payers = multiplePayersMode.value 
    ? selectedPayers.value.map(id => ({ id, amount: parseFloat(payerAmounts[id]) }))
    : [{ id: selectedPayers.value[0], amount: parseFloat(amount.value) }]

  emit('created', {
    description: description.value,
    amount: parseFloat(amount.value),
    group: groupName,
    payers
  })
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
    @apply w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center;

    svg {
      @apply w-5 h-5 text-primary-600;
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
</style>
