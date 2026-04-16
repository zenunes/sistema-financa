import { useState, type FormEvent } from 'react'
import { formatCurrency, formatDate } from '../lib/format'
import type { Goal } from '../types/finance'

interface GoalSectionProps {
  goals: Goal[]
  showGoalAmounts: boolean
  onCreate: (params: {
    title: string
    targetAmount: number
    currentAmount: number
    dueDate?: string
  }) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onAddFunds: (id: string, amount: number) => Promise<void>
}

export function GoalSection({ goals, showGoalAmounts, onCreate, onDelete, onAddFunds }: GoalSectionProps) {
  const [title, setTitle] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [currentAmount, setCurrentAmount] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [depositGoalId, setDepositGoalId] = useState<string | null>(null)
  const [depositAmount, setDepositAmount] = useState('')
  const [depositing, setDepositing] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!title || !targetAmount) return
    setSubmitting(true)

    try {
      await onCreate({
        title,
        targetAmount: Number(targetAmount),
        currentAmount: Number(currentAmount || 0),
        dueDate: dueDate || undefined,
      })
      setTitle('')
      setTargetAmount('')
      setCurrentAmount('')
      setDueDate('')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeposit(event: FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault()
    if (!depositAmount || isNaN(Number(depositAmount))) return
    
    setDepositing(true)
    try {
      await onAddFunds(id, Number(depositAmount))
      setDepositGoalId(null)
      setDepositAmount('')
    } finally {
      setDepositing(false)
    }
  }

  return (
    <section className="card">
      <h2>
        <span className="badge-icon badge-purple">M</span>
        Metas
      </h2>
      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          Título
          <input
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ex: Reserva de emergência"
          />
        </label>
        <label>
          Valor alvo
          <input
            required
            type="number"
            min="0"
            step="0.01"
            value={targetAmount}
            onChange={(event) => setTargetAmount(event.target.value)}
          />
        </label>
        <label>
          Valor atual
          <input
            type="number"
            min="0"
            step="0.01"
            value={currentAmount}
            onChange={(event) => setCurrentAmount(event.target.value)}
          />
        </label>
        <label>
          Data limite
          <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
        </label>
        <button type="submit" disabled={submitting}>
          {submitting ? 'Salvando...' : 'Adicionar meta'}
        </button>
      </form>

      <div className="goal-grid">
        {goals.length === 0 && <p className="muted">Nenhuma meta cadastrada.</p>}
        {goals.map((goal) => {
          const progress = goal.target_amount
            ? Math.min((Number(goal.current_amount) / Number(goal.target_amount)) * 100, 100)
            : 0

          return (
            <article key={goal.id} className="goal-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <header>
                <h3>{goal.title}</h3>
                <button type="button" className="danger" onClick={() => onDelete(goal.id)}>
                  Excluir
                </button>
              </header>
              <p>
                {showGoalAmounts ? (
                  <>
                    {formatCurrency(Number(goal.current_amount))} de{' '}
                    {formatCurrency(Number(goal.target_amount))}
                  </>
                ) : (
                  '••••••'
                )}
              </p>
              <p className="muted" style={{ marginBottom: '0.5rem' }}>
                Prazo: {showGoalAmounts ? formatDate(goal.due_date) : '••/••/••••'}
              </p>
              <div className="progress-bar" style={{ marginBottom: '1rem' }}>
                <span style={{ width: `${showGoalAmounts ? progress : 0}%` }} />
              </div>
              
              {depositGoalId === goal.id ? (
                <form onSubmit={(e) => handleDeposit(e, goal.id)} style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Valor R$"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    required
                    style={{ flex: 1, padding: '6px 8px', fontSize: '0.9rem' }}
                    autoFocus
                  />
                  <button type="submit" disabled={depositing} style={{ padding: '6px 12px', fontSize: '0.9rem' }}>
                    OK
                  </button>
                  <button type="button" className="ghost" onClick={() => setDepositGoalId(null)} style={{ padding: '6px 12px', fontSize: '0.9rem' }}>
                    X
                  </button>
                </form>
              ) : (
                <button 
                  type="button" 
                  className="ghost" 
                  style={{ width: '100%', marginTop: 'auto' }}
                  onClick={() => setDepositGoalId(goal.id)}
                >
                  Depositar na meta
                </button>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}
