/**
 * Aplica máscara de moeda brasileira a uma string numérica.
 * @param value String ou número para formatar (ex: "1500" -> "1.500,00")
 */
export function maskCurrencyInput(value: string | number): string {
  if (!value) return ''
  
  const numericValue = String(value).replace(/\D/g, '')
  if (!numericValue) return ''

  const amount = Number(numericValue) / 100

  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Converte a string mascarada de volta para número para salvar no banco.
 * @param maskedValue String mascarada (ex: "1.500,00" -> 1500.00)
 */
export function parseCurrencyInput(maskedValue: string): number {
  if (!maskedValue) return 0
  const numericValue = maskedValue.replace(/\D/g, '')
  return Number(numericValue) / 100
}
