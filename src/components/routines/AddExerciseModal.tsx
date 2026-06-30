'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLang } from '@/lib/i18n/lang-context'
import type { Exercise, RoutineItemWithExercise } from '@/lib/types/database'

interface Props {
  routineId: string
  currentCount: number
  editingItem?: RoutineItemWithExercise
  onClose: () => void
  onAdded: (re: RoutineItemWithExercise) => void
}

interface SetInput {
  reps: string
  weight: string
}

const TYPE_COLORS: Record<string, string> = {
  compuesto: 'tag-accent',
  aislamiento: 'tag-accent',
  fuerza: 'tag-accent',
  calentamiento: 'tag-warmup',
  movilidad: 'tag-mobility',
  cardio: 'tag-cardio',
  otro: 'tag-muted',
}

const TYPE_LABELS: Record<string, string> = {
  compuesto: 'Fuerza',
  aislamiento: 'Fuerza',
  fuerza: 'Fuerza',
  calentamiento: 'Calentamiento',
  movilidad: 'Movilidad',
  cardio: 'Cardio',
  otro: 'Otro',
}

export default function AddExerciseModal({ routineId, currentCount, editingItem, onClose, onAdded }: Props) {
  const { t } = useLang()
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [selected, setSelected] = useState<Exercise | null>(editingItem?.exercise ?? null)
  const [search, setSearch] = useState('')
  const [isWarmup, setIsWarmup] = useState(editingItem?.is_warmup ?? false)
  const [notes, setNotes] = useState(editingItem?.notes ?? '')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'select' | 'config'>(editingItem ? 'config' : 'select')
  const [typeFilter, setTypeFilter] = useState<'all' | 'fuerza' | 'calentamiento' | 'movilidad' | 'cardio'>('all')

  // Estado para la configuración de cada serie
  const [setsConfig, setSetsConfig] = useState<SetInput[]>([])

  // Inicializar setsConfig si estamos editando
  useEffect(() => {
    if (editingItem && editingItem.routine_exercise_sets) {
      const sorted = [...editingItem.routine_exercise_sets].sort((a, b) => a.set_number - b.set_number)
      setSetsConfig(sorted.map(s => ({
        reps: String(s.target_reps ?? ''),
        weight: String(s.target_weight ?? '')
      })))
    } else {
      // 3 series por defecto para ejercicios nuevos
      setSetsConfig([
        { reps: '10', weight: '' },
        { reps: '10', weight: '' },
        { reps: '10', weight: '' },
      ])
    }
  }, [editingItem])

  useEffect(() => {
    if (editingItem) return
    async function load() {
      const supabase = createClient()
      const { data } = await supabase.from('exercises').select('*').order('name')
      setExercises(data ?? [])
    }
    load()
  }, [editingItem])

  // Helper para normalizar caracteres (eliminar acentos y minúsculas)
  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
  }

  // Filtrado de ejercicios aplicando normalización de búsqueda
  const filtered = exercises.filter((e) => {
    // 1. Filtro por buscador (sin importar tildes)
    const term = normalizeText(search)
    const nameMatch = normalizeText(e.name).includes(term)
    const muscleMatch = normalizeText(e.primary_muscle).includes(term)
    const equipmentMatch = e.equipment ? normalizeText(e.equipment).includes(term) : false
    const matchSearch = nameMatch || muscleMatch || equipmentMatch

    // 2. Filtro por tipo de ejercicio
    let matchType = true
    if (typeFilter === 'fuerza') {
      matchType = e.type === 'fuerza' || e.type === 'compuesto' || e.type === 'aislamiento'
    } else if (typeFilter === 'calentamiento') {
      // Calentamiento es inclusivo de movilidad para encontrarlo fácil
      matchType = e.type === 'calentamiento' || e.type === 'movilidad'
    } else if (typeFilter === 'movilidad') {
      matchType = e.type === 'movilidad'
    } else if (typeFilter === 'cardio') {
      matchType = e.type === 'cardio'
    }

    return matchSearch && matchType
  })

  // Ajusta dinámicamente la lista de series
  const handleSetsCountChange = (countStr: string) => {
    const count = parseInt(countStr)
    if (isNaN(count) || count < 0) return

    setSetsConfig((prev) => {
      const next = [...prev]
      if (count > next.length) {
        const last = next[next.length - 1] || { reps: '10', weight: '' }
        while (next.length < count) {
          next.push({ ...last })
        }
      } else if (count < next.length) {
        next.splice(count)
      }
      return next
    })
  }

  const updateSetInput = (index: number, field: keyof SetInput, value: string) => {
    setSetsConfig((prev) => prev.map((item, i) => i === index ? { ...item, [field]: value } : item))
  }

  async function handleSave() {
    if (!selected) return
    setLoading(true)

    const supabase = createClient()
    const { data: authData } = await supabase.auth.getUser()
    const user = authData?.user
    if (!user) return

    try {
      let itemId = editingItem?.id
      let resultItem: any = null

      const payload = {
        user_id: user.id,
        routine_id: routineId,
        exercise_id: selected.id,
        item_type: 'exercise' as const,
        is_warmup: isWarmup,
        notes: notes.trim() || null,
        target_sets: setsConfig.length,
        target_reps: setsConfig[0] ? parseInt(setsConfig[0].reps) : null,
        target_weight: setsConfig[0] ? parseFloat(setsConfig[0].weight) : null,
      }

      if (editingItem) {
        const { data, error } = await supabase
          .from('routine_items')
          .update(payload)
          .eq('id', editingItem.id)
          .select('*, exercise:exercises(*)')
          .single()

        if (error) throw error
        resultItem = data
      } else {
        const { data, error } = await supabase
          .from('routine_items')
          .insert({
            ...payload,
            order_index: currentCount,
          })
          .select('*, exercise:exercises(*)')
          .single()

        if (error) throw error
        resultItem = data
        itemId = data.id
      }

      if (itemId) {
        await supabase
          .from('routine_exercise_sets')
          .delete()
          .eq('routine_item_id', itemId)

        const setsToInsert = setsConfig.map((s, idx) => ({
          user_id: user.id,
          routine_item_id: itemId!,
          set_number: idx + 1,
          target_reps: s.reps ? parseInt(s.reps) : null,
          target_weight: s.weight ? parseFloat(s.weight) : null,
        }))

        if (setsToInsert.length > 0) {
          const { data: insertedSets, error: setsError } = await supabase
            .from('routine_exercise_sets')
            .insert(setsToInsert)
            .select()

          if (setsError) throw setsError
          resultItem.routine_exercise_sets = insertedSets
        } else {
          resultItem.routine_exercise_sets = []
        }
      }

      onAdded(resultItem as RoutineItemWithExercise)
    } catch (err: any) {
      console.error(err)
      alert(err.message || 'Error al guardar el ejercicio')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />

        {step === 'select' ? (
          <>
            <div className="modal-title">{t('addExercise')}</div>

            <input
              className="form-input"
              placeholder="Buscar por nombre, músculo (sin tildes)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              style={{ marginBottom: 12 }}
            />

            {/* Categorías de filtro principal en el modal */}
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 8, marginBottom: 16 }}>
              {[
                { key: 'all', label: 'Todos' },
                { key: 'fuerza', label: '💪 Fuerza' },
                { key: 'calentamiento', label: '🔥 Calentamiento (+Movilidad)' },
                { key: 'movilidad', label: '🧘 Solo Movilidad' },
                { key: 'cardio', label: '🏃 Cardio' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTypeFilter(key as any)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 'var(--radius-full)',
                    border: `1px solid ${typeFilter === key ? 'var(--accent)' : 'var(--border-subtle)'}`,
                    background: typeFilter === key ? 'var(--accent-glow)' : 'transparent',
                    color: typeFilter === key ? 'var(--accent)' : 'var(--text-muted)',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            <div style={{ maxHeight: '42vh', overflowY: 'auto' }}>
              {filtered.length === 0 && (
                <div className="empty-state" style={{ padding: '24px 0' }}>
                  <div className="empty-state-text">No hay ejercicios. ¡Creá uno primero!</div>
                </div>
              )}
              {filtered.map((ex) => {
                const isCore = ex.primary_muscle === 'Abdomen' || ex.primary_muscle === 'Core' || ex.primary_muscle === 'Oblicuos'
                const tagColorClass = isCore ? 'tag-core' : (TYPE_COLORS[ex.type] || 'tag-muted')
                const tagLabel = isCore ? 'Core' : TYPE_LABELS[ex.type] || ex.type

                return (
                  <div
                    key={ex.id}
                    className={`card card-clickable`}
                    onClick={() => {
                      setSelected(ex)
                      setIsWarmup(ex.type === 'calentamiento')
                      setStep('config')
                    }}
                    style={{
                      marginBottom: 8,
                      border: selected?.id === ex.id ? '1px solid var(--accent)' : undefined,
                    }}
                  >
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{ex.name}</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <span className="tag tag-muted">{ex.primary_muscle}</span>
                      <span className={`tag ${tagColorClass}`}>
                        {tagLabel}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          <>
            <div className="modal-title">
              {!editingItem && (
                <button
                  onClick={() => setStep('select')}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.9rem', marginRight: 8 }}
                >
                  ←
                </button>
              )}
              {editingItem ? 'Editar: ' : ''}{selected?.name}
            </div>

            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="checkbox-group">
                <input
                  type="checkbox"
                  checked={isWarmup}
                  onChange={(e) => setIsWarmup(e.target.checked)}
                />
                <span className="text-sm">{t('isWarmup')}</span>
                {isWarmup && <span className="tag tag-warmup" style={{ marginLeft: 'auto' }}>🔥</span>}
              </label>
            </div>

            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label" htmlFor="sets-count-selector">Cantidad de series</label>
              <input
                id="sets-count-selector"
                className="form-input"
                type="number"
                min="1"
                max="15"
                value={setsConfig.length}
                onChange={(e) => handleSetsCountChange(e.target.value)}
                style={{ maxWidth: 100 }}
              />
            </div>

            {setsConfig.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <label className="form-label">Objetivos por serie</label>
                <div style={{
                  maxHeight: '32vh',
                  overflowY: 'auto',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-secondary)',
                  padding: 10,
                }}>
                  {setsConfig.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '80px 1fr 1fr',
                        alignItems: 'center',
                        gap: 12,
                        marginBottom: idx === setsConfig.length - 1 ? 0 : 10,
                      }}
                    >
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        Serie {idx + 1}:
                      </span>
                      <input
                        className="form-input"
                        type="number"
                        min="1"
                        value={item.reps}
                        onChange={(e) => updateSetInput(idx, 'reps', e.target.value)}
                        placeholder="Reps"
                        style={{ padding: '6px 8px', fontSize: '0.85rem' }}
                      />
                      <input
                        className="form-input"
                        type="number"
                        min="0"
                        step="0.5"
                        value={item.weight}
                        onChange={(e) => updateSetInput(idx, 'weight', e.target.value)}
                        placeholder="Peso (kg)"
                        style={{ padding: '6px 8px', fontSize: '0.85rem' }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">{t('notes')}</label>
              <textarea
                className="form-textarea"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notas opcionales..."
                style={{ minHeight: 60 }}
              />
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>
                {t('cancel')}
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 2 }}
                onClick={handleSave}
                disabled={loading || setsConfig.length === 0}
                id="confirm-add-exercise"
              >
                {loading ? <><span className="spinner" /> {t('loading')}</> : (editingItem ? t('save') : t('addExercise'))}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
