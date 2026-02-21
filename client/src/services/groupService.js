import api from './api'

/**
 * Create group service with injectable API client for testability
 * @param {Object} apiClient - Axios instance (defaults to app's api)
 */
export const createGroupService = (apiClient = api) => ({
  /**
   * Get all groups for the current user
   * @returns {Promise} API response with groups array
   */
  async getAll() {
    const response = await apiClient.get('/groups')
    return response.data
  },

  /**
   * Get a single group by ID
   * @param {string} id - Group ID
   * @returns {Promise} API response with group data
   */
  async getById(id) {
    const response = await apiClient.get(`/groups/${id}`)
    return response.data
  },

  /**
   * Create a new group
   * @param {Object} groupData - Group data
   * @param {string} groupData.name - Group name (required)
   * @param {string} groupData.type - Group type: Trip, Home, Family, Subscription, Other
   * @param {string} [groupData.startDate] - Start date (for Trip type)
   * @param {string} [groupData.endDate] - End date (for Trip type)
   * @param {string} [groupData.renewalDate] - Renewal date (for Subscription type)
   * @param {boolean} [groupData.settleUpReminders] - Enable settle up reminders
   * @returns {Promise} API response with created group
   */
  async create(groupData) {
    const response = await apiClient.post('/groups', groupData)
    return response.data
  },

  /**
   * Update an existing group
   * @param {string} id - Group ID
   * @param {Object} groupData - Updated group data
   * @returns {Promise} API response with updated group
   */
  async update(id, groupData) {
    const response = await apiClient.put(`/groups/${id}`, groupData)
    return response.data
  },

  /**
   * Delete a group (only creator can delete)
   * @param {string} id - Group ID
   * @returns {Promise} API response with success message
   */
  async delete(id) {
    const response = await apiClient.delete(`/groups/${id}`)
    return response.data
  },

  /**
   * Add a member to a group
   * @param {string} groupId - Group ID
   * @param {string} userId - User ID to add
   * @returns {Promise} API response with updated group
   */
  async addMember(groupId, userId) {
    const response = await apiClient.post(`/groups/${groupId}/members`, { userId })
    return response.data
  },

  /**
   * Remove a member from a group
   * @param {string} groupId - Group ID
   * @param {string} userId - User ID to remove
   * @returns {Promise} API response with updated group
   */
  async removeMember(groupId, userId) {
    const response = await apiClient.delete(`/groups/${groupId}/members`, { 
      data: { userId } 
    })
    return response.data
  },

  /**
   * Get balances for all members in a group
   * @param {string} groupId - Group ID
   * @returns {Promise} API response with balance array [{user, balance}]
   */
  async getBalances(groupId) {
    const response = await apiClient.get(`/groups/${groupId}/balances`)
    return response.data
  },

  /**
   * Get simplified debts (minimum transactions to settle all balances)
   * Uses debt simplification and circular debt cancellation
   * @param {string} groupId - Group ID
   * @returns {Promise} API response with {transactions, transactionCount, summary}
   */
  async getSimplifiedDebts(groupId) {
    const response = await apiClient.get(`/groups/${groupId}/simplified-debts`)
    return response.data
  },

  /**
   * Check group zero-sum integrity
   * Verifies all balances sum to zero and expenses are valid
   * @param {string} groupId - Group ID
   * @returns {Promise} API response with {valid, issues, totalBalance, message}
   */
  async checkIntegrity(groupId) {
    const response = await apiClient.get(`/groups/${groupId}/integrity`)
    return response.data
  }
})

// Default instance for app usage
export const groupService = createGroupService()

export default groupService
