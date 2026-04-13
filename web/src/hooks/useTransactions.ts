import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Transaction, TransactionType } from '../types/finance'
import { financeKeys } from './financeKeys'

async function fetchTransactions(userId: string) {
  const { data, error } = await supabase
    .from('transactions')
    .select('*, category:categories(*)')
    .eq('user_id', userId)
    .order('transaction_date', { ascending: false })

  if (error) throw error
  return (data ?? []) as Transaction[]
}

export function useTransactions(userId: string | undefined) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: financeKeys.transactions(userId),
    queryFn: () => fetchTransactions(userId!),
    enabled: !!userId,
  })

  const createMutation = useMutation({
    mutationFn: async (params: {
      description: string
      amount: number
      type: TransactionType
      status?: 'pending' | 'paid'
      categoryId?: string
      transactionDate: string
    }) => {
      const { error } = await supabase.from('transactions').insert({
        user_id: userId!,
        description: params.description,
        amount: params.amount,
        type: params.type,
        status: params.status ?? 'paid',
        category_id: params.categoryId ?? null,
        transaction_date: params.transactionDate,
      })
      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.transactions(userId) })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('transactions').delete().eq('id', id)
      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.transactions(userId) })
    },
  })

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'pending' | 'paid' }) => {
      const { error } = await supabase.from('transactions').update({ status }).eq('id', id)
      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.transactions(userId) })
    },
  })

  return {
    transactions: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    createTransaction: createMutation.mutateAsync,
    deleteTransaction: deleteMutation.mutateAsync,
    toggleTransactionStatus: toggleStatusMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isTogglingStatus: toggleStatusMutation.isPending,
  }
}
