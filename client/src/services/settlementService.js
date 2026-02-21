import api from './api'

export const createSettlementService = (apiClient = api) => ({
  async getByGroup(groupId) {
    const response = await apiClient.get(`/groups/${groupId}/settlements`)
    return response.data
  },

  async create(settlementData) {
    const response = await apiClient.post('/settlements', settlementData)
    return response.data
  },

  async delete(id) {
    const response = await apiClient.delete(`/settlements/${id}`)
    return response.data
  }
})

export const settlementService = createSettlementService()
export default settlementService
