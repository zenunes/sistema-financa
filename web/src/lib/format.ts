export function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDate(dateValue: string | null) {
  if (!dateValue) return '-'

  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return dateValue

  return new Intl.DateTimeFormat('pt-BR').format(date)
}
