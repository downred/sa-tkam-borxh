import api from './api'

/**
 * Create auth service with injectable API client for testability
 * @param {Object} apiClient - Axios instance (defaults to app's api)
 */
export const createAuthService = (apiClient = api) => ({
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @param {string} userData.name - User's full name
   * @param {string} userData.email - User's email
   * @param {string} userData.password - User's password
   * @returns {Promise} API response with user data and token
   */
  async register(userData) {
    const response = await apiClient.post('/auth/register', userData)
    return response.data
  },

  /**
   * Login user
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - User's email
   * @param {string} credentials.password - User's password
   * @returns {Promise} API response with user data and token
   */
  async login(credentials) {
    const response = await apiClient.post('/auth/login', credentials)
    return response.data
  },

  /**
   * Get current user profile
   * @returns {Promise} API response with user data
   */
  async getMe() {
    const response = await apiClient.get('/auth/me')
    return response.data
  }
})

// Default instance for app usage
export const authService = createAuthService()

export default authService
