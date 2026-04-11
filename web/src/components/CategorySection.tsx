import { useState, type FormEvent } from 'react'
import type { Category, TransactionType } from '../types/finance'

interface CategorySectionProps {
  categories: Category[]
  onCreate: (params: { name: string; type: TransactionType }) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function CategorySection({ categories, onCreate, onDelete }: CategorySectionProps) {
  const [name, setName] = useState('')
  const [type, setType] = useState<TransactionType>('expense')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!name) return
    setSubmitting(true)

    try {
      await onCreate({ name, type })
      setName('')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="card">
      <h2>Categorias</h2>
      <form className="form-grid inline" onSubmit={handleSubmit}>
        <label>
          Nome
          <input
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ex: Alimentação"
          />
        </label>
        <label>
          Tipo
          <select value={type} onChange={(event) => setType(event.target.value as TransactionType)}>
            <option value="expense">Despesa</option>
            <option value="income">Receita</option>
          </select>
        </label>
        <button type="submit" disabled={submitting}>
          {submitting ? 'Salvando...' : 'Adicionar categoria'}
        </button>
      </form>

      <ul className="chip-list">
        {categories.length === 0 && <li className="muted">Nenhuma categoria cadastrada.</li>}
        {categories.map((category) => (
          <li key={category.id}>
            <span>{category.name}</span>
            <small>{category.type === 'income' ? 'Receita' : 'Despesa'}</small>
            <button type="button" className="danger" onClick={() => onDelete(category.id)}>
              Excluir
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
