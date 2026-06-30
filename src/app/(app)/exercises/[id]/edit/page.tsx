import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { notFound } from 'next/navigation'
import ExerciseForm from '@/components/exercises/ExerciseForm'
import type { Exercise } from '@/lib/types/database'

export default async function EditExercisePage({ params }: { params: Promise<{ id: string }> }) {
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

  return (
    <ExerciseForm
      mode="edit"
      exerciseId={id}
      initial={{
        name: exercise.name,
        primary_muscle: exercise.primary_muscle,
        secondary_muscles: (exercise.secondary_muscles ?? []).join(', '),
        type: exercise.type,
        description: exercise.description ?? '',
        equipment: exercise.equipment ?? '',
        level: exercise.level ?? 'principiante',
      }}
    />
  )
}
