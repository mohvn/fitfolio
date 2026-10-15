import Link from "next/link";
import { ChevronRightIcon, PlayIcon, PlusIcon } from "lucide-react";
import { startEmptySession } from "@/app/actions/sessions";
import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { ElapsedTime } from "@/components/session/elapsed-time";
import { Button } from "@/components/ui/button";
import type { Routine } from "@/lib/types";
import { createClient } from "@/utils/supabase/server";

export default async function TreinosPage() {
  const supabase = await createClient();

  const [{ data }, { data: active }] = await Promise.all([
    supabase.from("routines").select("*").order("updated_at", { ascending: false }),
    supabase
      .from("workout_sessions")
      .select("id, title, started_at, routine:routines!workout_sessions_routine_id_fkey(name)")
      .is("completed_at", null)
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const routines = (data ?? []) as Routine[];
  const activeRoutine = active?.routine as { name: string } | { name: string }[] | null | undefined;
  const activeName =
    active?.title ?? (Array.isArray(activeRoutine) ? activeRoutine[0]?.name : activeRoutine?.name);

  return (
    <AppShell active="treinos">
      {active ? (
        <Link
          href={`/sessao/${active.id}`}
          className="relative grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-[10px] rounded-xl border bg-card px-3 py-2.5 squircle hover:bg-timeline-hover"
        >
          <span className="relative flex size-2.5">
            <span className="absolute inset-0 animate-ping rounded-full bg-selection/60" />
            <span className="relative size-2.5 rounded-full bg-selection" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm">Treino em andamento · {activeName ?? "Treino livre"}</p>
            <p className="text-[13px] text-muted-foreground">
              <ElapsedTime startedAt={active.started_at} /> · toque para retomar
            </p>
          </div>
          <ChevronRightIcon className="size-4 text-muted-foreground" />
        </Link>
      ) : null}

      <section className="flex flex-col gap-5">
        <div>
          <h2 className="font-medium">Começar</h2>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Inicie um treino vazio ou escolha uma rotina abaixo.
          </p>
        </div>
        <form action={startEmptySession}>
          <Button type="submit" variant="outline" className="squircle w-full">
            <PlayIcon />
            Treino vazio
          </Button>
        </form>
      </section>

      <section className="flex flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-medium">Rotinas</h2>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Modelos reutilizáveis para iniciar sessões.
            </p>
          </div>
          <Button render={<Link href="/treinos/novo" />} size="sm" className="squircle">
            <PlusIcon />
            Nova
          </Button>
        </div>

        {routines.length === 0 ? (
          <EmptyState
            title="Nenhuma rotina ainda"
            description="Crie a primeira rotina para montar exercícios e iniciar sessões."
            actionHref="/treinos/novo"
            actionLabel="Nova rotina"
          />
        ) : (
          <ul className="flex flex-col gap-1">
            {routines.map((routine) => (
              <li key={routine.id}>
                <Link
                  href={`/treinos/${routine.id}`}
                  className="relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-[10px] rounded-xl py-2 before:absolute before:-inset-x-3 before:-inset-y-0.5 before:rounded-xl before:squircle hover:before:bg-timeline-hover"
                >
                  <div className="relative z-10 min-w-0">
                    <p className="text-sm">{routine.name}</p>
                    <p className="text-[13px] text-muted-foreground">
                      {routine.description || "Sem descrição"}
                    </p>
                  </div>
                  <ChevronRightIcon className="relative z-10 size-4 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  );
}
