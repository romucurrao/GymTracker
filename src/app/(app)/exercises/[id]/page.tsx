import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import ExerciseDetailClient from './ExerciseDetailClient'
import type { Exercise } from '@/lib/types/database'

export default async function ExerciseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  const { data } = await supabase
    .from('exercises')
    .select('*')
    .eq('id', id)
    .single()

  const exercise = data as Exercise | null
  if (!exercise) return notFound()

  // Historial: todas las series de este ejercicio, ordenadas por fecha
  const { data: sets } = await supabase
    .from('workout_sets')
    .select('*, workout_session:workout_sessions(session_date, routine_id)')
    .eq('exercise_id', id)
    .order('created_at', { ascending: false })
    .limit(50)

  return <ExerciseDetailClient exercise={exercise} sets={sets ?? []} />
}
