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
    categoryId?: string
    transactionDate: string
  }) => Promise<void>
  onDelete: (id: string) => Promise<void>
  isCreating?: boolean
}

export function TransactionSection({
  categories,
  transactions,
  onCreate,
  onDelete,
  isCreating = false,
}: TransactionSectionProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(id: string) {
    setDeletingId(id)
    try {
      await onDelete(id)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section className="card">
      <h2>Lançamentos</h2>
      <TransactionForm categories={categories} onSubmit={onCreate} submitting={isCreating} />
      <TransactionList
        transactions={transactions}
        onDelete={handleDelete}
        deletingId={deletingId}
      />
    </section>
  )
}
