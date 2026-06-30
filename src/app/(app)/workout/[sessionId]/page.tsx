import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import WorkoutSessionClient from './WorkoutSessionClient'

export default async function WorkoutSessionPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: session } = await supabase
    .from('workout_sessions')
    .select('*, routine:routines(name, routine_exercises(*, exercise:exercises(*)))')
    .eq('id', sessionId)
    .single()

  if (!session) return notFound()

  const { data: existingSets } = await supabase
    .from('workout_sets')
    .select('*, exercise:exercises(name)')
    .eq('workout_session_id', sessionId)
    .order('created_at', { ascending: true })

  const { data: exercises } = await supabase
    .from('exercises')
    .select('*')
    .order('name')

  return (
    <WorkoutSessionClient
      session={session}
      existingSets={existingSets ?? []}
      allExercises={exercises ?? []}
    />
  )
}
