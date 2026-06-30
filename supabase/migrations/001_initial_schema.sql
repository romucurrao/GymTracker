-- ============================================================
-- GYM TRACKER — Schema inicial
-- Ejecutar en: Supabase Dashboard > SQL Editor > New Query
-- ============================================================

-- 1. PROFILES
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  name text,
  created_at timestamptz default now() not null
);

-- 2. ROUTINES
create table if not exists public.routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text,
  day text,
  main_muscle_group text,
  created_at timestamptz default now() not null
);

-- 3. EXERCISES
create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  primary_muscle text not null,
  secondary_muscles text[],
  type text not null check (type in ('fuerza', 'calentamiento', 'movilidad', 'cardio', 'otro')),
  description text,
  created_at timestamptz default now() not null
);

-- 4. ROUTINE_EXERCISES (ejercicios dentro de una rutina)
create table if not exists public.routine_exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  routine_id uuid references public.routines(id) on delete cascade not null,
  exercise_id uuid references public.exercises(id) on delete cascade not null,
  exercise_order integer not null default 0,
  is_warmup boolean not null default false,
  target_sets integer,
  target_reps integer,
  target_weight numeric(6,2),
  notes text,
  created_at timestamptz default now() not null
);

-- 5. WORKOUT_SESSIONS (sesiones de entrenamiento)
create table if not exists public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  routine_id uuid references public.routines(id) on delete set null,
  session_date date not null default current_date,
  notes text,
  created_at timestamptz default now() not null
);

-- 6. WORKOUT_SETS (series registradas en cada sesión)
create table if not exists public.workout_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  workout_session_id uuid references public.workout_sessions(id) on delete cascade not null,
  exercise_id uuid references public.exercises(id) on delete cascade not null,
  set_number integer not null default 1,
  reps integer,
  weight numeric(6,2),
  notes text,
  created_at timestamptz default now() not null
);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-crear perfil cuando un usuario se registra
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (user_id, name)
  values (new.id, new.raw_user_meta_data ->> 'name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.routines enable row level security;
alter table public.exercises enable row level security;
alter table public.routine_exercises enable row level security;
alter table public.workout_sessions enable row level security;
alter table public.workout_sets enable row level security;

-- PROFILES
create policy "profiles: select own" on public.profiles for select using (auth.uid() = user_id);
create policy "profiles: insert own" on public.profiles for insert with check (auth.uid() = user_id);
create policy "profiles: update own" on public.profiles for update using (auth.uid() = user_id);
create policy "profiles: delete own" on public.profiles for delete using (auth.uid() = user_id);

-- ROUTINES
create policy "routines: select own" on public.routines for select using (auth.uid() = user_id);
create policy "routines: insert own" on public.routines for insert with check (auth.uid() = user_id);
create policy "routines: update own" on public.routines for update using (auth.uid() = user_id);
create policy "routines: delete own" on public.routines for delete using (auth.uid() = user_id);

-- EXERCISES
create policy "exercises: select own" on public.exercises for select using (auth.uid() = user_id);
create policy "exercises: insert own" on public.exercises for insert with check (auth.uid() = user_id);
create policy "exercises: update own" on public.exercises for update using (auth.uid() = user_id);
create policy "exercises: delete own" on public.exercises for delete using (auth.uid() = user_id);

-- ROUTINE_EXERCISES
create policy "routine_exercises: select own" on public.routine_exercises for select using (auth.uid() = user_id);
create policy "routine_exercises: insert own" on public.routine_exercises for insert with check (auth.uid() = user_id);
create policy "routine_exercises: update own" on public.routine_exercises for update using (auth.uid() = user_id);
create policy "routine_exercises: delete own" on public.routine_exercises for delete using (auth.uid() = user_id);

-- WORKOUT_SESSIONS
create policy "workout_sessions: select own" on public.workout_sessions for select using (auth.uid() = user_id);
create policy "workout_sessions: insert own" on public.workout_sessions for insert with check (auth.uid() = user_id);
create policy "workout_sessions: update own" on public.workout_sessions for update using (auth.uid() = user_id);
create policy "workout_sessions: delete own" on public.workout_sessions for delete using (auth.uid() = user_id);

-- WORKOUT_SETS
create policy "workout_sets: select own" on public.workout_sets for select using (auth.uid() = user_id);
create policy "workout_sets: insert own" on public.workout_sets for insert with check (auth.uid() = user_id);
create policy "workout_sets: update own" on public.workout_sets for update using (auth.uid() = user_id);
create policy "workout_sets: delete own" on public.workout_sets for delete using (auth.uid() = user_id);
