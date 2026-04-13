import { useMemo } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { formatCurrency } from '../lib/format'
import type { Transaction } from '../types/finance'

interface DonutChartProps {
  transactions: Transaction[]
  currentMonth: string
}

export function DonutChart({ transactions, currentMonth }: DonutChartProps) {
  const chartData = useMemo(() => {
    // Pegar apenas despesas do mês atual que foram pagas
    const currentMonthExpenses = transactions.filter(
      (t) => t.transaction_date.startsWith(currentMonth) && t.type === 'expense' && t.status === 'paid'
    )

    // Agrupar por categoria
    const grouped = currentMonthExpenses.reduce((acc, curr) => {
      const catName = curr.category?.name || 'Sem Categoria'
      acc[catName] = (acc[catName] || 0) + Number(curr.amount)
      return acc
    }, {} as Record<string, number>)

    // Transformar em array para o recharts e ordenar do maior para o menor
    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [transactions, currentMonth])

  // Cores bonitas para as fatias do gráfico
  const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#14b8a6', '#f43f5e', '#64748b']

  return (
    <section className="card">
      <h2>Despesas por Categoria</h2>
      <div style={{ width: '100%', height: 350, marginTop: '1.5rem' }}>
        {chartData.length === 0 ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
            Nenhuma despesa registrada neste mês.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any) => formatCurrency(Number(value || 0))}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  )
}
