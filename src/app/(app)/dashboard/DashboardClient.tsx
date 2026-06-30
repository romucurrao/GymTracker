'use client'

import Link from 'next/link'
import { useLang } from '@/lib/i18n/lang-context'
import type { Routine } from '@/lib/types/database'
import TopBar from '@/components/layout/TopBar'

const MUSCLE_EMOJI: Record<string, string> = {
  pecho: '💪', chest: '💪',
  espalda: '🔙', back: '🔙',
  piernas: '🦵', legs: '🦵',
  hombros: '🏋️', shoulders: '🏋️',
  brazos: '💪', arms: '💪',
  core: '🎯', abdomen: '🎯',
  cardio: '❤️',
  fullbody: '⚡', 'full body': '⚡',
}

function RoutineCard({ routine }: { routine: Routine }) {
  const emoji = MUSCLE_EMOJI[routine.main_muscle_group?.toLowerCase() ?? ''] ?? '🏋️'

  return (
    <Link href={`/routines/${routine.id}`} className="card card-clickable animate-in" style={{ display: 'block' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 'var(--radius-md)',
          background: 'var(--accent-glow)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontSize: '1.4rem', flexShrink: 0,
          border: '1px solid var(--accent-border)',
        }}>
          {emoji}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 4 }} className="truncate">
            {routine.name}
          </div>
          {routine.description && (
            <div className="text-sm text-secondary truncate" style={{ marginBottom: 6 }}>
              {routine.description}
            </div>
          )}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {routine.days && routine.days.length > 0 && (
              <span className="tag tag-muted">
                {routine.days.map((d) => d.slice(0, 3)).join(', ')}
              </span>
            )}
            {routine.main_muscle_group && (
              <span className="tag tag-accent">{routine.main_muscle_group}</span>
            )}
          </div>
        </div>

        <div style={{ color: 'var(--text-muted)', fontSize: '1.2rem', alignSelf: 'center' }}>›</div>
      </div>
    </Link>
  )
}

export default function DashboardClient({ routines }: { routines: Routine[] }) {
  const { t } = useLang()

  return (
    <div className="page-container">
      <TopBar />

      <div className="page-header">
        <h1 className="page-title">{t('myRoutines')}</h1>
      </div>

      <Link href="/routines/new">
        <button className="btn btn-primary btn-full btn-lg" id="new-routine-btn" style={{ marginBottom: 24 }}>
          {t('newRoutine')}
        </button>
      </Link>

      {routines.length === 0 ? (
        <div className="empty-state animate-in">
          <div className="empty-state-icon">🏋️</div>
          <div className="empty-state-title">{t('noRoutines')}</div>
          <div className="empty-state-text">{t('createFirst')}</div>
        </div>
      ) : (
        <div>
          {routines.map((routine) => (
            <RoutineCard key={routine.id} routine={routine} />
          ))}
        </div>
      )}
    </div>
  )
}
