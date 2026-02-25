import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

export const storage = {
  getToken: () => localStorage.getItem('token'),
  setToken: (token) => localStorage.setItem('token', token),
  removeToken: () => localStorage.removeItem('token')
}

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

  
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      
      
      if (error.response?.status === 401) {
        const isAuthPage = window.location.pathname === '/login' || 
                           window.location.pathname === '/register'
        if (!isAuthPage) {
          storageImpl.removeToken()
          navigationImpl.redirectTo('/login')
        }
      }
      return Promise.reject(error)
    }
  )

  return instance
}

const api = createApiInstance()

export default api
