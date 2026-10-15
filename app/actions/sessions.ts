"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getPreviousSets } from "@/lib/previous";
import type {
  PreviousSet,
  SessionExercise,
  SessionSet,
} from "@/lib/types";
import { createClient } from "@/utils/supabase/server";

const DEFAULT_REST_SECONDS = 90;

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

export async function startSession(formData: FormData) {
  const { supabase, user } = await requireUser();
  const routine_id = String(formData.get("routine_id") ?? "");
  if (!routine_id) redirect("/treinos");

  const { data: routine } = await supabase
    .from("routines")
    .select("id, name")
    .eq("id", routine_id)
    .eq("user_id", user.id)
    .single();

  if (!routine) redirect("/treinos");

  const { data: session, error } = await supabase
    .from("workout_sessions")
    .insert({ user_id: user.id, routine_id, title: routine.name })
    .select("id")
    .single();

  if (error || !session) redirect(`/treinos/${routine_id}`);

  const { data: template } = await supabase
    .from("routine_exercises")
    .select("id, exercise_id, target_sets, target_reps, rest_seconds")
    .eq("routine_id", routine_id)
    .order("position", { ascending: true });

  if (template?.length) {
    const { data: created } = await supabase
      .from("session_exercises")
      .insert(
        template.map((item, position) => ({
          session_id: session.id,
          exercise_id: item.exercise_id,
          position,
          target_reps: item.target_reps,
          rest_seconds: item.rest_seconds,
        })),
      )
      .select("id, position");

    const byPosition = new Map(
      (created ?? []).map((row) => [row.position as number, row.id as string]),
    );

    const sets = template.flatMap((item, position) =>
      Array.from({ length: Math.max(1, item.target_sets) }, (_, i) => ({
        session_id: session.id,
        exercise_id: item.exercise_id,
        session_exercise_id: byPosition.get(position),
        routine_exercise_id: item.id,
        set_index: i + 1,
        completed: false,
      })),
    );

    if (sets.length) await supabase.from("session_sets").insert(sets);
  }

  redirect(`/sessao/${session.id}`);
}

export async function startEmptySession() {
  const { supabase, user } = await requireUser();

  const { data: session } = await supabase
    .from("workout_sessions")
    .insert({ user_id: user.id, routine_id: null })
    .select("id")
    .single();

  if (!session) redirect("/treinos");

  redirect(`/sessao/${session.id}`);
}

export async function addSessionExercise(
  sessionId: string,
  exerciseId: string,
  position: number,
): Promise<{ exercise: SessionExercise; previous: PreviousSet[] } | { error: string }> {
  const { supabase } = await requireUser();

  const { data: row, error } = await supabase
    .from("session_exercises")
    .insert({
      session_id: sessionId,
      exercise_id: exerciseId,
      position,
      rest_seconds: DEFAULT_REST_SECONDS,
    })
    .select("*, exercise:exercises!session_exercises_exercise_id_fkey(*)")
    .single();

  if (error || !row) return { error: error?.message ?? "Erro ao adicionar." };

  const { data: set, error: setError } = await supabase
    .from("session_sets")
    .insert({
      session_id: sessionId,
      exercise_id: exerciseId,
      session_exercise_id: row.id,
      set_index: 1,
      completed: false,
    })
    .select("*")
    .single();

  if (setError || !set) return { error: setError?.message ?? "Erro ao criar série." };

  const previous = await getPreviousSets(supabase, [exerciseId], sessionId);

  return {
    exercise: { ...(row as Omit<SessionExercise, "sets">), sets: [set as SessionSet] },
    previous: previous[exerciseId] ?? [],
  };
}

export async function removeSessionExercise(id: string) {
  const { supabase } = await requireUser();
  const { error } = await supabase.from("session_exercises").delete().eq("id", id);
  return error ? { error: error.message } : {};
}

export async function updateSessionExerciseRest(id: string, restSeconds: number | null) {
  const { supabase } = await requireUser();
  const { error } = await supabase
    .from("session_exercises")
    .update({ rest_seconds: restSeconds })
    .eq("id", id);
  return error ? { error: error.message } : {};
}

export async function moveSessionExercise(
  sessionId: string,
  id: string,
  direction: "up" | "down",
): Promise<{ error?: string }> {
  const { supabase, user } = await requireUser();

  const { data: session } = await supabase
    .from("workout_sessions")
    .select("id")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .is("completed_at", null)
    .single();

  if (!session) return { error: "Sessão não encontrada." };

  const { data: items } = await supabase
    .from("session_exercises")
    .select("id, position")
    .eq("session_id", sessionId)
    .order("position", { ascending: true });

  if (!items?.length) return {};

  const index = items.findIndex((item) => item.id === id);
  if (index < 0) return { error: "Exercício não encontrado." };

  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= items.length) return {};

  const current = items[index];
  const neighbor = items[swapIndex];

  const { error: a } = await supabase
    .from("session_exercises")
    .update({ position: neighbor.position })
    .eq("id", current.id);
  if (a) return { error: a.message };

  const { error: b } = await supabase
    .from("session_exercises")
    .update({ position: current.position })
    .eq("id", neighbor.id);
  if (b) return { error: b.message };

  return {};
}

export async function addSessionSet(
  sessionExercise: Pick<SessionExercise, "id" | "session_id" | "exercise_id">,
  setIndex: number,
): Promise<{ set: SessionSet } | { error: string }> {
  const { supabase } = await requireUser();

  const { data, error } = await supabase
    .from("session_sets")
    .insert({
      session_id: sessionExercise.session_id,
      exercise_id: sessionExercise.exercise_id,
      session_exercise_id: sessionExercise.id,
      set_index: setIndex,
      completed: false,
    })
    .select("*")
    .single();

  if (error || !data) return { error: error?.message ?? "Erro ao criar série." };
  return { set: data as SessionSet };
}

export async function updateSessionSet(
  id: string,
  values: { reps: number | null; weight_kg: number | null; completed: boolean },
) {
  const { supabase } = await requireUser();
  const { error } = await supabase
    .from("session_sets")
    .update({
      ...values,
      completed_at: values.completed ? new Date().toISOString() : null,
    })
    .eq("id", id);
  return error ? { error: error.message } : {};
}

export async function removeSessionSet(id: string) {
  const { supabase } = await requireUser();
  const { error } = await supabase.from("session_sets").delete().eq("id", id);
  return error ? { error: error.message } : {};
}

function completedAtFromDuration(startedAt: string, durationSeconds: number) {
  const started = new Date(startedAt).getTime();
  const seconds = Math.max(60, Math.floor(durationSeconds));
  return new Date(started + seconds * 1000).toISOString();
}

export async function finishSession(sessionId: string, durationSeconds: number) {
  const { supabase, user } = await requireUser();

  const { data: session } = await supabase
    .from("workout_sessions")
    .select("id, started_at")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .is("completed_at", null)
    .single();

  if (!session) redirect("/treinos");

  await supabase
    .from("session_sets")
    .delete()
    .eq("session_id", sessionId)
    .eq("completed", false);

  const { data: remaining } = await supabase
    .from("session_sets")
    .select("session_exercise_id")
    .eq("session_id", sessionId);

  const keep = new Set((remaining ?? []).map((s) => s.session_exercise_id));
  const { data: exercises } = await supabase
    .from("session_exercises")
    .select("id")
    .eq("session_id", sessionId);

  const empty = (exercises ?? []).map((e) => e.id).filter((id) => !keep.has(id));
  if (empty.length) {
    await supabase.from("session_exercises").delete().in("id", empty);
  }

  await supabase
    .from("workout_sessions")
    .update({ completed_at: completedAtFromDuration(session.started_at, durationSeconds) })
    .eq("id", sessionId)
    .eq("user_id", user.id);

  revalidatePath("/treinos");
  revalidatePath(`/sessao/${sessionId}`);
  revalidatePath("/historico");
  revalidatePath("/estatisticas");
  redirect(`/sessao/${sessionId}`);
}

export async function updateSessionDuration(sessionId: string, durationSeconds: number) {
  const { supabase, user } = await requireUser();

  const { data: session } = await supabase
    .from("workout_sessions")
    .select("id, started_at, completed_at")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .not("completed_at", "is", null)
    .single();

  if (!session) return { error: "Treino não encontrado." };

  const { error } = await supabase
    .from("workout_sessions")
    .update({ completed_at: completedAtFromDuration(session.started_at, durationSeconds) })
    .eq("id", sessionId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath(`/sessao/${sessionId}`);
  revalidatePath("/historico");
  revalidatePath("/estatisticas");
  return {};
}

export async function discardSession(sessionId: string) {
  const { supabase, user } = await requireUser();

  await supabase
    .from("workout_sessions")
    .delete()
    .eq("id", sessionId)
    .eq("user_id", user.id);

  revalidatePath("/treinos");
  redirect("/treinos");
}
