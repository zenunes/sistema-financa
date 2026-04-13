import { formatCurrency, formatDate } from '../lib/format'
import type { Transaction } from '../types/finance'

interface TransactionListProps {
  transactions: Transaction[]
  onDelete: (id: string) => void
  onToggleStatus: (id: string, status: 'pending' | 'paid') => void
  loadingId?: string | null
}

export function TransactionList({
  transactions,
  onDelete,
  onToggleStatus,
  loadingId,
}: TransactionListProps) {
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
          {transactions.map((transaction) => (
            <tr key={transaction.id} style={{ opacity: transaction.status === 'pending' ? 0.6 : 1 }}>
              <td>{transaction.description}</td>
              <td>
                <span className={`badge ${transaction.type === 'income' ? 'badge-green' : 'badge-red'}`}>
                  {transaction.type === 'income' ? 'Receita' : 'Despesa'}
                </span>
              </td>
              <td>
                <span className={`badge ${transaction.status === 'paid' ? 'badge-blue' : 'badge-purple'}`}>
                  {transaction.status === 'paid' ? 'Pago' : 'Pendente'}
                </span>
              </td>
              <td>{transaction.category?.name ?? '-'}</td>
              <td>{formatDate(transaction.transaction_date)}</td>
              <td>{formatCurrency(Number(transaction.amount))}</td>
              <td style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="ghost"
                  onClick={() => onToggleStatus(transaction.id, transaction.status)}
                  disabled={loadingId === transaction.id}
                >
                  {transaction.status === 'paid' ? 'Desfazer' : 'Pagar'}
                </button>
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
          ))}
        </tbody>
      </table>
    </div>
  )
}
