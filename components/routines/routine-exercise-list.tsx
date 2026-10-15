import {
  ArrowDownIcon,
  ArrowUpIcon,
  Trash2Icon,
} from "lucide-react";
import {
  moveRoutineExercise,
  removeExerciseFromRoutine,
} from "@/app/actions/workouts";
import type { RoutineExercise } from "@/lib/types";
import { Button } from "@/components/ui/button";

export function RoutineExerciseList({
  routineId,
  items,
}: {
  routineId: string;
  items: RoutineExercise[];
}) {
  if (items.length === 0) {
    return (
      <p className="text-[13px] text-muted-foreground">
        Nenhum exercício nesta rotina ainda.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-1">
      {items.map((item, index) => (
        <li
          key={item.id}
          className="relative grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-[10px] rounded-xl py-2 before:absolute before:-inset-x-3 before:-inset-y-0.5 before:rounded-xl before:squircle hover:before:bg-timeline-hover"
        >
          <span className="relative z-10 flex size-8 items-center justify-center rounded-mark border border-border bg-accent font-mono text-[10px] text-muted-foreground squircle">
            {index + 1}
          </span>
          <div className="relative z-10 min-w-0">
            <p className="text-sm">{item.exercise?.name ?? "Exercício"}</p>
            <p className="text-[13px] text-muted-foreground">
              {item.target_reps.includes("/")
                ? `${item.target_sets} séries · ${item.target_reps}`
                : `${item.target_sets}×${item.target_reps}`}
              {item.rest_seconds != null ? ` · ${item.rest_seconds}s` : ""}
            </p>
          </div>
          <div className="relative z-10 flex items-center gap-px">
            <form action={moveRoutineExercise}>
              <input type="hidden" name="id" value={item.id} />
              <input type="hidden" name="routine_id" value={routineId} />
              <input type="hidden" name="direction" value="up" />
              <Button
                type="submit"
                variant="ghost"
                size="icon-xs"
                className="squircle"
                disabled={index === 0}
                aria-label="Mover para cima"
              >
                <ArrowUpIcon />
              </Button>
            </form>
            <form action={moveRoutineExercise}>
              <input type="hidden" name="id" value={item.id} />
              <input type="hidden" name="routine_id" value={routineId} />
              <input type="hidden" name="direction" value="down" />
              <Button
                type="submit"
                variant="ghost"
                size="icon-xs"
                className="squircle"
                disabled={index === items.length - 1}
                aria-label="Mover para baixo"
              >
                <ArrowDownIcon />
              </Button>
            </form>
            <form action={removeExerciseFromRoutine}>
              <input type="hidden" name="id" value={item.id} />
              <input type="hidden" name="routine_id" value={routineId} />
              <Button
                type="submit"
                variant="ghost"
                size="icon-xs"
                className="squircle"
                aria-label="Remover"
              >
                <Trash2Icon />
              </Button>
            </form>
          </div>
        </li>
      ))}
    </ul>
  );
}
