'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useLang, type Lang } from '@/lib/i18n/lang-context'

export default function TopBar({ title, showBack }: { title?: string; showBack?: boolean }) {
  const { t, lang, setLang } = useLang()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 0 8px',
      gap: 8,
    }}>
      {showBack ? (
        <button className="btn btn-ghost btn-sm" onClick={() => router.back()}>
          {t('back')}
        </button>
      ) : (
        <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--accent)' }}>
          🏋️ {title || 'Gym Tracker'}
        </span>
      )}

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {/* Language toggle */}
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
          style={{ fontSize: '0.75rem', fontWeight: 600, minHeight: 'auto', padding: '6px 10px' }}
          title="Toggle language"
          id="lang-toggle"
        >
          {lang === 'es' ? 'EN' : 'ES'}
        </button>

        <button
          className="btn btn-ghost btn-sm"
          onClick={handleLogout}
          style={{ fontSize: '0.8rem', minHeight: 'auto', padding: '6px 12px' }}
          id="logout-btn"
        >
          {t('logout')}
        </button>
      </div>
    </div>
  )
}
