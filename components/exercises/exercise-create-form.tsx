"use client";

import { useActionState } from "react";
import { createExercise, type ActionState } from "@/app/actions/workouts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MUSCLE_GROUPS } from "@/lib/muscles";

const initial: ActionState = {};

export function ExerciseCreateForm({ extraGroups = [] }: { extraGroups?: string[] }) {
  const [state, action, pending] = useActionState(createExercise, initial);
  const groups = [
    ...MUSCLE_GROUPS,
    ...extraGroups.filter((g) => !(MUSCLE_GROUPS as readonly string[]).includes(g)),
  ];
  const items = groups.map((g) => ({ value: g, label: g }));

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Nome</Label>
        <Input
          id="name"
          name="name"
          required
          placeholder="Supino reto"
          className="squircle"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="muscle_group">Grupo muscular</Label>
        <Select name="muscle_group" items={items}>
          <SelectTrigger id="muscle_group" className="squircle">
            <SelectValue placeholder="Selecione…" />
          </SelectTrigger>
          <SelectPopup>
            {items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectPopup>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="notes">Notas</Label>
        <Textarea id="notes" name="notes" placeholder="Opcional" className="squircle" />
      </div>
      {state.error ? (
        <p className="text-[13px] text-destructive">{state.error}</p>
      ) : null}
      <Button type="submit" loading={pending} className="squircle self-start">
        Adicionar exercício
      </Button>
    </form>
  );
}
