import type { Transaction } from '../types/finance'

export interface DailyChartData {
  date: string
  day: number
  income: number
  expense: number
}

/**
 * Agrupa transações de um determinado mês por dia.
 * @param transactions Lista completa de transações
 * @param currentMonth Mês alvo no formato "YYYY-MM" (ex: "2026-04")
 */
export function aggregateTransactionsByDay(
  transactions: Transaction[],
  currentMonth: string,
): DailyChartData[] {
  const [yearText, monthText] = currentMonth.split('-')
  const year = Number(yearText)
  const monthIndex = Number(monthText) - 1

  // Descobrir quantos dias tem o mês
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()

  // Inicializar o array com todos os dias do mês zerados
  const dailyData: DailyChartData[] = Array.from({ length: daysInMonth }, (_, i) => ({
    date: `${yearText}-${monthText}-${String(i + 1).padStart(2, '0')}`,
    day: i + 1,
    income: 0,
    expense: 0,
  }))

  // Filtrar transações apenas do mês atual e que já foram pagas
  const currentMonthTransactions = transactions.filter(
    (t) => t.transaction_date.startsWith(currentMonth) && t.status === 'paid',
  )

  // Somar valores por dia
  currentMonthTransactions.forEach((t) => {
    // transaction_date vem no formato "YYYY-MM-DD"
    const dayString = t.transaction_date.split('-')[2]
    const dayNumber = Number(dayString)
    
    // O array é zero-indexed, então o dia 1 está no índice 0
    const index = dayNumber - 1

    if (dailyData[index]) {
      const amount = Number(t.amount)
      if (t.type === 'income') {
        dailyData[index].income += amount
      } else {
        dailyData[index].expense += amount
      }
    }
  })

  return dailyData
}
