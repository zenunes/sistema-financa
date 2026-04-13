import { useMemo } from 'react'

interface MonthSelectorProps {
  currentMonth: string
  onChangeMonth: (newMonth: string) => void
}

export function MonthSelector({ currentMonth, onChangeMonth }: MonthSelectorProps) {
  // currentMonth is in "YYYY-MM" format
  const date = useMemo(() => {
    const [year, month] = currentMonth.split('-')
    return new Date(Number(year), Number(month) - 1, 1)
  }, [currentMonth])

  const handlePrev = () => {
    const prev = new Date(date.getFullYear(), date.getMonth() - 1, 1)
    onChangeMonth(prev.toISOString().slice(0, 7))
  }

  const handleNext = () => {
    const next = new Date(date.getFullYear(), date.getMonth() + 1, 1)
    onChangeMonth(next.toISOString().slice(0, 7))
  }

  const handleCurrent = () => {
    onChangeMonth(new Date().toISOString().slice(0, 7))
  }

  const monthName = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  const capitalizedMonthName = monthName.charAt(0).toUpperCase() + monthName.slice(1)

  return (
    <div className="month-selector">
      <button type="button" className="ghost" onClick={handlePrev}>
        &#8592;
      </button>
      <div 
        className="month-display" 
        onClick={handleCurrent} 
        title="Voltar para o mês atual"
        style={{ cursor: 'pointer', fontWeight: 600, minWidth: '150px', textAlign: 'center' }}
      >
        {capitalizedMonthName}
      </div>
      <button type="button" className="ghost" onClick={handleNext}>
        &#8594;
      </button>
    </div>
  )
}
