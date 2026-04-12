import { formatCurrency, formatDate } from '../lib/format'
import type { Transaction } from '../types/finance'

interface TransactionListProps {
  transactions: Transaction[]
  onDelete: (id: string) => void
  deletingId?: string | null
}

export function TransactionList({ transactions, onDelete, deletingId }: TransactionListProps) {
  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Descrição</th>
            <th>Tipo</th>
            <th>Categoria</th>
            <th>Data</th>
            <th>Valor</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {transactions.length === 0 && (
            <tr>
              <td colSpan={6} className="empty-row">
                Nenhum lançamento cadastrado.
              </td>
            </tr>
          )}
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td>{transaction.description}</td>
              <td>{transaction.type === 'income' ? 'Receita' : 'Despesa'}</td>
              <td>{transaction.category?.name ?? '-'}</td>
              <td>{formatDate(transaction.transaction_date)}</td>
              <td>{formatCurrency(Number(transaction.amount))}</td>
              <td>
                <button
                  type="button"
                  className="danger"
                  onClick={() => onDelete(transaction.id)}
                  disabled={deletingId === transaction.id}
                >
                  {deletingId === transaction.id ? '...' : 'Excluir'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
