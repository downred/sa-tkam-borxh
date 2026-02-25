import api from './api'

 
export const createFriendService = (apiClient = api) => ({
   
  async getAll() {
    const response = await apiClient.get('/friends')
    return response.data
  },

   
  async add(email) {
    const response = await apiClient.post('/friends', { email })
    return response.data
  },

   
  async remove(friendId) {
    const response = await apiClient.delete(`/friends/${friendId}`)
    return response.data
  }
})

export default createFriendService()
