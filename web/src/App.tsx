import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { AuthView } from './components/AuthView'
import { CategorySection } from './components/CategorySection'
import { GoalSection } from './components/GoalSection'
import { RecurringSection } from './components/RecurringSection'
import { SummaryCards } from './components/SummaryCards'
import { TransactionSection } from './components/TransactionSection'
import { supabase } from './lib/supabase'
import {
  createCategory,
  createGoal,
  createRecurringTransaction,
  createTransaction,
  deleteCategory,
  deleteGoal,
  deleteRecurringTransaction,
  deleteTransaction,
  fetchFinanceData,
  generateRecurringTransactionsForMonth,
  toggleRecurringTransaction,
} from './services/financeService'
import type {
  Category,
  Goal,
  RecurringTransaction,
  Transaction,
  TransactionType,
} from './types/finance'
import './App.css'

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([])
  const [generatingRecurring, setGeneratingRecurring] = useState(false)
  const currentMonth = new Date().toISOString().slice(0, 7)

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setSession(data.session)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!session?.user?.id) {
      setTransactions([])
      setCategories([])
      setGoals([])
      setRecurringTransactions([])
      return
    }

    loadFinanceData(session.user.id)
  }, [session?.user?.id])

  async function loadFinanceData(userId: string) {
    setError('')
    setInfo('')
    setLoading(true)

    try {
      const data = await fetchFinanceData(userId)
      setTransactions(data.transactions)
      setCategories(data.categories)
      setGoals(data.goals)
      setRecurringTransactions(data.recurringTransactions)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Erro ao carregar dados.')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateTransaction(params: {
    description: string
    amount: number
    type: TransactionType
    categoryId?: string
    transactionDate: string
  }) {
    if (!session?.user?.id) return

    try {
      await createTransaction({ ...params, userId: session.user.id })
      await loadFinanceData(session.user.id)
      setInfo('Lançamento criado com sucesso.')
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Erro ao criar lançamento.')
    }
  }

  async function handleDeleteTransaction(id: string) {
    if (!session?.user?.id) return

    try {
      await deleteTransaction(id)
      await loadFinanceData(session.user.id)
      setInfo('Lançamento excluído.')
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Erro ao excluir lançamento.')
    }
  }

  async function handleCreateCategory(params: { name: string; type: TransactionType }) {
    if (!session?.user?.id) return

    try {
      await createCategory({ ...params, userId: session.user.id })
      await loadFinanceData(session.user.id)
      setInfo('Categoria criada com sucesso.')
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Erro ao criar categoria.')
    }
  }

  async function handleDeleteCategory(id: string) {
    if (!session?.user?.id) return

    try {
      await deleteCategory(id)
      await loadFinanceData(session.user.id)
      setInfo('Categoria excluída.')
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Erro ao excluir categoria.')
    }
  }

  async function handleCreateRecurringTransaction(params: {
    description: string
    amount: number
    type: TransactionType
    dueDay: number
    categoryId?: string
  }) {
    if (!session?.user?.id) return

    try {
      await createRecurringTransaction({ ...params, userId: session.user.id })
      await loadFinanceData(session.user.id)
      setInfo('Recorrência criada com sucesso.')
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Erro ao criar recorrência.')
    }
  }

  async function handleToggleRecurringTransaction(id: string, active: boolean) {
    if (!session?.user?.id) return

    try {
      await toggleRecurringTransaction(id, active)
      await loadFinanceData(session.user.id)
      setInfo(active ? 'Recorrência ativada.' : 'Recorrência pausada.')
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Erro ao atualizar recorrência.')
    }
  }

  async function handleDeleteRecurringTransaction(id: string) {
    if (!session?.user?.id) return

    try {
      await deleteRecurringTransaction(id)
      await loadFinanceData(session.user.id)
      setInfo('Recorrência excluída.')
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Erro ao excluir recorrência.')
    }
  }

  async function handleGenerateRecurringForMonth() {
    if (!session?.user?.id) return

    setGeneratingRecurring(true)
    try {
      const generatedCount = await generateRecurringTransactionsForMonth(
        session.user.id,
        currentMonth,
      )
      await loadFinanceData(session.user.id)
      setInfo(
        generatedCount > 0
          ? `${generatedCount} lançamento(s) recorrente(s) gerado(s) para ${currentMonth}.`
          : `Sem novos lançamentos recorrentes para ${currentMonth}.`,
      )
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Erro ao gerar recorrências.')
    } finally {
      setGeneratingRecurring(false)
    }
  }

  async function handleCreateGoal(params: {
    title: string
    targetAmount: number
    currentAmount: number
    dueDate?: string
  }) {
    if (!session?.user?.id) return

    try {
      await createGoal({ ...params, userId: session.user.id })
      await loadFinanceData(session.user.id)
      setInfo('Meta criada com sucesso.')
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Erro ao criar meta.')
    }
  }

  async function handleDeleteGoal(id: string) {
    if (!session?.user?.id) return

    try {
      await deleteGoal(id)
      await loadFinanceData(session.user.id)
      setInfo('Meta excluída.')
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Erro ao excluir meta.')
    }
  }

  async function handleLogout() {
    const { error: logoutError } = await supabase.auth.signOut()
    if (logoutError) setError(logoutError.message)
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
            <button type="button" onClick={handleLogout}>
              Sair
            </button>
          </header>

          {loading && <p className="status">Carregando dados...</p>}
          {error && <p className="status error">{error}</p>}
          {!error && info && <p className="status success">{info}</p>}

          {!loading && (
            <>
              <SummaryCards transactions={transactions} goals={goals} />
              <RecurringSection
                categories={categories}
                recurringTransactions={recurringTransactions}
                month={currentMonth}
                generating={generatingRecurring}
                onGenerateMonth={handleGenerateRecurringForMonth}
                onCreate={handleCreateRecurringTransaction}
                onToggleActive={handleToggleRecurringTransaction}
                onDelete={handleDeleteRecurringTransaction}
              />
              <TransactionSection
                categories={categories}
                transactions={transactions}
                onCreate={handleCreateTransaction}
                onDelete={handleDeleteTransaction}
              />
              <div className="dual-grid">
                <CategorySection
                  categories={categories}
                  onCreate={handleCreateCategory}
                  onDelete={handleDeleteCategory}
                />
                <GoalSection goals={goals} onCreate={handleCreateGoal} onDelete={handleDeleteGoal} />
              </div>
            </>
          )}
        </>
      )}
    </main>
  )
}

export default App
