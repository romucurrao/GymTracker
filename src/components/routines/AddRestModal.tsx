'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLang } from '@/lib/i18n/lang-context'
import type { RoutineItemWithExercise } from '@/lib/types/database'

interface Props {
  routineId: string
  currentCount: number
  onClose: () => void
  onAdded: (item: RoutineItemWithExercise) => void
}

export default function AddRestModal({ routineId, currentCount, onClose, onAdded }: Props) {
  const { t } = useLang()
  const [label, setLabel] = useState('')
  const [minVal, setMinVal] = useState('60')
  const [maxVal, setMaxVal] = useState('90')
  const [unit, setUnit] = useState<'seconds' | 'minutes'>('seconds')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleAdd() {
    setError('')
    const minSecStr = minVal.trim()
    const maxSecStr = maxVal.trim()

    if (!minSecStr) {
      setError('Debes ingresar al menos un tiempo mínimo')
      return
    }

    const minNum = parseFloat(minSecStr)
    const maxNum = maxSecStr ? parseFloat(maxSecStr) : minNum

    if (isNaN(minNum) || minNum <= 0) {
      setError('El tiempo mínimo debe ser un número mayor a cero')
      return
    }

    if (maxSecStr && (isNaN(maxNum) || maxNum < minNum)) {
      setError('El tiempo máximo debe ser mayor o igual al mínimo')
      return
    }

    setLoading(true)

    const multiplier = unit === 'minutes' ? 60 : 1
    const finalMin = Math.round(minNum * multiplier)
    const finalMax = Math.round(maxNum * multiplier)

    try {
      const supabase = createClient()
      const { data: authData } = await supabase.auth.getUser()
      const user = authData?.user
      if (!user) return

      const { data, error: dbError } = await supabase
        .from('routine_items')
        .insert({
          user_id: user.id,
          routine_id: routineId,
          order_index: currentCount,
          item_type: 'rest',
          rest_min_seconds: finalMin,
          rest_max_seconds: finalMax,
          rest_label: label.trim() || null,
          notes: notes.trim() || null,
          // campos de ejercicio en nulo
          exercise_id: null,
          is_warmup: false,
          target_sets: null,
          target_reps: null,
          target_weight: null,
        })
        .select('*, exercise:exercises(*)')
        .single()

      if (dbError) {
        setError(dbError.message)
        setLoading(false)
        return
      }

      if (data) {
        onAdded(data as RoutineItemWithExercise)
      }
    } catch (err: any) {
      setError(err.message || 'Error al guardar descanso')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-title">⏱️ Agregar Descanso</div>

        {error && <div className="auth-error" style={{ marginBottom: 16 }}>{error}</div>}

        <div className="form-group">
          <label className="form-label">Nombre del descanso (opcional)</label>
          <input
            className="form-input"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Ej: Descanso largo, Entre series..."
            autoFocus
          />
        </div>

        <div className="form-row">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Minimo *</label>
            <input
              className="form-input"
              type="number"
              min="1"
              value={minVal}
              onChange={(e) => setMinVal(e.target.value)}
              placeholder="60"
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Maximo (opcional)</label>
            <input
              className="form-input"
              type="number"
              min="1"
              value={maxVal}
              onChange={(e) => setMaxVal(e.target.value)}
              placeholder="90"
            />
          </div>
        </div>

        <div className="form-group" style={{ marginTop: 12 }}>
          <label className="form-label">Unidad</label>
          <select
            className="form-select"
            value={unit}
            onChange={(e) => setUnit(e.target.value as 'seconds' | 'minutes')}
          >
            <option value="seconds">Segundos</option>
            <option value="minutes">Minutos</option>
          </select>
        </div>

        <div className="form-group" style={{ marginTop: 12 }}>
          <label className="form-label">{t('notes')}</label>
          <textarea
            className="form-textarea"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notas sobre el descanso..."
            style={{ minHeight: 60 }}
          />
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>
            {t('cancel')}
          </button>
          <button
            className="btn btn-primary"
            style={{ flex: 2, background: 'var(--warmup)' }}
            onClick={handleAdd}
            disabled={loading}
            id="confirm-add-rest"
          >
            {loading ? <><span className="spinner" /> {t('loading')}</> : 'Agregar Descanso'}
          </button>
        </div>
      </div>
    </div>
  )
}
