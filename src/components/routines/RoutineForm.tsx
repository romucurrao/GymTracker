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
  day: string
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
    day: initial?.day ?? '',
    main_muscle_group: initial?.main_muscle_group ?? '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function update(field: keyof RoutineFormValues, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    if (mode === 'create') {
      const { error: dbError } = await supabase.from('routines').insert({
        user_id: user.id,
        name: form.name,
        description: form.description || null,
        day: form.day || null,
        main_muscle_group: form.main_muscle_group || null,
      })
      if (dbError) { setError(dbError.message); setLoading(false); return }
      router.push('/dashboard')
    } else {
      const { error: dbError } = await supabase
        .from('routines')
        .update({
          name: form.name,
          description: form.description || null,
          day: form.day || null,
          main_muscle_group: form.main_muscle_group || null,
        })
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
          />
        </div>

        <div className="form-row">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="routine-day">{t('day')}</label>
            <select
              id="routine-day"
              className="form-select"
              value={form.day}
              onChange={(e) => update('day', e.target.value)}
            >
              <option value="">—</option>
              {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
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
