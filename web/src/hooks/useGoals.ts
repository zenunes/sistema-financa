import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Goal } from '../types/finance'
import { financeKeys } from './financeKeys'

async function fetchGoals(userId: string) {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as Goal[]
}

export function useGoals(userId: string | undefined) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: financeKeys.goals(userId),
    queryFn: () => fetchGoals(userId!),
    enabled: !!userId,
  })

  const createMutation = useMutation({
    mutationFn: async (params: {
      title: string
      targetAmount: number
      currentAmount: number
      dueDate?: string
    }) => {
      const { error } = await supabase.from('goals').insert({
        user_id: userId!,
        title: params.title,
        target_amount: params.targetAmount,
        current_amount: params.currentAmount,
        due_date: params.dueDate || null,
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.goals(userId) })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('goals').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.goals(userId) })
    },
  })

  const addFundsMutation = useMutation({
    mutationFn: async ({ id, amount }: { id: string; amount: number }) => {
      // Obter meta atual
      const { data: goalData, error: fetchError } = await supabase
        .from('goals')
        .select('current_amount')
        .eq('id', id)
        .single()

      if (fetchError) throw new Error(`Falha ao buscar meta: ${fetchError.message}`)

      const newAmount = Number(goalData.current_amount) + amount

      const { error: updateError } = await supabase
        .from('goals')
        .update({ current_amount: newAmount })
        .eq('id', id)

      if (updateError) throw new Error(updateError.message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.goals(userId) })
    },
  })

  return {
    goals: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    createGoal: createMutation.mutateAsync,
    deleteGoal: deleteMutation.mutateAsync,
    addFundsGoal: addFundsMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isAddingFunds: addFundsMutation.isPending,
  }
}
