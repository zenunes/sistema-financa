import { supabase } from '../lib/supabase'
import type { Category, Goal, Transaction, TransactionType } from '../types/finance'

/**
 * Busca todos os dados financeiros do usuário simultaneamente.
 * Utiliza Promise.allSettled para garantir que uma falha isolada
 * (ex: erro ao buscar metas) não impeça o carregamento de outras entidades.
 *
 * @param userId - O ID do usuário autenticado no Supabase.
 * @returns Um objeto contendo arrays de transações, categorias e metas.
 */
export async function fetchFinanceData(userId: string) {
  const [transactionsResult, categoriesResult, goalsResult] = await Promise.allSettled([
    supabase
      .from('transactions')
      .select('*, category:categories(*)')
      .eq('user_id', userId)
      .order('transaction_date', { ascending: false }),
    supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true }),
    supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
  ])

  const getSafeData = <T>(
    result: PromiseSettledResult<{ data: any; error: any }>,
    label: string,
  ): T[] => {
    if (result.status === 'fulfilled') {
      if (result.value.error) {
        console.error(`Erro ao buscar ${label}:`, result.value.error)
        return []
      }
      return (result.value.data ?? []) as T[]
    }
    console.error(`Falha na promessa de ${label}:`, result.reason)
    return []
  }

  return {
    transactions: getSafeData<Transaction>(transactionsResult, 'transações'),
    categories: getSafeData<Category>(categoriesResult, 'categorias'),
    goals: getSafeData<Goal>(goalsResult, 'metas'),
  }
}

/**
 * Cria uma nova transação associada ao usuário.
 */
export async function createTransaction(params: {
  userId: string
  description: string
  amount: number
  type: TransactionType
  categoryId?: string
  transactionDate: string
}) {
  const { error } = await supabase.from('transactions').insert({
    user_id: params.userId,
    description: params.description,
    amount: params.amount,
    type: params.type,
    category_id: params.categoryId ?? null,
    transaction_date: params.transactionDate,
  })

  if (error) throw error
}

/**
 * Exclui uma transação através do seu identificador.
 */
export async function deleteTransaction(id: string) {
  const { error } = await supabase.from('transactions').delete().eq('id', id)
  if (error) throw error
}

export async function createCategory(params: {
  userId: string
  name: string
  type: TransactionType
}) {
  const { error } = await supabase.from('categories').insert({
    user_id: params.userId,
    name: params.name,
    type: params.type,
  })

  if (error) throw error
}

export async function deleteCategory(id: string) {
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) throw error
}

export async function createGoal(params: {
  userId: string
  title: string
  targetAmount: number
  currentAmount: number
  dueDate?: string
}) {
  const { error } = await supabase.from('goals').insert({
    user_id: params.userId,
    title: params.title,
    target_amount: params.targetAmount,
    current_amount: params.currentAmount,
    due_date: params.dueDate || null,
  })

  if (error) throw error
}

export async function deleteGoal(id: string) {
  const { error } = await supabase.from('goals').delete().eq('id', id)
  if (error) throw error
}
