-- Workout titles, idempotent imports (Hevy CSV) and richer set data.
-- Apply after 002_session_exercises.sql.

alter table public.workout_sessions add column if not exists title text;
alter table public.workout_sessions add column if not exists external_key text;

create unique index if not exists workout_sessions_user_external_key_idx
  on public.workout_sessions (user_id, external_key);

create index if not exists workout_sessions_user_started_idx
  on public.workout_sessions (user_id, started_at desc);

alter table public.session_sets
  add column if not exists set_type text not null default 'normal';
alter table public.session_sets add column if not exists duration_seconds int;
alter table public.session_sets add column if not exists distance_km numeric(8, 3);

notify pgrst, 'reload schema';
