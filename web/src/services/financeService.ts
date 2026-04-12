import { supabase } from '../lib/supabase'
import type {
  Category,
  Goal,
  RecurringTransaction,
  Transaction,
  TransactionType,
} from '../types/finance'

/**
 * Busca todos os dados financeiros do usuário simultaneamente.
 * Utiliza Promise.allSettled para garantir que uma falha isolada
 * (ex: erro ao buscar metas) não impeça o carregamento de outras entidades.
 *
 * @param userId - O ID do usuário autenticado no Supabase.
 * @returns Um objeto contendo arrays de transações, categorias, metas e recorrências.
 */
export async function fetchFinanceData(userId: string) {
  const [transactionsResult, categoriesResult, goalsResult, recurringResult] = await Promise.allSettled([
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
    supabase
      .from('recurring_transactions')
      .select('*, category:categories(*)')
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
    recurringTransactions: getSafeData<RecurringTransaction>(recurringResult, 'recorrências'),
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
 * Cria uma transação recorrente associada ao usuário.
 */
export async function createRecurringTransaction(params: {
  userId: string
  description: string
  amount: number
  type: TransactionType
  dueDay: number
  categoryId?: string
}) {
  const { error } = await supabase.from('recurring_transactions').insert({
    user_id: params.userId,
    description: params.description,
    amount: params.amount,
    type: params.type,
    due_day: params.dueDay,
    category_id: params.categoryId ?? null,
    active: true,
  })

  if (error) throw error
}

export async function toggleRecurringTransaction(id: string, active: boolean) {
  const { error } = await supabase.from('recurring_transactions').update({ active }).eq('id', id)
  if (error) throw error
}

export async function deleteRecurringTransaction(id: string) {
  const { error } = await supabase.from('recurring_transactions').delete().eq('id', id)
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

function toMonthRange(month: string) {
  const [yearText, monthText] = month.split('-')
  const year = Number(yearText)
  const monthIndex = Number(monthText) - 1
  const monthStart = new Date(Date.UTC(year, monthIndex, 1))
  const monthEnd = new Date(Date.UTC(year, monthIndex + 1, 0))
  return { monthStart, monthEnd }
}

function toDateString(date: Date) {
  return date.toISOString().slice(0, 10)
}

export async function generateRecurringTransactionsForMonth(userId: string, month: string) {
  const { monthStart, monthEnd } = toMonthRange(month)
  const monthStartText = toDateString(monthStart)

  const { data: recurringData, error: recurringError } = await supabase
    .from('recurring_transactions')
    .select('*')
    .eq('user_id', userId)
    .eq('active', true)

  if (recurringError) throw recurringError
  if (!recurringData || recurringData.length === 0) return 0

  const recurringIds = recurringData.map((item) => item.id)
  const { data: existingData, error: existingError } = await supabase
    .from('transactions')
    .select('recurring_source_id')
    .eq('user_id', userId)
    .eq('recurrence_month', monthStartText)
    .in('recurring_source_id', recurringIds)

  if (existingError) throw existingError

  const existingIds = new Set(
    (existingData ?? [])
      .map((item) => item.recurring_source_id)
      .filter((value): value is string => typeof value === 'string'),
  )

  const inserts = recurringData
    .filter((item) => !existingIds.has(item.id))
    .map((item) => {
      const dueDay = Math.min(Number(item.due_day), monthEnd.getUTCDate())
      const transactionDate = new Date(
        Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth(), dueDay),
      )

      return {
        user_id: userId,
        category_id: item.category_id ?? null,
        recurring_source_id: item.id,
        recurrence_month: monthStartText,
        description: item.description,
        amount: item.amount,
        type: item.type,
        transaction_date: toDateString(transactionDate),
      }
    })

  if (inserts.length === 0) return 0

  const { error: insertError } = await supabase.from('transactions').insert(inserts)
  if (insertError) throw insertError

  return inserts.length
}
