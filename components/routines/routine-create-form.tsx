"use client";

import { useActionState } from "react";
import { createRoutine, type ActionState } from "@/app/actions/workouts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initial: ActionState = {};

export function RoutineCreateForm() {
  const [state, action, pending] = useActionState(createRoutine, initial);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Nome</Label>
        <Input
          id="name"
          name="name"
          required
          placeholder="Push A"
          className="squircle"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Peito, ombro e tríceps"
          className="squircle"
        />
      </div>
      {state.error ? (
        <p className="text-[13px] text-destructive">{state.error}</p>
      ) : null}
      <Button type="submit" loading={pending} className="squircle self-start">
        Criar rotina
      </Button>
    </form>
  );
}
