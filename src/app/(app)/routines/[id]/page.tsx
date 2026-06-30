import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import RoutineDetailClient from './RoutineDetailClient'
import type { Routine } from '@/lib/types/database'

export default async function RoutineDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  const { data } = await supabase
    .from('routines')
    .select('*')
    .eq('id', id)
    .single()

  const routine = data as Routine | null
  if (!routine) return notFound()

  const { data: routineExercises } = await supabase
    .from('routine_exercises')
    .select('*, exercise:exercises(*)')
    .eq('routine_id', id)
    .order('exercise_order', { ascending: true })

  return (
    <RoutineDetailClient
      routine={routine}
      routineExercises={routineExercises ?? []}
    />
  )
}
