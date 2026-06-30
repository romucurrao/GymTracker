-- ============================================================
-- GYM TRACKER — Migration 002
-- Biblioteca global de ejercicios
-- Ejecutar en: Supabase Dashboard > SQL Editor > New Query
-- ============================================================

-- 1. Agregar columnas nuevas a exercises
ALTER TABLE public.exercises
  ADD COLUMN IF NOT EXISTS equipment text,
  ADD COLUMN IF NOT EXISTS level text,
  ADD COLUMN IF NOT EXISTS is_global boolean NOT NULL DEFAULT false;

-- 2. Hacer user_id nullable para ejercicios globales
ALTER TABLE public.exercises ALTER COLUMN user_id DROP NOT NULL;

-- 3. Actualizar constraint de tipo (agregar compuesto, aislamiento)
ALTER TABLE public.exercises DROP CONSTRAINT IF EXISTS exercises_type_check;
ALTER TABLE public.exercises
  ADD CONSTRAINT exercises_type_check
  CHECK (type IN ('fuerza', 'compuesto', 'aislamiento', 'calentamiento', 'movilidad', 'cardio', 'otro'));

-- 4. Actualizar políticas RLS de exercises
DROP POLICY IF EXISTS "exercises: select own" ON public.exercises;
CREATE POLICY "exercises: select global or own" ON public.exercises
  FOR SELECT USING (is_global = true OR auth.uid() = user_id);

-- INSERT/UPDATE/DELETE siguen igual (solo propios, user_id = auth.uid())


-- ============================================================
-- BIBLIOTECA GLOBAL DE EJERCICIOS (108 ejercicios)
-- ============================================================

INSERT INTO public.exercises
  (id, user_id, name, primary_muscle, secondary_muscles, type, description, equipment, level, is_global, created_at)
VALUES

-- ============================================================
-- PECHO
-- ============================================================
(gen_random_uuid(), NULL, 'Press de banca plano con barra',
  'Pecho', ARRAY['Tríceps', 'Deltoides anterior'],
  'compuesto', 'Ejercicio base de empuje horizontal. Recostado en banco plano, bajar la barra al pecho y empujar.',
  'Barra', 'principiante', true, now()),

(gen_random_uuid(), NULL, 'Press de banca inclinado con barra',
  'Pecho', ARRAY['Tríceps', 'Deltoides anterior'],
  'compuesto', 'Press en banco inclinado a 30-45°. Enfatiza la parte superior del pectoral.',
  'Barra', 'intermedio', true, now()),

(gen_random_uuid(), NULL, 'Press de banca declinado con barra',
  'Pecho', ARRAY['Tríceps'],
  'compuesto', 'Press en banco declinado. Enfatiza la parte inferior del pectoral.',
  'Barra', 'intermedio', true, now()),

(gen_random_uuid(), NULL, 'Press de banca plano con mancuernas',
  'Pecho', ARRAY['Tríceps', 'Deltoides anterior'],
  'compuesto', 'Igual al press con barra pero con mancuernas. Mayor rango de movimiento y trabajo estabilizador.',
  'Mancuerna', 'principiante', true, now()),

(gen_random_uuid(), NULL, 'Press de banca inclinado con mancuernas',
  'Pecho', ARRAY['Tríceps', 'Deltoides anterior'],
  'compuesto', 'Press inclinado con mancuernas para parte superior del pecho.',
  'Mancuerna', 'intermedio', true, now()),

(gen_random_uuid(), NULL, 'Aperturas con mancuernas en banco plano',
  'Pecho', ARRAY['Deltoides anterior'],
  'aislamiento', 'Apertura controlada de brazos en banco plano. Mantener leve flexión en el codo.',
  'Mancuerna', 'intermedio', true, now()),

(gen_random_uuid(), NULL, 'Aperturas con mancuernas inclinado',
  'Pecho', ARRAY['Deltoides anterior'],
  'aislamiento', 'Apertura en banco inclinado. Mayor énfasis en el pectoral superior.',
  'Mancuerna', 'intermedio', true, now()),

(gen_random_uuid(), NULL, 'Cruce de poleas',
  'Pecho', ARRAY['Deltoides anterior'],
  'aislamiento', 'Cruce de poleas altas o bajas para trabajar el pecho con tensión constante.',
  'Polea', 'intermedio', true, now()),

(gen_random_uuid(), NULL, 'Flexiones',
  'Pecho', ARRAY['Tríceps', 'Core', 'Deltoides anterior'],
  'compuesto', 'Empuje con peso corporal. Cuerpo recto, bajar el pecho al suelo y empujar.',
  'Peso corporal', 'principiante', true, now()),

(gen_random_uuid(), NULL, 'Flexiones inclinadas',
  'Pecho', ARRAY['Tríceps', 'Deltoides anterior'],
  'compuesto', 'Pies elevados. Mayor énfasis en la parte superior del pecho.',
  'Peso corporal', 'intermedio', true, now()),

(gen_random_uuid(), NULL, 'Fondos en paralelas (Dips)',
  'Pecho', ARRAY['Tríceps', 'Deltoides'],
  'compuesto', 'Fondos con inclinación hacia adelante para activar más el pectoral.',
  'Peso corporal', 'intermedio', true, now()),

(gen_random_uuid(), NULL, 'Press en máquina pecho',
  'Pecho', ARRAY['Tríceps', 'Deltoides anterior'],
  'compuesto', 'Press en máquina convergente o paralela. Ideal para principiantes.',
  'Máquina', 'principiante', true, now()),

-- ============================================================
-- ESPALDA
-- ============================================================
(gen_random_uuid(), NULL, 'Dominadas',
  'Espalda alta', ARRAY['Bíceps', 'Core'],
  'compuesto', 'Ejercicio clave de jalón vertical. Agarre prono, subir hasta que el mentón supere la barra.',
  'Peso corporal', 'intermedio', true, now()),

(gen_random_uuid(), NULL, 'Jalón al pecho en polea',
  'Espalda alta', ARRAY['Bíceps', 'Romboides'],
  'compuesto', 'Jalón en polea alta. Ideal para quienes no pueden hacer dominadas aún.',
  'Polea', 'principiante', true, now()),

(gen_random_uuid(), NULL, 'Jalón trasnuca en polea',
  'Espalda alta', ARRAY['Bíceps', 'Trapecios'],
  'compuesto', 'Jalón por detrás de la cabeza. Precaución con la movilidad de hombros.',
  'Polea', 'avanzado', true, now()),

(gen_random_uuid(), NULL, 'Remo con barra',
  'Espalda alta', ARRAY['Bíceps', 'Romboides', 'Trapecios'],
  'compuesto', 'Remo horizontal con barra. Torso inclinado ~45°, tirar hacia el abdomen.',
  'Barra', 'intermedio', true, now()),

(gen_random_uuid(), NULL, 'Remo con mancuerna a una mano',
  'Espalda alta', ARRAY['Bíceps', 'Romboides'],
  'compuesto', 'Remo unilateral apoyado en banco. Excelente para trabajar la espalda de forma asimétrica.',
  'Mancuerna', 'principiante', true, now()),

(gen_random_uuid(), NULL, 'Remo en polea baja',
  'Espalda alta', ARRAY['Bíceps', 'Lumbares'],
  'compuesto', 'Remo sentado en polea baja. Mantener espalda recta y tirar hacia el abdomen.',
  'Polea', 'principiante', true, now()),

(gen_random_uuid(), NULL, 'Remo en máquina',
  'Espalda alta', ARRAY['Bíceps', 'Romboides'],
  'compuesto', 'Remo en máquina con soporte para el pecho. Ideal para principiantes.',
  'Máquina', 'principiante', true, now()),

(gen_random_uuid(), NULL, 'Pull-over con mancuerna',
  'Espalda alta', ARRAY['Pecho', 'Tríceps'],
  'aislamiento', 'Tumbado en banco transversal, extender brazos con mancuerna sobre la cabeza.',
  'Mancuerna', 'intermedio', true, now()),

(gen_random_uuid(), NULL, 'Peso muerto convencional',
  'Espalda baja', ARRAY['Isquiotibiales', 'Glúteos', 'Cuádriceps', 'Trapecios'],
  'compuesto', 'El ejercicio más completo de la sala. Levantamiento de barra desde el suelo con espalda neutra.',
  'Barra', 'intermedio', true, now()),

(gen_random_uuid(), NULL, 'Peso muerto rumano',
  'Isquiotibiales', ARRAY['Glúteos', 'Espalda baja'],
  'compuesto', 'Versión de peso muerto con piernas casi extendidas. Énfasis en isquiotibiales y glúteos.',
  'Barra', 'intermedio', true, now()),

(gen_random_uuid(), NULL, 'Hiperextensiones en banco',
  'Espalda baja', ARRAY['Glúteos', 'Isquiotibiales'],
  'aislamiento', 'En banco romano o banco 45°, flexionar y extender el tronco.',
  'Banco', 'principiante', true, now()),

(gen_random_uuid(), NULL, 'Face Pull',
  'Hombros', ARRAY['Manguito rotador', 'Romboides', 'Trapecios'],
  'aislamiento', 'Jalón en polea alta hacia la cara. Fundamental para la salud del hombro.',
  'Polea', 'principiante', true, now()),

-- ============================================================
-- HOMBROS
-- ============================================================
(gen_random_uuid(), NULL, 'Press militar con barra de pie',
  'Hombros', ARRAY['Tríceps', 'Core', 'Trapecios'],
  'compuesto', 'Press vertical con barra. De pie, empujar la barra sobre la cabeza.',
  'Barra', 'intermedio', true, now()),

(gen_random_uuid(), NULL, 'Press militar sentado con barra',
  'Hombros', ARRAY['Tríceps', 'Trapecios'],
  'compuesto', 'Press vertical sentado con barra. Mayor estabilidad que de pie.',
  'Barra', 'principiante', true, now()),

(gen_random_uuid(), NULL, 'Press Arnold',
  'Hombros', ARRAY['Tríceps', 'Deltoides anterior', 'Deltoides lateral'],
  'compuesto', 'Press con mancuernas con rotación de muñeca al subir. Inventado por Arnold.',
  'Mancuerna', 'intermedio', true, now()),

(gen_random_uuid(), NULL, 'Press de hombros con mancuernas',
  'Hombros', ARRAY['Tríceps', 'Trapecios'],
  'compuesto', 'Press vertical con mancuernas. Permite mayor rango de movimiento.',
  'Mancuerna', 'principiante', true, now()),

(gen_random_uuid(), NULL, 'Elevaciones laterales con mancuernas',
  'Hombros', NULL,
  'aislamiento', 'Elevar mancuernas a los lados hasta la altura del hombro. El ejercicio rey para deltoides lateral.',
  'Mancuerna', 'principiante', true, now()),

(gen_random_uuid(), NULL, 'Elevaciones frontales con mancuernas',
  'Hombros', NULL,
  'aislamiento', 'Elevar mancuernas al frente hasta la altura del hombro. Trabaja el deltoides anterior.',
  'Mancuerna', 'principiante', true, now()),

(gen_random_uuid(), NULL, 'Elevaciones laterales en polea',
  'Hombros', NULL,
  'aislamiento', 'Elevación lateral con polea baja. Tensión constante durante todo el rango.',
  'Polea', 'intermedio', true, now()),

(gen_random_uuid(), NULL, 'Press de hombros en máquina',
  'Hombros', ARRAY['Tríceps'],
  'compuesto', 'Press vertical en máquina. Ideal para principiantes o al final del entrenamiento.',
  'Máquina', 'principiante', true, now()),

(gen_random_uuid(), NULL, 'Encogimientos de hombros (Shrugs)',
  'Trapecios', NULL,
  'aislamiento', 'Elevar los hombros para trabajar los trapecios superiores.',
  'Barra', 'principiante', true, now()),

(gen_random_uuid(), NULL, 'Pájaro con mancuernas (Rear Delt Fly)',
  'Hombros', ARRAY['Romboides'],
  'aislamiento', 'Inclinado hacia adelante, elevar mancuernas a los lados. Trabaja el deltoides posterior.',
  'Mancuerna', 'intermedio', true, now()),

-- ============================================================
-- BÍCEPS
-- ============================================================
(gen_random_uuid(), NULL, 'Curl de bíceps con barra',
  'Bíceps', ARRAY['Braquial', 'Braquiorradial'],
  'aislamiento', 'Curl clásico con barra. Mantener codos fijos al cuerpo.',
  'Barra', 'principiante', true, now()),

(gen_random_uuid(), NULL, 'Curl martillo con mancuernas',
  'Bíceps', ARRAY['Braquiorradial', 'Braquial'],
  'aislamiento', 'Curl con agarre neutro (palma hacia adentro). Trabaja bíceps y braquiorradial.',
  'Mancuerna', 'principiante', true, now()),

(gen_random_uuid(), NULL, 'Curl de bíceps con mancuerna',
  'Bíceps', NULL,
  'aislamiento', 'Curl unilateral o bilateral con mancuernas. Supinación al subir para máxima contracción.',
  'Mancuerna', 'principiante', true, now()),

(gen_random_uuid(), NULL, 'Curl en polea baja',
  'Bíceps', NULL,
  'aislamiento', 'Curl de bíceps en polea baja. Tensión constante en todo el rango.',
  'Polea', 'principiante', true, now()),

(gen_random_uuid(), NULL, 'Curl en banco Scott (Predicador)',
  'Bíceps', NULL,
  'aislamiento', 'Curl en banco predicador. Elimina el impulso y aísla el bíceps.',
  'Banco', 'intermedio', true, now()),

(gen_random_uuid(), NULL, 'Curl inclinado con mancuernas',
  'Bíceps', ARRAY['Braquial'],
  'aislamiento', 'Sentado en banco inclinado, brazos colgando. Mayor estiramiento del bíceps.',
  'Mancuerna', 'intermedio', true, now()),

(gen_random_uuid(), NULL, 'Curl concentrado',
  'Bíceps', NULL,
  'aislamiento', 'Sentado, apoyar el codo en la cara interna del muslo. Máxima contracción.',
  'Mancuerna', 'principiante', true, now()),

(gen_random_uuid(), NULL, 'Curl 21s',
  'Bíceps', NULL,
  'aislamiento', '7 repeticiones en la mitad inferior, 7 en la mitad superior y 7 completas.',
  'Barra', 'intermedio', true, now()),

-- ============================================================
-- TRÍCEPS
-- ============================================================
(gen_random_uuid(), NULL, 'Extensión de tríceps en polea alta',
  'Tríceps', NULL,
  'aislamiento', 'Empuje hacia abajo en polea con barra recta o cuerda.',
  'Polea', 'principiante', true, now()),

(gen_random_uuid(), NULL, 'Extensión en polea con cuerda',
  'Tríceps', NULL,
  'aislamiento', 'Con accesorio de cuerda, separar las manos al final para mayor contracción.',
  'Polea', 'principiante', true, now()),

(gen_random_uuid(), NULL, 'Press francés con barra',
  'Tríceps', NULL,
  'aislamiento', 'Tumbado, bajar la barra hacia la frente. También conocido como Skull Crusher.',
  'Barra', 'intermedio', true, now()),

(gen_random_uuid(), NULL, 'Extensión de tríceps sobre la cabeza',
  'Tríceps', NULL,
  'aislamiento', 'De pie o sentado, extender la mancuerna sobre la cabeza. Trabaja la cabeza larga.',
  'Mancuerna', 'principiante', true, now()),

(gen_random_uuid(), NULL, 'Fondos en banco para tríceps',
  'Tríceps', ARRAY['Deltoides anterior', 'Pecho'],
  'aislamiento', 'Manos en banco detrás, flexionar y extender codos. Piernas rectas para más intensidad.',
  'Banco', 'principiante', true, now()),

(gen_random_uuid(), NULL, 'Press cerrado en banco',
  'Tríceps', ARRAY['Pecho', 'Deltoides anterior'],
  'compuesto', 'Press de banca con agarre estrecho (manos separadas ~30 cm). Énfasis en tríceps.',
  'Barra', 'intermedio', true, now()),

(gen_random_uuid(), NULL, 'Patada de tríceps con mancuerna',
  'Tríceps', NULL,
  'aislamiento', 'Inclinado, extender el brazo hacia atrás manteniendo el codo fijo.',
  'Mancuerna', 'intermedio', true, now()),

-- ============================================================
-- ANTEBRAZOS
-- ============================================================
(gen_random_uuid(), NULL, 'Curl de muñeca con barra',
  'Antebrazos', NULL,
  'aislamiento', 'Sentado, muñecas sobre las rodillas, flexionar y extender con barra.',
  'Barra', 'principiante', true, now()),

(gen_random_uuid(), NULL, 'Curl de muñeca inverso',
  'Antebrazos', NULL,
  'aislamiento', 'Igual al curl de muñeca pero con agarre prono (dorso de la mano hacia arriba).',
  'Barra', 'principiante', true, now()),

(gen_random_uuid(), NULL, "Farmer's Walk",
  'Antebrazos', ARRAY['Core', 'Trapecios', 'Glúteos'],
  'fuerza', 'Caminar con mancuernas pesadas en cada mano. Excelente para agarre y core.',
  'Mancuerna', 'principiante', true, now()),

(gen_random_uuid(), NULL, 'Agarre en barra de dedos',
  'Antebrazos', NULL,
  'aislamiento', 'Colgarse de la barra de dominadas con los dedos extendidos para fortalecer el agarre.',
  'Peso corporal', 'intermedio', true, now()),

-- ============================================================
-- CUÁDRICEPS
-- ============================================================
(gen_random_uuid(), NULL, 'Sentadilla con barra (Back Squat)',
  'Cuádriceps', ARRAY['Glúteos', 'Isquiotibiales', 'Core'],
  'compuesto', 'El ejercicio rey de piernas. Barra en trapecios, bajar hasta paralelo o más.',
  'Barra', 'intermedio', true, now()),

(gen_random_uuid(), NULL, 'Sentadilla goblet con mancuerna',
  'Cuádriceps', ARRAY['Glúteos', 'Core'],
  'compuesto', 'Sostener la mancuerna al pecho. Ideal para aprender la técnica de sentadilla.',
  'Mancuerna', 'principiante', true, now()),

(gen_random_uuid(), NULL, 'Prensa de piernas',
  'Cuádriceps', ARRAY['Glúteos', 'Isquiotibiales'],
  'compuesto', 'Empuje en máquina de prensa. Ajustar posición de pies para énfasis diferente.',
  'Máquina', 'principiante', true, now()),

(gen_random_uuid(), NULL, 'Extensión de cuádriceps en máquina',
  'Cuádriceps', NULL,
  'aislamiento', 'Extensión de rodillas en máquina. Aísla el cuádriceps.',
  'Máquina', 'principiante', true, now()),

(gen_random_uuid(), NULL, 'Zancadas con mancuernas',
  'Cuádriceps', ARRAY['Glúteos', 'Isquiotibiales'],
  'compuesto', 'Paso adelante con mancuernas. Rodar la rodilla trasera cerca del suelo.',
  'Mancuerna', 'principiante', true, now()),

(gen_random_uuid(), NULL, 'Sentadilla búlgara (Split Squat)',
  'Cuádriceps', ARRAY['Glúteos', 'Isquiotibiales'],
  'compuesto', 'Pie trasero elevado en banco. Unilateral, muy exigente para glúteos y cuádriceps.',
  'Mancuerna', 'avanzado', true, now()),

(gen_random_uuid(), NULL, 'Sentadilla hack con barra',
  'Cuádriceps', ARRAY['Glúteos'],
  'compuesto', 'Barra detrás de las piernas. Variante que enfatiza la parte baja del cuádriceps.',
  'Barra', 'avanzado', true, now()),

(gen_random_uuid(), NULL, 'Step-up con mancuernas',
  'Cuádriceps', ARRAY['Glúteos', 'Isquiotibiales'],
  'compuesto', 'Subir a un banco o cajón alternando piernas con mancuernas en mano.',
  'Mancuerna', 'principiante', true, now()),

(gen_random_uuid(), NULL, 'Sentadilla frontal con barra',
  'Cuádriceps', ARRAY['Core', 'Glúteos'],
  'compuesto', 'Barra en la parte frontal del hombro. Mayor énfasis en cuádriceps y core.',
  'Barra', 'avanzado', true, now()),

-- ============================================================
-- ISQUIOTIBIALES
-- ============================================================
(gen_random_uuid(), NULL, 'Curl de isquiotibiales acostado',
  'Isquiotibiales', ARRAY['Glúteos'],
  'aislamiento', 'En máquina tumbado boca abajo, flexionar las rodillas.',
  'Máquina', 'principiante', true, now()),

(gen_random_uuid(), NULL, 'Curl de isquiotibiales sentado',
  'Isquiotibiales', ARRAY['Glúteos'],
  'aislamiento', 'En máquina sentado. Mayor rango de movimiento que la versión acostada.',
  'Máquina', 'principiante', true, now()),

(gen_random_uuid(), NULL, 'Peso muerto con piernas rígidas',
  'Isquiotibiales', ARRAY['Espalda baja', 'Glúteos'],
  'compuesto', 'Similar al rumano pero con piernas completamente extendidas. Máximo estiramiento.',
  'Barra', 'avanzado', true, now()),

(gen_random_uuid(), NULL, 'Buenos días (Good Morning)',
  'Isquiotibiales', ARRAY['Espalda baja', 'Glúteos'],
  'compuesto', 'Barra en trapecios, inclinarse hacia adelante manteniendo espalda recta.',
  'Barra', 'avanzado', true, now()),

(gen_random_uuid(), NULL, 'Curl nórdico (Nordic Curl)',
  'Isquiotibiales', NULL,
  'compuesto', 'Con los pies sujetos, dejarse caer hacia adelante de forma controlada.',
  'Peso corporal', 'avanzado', true, now()),

-- ============================================================
-- GLÚTEOS
-- ============================================================
(gen_random_uuid(), NULL, 'Hip Thrust con barra',
  'Glúteos', ARRAY['Isquiotibiales', 'Core'],
  'compuesto', 'Espalda en banco, barra sobre caderas. El mejor ejercicio para glúteos.',
  'Barra', 'intermedio', true, now()),

(gen_random_uuid(), NULL, 'Hip Thrust con mancuerna',
  'Glúteos', ARRAY['Isquiotibiales'],
  'compuesto', 'Versión con mancuerna del hip thrust. Ideal para empezar.',
  'Mancuerna', 'principiante', true, now()),

(gen_random_uuid(), NULL, 'Puente de glúteos',
  'Glúteos', ARRAY['Isquiotibiales', 'Core'],
  'compuesto', 'Tumbado, elevar la cadera. Versión más accesible del hip thrust.',
  'Peso corporal', 'principiante', true, now()),

(gen_random_uuid(), NULL, 'Patada de glúteo en polea',
  'Glúteos', NULL,
  'aislamiento', 'Con tobillera en polea baja, extender la pierna hacia atrás.',
  'Polea', 'principiante', true, now()),

(gen_random_uuid(), NULL, 'Abducción de cadera en máquina',
  'Glúteos', ARRAY['Abductores'],
  'aislamiento', 'En máquina abductora, empujar las rodillas hacia afuera.',
  'Máquina', 'principiante', true, now()),

(gen_random_uuid(), NULL, 'Activación de glúteos con banda',
  'Glúteos', NULL,
  'calentamiento', 'Con banda en rodillas: Clamshell, puente con banda o caminata lateral.',
  'Banda elástica', 'principiante', true, now()),

(gen_random_uuid(), NULL, 'Sentadilla sumo',
  'Glúteos', ARRAY['Aductores', 'Cuádriceps'],
  'compuesto', 'Sentadilla con pies muy separados y puntas hacia afuera. Mayor énfasis en glúteos.',
  'Barra', 'intermedio', true, now()),

-- ============================================================
-- GEMELOS
-- ============================================================
(gen_random_uuid(), NULL, 'Elevación de talones de pie en máquina',
  'Gemelos', NULL,
  'aislamiento', 'En máquina de pie, elevar sobre la punta de los pies con rango completo.',
  'Máquina', 'principiante', true, now()),

(gen_random_uuid(), NULL, 'Elevación de talones sentado en máquina',
  'Gemelos', ARRAY['Sóleo'],
  'aislamiento', 'En máquina sentado. Trabaja principalmente el sóleo (gemelo profundo).',
  'Máquina', 'principiante', true, now()),

(gen_random_uuid(), NULL, 'Elevación de talones en prensa',
  'Gemelos', NULL,
  'aislamiento', 'Poner las puntas de los pies en el borde de la prensa y elevar el talón.',
  'Máquina', 'principiante', true, now()),

(gen_random_uuid(), NULL, 'Elevación de talones con mancuerna',
  'Gemelos', NULL,
  'aislamiento', 'De pie sobre un escalón con una mancuerna. Unilateral o bilateral.',
  'Mancuerna', 'principiante', true, now()),

-- ============================================================
-- ADUCTORES
-- ============================================================
(gen_random_uuid(), NULL, 'Aducción de cadera en máquina',
  'Aductores', NULL,
  'aislamiento', 'En máquina aductora, cerrar las rodillas hacia el centro.',
  'Máquina', 'principiante', true, now()),

(gen_random_uuid(), NULL, 'Aducción con banda elástica',
  'Aductores', NULL,
  'aislamiento', 'Con banda en el tobillo anclada, traer la pierna hacia el centro.',
  'Banda elástica', 'principiante', true, now()),

(gen_random_uuid(), NULL, 'Sentadilla sumo con mancuerna',
  'Aductores', ARRAY['Cuádriceps', 'Glúteos'],
  'compuesto', 'Sentadilla con pies anchos y mancuerna colgando. Activa mucho los aductores.',
  'Mancuerna', 'principiante', true, now()),

-- ============================================================
-- ABDUCTORES
-- ============================================================
(gen_random_uuid(), NULL, 'Abducción de cadera en máquina',
  'Abductores', ARRAY['Glúteos'],
  'aislamiento', 'En máquina abductora, abrir las rodillas hacia afuera.',
  'Máquina', 'principiante', true, now()),

(gen_random_uuid(), NULL, 'Caminata lateral con banda',
  'Abductores', ARRAY['Glúteos'],
  'calentamiento', 'Con banda en rodillas, dar pasos laterales controlados.',
  'Banda elástica', 'principiante', true, now()),

(gen_random_uuid(), NULL, 'Elevación de pierna lateral',
  'Abductores', ARRAY['Glúteos'],
  'aislamiento', 'Tumbado de lado, elevar la pierna superior de forma controlada.',
  'Peso corporal', 'principiante', true, now()),

-- ============================================================
-- CORE Y ABDOMINALES
-- ============================================================
(gen_random_uuid(), NULL, 'Plancha frontal',
  'Core', ARRAY['Hombros', 'Glúteos'],
  'fuerza', 'Posición de plancha sobre los codos. Cuerpo recto como una tabla. Aguantar el tiempo.',
  'Peso corporal', 'principiante', true, now()),

(gen_random_uuid(), NULL, 'Plancha lateral',
  'Core', ARRAY['Abductores', 'Hombros'],
  'fuerza', 'Apoyo en un codo y el borde del pie. Trabaja el core lateral.',
  'Peso corporal', 'principiante', true, now()),

(gen_random_uuid(), NULL, 'Crunch abdominal',
  'Abdomen', NULL,
  'aislamiento', 'Tumbado, elevar el tronco hacia las rodillas. No tirar del cuello.',
  'Peso corporal', 'principiante', true, now()),

(gen_random_uuid(), NULL, 'Crunch en polea',
  'Abdomen', NULL,
  'aislamiento', 'De rodillas, jalón en polea alta hacia el suelo. Permite agregar carga progresiva.',
  'Polea', 'intermedio', true, now()),

(gen_random_uuid(), NULL, 'Russian Twist',
  'Core', ARRAY['Oblicuos'],
  'fuerza', 'Sentado con torso inclinado, rotar de lado a lado. Con o sin peso.',
  'Peso corporal', 'principiante', true, now()),

(gen_random_uuid(), NULL, 'Rueda abdominal (Ab Wheel)',
  'Core', ARRAY['Hombros', 'Lumbares'],
  'fuerza', 'Extender la rueda hacia adelante desde rodillas. Muy exigente para el core.',
  'Otro', 'avanzado', true, now()),

(gen_random_uuid(), NULL, 'Elevación de piernas tumbado',
  'Abdomen', ARRAY['Flexores de cadera'],
  'aislamiento', 'Tumbado, elevar las piernas extendidas a 90° y bajar sin tocar el suelo.',
  'Peso corporal', 'intermedio', true, now()),

(gen_random_uuid(), NULL, 'Mountain Climbers',
  'Core', ARRAY['Hombros', 'Cuádriceps'],
  'cardio', 'En posición de plancha alta, alternar rodillas hacia el pecho rápidamente.',
  'Peso corporal', 'principiante', true, now()),

(gen_random_uuid(), NULL, 'Dead Bug',
  'Core', NULL,
  'fuerza', 'Tumbado, extender el brazo y la pierna contraria manteniendo la zona lumbar pegada al suelo.',
  'Peso corporal', 'principiante', true, now()),

(gen_random_uuid(), NULL, 'Hollow Body Hold',
  'Core', NULL,
  'fuerza', 'Tumbado, mantener brazos y piernas extendidos a pocos centímetros del suelo.',
  'Peso corporal', 'avanzado', true, now()),

(gen_random_uuid(), NULL, 'Tijeras abdominales',
  'Abdomen', ARRAY['Flexores de cadera'],
  'aislamiento', 'Tumbado, cruzar y descrurar las piernas extendidas a pocos cm del suelo.',
  'Peso corporal', 'principiante', true, now()),

-- ============================================================
-- LUMBARES
-- ============================================================
(gen_random_uuid(), NULL, 'Superman',
  'Espalda baja', ARRAY['Glúteos', 'Isquiotibiales'],
  'aislamiento', 'Tumbado boca abajo, elevar brazos y piernas simultáneamente.',
  'Peso corporal', 'principiante', true, now()),

(gen_random_uuid(), NULL, 'Extensión de espalda en banco 45°',
  'Espalda baja', ARRAY['Glúteos', 'Isquiotibiales'],
  'aislamiento', 'En banco a 45°, flexionar y extender el tronco. Se puede agregar peso.',
  'Banco', 'principiante', true, now()),

(gen_random_uuid(), NULL, 'Bird Dog',
  'Espalda baja', ARRAY['Core', 'Glúteos'],
  'fuerza', 'En cuatro apoyos, extender brazo y pierna opuesta. Fundamental para lumbar.',
  'Peso corporal', 'principiante', true, now()),

-- ============================================================
-- CARDIO
-- ============================================================
(gen_random_uuid(), NULL, 'Caminata en cinta',
  'Cardio', NULL,
  'cardio', 'Caminata a ritmo moderado en cinta. Excelente para principiantes y recuperación activa.',
  'Cinta', 'principiante', true, now()),

(gen_random_uuid(), NULL, 'Carrera en cinta',
  'Cardio', NULL,
  'cardio', 'Carrera continua en cinta. Ajustar velocidad e inclinación según objetivo.',
  'Cinta', 'intermedio', true, now()),

(gen_random_uuid(), NULL, 'Bicicleta estática',
  'Cardio', NULL,
  'cardio', 'Pedales a ritmo constante o con intervalos. Bajo impacto para las articulaciones.',
  'Bicicleta estática', 'principiante', true, now()),

(gen_random_uuid(), NULL, 'Elíptico',
  'Cardio', NULL,
  'cardio', 'Movimiento de bajo impacto que combina brazos y piernas.',
  'Elíptico', 'principiante', true, now()),

(gen_random_uuid(), NULL, 'Burpees',
  'Cardio', ARRAY['Pecho', 'Core', 'Cuádriceps'],
  'cardio', 'Secuencia: plancha-flexión-salto. Uno de los ejercicios más completos para cardio.',
  'Peso corporal', 'intermedio', true, now()),

(gen_random_uuid(), NULL, 'Saltos a la cuerda',
  'Cardio', ARRAY['Gemelos'],
  'cardio', 'Saltar con cuerda de comba. Excelente para coordinación y cardio.',
  'Cuerda', 'principiante', true, now()),

(gen_random_uuid(), NULL, 'Saltos de tijera (Jumping Jacks)',
  'Cardio', NULL,
  'cardio', 'Saltar abriendo y cerrando piernas y brazos simultáneamente.',
  'Peso corporal', 'principiante', true, now()),

(gen_random_uuid(), NULL, 'Battle Ropes',
  'Cardio', ARRAY['Hombros', 'Core'],
  'cardio', 'Ondulaciones con cuerdas pesadas. Cardio de alta intensidad con componente de fuerza.',
  'Cuerdas de batalla', 'intermedio', true, now()),

(gen_random_uuid(), NULL, 'Remo ergómetro',
  'Cardio', ARRAY['Espalda', 'Piernas'],
  'cardio', 'Máquina de remo. Cardio de cuerpo completo, bajo impacto.',
  'Máquina', 'principiante', true, now()),

(gen_random_uuid(), NULL, 'Sprint en cinta',
  'Cardio', NULL,
  'cardio', 'Intervalos de velocidad máxima en cinta. Alta intensidad, corta duración.',
  'Cinta', 'avanzado', true, now()),

(gen_random_uuid(), NULL, 'Box Jump',
  'Cardio', ARRAY['Cuádriceps', 'Glúteos'],
  'cardio', 'Saltar sobre un cajón o plataforma. Potencia explosiva y cardio.',
  'Peso corporal', 'intermedio', true, now()),

-- ============================================================
-- MOVILIDAD
-- ============================================================
(gen_random_uuid(), NULL, 'Movilidad de cadera en cuclillas',
  'Movilidad', NULL,
  'movilidad', 'En cuclillas, abrir y cerrar rodillas para movilizar la cadera. También conocido como "Squat prying".',
  'Peso corporal', 'principiante', true, now()),

(gen_random_uuid(), NULL, 'Rotaciones torácicas',
  'Movilidad', NULL,
  'movilidad', 'En cuatro apoyos o de lado, rotar la columna torácica. Fundamental para la postura.',
  'Peso corporal', 'principiante', true, now()),

(gen_random_uuid(), NULL, 'Rotaciones de hombro',
  'Movilidad', NULL,
  'movilidad', 'Círculos lentos y controlados con los hombros. Calentar y movilizar el manguito.',
  'Peso corporal', 'principiante', true, now()),

(gen_random_uuid(), NULL, 'Cat-Cow',
  'Movilidad', ARRAY['Espalda baja'],
  'movilidad', 'En cuatro apoyos, alternar arqueado y redondeo de la columna. Movilidad espinal.',
  'Peso corporal', 'principiante', true, now()),

(gen_random_uuid(), NULL, 'World''s Greatest Stretch',
  'Movilidad', ARRAY['Cadera', 'Torácica', 'Isquiotibiales'],
  'movilidad', 'Combinación de zancada + rotación torácica. El estiramiento más completo.',
  'Peso corporal', 'principiante', true, now()),

(gen_random_uuid(), NULL, 'Movilidad de tobillo',
  'Movilidad', NULL,
  'movilidad', 'Círculos de tobillo y empuje de rodilla sobre el pie apoyado en pared.',
  'Peso corporal', 'principiante', true, now()),

(gen_random_uuid(), NULL, 'Paloma (Pigeon Pose)',
  'Movilidad', ARRAY['Glúteos', 'Flexores de cadera'],
  'movilidad', 'Postura de yoga para abrir la cadera. Excelente para quienes pasan mucho tiempo sentados.',
  'Peso corporal', 'principiante', true, now()),

(gen_random_uuid(), NULL, 'Estiramiento del psoas en zancada',
  'Movilidad', ARRAY['Flexores de cadera'],
  'movilidad', 'En posición de zancada, caer la cadera hacia abajo para estirar el psoas.',
  'Peso corporal', 'principiante', true, now()),

(gen_random_uuid(), NULL, 'Apertura de cadera con banda',
  'Movilidad', NULL,
  'movilidad', 'Con banda anclada, crear tracción en la articulación de la cadera mientras se mueve.',
  'Banda elástica', 'intermedio', true, now()),

-- ============================================================
-- CALENTAMIENTO
-- ============================================================
(gen_random_uuid(), NULL, 'Rotaciones de cadera',
  'Calentamiento', NULL,
  'calentamiento', 'De pie, círculos amplios con la cadera en ambas direcciones.',
  'Peso corporal', 'principiante', true, now()),

(gen_random_uuid(), NULL, 'Círculos de hombros',
  'Calentamiento', NULL,
  'calentamiento', 'Círculos lentos con los hombros hacia adelante y hacia atrás.',
  'Peso corporal', 'principiante', true, now()),

(gen_random_uuid(), NULL, 'Estiramientos dinámicos de isquiotibiales',
  'Calentamiento', ARRAY['Isquiotibiales'],
  'calentamiento', 'Patadas frontales controladas para calentar isquiotibiales sin riesgo.',
  'Peso corporal', 'principiante', true, now()),

(gen_random_uuid(), NULL, 'Sentadillas con peso corporal (calentamiento)',
  'Calentamiento', ARRAY['Cuádriceps', 'Glúteos'],
  'calentamiento', 'Sentadillas sin peso a ritmo suave para activar las piernas antes de entrenar.',
  'Peso corporal', 'principiante', true, now()),

(gen_random_uuid(), NULL, 'Jumping Jacks (calentamiento)',
  'Calentamiento', NULL,
  'calentamiento', 'Saltos de tijera a ritmo moderado para elevar la temperatura corporal.',
  'Peso corporal', 'principiante', true, now()),

(gen_random_uuid(), NULL, 'Rotaciones de muñeca',
  'Calentamiento', NULL,
  'calentamiento', 'Círculos con las muñecas para calentar antes de ejercicios de empuje.',
  'Peso corporal', 'principiante', true, now()),

(gen_random_uuid(), NULL, 'Marcha estática elevando rodillas',
  'Calentamiento', NULL,
  'calentamiento', 'Elevar rodillas alternadamente al caminar en el lugar. Activa el core y piernas.',
  'Peso corporal', 'principiante', true, now()),

(gen_random_uuid(), NULL, 'Activación de glúteos con banda en cuclillas',
  'Calentamiento', ARRAY['Glúteos', 'Abductores'],
  'calentamiento', 'Con banda en rodillas, realizar sentadillas parciales abriendo las rodillas.',
  'Banda elástica', 'principiante', true, now()),

(gen_random_uuid(), NULL, 'Peso muerto con barra vacía (calentamiento)',
  'Calentamiento', ARRAY['Espalda', 'Isquiotibiales'],
  'calentamiento', 'Práctica del patrón de bisagra de cadera con barra sin peso.',
  'Barra', 'principiante', true, now()),

(gen_random_uuid(), NULL, 'Press de banca con barra vacía (calentamiento)',
  'Calentamiento', ARRAY['Pecho', 'Tríceps'],
  'calentamiento', 'Warm-up con barra sin discos para preparar los tejidos antes de cargas pesadas.',
  'Barra', 'principiante', true, now());
