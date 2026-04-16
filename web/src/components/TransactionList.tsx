import { formatCurrency, formatDate } from '../lib/format'
import type { Transaction } from '../types/finance'

interface TransactionListProps {
  transactions: Transaction[]
  onDelete: (id: string) => void
  onToggleStatus: (id: string, status: 'pending' | 'paid') => void
  onEdit?: (transaction: Transaction) => void
  loadingId?: string | null
}

export function TransactionList({
  transactions,
  onDelete,
  onToggleStatus,
  onEdit,
  loadingId,
}: TransactionListProps) {
  const today = new Date().toISOString().slice(0, 10)

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Descrição</th>
            <th>Tipo</th>
            <th>Status</th>
            <th>Categoria</th>
            <th>Data</th>
            <th>Valor</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length === 0 && (
            <tr>
              <td colSpan={7} className="empty-row">
                Nenhum lançamento cadastrado.
              </td>
            </tr>
          )}
          {transactions.map((transaction) => {
            const isPending = transaction.status === 'pending'
            const isOverdue = isPending && transaction.transaction_date < today
            const isNearDue = isPending && transaction.transaction_date === today
            
            let rowStyle = {}
            if (isPending) {
              rowStyle = { opacity: 0.85 }
              if (isOverdue) rowStyle = { ...rowStyle, background: 'rgba(239, 68, 68, 0.05)', borderLeft: '3px solid #ef4444' }
              else if (isNearDue) rowStyle = { ...rowStyle, background: 'rgba(245, 158, 11, 0.05)', borderLeft: '3px solid #f59e0b' }
            }

            return (
            <tr key={transaction.id} style={rowStyle}>
              <td data-label="Descrição">
                {transaction.description}
                {isOverdue && <span style={{ color: '#ef4444', fontSize: '0.75rem', display: 'block', fontWeight: 600 }}>Atrasado</span>}
                {isNearDue && <span style={{ color: '#f59e0b', fontSize: '0.75rem', display: 'block', fontWeight: 600 }}>Vence hoje</span>}
              </td>
              <td data-label="Tipo">
                <span className={`badge ${transaction.type === 'income' ? 'badge-green' : 'badge-red'}`}>
                  {transaction.type === 'income' ? 'Receita' : 'Despesa'}
                </span>
              </td>
              <td data-label="Status">
                <span className={`badge ${transaction.status === 'paid' ? 'badge-blue' : 'badge-purple'}`}>
                  {transaction.status === 'paid' ? 'Pago' : 'Pendente'}
                </span>
              </td>
              <td data-label="Categoria">{transaction.category?.name ?? '-'}</td>
              <td data-label="Data">{formatDate(transaction.transaction_date)}</td>
              <td data-label="Valor">{formatCurrency(Number(transaction.amount))}</td>
              <td data-label="Ações" className="actions-cell">
                <button
                  type="button"
                  className="ghost"
                  onClick={() => onToggleStatus(transaction.id, transaction.status)}
                  disabled={loadingId === transaction.id}
                >
                  {transaction.status === 'paid' ? 'Desfazer' : 'Pagar'}
                </button>
                {onEdit && (
                  <button
                    type="button"
                    className="ghost"
                    onClick={() => onEdit(transaction)}
                    disabled={loadingId === transaction.id}
                    title="Editar"
                  >
                    ✏️
                  </button>
                )}
                <button
                  type="button"
                  className="danger"
                  onClick={() => onDelete(transaction.id)}
                  disabled={loadingId === transaction.id}
                >
                  {loadingId === transaction.id ? '...' : 'Excluir'}
                </button>
              </td>
            </tr>
          )})}
        </tbody>
      </table>
    </div>
  )
}
