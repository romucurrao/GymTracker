'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useLang } from '@/lib/i18n/lang-context'
import type { Routine } from '@/lib/types/database'
import TopBar from '@/components/layout/TopBar'

interface Session {
  id: string
  session_date: string
  notes: string | null
  routine: { name: string } | null
}

interface Props {
  routines: Routine[]
  sessions: Session[]
}

export default function WorkoutHomeClient({ routines, sessions }: Props) {
  const { t } = useLang()
  const router = useRouter()
  const [selectedRoutine, setSelectedRoutine] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleStart() {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('workout_sessions')
      .insert({
        user_id: user.id,
        routine_id: selectedRoutine || null,
        session_date: new Date().toISOString().split('T')[0],
      })
      .select()
      .single()

    if (!error && data) {
      router.push(`/workout/${data.id}`)
    }
    setLoading(false)
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr + 'T12:00:00')
    return d.toLocaleDateString('es-AR', { weekday: 'short', day: '2-digit', month: 'short' })
  }

  return (
    <div className="page-container">
      <TopBar />

      <div className="page-header">
        <h1 className="page-title">{t('workout')}</h1>
      </div>

      {/* Selector de rutina */}
      <div style={{ marginBottom: 16 }}>
        <div className="section-title">{t('selectRoutine')}</div>
        <select
          className="form-select"
          value={selectedRoutine}
          onChange={(e) => setSelectedRoutine(e.target.value)}
          id="select-routine-workout"
        >
          <option value="">{t('freeWorkout')}</option>
          {routines.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </div>

      <button
        className="btn btn-primary btn-full btn-lg"
        onClick={handleStart}
        disabled={loading}
        id="start-session-btn"
        style={{ marginBottom: 32 }}
      >
        {loading
          ? <><span className="spinner" /> {t('loading')}</>
          : `▶ ${t('startSession')}`}
      </button>

      {/* Historial reciente */}
      {sessions.length > 0 && (
        <>
          <div className="section-title">{t('recentSessions')}</div>
          {sessions.map((session) => (
            <Link
              key={session.id}
              href={`/workout/${session.id}`}
              className="card card-clickable"
              style={{ display: 'block', marginBottom: 10 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 4 }}>
                    {session.routine?.name ?? t('freeWorkout')}
                  </div>
                  <div className="text-sm text-muted">{formatDate(session.session_date)}</div>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>›</div>
              </div>
            </Link>
          ))}
        </>
      )}
    </div>
  )
}
