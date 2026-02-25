import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { groupService } from '../services/groupService'

export const useGroupsStore = defineStore('groups', () => {
  const groups = ref([])
  const currentGroup = ref(null)
  const totalBalance = ref(0)
  const loading = ref(false)
  const error = ref(null)

  const tripGroups = computed(() => 
    groups.value.filter(g => g.type === 'Trip')
  )

  const subscriptionGroups = computed(() => 
    groups.value.filter(g => g.type === 'Subscription')
  )

  async function fetchGroups() {
    loading.value = true
    error.value = null
    try {
      const response = await groupService.getAll()
      groups.value = response.data
      
      await fetchTotalBalance()
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch groups'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchTotalBalance() {
    try {
      const response = await groupService.getTotalBalance()
      totalBalance.value = response.data.balance
    } catch (err) {
      console.error('Failed to fetch total balance:', err)
      totalBalance.value = 0
    }
  }

  async function fetchGroup(id) {
    loading.value = true
    error.value = null
    try {
      const response = await groupService.getById(id)
      currentGroup.value = response.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch group'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createGroup(groupData) {
    loading.value = true
    error.value = null
    try {
      const response = await groupService.create(groupData)
      groups.value.unshift(response.data)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to create group'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateGroup(id, groupData) {
    loading.value = true
    error.value = null
    try {
      const response = await groupService.update(id, groupData)
      const index = groups.value.findIndex(g => g._id === id)
      if (index !== -1) {
        groups.value[index] = response.data
      }
      if (currentGroup.value?._id === id) {
        currentGroup.value = response.data
      }
      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to update group'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteGroup(id) {
    loading.value = true
    error.value = null
    try {
      await groupService.delete(id)
      groups.value = groups.value.filter(g => g._id !== id)
      if (currentGroup.value?._id === id) {
        currentGroup.value = null
      }
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to delete group'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function addMember(groupId, userId) {
    loading.value = true
    error.value = null
    try {
      const response = await groupService.addMember(groupId, userId)
      const index = groups.value.findIndex(g => g._id === groupId)
      if (index !== -1) {
        groups.value[index] = response.data
      }
      if (currentGroup.value?._id === groupId) {
        currentGroup.value = response.data
      }
      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to add member'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function removeMember(groupId, userId) {
    loading.value = true
    error.value = null
    try {
      const response = await groupService.removeMember(groupId, userId)
      const index = groups.value.findIndex(g => g._id === groupId)
      if (index !== -1) {
        groups.value[index] = response.data
      }
      if (currentGroup.value?._id === groupId) {
        currentGroup.value = response.data
      }
      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to remove member'
      throw err
    } finally {
      loading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    groups,
    currentGroup,
    totalBalance,
    loading,
    error,
    tripGroups,
    subscriptionGroups,
    fetchGroups,
    fetchTotalBalance,
    fetchGroup,
    createGroup,
    updateGroup,
    deleteGroup,
    addMember,
    removeMember,
    clearError
  }
})
