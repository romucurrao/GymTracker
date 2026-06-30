'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useLang } from '@/lib/i18n/lang-context'

export default function RegisterPage() {
  const { t } = useLang()
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    })

    if (authError) {
      setError(t('registerError'))
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="auth-page">
      <div className="auth-card animate-in">
        <div className="auth-logo">
          <div className="auth-logo-icon">🏋️</div>
          <div className="auth-logo-title">Gym Tracker</div>
          <div className="auth-logo-sub">Creá tu cuenta gratis.</div>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">{t('name')}</label>
            <input
              id="name"
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
              required
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">{t('email')}</label>
            <input
              id="email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">{t('password')}</label>
            <input
              id="password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={loading}
            id="register-btn"
          >
            {loading ? <><span className="spinner" /> {t('loading')}</> : t('register')}
          </button>
        </form>

        <div className="auth-footer">
          {t('hasAccount')}{' '}
          <Link href="/login" className="auth-link">
            {t('login')}
          </Link>
        </div>
      </div>
    </div>
  )
}
