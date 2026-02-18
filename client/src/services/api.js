import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

// Storage abstraction for testability
export const storage = {
  getToken: () => localStorage.getItem('token'),
  setToken: (token) => localStorage.setItem('token', token),
  removeToken: () => localStorage.removeItem('token')
}

// Navigation abstraction for testability
export const navigation = {
  redirectTo: (path) => {
    window.location.href = path
  }
}

export const createApiInstance = (storageImpl = storage, navigationImpl = navigation) => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json'
    }
  })

  // Request interceptor to add auth token
  instance.interceptors.request.use(
    (config) => {
      const token = storageImpl.getToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  // Response interceptor for error handling
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        storageImpl.removeToken()
        navigationImpl.redirectTo('/login')
      }
      return Promise.reject(error)
    }
  )

  return instance
}

// Default instance for app usage
const api = createApiInstance()

export default api
