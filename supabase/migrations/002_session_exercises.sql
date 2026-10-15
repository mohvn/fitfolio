-- Hevy-style logger: exercises belong to the session (supports empty workouts
-- and exercises added mid-session). Apply after 001_fitfolio.sql.

create table if not exists public.session_exercises (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.workout_sessions (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id) on delete cascade,
  position int not null default 0,
  target_reps text,
  rest_seconds int,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists session_exercises_session_id_idx
  on public.session_exercises (session_id);

alter table public.session_sets
  add column if not exists session_exercise_id uuid
  references public.session_exercises (id) on delete cascade;

create index if not exists session_sets_session_exercise_id_idx
  on public.session_sets (session_exercise_id);

alter table public.session_sets alter column completed set default false;
alter table public.session_sets alter column completed_at drop default;

alter table public.session_exercises enable row level security;

drop policy if exists "session_exercises_select_own" on public.session_exercises;
create policy "session_exercises_select_own" on public.session_exercises
  for select using (
    exists (
      select 1 from public.workout_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );

drop policy if exists "session_exercises_insert_own" on public.session_exercises;
create policy "session_exercises_insert_own" on public.session_exercises
  for insert with check (
    exists (
      select 1 from public.workout_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );

drop policy if exists "session_exercises_update_own" on public.session_exercises;
create policy "session_exercises_update_own" on public.session_exercises
  for update using (
    exists (
      select 1 from public.workout_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );

drop policy if exists "session_exercises_delete_own" on public.session_exercises;
create policy "session_exercises_delete_own" on public.session_exercises
  for delete using (
    exists (
      select 1 from public.workout_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );

notify pgrst, 'reload schema';
