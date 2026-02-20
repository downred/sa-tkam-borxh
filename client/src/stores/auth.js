import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '../services/authService'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || null)
  const loading = ref(false)

  const isAuthenticated = computed(() => !!token.value)

  async function init() {
    if (token.value && !user.value) {
      loading.value = true
      try {
        const response = await authService.getMe()
        user.value = response.data
      } catch (error) {
        // Token is invalid, clear it
        logout()
      } finally {
        loading.value = false
      }
    }
  }

  function setUser(userData) {
    user.value = userData
  }

  function setToken(newToken) {
    token.value = newToken
    if (newToken) {
      localStorage.setItem('token', newToken)
    } else {
      localStorage.removeItem('token')
    }
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
  }

  return {
    user,
    token,
    loading,
    isAuthenticated,
    init,
    setUser,
    setToken,
    logout
  }
})
