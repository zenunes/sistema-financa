export type TransactionType = 'income' | 'expense'

export interface Category {
  id: string
  user_id: string
  name: string
  type: TransactionType
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  category_id: string | null
  recurring_source_id: string | null
  recurrence_month: string | null
  description: string
  amount: number
  type: TransactionType
  transaction_date: string
  created_at: string
  category?: Category | null
}

export interface RecurringTransaction {
  id: string
  user_id: string
  category_id: string | null
  description: string
  amount: number
  type: TransactionType
  due_day: number
  active: boolean
  created_at: string
  category?: Category | null
}

export interface Goal {
  id: string
  user_id: string
  title: string
  target_amount: number
  current_amount: number
  due_date: string | null
  created_at: string
}

export interface FinanceData {
  transactions: Transaction[]
  categories: Category[]
  goals: Goal[]
  recurringTransactions: RecurringTransaction[]
}
