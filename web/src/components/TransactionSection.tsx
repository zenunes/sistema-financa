import { useState } from 'react'
import type { Category, Transaction, TransactionType } from '../types/finance'
import { TransactionForm } from './TransactionForm'
import { TransactionList } from './TransactionList'

interface TransactionSectionProps {
  categories: Category[]
  transactions: Transaction[]
  onCreate: (params: {
    description: string
    amount: number
    type: TransactionType
    status: 'pending' | 'paid'
    categoryId?: string
    transactionDate: string
  }) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onToggleStatus: (id: string, status: 'pending' | 'paid') => Promise<void>
  isCreating?: boolean
}

export function TransactionSection({
  categories,
  transactions,
  onCreate,
  onDelete,
  onToggleStatus,
  isCreating = false,
}: TransactionSectionProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null)

  async function handleDelete(id: string) {
    setLoadingId(id)
    try {
      await onDelete(id)
    } finally {
      setLoadingId(null)
    }
  }

  async function handleToggleStatus(id: string, currentStatus: 'pending' | 'paid') {
    setLoadingId(id)
    try {
      const newStatus = currentStatus === 'paid' ? 'pending' : 'paid'
      await onToggleStatus(id, newStatus)
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <section className="card">
      <h2>Lançamentos</h2>
      <TransactionForm categories={categories} onSubmit={onCreate} submitting={isCreating} />
      <TransactionList
        transactions={transactions}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
        loadingId={loadingId}
      />
    </section>
  )
}
