import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import RoutineDetailClient from './RoutineDetailClient'
import type { Routine, RoutineItemWithExercise } from '@/lib/types/database'

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

  const { data: routineItems } = await supabase
    .from('routine_items')
    .select('*, exercise:exercises(*)')
    .eq('routine_id', id)
    .order('order_index', { ascending: true })

  return (
    <RoutineDetailClient
      routine={routine}
      initialItems={(routineItems as RoutineItemWithExercise[]) ?? []}
    />
  )
}
