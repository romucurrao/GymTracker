'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useLang } from '@/lib/i18n/lang-context'
import type { ExerciseType } from '@/lib/types/database'
import { EQUIPMENT_OPTIONS } from '@/lib/types/database'
import TopBar from '@/components/layout/TopBar'

const MUSCLE_OPTIONS = [
  'Pecho', 'Espalda alta', 'Espalda baja', 'Hombros', 'Bíceps', 'Tríceps',
  'Antebrazos', 'Core / Abdomen', 'Abdomen', 'Cuádriceps', 'Isquiotibiales',
  'Glúteos', 'Gemelos', 'Aductores', 'Abductores', 'Lumbares', 'Trapecios',
  'Cardio', 'Movilidad', 'Calentamiento', 'Cuerpo completo',
]

const TYPE_OPTIONS: { value: ExerciseType; label: string }[] = [
  { value: 'compuesto', label: 'Compuesto' },
  { value: 'aislamiento', label: 'Aislamiento' },
  { value: 'fuerza', label: 'Fuerza' },
  { value: 'calentamiento', label: 'Calentamiento' },
  { value: 'movilidad', label: 'Movilidad' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'otro', label: 'Otro' },
]

interface ExerciseFormValues {
  name: string
  primary_muscle: string
  secondary_muscles: string
  type: ExerciseType
  description: string
  equipment: string
}

interface ExerciseFormProps {
  initial?: ExerciseFormValues
  exerciseId?: string
  mode: 'create' | 'edit'
}

export default function ExerciseForm({ initial, exerciseId, mode }: ExerciseFormProps) {
  const { t } = useLang()
  const router = useRouter()
  const [form, setForm] = useState<ExerciseFormValues>({
    name: initial?.name ?? '',
    primary_muscle: initial?.primary_muscle ?? '',
    secondary_muscles: initial?.secondary_muscles ?? '',
    type: initial?.type ?? 'compuesto',
    description: initial?.description ?? '',
    equipment: initial?.equipment ?? '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function update<K extends keyof ExerciseFormValues>(field: K, value: ExerciseFormValues[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const payload = {
      name: form.name,
      primary_muscle: form.primary_muscle,
      secondary_muscles: form.secondary_muscles
        ? form.secondary_muscles.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      type: form.type,
      description: form.description || null,
      equipment: form.equipment || null,
    }

    if (mode === 'create') {
      const { data, error: dbError } = await supabase
        .from('exercises')
        .insert({ user_id: user.id, ...payload })
        .select()
        .single()
      if (dbError) { setError(dbError.message); setLoading(false); return }
      router.push(`/exercises/${data.id}`)
    } else {
      const { error: dbError } = await supabase
        .from('exercises')
        .update(payload)
        .eq('id', exerciseId!)
      if (dbError) { setError(dbError.message); setLoading(false); return }
      router.push(`/exercises/${exerciseId}`)
    }

    router.refresh()
  }

  return (
    <div className="page-container">
      <TopBar showBack />
      <div className="page-header">
        <h1 className="page-title">
          {mode === 'create' ? t('newExercise') : t('editExercise')}
        </h1>
      </div>

      {error && <div className="auth-error">{error}</div>}

      <form onSubmit={handleSubmit} className="animate-in">
        {/* Nombre */}
        <div className="form-group">
          <label className="form-label" htmlFor="ex-name">{t('exerciseName')} *</label>
          <input
            id="ex-name"
            className="form-input"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="Ej: Press de banca, Sentadilla..."
            required
          />
        </div>

        {/* Tipo */}
        <div className="form-group">
          <label className="form-label" htmlFor="ex-type">{t('type')} *</label>
          <select
            id="ex-type"
            className="form-select"
            value={form.type}
            onChange={(e) => update('type', e.target.value as ExerciseType)}
            required
          >
            {TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Músculo principal */}
        <div className="form-group">
          <label className="form-label" htmlFor="ex-primary">{t('primaryMuscle')} *</label>
          <select
            id="ex-primary"
            className="form-select"
            value={form.primary_muscle}
            onChange={(e) => update('primary_muscle', e.target.value)}
            required
          >
            <option value="">Seleccioná un músculo</option>
            {MUSCLE_OPTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        {/* Equipamiento */}
        <div className="form-group">
          <label className="form-label" htmlFor="ex-equipment">Equipamiento</label>
          <select
            id="ex-equipment"
            className="form-select"
            value={form.equipment}
            onChange={(e) => update('equipment', e.target.value)}
          >
            <option value="">Sin especificar</option>
            {EQUIPMENT_OPTIONS.map((eq) => (
              <option key={eq} value={eq}>{eq}</option>
            ))}
          </select>
        </div>

        {/* Músculos secundarios */}
        <div className="form-group">
          <label className="form-label" htmlFor="ex-secondary">{t('secondaryMuscles')}</label>
          <input
            id="ex-secondary"
            className="form-input"
            value={form.secondary_muscles}
            onChange={(e) => update('secondary_muscles', e.target.value)}
            placeholder="Ej: Tríceps, Deltoides anterior"
          />
        </div>

        {/* Descripción */}
        <div className="form-group">
          <label className="form-label" htmlFor="ex-desc">{t('description')}</label>
          <textarea
            id="ex-desc"
            className="form-textarea"
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            placeholder="Descripción, técnica, tips..."
          />
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button type="button" className="btn btn-secondary" onClick={() => router.back()} style={{ flex: 1 }}>
            {t('cancel')}
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 2 }} id="save-exercise-btn">
            {loading ? <><span className="spinner" /> {t('loading')}</> : t('save')}
          </button>
        </div>
      </form>
    </div>
  )
}
