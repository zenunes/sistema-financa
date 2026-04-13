import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { aggregateTransactionsByDay } from '../lib/chartUtils'
import { formatCurrency } from '../lib/format'
import type { Transaction } from '../types/finance'

interface DashboardChartProps {
  transactions: Transaction[]
  currentMonth: string
}

export function DashboardChart({ transactions, currentMonth }: DashboardChartProps) {
  const chartData = useMemo(() => {
    return aggregateTransactionsByDay(transactions, currentMonth)
  }, [transactions, currentMonth])

  return (
    <section className="card">
      <h2>Evolução Diária ({currentMonth})</h2>
      <div style={{ width: '100%', height: 350, marginTop: '1.5rem' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 5,
              right: 10,
              left: 10,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis 
              dataKey="day" 
              tick={{ fill: '#6b7280', fontSize: 12 }} 
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              tickFormatter={(value) => `R$ ${value}`}
              tick={{ fill: '#6b7280', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              width={80}
            />
            <Tooltip
              formatter={(value: any) => [formatCurrency(Number(value || 0)), '']}
              labelFormatter={(label: any) => `Dia ${label}`}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Bar 
              dataKey="income" 
              name="Receitas" 
              fill="#10b981" 
              radius={[4, 4, 0, 0]} 
              maxBarSize={40}
            />
            <Bar 
              dataKey="expense" 
              name="Despesas" 
              fill="#ef4444" 
              radius={[4, 4, 0, 0]} 
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
