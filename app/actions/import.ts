"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { ImportWorkout } from "@/lib/hevy";
import { createClient } from "@/utils/supabase/server";

const MAX_BATCH = 50;

export type ImportBatchResult =
  | { imported: number; skipped: number }
  | { error: string };

export async function importWorkoutsBatch(workouts: ImportWorkout[]): Promise<ImportBatchResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  if (workouts.length === 0) return { imported: 0, skipped: 0 };
  if (workouts.length > MAX_BATCH) return { error: "Lote grande demais." };

  const { data: existing, error: existingError } = await supabase
    .from("workout_sessions")
    .select("external_key")
    .in("external_key", workouts.map((w) => w.key));

  if (existingError) return { error: existingError.message };

  const seen = new Set((existing ?? []).map((e) => e.external_key));
  const todo = workouts.filter((w) => !seen.has(w.key));
  const skipped = workouts.length - todo.length;

  const exerciseIds = new Map<string, string>();
  const { data: library } = await supabase.from("exercises").select("id, name, muscle_group");
  for (const e of library ?? []) exerciseIds.set(e.name.toLowerCase(), e.id);

  const groupsByName = new Map(
    workouts.flatMap((w) => w.exercises).map((e) => [e.name.toLowerCase(), e.muscle_group]),
  );
  for (const e of library ?? []) {
    const group = groupsByName.get(e.name.toLowerCase());
    if (!e.muscle_group && group) {
      await supabase.from("exercises").update({ muscle_group: group }).eq("id", e.id);
    }
  }

  if (todo.length === 0) return { imported: 0, skipped };

  const missing = new Map<string, { name: string; muscle_group: string | null }>();
  for (const e of todo.flatMap((w) => w.exercises)) {
    const key = e.name.toLowerCase();
    if (!exerciseIds.has(key) && !missing.has(key)) {
      missing.set(key, { name: e.name, muscle_group: e.muscle_group });
    }
  }

  if (missing.size) {
    const { data: created, error } = await supabase
      .from("exercises")
      .insert([...missing.values()].map((e) => ({ user_id: user.id, ...e })))
      .select("id, name");

    if (error) return { error: error.message };
    for (const e of created ?? []) exerciseIds.set(e.name.toLowerCase(), e.id);
  }

  const { data: sessions, error: sessionError } = await supabase
    .from("workout_sessions")
    .insert(
      todo.map((w) => ({
        user_id: user.id,
        title: w.title,
        notes: w.description,
        started_at: w.started_at,
        completed_at: w.completed_at,
        external_key: w.key,
      })),
    )
    .select("id, external_key");

  if (sessionError || !sessions) return { error: sessionError?.message ?? "Erro ao criar treinos." };

  const sessionIds = sessions.map((s) => s.id as string);
  const rollback = async (message: string): Promise<ImportBatchResult> => {
    await supabase.from("workout_sessions").delete().in("id", sessionIds);
    return { error: message };
  };

  const sessionByKey = new Map(sessions.map((s) => [s.external_key as string, s.id as string]));

  const { data: blocks, error: blockError } = await supabase
    .from("session_exercises")
    .insert(
      todo.flatMap((w) =>
        w.exercises.map((e, position) => ({
          session_id: sessionByKey.get(w.key)!,
          exercise_id: exerciseIds.get(e.name.toLowerCase())!,
          position,
          notes: e.notes,
        })),
      ),
    )
    .select("id, session_id, position");

  if (blockError || !blocks) return rollback(blockError?.message ?? "Erro ao criar exercícios.");

  const blockId = new Map(blocks.map((b) => [`${b.session_id}:${b.position}`, b.id as string]));

  const sets = todo.flatMap((w) => {
    const sessionId = sessionByKey.get(w.key)!;
    return w.exercises.flatMap((e, position) =>
      e.sets.map((s, i) => ({
        session_id: sessionId,
        session_exercise_id: blockId.get(`${sessionId}:${position}`)!,
        exercise_id: exerciseIds.get(e.name.toLowerCase())!,
        set_index: i + 1,
        set_type: s.set_type,
        weight_kg: s.weight_kg,
        reps: s.reps,
        distance_km: s.distance_km,
        duration_seconds: s.duration_seconds,
        completed: true,
        completed_at: w.completed_at,
      })),
    );
  });

  const { error: setError } = await supabase.from("session_sets").insert(sets);
  if (setError) return rollback(setError.message);

  revalidatePath("/historico");
  return { imported: todo.length, skipped };
}
