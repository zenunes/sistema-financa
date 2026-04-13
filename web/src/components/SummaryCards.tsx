import type { Goal, Transaction } from '../types/finance'
import { formatCurrency } from '../lib/format'

interface SummaryCardsProps {
  transactions: Transaction[]
  goals: Goal[]
}

export function SummaryCards({ transactions, goals }: SummaryCardsProps) {
  const income = transactions
    .filter((transaction) => transaction.type === 'income' && transaction.status === 'paid')
    .reduce((total, transaction) => total + Number(transaction.amount), 0)
  const expense = transactions
    .filter((transaction) => transaction.type === 'expense' && transaction.status === 'paid')
    .reduce((total, transaction) => total + Number(transaction.amount), 0)
  const balance = income - expense
  const goalTarget = goals.reduce((total, goal) => total + Number(goal.target_amount), 0)
  const goalCurrent = goals.reduce((total, goal) => total + Number(goal.current_amount), 0)

  return (
    <section className="summary-grid">
      <article className="card summary-card">
        <h2>
          <span className="badge-icon badge-blue">$</span>
          Saldo
        </h2>
        <strong>{formatCurrency(balance)}</strong>
      </article>
      <article className="card summary-card">
        <h2>
          <span className="badge-icon badge-green">+</span>
          Receitas
        </h2>
        <strong>{formatCurrency(income)}</strong>
      </article>
      <article className="card summary-card">
        <h2>
          <span className="badge-icon badge-red">-</span>
          Despesas
        </h2>
        <strong>{formatCurrency(expense)}</strong>
      </article>
      <article className="card summary-card">
        <h2>
          <span className="badge-icon badge-purple">G</span>
          Metas
        </h2>
        <strong>
          {formatCurrency(goalCurrent)} / {formatCurrency(goalTarget)}
        </strong>
      </article>
    </section>
  )
}
