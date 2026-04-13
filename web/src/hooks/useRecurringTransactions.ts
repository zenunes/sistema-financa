import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { RecurringTransaction, TransactionType } from '../types/finance'
import { financeKeys } from './financeKeys'

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

  if (recurringError) throw new Error(`Falha ao buscar recorrências ativas: ${recurringError.message}`)
  if (!recurringData || recurringData.length === 0) return 0

  // Filtrar recorrências que já atingiram o limite de parcelas
  const validRecurringData = recurringData.filter(
    (item) => item.installments === null || item.generated_installments < item.installments
  )

  if (validRecurringData.length === 0) return 0

  const recurringIds = validRecurringData.map((item) => item.id)
  const { data: existingData, error: existingError } = await supabase
    .from('transactions')
    .select('recurring_source_id')
    .eq('user_id', userId)
    .eq('recurrence_month', monthStartText)
    .not('recurring_source_id', 'is', null)
    .in('recurring_source_id', recurringIds)

  if (existingError) throw new Error(`Falha ao verificar transações existentes: ${existingError.message}`)

  const existingIds = new Set(
    (existingData ?? [])
      .map((item) => item.recurring_source_id)
      .filter((value): value is string => typeof value === 'string'),
  )

  const toGenerate = validRecurringData.filter((item) => !existingIds.has(item.id))
  
  if (toGenerate.length === 0) return 0

  const inserts = toGenerate.map((item) => {
      const dueDay = Math.min(Number(item.due_day), monthEnd.getUTCDate())
      const transactionDate = new Date(
        Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth(), dueDay),
      )

      return {
        user_id: userId,
        category_id: item.category_id || null,
        recurring_source_id: item.id || null,
        recurrence_month: monthStartText,
        description: item.installments 
          ? `${item.description} (${item.generated_installments + 1}/${item.installments})` 
          : item.description,
        amount: item.amount,
        type: item.type,
        status: 'pending',
        transaction_date: toDateString(transactionDate),
      }
    })

  const { error: insertError } = await supabase.from('transactions').insert(inserts)
  if (insertError) throw new Error(`Falha ao inserir os novos lançamentos recorrentes: ${insertError.message}`)

  // Incrementar parcelas geradas e desativar se atingiu o limite
  for (const item of toGenerate) {
    if (item.installments) {
      const newGenerated = item.generated_installments + 1
      const active = newGenerated < item.installments
      
      await supabase
        .from('recurring_transactions')
        .update({ 
          generated_installments: newGenerated,
          active 
        })
        .eq('id', item.id)
    }
  }

  return inserts.length
}

async function fetchRecurringTransactions(userId: string) {
  const { data, error } = await supabase
    .from('recurring_transactions')
    .select('*, category:categories(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as RecurringTransaction[]
}

export function useRecurringTransactions(userId: string | undefined) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: financeKeys.recurring(userId),
    queryFn: () => fetchRecurringTransactions(userId!),
    enabled: !!userId,
  })

  const createMutation = useMutation({
    mutationFn: async (params: {
      description: string
      amount: number
      type: TransactionType
      dueDay: number
      categoryId?: string
      installments?: number
    }) => {
      const { error } = await supabase.from('recurring_transactions').insert({
        user_id: userId!,
        description: params.description,
        amount: params.amount,
        type: params.type,
        due_day: params.dueDay,
        category_id: params.categoryId || null,
        active: true,
        installments: params.installments ?? null,
        generated_installments: 0,
      })
      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.recurring(userId) })
    },
  })

  const toggleMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from('recurring_transactions').update({ active }).eq('id', id)
      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.recurring(userId) })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('recurring_transactions').delete().eq('id', id)
      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.recurring(userId) })
    },
  })

  const generateMutation = useMutation({
    mutationFn: async (month: string) => {
      return await generateRecurringTransactionsForMonth(userId!, month)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.transactions(userId) })
    },
  })

  return {
    recurringTransactions: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    createRecurringTransaction: createMutation.mutateAsync,
    toggleRecurringTransaction: toggleMutation.mutateAsync,
    deleteRecurringTransaction: deleteMutation.mutateAsync,
    generateRecurringTransactions: generateMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isToggling: toggleMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isGenerating: generateMutation.isPending,
  }
}
