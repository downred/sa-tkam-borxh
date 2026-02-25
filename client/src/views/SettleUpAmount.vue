<template>
  <div class="settle-amount-page">
    
    <div class="settle-header">
      <button class="back-btn" @click="goBack">
        <ArrowLeft class="w-5 h-5" />
      </button>
      <div class="header-content">
        <h1 class="header-title">Record Payment</h1>
        <p class="header-subtitle">{{ memberName }}</p>
      </div>
    </div>

    
    <div class="settle-card">
      
      <div v-if="loading" class="settle-loading">
        <Loader2 class="w-8 h-8 animate-spin text-primary-500" />
      </div>

      
      <div v-else class="settle-content">
        
        <div class="settle-member" :class="{ 'settle-member--pay': isPayingDirection }">
          <div class="settle-member__avatar" :class="{ 'settle-member__avatar--pay': isPayingDirection }">
            {{ memberName?.charAt(0)?.toUpperCase() || '?' }}
          </div>
          <div class="settle-member__info">
            <p class="settle-member__name">{{ memberName }}</p>
            <p class="settle-member__owes" :class="{ 'settle-member__owes--pay': isPayingDirection }">
              <template v-if="isPayingDirection">
                you owe €{{ suggestedAmount }}
              </template>
              <template v-else>
                owes you €{{ suggestedAmount }}
              </template>
            </p>
          </div>
        </div>

        
        <form @submit.prevent="submitSettlement" class="settle-form">
          <div class="form-group">
            <label class="form-label">
              {{ isPayingDirection ? 'Amount you paid' : 'Amount received' }}
            </label>
            <div class="amount-input-wrapper">
              <span class="amount-currency">€</span>
              <input
                v-model.number="amount"
                type="number"
                step="0.01"
                min="0.01"
                :max="parseFloat(suggestedAmount) + 100"
                class="amount-input"
                placeholder="0.00"
                required
                autofocus
              />
            </div>
            <p class="form-hint">
              Suggested: €{{ suggestedAmount }}
              <button type="button" class="btn-use-suggested" @click="useSuggested">
                Use this amount
              </button>
            </p>
          </div>

          
          <div v-if="submitError" class="settle-submit-error">
            <AlertCircle class="w-4 h-4" />
            <span>{{ submitError }}</span>
          </div>

          
          <button 
            type="submit" 
            class="btn-submit" 
            :class="{ 'btn-submit--pay': isPayingDirection }"
            :disabled="submitting"
          >
            <Loader2 v-if="submitting" class="w-5 h-5 animate-spin" />
            <template v-else>
              <Check class="w-5 h-5" />
              Record Payment
            </template>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Check
} from 'lucide-vue-next'
import { useGroupsStore } from '../stores/groups'
import { useAuthStore } from '../stores/auth'
import { settlementService } from '../services/settlementService'

const route = useRoute()
const router = useRouter()
const groupsStore = useGroupsStore()
const authStore = useAuthStore()

const groupId = computed(() => route.params.id)
const memberId = computed(() => route.params.memberId)
const memberName = computed(() => route.query.name || 'Member')
const suggestedAmount = computed(() => route.query.amount || '0.00')
const direction = computed(() => route.query.direction || 'receive')

const isPayingDirection = computed(() => direction.value === 'pay')

const amount = ref(null)
const loading = ref(false)
const submitting = ref(false)
const submitError = ref('')

const goBack = () => {
  router.push(`/groups/${groupId.value}/settle-up`)
}

const useSuggested = () => {
  amount.value = parseFloat(suggestedAmount.value)
}

const submitSettlement = async () => {
  if (!amount.value || amount.value <= 0) {
    submitError.value = 'Please enter a valid amount'
    return
  }

  submitting.value = true
  submitError.value = ''

  try {
    const settlementData = {
      groupId: groupId.value,
      amount: amount.value
    }

    if (isPayingDirection.value) {
      
      settlementData.to = memberId.value
    } else {
      
      settlementData.from = memberId.value
    }

    await settlementService.create(settlementData)

    
    await groupsStore.fetchGroup(groupId.value)
    router.push(`/groups/${groupId.value}`)
  } catch (err) {
    submitError.value = err.response?.data?.error || 'Failed to record payment'
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  
  if (suggestedAmount.value) {
    amount.value = parseFloat(suggestedAmount.value)
  }
})
</script>

<style lang="scss" scoped>
.settle-amount-page {
  @apply min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 flex flex-col;
}

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

.settle-card {
  @apply flex-1 bg-secondary-50 rounded-t-3xl p-6;
}

.settle-loading {
  @apply flex flex-col items-center justify-center py-20;
}

.settle-content {
  @apply space-y-6;
}

.settle-member {
  @apply flex items-center gap-4 p-4 bg-white rounded-xl border-l-4 border-green-500;

  &--pay {
    @apply border-red-400;
  }

  &__avatar {
    @apply w-14 h-14 rounded-full bg-green-100 text-green-700 text-xl font-bold;
    @apply flex items-center justify-center flex-shrink-0;

    &--pay {
      @apply bg-red-100 text-red-600;
    }
  }

  &__info {
    @apply flex-1;
  }

  &__name {
    @apply text-lg font-bold text-secondary-900;
  }

  &__owes {
    @apply text-green-600 font-medium;

    &--pay {
      @apply text-red-500;
    }
  }
}

.settle-form {
  @apply space-y-6;
}

.form-group {
  @apply space-y-2;
}

.form-label {
  @apply block text-sm font-medium text-secondary-700;
}

.amount-input-wrapper {
  @apply relative;
}

.amount-currency {
  @apply absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-secondary-400;
}

.amount-input {
  @apply w-full pl-10 pr-4 py-4 text-3xl font-bold text-secondary-900;
  @apply border-2 border-secondary-200 rounded-xl;
  @apply focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200;
  @apply transition-all;

  &::placeholder {
    @apply text-secondary-300;
  }
}

.form-hint {
  @apply text-sm text-secondary-500 flex items-center gap-2;
}

.btn-use-suggested {
  @apply text-primary-600 font-medium hover:text-primary-700 underline;
}

.settle-submit-error {
  @apply flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm;
}

.btn-submit {
  @apply w-full py-4 bg-green-600 text-white rounded-xl font-semibold text-lg;
  @apply flex items-center justify-center gap-2;
  @apply hover:bg-green-700 transition-colors;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;

  &--pay {
    @apply bg-primary-600 hover:bg-primary-700;
  }
}
</style>
