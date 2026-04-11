import { supabase } from '../lib/supabase'
import type { Category, Goal, Transaction, TransactionType } from '../types/finance'

export async function fetchFinanceData(userId: string) {
  const [transactionsResult, categoriesResult, goalsResult] = await Promise.all([
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

  if (transactionsResult.error) throw transactionsResult.error
  if (categoriesResult.error) throw categoriesResult.error
  if (goalsResult.error) throw goalsResult.error

  return {
    transactions: (transactionsResult.data ?? []) as Transaction[],
    categories: (categoriesResult.data ?? []) as Category[],
    goals: (goalsResult.data ?? []) as Goal[],
  }
}

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
