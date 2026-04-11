import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'

interface AuthViewProps {
  onAuthError: (message: string) => void
}

export function AuthView({ onAuthError }: AuthViewProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onAuthError('')
    setLoading(true)

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
      }
    } catch (error) {
      onAuthError(error instanceof Error ? error.message : 'Erro ao autenticar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="auth-card">
      <h1>Finanças Pessoais</h1>
      <p className="muted">Controle simples de receitas, despesas, categorias e metas.</p>
      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          E-mail
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="voce@email.com"
          />
        </label>
        <label>
          Senha
          <input
            required
            minLength={6}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="******"
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? 'Carregando...' : isLogin ? 'Entrar' : 'Criar conta'}
        </button>
      </form>

      <button type="button" className="link-button" onClick={() => setIsLogin((value) => !value)}>
        {isLogin ? 'Ainda não tem conta? Criar conta' : 'Já tem conta? Entrar'}
      </button>
    </section>
  )
}
