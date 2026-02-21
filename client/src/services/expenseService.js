import api from './api'

export const createExpenseService = (apiClient = api) => ({
  async getByGroup(groupId) {
    const response = await apiClient.get(`/groups/${groupId}/expenses`)
    return response.data
  },

  async getById(id) {
    const response = await apiClient.get(`/expenses/${id}`)
    return response.data
  },

  async create(expenseData) {
    const response = await apiClient.post('/expenses', expenseData)
    return response.data
  },

  async update(id, expenseData) {
    const response = await apiClient.put(`/expenses/${id}`, expenseData)
    return response.data
  },

  async delete(id) {
    const response = await apiClient.delete(`/expenses/${id}`)
    return response.data
  },

  async getGroupBalances(groupId) {
    const response = await apiClient.get(`/groups/${groupId}/balances`)
    return response.data
  }
})

export const expenseService = createExpenseService()
export default expenseService
