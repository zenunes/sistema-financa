import { formatCurrency } from '../lib/format'
import type { RecurringTransaction } from '../types/finance'

interface RecurringListProps {
  recurringTransactions: RecurringTransaction[]
  onToggleActive: (id: string, active: boolean) => void
  onDelete: (id: string) => void
  loadingId?: string | null
}

export function RecurringList({
  recurringTransactions,
  onToggleActive,
  onDelete,
  loadingId,
}: RecurringListProps) {
  if (recurringTransactions.length === 0) {
    return <p className="muted">Nenhuma despesa ou receita recorrente cadastrada.</p>
  }

  return (
    <div className="recurring-cards-grid">
      {recurringTransactions.map((recurring) => {
        const isIncome = recurring.type === 'income'
        const typeClass = isIncome ? 'card-income' : 'card-expense'
        const activeClass = !recurring.active ? 'card-inactive' : ''

        return (
          <div key={recurring.id} className={`recurring-card ${typeClass} ${activeClass}`}>
            <div className="recurring-card-header">
              <h4>{recurring.description}</h4>
              <span className={`badge ${isIncome ? 'badge-green' : 'badge-red'}`}>
                {isIncome ? 'Receita' : 'Despesa'}
              </span>
            </div>
            
            <div className="recurring-card-body">
              <div className="recurring-detail">
                <span className="detail-label">Valor</span>
                <span className={`detail-value ${isIncome ? 'text-success' : 'text-danger'}`}>
                  {formatCurrency(Number(recurring.amount))}
                </span>
              </div>
              <div className="recurring-detail">
                <span className="detail-label">Vencimento</span>
                <span className="detail-value">Dia {recurring.due_day}</span>
              </div>
              <div className="recurring-detail">
                <span className="detail-label">Categoria</span>
                <span className="detail-value">{recurring.category?.name ?? 'Sem categoria'}</span>
              </div>
            </div>

            <div className="recurring-card-footer">
              <button
                type="button"
                className="secondary"
                onClick={() => onToggleActive(recurring.id, !recurring.active)}
                disabled={loadingId === recurring.id}
              >
                {recurring.active ? 'Pausar' : 'Ativar'}
              </button>
              <button
                type="button"
                className="danger"
                onClick={() => onDelete(recurring.id)}
                disabled={loadingId === recurring.id}
              >
                Excluir
              </button>
            </div>
            
            {!recurring.active && (
              <div className="recurring-overlay-paused">
                <span>Pausada</span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
