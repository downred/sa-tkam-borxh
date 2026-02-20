<template>
  <div class="register-page">
    <!-- Header -->
    <div class="register-header">
      <div class="register-icon">
        <CircleDollarSign class="icon" />
      </div>
      <h1 class="register-title">Create Account</h1>
      <p class="register-subtitle">Start tracking your expenses today</p>
    </div>

    <!-- Form Card -->
    <div class="register-card">
      <form @submit.prevent="handleRegister" class="register-form" novalidate>
        <!-- Name Field -->
        <FormInput
          id="name"
          v-model="form.name"
          type="text"
          label="Full Name"
          placeholder="John Doe"
          :has-error="fields.name?.isTouched && !fields.name?.isValid"
          :error-message="fields.name?.errors?.[0]"
          @blur="touch('name')"
        >
          <template #icon>
            <User />
          </template>
        </FormInput>

        <!-- Email Field -->
        <FormInput
          id="email"
          v-model="form.email"
          type="email"
          label="Email Address"
          placeholder="you@example.com"
          :has-error="fields.email?.isTouched && !fields.email?.isValid"
          :error-message="fields.email?.errors?.[0]"
          @blur="touch('email')"
        >
          <template #icon>
            <Mail />
          </template>
        </FormInput>

        <!-- Password Field -->
        <FormInput
          id="password"
          v-model="form.password"
          type="password"
          label="Password"
          placeholder="Create a password"
          :has-error="fields.password?.isTouched && !fields.password?.isValid"
          :error-message="fields.password?.errors?.[0]"
          @blur="touch('password')"
        >
          <template #icon>
            <Lock />
          </template>
        </FormInput>

        <!-- Confirm Password Field -->
        <FormInput
          id="confirmPassword"
          v-model="form.confirmPassword"
          type="password"
          label="Confirm Password"
          placeholder="Confirm your password"
          :has-error="(fields.confirmPassword?.isTouched && !fields.confirmPassword?.isValid) || passwordMismatch"
          :error-message="passwordMismatch ? 'Passwords do not match' : fields.confirmPassword?.errors?.[0]"
          @blur="checkPasswordMatch"
        >
          <template #icon>
            <ShieldCheck />
          </template>
        </FormInput>

        <!-- Terms Checkbox -->
        <label class="checkbox-label">
          <input v-model="form.acceptTerms" type="checkbox" class="checkbox" />
          <span class="checkbox-text">I agree to the <a href="#" class="terms-link">Terms of Service</a> and <a href="#" class="terms-link">Privacy Policy</a></span>
        </label>

        <!-- Error Message -->
        <div v-if="generalError" class="error-box">
          <p class="error-box__text">{{ generalError }}</p>
        </div>

        <!-- Submit Button -->
        <button type="submit" :disabled="loading" class="btn-primary">
          <span v-if="!loading">Create Account</span>
          <span v-else class="btn-loading">
            <Loader2 class="spinner" />
            Creating account...
          </span>
        </button>
      </form>

      <!-- Divider -->
      <div class="divider">
        <div class="divider-line"></div>
        <div class="divider-text">
          <span>Already have an account?</span>
        </div>
      </div>

      <!-- Login Link -->
      <router-link to="/login" class="btn-secondary">Sign In</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useFormValidation } from 'oop-validator'
import { CircleDollarSign, User, Mail, Lock, ShieldCheck, Loader2 } from 'lucide-vue-next'
import FormInput from '../components/FormInput.vue'
import { authService } from '../services/authService'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// Form data
const form = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false
})

// Validation config
const validationConfig = {
  name: [
    'required',
    { rule: 'min', params: { length: 2 }, message: 'Name must be at least 2 characters' }
  ],
  email: ['required', 'email'],
  password: [
    'required',
    { rule: 'min', params: { length: 6 }, message: 'Password must be at least 6 characters' }
  ],
  confirmPassword: ['required']
}

// Setup validation with the composable
const { fields, validate, touch, touchAll } = useFormValidation(
  form,
  validationConfig,
  { validateOnMount: false }
)

const loading = ref(false)
const generalError = ref('')
const passwordMismatch = ref(false)

// Check password match when confirmPassword changes
watch(() => form.value.confirmPassword, () => {
  if (fields.value.confirmPassword?.isTouched && form.value.confirmPassword) {
    passwordMismatch.value = form.value.password !== form.value.confirmPassword
  }
})

const checkPasswordMatch = () => {
  touch('confirmPassword')
  if (form.value.confirmPassword) {
    passwordMismatch.value = form.value.password !== form.value.confirmPassword
  }
}

const handleRegister = async () => {
  touchAll()
  const result = validate()
  
  // Check password match manually
  passwordMismatch.value = form.value.password !== form.value.confirmPassword
  
  if (!result.isValid || passwordMismatch.value) return

  // Check terms acceptance
  if (!form.value.acceptTerms) {
    generalError.value = 'You must accept the Terms of Service and Privacy Policy'
    return
  }

  loading.value = true
  generalError.value = ''

  try {
    const response = await authService.register({
      name: form.value.name,
      email: form.value.email,
      password: form.value.password
    })

    // Store user data and token
    authStore.setUser(response.data)
    authStore.setToken(response.data.token)

    // Redirect to groups
    router.push('/groups')
  } catch (error) {
    generalError.value = error.response?.data?.error || 'Registration failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.register-page {
  @apply min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 flex flex-col;
}

// Header
.register-header {
  @apply px-6 pt-12 pb-8 text-center;

  @media (min-width: 768px) {
    @apply pt-16;
  }
}

.register-icon {
  @apply inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-4 backdrop-blur-sm;
}

.register-title {
  @apply text-2xl font-bold text-white;

  @media (min-width: 768px) {
    @apply text-3xl;
  }
}

.register-subtitle {
  @apply text-primary-200 mt-2;
}

// Card
.register-card {
  @apply flex-1 bg-white rounded-t-3xl px-6 pt-8 pb-6;

  @media (min-width: 768px) {
    @apply rounded-3xl mx-auto my-8 max-w-md flex-none shadow-2xl;
  }
}

// Form
.register-form {
  @apply space-y-5;
}

// Icons
.icon {
  @apply w-8 h-8 text-white;
}

// Checkbox
.checkbox-label {
  @apply flex items-start cursor-pointer;
}

.checkbox {
  @apply w-4 h-4 mt-0.5 text-primary-600 border-secondary-300 rounded focus:ring-primary-500;
}

.checkbox-text {
  @apply ml-2 text-sm text-secondary-600 leading-tight;
}

.terms-link {
  @apply text-primary-600 hover:text-primary-500 underline;
}

// Error Box
.error-box {
  @apply p-3 bg-error-50 border border-error-200 rounded-xl;

  &__text {
    @apply text-sm text-error-600;
  }
}

// Buttons
.btn-primary {
  @apply w-full py-3.5 px-4 bg-primary-600 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/30 transition-all;
  @apply hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-secondary {
  @apply block w-full py-3.5 px-4 text-center border-2 border-primary-600 text-primary-600 font-semibold rounded-xl transition-all;
  @apply hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2;
}

.btn-loading {
  @apply flex items-center justify-center;
}

// Spinner
.spinner {
  @apply animate-spin -ml-1 mr-2 h-5 w-5;
}

// Divider
.divider {
  @apply relative my-6;
}

.divider-line {
  @apply absolute inset-0 flex items-center;

  &::before {
    content: '';
    @apply w-full border-t border-secondary-200;
  }
}

.divider-text {
  @apply relative flex justify-center text-sm;

  span {
    @apply px-4 bg-white text-secondary-500;
  }
}
</style>