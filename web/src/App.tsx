import { useAuth } from './hooks/useAuth'
import { useTransactions } from './hooks/useTransactions'
import { useCategories } from './hooks/useCategories'
import { useGoals } from './hooks/useGoals'
import { useRecurringTransactions } from './hooks/useRecurringTransactions'
import { useState, useEffect } from 'react'
import { AuthView } from './components/AuthView'
import { CategorySection } from './components/CategorySection'
import { GoalSection } from './components/GoalSection'
import { RecurringSection } from './components/RecurringSection'
import { SummaryCards } from './components/SummaryCards'
import { DashboardChart } from './components/DashboardChart'
import { TransactionSection } from './components/TransactionSection'
import { MonthSelector } from './components/MonthSelector'
import { DonutChart } from './components/DonutChart'
import type { TransactionType } from './types/finance'
import './App.css'

function App() {
  const { session, loadingAuth, handleLogout } = useAuth()
  const userId = session?.user?.id

  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [currentMonth, setCurrentMonth] = useState(() => new Date().toISOString().slice(0, 7))

  const {
    transactions,
    isLoading: loadingTransactions,
    createTransaction,
    deleteTransaction,
    toggleTransactionStatus,
    isCreating: creatingTx,
  } = useTransactions(userId)

  const {
    categories,
    isLoading: loadingCategories,
    createCategory,
    deleteCategory,
  } = useCategories(userId)

  const {
    goals,
    isLoading: loadingGoals,
    createGoal,
    deleteGoal,
  } = useGoals(userId)

  const {
    recurringTransactions,
    isLoading: loadingRecurring,
    createRecurringTransaction,
    toggleRecurringTransaction,
    deleteRecurringTransaction,
    generateRecurringTransactions,
  } = useRecurringTransactions(userId)

  // Auto-generate recurring transactions on mount
  useEffect(() => {
    if (userId && currentMonth) {
      generateRecurringTransactions(currentMonth).catch((err) => {
        console.error('Failed to auto-generate recurring transactions:', err)
      })
    }
  }, [userId, currentMonth, generateRecurringTransactions])

  const isInitialLoading =
    loadingAuth ||
    (session && (loadingTransactions || loadingCategories || loadingGoals || loadingRecurring))

  async function onLogout() {
    try {
      await handleLogout()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao sair.')
    }
  }

  // --- Wrappers para gerenciar o estado de erro/sucesso ---

  async function handleCreateTransaction(params: {
    description: string
    amount: number
    type: TransactionType
    status: 'pending' | 'paid'
    categoryId?: string
    transactionDate: string
  }) {
    setError(''); setInfo('')
    try {
      await createTransaction(params)
      setInfo('Lançamento criado com sucesso.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar lançamento.')
    }
  }

  async function handleDeleteTransaction(id: string) {
    setError(''); setInfo('')
    try {
      await deleteTransaction(id)
      setInfo('Lançamento excluído.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir lançamento.')
    }
  }

  async function handleToggleTransactionStatus(id: string, status: 'pending' | 'paid') {
    setError(''); setInfo('')
    try {
      await toggleTransactionStatus({ id, status })
      setInfo(status === 'paid' ? 'Lançamento marcado como pago.' : 'Lançamento marcado como pendente.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao alterar status do lançamento.')
    }
  }

  async function handleCreateCategory(params: { name: string; type: TransactionType }) {
    setError(''); setInfo('')
    try {
      await createCategory(params)
      setInfo('Categoria criada com sucesso.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar categoria.')
    }
  }

  async function handleDeleteCategory(id: string) {
    setError(''); setInfo('')
    try {
      await deleteCategory(id)
      setInfo('Categoria excluída.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir categoria.')
    }
  }

  async function handleCreateGoal(params: {
    title: string
    targetAmount: number
    currentAmount: number
    dueDate?: string
  }) {
    setError(''); setInfo('')
    try {
      await createGoal(params)
      setInfo('Meta criada com sucesso.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar meta.')
    }
  }

  async function handleDeleteGoal(id: string) {
    setError(''); setInfo('')
    try {
      await deleteGoal(id)
      setInfo('Meta excluída.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir meta.')
    }
  }

  async function handleCreateRecurring(params: {
    description: string
    amount: number
    type: TransactionType
    dueDay: number
    categoryId?: string
  }) {
    setError(''); setInfo('')
    try {
      await createRecurringTransaction(params)
      setInfo('Recorrência criada com sucesso.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar recorrência.')
    }
  }

  async function handleToggleRecurring(id: string, active: boolean) {
    setError(''); setInfo('')
    try {
      await toggleRecurringTransaction({ id, active })
      setInfo(active ? 'Recorrência ativada.' : 'Recorrência pausada.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar recorrência.')
    }
  }

  async function handleDeleteRecurring(id: string) {
    setError(''); setInfo('')
    try {
      await deleteRecurringTransaction(id)
      setInfo('Recorrência excluída.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir recorrência.')
    }
  }

  return (
    <main className="app-shell">
      {!session ? (
        <AuthView onAuthError={setError} />
      ) : (
        <>
          <header className="topbar card">
            <div>
              <h1>Finanças Pessoais</h1>
              <p className="muted">{session.user.email}</p>
            </div>
            <button type="button" onClick={onLogout}>
              Sair
            </button>
          </header>

          {isInitialLoading && <p className="status">Carregando dados...</p>}
          {error && <p className="status error">{error}</p>}
          {!error && info && <p className="status success">{info}</p>}

          {!isInitialLoading && (
            <>
              <MonthSelector currentMonth={currentMonth} onChangeMonth={setCurrentMonth} />

              <SummaryCards transactions={transactions} goals={goals} currentMonth={currentMonth} />

              <div className="charts-grid">
                <DashboardChart transactions={transactions} currentMonth={currentMonth} />
                <DonutChart transactions={transactions} currentMonth={currentMonth} />
              </div>

              <RecurringSection
                categories={categories}
                recurringTransactions={recurringTransactions}
                onCreate={handleCreateRecurring}
                onToggleActive={handleToggleRecurring}
                onDelete={handleDeleteRecurring}
              />

              <TransactionSection
                categories={categories}
                transactions={transactions.filter(t => t.transaction_date.startsWith(currentMonth))}
                onCreate={handleCreateTransaction}
                onDelete={handleDeleteTransaction}
                onToggleStatus={handleToggleTransactionStatus}
                isCreating={creatingTx}
              />
              
              <div className="dual-grid">
                <CategorySection
                  categories={categories}
                  onCreate={handleCreateCategory}
                  onDelete={handleDeleteCategory}
                />
                <GoalSection 
                  goals={goals} 
                  onCreate={handleCreateGoal} 
                  onDelete={handleDeleteGoal} 
                />
              </div>
            </>
          )}
        </>
      )}
    </main>
  )
}

export default App
