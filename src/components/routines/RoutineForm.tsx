'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useLang } from '@/lib/i18n/lang-context'
import TopBar from '@/components/layout/TopBar'

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
const MUSCLE_GROUPS = ['Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Core', 'Full Body', 'Cardio']

interface RoutineFormValues {
  name: string
  description: string
  days: string[]
  main_muscle_group: string
}

interface RoutineFormProps {
  initial?: RoutineFormValues
  routineId?: string
  mode: 'create' | 'edit'
}

export default function RoutineForm({ initial, routineId, mode }: RoutineFormProps) {
  const { t } = useLang()
  const router = useRouter()
  const [form, setForm] = useState<RoutineFormValues>({
    name: initial?.name ?? '',
    description: initial?.description ?? '',
    days: initial?.days ?? [],
    main_muscle_group: initial?.main_muscle_group ?? '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function update<K extends keyof RoutineFormValues>(field: K, value: RoutineFormValues[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const toggleDay = (day: string) => {
    const current = form.days
    const next = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day]
    update('days', next)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const payload = {
      user_id: user.id,
      name: form.name,
      description: form.description || null,
      days: form.days.length > 0 ? form.days : null,
      main_muscle_group: form.main_muscle_group || null,
    }

    if (mode === 'create') {
      const { error: dbError } = await supabase.from('routines').insert(payload)
      if (dbError) { setError(dbError.message); setLoading(false); return }
      router.push('/dashboard')
    } else {
      const { error: dbError } = await supabase
        .from('routines')
        .update(payload)
        .eq('id', routineId!)
      if (dbError) { setError(dbError.message); setLoading(false); return }
      router.push(`/routines/${routineId}`)
    }

    router.refresh()
  }

  return (
    <div className="page-container">
      <TopBar showBack />
      <div className="page-header">
        <h1 className="page-title">
          {mode === 'create' ? t('newRoutine') : t('editRoutine')}
        </h1>
      </div>

      {error && <div className="auth-error">{error}</div>}

      <form onSubmit={handleSubmit} className="animate-in">
        <div className="form-group">
          <label className="form-label" htmlFor="routine-name">{t('routineName')} *</label>
          <input
            id="routine-name"
            className="form-input"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="Ej: Torso A, Piernas, Push..."
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="routine-desc">{t('description')}</label>
          <textarea
            id="routine-desc"
            className="form-textarea"
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            placeholder="Descripción breve de la rutina..."
            style={{ minHeight: 60 }}
          />
        </div>

        {/* Selector de múltiples días interactivo */}
        <div className="form-group">
          <label className="form-label">Días de la semana</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
            {DAYS.map((d) => {
              const active = form.days.includes(d)
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleDay(d)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-full)',
                    border: `1px solid ${active ? 'var(--accent)' : 'var(--border-subtle)'}`,
                    background: active ? 'var(--accent-glow)' : 'transparent',
                    color: active ? 'var(--accent)' : 'var(--text-muted)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {d}
                </button>
              )
            })}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="routine-muscle">{t('muscleGroup')}</label>
          <select
            id="routine-muscle"
            className="form-select"
            value={form.main_muscle_group}
            onChange={(e) => update('main_muscle_group', e.target.value)}
          >
            <option value="">—</option>
            {MUSCLE_GROUPS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div style={{ marginTop: 28, display: 'flex', gap: 10 }}>
          <button type="button" className="btn btn-secondary" onClick={() => router.back()} style={{ flex: 1 }}>
            {t('cancel')}
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 2 }} id="save-routine-btn">
            {loading ? <><span className="spinner" /> {t('loading')}</> : t('save')}
          </button>
        </div>
      </form>
    </div>
  )
}
