import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useEffect, useMemo } from 'react'
import type { Category, TransactionType } from '../types/finance'
import { maskCurrencyInput, parseCurrencyInput } from '../lib/mask'

const recurringSchema = z.object({
  description: z.string().min(3, 'A descrição deve ter no mínimo 3 caracteres'),
  amount: z
    .string()
    .min(1, 'Informe um valor')
    .refine((val) => parseCurrencyInput(val) > 0, 'O valor deve ser maior que zero'),
  type: z.enum(['income', 'expense']),
  dueDay: z
    .number({ message: 'Informe o dia' })
    .min(1, 'O dia deve ser entre 1 e 31')
    .max(31, 'O dia deve ser entre 1 e 31'),
  categoryId: z.string().optional(),
  installments: z.string().optional(),
})

type RecurringFormData = z.infer<typeof recurringSchema>

interface RecurringFormProps {
  categories: Category[]
  onSubmit: (params: {
    description: string
    amount: number
    type: TransactionType
    dueDay: number
    categoryId?: string
    installments?: number
  }) => Promise<void>
  submitting?: boolean
}

export function RecurringForm({ categories, onSubmit, submitting }: RecurringFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<RecurringFormData>({
    resolver: zodResolver(recurringSchema),
    defaultValues: {
      type: 'expense',
      amount: '',
      description: '',
      categoryId: '',
      dueDay: 1,
      installments: '',
    },
  })

  const selectedType = watch('type')
  const amountValue = watch('amount')

  const filteredCategories = useMemo(
    () => categories.filter((category) => category.type === selectedType),
    [categories, selectedType],
  )

  useEffect(() => {
    setValue('categoryId', '')
  }, [selectedType, setValue])

  const handleFormSubmit = handleSubmit(async (data) => {
    try {
      const parsedInstallments = data.installments ? parseInt(data.installments, 10) : undefined
      await onSubmit({
        description: data.description,
        amount: parseCurrencyInput(data.amount),
        type: data.type,
        dueDay: data.dueDay,
        categoryId: data.categoryId || undefined,
        installments: parsedInstallments && parsedInstallments > 0 ? parsedInstallments : undefined,
      })
      reset({
        type: data.type,
        amount: '',
        description: '',
        categoryId: '',
        dueDay: 1,
        installments: '',
      })
    } catch (err) {
      console.error('Erro ao submeter form:', err)
    }
  })

  return (
    <form className="form-grid multi-col" onSubmit={handleFormSubmit}>
      <label>
        Descrição
        <input
          {...register('description')}
          placeholder="Ex: Aluguel"
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
        Dia do Vencimento
        <input
          {...register('dueDay', { valueAsNumber: true })}
          type="number"
          min="1"
          max="31"
          className={errors.dueDay ? 'input-error' : ''}
        />
        {errors.dueDay && <span className="error-text">{errors.dueDay.message}</span>}
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
        Repetir X vezes
        <input
          {...register('installments')}
          type="number"
          min="2"
          placeholder="Ex: 10 (Deixe vazio para infinito)"
          className={errors.installments ? 'input-error' : ''}
        />
        {errors.installments && <span className="error-text">{errors.installments.message}</span>}
      </label>

      <button type="submit" disabled={submitting}>
        {submitting ? 'Salvando...' : 'Adicionar recorrência'}
      </button>
    </form>
  )
}
