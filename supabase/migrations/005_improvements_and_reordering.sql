-- ============================================================
-- GYM TRACKER — Migration 005
-- Mejoras de búsqueda, remoción de nivel, multi-día y core exercises
-- Ejecutar en: Supabase Dashboard > SQL Editor > New Query
-- ============================================================

-- 1. Modificar routines para soportar múltiples días a la semana
-- Añadir columna days como array de text
ALTER TABLE public.routines ADD COLUMN IF NOT EXISTS days text[];

-- Migrar datos de la columna day anterior (ej: "Lunes" -> ARRAY["Lunes"])
UPDATE public.routines
SET days = ARRAY[day]
WHERE day IS NOT NULL AND days IS NULL;

-- Eliminar columna day vieja
ALTER TABLE public.routines DROP COLUMN IF EXISTS day;

-- 2. Eliminar columna level de exercises (no se considera necesaria)
ALTER TABLE public.exercises DROP COLUMN IF EXISTS level;

-- 3. Bloque anónimo PL/pgSQL para insertar los nuevos ejercicios de core/abdominales globales sin duplicarlos
DO $$
BEGIN
  -- Crunch en máquina
  IF NOT EXISTS (SELECT 1 FROM public.exercises WHERE name = 'Crunch en máquina' AND is_global = true) THEN
    INSERT INTO public.exercises (id, user_id, name, primary_muscle, secondary_muscles, type, description, equipment, is_global, created_at)
    VALUES (gen_random_uuid(), NULL, 'Crunch en máquina', 'Abdomen', NULL, 'aislamiento', 'Crunch abdominal sentado empujando los rodillos de la máquina.', 'Máquina', true, now());
  END IF;

  -- Crunch bicicleta
  IF NOT EXISTS (SELECT 1 FROM public.exercises WHERE name = 'Crunch bicicleta' AND is_global = true) THEN
    INSERT INTO public.exercises (id, user_id, name, primary_muscle, secondary_muscles, type, description, equipment, is_global, created_at)
    VALUES (gen_random_uuid(), NULL, 'Crunch bicicleta', 'Core', ARRAY['Oblicuos', 'Abdomen'], 'fuerza', 'Tumbado, tocar codo con rodilla contraria alternando como pedaleando.', 'Peso corporal', true, now());
  END IF;

  -- Crunch inverso
  IF NOT EXISTS (SELECT 1 FROM public.exercises WHERE name = 'Crunch inverso' AND is_global = true) THEN
    INSERT INTO public.exercises (id, user_id, name, primary_muscle, secondary_muscles, type, description, equipment, is_global, created_at)
    VALUES (gen_random_uuid(), NULL, 'Crunch inverso', 'Abdomen', ARRAY['Flexores de cadera'], 'aislamiento', 'Tumbado, elevar las caderas del suelo trayendo las rodillas hacia el pecho.', 'Peso corporal', true, now());
  END IF;

  -- Elevación de piernas colgado
  IF NOT EXISTS (SELECT 1 FROM public.exercises WHERE name = 'Elevación de piernas colgado' AND is_global = true) THEN
    INSERT INTO public.exercises (id, user_id, name, primary_muscle, secondary_muscles, type, description, equipment, is_global, created_at)
    VALUES (gen_random_uuid(), NULL, 'Elevación de piernas colgado', 'Abdomen', ARRAY['Core', 'Flexores de cadera'], 'fuerza', 'Colgado de barra, elevar piernas extendidas hasta quedar paralelas al suelo.', 'Peso corporal', true, now());
  END IF;

  -- Elevación de rodillas colgado
  IF NOT EXISTS (SELECT 1 FROM public.exercises WHERE name = 'Elevación de rodillas colgado' AND is_global = true) THEN
    INSERT INTO public.exercises (id, user_id, name, primary_muscle, secondary_muscles, type, description, equipment, is_global, created_at)
    VALUES (gen_random_uuid(), NULL, 'Elevación de rodillas colgado', 'Abdomen', ARRAY['Flexores de cadera'], 'fuerza', 'Colgado de barra, elevar rodillas flexionadas hacia el pecho de forma controlada.', 'Peso corporal', true, now());
  END IF;

  -- Plancha con toque de hombro
  IF NOT EXISTS (SELECT 1 FROM public.exercises WHERE name = 'Plancha con toque de hombro' AND is_global = true) THEN
    INSERT INTO public.exercises (id, user_id, name, primary_muscle, secondary_muscles, type, description, equipment, is_global, created_at)
    VALUES (gen_random_uuid(), NULL, 'Plancha con toque de hombro', 'Core', ARRAY['Hombros'], 'fuerza', 'En plancha alta con brazos extendidos, alternar toques de mano al hombro opuesto sin rotar cadera.', 'Peso corporal', true, now());
  END IF;

  -- V-ups
  IF NOT EXISTS (SELECT 1 FROM public.exercises WHERE name = 'V-ups' AND is_global = true) THEN
    INSERT INTO public.exercises (id, user_id, name, primary_muscle, secondary_muscles, type, description, equipment, is_global, created_at)
    VALUES (gen_random_uuid(), NULL, 'V-ups', 'Abdomen', ARRAY['Core', 'Flexores de cadera'], 'fuerza', 'Elevar piernas y torso simultáneamente para tocar pies formando una V con el cuerpo.', 'Peso corporal', true, now());
  END IF;

  -- Sit-ups
  IF NOT EXISTS (SELECT 1 FROM public.exercises WHERE name = 'Sit-ups' AND is_global = true) THEN
    INSERT INTO public.exercises (id, user_id, name, primary_muscle, secondary_muscles, type, description, equipment, is_global, created_at)
    VALUES (gen_random_uuid(), NULL, 'Sit-ups', 'Abdomen', ARRAY['Flexores de cadera'], 'fuerza', 'Abdominal tradicional con flexión completa del tronco hasta sentarse.', 'Peso corporal', true, now());
  END IF;

  -- Toes to bar
  IF NOT EXISTS (SELECT 1 FROM public.exercises WHERE name = 'Toes to bar' AND is_global = true) THEN
    INSERT INTO public.exercises (id, user_id, name, primary_muscle, secondary_muscles, type, description, equipment, is_global, created_at)
    VALUES (gen_random_uuid(), NULL, 'Toes to bar', 'Core', ARRAY['Abdomen', 'Antebrazos'], 'fuerza', 'Colgado de barra, elevar pies hasta tocar la barra con la punta de los dedos.', 'Peso corporal', true, now());
  END IF;

  -- Pallof press
  IF NOT EXISTS (SELECT 1 FROM public.exercises WHERE name = 'Pallof press' AND is_global = true) THEN
    INSERT INTO public.exercises (id, user_id, name, primary_muscle, secondary_muscles, type, description, equipment, is_global, created_at)
    VALUES (gen_random_uuid(), NULL, 'Pallof press', 'Core', ARRAY['Oblicuos', 'Hombros'], 'fuerza', 'Ejercicio de anti-rotación. Sostener polea o banda al pecho y empujar al frente resistiendo el jalón.', 'Polea', true, now());
  END IF;

  -- Woodchopper en polea
  IF NOT EXISTS (SELECT 1 FROM public.exercises WHERE name = 'Woodchopper en polea' AND is_global = true) THEN
    INSERT INTO public.exercises (id, user_id, name, primary_muscle, secondary_muscles, type, description, equipment, is_global, created_at)
    VALUES (gen_random_uuid(), NULL, 'Woodchopper en polea', 'Core', ARRAY['Oblicuos'], 'fuerza', 'Rotación diagonal de tronco con polea simulando un hachazo. Excelente para oblicuos.', 'Polea', true, now());
  END IF;

  -- Escaladores cruzados
  IF NOT EXISTS (SELECT 1 FROM public.exercises WHERE name = 'Escaladores cruzados' AND is_global = true) THEN
    INSERT INTO public.exercises (id, user_id, name, primary_muscle, secondary_muscles, type, description, equipment, is_global, created_at)
    VALUES (gen_random_uuid(), NULL, 'Escaladores cruzados', 'Core', ARRAY['Cardio', 'Oblicuos'], 'cardio', 'En plancha alta, traer rodilla al codo contrario de forma rápida.', 'Peso corporal', true, now());
  END IF;

  -- Buenos días sin peso (activación)
  IF NOT EXISTS (SELECT 1 FROM public.exercises WHERE name = 'Buenos días sin peso (activación)' AND is_global = true) THEN
    INSERT INTO public.exercises (id, user_id, name, primary_muscle, secondary_muscles, type, description, equipment, is_global, created_at)
    VALUES (gen_random_uuid(), NULL, 'Buenos días sin peso (activación)', 'Lumbares', ARRAY['Isquiotibiales', 'Glúteos'], 'calentamiento', 'Manos tras la nuca, flexión de cadera con espalda recta para calentar lumbares.', 'Peso corporal', true, now());
  END IF;

END $$;
