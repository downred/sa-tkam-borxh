<template>
  <div class="create-group">
    <h2 class="create-group__title">Create Group</h2>

    <!-- Group Name -->
    <FormInput
      id="groupName"
      v-model="groupName"
      type="text"
      label="Group Name"
      placeholder="Enter group name"
    >
      <template #icon>
        <Users />
      </template>
    </FormInput>

    <!-- Group Type -->
    <div class="group-type">
      <label class="group-type__label">Group Type</label>
      <div class="group-type__options">
        <button
          v-for="type in groupTypes"
          :key="type.value"
          type="button"
          class="type-option"
          :class="{ 'type-option--active': selectedType === type.value }"
          @click="selectedType = type.value"
        >
          <component :is="type.icon" class="type-option__icon" />
          <span class="type-option__label">{{ type.label }}</span>
        </button>
      </div>
    </div>

    <!-- Trip Dates (only for trip type) -->
    <div v-if="selectedType === 'trip'" class="trip-dates">
      <label class="trip-dates__label">Trip Dates</label>
      <div class="trip-dates__inputs">
        <div class="date-input">
          <label for="startDate" class="date-input__label">Start</label>
          <input
            id="startDate"
            v-model="tripStartDate"
            type="date"
            class="date-input__field"
          />
        </div>
        <div class="date-input">
          <label for="endDate" class="date-input__label">End</label>
          <input
            id="endDate"
            v-model="tripEndDate"
            type="date"
            class="date-input__field"
          />
        </div>
      </div>
    </div>

    <!-- Renewal Date (only for subscription type) -->
    <div v-if="selectedType === 'subscription'" class="renewal-date">
      <label for="renewalDate" class="renewal-date__label">Renewal Date</label>
      <input
        id="renewalDate"
        v-model="renewalDate"
        type="date"
        class="date-input__field"
      />
    </div>

    <!-- Group Settings (only show when type is selected) -->
    <div v-if="selectedType" class="group-settings">
      <label class="group-settings__label">Settings</label>
      
      <div class="toggle-option">
        <div class="toggle-option__info">
          <Bell class="toggle-option__icon" />
          <div>
            <p class="toggle-option__title">Balance Alerts</p>
            <p class="toggle-option__desc">Get notified when balances change</p>
          </div>
        </div>
        <button
          type="button"
          class="toggle-btn"
          :class="{ 'toggle-btn--active': balanceAlerts }"
          @click="balanceAlerts = !balanceAlerts"
        >
          <span class="toggle-btn__knob" />
        </button>
      </div>

      <div class="toggle-option">
        <div class="toggle-option__info">
          <Clock class="toggle-option__icon" />
          <div>
            <p class="toggle-option__title">Settle Up Reminders</p>
            <p class="toggle-option__desc">Receive reminders to settle debts</p>
          </div>
        </div>
        <button
          type="button"
          class="toggle-btn"
          :class="{ 'toggle-btn--active': settleReminders }"
          @click="settleReminders = !settleReminders"
        >
          <span class="toggle-btn__knob" />
        </button>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- Create Button -->
    <button 
      type="button" 
      class="btn-create" 
      :disabled="!canCreate || loading"
      @click="handleCreate"
    >
      <span v-if="loading" class="btn-loading">Creating...</span>
      <span v-else>Create Group</span>
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Users, Plane, Home, Heart, CreditCard, MoreHorizontal, Bell, Clock } from 'lucide-vue-next'
import FormInput from './FormInput.vue'

const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: null
  }
})

const groupName = ref('')
const selectedType = ref('')
const balanceAlerts = ref(false)
const settleReminders = ref(false)
const tripStartDate = ref('')
const tripEndDate = ref('')
const renewalDate = ref('')

const groupTypes = [
  { value: 'trip', label: 'Trip', icon: Plane },
  { value: 'home', label: 'Home', icon: Home },
  { value: 'family', label: 'Family', icon: Heart },
  { value: 'subscription', label: 'Subscription', icon: CreditCard },
  { value: 'other', label: 'Other', icon: MoreHorizontal }
]

const canCreate = computed(() => {
  return groupName.value.trim() && selectedType.value
})

const emit = defineEmits(['created'])

const handleCreate = () => {
  emit('created', {
    name: groupName.value,
    type: selectedType.value,
    balanceAlerts: balanceAlerts.value,
    settleReminders: settleReminders.value,
    tripStartDate: tripStartDate.value,
    tripEndDate: tripEndDate.value,
    renewalDate: renewalDate.value
  })
}
</script>

<style lang="scss" scoped>
.create-group {
  @apply space-y-6;

  &__title {
    @apply text-xl font-semibold text-secondary-800;
  }
}

// Group Type
.group-type {
  &__label {
    @apply block text-sm font-medium text-secondary-700 mb-3;
  }

  &__options {
    @apply grid grid-cols-3 gap-3;

    @media (min-width: 768px) {
      @apply grid-cols-5;
    }
  }
}

// Type Option
.type-option {
  @apply flex flex-col items-center gap-2 p-4 bg-secondary-50 rounded-xl transition-all;
  @apply hover:bg-secondary-100;
  @apply focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2;

  &--active {
    @apply bg-primary-100 ring-2 ring-primary-500;
  }

  &__icon {
    @apply w-6 h-6 text-secondary-600;

    .type-option--active & {
      @apply text-primary-600;
    }
  }

  &__label {
    @apply text-xs font-medium text-secondary-600;

    .type-option--active & {
      @apply text-primary-600;
    }
  }
}

// Trip Dates
.trip-dates {
  &__label {
    @apply block text-sm font-medium text-secondary-700 mb-3;
  }

  &__inputs {
    @apply grid grid-cols-2 gap-4;
  }
}

.date-input {
  &__label {
    @apply block text-xs text-secondary-500 mb-1;
  }

  &__field {
    @apply w-full px-3 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl;
    @apply text-secondary-800 text-sm;
    @apply focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent;
  }
}

// Renewal Date
.renewal-date {
  &__label {
    @apply block text-sm font-medium text-secondary-700 mb-3;
  }
}

// Group Settings
.group-settings {
  &__label {
    @apply block text-sm font-medium text-secondary-700 mb-3;
  }
}

// Toggle Option
.toggle-option {
  @apply flex items-center justify-between p-4 bg-secondary-50 rounded-xl mb-3;

  &__info {
    @apply flex items-center gap-3;
  }

  &__icon {
    @apply w-5 h-5 text-secondary-500;
  }

  &__title {
    @apply text-sm font-medium text-secondary-800;
  }

  &__desc {
    @apply text-xs text-secondary-500;
  }
}

// Toggle Button
.toggle-btn {
  @apply relative w-11 h-6 bg-secondary-300 rounded-full transition-colors;
  @apply focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2;

  &--active {
    @apply bg-primary-600;
  }

  &__knob {
    @apply absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform;

    .toggle-btn--active & {
      @apply translate-x-5;
    }
  }
}

// Error Message
.error-message {
  @apply p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg;
}

// Create Button
.btn-create {
  @apply w-full py-3.5 px-4 bg-primary-600 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/30 transition-all;
  @apply hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2;
  @apply disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary-600;
}

.btn-loading {
  @apply inline-flex items-center;
}
</style>
