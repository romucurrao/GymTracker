'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useLang } from '@/lib/i18n/lang-context'
import type { Exercise } from '@/lib/types/database'
import TopBar from '@/components/layout/TopBar'

interface SetWithSession {
  id: string
  set_number: number
  reps: number | null
  weight: number | null
  notes: string | null
  created_at: string
  workout_session: {
    session_date: string
    routine_id: string | null
  } | null
}

interface Props {
  exercise: Exercise
  sets: SetWithSession[]
}

const TYPE_LABELS: Record<string, string> = {
  compuesto: 'Compuesto',
  aislamiento: 'Aislamiento',
  fuerza: 'Fuerza',
  calentamiento: 'Calentamiento',
  movilidad: 'Movilidad',
  cardio: 'Cardio',
  otro: 'Otro',
}

const LEVEL_ICON: Record<string, string> = {
  principiante: '🟢',
  intermedio: '🟡',
  avanzado: '🔴',
}

export default function ExerciseDetailClient({ exercise, sets }: Props) {
  const { t } = useLang()
  const router = useRouter()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const isOwned = !exercise.is_global

  // Calcular récord y último entrenamiento
  const weightedSets = sets.filter((s) => s.weight !== null && s.weight! > 0)
  const record = weightedSets.reduce((max, s) => Math.max(max, s.weight!), 0)
  const recordSet = weightedSets.find((s) => s.weight === record)
  const lastSet = sets[0]
  const lastDate = lastSet?.workout_session?.session_date

  // Agrupar por fecha
  const byDate = sets.reduce<Record<string, SetWithSession[]>>((acc, s) => {
    const date = s.workout_session?.session_date ?? s.created_at.split('T')[0]
    if (!acc[date]) acc[date] = []
    acc[date].push(s)
    return acc
  }, {})

  async function handleDelete() {
    const supabase = createClient()
    await supabase.from('exercises').delete().eq('id', exercise.id)
    router.push('/exercises')
    router.refresh()
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr + 'T12:00:00')
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  return (
    <div className="page-container">
      <TopBar showBack />

      <div className="page-header">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <h1 className="page-title" style={{ fontSize: '1.3rem' }}>{exercise.name}</h1>
            {exercise.is_global ? (
              <span style={{
                fontSize: '0.65rem', fontWeight: 700,
                color: '#94a3b8', background: 'rgba(148,163,184,0.1)',
                border: '1px solid rgba(148,163,184,0.2)',
                borderRadius: 4, padding: '2px 6px', flexShrink: 0,
              }}>
                BIBLIOTECA
              </span>
            ) : (
              <span style={{
                fontSize: '0.65rem', fontWeight: 700,
                color: 'var(--accent)', background: 'var(--accent-glow)',
                border: '1px solid var(--accent-border)',
                borderRadius: 4, padding: '2px 6px', flexShrink: 0,
              }}>
                MÍO
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span className="tag tag-muted">{exercise.primary_muscle}</span>
            <span className={`tag ${exercise.type === 'calentamiento' ? 'tag-warmup' : exercise.type === 'movilidad' ? 'tag-muted' : 'tag-accent'}`}>
              {TYPE_LABELS[exercise.type]}
            </span>
            {exercise.equipment && (
              <span className="tag tag-muted">🏋 {exercise.equipment}</span>
            )}
            {exercise.level && (
              <span className="tag tag-muted">
                {LEVEL_ICON[exercise.level]} {exercise.level}
              </span>
            )}
          </div>
        </div>

        {/* Solo mostrar botón editar en ejercicios propios */}
        {isOwned && (
          <Link href={`/exercises/${exercise.id}/edit`}>
            <button className="btn btn-secondary btn-sm" id="edit-exercise-btn">{t('edit')}</button>
          </Link>
        )}
      </div>

      {exercise.description && (
        <p className="text-secondary text-sm" style={{ marginBottom: 20, lineHeight: 1.7 }}>
          {exercise.description}
        </p>
      )}

      {exercise.secondary_muscles && exercise.secondary_muscles.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div className="section-title">Músculos secundarios</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {exercise.secondary_muscles.map((m) => (
              <span key={m} className="tag tag-muted">{m}</span>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      {sets.length > 0 && (
        <div className="stats-row">
          <div className="stat-block">
            <div className="stat-block-label">{t('historicalRecord')}</div>
            <div className="stat-block-value">
              {record > 0 ? `${record} ${t('kg')}` : '—'}
            </div>
            {recordSet?.workout_session?.session_date && (
              <div className="stat-block-sub">{formatDate(recordSet.workout_session.session_date)}</div>
            )}
          </div>

          <div className="stat-block">
            <div className="stat-block-label">{t('lastWorkout')}</div>
            <div className="stat-block-value">
              {lastSet?.weight ? `${lastSet.weight} ${t('kg')}` : `${lastSet?.reps ?? '—'} reps`}
            </div>
            {lastDate && <div className="stat-block-sub">{formatDate(lastDate)}</div>}
          </div>
        </div>
      )}

      {/* Historial */}
      <div className="section-title">{t('recentSessions')}</div>

      {sets.length === 0 ? (
        <div className="empty-state animate-in">
          <div className="empty-state-icon">📊</div>
          <div className="empty-state-title">{t('noHistory')}</div>
        </div>
      ) : (
        <div className="animate-in">
          {Object.entries(byDate).slice(0, 10).map(([date, dateSets]) => (
            <div key={date} style={{ marginBottom: 16 }}>
              <div style={{
                fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)',
                marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: 'var(--accent)', display: 'inline-block',
                }} />
                {formatDate(date)}
              </div>
              <div style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)', overflow: 'hidden',
              }}>
                <div style={{
                  display: 'grid', gridTemplateColumns: '32px 1fr 1fr 1fr',
                  padding: '8px 12px', borderBottom: '1px solid var(--border)',
                  fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>
                  <span>#</span>
                  <span>{t('reps')}</span>
                  <span>{t('weight')}</span>
                  <span>{t('notes')}</span>
                </div>
                {dateSets.map((s) => (
                  <div
                    key={s.id}
                    style={{
                      display: 'grid', gridTemplateColumns: '32px 1fr 1fr 1fr',
                      padding: '10px 12px', borderBottom: '1px solid var(--border)',
                      fontSize: '0.875rem', alignItems: 'center',
                    }}
                  >
                    <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{s.set_number}</span>
                    <span>{s.reps ?? '—'}</span>
                    <span style={{
                      color: s.weight === record && record > 0 ? 'var(--accent)' : 'inherit',
                      fontWeight: s.weight === record && record > 0 ? 700 : 400,
                    }}>
                      {s.weight ? `${s.weight} kg` : '—'}
                      {s.weight === record && record > 0 && ' 🏆'}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {s.notes ?? ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Solo mostrar opción de eliminar en ejercicios propios */}
      {isOwned && (
        <>
          <button
            className="btn btn-danger btn-full"
            onClick={() => setShowDeleteConfirm(true)}
            style={{ marginTop: 20 }}
            id="delete-exercise-btn"
          >
            {t('delete')} ejercicio
          </button>

          {showDeleteConfirm && (
            <div className="confirm-overlay" onClick={() => setShowDeleteConfirm(false)}>
              <div className="confirm-card" onClick={(e) => e.stopPropagation()}>
                <div className="confirm-title">{t('deleteExercise')}</div>
                <div className="confirm-text">{exercise.name}</div>
                <div className="confirm-actions">
                  <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowDeleteConfirm(false)}>
                    {t('cancel')}
                  </button>
                  <button className="btn btn-danger" style={{ flex: 1 }} onClick={handleDelete} id="confirm-delete-exercise">
                    {t('confirm')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Info de solo lectura para ejercicios globales */}
      {exercise.is_global && (
        <div style={{
          marginTop: 20, padding: '14px 16px',
          background: 'rgba(148,163,184,0.06)',
          border: '1px solid rgba(148,163,184,0.15)',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.82rem', color: 'var(--text-muted)',
        }}>
          🌐 Ejercicio de la biblioteca global. Solo lectura — no se puede editar ni eliminar.
        </div>
      )}
    </div>
  )
}
