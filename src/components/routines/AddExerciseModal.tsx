'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLang } from '@/lib/i18n/lang-context'
import type { Exercise, RoutineExerciseWithExercise } from '@/lib/types/database'

interface Props {
  routineId: string
  currentCount: number
  onClose: () => void
  onAdded: (re: RoutineExerciseWithExercise) => void
}

export default function AddExerciseModal({ routineId, currentCount, onClose, onAdded }: Props) {
  const { t } = useLang()
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [selected, setSelected] = useState<Exercise | null>(null)
  const [search, setSearch] = useState('')
  const [isWarmup, setIsWarmup] = useState(false)
  const [targetSets, setTargetSets] = useState('')
  const [targetReps, setTargetReps] = useState('')
  const [targetWeight, setTargetWeight] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'select' | 'config'>('select')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase.from('exercises').select('*').order('name')
      setExercises(data ?? [])
    }
    load()
  }, [])

  const filtered = exercises.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.primary_muscle.toLowerCase().includes(search.toLowerCase())
  )

  async function handleAdd() {
    if (!selected) return
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('routine_exercises')
      .insert({
        user_id: user.id,
        routine_id: routineId,
        exercise_id: selected.id,
        exercise_order: currentCount,
        is_warmup: isWarmup,
        target_sets: targetSets ? parseInt(targetSets) : null,
        target_reps: targetReps ? parseInt(targetReps) : null,
        target_weight: targetWeight ? parseFloat(targetWeight) : null,
        notes: notes || null,
      })
      .select('*, exercise:exercises(*)')
      .single()

    if (!error && data) {
      onAdded(data as RoutineExerciseWithExercise)
    }
    setLoading(false)
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
              placeholder="Buscar ejercicio..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              style={{ marginBottom: 16 }}
            />

            <div style={{ maxHeight: '50vh', overflowY: 'auto' }}>
              {filtered.length === 0 && (
                <div className="empty-state" style={{ padding: '24px 0' }}>
                  <div className="empty-state-text">No hay ejercicios. ¡Creá uno primero!</div>
                </div>
              )}
              {filtered.map((ex) => (
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
                    <span className={`tag ${ex.type === 'calentamiento' ? 'tag-warmup' : 'tag-accent'}`}>
                      {ex.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="modal-title">
              <button
                onClick={() => setStep('select')}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.9rem', marginRight: 8 }}
              >
                ←
              </button>
              {selected?.name}
            </div>

            <div className="form-group">
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

            <div className="form-row-3">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">{t('sets')}</label>
                <input
                  className="form-input"
                  type="number"
                  min="1"
                  value={targetSets}
                  onChange={(e) => setTargetSets(e.target.value)}
                  placeholder="3"
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">{t('reps')}</label>
                <input
                  className="form-input"
                  type="number"
                  min="1"
                  value={targetReps}
                  onChange={(e) => setTargetReps(e.target.value)}
                  placeholder="10"
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">{t('weight')}</label>
                <input
                  className="form-input"
                  type="number"
                  min="0"
                  step="0.5"
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(e.target.value)}
                  placeholder="20"
                />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: 12 }}>
              <label className="form-label">{t('notes')}</label>
              <textarea
                className="form-textarea"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notas opcionales..."
                style={{ minHeight: 60 }}
              />
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>
                {t('cancel')}
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 2 }}
                onClick={handleAdd}
                disabled={loading}
                id="confirm-add-exercise"
              >
                {loading ? <><span className="spinner" /> {t('loading')}</> : t('addExercise')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
