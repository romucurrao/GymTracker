'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useLang } from '@/lib/i18n/lang-context'
import type { Exercise } from '@/lib/types/database'
import TopBar from '@/components/layout/TopBar'

interface SetRow {
  id?: string
  exercise_id: string
  exercise_name: string
  set_number: number
  reps: string
  weight: string
  notes: string
  saved: boolean
}

interface Props {
  session: {
    id: string
    session_date: string
    notes: string | null
    routine: {
      name: string
      routine_exercises: Array<{
        exercise: Exercise
        is_warmup: boolean
        target_sets: number | null
        target_reps: number | null
        target_weight: number | null
      }>
    } | null
  }
  existingSets: Array<{
    id: string
    exercise_id: string
    set_number: number
    reps: number | null
    weight: number | null
    notes: string | null
    exercise: { name: string }
  }>
  allExercises: Exercise[]
}

export default function WorkoutSessionClient({ session, existingSets, allExercises }: Props) {
  const { t } = useLang()
  const router = useRouter()

  // Inicializar sets desde existentes o desde la rutina
  const initSets: SetRow[] = existingSets.length > 0
    ? existingSets.map((s) => ({
        id: s.id,
        exercise_id: s.exercise_id,
        exercise_name: s.exercise.name,
        set_number: s.set_number,
        reps: String(s.reps ?? ''),
        weight: String(s.weight ?? ''),
        notes: s.notes ?? '',
        saved: true,
      }))
    : []

  const [sets, setSets] = useState<SetRow[]>(initSets)
  const [selectedExercise, setSelectedExercise] = useState('')
  const [sessionNotes, setSessionNotes] = useState(session.notes ?? '')
  const [finishing, setFinishing] = useState(false)

  function addSet() {
    if (!selectedExercise) return
    const ex = allExercises.find((e) => e.id === selectedExercise)
    if (!ex) return

    const exerciseSets = sets.filter((s) => s.exercise_id === selectedExercise)
    setSets((prev) => [...prev, {
      exercise_id: selectedExercise,
      exercise_name: ex.name,
      set_number: exerciseSets.length + 1,
      reps: '',
      weight: '',
      notes: '',
      saved: false,
    }])
  }

  function updateSet(idx: number, field: 'reps' | 'weight' | 'notes', value: string) {
    setSets((prev) => prev.map((s, i) => i === idx ? { ...s, [field]: value, saved: false } : s))
  }

  function removeSet(idx: number) {
    setSets((prev) => prev.filter((_, i) => i !== idx))
  }

  async function saveAllSets() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    for (const s of sets) {
      if (s.id) {
        await supabase.from('workout_sets').update({
          reps: s.reps ? parseInt(s.reps) : null,
          weight: s.weight ? parseFloat(s.weight) : null,
          notes: s.notes || null,
        }).eq('id', s.id)
      } else {
        const { data } = await supabase.from('workout_sets').insert({
          user_id: user.id,
          workout_session_id: session.id,
          exercise_id: s.exercise_id,
          set_number: s.set_number,
          reps: s.reps ? parseInt(s.reps) : null,
          weight: s.weight ? parseFloat(s.weight) : null,
          notes: s.notes || null,
        }).select().single()
        if (data) {
          setSets((prev) => prev.map((row) =>
            row === s ? { ...row, id: data.id, saved: true } : row
          ))
        }
      }
    }

    await supabase.from('workout_sessions').update({
      notes: sessionNotes || null,
    }).eq('id', session.id)
  }

  async function handleFinish() {
    setFinishing(true)
    await saveAllSets()
    router.push('/workout')
    router.refresh()
  }

  // Agrupar sets por ejercicio para visualización
  const exerciseGroups = sets.reduce<Record<string, SetRow[]>>((acc, s) => {
    if (!acc[s.exercise_id]) acc[s.exercise_id] = []
    acc[s.exercise_id].push(s)
    return acc
  }, {})

  const routineExercises = session.routine?.routine_exercises ?? []

  return (
    <div className="page-container">
      <TopBar showBack />

      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ fontSize: '1.3rem' }}>
            {session.routine?.name ?? t('freeWorkout')}
          </h1>
          <div className="text-sm text-muted" style={{ marginTop: 4 }}>
            {new Date(session.session_date + 'T12:00:00').toLocaleDateString('es-AR', {
              weekday: 'long', day: '2-digit', month: 'long'
            })}
          </div>
        </div>
      </div>

      {/* Ejercicios de la rutina (quick-add) */}
      {routineExercises.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div className="section-title">Ejercicios de la rutina</div>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
            {routineExercises.map((re, i) => (
              <button
                key={i}
                onClick={() => {
                  setSelectedExercise(re.exercise.id)
                  setTimeout(() => {
                    const ex = re.exercise
                    const exerciseSets = sets.filter((s) => s.exercise_id === ex.id)
                    setSets((prev) => [...prev, {
                      exercise_id: ex.id,
                      exercise_name: ex.name,
                      set_number: exerciseSets.length + 1,
                      reps: String(re.target_reps ?? ''),
                      weight: String(re.target_weight ?? ''),
                      notes: '',
                      saved: false,
                    }])
                  }, 0)
                }}
                style={{
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${re.is_warmup ? 'var(--warmup-border)' : 'var(--accent-border)'}`,
                  background: re.is_warmup ? 'var(--warmup-dim)' : 'var(--accent-glow)',
                  color: re.is_warmup ? 'var(--warmup)' : 'var(--accent)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {re.is_warmup ? '🔥 ' : ''}{re.exercise.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sets registrados por ejercicio */}
      {Object.keys(exerciseGroups).length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div className="section-title">Series registradas</div>
          {Object.entries(exerciseGroups).map(([exerciseId, exSets]) => (
            <div key={exerciseId} style={{ marginBottom: 16 }}>
              <div style={{
                fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)',
                marginBottom: 8, display: 'flex', justifyContent: 'space-between',
              }}>
                <span>{exSets[0].exercise_name}</span>
                <span className="text-muted text-xs">{exSets.length} {exSets.length === 1 ? 'serie' : 'series'}</span>
              </div>

              <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                {/* Header */}
                <div style={{
                  display: 'grid', gridTemplateColumns: '28px 1fr 1fr 80px 32px',
                  padding: '8px 10px', borderBottom: '1px solid var(--border)',
                  fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase',
                }}>
                  <span>#</span>
                  <span>Reps</span>
                  <span>Kg</span>
                  <span>Notas</span>
                  <span />
                </div>

                {exSets.map((s, localIdx) => {
                  const globalIdx = sets.indexOf(s)
                  return (
                    <div
                      key={localIdx}
                      style={{
                        display: 'grid', gridTemplateColumns: '28px 1fr 1fr 80px 32px',
                        padding: '8px 10px', borderBottom: '1px solid var(--border)',
                        alignItems: 'center', gap: 6,
                      }}
                    >
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent)' }}>{s.set_number}</span>
                      <input
                        type="number"
                        min="0"
                        value={s.reps}
                        onChange={(e) => updateSet(globalIdx, 'reps', e.target.value)}
                        placeholder="—"
                        style={{
                          background: 'var(--bg-input)', border: '1px solid var(--border-subtle)',
                          borderRadius: 6, padding: '6px 8px', color: 'var(--text-primary)',
                          fontSize: '0.9rem', width: '100%',
                        }}
                      />
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={s.weight}
                        onChange={(e) => updateSet(globalIdx, 'weight', e.target.value)}
                        placeholder="—"
                        style={{
                          background: 'var(--bg-input)', border: '1px solid var(--border-subtle)',
                          borderRadius: 6, padding: '6px 8px', color: 'var(--text-primary)',
                          fontSize: '0.9rem', width: '100%',
                        }}
                      />
                      <input
                        type="text"
                        value={s.notes}
                        onChange={(e) => updateSet(globalIdx, 'notes', e.target.value)}
                        placeholder="..."
                        style={{
                          background: 'var(--bg-input)', border: '1px solid var(--border-subtle)',
                          borderRadius: 6, padding: '6px 8px', color: 'var(--text-primary)',
                          fontSize: '0.8rem', width: '100%',
                        }}
                      />
                      <button
                        onClick={() => removeSet(globalIdx)}
                        style={{
                          background: 'none', border: 'none',
                          color: 'var(--text-muted)', cursor: 'pointer',
                          fontSize: '1rem', padding: 4,
                        }}
                      >✕</button>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Agregar serie manualmente */}
      <div style={{ marginBottom: 20 }}>
        <div className="section-title">Agregar serie</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <select
            className="form-select"
            value={selectedExercise}
            onChange={(e) => setSelectedExercise(e.target.value)}
            style={{ flex: 1 }}
            id="select-exercise-set"
          >
            <option value="">Seleccioná ejercicio</option>
            {allExercises.map((ex) => (
              <option key={ex.id} value={ex.id}>{ex.name}</option>
            ))}
          </select>
          <button
            className="btn btn-secondary"
            onClick={addSet}
            disabled={!selectedExercise}
            id="add-set-btn"
            style={{ flexShrink: 0 }}
          >
            {t('addSet')}
          </button>
        </div>
      </div>

      {/* Notas de sesión */}
      <div className="form-group">
        <label className="form-label">{t('sessionNotes')}</label>
        <textarea
          className="form-textarea"
          value={sessionNotes}
          onChange={(e) => setSessionNotes(e.target.value)}
          placeholder="Notas sobre el entrenamiento..."
          style={{ minHeight: 70 }}
        />
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <button
          className="btn btn-secondary"
          onClick={saveAllSets}
          style={{ flex: 1 }}
          id="save-sets-btn"
        >
          Guardar
        </button>
        <button
          className="btn btn-primary"
          onClick={handleFinish}
          disabled={finishing}
          style={{ flex: 2 }}
          id="finish-workout-btn"
        >
          {finishing ? <><span className="spinner" /> {t('loading')}</> : `✓ ${t('finishWorkout')}`}
        </button>
      </div>
    </div>
  )
}
