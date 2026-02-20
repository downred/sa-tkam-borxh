import api from './api'

/**
 * Create friend service with injectable API client for testability
 * @param {Object} apiClient - Axios instance (defaults to app's api)
 */
export const createFriendService = (apiClient = api) => ({
  /**
   * Get all friends for the current user
   * @returns {Promise} API response with friends array
   */
  async getAll() {
    const response = await apiClient.get('/friends')
    return response.data
  },

  /**
   * Add a new friend
   * @param {string} email - Email of user to add as friend
   * @returns {Promise} API response with added friend
   */
  async add(email) {
    const response = await apiClient.post('/friends', { email })
    return response.data
  },

  /**
   * Remove a friend
   * @param {string} friendId - Friend ID to remove
   * @returns {Promise} API response with updated friends list
   */
  async remove(friendId) {
    const response = await apiClient.delete(`/friends/${friendId}`)
    return response.data
  }
})

// Default instance for app usage
export default createFriendService()
