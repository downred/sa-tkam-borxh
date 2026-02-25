import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useGroupsStore } from '../groups'
import { groupService } from '../../services/groupService'

vi.mock('../../services/groupService', () => ({
  groupService: {
    getAll: vi.fn(),
    getTotalBalance: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    addMember: vi.fn(),
    removeMember: vi.fn()
  }
}))

describe('Groups Store', () => {
  let store

  beforeEach(() => {
    
    setActivePinia(createPinia())
    store = useGroupsStore()
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should have correct initial values', () => {
      expect(store.groups).toEqual([])
      expect(store.currentGroup).toBeNull()
      expect(store.totalBalance).toBe(0)
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
    })
  })

  describe('fetchGroups', () => {
    it('should fetch groups and total balance successfully', async () => {
      const mockGroups = [
        { _id: '1', name: 'Group 1' },
        { _id: '2', name: 'Group 2' }
      ]
      const mockBalanceData = {
        data: { balance: 100.50 }
      }

      groupService.getAll.mockResolvedValue({ data: mockGroups })
      groupService.getTotalBalance.mockResolvedValue(mockBalanceData)

      await store.fetchGroups()

      expect(store.groups).toEqual(mockGroups)
      expect(store.totalBalance).toBe(100.50)
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('should set error on failure', async () => {
      groupService.getAll.mockRejectedValue({
        response: { data: { error: 'Failed to fetch groups' } }
      })

      await expect(store.fetchGroups()).rejects.toThrow()
      expect(store.error).toBe('Failed to fetch groups')
      expect(store.loading).toBe(false)
    })

    it('should handle error without response', async () => {
      groupService.getAll.mockRejectedValue(new Error('Network error'))

      await expect(store.fetchGroups()).rejects.toThrow()
      expect(store.error).toBe('Failed to fetch groups')
    })
  })

  describe('fetchTotalBalance', () => {
    it('should fetch total balance successfully', async () => {
      const mockBalanceData = {
        data: { balance: 250.75 }
      }
      groupService.getTotalBalance.mockResolvedValue(mockBalanceData)

      await store.fetchTotalBalance()

      expect(store.totalBalance).toBe(250.75)
      expect(groupService.getTotalBalance).toHaveBeenCalled()
    })

    it('should set balance to 0 on error', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      groupService.getTotalBalance.mockRejectedValue(new Error('Failed to fetch'))

      await store.fetchTotalBalance()

      expect(store.totalBalance).toBe(0)
      expect(consoleErrorSpy).toHaveBeenCalled()
      consoleErrorSpy.mockRestore()
    })

    it('should handle negative balance (user owes money)', async () => {
      const mockBalanceData = {
        data: { balance: -50.25 }
      }
      groupService.getTotalBalance.mockResolvedValue(mockBalanceData)

      await store.fetchTotalBalance()

      expect(store.totalBalance).toBe(-50.25)
    })

    it('should handle zero balance (all settled)', async () => {
      const mockBalanceData = {
        data: { balance: 0 }
      }
      groupService.getTotalBalance.mockResolvedValue(mockBalanceData)

      await store.fetchTotalBalance()

      expect(store.totalBalance).toBe(0)
    })
  })

  describe('fetchGroup', () => {
    it('should fetch a single group by ID', async () => {
      const mockGroup = { _id: '123', name: 'Test Group' }
      groupService.getById.mockResolvedValue({ data: mockGroup })

      const result = await store.fetchGroup('123')

      expect(store.currentGroup).toEqual(mockGroup)
      expect(result).toEqual(mockGroup)
      expect(store.loading).toBe(false)
    })

    it('should set error on failure', async () => {
      groupService.getById.mockRejectedValue({
        response: { data: { error: 'Group not found' } }
      })

      await expect(store.fetchGroup('999')).rejects.toThrow()
      expect(store.error).toBe('Group not found')
    })
  })

  describe('createGroup', () => {
    it('should create a new group', async () => {
      const groupData = { name: 'New Group', type: 'Trip' }
      const mockCreatedGroup = { _id: '456', ...groupData }
      groupService.create.mockResolvedValue({ data: mockCreatedGroup })

      const result = await store.createGroup(groupData)

      expect(store.groups[0]).toEqual(mockCreatedGroup)
      expect(result).toEqual(mockCreatedGroup)
    })

    it('should handle creation errors', async () => {
      groupService.create.mockRejectedValue({
        response: { data: { error: 'Invalid group data' } }
      })

      await expect(store.createGroup({})).rejects.toThrow()
      expect(store.error).toBe('Invalid group data')
    })
  })

  describe('updateGroup', () => {
    it('should update an existing group in the list', async () => {
      const mockGroup = { _id: '123', name: 'Old Name' }
      store.groups = [mockGroup]
      
      const updatedGroup = { _id: '123', name: 'New Name' }
      groupService.update.mockResolvedValue({ data: updatedGroup })

      await store.updateGroup('123', { name: 'New Name' })

      expect(store.groups[0].name).toBe('New Name')
    })

    it('should update currentGroup if it matches', async () => {
      store.currentGroup = { _id: '123', name: 'Old Name' }
      const updatedGroup = { _id: '123', name: 'New Name' }
      groupService.update.mockResolvedValue({ data: updatedGroup })

      await store.updateGroup('123', { name: 'New Name' })

      expect(store.currentGroup.name).toBe('New Name')
    })
  })

  describe('deleteGroup', () => {
    it('should remove group from the list', async () => {
      store.groups = [
        { _id: '1', name: 'Group 1' },
        { _id: '2', name: 'Group 2' }
      ]
      groupService.delete.mockResolvedValue({ success: true })

      await store.deleteGroup('1')

      expect(store.groups).toHaveLength(1)
      expect(store.groups[0]._id).toBe('2')
    })

    it('should clear currentGroup if it matches deleted group', async () => {
      store.currentGroup = { _id: '123', name: 'Test Group' }
      groupService.delete.mockResolvedValue({ success: true })

      await store.deleteGroup('123')

      expect(store.currentGroup).toBeNull()
    })
  })

  describe('addMember', () => {
    it('should update group with new member', async () => {
      store.groups = [{ _id: '123', members: ['user1'] }]
      const updatedGroup = { _id: '123', members: ['user1', 'user2'] }
      groupService.addMember.mockResolvedValue({ data: updatedGroup })

      await store.addMember('123', 'user2')

      expect(store.groups[0].members).toHaveLength(2)
    })
  })

  describe('removeMember', () => {
    it('should update group with member removed', async () => {
      store.groups = [{ _id: '123', members: ['user1', 'user2'] }]
      const updatedGroup = { _id: '123', members: ['user1'] }
      groupService.removeMember.mockResolvedValue({ data: updatedGroup })

      await store.removeMember('123', 'user2')

      expect(store.groups[0].members).toHaveLength(1)
    })
  })

  describe('computed properties', () => {
    beforeEach(() => {
      store.groups = [
        { _id: '1', type: 'Trip', name: 'Paris Trip' },
        { _id: '2', type: 'Subscription', name: 'Netflix' },
        { _id: '3', type: 'Trip', name: 'Beach Trip' },
        { _id: '4', type: 'Home', name: 'Apartment' }
      ]
    })

    it('tripGroups should return only Trip type groups', () => {
      expect(store.tripGroups).toHaveLength(2)
      expect(store.tripGroups.every(g => g.type === 'Trip')).toBe(true)
    })

    it('subscriptionGroups should return only Subscription type groups', () => {
      expect(store.subscriptionGroups).toHaveLength(1)
      expect(store.subscriptionGroups[0].type).toBe('Subscription')
    })
  })

  describe('clearError', () => {
    it('should clear the error message', () => {
      store.error = 'Some error'
      store.clearError()
      expect(store.error).toBeNull()
    })
  })
})
