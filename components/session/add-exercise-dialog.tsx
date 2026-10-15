"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PlusIcon, SearchIcon } from "lucide-react";
import type { Exercise } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { groupByMuscle } from "@/lib/muscles";

export function AddExerciseDialog({
  library,
  pending,
  onPick,
}: {
  library: Exercise[];
  pending: boolean;
  onPick: (exercise: Exercise) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return library;
    return library.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        (e.muscle_group ?? "").toLowerCase().includes(q),
    );
  }, [library, query]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="secondary" className="squircle w-full" loading={pending} />
        }
      >
        <PlusIcon />
        Adicionar exercício
      </DialogTrigger>
      <DialogPopup className="squircle">
        <DialogHeader>
          <DialogTitle className="font-medium text-base">Adicionar exercício</DialogTitle>
          <DialogDescription>Escolha da sua biblioteca.</DialogDescription>
        </DialogHeader>
        <DialogPanel className="flex flex-col gap-3">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar"
              className="squircle"
              style={{ paddingLeft: "2rem" }}
              autoFocus
            />
          </div>

          {library.length === 0 ? (
            <p className="text-[13px] text-muted-foreground">
              Sua biblioteca está vazia.{" "}
              <Button render={<Link href="/exercicios" />} variant="link" className="h-auto p-0 text-[13px]">
                Cadastrar exercícios
              </Button>
            </p>
          ) : filtered.length === 0 ? (
            <p className="text-[13px] text-muted-foreground">Nada encontrado.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {groupByMuscle(filtered).map(([group, list]) => (
                <section key={group} className="flex flex-col gap-0.5">
                  <h4 className="px-2 text-xs font-medium text-muted-foreground">{group}</h4>
                  <ul className="flex flex-col">
                    {list.map((exercise) => (
                      <li key={exercise.id}>
                        <Button
                          variant="ghost"
                          className="squircle w-full justify-start font-normal"
                          onClick={() => {
                            onPick(exercise);
                            setOpen(false);
                            setQuery("");
                          }}
                        >
                          <span className="truncate">{exercise.name}</span>
                        </Button>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </DialogPanel>
      </DialogPopup>
    </Dialog>
  );
}
