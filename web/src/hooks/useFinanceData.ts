import { useEffect, useState } from 'react'
import {
  createCategory,
  createGoal,
  createTransaction,
  deleteCategory,
  deleteGoal,
  deleteTransaction,
  fetchFinanceData,
} from '../services/financeService'
import type { Category, Goal, Transaction, TransactionType } from '../types/finance'

/**
 * Hook customizado para encapsular e orquestrar a busca, criação e deleção
 * de todos os dados financeiros. Responsável por manter o estado local em
 * sincronia com a base de dados após cada mutação.
 *
 * @param userId - O ID do usuário para quem os dados devem ser buscados.
 */
export function useFinanceData(userId: string | undefined) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [goals, setGoals] = useState<Goal[]>([])

  async function loadData(id: string) {
    setError('')
    setLoading(true)

    try {
      const data = await fetchFinanceData(id)
      setTransactions(data.transactions)
      setCategories(data.categories)
      setGoals(data.goals)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Erro ao carregar dados.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!userId) {
      setTransactions([])
      setCategories([])
      setGoals([])
      setLoading(false)
      return
    }

    loadData(userId)
  }, [userId])

  async function handleCreateTransaction(params: {
    description: string
    amount: number
    type: TransactionType
    categoryId?: string
    transactionDate: string
  }) {
    if (!userId) return

    try {
      await createTransaction({ ...params, userId })
      await loadData(userId)
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Erro ao criar lançamento.')
    }
  }

  async function handleDeleteTransaction(id: string) {
    if (!userId) return

    try {
      await deleteTransaction(id)
      await loadData(userId)
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Erro ao excluir lançamento.')
    }
  }

  async function handleCreateCategory(params: { name: string; type: TransactionType }) {
    if (!userId) return

    try {
      await createCategory({ ...params, userId })
      await loadData(userId)
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Erro ao criar categoria.')
    }
  }

  async function handleDeleteCategory(id: string) {
    if (!userId) return

    try {
      await deleteCategory(id)
      await loadData(userId)
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Erro ao excluir categoria.')
    }
  }

  async function handleCreateGoal(params: {
    title: string
    targetAmount: number
    currentAmount: number
    dueDate?: string
  }) {
    if (!userId) return

    try {
      await createGoal({ ...params, userId })
      await loadData(userId)
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Erro ao criar meta.')
    }
  }

  async function handleDeleteGoal(id: string) {
    if (!userId) return

    try {
      await deleteGoal(id)
      await loadData(userId)
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Erro ao excluir meta.')
    }
  }

  return {
    loading,
    error,
    setError,
    transactions,
    categories,
    goals,
    handleCreateTransaction,
    handleDeleteTransaction,
    handleCreateCategory,
    handleDeleteCategory,
    handleCreateGoal,
    handleDeleteGoal,
  }
}
