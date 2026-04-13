import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useEffect, useMemo } from 'react'
import type { Category, TransactionType } from '../types/finance'
import { maskCurrencyInput, parseCurrencyInput } from '../lib/mask'

const transactionSchema = z.object({
  description: z.string().min(3, 'A descrição deve ter no mínimo 3 caracteres'),
  amount: z
    .string()
    .min(1, 'Informe um valor')
    .refine((val) => parseCurrencyInput(val) > 0, 'O valor deve ser maior que zero'),
  type: z.enum(['income', 'expense']),
  status: z.enum(['pending', 'paid']),
  categoryId: z.string().optional(),
  transactionDate: z.string().min(10, 'Informe a data do lançamento'),
})

type TransactionFormData = z.infer<typeof transactionSchema>

interface TransactionFormProps {
  categories: Category[]
  onSubmit: (params: {
    description: string
    amount: number
    type: TransactionType
    status: 'pending' | 'paid'
    categoryId?: string
    transactionDate: string
  }) => Promise<void>
  submitting: boolean
}

export function TransactionForm({ categories, onSubmit, submitting }: TransactionFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'expense',
      status: 'paid',
      amount: '',
      description: '',
      categoryId: '',
      transactionDate: new Date().toISOString().slice(0, 10),
    },
  })

  const selectedType = watch('type')
  const amountValue = watch('amount')

  const filteredCategories = useMemo(
    () => categories.filter((category) => category.type === selectedType),
    [categories, selectedType],
  )

  // Reseta a categoria ao trocar o tipo de transação
  useEffect(() => {
    setValue('categoryId', '')
  }, [selectedType, setValue])

  const handleFormSubmit = handleSubmit(async (data) => {
    await onSubmit({
      description: data.description,
      amount: parseCurrencyInput(data.amount),
      type: data.type,
      status: data.status,
      categoryId: data.categoryId || undefined,
      transactionDate: data.transactionDate,
    })
    reset({
      type: data.type,
      status: data.status,
      transactionDate: data.transactionDate,
      amount: '',
      description: '',
      categoryId: '',
    })
  })

  return (
    <form className="form-grid" onSubmit={handleFormSubmit}>
      <label>
        Descrição
        <input
          {...register('description')}
          placeholder="Ex: Mercado"
          className={errors.description ? 'input-error' : ''}
        />
        {errors.description && <span className="error-text">{errors.description.message}</span>}
      </label>

      <label>
        Valor (R$)
        <input
          {...register('amount')}
          type="text"
          placeholder="0,00"
          value={amountValue}
          onChange={(e) => setValue('amount', maskCurrencyInput(e.target.value))}
          className={errors.amount ? 'input-error' : ''}
        />
        {errors.amount && <span className="error-text">{errors.amount.message}</span>}
      </label>

      <label>
        Tipo
        <select {...register('type')}>
          <option value="expense">Despesa</option>
          <option value="income">Receita</option>
        </select>
        {errors.type && <span className="error-text">{errors.type.message}</span>}
      </label>

      <label>
        Status
        <select {...register('status')}>
          <option value="paid">Pago / Efetivado</option>
          <option value="pending">Pendente</option>
        </select>
        {errors.status && <span className="error-text">{errors.status.message}</span>}
      </label>

      <label>
        Categoria
        <select {...register('categoryId')}>
          <option value="">Sem categoria</option>
          {filteredCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {errors.categoryId && <span className="error-text">{errors.categoryId.message}</span>}
      </label>

      <label>
        Data
        <input
          {...register('transactionDate')}
          type="date"
          className={errors.transactionDate ? 'input-error' : ''}
        />
        {errors.transactionDate && (
          <span className="error-text">{errors.transactionDate.message}</span>
        )}
      </label>

      <button type="submit" disabled={submitting}>
        {submitting ? 'Salvando...' : 'Adicionar lançamento'}
      </button>
    </form>
  )
}
