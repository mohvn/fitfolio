import Link from "next/link";
import { notFound } from "next/navigation";
import { PlayIcon } from "lucide-react";
import { deleteRoutine } from "@/app/actions/workouts";
import { startSession } from "@/app/actions/sessions";
import { AppShell } from "@/components/app-shell";
import {
  AddExerciseForm,
  RoutineEditForm,
} from "@/components/routines/routine-edit-forms";
import { RoutineExerciseList } from "@/components/routines/routine-exercise-list";
import { Button } from "@/components/ui/button";
import type { Exercise, Routine, RoutineExercise } from "@/lib/types";
import { createClient } from "@/utils/supabase/server";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function RotinaDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: routine } = await supabase
    .from("routines")
    .select("*")
    .eq("id", id)
    .single();

  if (!routine) notFound();

  const { data: routineExercises } = await supabase
    .from("routine_exercises")
    .select("*, exercise:exercises!routine_exercises_exercise_id_fkey(*)")
    .eq("routine_id", id)
    .order("position", { ascending: true });

  const { data: exercises } = await supabase
    .from("exercises")
    .select("*")
    .order("name", { ascending: true });

  const items = (routineExercises ?? []) as RoutineExercise[];
  const library = (exercises ?? []) as Exercise[];
  const typedRoutine = routine as Routine;

  return (
    <AppShell active="treinos">
      <section className="flex flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Button
              render={<Link href="/treinos" />}
              variant="ghost"
              size="xs"
              className="squircle -ml-2 mb-2"
            >
              ← Treinos
            </Button>
            <h2 className="font-medium">{typedRoutine.name}</h2>
            <p className="mt-1 text-[13px] text-muted-foreground">
              {typedRoutine.description || "Sem descrição"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <form action={startSession}>
              <input type="hidden" name="routine_id" value={id} />
              <Button
                type="submit"
                className="squircle"
                disabled={items.length === 0}
              >
                <PlayIcon />
                Iniciar
              </Button>
            </form>
            <form action={deleteRoutine}>
              <input type="hidden" name="id" value={id} />
              <Button type="submit" variant="destructive-outline" className="squircle">
                Excluir
              </Button>
            </form>
          </div>
        </div>

        <RoutineEditForm routine={typedRoutine} />
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="font-medium">Exercícios da rotina</h2>
        <RoutineExerciseList routineId={id} items={items} />
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="font-medium">Adicionar exercício</h2>
        <AddExerciseForm routineId={id} exercises={library} />
      </section>
    </AppShell>
  );
}
