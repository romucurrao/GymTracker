export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          name: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string | null
          created_at?: string
        }
      }
      routines: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          days: string[] | null
          main_muscle_group: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          days?: string[] | null
          main_muscle_group?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          days?: string[] | null
          main_muscle_group?: string | null
          created_at?: string
        }
      }
      exercises: {
        Row: {
          id: string
          user_id: string | null
          name: string
          primary_muscle: string
          secondary_muscles: string[] | null
          type: ExerciseType
          description: string | null
          equipment: string | null
          is_global: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          primary_muscle: string
          secondary_muscles?: string[] | null
          type: ExerciseType
          description?: string | null
          equipment?: string | null
          is_global?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          primary_muscle?: string
          secondary_muscles?: string[] | null
          type?: ExerciseType
          description?: string | null
          equipment?: string | null
          is_global?: boolean
          created_at?: string
        }
      }
      routine_items: {
        Row: {
          id: string
          user_id: string
          routine_id: string
          exercise_id: string | null
          order_index: number
          item_type: 'exercise' | 'rest'
          is_warmup: boolean
          target_sets: number | null
          target_reps: number | null
          target_weight: number | null
          rest_min_seconds: number | null
          rest_max_seconds: number | null
          rest_label: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          routine_id: string
          exercise_id?: string | null
          order_index?: number
          item_type?: 'exercise' | 'rest'
          is_warmup?: boolean
          target_sets?: number | null
          target_reps?: number | null
          target_weight?: number | null
          rest_min_seconds?: number | null
          rest_max_seconds?: number | null
          rest_label?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          routine_id?: string
          exercise_id?: string | null
          order_index?: number
          item_type?: 'exercise' | 'rest'
          is_warmup?: boolean
          target_sets?: number | null
          target_reps?: number | null
          target_weight?: number | null
          rest_min_seconds?: number | null
          rest_max_seconds?: number | null
          rest_label?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      routine_exercise_sets: {
        Row: {
          id: string
          user_id: string
          routine_item_id: string
          set_number: number
          target_reps: number | null
          target_weight: number | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          routine_item_id: string
          set_number: number
          target_reps?: number | null
          target_weight?: number | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          routine_item_id?: string
          set_number?: number
          target_reps?: number | null
          target_weight?: number | null
          notes?: string | null
          created_at?: string
        }
      }
      workout_sessions: {
        Row: {
          id: string
          user_id: string
          routine_id: string | null
          session_date: string
          notes: string | null
          started_at: string | null
          finished_at: string | null
          duration_seconds: number
          status: 'active' | 'paused' | 'completed'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          routine_id?: string | null
          session_date?: string
          notes?: string | null
          started_at?: string | null
          finished_at?: string | null
          duration_seconds?: number
          status?: 'active' | 'paused' | 'completed'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          routine_id?: string | null
          session_date?: string
          notes?: string | null
          started_at?: string | null
          finished_at?: string | null
          duration_seconds?: number
          status?: 'active' | 'paused' | 'completed'
          created_at?: string
        }
      }
      workout_sets: {
        Row: {
          id: string
          user_id: string
          workout_session_id: string
          exercise_id: string
          set_number: number
          reps: number | null
          weight: number | null
          target_reps: number | null
          target_weight: number | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          workout_session_id: string
          exercise_id: string
          set_number?: number
          reps?: number | null
          weight?: number | null
          target_reps?: number | null
          target_weight?: number | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          workout_session_id?: string
          exercise_id?: string
          set_number?: number
          reps?: number | null
          weight?: number | null
          target_reps?: number | null
          target_weight?: number | null
          notes?: string | null
          created_at?: string
        }
      }
    }
  }
}

// ── Tipos de ejercicio ─────────────────────────────────────
export type ExerciseType =
  | 'fuerza'
  | 'compuesto'
  | 'aislamiento'
  | 'calentamiento'
  | 'movilidad'
  | 'cardio'
  | 'otro'

// ── Equipamiento predefinido ───────────────────────────────
export const EQUIPMENT_OPTIONS = [
  'Barra',
  'Mancuerna',
  'Polea',
  'Máquina',
  'Peso corporal',
  'Banda elástica',
  'Kettlebell',
  'Banco',
  'TRX',
  'Cuerda',
  'Cinta',
  'Bicicleta estática',
  'Elíptico',
  'Cuerdas de batalla',
  'Otro',
] as const

// ── Row helpers ────────────────────────────────────────────
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Routine = Database['public']['Tables']['routines']['Row']
export type Exercise = Database['public']['Tables']['exercises']['Row']
export type RoutineItem = Database['public']['Tables']['routine_items']['Row']
export type RoutineExerciseSet = Database['public']['Tables']['routine_exercise_sets']['Row']
export type WorkoutSession = Database['public']['Tables']['workout_sessions']['Row']
export type WorkoutSet = Database['public']['Tables']['workout_sets']['Row']

export type RoutineItemWithExercise = RoutineItem & {
  exercise: Exercise | null
  routine_exercise_sets?: RoutineExerciseSet[]
}

export type WorkoutSetWithExercise = WorkoutSet & {
  exercise: Exercise
}

export type WorkoutSessionWithSets = WorkoutSession & {
  workout_sets: WorkoutSetWithExercise[]
}
