'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useLang } from '@/lib/i18n/lang-context'
import type { Routine, RoutineExerciseWithExercise, Exercise } from '@/lib/types/database'
import TopBar from '@/components/layout/TopBar'
import AddExerciseModal from '@/components/routines/AddExerciseModal'

interface Props {
  routine: Routine
  routineExercises: RoutineExerciseWithExercise[]
}

function ExerciseItem({
  re,
  onDelete,
}: {
  re: RoutineExerciseWithExercise
  onDelete: (id: string) => void
}) {
  const { t } = useLang()

  return (
    <div className={`exercise-item ${re.is_warmup ? 'exercise-item-warmup' : ''}`}>
      <div style={{ fontSize: '1.2rem', flexShrink: 0 }}>
        {re.is_warmup ? '🔥' : '💪'}
      </div>
      <div className="exercise-item-info">
        <div className="exercise-item-name">{re.exercise.name}</div>
        <div className="exercise-item-meta">
          {[
            re.target_sets && `${re.target_sets} ${t('sets')}`,
            re.target_reps && `${re.target_reps} ${t('reps')}`,
            re.target_weight && `${re.target_weight} ${t('kg')}`,
          ].filter(Boolean).join(' · ')}
        </div>
        {re.notes && (
          <div className="exercise-item-meta" style={{ marginTop: 2, fontStyle: 'italic' }}>
            {re.notes}
          </div>
        )}
      </div>
      <div className="exercise-item-actions">
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => onDelete(re.id)}
          style={{ color: '#f87171', minHeight: 'auto', padding: '6px 8px' }}
        >
          ✕
        </button>
      </div>
    </div>
  )
}

export default function RoutineDetailClient({ routine, routineExercises: initial }: Props) {
  const { t } = useLang()
  const router = useRouter()
  const [exercises, setExercises] = useState(initial)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const warmups = exercises.filter((e) => e.is_warmup)
  const mains = exercises.filter((e) => !e.is_warmup)

  async function handleDeleteExercise(reId: string) {
    const supabase = createClient()
    await supabase.from('routine_exercises').delete().eq('id', reId)
    setExercises((prev) => prev.filter((e) => e.id !== reId))
  }

  async function handleDeleteRoutine() {
    const supabase = createClient()
    await supabase.from('routines').delete().eq('id', routine.id)
    router.push('/dashboard')
    router.refresh()
  }

  function handleExerciseAdded(newRe: RoutineExerciseWithExercise) {
    setExercises((prev) => [...prev, newRe])
    setShowAddModal(false)
  }

  return (
    <div className="page-container">
      <TopBar showBack />

      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ fontSize: '1.5rem' }}>{routine.name}</h1>
          <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
            {routine.day && <span className="tag tag-muted">{routine.day}</span>}
            {routine.main_muscle_group && <span className="tag tag-accent">{routine.main_muscle_group}</span>}
          </div>
        </div>
        <Link href={`/routines/${routine.id}/edit`}>
          <button className="btn btn-secondary btn-sm" id="edit-routine-btn">{t('edit')}</button>
        </Link>
      </div>

      {routine.description && (
        <p className="text-secondary text-sm" style={{ marginBottom: 20, lineHeight: 1.7 }}>
          {routine.description}
        </p>
      )}

      {/* Calentamiento */}
      {warmups.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div className="section-title" style={{ color: 'var(--warmup)' }}>
            🔥 {t('warmup')}
          </div>
          {warmups.map((re) => (
            <ExerciseItem key={re.id} re={re} onDelete={handleDeleteExercise} />
          ))}
        </div>
      )}

      {/* Ejercicios principales */}
      <div style={{ marginBottom: 20 }}>
        <div className="section-title">{t('mainExercises')}</div>
        {mains.length === 0 ? (
          <div className="empty-state" style={{ padding: '24px 0' }}>
            <div className="empty-state-text">{t('noExercises')}</div>
          </div>
        ) : (
          mains.map((re) => (
            <ExerciseItem key={re.id} re={re} onDelete={handleDeleteExercise} />
          ))
        )}
      </div>

      {/* Botón agregar ejercicio */}
      <button
        className="btn btn-secondary btn-full"
        onClick={() => setShowAddModal(true)}
        id="add-exercise-btn"
        style={{ marginBottom: 12 }}
      >
        {t('addExercise')}
      </button>

      {/* Iniciar entrenamiento */}
      <Link href={`/workout/new?routine=${routine.id}`}>
        <button className="btn btn-primary btn-full btn-lg" id="start-workout-btn">
          {t('startWorkout')}
        </button>
      </Link>

      {/* Eliminar rutina */}
      <button
        className="btn btn-danger btn-full"
        onClick={() => setShowDeleteConfirm(true)}
        style={{ marginTop: 16 }}
        id="delete-routine-btn"
      >
        {t('delete')} {t('routine')}
      </button>

      {/* Modal agregar ejercicio */}
      {showAddModal && (
        <AddExerciseModal
          routineId={routine.id}
          currentCount={exercises.length}
          onClose={() => setShowAddModal(false)}
          onAdded={handleExerciseAdded}
        />
      )}

      {/* Confirm delete */}
      {showDeleteConfirm && (
        <div className="confirm-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="confirm-card" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-title">{t('deleteRoutine')}</div>
            <div className="confirm-text">{routine.name}</div>
            <div className="confirm-actions">
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowDeleteConfirm(false)}>
                {t('cancel')}
              </button>
              <button className="btn btn-danger" style={{ flex: 1 }} onClick={handleDeleteRoutine} id="confirm-delete-btn">
                {t('confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
