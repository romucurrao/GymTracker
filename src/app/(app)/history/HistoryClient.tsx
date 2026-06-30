'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLang } from '@/lib/i18n/lang-context'
import TopBar from '@/components/layout/TopBar'

interface WorkoutSet {
  id: string
  exercise_id: string
  set_number: number
  reps: number | null
  weight: number | null
  exercise: { name: string; primary_muscle: string }
}

interface Session {
  id: string
  session_date: string
  notes: string | null
  routine: { name: string } | null
  workout_sets: WorkoutSet[]
  duration_seconds: number
  status: string
}

export default function HistoryClient({ sessions }: { sessions: Session[] }) {
  const { t } = useLang()
  const [expanded, setExpanded] = useState<string | null>(null)

  function formatDuration(seconds: number) {
    if (!seconds || seconds <= 0) return ''
    const m = Math.floor(seconds / 60)
    if (m < 60) return `${m}m`
    const h = Math.floor(m / 60)
    const remM = m % 60
    return `${h}h ${remM}m`
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr + 'T12:00:00')
    return d.toLocaleDateString('es-AR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
  }

  function getSummary(sets: WorkoutSet[]) {
    const exercises = [...new Set(sets.map((s) => s.exercise.name))]
    return exercises.slice(0, 3).join(', ') + (exercises.length > 3 ? ` +${exercises.length - 3}` : '')
  }

  // Agrupar sets por ejercicio dentro de la sesión
  function groupByExercise(sets: WorkoutSet[]) {
    return sets.reduce<Record<string, WorkoutSet[]>>((acc, s) => {
      if (!acc[s.exercise_id]) acc[s.exercise_id] = []
      acc[s.exercise_id].push(s)
      return acc
    }, {})
  }

  return (
    <div className="page-container">
      <TopBar />

      <div className="page-header">
        <h1 className="page-title">{t('history')}</h1>
      </div>

      {sessions.length === 0 ? (
        <div className="empty-state animate-in">
          <div className="empty-state-icon">📊</div>
          <div className="empty-state-title">{t('noHistory')}</div>
          <div className="empty-state-text">
            Empezá tu primer entrenamiento desde la pestaña Entrenar.
          </div>
        </div>
      ) : (
        <div className="animate-in">
          {sessions.map((session) => {
            const isExpanded = expanded === session.id
            const groups = groupByExercise(session.workout_sets)

            return (
              <div
                key={session.id}
                className="card"
                style={{ marginBottom: 10, cursor: 'pointer' }}
                onClick={() => setExpanded(isExpanded ? null : session.id)}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 4 }}>
                      {session.routine?.name ?? t('freeWorkout')}
                    </div>
                    <div className="text-xs text-muted" style={{ marginBottom: 6 }}>
                      {formatDate(session.session_date)}
                    </div>
                    {session.workout_sets.length > 0 && (
                      <div className="text-xs text-secondary" style={{ fontStyle: 'italic' }}>
                        {getSummary(session.workout_sets)}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, marginLeft: 12 }}>
                    <span className="tag tag-muted">{session.workout_sets.length} series</span>
                    {session.duration_seconds > 0 && (
                      <span className="tag tag-accent" style={{ fontSize: '0.7rem' }}>
                        ⏱️ {formatDuration(session.duration_seconds)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Detalle expandido */}
                {isExpanded && (
                  <div style={{ marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                    {session.notes && (
                      <div style={{
                        background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)',
                        padding: '10px 12px', marginBottom: 14,
                        fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic',
                      }}>
                        {session.notes}
                      </div>
                    )}

                    {Object.entries(groups).map(([exId, exSets]) => (
                      <div key={exId} style={{ marginBottom: 14 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: 8, color: 'var(--text-secondary)' }}>
                          <Link href={`/exercises/${exId}`} onClick={(e) => e.stopPropagation()} style={{ color: 'inherit' }}>
                            {exSets[0].exercise.name} ›
                          </Link>
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {exSets.map((s) => (
                            <div
                              key={s.id}
                              style={{
                                background: 'var(--bg-input)',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: 'var(--radius-sm)',
                                padding: '6px 10px',
                                fontSize: '0.8rem',
                                display: 'flex',
                                gap: 6,
                                alignItems: 'center',
                              }}
                            >
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>S{s.set_number}</span>
                              {s.reps && <span>{s.reps} reps</span>}
                              {s.weight && <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{s.weight} kg</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    <Link
                      href={`/workout/${session.id}`}
                      onClick={(e) => e.stopPropagation()}
                      style={{ display: 'inline-block' }}
                    >
                      <button className="btn btn-secondary btn-sm" style={{ marginTop: 4 }}>
                        Ver / editar sesión
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
