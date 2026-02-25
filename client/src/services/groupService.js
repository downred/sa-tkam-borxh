import api from './api'

 
export const createGroupService = (apiClient = api) => ({
   
  async getAll() {
    const response = await apiClient.get('/groups')
    return response.data
  },

   
  async getTotalBalance() {
    const response = await apiClient.get('/groups/balance/total')
    return response.data
  },

   
  async getById(id) {
    const response = await apiClient.get(`/groups/${id}`)
    return response.data
  },

   
  async create(groupData) {
    const response = await apiClient.post('/groups', groupData)
    return response.data
  },

   
  async update(id, groupData) {
    const response = await apiClient.put(`/groups/${id}`, groupData)
    return response.data
  },

   
  async delete(id) {
    const response = await apiClient.delete(`/groups/${id}`)
    return response.data
  },

   
  async addMember(groupId, userId, email) {
    const payload = userId ? { userId } : { email }
    const response = await apiClient.post(`/groups/${groupId}/members`, payload)
    return response.data
  },

   
  async removeMember(groupId, userId) {
    const response = await apiClient.delete(`/groups/${groupId}/members`, { 
      data: { userId } 
    })
    return response.data
  },

   
  async getBalances(groupId) {
    const response = await apiClient.get(`/groups/${groupId}/balances`)
    return response.data
  },

   
  async getSimplifiedDebts(groupId) {
    const response = await apiClient.get(`/groups/${groupId}/simplified-debts`)
    return response.data
  },

   
  async checkIntegrity(groupId) {
    const response = await apiClient.get(`/groups/${groupId}/integrity`)
    return response.data
  }
})

export const groupService = createGroupService()

export default groupService
