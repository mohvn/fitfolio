import { Trash2Icon } from "lucide-react";
import { deleteExercise } from "@/app/actions/workouts";
import { EmptyState } from "@/components/empty-state";
import type { Exercise } from "@/lib/types";
import { Button } from "@/components/ui/button";

export function ExerciseList({ exercises }: { exercises: Exercise[] }) {
  if (exercises.length === 0) {
    return (
      <EmptyState
        title="Biblioteca vazia"
        description="Adicione o primeiro exercício no formulário acima."
      />
    );
  }

  return (
    <ul className="flex flex-col gap-1">
      {exercises.map((exercise) => (
        <li
          key={exercise.id}
          className="relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-[10px] rounded-xl px-0 py-2 before:absolute before:-inset-x-3 before:-inset-y-0.5 before:rounded-xl before:squircle hover:before:bg-timeline-hover"
        >
          <div className="relative z-10 min-w-0">
            <p className="text-sm">{exercise.name}</p>
            <p className="text-[13px] text-muted-foreground">
              {exercise.muscle_group || "Sem grupo"}
              {exercise.notes ? ` · ${exercise.notes}` : null}
            </p>
          </div>
          <form action={deleteExercise} className="relative z-10">
            <input type="hidden" name="id" value={exercise.id} />
            <Button
              type="submit"
              variant="ghost"
              size="icon-sm"
              className="squircle"
              aria-label={`Remover ${exercise.name}`}
            >
              <Trash2Icon />
            </Button>
          </form>
        </li>
      ))}
    </ul>
  );
}
