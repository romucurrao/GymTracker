'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLang } from '@/lib/i18n/lang-context'
import type { Exercise } from '@/lib/types/database'
import TopBar from '@/components/layout/TopBar'

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
  compuesto: 'Compuesto',
  aislamiento: 'Aislamiento',
  fuerza: 'Fuerza',
  calentamiento: 'Calentamiento',
  movilidad: 'Movilidad',
  cardio: 'Cardio',
  otro: 'Otro',
}

const MUSCLE_GROUPS = [
  'Todos',
  'Pecho',
  'Espalda alta',
  'Espalda baja',
  'Hombros',
  'Bíceps',
  'Tríceps',
  'Antebrazos',
  'Cuádriceps',
  'Isquiotibiales',
  'Glúteos',
  'Gemelos',
  'Core / Abdomen',
  'Abdomen',
  'Lumbares',
  'Cardio',
  'Movilidad',
  'Calentamiento',
]

export default function ExercisesClient({ exercises }: { exercises: Exercise[] }) {
  const { t } = useLang()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [muscleFilter, setMuscleFilter] = useState<string>('Todos')
  const [sourceFilter, setSourceFilter] = useState<'all' | 'global' | 'mine'>('all')

  // Helper para normalizar caracteres (eliminar acentos y minúsculas)
  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
  }

  const filtered = exercises.filter((e) => {
    const term = normalizeText(search)
    const matchSearch =
      normalizeText(e.name).includes(term) ||
      normalizeText(e.primary_muscle).includes(term) ||
      (e.equipment ? normalizeText(e.equipment).includes(term) : false)

    const matchType = typeFilter === 'all' || e.type === typeFilter
    const matchMuscle = muscleFilter === 'Todos' || e.primary_muscle === muscleFilter
    const matchSource =
      sourceFilter === 'all' ||
      (sourceFilter === 'global' && e.is_global) ||
      (sourceFilter === 'mine' && !e.is_global)

    return matchSearch && matchType && matchMuscle && matchSource
  })

  const globalCount = exercises.filter((e) => e.is_global).length
  const myCount = exercises.filter((e) => !e.is_global).length

  return (
    <div className="page-container">
      <TopBar />

      <div className="page-header">
        <h1 className="page-title">{t('exerciseList')}</h1>
      </div>

      <Link href="/exercises/new">
        <button className="btn btn-primary btn-full" id="new-exercise-btn" style={{ marginBottom: 16 }}>
          {t('newExercise')}
        </button>
      </Link>

      {/* Stats */}
      <div className="stats-row" style={{ marginBottom: 16 }}>
        <div className="stat-block" style={{ textAlign: 'center' }}>
          <div className="stat-block-value" style={{ fontSize: '1.4rem' }}>{globalCount}</div>
          <div className="stat-block-label">Biblioteca</div>
        </div>
        <div className="stat-block" style={{ textAlign: 'center' }}>
          <div className="stat-block-value" style={{ fontSize: '1.4rem' }}>{myCount}</div>
          <div className="stat-block-label">Propios</div>
        </div>
        <div className="stat-block" style={{ textAlign: 'center' }}>
          <div className="stat-block-value" style={{ fontSize: '1.4rem' }}>{exercises.length}</div>
          <div className="stat-block-label">Total</div>
        </div>
      </div>

      {/* Búsqueda */}
      <input
        className="form-input"
        placeholder="Buscar por nombre, músculo o equipo (sin tildes)..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: 12 }}
        id="search-exercises"
      />

      {/* Filtro fuente */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        {([
          { key: 'all', label: '📚 Todos' },
          { key: 'global', label: '🌐 Biblioteca' },
          { key: 'mine', label: '👤 Mis ejercicios' },
        ] as const).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setSourceFilter(key)}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              border: `1px solid ${sourceFilter === key ? 'var(--accent)' : 'var(--border-subtle)'}`,
              background: sourceFilter === key ? 'var(--accent-glow)' : 'transparent',
              color: sourceFilter === key ? 'var(--accent)' : 'var(--text-muted)',
              fontSize: '0.78rem',
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

      {/* Filtro por tipo */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 10 }}>
        {[
          { key: 'all', label: 'Todos' },
          { key: 'compuesto', label: 'Compuesto' },
          { key: 'aislamiento', label: 'Aislamiento' },
          { key: 'calentamiento', label: 'Calentamiento' },
          { key: 'movilidad', label: 'Movilidad' },
          { key: 'cardio', label: 'Cardio' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTypeFilter(key)}
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

      {/* Filtro por grupo muscular */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 8, marginBottom: 16 }}>
        {MUSCLE_GROUPS.map((muscle) => (
          <button
            key={muscle}
            onClick={() => setMuscleFilter(muscle)}
            style={{
              padding: '5px 12px',
              borderRadius: 'var(--radius-full)',
              border: `1px solid ${muscleFilter === muscle ? '#a78bfa' : 'var(--border-subtle)'}`,
              background: muscleFilter === muscle ? 'rgba(167, 139, 250, 0.1)' : 'transparent',
              color: muscleFilter === muscle ? '#a78bfa' : 'var(--text-muted)',
              fontSize: '0.75rem',
              fontWeight: 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            }}
          >
            {muscle}
          </button>
        ))}
      </div>

      {/* Contador */}
      <div className="text-xs text-muted" style={{ marginBottom: 12 }}>
        {filtered.length} ejercicio{filtered.length !== 1 ? 's' : ''}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state animate-in">
          <div className="empty-state-icon">🔍</div>
          <div className="empty-state-title">
            {exercises.length === 0 ? t('noExercisesYet') : 'Sin resultados'}
          </div>
          {exercises.length === 0 && (
            <div className="empty-state-text" style={{ marginTop: 8 }}>
              La biblioteca se carga con el SQL de migraciones.
            </div>
          )}
        </div>
      ) : (
        <div className="animate-in">
          {filtered.map((exercise) => {
            const isCore = exercise.primary_muscle === 'Abdomen' || exercise.primary_muscle === 'Core' || exercise.primary_muscle === 'Oblicuos'
            const tagColorClass = isCore ? 'tag-core' : (TYPE_COLORS[exercise.type] || 'tag-muted')
            const tagLabel = isCore ? 'Core' : TYPE_LABELS[exercise.type] || exercise.type

            return (
              <Link
                key={exercise.id}
                href={`/exercises/${exercise.id}`}
                className="card card-clickable"
                style={{
                  display: 'block',
                  marginBottom: 8,
                  borderColor: exercise.is_global ? 'var(--border)' : 'var(--accent-border)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }} className="truncate">
                        {exercise.name}
                      </span>
                      {exercise.is_global ? (
                        <span style={{
                          fontSize: '0.65rem', fontWeight: 600,
                          color: '#94a3b8', background: 'rgba(148,163,184,0.1)',
                          border: '1px solid rgba(148,163,184,0.2)',
                          borderRadius: 4, padding: '1px 5px', flexShrink: 0,
                        }}>
                          BIBLIOTECA
                        </span>
                      ) : (
                        <span style={{
                          fontSize: '0.65rem', fontWeight: 600,
                          color: 'var(--accent)', background: 'var(--accent-glow)',
                          border: '1px solid var(--accent-border)',
                          borderRadius: 4, padding: '1px 5px', flexShrink: 0,
                        }}>
                          MÍO
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                      <span className="tag tag-muted" style={{ fontSize: '0.7rem' }}>
                        {exercise.primary_muscle}
                      </span>
                      <span className={`tag ${tagColorClass}`} style={{ fontSize: '0.7rem' }}>
                        {tagLabel}
                      </span>
                      {exercise.equipment && (
                        <span className="tag tag-muted" style={{ fontSize: '0.7rem' }}>
                          🏋 {exercise.equipment}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '1.1rem', alignSelf: 'center', flexShrink: 0 }}>›</div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
