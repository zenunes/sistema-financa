import { useEffect, useState } from 'react'
import {
  createCategory,
  createGoal,
  createTransaction,
  deleteCategory,
  deleteGoal,
  deleteTransaction,
  fetchFinanceData,
  createRecurringTransaction,
  toggleRecurringTransaction,
  deleteRecurringTransaction,
  generateRecurringTransactionsForMonth,
} from '../services/financeService'
import type { Category, Goal, Transaction, TransactionType, RecurringTransaction } from '../types/finance'

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
  const [info, setInfo] = useState('')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([])
  const [generatingRecurring, setGeneratingRecurring] = useState(false)
  const currentMonth = new Date().toISOString().slice(0, 7)

  async function loadData(id: string) {
    setError('')
    setInfo('')
    setLoading(true)

    try {
      const data = await fetchFinanceData(id)
      setTransactions(data.transactions)
      setCategories(data.categories)
      setGoals(data.goals)
      setRecurringTransactions(data.recurringTransactions)
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
      setRecurringTransactions([])
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
      setInfo('Lançamento criado com sucesso.')
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Erro ao criar lançamento.')
    }
  }

  async function handleDeleteTransaction(id: string) {
    if (!userId) return

    try {
      await deleteTransaction(id)
      await loadData(userId)
      setInfo('Lançamento excluído.')
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Erro ao excluir lançamento.')
    }
  }

  async function handleCreateCategory(params: { name: string; type: TransactionType }) {
    if (!userId) return

    try {
      await createCategory({ ...params, userId })
      await loadData(userId)
      setInfo('Categoria criada com sucesso.')
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Erro ao criar categoria.')
    }
  }

  async function handleDeleteCategory(id: string) {
    if (!userId) return

    try {
      await deleteCategory(id)
      await loadData(userId)
      setInfo('Categoria excluída.')
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Erro ao excluir categoria.')
    }
  }

  async function handleCreateRecurringTransaction(params: {
    description: string
    amount: number
    type: TransactionType
    dueDay: number
    categoryId?: string
  }) {
    if (!userId) return

    try {
      await createRecurringTransaction({ ...params, userId })
      await loadData(userId)
      setInfo('Recorrência criada com sucesso.')
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Erro ao criar recorrência.')
    }
  }

  async function handleToggleRecurringTransaction(id: string, active: boolean) {
    if (!userId) return

    try {
      await toggleRecurringTransaction(id, active)
      await loadData(userId)
      setInfo(active ? 'Recorrência ativada.' : 'Recorrência pausada.')
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Erro ao atualizar recorrência.')
    }
  }

  async function handleDeleteRecurringTransaction(id: string) {
    if (!userId) return

    try {
      await deleteRecurringTransaction(id)
      await loadData(userId)
      setInfo('Recorrência excluída.')
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Erro ao excluir recorrência.')
    }
  }

  async function handleGenerateRecurringForMonth() {
    if (!userId) return

    setGeneratingRecurring(true)
    try {
      const generatedCount = await generateRecurringTransactionsForMonth(
        userId,
        currentMonth,
      )
      await loadData(userId)
      setInfo(
        generatedCount > 0
          ? `${generatedCount} lançamento(s) recorrente(s) gerado(s) para ${currentMonth}.`
          : `Sem novos lançamentos recorrentes para ${currentMonth}.`,
      )
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Erro ao gerar recorrências.')
    } finally {
      setGeneratingRecurring(false)
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
      setInfo('Meta criada com sucesso.')
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Erro ao criar meta.')
    }
  }

  async function handleDeleteGoal(id: string) {
    if (!userId) return

    try {
      await deleteGoal(id)
      await loadData(userId)
      setInfo('Meta excluída.')
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Erro ao excluir meta.')
    }
  }

  return {
    loading,
    error,
    setError,
    info,
    transactions,
    categories,
    goals,
    recurringTransactions,
    generatingRecurring,
    currentMonth,
    handleCreateTransaction,
    handleDeleteTransaction,
    handleCreateCategory,
    handleDeleteCategory,
    handleCreateGoal,
    handleDeleteGoal,
    handleCreateRecurringTransaction,
    handleToggleRecurringTransaction,
    handleDeleteRecurringTransaction,
    handleGenerateRecurringForMonth,
  }
}
