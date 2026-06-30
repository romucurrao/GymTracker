import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import WorkoutHomeClient from './WorkoutHomeClient'

export default async function WorkoutPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: routines } = await supabase
    .from('routines')
    .select('*')
    .order('name')

  const { data: sessions } = await supabase
    .from('workout_sessions')
    .select('*, routine:routines(name)')
    .order('session_date', { ascending: false })
    .limit(10)

  return <WorkoutHomeClient routines={routines ?? []} sessions={sessions ?? []} />
}
