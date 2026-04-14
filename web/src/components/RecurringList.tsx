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
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Descrição</th>
            <th>Tipo</th>
            <th>Vencimento</th>
            <th>Categoria</th>
            <th>Repetição</th>
            <th>Valor</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {recurringTransactions.map((recurring) => {
            const isIncome = recurring.type === 'income'
            const isActive = recurring.active

            return (
              <tr key={recurring.id} style={{ opacity: isActive ? 1 : 0.6 }}>
                <td>
                  {recurring.description}
                  {!isActive && <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block', fontWeight: 600 }}>Pausada</span>}
                </td>
                <td>
                  <span className={`badge ${isIncome ? 'badge-green' : 'badge-red'}`}>
                    {isIncome ? 'Receita' : 'Despesa'}
                  </span>
                </td>
                <td>Dia {recurring.due_day}</td>
                <td>{recurring.category?.name ?? '-'}</td>
                <td>
                  {recurring.installments 
                    ? `${recurring.generated_installments} de ${recurring.installments}` 
                    : 'Infinito'}
                </td>
                <td>{formatCurrency(Number(recurring.amount))}</td>
                <td style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="ghost"
                    onClick={() => onToggleActive(recurring.id, !isActive)}
                    disabled={loadingId === recurring.id}
                  >
                    {isActive ? 'Pausar' : 'Retomar'}
                  </button>
                  <button
                    type="button"
                    className="danger"
                    onClick={() => onDelete(recurring.id)}
                    disabled={loadingId === recurring.id}
                  >
                    {loadingId === recurring.id ? '...' : 'Excluir'}
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
