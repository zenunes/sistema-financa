import { useAuth } from './hooks/useAuth'
import { useFinanceData } from './hooks/useFinanceData'
import { AuthView } from './components/AuthView'
import { CategorySection } from './components/CategorySection'
import { GoalSection } from './components/GoalSection'
import { RecurringSection } from './components/RecurringSection'
import { SummaryCards } from './components/SummaryCards'
import { TransactionSection } from './components/TransactionSection'
import './App.css'

function App() {
  const { session, loadingAuth, handleLogout } = useAuth()
  const {
    loading,
    error,
    setError,
    info,
    transactions,
    categories,
    goals,
    recurringTransactions,
    generatingRecurring,
    currentMonth,
    handleCreateTransaction,
    handleDeleteTransaction,
    handleCreateCategory,
    handleDeleteCategory,
    handleCreateGoal,
    handleDeleteGoal,
    handleCreateRecurringTransaction,
    handleToggleRecurringTransaction,
    handleDeleteRecurringTransaction,
    handleGenerateRecurringForMonth,
  } = useFinanceData(session?.user?.id)

  const isInitialLoading = loadingAuth || (session && loading)

  async function onLogout() {
    try {
      await handleLogout()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao sair.')
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
