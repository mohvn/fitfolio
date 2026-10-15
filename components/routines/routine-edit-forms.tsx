"use client";

import { Fragment, useActionState } from "react";
import Link from "next/link";
import {
  addExerciseToRoutine,
  updateRoutine,
  type ActionState,
} from "@/app/actions/workouts";
import type { Exercise, Routine } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectGroup,
  SelectGroupLabel,
  SelectItem,
  SelectPopup,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { groupByMuscle } from "@/lib/muscles";

const initial: ActionState = {};

export function RoutineEditForm({ routine }: { routine: Routine }) {
  const [state, action, pending] = useActionState(updateRoutine, initial);

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="id" value={routine.id} />
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Nome</Label>
        <Input
          id="name"
          name="name"
          required
          defaultValue={routine.name}
          className="squircle"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={routine.description ?? ""}
          className="squircle"
        />
      </div>
      {state.error ? (
        <p className="text-[13px] text-destructive">{state.error}</p>
      ) : null}
      {state.success ? (
        <p className="text-[13px] text-foreground-secondary">{state.success}</p>
      ) : null}
      <Button type="submit" loading={pending} variant="outline" className="squircle self-start">
        Salvar
      </Button>
    </form>
  );
}

export function AddExerciseForm({
  routineId,
  exercises,
}: {
  routineId: string;
  exercises: Exercise[];
}) {
  const [state, action, pending] = useActionState(addExerciseToRoutine, initial);
  const items = exercises.map((e) => ({ value: e.id, label: e.name }));

  if (exercises.length === 0) {
    return (
      <p className="text-[13px] text-muted-foreground">
        Cadastre exercícios em{" "}
        <Button render={<Link href="/exercicios" />} variant="link" className="h-auto p-0 text-[13px]">
          Exercícios
        </Button>{" "}
        antes de montar a rotina.
      </p>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="routine_id" value={routineId} />
      <div className="flex flex-col gap-2">
        <Label htmlFor="exercise_id">Exercício</Label>
        <Select name="exercise_id" required items={items}>
          <SelectTrigger id="exercise_id" className="squircle">
            <SelectValue placeholder="Selecione…" />
          </SelectTrigger>
          <SelectPopup>
            {groupByMuscle(exercises).map(([group, list], i) => (
              <Fragment key={group}>
                {i > 0 ? <SelectSeparator /> : null}
                <SelectGroup>
                  <SelectGroupLabel>{group}</SelectGroupLabel>
                  {list.map((exercise) => (
                    <SelectItem key={exercise.id} value={exercise.id}>
                      {exercise.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </Fragment>
            ))}
          </SelectPopup>
        </Select>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="target_sets">Séries</Label>
          <Input
            id="target_sets"
            name="target_sets"
            type="number"
            min={1}
            defaultValue={3}
            className="squircle"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="target_reps">Reps</Label>
          <Input
            id="target_reps"
            name="target_reps"
            defaultValue="15/12/8"
            className="squircle"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="rest_seconds">Descanso (s)</Label>
          <Input
            id="rest_seconds"
            name="rest_seconds"
            type="number"
            min={0}
            placeholder="90"
            className="squircle"
          />
        </div>
      </div>
      {state.error ? (
        <p className="text-[13px] text-destructive">{state.error}</p>
      ) : null}
      <Button type="submit" loading={pending} className="squircle self-start">
        Adicionar
      </Button>
    </form>
  );
}
