import { useMemo, useState, type FormEvent } from 'react'
import { formatCurrency, formatDate } from '../lib/format'
import type { Category, Transaction, TransactionType } from '../types/finance'

interface TransactionSectionProps {
  categories: Category[]
  transactions: Transaction[]
  onCreate: (params: {
    description: string
    amount: number
    type: TransactionType
    categoryId?: string
    transactionDate: string
  }) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function TransactionSection({
  categories,
  transactions,
  onCreate,
  onDelete,
}: TransactionSectionProps) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<TransactionType>('expense')
  const [categoryId, setCategoryId] = useState('')
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().slice(0, 10),
  )
  const [submitting, setSubmitting] = useState(false)

  const filteredCategories = useMemo(
    () => categories.filter((category) => category.type === type),
    [categories, type],
  )

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!description || !amount) return
    setSubmitting(true)

    try {
      await onCreate({
        description,
        amount: Number(amount),
        type,
        categoryId: categoryId || undefined,
        transactionDate,
      })
      setDescription('')
      setAmount('')
      setCategoryId('')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="card">
      <h2>
        <span className="badge-icon badge-blue">L</span>
        Lançamentos
      </h2>
      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          Descrição
          <input
            required
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Ex: Mercado"
          />
        </label>
        <label>
          Valor
          <input
            required
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0,00"
          />
        </label>
        <label>
          Tipo
          <select
            value={type}
            onChange={(event) => {
              setType(event.target.value as TransactionType)
              setCategoryId('')
            }}
          >
            <option value="expense">Despesa</option>
            <option value="income">Receita</option>
          </select>
        </label>
        <label>
          Categoria
          <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
            <option value="">Sem categoria</option>
            {filteredCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Data
          <input
            required
            type="date"
            value={transactionDate}
            onChange={(event) => setTransactionDate(event.target.value)}
          />
        </label>
        <button type="submit" disabled={submitting}>
          {submitting ? 'Salvando...' : 'Adicionar lançamento'}
        </button>
      </form>

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
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
