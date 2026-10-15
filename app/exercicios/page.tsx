import { AppShell } from "@/components/app-shell";
import { ExerciseCreateForm } from "@/components/exercises/exercise-create-form";
import { ExerciseList } from "@/components/exercises/exercise-list";
import type { Exercise } from "@/lib/types";
import { createClient } from "@/utils/supabase/server";

export default async function ExerciciosPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("exercises")
    .select("*")
    .order("name", { ascending: true });

  const exercises = (data ?? []) as Exercise[];
  const usedGroups = [...new Set(exercises.map((e) => e.muscle_group).filter((g) => g != null))];

  return (
    <AppShell active="exercicios">
      <section className="flex flex-col gap-5">
        <div>
          <h2 className="font-medium">Exercícios</h2>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Biblioteca pessoal para montar suas rotinas.
          </p>
        </div>
        <ExerciseCreateForm extraGroups={usedGroups} />
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="font-medium">Biblioteca</h2>
        <ExerciseList exercises={exercises} />
      </section>
    </AppShell>
  );
}
