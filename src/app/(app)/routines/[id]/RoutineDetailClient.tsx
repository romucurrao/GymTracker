'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useLang } from '@/lib/i18n/lang-context'
import type { Routine, RoutineItemWithExercise } from '@/lib/types/database'
import TopBar from '@/components/layout/TopBar'
import AddExerciseModal from '@/components/routines/AddExerciseModal'
import AddRestModal from '@/components/routines/AddRestModal'

interface Props {
  routine: Routine
  initialItems: RoutineItemWithExercise[]
}

function ExerciseItem({
  re,
  onDelete,
}: {
  re: RoutineItemWithExercise
  onDelete: (id: string) => void
}) {
  const { t } = useLang()
  if (!re.exercise) return null

  return (
    <div className={`exercise-item ${re.is_warmup ? 'exercise-item-warmup' : ''}`}>
      <div style={{ fontSize: '1.2rem', flexShrink: 0 }}>
        {re.is_warmup ? '🔥' : '💪'}
      </div>
      <div className="exercise-item-info">
        <div className="exercise-item-name">{re.exercise.name}</div>
        <div className="exercise-item-meta">
          {[
            re.is_warmup && t('warmup'),
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

function RestItem({
  item,
  onDelete,
}: {
  item: RoutineItemWithExercise
  onDelete: (id: string) => void
}) {
  const label = item.rest_label || 'Descanso'
  const minSec = item.rest_min_seconds
  const maxSec = item.rest_max_seconds

  const formatTime = (secs: number) => {
    if (secs % 60 === 0) return `${secs / 60} min`
    return `${secs} seg`
  }

  let durationText = ''
  if (minSec) {
    if (minSec === maxSec || !maxSec) {
      durationText = formatTime(minSec)
    } else {
      if (minSec % 60 === 0 && maxSec % 60 === 0) {
        durationText = `${minSec / 60} a ${maxSec / 60} min`
      } else {
        durationText = `${minSec} a ${maxSec} seg`
      }
    }
  }

  return (
    <div className="exercise-item" style={{
      borderColor: 'var(--warmup-border)',
      background: 'var(--warmup-dim)',
    }}>
      <div style={{ fontSize: '1.2rem', flexShrink: 0 }}>⏱️</div>
      <div className="exercise-item-info">
        <div className="exercise-item-name" style={{ color: 'var(--warmup)', fontWeight: 700 }}>
          {label}
        </div>
        <div className="exercise-item-meta" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
          Duración: {durationText}
        </div>
        {item.notes && (
          <div className="exercise-item-meta" style={{ marginTop: 2, fontStyle: 'italic' }}>
            {item.notes}
          </div>
        )}
      </div>
      <div className="exercise-item-actions">
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => onDelete(item.id)}
          style={{ color: '#f87171', minHeight: 'auto', padding: '6px 8px' }}
        >
          ✕
        </button>
      </div>
    </div>
  )
}

export default function RoutineDetailClient({ routine, initialItems }: Props) {
  const { t } = useLang()
  const router = useRouter()
  const [items, setItems] = useState<RoutineItemWithExercise[]>(initialItems)
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false)
  const [showAddRestModal, setShowAddRestModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  async function handleDeleteItem(itemId: string) {
    try {
      const supabase = createClient()
      await supabase.from('routine_items').delete().eq('id', itemId)
      setItems((prev) => prev.filter((item) => item.id !== itemId))
    } catch (err) {
      console.error('Error deleting item', err)
    }
  }

  async function handleDeleteRoutine() {
    try {
      const supabase = createClient()
      await supabase.from('routines').delete().eq('id', routine.id)
      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      console.error(err)
    }
  }

  function handleItemAdded(newItem: RoutineItemWithExercise) {
    setItems((prev) => [...prev, newItem].sort((a, b) => a.order_index - b.order_index))
    setShowAddExerciseModal(false)
    setShowAddRestModal(false)
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

      {/* Lista ordenada de elementos (Ejercicios y Descansos) */}
      <div style={{ marginBottom: 20 }}>
        <div className="section-title">Estructura de la rutina</div>
        {items.length === 0 ? (
          <div className="empty-state" style={{ padding: '24px 0' }}>
            <div className="empty-state-text">Esta rutina no tiene elementos todavía.</div>
          </div>
        ) : (
          <div>
            {items.map((item) => {
              if (item.item_type === 'rest') {
                return (
                  <RestItem key={item.id} item={item} onDelete={handleDeleteItem} />
                )
              } else {
                return (
                  <ExerciseItem key={item.id} re={item} onDelete={handleDeleteItem} />
                )
              }
            })}
          </div>
        )}
      </div>

      {/* Botones de agregar ordenados */}
      <div className="form-row" style={{ marginBottom: 12 }}>
        <button
          className="btn btn-secondary"
          onClick={() => setShowAddExerciseModal(true)}
          id="add-exercise-btn"
        >
          {t('addExercise')}
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => setShowAddRestModal(true)}
          id="add-rest-btn"
          style={{ borderColor: 'var(--warmup-border)', color: 'var(--warmup)' }}
        >
          ⏱️ Descanso
        </button>
      </div>

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
      {showAddExerciseModal && (
        <AddExerciseModal
          routineId={routine.id}
          currentCount={items.length}
          onClose={() => setShowAddExerciseModal(false)}
          onAdded={handleItemAdded}
        />
      )}

      {/* Modal agregar descanso */}
      {showAddRestModal && (
        <AddRestModal
          routineId={routine.id}
          currentCount={items.length}
          onClose={() => setShowAddRestModal(false)}
          onAdded={handleItemAdded}
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
