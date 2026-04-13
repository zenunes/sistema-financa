import { useState } from 'react'
import type { Category, RecurringTransaction, TransactionType } from '../types/finance'
import { RecurringForm } from './RecurringForm'
import { RecurringList } from './RecurringList'

interface RecurringSectionProps {
  categories: Category[]
  recurringTransactions: RecurringTransaction[]
  onCreate: (params: {
    description: string
    amount: number
    type: TransactionType
    dueDay: number
    categoryId?: string
    installments?: number
  }) => Promise<void>
  onToggleActive: (id: string, active: boolean) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function RecurringSection({
  categories,
  recurringTransactions,
  onCreate,
  onToggleActive,
  onDelete,
}: RecurringSectionProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null)

  async function handleToggleActive(id: string, active: boolean) {
    setLoadingId(id)
    try {
      await onToggleActive(id, active)
    } finally {
      setLoadingId(null)
    }
  }

  async function handleDelete(id: string) {
    setLoadingId(id)
    try {
      await onDelete(id)
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <section className="card">
      <div className="recurring-card-header" style={{ padding: '0 0 1rem 0' }}>
        <h2>Despesas e Receitas Recorrentes</h2>
      </div>

      <div className="alert-info">
        Cadastre contas fixas ou receitas mensais aqui. O sistema vai gerar automaticamente as pendências na lista principal de lançamentos no início de cada mês.
      </div>

      <RecurringForm categories={categories} onSubmit={onCreate} submitting={false} />

      <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Lista de Recorrências</h3>
      <RecurringList
        recurringTransactions={recurringTransactions}
        onToggleActive={handleToggleActive}
        onDelete={handleDelete}
        loadingId={loadingId}
      />
    </section>
  )
}
