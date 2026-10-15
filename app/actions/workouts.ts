"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

export type ActionState = {
  error?: string;
  success?: string;
};

export async function createExercise(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, user } = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  const muscle_group = String(formData.get("muscle_group") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!name) return { error: "Informe o nome do exercício." };

  const { error } = await supabase.from("exercises").insert({
    user_id: user.id,
    name,
    muscle_group,
    notes,
  });

  if (error) return { error: error.message };

  revalidatePath("/exercicios");
  revalidatePath("/treinos");
  return { success: "Exercício criado." };
}

export async function updateExercise(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, user } = await requireUser();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const muscle_group = String(formData.get("muscle_group") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!id || !name) return { error: "Dados inválidos." };

  const { error } = await supabase
    .from("exercises")
    .update({ name, muscle_group, notes })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/exercicios");
  return { success: "Exercício atualizado." };
}

export async function deleteExercise(formData: FormData) {
  const { supabase, user } = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await supabase.from("exercises").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/exercicios");
  revalidatePath("/treinos");
}

export async function createRoutine(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, user } = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;

  if (!name) return { error: "Informe o nome da rotina." };

  const { data, error } = await supabase
    .from("routines")
    .insert({ user_id: user.id, name, description })
    .select("id")
    .single();

  if (error || !data) return { error: error?.message ?? "Erro ao criar rotina." };

  revalidatePath("/treinos");
  redirect(`/treinos/${data.id}`);
}

export async function updateRoutine(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, user } = await requireUser();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;

  if (!id || !name) return { error: "Dados inválidos." };

  const { error } = await supabase
    .from("routines")
    .update({ name, description })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath(`/treinos/${id}`);
  revalidatePath("/treinos");
  return { success: "Rotina atualizada." };
}

export async function deleteRoutine(formData: FormData) {
  const { supabase, user } = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await supabase.from("routines").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/treinos");
  redirect("/treinos");
}

export async function addExerciseToRoutine(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, user } = await requireUser();
  const routine_id = String(formData.get("routine_id") ?? "");
  const exercise_id = String(formData.get("exercise_id") ?? "");
  const target_sets = Number(formData.get("target_sets") ?? 3);
  const target_reps = String(formData.get("target_reps") ?? "10").trim() || "10";
  const rest_seconds_raw = String(formData.get("rest_seconds") ?? "").trim();
  const rest_seconds = rest_seconds_raw ? Number(rest_seconds_raw) : null;

  if (!routine_id || !exercise_id) {
    return { error: "Selecione um exercício." };
  }

  const { data: routine } = await supabase
    .from("routines")
    .select("id")
    .eq("id", routine_id)
    .eq("user_id", user.id)
    .single();

  if (!routine) return { error: "Rotina não encontrada." };

  const { data: existing } = await supabase
    .from("routine_exercises")
    .select("position")
    .eq("routine_id", routine_id)
    .order("position", { ascending: false })
    .limit(1);

  const position = (existing?.[0]?.position ?? -1) + 1;

  const { error } = await supabase.from("routine_exercises").insert({
    routine_id,
    exercise_id,
    position,
    target_sets: Number.isFinite(target_sets) ? target_sets : 3,
    target_reps,
    rest_seconds: Number.isFinite(rest_seconds as number) ? rest_seconds : null,
  });

  if (error) return { error: error.message };

  revalidatePath(`/treinos/${routine_id}`);
  return { success: "Exercício adicionado." };
}

export async function updateRoutineExercise(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, user } = await requireUser();
  const id = String(formData.get("id") ?? "");
  const routine_id = String(formData.get("routine_id") ?? "");
  const target_sets = Number(formData.get("target_sets") ?? 3);
  const target_reps = String(formData.get("target_reps") ?? "10").trim() || "10";
  const rest_seconds_raw = String(formData.get("rest_seconds") ?? "").trim();
  const rest_seconds = rest_seconds_raw ? Number(rest_seconds_raw) : null;

  if (!id || !routine_id) return { error: "Dados inválidos." };

  const { data: routine } = await supabase
    .from("routines")
    .select("id")
    .eq("id", routine_id)
    .eq("user_id", user.id)
    .single();

  if (!routine) return { error: "Rotina não encontrada." };

  const { error } = await supabase
    .from("routine_exercises")
    .update({
      target_sets: Number.isFinite(target_sets) ? target_sets : 3,
      target_reps,
      rest_seconds: Number.isFinite(rest_seconds as number) ? rest_seconds : null,
    })
    .eq("id", id)
    .eq("routine_id", routine_id);

  if (error) return { error: error.message };

  revalidatePath(`/treinos/${routine_id}`);
  return { success: "Atualizado." };
}

export async function removeExerciseFromRoutine(formData: FormData) {
  const { supabase, user } = await requireUser();
  const id = String(formData.get("id") ?? "");
  const routine_id = String(formData.get("routine_id") ?? "");
  if (!id || !routine_id) return;

  const { data: routine } = await supabase
    .from("routines")
    .select("id")
    .eq("id", routine_id)
    .eq("user_id", user.id)
    .single();

  if (!routine) return;

  await supabase
    .from("routine_exercises")
    .delete()
    .eq("id", id)
    .eq("routine_id", routine_id);

  revalidatePath(`/treinos/${routine_id}`);
}

export async function moveRoutineExercise(formData: FormData) {
  const { supabase, user } = await requireUser();
  const id = String(formData.get("id") ?? "");
  const routine_id = String(formData.get("routine_id") ?? "");
  const direction = String(formData.get("direction") ?? "");

  if (!id || !routine_id || (direction !== "up" && direction !== "down")) return;

  const { data: routine } = await supabase
    .from("routines")
    .select("id")
    .eq("id", routine_id)
    .eq("user_id", user.id)
    .single();

  if (!routine) return;

  const { data: items } = await supabase
    .from("routine_exercises")
    .select("id, position")
    .eq("routine_id", routine_id)
    .order("position", { ascending: true });

  if (!items?.length) return;

  const index = items.findIndex((item) => item.id === id);
  if (index < 0) return;

  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= items.length) return;

  const current = items[index];
  const neighbor = items[swapIndex];

  await supabase
    .from("routine_exercises")
    .update({ position: neighbor.position })
    .eq("id", current.id);
  await supabase
    .from("routine_exercises")
    .update({ position: current.position })
    .eq("id", neighbor.id);

  revalidatePath(`/treinos/${routine_id}`);
}
