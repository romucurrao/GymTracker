'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLang } from '@/lib/i18n/lang-context'

const NavDumbbell = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6.5 6.5h11M6.5 17.5h11"/>
    <path d="M3 9.5h3v5H3z"/>
    <path d="M18 9.5h3v5h-3z"/>
    <path d="M6 6.5v11"/>
    <path d="M18 6.5v11"/>
  </svg>
)

const NavList = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1"/>
    <rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/>
    <rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>
)

const NavChart = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
)

const NavPlay = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polygon points="10 8 16 12 10 16 10 8"/>
  </svg>
)

export default function BottomNav() {
  const pathname = usePathname()
  const { t } = useLang()

  const links = [
    { href: '/dashboard', label: t('dashboard'), icon: <NavDumbbell /> },
    { href: '/exercises', label: t('exercises'), icon: <NavList /> },
    { href: '/workout', label: t('workout'), icon: <NavPlay /> },
    { href: '/history', label: t('history'), icon: <NavChart /> },
  ]

  return (
    <nav className="bottom-nav">
      {links.map((link) => {
        const isActive = pathname.startsWith(link.href)
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`nav-item ${isActive ? 'active' : ''}`}
          >
            {link.icon}
            <span>{link.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
