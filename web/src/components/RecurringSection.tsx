import { useState } from 'react'
import type { Category, RecurringTransaction, TransactionType } from '../types/finance'
import { RecurringForm } from './RecurringForm'
import { RecurringList } from './RecurringList'

interface RecurringSectionProps {
  categories: Category[]
  recurringTransactions: RecurringTransaction[]
  month: string
  generating: boolean
  onGenerateMonth: () => Promise<void>
  onCreate: (params: {
    description: string
    amount: number
    type: TransactionType
    dueDay: number
    categoryId?: string
  }) => Promise<void>
  onToggleActive: (id: string, active: boolean) => Promise<void>
  onDelete: (id: string) => Promise<void>
  isCreating?: boolean
}

export function RecurringSection({
  categories,
  recurringTransactions,
  month,
  generating,
  onGenerateMonth,
  onCreate,
  onToggleActive,
  onDelete,
  isCreating = false,
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
    <section className="card card-recurring" style={{ marginBottom: '2rem' }}>
      <div className="card-header">
        <h2>
          Despesas e Receitas Recorrentes
        </h2>
        <button type="button" className="accent" onClick={onGenerateMonth} disabled={generating}>
          {generating ? 'Gerando...' : `⚡ Gerar para ${month}`}
        </button>
      </div>
      
      <div className="alert-info">
        Cadastre contas fixas ou receitas mensais aqui. Clique em <strong>"Gerar para {month}"</strong> para lançá-las
        na lista principal de lançamentos sem duplicar.
      </div>

      <RecurringForm categories={categories} onSubmit={onCreate} submitting={isCreating} />

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
