import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import RoutineForm from '@/components/routines/RoutineForm'
import type { Routine } from '@/lib/types/database'

export default async function EditRoutinePage({ params }: { params: Promise<{ id: string }> }) {
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

  return (
    <RoutineForm
      mode="edit"
      routineId={id}
      initial={{
        name: routine.name,
        description: routine.description ?? '',
        day: routine.day ?? '',
        main_muscle_group: routine.main_muscle_group ?? '',
      }}
    />
  )
}
