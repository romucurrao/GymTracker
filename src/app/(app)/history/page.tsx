import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import HistoryClient from './HistoryClient'

export default async function HistoryPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: sessions } = await supabase
    .from('workout_sessions')
    .select(`
      *,
      routine:routines(name),
      workout_sets(
        id,
        exercise_id,
        set_number,
        reps,
        weight,
        exercise:exercises(name, primary_muscle)
      )
    `)
    .order('session_date', { ascending: false })
    .limit(30)

  return <HistoryClient sessions={sessions ?? []} />
}
