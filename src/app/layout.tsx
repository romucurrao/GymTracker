import type { Metadata, Viewport } from 'next'
import './globals.css'
import { LangProvider } from '@/lib/i18n/lang-context'

export const metadata: Metadata = {
  title: 'Gym Tracker',
  description: 'Organizá tus rutinas, ejercicios y progreso en el gimnasio.',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0a0a0a',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <LangProvider>
          {children}
        </LangProvider>
      </body>
    </html>
  )
}
