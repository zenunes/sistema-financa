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
    <ul className="chip-list">
      {recurringTransactions.map((recurring) => (
        <li key={recurring.id} className={`chip ${!recurring.active ? 'inactive' : ''}`}>
          <div className="chip-info">
            <strong>{recurring.description}</strong>
            <span>Dia {recurring.due_day}</span>
            <span>{formatCurrency(Number(recurring.amount))}</span>
            <span className="chip-badge">
              {recurring.type === 'income' ? 'Receita' : 'Despesa'}
            </span>
            <span className="chip-badge">{recurring.category?.name ?? 'Sem categoria'}</span>
            {!recurring.active && <span className="chip-badge warn">Pausada</span>}
          </div>
          <div className="chip-actions">
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
        </li>
      ))}
    </ul>
  )
}
