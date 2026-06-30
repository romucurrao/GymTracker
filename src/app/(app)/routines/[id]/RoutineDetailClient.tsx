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
  onEdit,
  onDelete,
}: {
  re: RoutineItemWithExercise
  onEdit: (item: RoutineItemWithExercise) => void
  onDelete: (id: string) => void
}) {
  const { t } = useLang()
  if (!re.exercise) return null

  const setsList = re.routine_exercise_sets ?? []
  const sortedSets = [...setsList].sort((a, b) => a.set_number - b.set_number)

  let targetMeta = ''
  if (sortedSets.length > 0) {
    const setsText = sortedSets.map((s) => {
      if (s.target_reps !== null && s.target_weight !== null) {
        return `${s.target_reps}r @ ${s.target_weight}kg`
      }
      if (s.target_reps !== null) return `${s.target_reps}r`
      if (s.target_weight !== null) return `${s.target_weight}kg`
      return '—'
    }).join(' · ')
    targetMeta = `${sortedSets.length} series: ${setsText}`
  } else {
    targetMeta = 'Sin series configuradas'
  }

  // Estilos y colores por tipo de ejercicio
  const isCore = re.exercise.primary_muscle === 'Abdomen' || re.exercise.primary_muscle === 'Core' || re.exercise.primary_muscle === 'Oblicuos'
  const isMobility = re.exercise.type === 'movilidad'
  const isCardio = re.exercise.type === 'cardio'

  let itemClass = 'exercise-item'
  let emoji = '💪'

  if (isCore) {
    itemClass += ' exercise-item-core'
    emoji = '🎯'
  } else if (re.is_warmup || re.exercise.type === 'calentamiento') {
    itemClass += ' exercise-item-warmup'
    emoji = '🔥'
  } else if (isMobility) {
    itemClass += ' exercise-item-mobility'
    emoji = '🧘'
  } else if (isCardio) {
    itemClass += ' exercise-item-cardio'
    emoji = '🏃'
  }

  return (
    <div className={itemClass} style={{ marginBottom: 0 }}>
      <div style={{ fontSize: '1.2rem', flexShrink: 0 }}>
        {emoji}
      </div>
      <div className="exercise-item-info">
        <div className="exercise-item-name">{re.exercise.name}</div>
        <div className="exercise-item-meta" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
          {targetMeta}
        </div>
        {re.notes && (
          <div className="exercise-item-meta" style={{ marginTop: 2, fontStyle: 'italic' }}>
            {re.notes}
          </div>
        )}
      </div>
      <div className="exercise-item-actions" style={{ display: 'flex', gap: 4 }}>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => onEdit(re)}
          style={{ color: 'var(--accent)', minHeight: 'auto', padding: '6px 8px', fontSize: '0.8rem' }}
          id={`edit-item-${re.id}`}
        >
          ✏️
        </button>
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
      borderColor: 'var(--border)',
      background: 'rgba(148, 163, 184, 0.04)',
      marginBottom: 0
    }}>
      <div style={{ fontSize: '1.2rem', flexShrink: 0 }}>⏱️</div>
      <div className="exercise-item-info">
        <div className="exercise-item-name" style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>
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
  const [editingItem, setEditingItem] = useState<RoutineItemWithExercise | undefined>(undefined)
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
    setItems((prev) => {
      const exists = prev.some(item => item.id === newItem.id)
      if (exists) {
        return prev.map(item => item.id === newItem.id ? newItem : item).sort((a, b) => a.order_index - b.order_index)
      } else {
        return [...prev, newItem].sort((a, b) => a.order_index - b.order_index)
      }
    })
    setShowAddExerciseModal(false)
    setShowAddRestModal(false)
    setEditingItem(undefined)
  }

  function handleEditClick(item: RoutineItemWithExercise) {
    setEditingItem(item)
    setShowAddExerciseModal(true)
  }

  // Lógica de reordenamiento ▲ y ▼
  async function handleMoveItem(index: number, direction: 'up' | 'down') {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= items.length) return

    const newItems = [...items]
    const itemA = newItems[index]
    const itemB = newItems[targetIndex]

    const tempOrder = itemA.order_index
    itemA.order_index = itemB.order_index
    itemB.order_index = tempOrder

    newItems[index] = itemB
    newItems[targetIndex] = itemA

    setItems(newItems)

    try {
      const supabase = createClient()
      // Guardar el nuevo orden en paralelo en Supabase
      await Promise.all([
        supabase.from('routine_items').update({ order_index: itemA.order_index }).eq('id', itemA.id),
        supabase.from('routine_items').update({ order_index: itemB.order_index }).eq('id', itemB.id)
      ])
    } catch (err) {
      console.error('Error saving new items order:', err)
    }
  }

  return (
    <div className="page-container">
      <TopBar showBack />

      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ fontSize: '1.5rem' }}>{routine.name}</h1>
          <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
            {routine.days && routine.days.length > 0 && (
              <span className="tag tag-muted">
                {routine.days.map((d) => d.slice(0, 3)).join(', ')}
              </span>
            )}
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

      {/* Lista ordenada de elementos (Ejercicios y Descansos) con controles ▲ y ▼ */}
      <div style={{ marginBottom: 20 }}>
        <div className="section-title">Estructura de la rutina</div>
        {items.length === 0 ? (
          <div className="empty-state" style={{ padding: '24px 0' }}>
            <div className="empty-state-text">Esta rutina no tiene elementos todavía.</div>
          </div>
        ) : (
          <div>
            {items.map((item, index) => {
              const showUp = index > 0
              const showDown = index < items.length - 1

              const itemElement = item.item_type === 'rest' ? (
                <RestItem item={item} onDelete={handleDeleteItem} />
              ) : (
                <ExerciseItem
                  re={item}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteItem}
                />
              )

              return (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }} className="animate-in">
                  {/* Controles de reordenamiento ▲ y ▼ */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0, alignItems: 'center' }}>
                    <button
                      type="button"
                      disabled={!showUp}
                      onClick={() => handleMoveItem(index, 'up')}
                      style={{
                        background: 'none', border: 'none',
                        color: showUp ? 'var(--accent)' : 'var(--text-muted)',
                        cursor: showUp ? 'pointer' : 'default', padding: '2px 4px', fontSize: '0.8rem',
                        opacity: showUp ? 1 : 0.2, transition: 'all 0.15s'
                      }}
                      title="Mover arriba"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      disabled={!showDown}
                      onClick={() => handleMoveItem(index, 'down')}
                      style={{
                        background: 'none', border: 'none',
                        color: showDown ? 'var(--accent)' : 'var(--text-muted)',
                        cursor: showDown ? 'pointer' : 'default', padding: '2px 4px', fontSize: '0.8rem',
                        opacity: showDown ? 1 : 0.2, transition: 'all 0.15s'
                      }}
                      title="Mover abajo"
                    >
                      ▼
                    </button>
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    {itemElement}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Botones de agregar ordenados */}
      <div className="form-row" style={{ marginBottom: 12 }}>
        <button
          className="btn btn-secondary"
          onClick={() => {
            setEditingItem(undefined)
            setShowAddExerciseModal(true)
          }}
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

      {/* Modal agregar/editar ejercicio */}
      {showAddExerciseModal && (
        <AddExerciseModal
          routineId={routine.id}
          currentCount={items.length}
          editingItem={editingItem}
          onClose={() => {
            setShowAddExerciseModal(false)
            setEditingItem(undefined)
          }}
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
