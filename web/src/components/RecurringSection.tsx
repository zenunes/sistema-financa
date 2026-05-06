import { useState } from 'react'
import type { Category, RecurringTransaction, TransactionType } from '../types/finance'
import { RecurringForm } from './RecurringForm'
import { RecurringList } from './RecurringList'

interface RecurringSectionProps {
  categories: Category[]
  recurringTransactions: RecurringTransaction[]
  selectedMonth: string
  generating: boolean
  onGenerateMonth: (month: string) => Promise<void>
  onCreate: (params: {
    description: string
    amount: number
    type: TransactionType
    dueDay: number
    startMonth?: string
    categoryId?: string
    installments?: number
  }) => Promise<void>
  onToggleActive: (id: string, active: boolean) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function RecurringSection({
  categories,
  recurringTransactions,
  selectedMonth,
  generating,
  onGenerateMonth,
  onCreate,
  onToggleActive,
  onDelete,
}: RecurringSectionProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const nowMonth = new Date().toISOString().slice(0, 7)

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
    <section className="card card-recurring">
      <div className="section-head">
        <h2>Despesas e Receitas Recorrentes</h2>
        <div className="section-actions">
          <button
            type="button"
            className="ghost"
            onClick={() => onGenerateMonth(nowMonth)}
            disabled={generating}
          >
            {generating ? 'Gerando...' : `Gerar mês atual (${nowMonth})`}
          </button>
          {selectedMonth !== nowMonth && (
            <button
              type="button"
              className="ghost"
              onClick={() => {
                if (
                  selectedMonth > nowMonth &&
                  !window.confirm(
                    `Isso vai gerar lançamentos recorrentes para ${selectedMonth}. Quer continuar?`,
                  )
                ) {
                  return
                }
                onGenerateMonth(selectedMonth)
              }}
              disabled={generating}
            >
              {generating ? 'Gerando...' : `Gerar para ${selectedMonth}`}
            </button>
          )}
        </div>
      </div>

      <div className="alert-info">
        Cadastre contas fixas ou receitas mensais aqui. O sistema gera automaticamente no início de cada mês, e você pode gerar manualmente quando quiser.
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
