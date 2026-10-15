-- FitFolio schema: routines, exercises, live sessions
-- Apply in Supabase Dashboard → SQL Editor

create extension if not exists "pgcrypto";

-- Exercises (user library)
create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  muscle_group text,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists exercises_user_id_idx on public.exercises (user_id);

-- Routines
create table if not exists public.routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists routines_user_id_idx on public.routines (user_id);

-- Exercises inside a routine
create table if not exists public.routine_exercises (
  id uuid primary key default gen_random_uuid(),
  routine_id uuid not null references public.routines (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id) on delete cascade,
  position int not null default 0,
  target_sets int not null default 3,
  target_reps text not null default '10',
  rest_seconds int,
  notes text
);

create index if not exists routine_exercises_routine_id_idx
  on public.routine_exercises (routine_id);

-- Workout sessions
create table if not exists public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  routine_id uuid references public.routines (id) on delete set null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  notes text
);

create index if not exists workout_sessions_user_id_idx
  on public.workout_sessions (user_id);

-- Logged sets during a session
create table if not exists public.session_sets (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.workout_sessions (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id) on delete cascade,
  routine_exercise_id uuid references public.routine_exercises (id) on delete set null,
  set_index int not null default 1,
  reps int,
  weight_kg numeric(8, 2),
  completed boolean not null default true,
  completed_at timestamptz default now()
);

create index if not exists session_sets_session_id_idx
  on public.session_sets (session_id);

-- updated_at trigger for routines
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists routines_set_updated_at on public.routines;
create trigger routines_set_updated_at
  before update on public.routines
  for each row execute function public.set_updated_at();

-- RLS
alter table public.exercises enable row level security;
alter table public.routines enable row level security;
alter table public.routine_exercises enable row level security;
alter table public.workout_sessions enable row level security;
alter table public.session_sets enable row level security;

-- exercises policies
drop policy if exists "exercises_select_own" on public.exercises;
create policy "exercises_select_own" on public.exercises
  for select using (auth.uid() = user_id);

drop policy if exists "exercises_insert_own" on public.exercises;
create policy "exercises_insert_own" on public.exercises
  for insert with check (auth.uid() = user_id);

drop policy if exists "exercises_update_own" on public.exercises;
create policy "exercises_update_own" on public.exercises
  for update using (auth.uid() = user_id);

drop policy if exists "exercises_delete_own" on public.exercises;
create policy "exercises_delete_own" on public.exercises
  for delete using (auth.uid() = user_id);

-- routines policies
drop policy if exists "routines_select_own" on public.routines;
create policy "routines_select_own" on public.routines
  for select using (auth.uid() = user_id);

drop policy if exists "routines_insert_own" on public.routines;
create policy "routines_insert_own" on public.routines
  for insert with check (auth.uid() = user_id);

drop policy if exists "routines_update_own" on public.routines;
create policy "routines_update_own" on public.routines
  for update using (auth.uid() = user_id);

drop policy if exists "routines_delete_own" on public.routines;
create policy "routines_delete_own" on public.routines
  for delete using (auth.uid() = user_id);

-- routine_exercises via owning routine
drop policy if exists "routine_exercises_select_own" on public.routine_exercises;
create policy "routine_exercises_select_own" on public.routine_exercises
  for select using (
    exists (
      select 1 from public.routines r
      where r.id = routine_id and r.user_id = auth.uid()
    )
  );

drop policy if exists "routine_exercises_insert_own" on public.routine_exercises;
create policy "routine_exercises_insert_own" on public.routine_exercises
  for insert with check (
    exists (
      select 1 from public.routines r
      where r.id = routine_id and r.user_id = auth.uid()
    )
  );

drop policy if exists "routine_exercises_update_own" on public.routine_exercises;
create policy "routine_exercises_update_own" on public.routine_exercises
  for update using (
    exists (
      select 1 from public.routines r
      where r.id = routine_id and r.user_id = auth.uid()
    )
  );

drop policy if exists "routine_exercises_delete_own" on public.routine_exercises;
create policy "routine_exercises_delete_own" on public.routine_exercises
  for delete using (
    exists (
      select 1 from public.routines r
      where r.id = routine_id and r.user_id = auth.uid()
    )
  );

-- workout_sessions policies
drop policy if exists "sessions_select_own" on public.workout_sessions;
create policy "sessions_select_own" on public.workout_sessions
  for select using (auth.uid() = user_id);

drop policy if exists "sessions_insert_own" on public.workout_sessions;
create policy "sessions_insert_own" on public.workout_sessions
  for insert with check (auth.uid() = user_id);

drop policy if exists "sessions_update_own" on public.workout_sessions;
create policy "sessions_update_own" on public.workout_sessions
  for update using (auth.uid() = user_id);

drop policy if exists "sessions_delete_own" on public.workout_sessions;
create policy "sessions_delete_own" on public.workout_sessions
  for delete using (auth.uid() = user_id);

-- session_sets via owning session
drop policy if exists "session_sets_select_own" on public.session_sets;
create policy "session_sets_select_own" on public.session_sets
  for select using (
    exists (
      select 1 from public.workout_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );

drop policy if exists "session_sets_insert_own" on public.session_sets;
create policy "session_sets_insert_own" on public.session_sets
  for insert with check (
    exists (
      select 1 from public.workout_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );

drop policy if exists "session_sets_update_own" on public.session_sets;
create policy "session_sets_update_own" on public.session_sets
  for update using (
    exists (
      select 1 from public.workout_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );

drop policy if exists "session_sets_delete_own" on public.session_sets;
create policy "session_sets_delete_own" on public.session_sets
  for delete using (
    exists (
      select 1 from public.workout_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );
