<template>
  <div class="form-group">
    <label v-if="label" :for="id" class="form-label">{{ label }}</label>
    <div class="input-wrapper">
      <div v-if="$slots.icon" class="input-icon">
        <slot name="icon" />
      </div>
      <input
        :id="id"
        :value="modelValue"
        :type="computedType"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        class="form-input"
        :class="[
          { 'form-input--error': hasError },
          { 'form-input--with-icon': $slots.icon },
          { 'form-input--with-toggle': type === 'password' }
        ]"
        @input="$emit('update:modelValue', $event.target.value)"
        @blur="$emit('blur')"
        @focus="$emit('focus')"
      />
      <button
        v-if="type === 'password'"
        type="button"
        class="password-toggle"
        @click="togglePassword"
      >
        <Eye v-if="!showPassword" class="toggle-icon" />
        <EyeOff v-else class="toggle-icon" />
      </button>
    </div>
    <p v-if="hasError && errorMessage" class="form-error">{{ errorMessage }}</p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Eye, EyeOff } from 'lucide-vue-next'

const props = defineProps({
  modelValue: {
    type: String,
    required: true
  },
  id: {
    type: String,
    default: () => `input-${Math.random().toString(36).slice(2, 9)}`
  },
  label: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'text'
  },
  placeholder: {
    type: String,
    default: ''
  },
  required: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  hasError: {
    type: Boolean,
    default: false
  },
  errorMessage: {
    type: String,
    default: ''
  }
})

defineEmits(['update:modelValue', 'blur', 'focus'])

const showPassword = ref(false)

const computedType = computed(() => {
  if (props.type === 'password') {
    return showPassword.value ? 'text' : 'password'
  }
  return props.type
})

const togglePassword = () => {
  showPassword.value = !showPassword.value
}
</script>

<style lang="scss" scoped>
.form-group {
  @apply block;
}

.form-label {
  @apply block text-sm font-medium text-secondary-700 mb-2;
}

.input-wrapper {
  @apply relative;
}

.input-icon {
  @apply absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none;

  :deep(svg) {
    @apply h-5 w-5 text-secondary-400;
  }
}

.form-input {
  @apply block w-full py-3 border border-secondary-200 rounded-xl text-secondary-900 placeholder-secondary-400 transition-all;
  @apply focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent;
  @apply px-4;

  &--with-icon {
    @apply pl-10;
  }

  &--with-toggle {
    @apply pr-12;
  }

  &--error {
    @apply border-error-500 focus:ring-error-500;
  }
}

.form-error {
  @apply mt-1.5 text-sm text-error-500;
}

.password-toggle {
  @apply absolute inset-y-0 right-0 pr-3 flex items-center;
}

.toggle-icon {
  @apply h-5 w-5 text-secondary-400 hover:text-secondary-600 cursor-pointer;
}
</style>
