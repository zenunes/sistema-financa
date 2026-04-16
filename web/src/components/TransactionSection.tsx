import { useState } from 'react'
import type { Category, Transaction, TransactionType } from '../types/finance'
import { exportTransactionsCsv, exportTransactionsPdf } from '../lib/export'
import { TransactionForm } from './TransactionForm'
import { TransactionList } from './TransactionList'

interface TransactionSectionProps {
  categories: Category[]
  transactions: Transaction[]
  month: string
  onCreate: (params: {
    description: string
    amount: number
    type: TransactionType
    status: 'pending' | 'paid'
    categoryId?: string
    transactionDate: string
  }) => Promise<void>
  onUpdate: (id: string, params: {
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
  month,
  onCreate,
  onUpdate,
  onDelete,
  onToggleStatus,
  isCreating = false,
}: TransactionSectionProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)

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

  async function handleUpdate(params: any) {
    if (!editingTransaction) return
    await onUpdate(editingTransaction.id, params)
    setEditingTransaction(null)
  }

  return (
    <section className="card">
      <div className="section-head">
        <h2>Lançamentos</h2>
        <div className="section-actions">
          <button
            type="button"
            className="ghost"
            onClick={() => exportTransactionsCsv(transactions, month)}
            disabled={transactions.length === 0}
          >
            Exportar CSV
          </button>
          <button
            type="button"
            className="ghost"
            onClick={() => exportTransactionsPdf(transactions, month)}
            disabled={transactions.length === 0}
          >
            Exportar PDF
          </button>
        </div>
      </div>

      {editingTransaction ? (
        <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'var(--surface-alt)', borderRadius: 'var(--radius)', border: '1px solid var(--accent)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, color: 'var(--accent)' }}>Editar Lançamento</h3>
            <button type="button" className="ghost" onClick={() => setEditingTransaction(null)}>Cancelar</button>
          </div>
          <TransactionForm 
            categories={categories} 
            onSubmit={handleUpdate} 
            submitting={false}
            defaultValues={{
              description: editingTransaction.description,
              amount: editingTransaction.amount.toString(),
              type: editingTransaction.type,
              status: editingTransaction.status,
              categoryId: editingTransaction.category_id || undefined,
              transactionDate: editingTransaction.transaction_date,
            }}
          />
        </div>
      ) : (
        <TransactionForm categories={categories} onSubmit={onCreate} submitting={isCreating} />
      )}

      <TransactionList
        transactions={transactions}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
        onEdit={setEditingTransaction}
        loadingId={loadingId}
      />
    </section>
  )
}
