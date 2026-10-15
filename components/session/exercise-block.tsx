"use client";

import {
  ArrowDownIcon,
  ArrowUpIcon,
  CheckIcon,
  PlusIcon,
  TimerIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import type { Exercise, PreviousSet } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatClock, formatWeight, targetRepsAt } from "@/lib/format";
import { cn } from "@/lib/utils";

export type LoggerSet = {
  id: string;
  set_index: number;
  weight: string;
  reps: string;
  completed: boolean;
};

export type LoggerExercise = {
  id: string;
  session_id: string;
  exercise_id: string;
  exercise: Exercise;
  target_reps: string | null;
  rest_seconds: number | null;
  sets: LoggerSet[];
  previous: PreviousSet[];
};

const REST_OPTIONS = [0, 30, 45, 60, 75, 90, 120, 150, 180, 240, 300];

const restItems = REST_OPTIONS.map((seconds) => ({
  value: String(seconds),
  label: seconds === 0 ? "Desligado" : formatClock(seconds),
}));

function formatPrevious(previous: PreviousSet | undefined): string {
  if (!previous || (previous.weight_kg == null && previous.reps == null)) return "—";
  const kg = previous.weight_kg != null ? `${formatWeight(previous.weight_kg)} kg` : "";
  const reps = previous.reps != null ? `${previous.reps}` : "";
  return kg && reps ? `${kg} × ${reps}` : kg || `${reps} reps`;
}

const rowGrid =
  "grid grid-cols-[1.75rem_minmax(0,1fr)_4.25rem_4.25rem_2rem_1.5rem] items-center gap-x-1.5";

export function ExerciseBlock({
  item,
  index,
  total,
  addingSet,
  onDraft,
  onCommit,
  onToggle,
  onAddSet,
  onRemoveSet,
  onRemove,
  onMove,
  onRestChange,
}: {
  item: LoggerExercise;
  index: number;
  total: number;
  addingSet: boolean;
  onDraft: (setId: string, field: "weight" | "reps", value: string) => void;
  onCommit: (setId: string) => void;
  onToggle: (setId: string) => void;
  onAddSet: () => void;
  onRemoveSet: (setId: string) => void;
  onRemove: () => void;
  onMove: (direction: "up" | "down") => void;
  onRestChange: (seconds: number | null) => void;
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-[10px]">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-mark border border-border bg-accent font-mono text-[10px] text-muted-foreground squircle">
            {index + 1}
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-medium">{item.exercise.name}</h3>
            <p className="text-[13px] text-muted-foreground">
              {item.exercise.muscle_group || "Sem grupo"}
              {item.target_reps ? ` · meta ${item.target_reps} reps` : ""}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-px">
          <Button
            variant="ghost"
            size="icon-xs"
            className="squircle"
            disabled={index === 0}
            aria-label={`Mover ${item.exercise.name} para cima`}
            onClick={() => onMove("up")}
          >
            <ArrowUpIcon />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            className="squircle"
            disabled={index >= total - 1}
            aria-label={`Mover ${item.exercise.name} para baixo`}
            onClick={() => onMove("down")}
          >
            <ArrowDownIcon />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            className="squircle"
            aria-label={`Remover ${item.exercise.name}`}
            onClick={onRemove}
          >
            <Trash2Icon />
          </Button>
        </div>
      </div>

      <Select
        items={restItems}
        value={String(item.rest_seconds ?? 0)}
        onValueChange={(value) => {
          const seconds = Number(value);
          onRestChange(seconds > 0 ? seconds : null);
        }}
      >
        <SelectTrigger size="sm" className="squircle w-auto min-w-0 self-start text-[13px]">
          <TimerIcon className="text-muted-foreground" />
          <span className="text-muted-foreground">Descanso</span>
          <SelectValue />
        </SelectTrigger>
        <SelectPopup>
          {restItems.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectPopup>
      </Select>

      <div className="flex flex-col gap-1">
        <div className={cn(rowGrid, "px-1 text-[11px] uppercase tracking-wide text-muted-foreground")}>
          <span>Série</span>
          <span>Anterior</span>
          <span className="text-center">Kg</span>
          <span className="text-center">Reps</span>
          <span className="flex justify-center">
            <CheckIcon className="size-3.5" />
          </span>
          <span />
        </div>

        {item.sets.map((set, index) => {
          const previous = item.previous[index];
          return (
            <div
              key={set.id}
              className={cn(
                rowGrid,
                "rounded-lg px-1 py-1 transition-colors squircle",
                set.completed && "bg-timeline-hover",
              )}
            >
              <span className="font-mono text-[13px] text-foreground-secondary">{index + 1}</span>
              <span className="truncate font-mono text-[12px] text-muted-foreground">
                {formatPrevious(previous)}
              </span>
              <Input
                nativeInput
                size="sm"
                inputMode="decimal"
                aria-label={`Carga da série ${index + 1}`}
                value={set.weight}
                placeholder={previous?.weight_kg != null ? formatWeight(previous.weight_kg) : "0"}
                onChange={(e) => onDraft(set.id, "weight", e.target.value)}
                onBlur={() => onCommit(set.id)}
                className="squircle"
                style={{ textAlign: "center" }}
              />
              <Input
                nativeInput
                size="sm"
                inputMode="numeric"
                aria-label={`Repetições da série ${index + 1}`}
                value={set.reps}
                placeholder={String(
                  previous?.reps ?? targetRepsAt(item.target_reps, index) ?? 0,
                )}
                onChange={(e) => onDraft(set.id, "reps", e.target.value)}
                onBlur={() => onCommit(set.id)}
                className="squircle"
                style={{ textAlign: "center" }}
              />
              <Button
                variant={set.completed ? "default" : "outline"}
                size="icon-sm"
                aria-label={set.completed ? `Desmarcar série ${index + 1}` : `Concluir série ${index + 1}`}
                aria-pressed={set.completed}
                onClick={() => onToggle(set.id)}
                className={cn("squircle", !set.completed && "text-muted-foreground")}
              >
                <CheckIcon />
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                className="squircle text-muted-foreground"
                aria-label={`Remover série ${index + 1}`}
                onClick={() => onRemoveSet(set.id)}
              >
                <XIcon />
              </Button>
            </div>
          );
        })}
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="squircle w-full text-muted-foreground"
        loading={addingSet}
        onClick={onAddSet}
      >
        <PlusIcon />
        Adicionar série
      </Button>
    </section>
  );
}
