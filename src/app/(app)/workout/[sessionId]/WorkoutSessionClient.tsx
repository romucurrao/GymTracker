'use client'

import { useState, useEffect, useRef } from 'react'
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
  target_reps: string
  target_weight: string
  notes: string
  saved: boolean
}

interface Props {
  session: {
    id: string
    session_date: string
    notes: string | null
    started_at: string | null
    finished_at: string | null
    duration_seconds: number
    status: 'active' | 'paused' | 'completed'
    routine: {
      name: string
      routine_items: Array<{
        id: string
        item_type: 'exercise' | 'rest'
        exercise_id: string | null
        exercise: Exercise | null
        is_warmup: boolean
        target_sets: number | null
        target_reps: number | null
        target_weight: number | null
        rest_min_seconds: number | null
        rest_max_seconds: number | null
        rest_label: string | null
        notes: string | null
        routine_exercise_sets?: Array<{
          id: string
          set_number: number
          target_reps: number | null
          target_weight: number | null
        }>
      }>
    } | null
  }
  existingSets: Array<{
    id: string
    exercise_id: string
    set_number: number
    reps: number | null
    weight: number | null
    target_reps: number | null
    target_weight: number | null
    notes: string | null
    exercise: { name: string }
  }>
  allExercises: Exercise[]
}

export default function WorkoutSessionClient({ session, existingSets, allExercises }: Props) {
  const { t } = useLang()
  const router = useRouter()

  // ── Inicializar sets desde existentes o generar basándose en la rutina ──
  const initSets: SetRow[] = existingSets.length > 0
    ? existingSets.map((s) => ({
        id: s.id,
        exercise_id: s.exercise_id,
        exercise_name: s.exercise.name,
        set_number: s.set_number,
        reps: String(s.reps ?? ''),
        weight: String(s.weight ?? ''),
        target_reps: s.target_reps ? String(s.target_reps) : '',
        target_weight: s.target_weight ? String(s.target_weight) : '',
        notes: s.notes ?? '',
        saved: true,
      }))
    : (() => {
        const initialSets: SetRow[] = []
        if (session.routine && session.routine.routine_items) {
          const exercises = session.routine.routine_items.filter(
            (item) => item.item_type === 'exercise' && item.exercise
          )
          exercises.forEach((item) => {
            const ex = item.exercise!
            const targetSetsList = item.routine_exercise_sets ?? []
            const sortedTargets = [...targetSetsList].sort((a, b) => a.set_number - b.set_number)

            if (sortedTargets.length > 0) {
              sortedTargets.forEach((ts) => {
                initialSets.push({
                  exercise_id: ex.id,
                  exercise_name: ex.name,
                  set_number: ts.set_number,
                  reps: '',
                  weight: '',
                  target_reps: ts.target_reps ? String(ts.target_reps) : '',
                  target_weight: ts.target_weight ? String(ts.target_weight) : '',
                  notes: '',
                  saved: false,
                })
              })
            } else {
              // Fallback si no tiene series individuales configuradas pero tiene target_sets globales
              const count = item.target_sets ?? 1
              for (let i = 1; i <= count; i++) {
                initialSets.push({
                  exercise_id: ex.id,
                  exercise_name: ex.name,
                  set_number: i,
                  reps: '',
                  weight: '',
                  target_reps: item.target_reps ? String(item.target_reps) : '',
                  target_weight: item.target_weight ? String(item.target_weight) : '',
                  notes: '',
                  saved: false,
                })
              }
            }
          })
        }
        return initialSets
      })()

  const [sets, setSets] = useState<SetRow[]>(initSets)
  const [selectedExercise, setSelectedExercise] = useState('')
  const [sessionNotes, setSessionNotes] = useState(session.notes ?? '')
  const [finishing, setFinishing] = useState(false)

  // ── Estados del Temporizador General ───────────────────────────────────
  const [timerStatus, setTimerStatus] = useState<'active' | 'paused' | 'completed'>(session.status)
  const [elapsed, setElapsed] = useState(0)

  // Inicializar elapsed basado en started_at
  useEffect(() => {
    if (session.status === 'completed') {
      setElapsed(session.duration_seconds)
      return
    }

    const getInitialElapsed = () => {
      if (session.started_at && session.status === 'active') {
        const startMs = new Date(session.started_at).getTime()
        const diffSecs = Math.floor((Date.now() - startMs) / 1000)
        return session.duration_seconds + Math.max(0, diffSecs)
      }
      return session.duration_seconds
    }

    setElapsed(getInitialElapsed())
  }, [session])

  // Intervalo del Temporizador General
  useEffect(() => {
    if (timerStatus !== 'active') return
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [timerStatus])

  // ── Estados del Temporizador de Descanso ───────────────────────────────
  const [restActive, setRestActive] = useState(false)
  const [restLabel, setRestLabel] = useState('')
  const [restSecondsLeft, setRestSecondsLeft] = useState(0)
  const [restTotalSeconds, setRestTotalSeconds] = useState(0)
  const [restMinRecommended, setRestMinRecommended] = useState<number | null>(null)
  const [restMaxRecommended, setRestMaxRecommended] = useState<number | null>(null)
  const restIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // ── Acciones del Temporizador General ──────────────────────────────────
  async function handlePause() {
    setTimerStatus('paused')
    const startMs = session.started_at ? new Date(session.started_at).getTime() : Date.now()
    const currentPhaseDuration = Math.floor((Date.now() - startMs) / 1000)
    const newDuration = session.duration_seconds + Math.max(0, currentPhaseDuration)

    session.status = 'paused'
    session.duration_seconds = newDuration
    session.started_at = null

    const supabase = createClient()
    await supabase.from('workout_sessions').update({
      status: 'paused',
      duration_seconds: newDuration,
      started_at: null,
    }).eq('id', session.id)
  }

  async function handleResume() {
    setTimerStatus('active')
    const now = new Date().toISOString()

    session.status = 'active'
    session.started_at = now

    const supabase = createClient()
    await supabase.from('workout_sessions').update({
      status: 'active',
      started_at: now,
    }).eq('id', session.id)
  }

  // ── Formateador de Tiempo General ─────────────────────────────────────
  const formatElapsed = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return [
      h > 0 ? String(h).padStart(2, '0') : null,
      String(m).padStart(2, '0'),
      String(s).padStart(2, '0'),
    ].filter(Boolean).join(':')
  }

  // ── Lógica de audio del temporizador de descanso ────────────────────────
  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(800, ctx.currentTime)
      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.4)
    } catch (e) {
      console.error('Audio beep error', e)
    }
  }

  // ── Acciones de Temporizador de Descanso ───────────────────────────────
  const startRestTimer = (seconds: number, label: string, minRec?: number | null, maxRec?: number | null) => {
    if (restIntervalRef.current) clearInterval(restIntervalRef.current)

    setRestLabel(label)
    setRestSecondsLeft(seconds)
    setRestTotalSeconds(seconds)
    setRestMinRecommended(minRec ?? null)
    setRestMaxRecommended(maxRec ?? null)
    setRestActive(true)

    restIntervalRef.current = setInterval(() => {
      setRestSecondsLeft((prev) => {
        if (prev <= 1) {
          if (restIntervalRef.current) clearInterval(restIntervalRef.current)
          setRestActive(false)
          playBeep()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const stopRestTimer = () => {
    if (restIntervalRef.current) clearInterval(restIntervalRef.current)
    setRestActive(false)
  }

  useEffect(() => {
    return () => {
      if (restIntervalRef.current) clearInterval(restIntervalRef.current)
    }
  }, [])

  // ── Lógica de Series de Ejercicio ──────────────────────────────────────
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
      target_reps: '',
      target_weight: '',
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
    const { data: authData } = await supabase.auth.getUser()
    const user = authData?.user
    if (!user) return

    for (const s of sets) {
      const targetRepsVal = s.target_reps ? parseInt(s.target_reps) : null
      const targetWeightVal = s.target_weight ? parseFloat(s.target_weight) : null

      if (s.id) {
        await supabase.from('workout_sets').update({
          reps: s.reps ? parseInt(s.reps) : null,
          weight: s.weight ? parseFloat(s.weight) : null,
          target_reps: targetRepsVal,
          target_weight: targetWeightVal,
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
          target_reps: targetRepsVal,
          target_weight: targetWeightVal,
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

    const supabase = createClient()
    const now = new Date().toISOString()
    const startMs = session.started_at ? new Date(session.started_at).getTime() : Date.now()
    const currentPhaseDuration = timerStatus === 'active' ? Math.floor((Date.now() - startMs) / 1000) : 0
    const finalDuration = session.duration_seconds + Math.max(0, currentPhaseDuration)

    await supabase.from('workout_sessions').update({
      status: 'completed',
      finished_at: now,
      duration_seconds: finalDuration,
      started_at: null,
    }).eq('id', session.id)

    setTimerStatus('completed')
    router.push('/workout')
    router.refresh()
  }

  // Agrupar sets por ejercicio
  const exerciseGroups = sets.reduce<Record<string, SetRow[]>>((acc, s) => {
    if (!acc[s.exercise_id]) acc[s.exercise_id] = []
    acc[s.exercise_id].push(s)
    return acc
  }, {})

  // Filtrar elementos de la rutina
  const routineItems = session.routine?.routine_items ?? []
  const exercisesInRoutine = routineItems.filter((i) => i.item_type === 'exercise' && i.exercise)
  const restsInRoutine = routineItems.filter((i) => i.item_type === 'rest')

  return (
    <div className="page-container" style={{ position: 'relative' }}>
      <TopBar showBack />

      {/* ⏱️ Widget flotante del Temporizador de Descanso */}
      {restActive && (
        <div style={{
          position: 'fixed',
          top: 16,
          left: 16,
          right: 16,
          background: 'var(--warmup-dim)',
          border: '2px solid var(--warmup-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px 20px',
          zIndex: 1000,
          boxShadow: 'var(--shadow-card)',
          backdropFilter: 'blur(10px)',
          animation: 'fadeIn 0.2s ease',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontWeight: 700, color: 'var(--warmup)', fontSize: '0.9rem' }}>
              ⏱️ {restLabel || 'Descanso activo'}
            </span>
            <button
              onClick={stopRestTimer}
              style={{
                background: 'none', border: 'none', color: 'var(--text-muted)',
                fontSize: '1rem', cursor: 'pointer', padding: '0 4px'
              }}
            >
              ✕
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 12 }}>
            <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.05em' }}>
              {restSecondsLeft}s
            </span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
              de {restTotalSeconds}s
            </span>
          </div>

          {(restMinRecommended !== null || restMaxRecommended !== null) && (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 14 }}>
              Recomendado: {restMinRecommended ? `${restMinRecommended}s` : ''}
              {restMaxRecommended && restMaxRecommended !== restMinRecommended ? ` a ${restMaxRecommended}s` : ''}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            {restMinRecommended && restSecondsLeft !== restMinRecommended && (
              <button
                className="btn btn-sm btn-secondary"
                style={{ flex: 1, fontSize: '0.75rem', padding: '6px 8px' }}
                onClick={() => startRestTimer(restMinRecommended, restLabel, restMinRecommended, restMaxRecommended)}
              >
                Mínimo ({restMinRecommended}s)
              </button>
            )}
            {restMaxRecommended && restSecondsLeft !== restMaxRecommended && restMaxRecommended !== restMinRecommended && (
              <button
                className="btn btn-sm btn-secondary"
                style={{ flex: 1, fontSize: '0.75rem', padding: '6px 8px' }}
                onClick={() => startRestTimer(restMaxRecommended, restLabel, restMinRecommended, restMaxRecommended)}
              >
                Máximo ({restMaxRecommended}s)
              </button>
            )}
            <button
              className="btn btn-sm btn-primary"
              style={{ flex: 1, background: 'var(--warmup)', color: '#000', fontSize: '0.75rem', padding: '6px 8px' }}
              onClick={stopRestTimer}
            >
              Saltar
            </button>
          </div>
        </div>
      )}

      {/* Temporizador General de Sesión */}
      <div className="card" style={{
        margin: '12px 0 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderColor: 'var(--accent-border)',
        background: 'var(--bg-secondary)'
      }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
            Tiempo de entrenamiento
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent)', fontFamily: 'monospace' }}>
            {formatElapsed(elapsed)}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {timerStatus === 'active' ? (
            <button className="btn btn-sm btn-secondary" onClick={handlePause}>
              ⏸️ Pausar
            </button>
          ) : timerStatus === 'paused' ? (
            <button className="btn btn-sm btn-primary" onClick={handleResume}>
              ▶️ Reanudar
            </button>
          ) : null}
        </div>
      </div>

      <div className="page-header" style={{ paddingTop: 0 }}>
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

      {/* Quick-add de ejercicios */}
      {exercisesInRoutine.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div className="section-title">Ejercicios de la rutina</div>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
            {exercisesInRoutine.map((item) => {
              const ex = item.exercise!
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedExercise(ex.id)
                    setTimeout(() => {
                      const exerciseSets = sets.filter((s) => s.exercise_id === ex.id)
                      const targetSetsList = item.routine_exercise_sets ?? []
                      
                      // Buscar si hay un objetivo correspondiente al set_number
                      const nextSetNum = exerciseSets.length + 1
                      const targetForSet = targetSetsList.find(ts => ts.set_number === nextSetNum)

                      setSets((prev) => [...prev, {
                        exercise_id: ex.id,
                        exercise_name: ex.name,
                        set_number: nextSetNum,
                        reps: '',
                        weight: '',
                        target_reps: targetForSet?.target_reps ? String(targetForSet.target_reps) : '',
                        target_weight: targetForSet?.target_weight ? String(targetForSet.target_weight) : '',
                        notes: '',
                        saved: false,
                      }])
                    }, 0)
                  }}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${item.is_warmup ? 'var(--warmup-border)' : 'var(--accent-border)'}`,
                    background: item.is_warmup ? 'var(--warmup-dim)' : 'var(--accent-glow)',
                    color: item.is_warmup ? 'var(--warmup)' : 'var(--accent)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  {item.is_warmup ? '🔥 ' : ''}{ex.name}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Quick-start de descansos configurados */}
      {restsInRoutine.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div className="section-title">Descansos de la rutina</div>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
            {restsInRoutine.map((item) => {
              const label = item.rest_label || 'Descanso'
              const min = item.rest_min_seconds || 0
              const max = item.rest_max_seconds || min
              return (
                <button
                  key={item.id}
                  onClick={() => startRestTimer(min, label, min, max)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--warmup-border)',
                    background: 'var(--warmup-dim)',
                    color: 'var(--warmup)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  ⏱️ {label} ({min}{max !== min ? `-${max}` : ''}s)
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Series registradas */}
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
                      
                      {/* Entrada Reps + Objetivo */}
                      <div>
                        <input
                          type="number"
                          min="0"
                          value={s.reps}
                          onChange={(e) => updateSet(globalIdx, 'reps', e.target.value)}
                          placeholder={s.target_reps ? String(s.target_reps) : '—'}
                          style={{
                            background: 'var(--bg-input)', border: '1px solid var(--border-subtle)',
                            borderRadius: 6, padding: '6px 8px', color: 'var(--text-primary)',
                            fontSize: '0.9rem', width: '100%',
                          }}
                        />
                        {s.target_reps && (
                          <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: 2 }}>
                            Obj: {s.target_reps}
                          </div>
                        )}
                      </div>

                      {/* Entrada Kg + Objetivo */}
                      <div>
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={s.weight}
                          onChange={(e) => updateSet(globalIdx, 'weight', e.target.value)}
                          placeholder={s.target_weight ? String(s.target_weight) : '—'}
                          style={{
                            background: 'var(--bg-input)', border: '1px solid var(--border-subtle)',
                            borderRadius: 6, padding: '6px 8px', color: 'var(--text-primary)',
                            fontSize: '0.9rem', width: '100%',
                          }}
                        />
                        {s.target_weight && (
                          <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: 2 }}>
                            Obj: {s.target_weight}kg
                          </div>
                        )}
                      </div>

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
        <div className="section-title">Agregar serie manual</div>
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

      {/* Temporizador de descanso libre */}
      <div style={{ marginBottom: 20, padding: 12, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
        <div className="section-title" style={{ marginBottom: 8 }}>Temporizador de descanso libre</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-sm btn-secondary" style={{ flex: 1 }} onClick={() => startRestTimer(30, 'Descanso corto', 30, 30)}>30s</button>
          <button className="btn btn-sm btn-secondary" style={{ flex: 1 }} onClick={() => startRestTimer(60, 'Descanso normal', 60, 60)}>60s</button>
          <button className="btn btn-sm btn-secondary" style={{ flex: 1 }} onClick={() => startRestTimer(90, 'Descanso largo', 90, 90)}>90s</button>
          <button className="btn btn-sm btn-secondary" style={{ flex: 1 }} onClick={() => startRestTimer(120, 'Descanso largo', 120, 120)}>2m</button>
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
