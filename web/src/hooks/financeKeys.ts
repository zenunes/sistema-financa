export const financeKeys = {
  all: ['finance'] as const,
  transactions: (userId: string | undefined) => [...financeKeys.all, 'transactions', userId] as const,
  categories: (userId: string | undefined) => [...financeKeys.all, 'categories', userId] as const,
  goals: (userId: string | undefined) => [...financeKeys.all, 'goals', userId] as const,
  recurring: (userId: string | undefined) => [...financeKeys.all, 'recurring', userId] as const,
}
