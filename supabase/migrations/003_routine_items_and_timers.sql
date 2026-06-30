-- ============================================================
-- GYM TRACKER — Migration 003
-- Soporte para descansos ordenados en rutinas y temporizadores de sesión
-- Ejecutar en: Supabase Dashboard > SQL Editor > New Query
-- ============================================================

-- 1. Renombrar tabla routine_exercises a routine_items
ALTER TABLE public.routine_exercises RENAME TO routine_items;

-- 2. Renombrar columna de orden
ALTER TABLE public.routine_items RENAME COLUMN exercise_order TO order_index;

-- 3. Permitir que exercise_id sea nulo (para filas de descanso)
ALTER TABLE public.routine_items ALTER COLUMN exercise_id DROP NOT NULL;

-- 4. Agregar columnas para control de tipo de elemento y descansos
ALTER TABLE public.routine_items
  ADD COLUMN item_type text NOT NULL DEFAULT 'exercise' CHECK (item_type IN ('exercise', 'rest')),
  ADD COLUMN rest_min_seconds integer,
  ADD COLUMN rest_max_seconds integer,
  ADD COLUMN rest_label text;

-- 5. Reconfigurar políticas RLS para routine_items
-- Borramos las políticas antiguas renombradas automáticamente por Postgres
DROP POLICY IF EXISTS "routine_exercises: select own" ON public.routine_items;
DROP POLICY IF EXISTS "routine_exercises: insert own" ON public.routine_items;
DROP POLICY IF EXISTS "routine_exercises: update own" ON public.routine_items;
DROP POLICY IF EXISTS "routine_exercises: delete own" ON public.routine_items;

-- Creamos las nuevas políticas de routine_items
CREATE POLICY "routine_items: select own" ON public.routine_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "routine_items: insert own" ON public.routine_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "routine_items: update own" ON public.routine_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "routine_items: delete own" ON public.routine_items FOR DELETE USING (auth.uid() = user_id);

-- 6. Agregar columnas para temporizadores de sesión en workout_sessions
ALTER TABLE public.workout_sessions
  ADD COLUMN started_at timestamptz DEFAULT now(),
  ADD COLUMN finished_at timestamptz,
  ADD COLUMN duration_seconds integer DEFAULT 0,
  ADD COLUMN status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed'));
