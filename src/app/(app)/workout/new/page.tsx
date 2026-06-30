'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useLang } from '@/lib/i18n/lang-context'

function NewWorkoutContent() {
  const { t } = useLang()
  const router = useRouter()
  const searchParams = useSearchParams()
  const routineId = searchParams.get('routine')
  const [error, setError] = useState('')

  useEffect(() => {
    async function startSession() {
      try {
        const supabase = createClient()
        const { data: authData } = await supabase.auth.getUser()
        const user = authData?.user
        if (!user) {
          router.replace('/login')
          return
        }

        // Crear sesión de entrenamiento con started_at y status default
        const { data, error: dbError } = await supabase
          .from('workout_sessions')
          .insert({
            user_id: user.id,
            routine_id: routineId || null,
            session_date: new Date().toISOString().split('T')[0],
            status: 'active',
            started_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (dbError) {
          console.error(dbError)
          setError(dbError.message)
          return
        }

        if (data) {
          router.replace(`/workout/${data.id}`)
        }
      } catch (err: any) {
        console.error(err)
        setError(err.message || 'Error al iniciar entrenamiento')
      }
    }

    startSession()
  }, [routineId, router])

  return (
    <div className="card animate-in" style={{ width: '100%', maxWidth: 400, textAlign: 'center', padding: '32px 24px' }}>
      <div style={{ fontSize: '3rem', marginBottom: 16 }}>⚡</div>
      {error ? (
        <div>
          <div className="auth-error" style={{ marginBottom: 16 }}>{error}</div>
          <button className="btn btn-secondary btn-full" onClick={() => router.back()}>
            {t('back')}
          </button>
        </div>
      ) : (
        <div>
          <div style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: 12 }}>
            {t('loading')}
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 20 }}>
            Preparando tu sesión de entrenamiento...
          </div>
          <span className="spinner" style={{ width: 32, height: 32, color: 'var(--accent)' }} />
        </div>
      )}
    </div>
  )
}

export default function NewWorkoutPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      background: 'var(--bg-primary)',
      color: 'var(--text-primary)',
    }}>
      <Suspense fallback={
        <div className="card" style={{ width: '100%', maxWidth: 400, textAlign: 'center', padding: '32px 24px' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>⚡</div>
          <div style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: 12 }}>Cargando...</div>
          <span className="spinner" style={{ width: 32, height: 32, color: 'var(--accent)' }} />
        </div>
      }>
        <NewWorkoutContent />
      </Suspense>
    </div>
  )
}
