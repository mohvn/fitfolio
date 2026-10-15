import type { SupabaseClient } from "@supabase/supabase-js";
import type { PreviousMap } from "@/lib/types";

export async function getPreviousSets(
  supabase: SupabaseClient,
  exerciseIds: string[],
  excludeSessionId: string,
): Promise<PreviousMap> {
  if (exerciseIds.length === 0) return {};

  const { data: sessions } = await supabase
    .from("workout_sessions")
    .select("id")
    .not("completed_at", "is", null)
    .neq("id", excludeSessionId)
    .order("completed_at", { ascending: false })
    .limit(50);

  if (!sessions?.length) return {};

  const rank = new Map(sessions.map((s, i) => [s.id as string, i]));

  const { data: sets } = await supabase
    .from("session_sets")
    .select("session_id, exercise_id, set_index, reps, weight_kg")
    .in("session_id", [...rank.keys()])
    .in("exercise_id", exerciseIds)
    .eq("completed", true)
    .neq("set_type", "warmup")
    .order("set_index", { ascending: true });

  const latest: Record<string, { rank: number; sets: PreviousMap[string] }> = {};

  for (const set of sets ?? []) {
    const r = rank.get(set.session_id) ?? Number.MAX_SAFE_INTEGER;
    const entry = { reps: set.reps, weight_kg: set.weight_kg == null ? null : Number(set.weight_kg) };
    const current = latest[set.exercise_id];

    if (!current || r < current.rank) {
      latest[set.exercise_id] = { rank: r, sets: [entry] };
    } else if (r === current.rank) {
      current.sets.push(entry);
    }
  }

  return Object.fromEntries(
    Object.entries(latest).map(([id, value]) => [id, value.sets]),
  );
}
