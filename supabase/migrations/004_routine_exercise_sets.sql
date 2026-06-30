-- ============================================================
-- GYM TRACKER — Migration 004
-- Soporte para series objetivo individuales por ejercicio en rutinas
-- Ejecutar en: Supabase Dashboard > SQL Editor > New Query
-- ============================================================

-- 1. Crear tabla de series objetivo para los items de la rutina
CREATE TABLE IF NOT EXISTS public.routine_exercise_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  routine_item_id uuid references public.routine_items(id) on delete cascade not null,
  set_number integer not null,
  target_reps integer,
  target_weight numeric(6,2),
  notes text,
  created_at timestamptz default now() not null
);

-- 2. Activar Row Level Security (RLS) en routine_exercise_sets
ALTER TABLE public.routine_exercise_sets ENABLE ROW LEVEL SECURITY;

-- 3. Crear políticas RLS para routine_exercise_sets
CREATE POLICY "routine_exercise_sets: select own" ON public.routine_exercise_sets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "routine_exercise_sets: insert own" ON public.routine_exercise_sets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "routine_exercise_sets: update own" ON public.routine_exercise_sets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "routine_exercise_sets: delete own" ON public.routine_exercise_sets FOR DELETE USING (auth.uid() = user_id);

-- 4. Agregar columnas de objetivo a workout_sets (series reales de entrenamientos)
ALTER TABLE public.workout_sets
  ADD COLUMN IF NOT EXISTS target_reps integer,
  ADD COLUMN IF NOT EXISTS target_weight numeric(6,2);

-- 5. Bloque anónimo PL/pgSQL para migrar rutinas existentes a la nueva estructura uno a muchos
DO $$
DECLARE
  item_row record;
  i integer;
BEGIN
  -- Buscar todos los items de rutina que sean ejercicios y tengan sets configurados
  FOR item_row IN
    SELECT id, user_id, target_sets, target_reps, target_weight, notes
    FROM public.routine_items
    WHERE item_type = 'exercise' AND target_sets > 0
  LOOP
    -- Insertar n series en routine_exercise_sets
    FOR i IN 1..item_row.target_sets LOOP
      INSERT INTO public.routine_exercise_sets (
        user_id,
        routine_item_id,
        set_number,
        target_reps,
        target_weight,
        notes
      ) VALUES (
        item_row.user_id,
        item_row.id,
        i,
        item_row.target_reps,
        item_row.target_weight,
        item_row.notes
      );
    END LOOP;
  END LOOP;
END $$;
