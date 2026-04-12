import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Category, TransactionType } from '../types/finance'
import { financeKeys } from './financeKeys'

async function fetchCategories(userId: string) {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', userId)
    .order('name', { ascending: true })

  if (error) throw error
  return (data ?? []) as Category[]
}

export function useCategories(userId: string | undefined) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: financeKeys.categories(userId),
    queryFn: () => fetchCategories(userId!),
    enabled: !!userId,
  })

  const createMutation = useMutation({
    mutationFn: async (params: { name: string; type: TransactionType }) => {
      const { error } = await supabase.from('categories').insert({
        user_id: userId!,
        name: params.name,
        type: params.type,
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.categories(userId) })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('categories').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.categories(userId) })
      // Invalidar transações e recorrências que dependem de categorias
      queryClient.invalidateQueries({ queryKey: financeKeys.transactions(userId) })
      queryClient.invalidateQueries({ queryKey: financeKeys.recurring(userId) })
    },
  })

  return {
    categories: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    createCategory: createMutation.mutateAsync,
    deleteCategory: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}
