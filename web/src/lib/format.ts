export function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDate(dateValue: string | null) {
  if (!dateValue) return '-'

  const [year, month, day] = dateValue.split('T')[0].split('-').map(Number)
  const date = new Date(year, month - 1, day)
  
  if (Number.isNaN(date.getTime())) return dateValue

  return new Intl.DateTimeFormat('pt-BR').format(date)
}
