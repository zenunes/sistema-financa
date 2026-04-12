import { useMemo, useState, type FormEvent } from 'react'
import { formatCurrency } from '../lib/format'
import type { Category, RecurringTransaction, TransactionType } from '../types/finance'

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
}: RecurringSectionProps) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<TransactionType>('expense')
  const [dueDay, setDueDay] = useState('10')
  const [categoryId, setCategoryId] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const filteredCategories = useMemo(
    () => categories.filter((category) => category.type === type),
    [categories, type],
  )

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!description || !amount || !dueDay) return
    setSubmitting(true)

    try {
      await onCreate({
        description,
        amount: Number(amount),
        type,
        dueDay: Number(dueDay),
        categoryId: categoryId || undefined,
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
      <div className="section-head">
        <h2>
          <span className="badge-icon badge-purple">R</span>
          Despesas recorrentes
        </h2>
        <button type="button" onClick={onGenerateMonth} disabled={generating}>
          {generating ? 'Gerando...' : `Gerar ${month}`}
        </button>
      </div>

      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          Descrição
          <input
            required
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Ex: Conta de água"
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
          />
        </label>
        <label>
          Tipo
          <select value={type} onChange={(event) => setType(event.target.value as TransactionType)}>
            <option value="expense">Despesa</option>
            <option value="income">Receita</option>
          </select>
        </label>
        <label>
          Dia de vencimento
          <input
            required
            type="number"
            min="1"
            max="31"
            value={dueDay}
            onChange={(event) => setDueDay(event.target.value)}
          />
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
        <button type="submit" disabled={submitting}>
          {submitting ? 'Salvando...' : 'Adicionar recorrência'}
        </button>
      </form>

      <ul className="chip-list recurring-list">
        {recurringTransactions.length === 0 && (
          <li className="muted">Nenhuma recorrência cadastrada.</li>
        )}
        {recurringTransactions.map((item) => (
          <li key={item.id}>
            <span>{item.description}</span>
            <small>{formatCurrency(Number(item.amount))}</small>
            <small>Dia {item.due_day}</small>
            <small>{item.active ? 'Ativa' : 'Pausada'}</small>
            <button
              type="button"
              className="ghost"
              onClick={() => onToggleActive(item.id, !item.active)}
            >
              {item.active ? 'Pausar' : 'Ativar'}
            </button>
            <button type="button" className="danger" onClick={() => onDelete(item.id)}>
              Excluir
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
