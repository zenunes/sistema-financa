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

  const activeExpense = recurringTransactions
    .filter((t) => t.type === 'expense' && t.active)
    .reduce((acc, t) => acc + Number(t.amount), 0)

  const activeIncome = recurringTransactions
    .filter((t) => t.type === 'income' && t.active)
    .reduce((acc, t) => acc + Number(t.amount), 0)

  return (
    <div className="table-wrapper" style={{ display: 'flex', flexDirection: 'column' }}>
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
                <td data-label="Descrição">
                  {recurring.description}
                  {!isActive && <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block', fontWeight: 600 }}>Pausada</span>}
                </td>
                <td data-label="Tipo">
                  <span className={`badge ${isIncome ? 'badge-green' : 'badge-red'}`}>
                    {isIncome ? 'Receita' : 'Despesa'}
                  </span>
                </td>
                <td data-label="Vencimento">Dia {recurring.due_day}</td>
                <td data-label="Categoria">{recurring.category?.name ?? '-'}</td>
                <td data-label="Repetição">
                  {recurring.installments 
                    ? `${recurring.generated_installments} de ${recurring.installments}` 
                    : 'Infinito'}
                </td>
                <td data-label="Valor">{formatCurrency(Number(recurring.amount))}</td>
                <td data-label="Ações" className="actions-cell">
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
      
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap',
        justifyContent: 'flex-end', 
        gap: '24px', 
        padding: '16px', 
        background: 'var(--surface-alt)',
        borderBottomLeftRadius: 'var(--radius)',
        borderBottomRightRadius: 'var(--radius)',
        marginTop: '1px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="muted">Despesas estimadas:</span>
          <strong style={{ color: 'var(--danger)', fontSize: '1.1rem' }}>
            {formatCurrency(activeExpense)}
          </strong>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="muted">Receitas estimadas:</span>
          <strong style={{ color: 'var(--success)', fontSize: '1.1rem' }}>
            {formatCurrency(activeIncome)}
          </strong>
        </div>
      </div>
    </div>
  )
}
