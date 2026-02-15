import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useExpensesStore = defineStore('expenses', () => {
  const expenses = ref([])
  const loading = ref(false)
  const error = ref(null)

  const totalOwed = computed(() => {
    return expenses.value
      .filter(e => e.type === 'owed')
      .reduce((sum, e) => sum + e.amount, 0)
  })

  const totalOwe = computed(() => {
    return expenses.value
      .filter(e => e.type === 'owe')
      .reduce((sum, e) => sum + e.amount, 0)
  })

  const balance = computed(() => totalOwed.value - totalOwe.value)

  function setExpenses(data) {
    expenses.value = data
  }

  function addExpense(expense) {
    expenses.value.push(expense)
  }

  function updateExpense(id, updatedExpense) {
    const index = expenses.value.findIndex(e => e._id === id)
    if (index !== -1) {
      expenses.value[index] = { ...expenses.value[index], ...updatedExpense }
    }
  }

  function removeExpense(id) {
    expenses.value = expenses.value.filter(e => e._id !== id)
  }

  function setLoading(value) {
    loading.value = value
  }

  function setError(err) {
    error.value = err
  }

  return {
    expenses,
    loading,
    error,
    totalOwed,
    totalOwe,
    balance,
    setExpenses,
    addExpense,
    updateExpense,
    removeExpense,
    setLoading,
    setError
  }
})
