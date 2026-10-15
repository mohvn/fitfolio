-- Compact set rows for the statistics page. Returns one JSON value so the
-- PostgREST max-rows limit (1000) does not truncate long histories.
-- Apply after 003_history_import.sql.

create or replace function public.stats_sets(p_from timestamptz default null)
returns json
language sql
stable
security invoker
set search_path = public
as $$
  select coalesce(
    json_agg(
      json_build_array(
        s.id,
        extract(epoch from s.started_at)::bigint,
        extract(epoch from (s.completed_at - s.started_at))::int,
        ss.exercise_id,
        ss.set_type,
        ss.weight_kg,
        ss.reps,
        ss.duration_seconds
      )
      order by s.started_at
    ),
    '[]'::json
  )
  from public.workout_sessions s
  join public.session_sets ss on ss.session_id = s.id
  where s.user_id = auth.uid()
    and s.completed_at is not null
    and ss.completed
    and (p_from is null or s.started_at >= p_from);
$$;

revoke all on function public.stats_sets(timestamptz) from public, anon;
grant execute on function public.stats_sets(timestamptz) to authenticated;

notify pgrst, 'reload schema';
