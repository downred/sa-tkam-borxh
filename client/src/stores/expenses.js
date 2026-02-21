import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { expenseService } from '../services/expenseService'
import { settlementService } from '../services/settlementService'

export const useExpensesStore = defineStore('expenses', () => {
  const expenses = ref([])
  const balances = ref([])
  const settlements = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchGroupExpenses(groupId) {
    loading.value = true
    error.value = null
    try {
      const response = await expenseService.getByGroup(groupId)
      expenses.value = response
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch expenses'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createExpense(expenseData) {
    loading.value = true
    error.value = null
    try {
      const created = await expenseService.create(expenseData)
      expenses.value.unshift(created)
      return created
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to create expense'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteExpense(id) {
    loading.value = true
    error.value = null
    try {
      await expenseService.delete(id)
      expenses.value = expenses.value.filter(e => e._id !== id)
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to delete expense'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchGroupBalances(groupId) {
    loading.value = true
    error.value = null
    try {
      const response = await expenseService.getGroupBalances(groupId)
      balances.value = response
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch balances'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchGroupSettlements(groupId) {
    loading.value = true
    error.value = null
    try {
      const response = await settlementService.getByGroup(groupId)
      settlements.value = response
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch settlements'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createSettlement(settlementData) {
    loading.value = true
    error.value = null
    try {
      const created = await settlementService.create(settlementData)
      settlements.value.unshift(created)
      return created
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to create settlement'
      throw err
    } finally {
      loading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    expenses,
    balances,
    settlements,
    loading,
    error,
    fetchGroupExpenses,
    createExpense,
    deleteExpense,
    fetchGroupBalances,
    fetchGroupSettlements,
    createSettlement,
    clearError
  }
})
