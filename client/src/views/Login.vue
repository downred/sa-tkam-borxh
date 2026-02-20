<template>
  <div class="login-page">
    <!-- Header -->
    <div class="login-header">
      <div class="login-icon">
        <CircleDollarSign class="icon" />
      </div>
      <h1 class="login-title">Welcome Back</h1>
      <p class="login-subtitle">Sign in to manage your expenses</p>
    </div>

    <!-- Form Card -->
    <div class="login-card">
      <form @submit.prevent="handleLogin" class="login-form" novalidate>
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
          placeholder="Enter your password"
          :has-error="fields.password?.isTouched && !fields.password?.isValid"
          :error-message="fields.password?.errors?.[0]"
          @blur="touch('password')"
        >
          <template #icon>
            <Lock />
          </template>
        </FormInput>

        <!-- Remember Me & Forgot Password -->
        <div class="form-actions">
          <label class="checkbox-label">
            <input v-model="form.rememberMe" type="checkbox" class="checkbox" />
            <span class="checkbox-text">Remember me</span>
          </label>
          <router-link to="/forgot-password" class="forgot-link">Forgot password?</router-link>
        </div>

        <!-- Error Message -->
        <div v-if="generalError" class="error-box">
          <p class="error-box__text">{{ generalError }}</p>
        </div>

        <!-- Submit Button -->
        <button type="submit" :disabled="loading" class="btn-primary">
          <span v-if="!loading">Sign In</span>
          <span v-else class="btn-loading">
            <Loader2 class="spinner" />
            Signing in...
          </span>
        </button>
      </form>

      <!-- Divider -->
      <div class="divider">
        <div class="divider-line"></div>
        <div class="divider-text">
          <span>New to saTkamBorxh?</span>
        </div>
      </div>

      <!-- Register Link -->
      <router-link to="/register" class="btn-secondary">Create an Account</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useFormValidation } from 'oop-validator'
import { CircleDollarSign, Mail, Lock, Loader2 } from 'lucide-vue-next'
import FormInput from '../components/FormInput.vue'
import { authService } from '../services/authService'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// Form data
const form = ref({
  email: '',
  password: '',
  rememberMe: false
})

// Validation config
const validationConfig = {
  email: ['required', 'email'],
  password: [
    'required',
    { rule: 'min', params: { length: 6 }, message: 'Password must be at least 6 characters' }
  ]
}

// Setup validation with the composable
const { fields, validate, touch, touchAll } = useFormValidation(
  form,
  validationConfig,
  { validateOnMount: false }
)

const loading = ref(false)
const generalError = ref('')

const handleLogin = async () => {
  console.log("bismillah");
  
  touchAll()
  const result = validate()
  
  if (!result.isValid) return

  loading.value = true
  generalError.value = ''

  try {
    const response = await authService.login({
      email: form.value.email,
      password: form.value.password
    })

    console.log({response});
    

    // Store user data and token
    authStore.setUser(response.data)
    authStore.setToken(response.data.token)

    // Redirect to groups
    router.push('/groups')
  } catch (error) {
    console.log({error});
    
    generalError.value = error.response?.data?.error || 'Login failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.login-page {
  @apply min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 flex flex-col;
}

// Header
.login-header {
  @apply px-6 pt-12 pb-8 text-center;

  @media (min-width: 768px) {
    @apply pt-16;
  }
}

.login-icon {
  @apply inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-4 backdrop-blur-sm;
}

.login-title {
  @apply text-2xl font-bold text-white;

  @media (min-width: 768px) {
    @apply text-3xl;
  }
}

.login-subtitle {
  @apply text-primary-200 mt-2;
}

// Card
.login-card {
  @apply flex-1 bg-white rounded-t-3xl px-6 pt-8 pb-6;

  @media (min-width: 768px) {
    @apply rounded-3xl mx-auto my-8 max-w-md flex-none shadow-2xl;
  }
}

// Form
.login-form {
  @apply space-y-5;
}

// Icons
.icon {
  @apply w-8 h-8 text-white;
}

// Form Actions
.form-actions {
  @apply flex items-center justify-between;
}

.checkbox-label {
  @apply flex items-center cursor-pointer;
}

.checkbox {
  @apply w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500;
}

.checkbox-text {
  @apply ml-2 text-sm text-secondary-600;
}

.forgot-link {
  @apply text-sm font-medium text-primary-600 hover:text-primary-500;
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