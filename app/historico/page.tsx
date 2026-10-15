import Link from "next/link";
import { ChevronRightIcon, UploadIcon } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/server";

const PAGE_SIZE = 40;

type HistoryRow = {
  id: string;
  title: string | null;
  started_at: string;
  completed_at: string;
  routine: { name: string } | null;
  session_exercises: { count: number }[];
};

export default async function HistoricoPage({ searchParams }: PageProps<"/historico">) {
  const { pagina } = await searchParams;
  const page = Math.max(1, Number(Array.isArray(pagina) ? pagina[0] : pagina) || 1);
  const from = (page - 1) * PAGE_SIZE;

  const supabase = await createClient();
  const { data, count } = await supabase
    .from("workout_sessions")
    .select(
      "id, title, started_at, completed_at, routine:routines!workout_sessions_routine_id_fkey(name), session_exercises(count)",
      { count: "exact" },
    )
    .not("completed_at", "is", null)
    .order("started_at", { ascending: false })
    .range(from, from + PAGE_SIZE - 1);

  const rows = (data ?? []) as unknown as HistoryRow[];
  const total = count ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const months = new Map<string, HistoryRow[]>();
  for (const row of rows) {
    const label = new Date(row.started_at).toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric",
    });
    months.set(label, [...(months.get(label) ?? []), row]);
  }

  return (
    <AppShell active="historico">
      <section className="flex flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-medium">Histórico</h2>
            <p className="mt-1 text-[13px] text-muted-foreground">
              {total.toLocaleString("pt-BR")} treinos concluídos.
            </p>
          </div>
          <Button
            render={<Link href="/importar" />}
            variant="outline"
            size="sm"
            className="squircle"
          >
            <UploadIcon />
            Importar do Hevy
          </Button>
        </div>

        {total === 0 ? (
          <EmptyState
            title="Nenhum treino ainda"
            description="Conclua um treino ou importe seu histórico do Hevy."
            actionHref="/importar"
            actionLabel="Importar do Hevy"
          />
        ) : null}
      </section>

      {[...months].map(([month, items]) => (
        <section key={month} className="flex flex-col gap-3">
          <h3 className="text-[13px] capitalize text-muted-foreground">{month}</h3>
          <ul className="flex flex-col gap-1">
            {items.map((row) => {
              const minutes = Math.round(
                (new Date(row.completed_at).getTime() - new Date(row.started_at).getTime()) / 60000,
              );
              const exercises = row.session_exercises[0]?.count ?? 0;
              const day = new Date(row.started_at).toLocaleDateString("pt-BR", {
                weekday: "short",
                day: "numeric",
              });

              return (
                <li key={row.id}>
                  <Link
                    href={`/sessao/${row.id}`}
                    className="relative grid grid-cols-[3.5rem_minmax(0,1fr)_auto] items-center gap-x-[10px] py-2 before:absolute before:-inset-x-3 before:-inset-y-0.5 before:rounded-xl before:squircle hover:before:bg-timeline-hover"
                  >
                    <span className="relative font-mono text-[12px] text-muted-foreground">{day}</span>
                    <div className="relative min-w-0">
                      <p className="truncate text-sm">
                        {row.title ?? row.routine?.name ?? "Treino livre"}
                      </p>
                      <p className="text-[13px] text-muted-foreground">
                        {minutes} min · {exercises} exercícios · toque para ver ou editar
                      </p>
                    </div>
                    <ChevronRightIcon className="relative size-4 text-muted-foreground" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      {pages > 1 ? (
        <nav className="flex items-center justify-between gap-3">
          <Button
            render={<Link href={`/historico?pagina=${page - 1}`} />}
            variant="ghost"
            size="sm"
            className="squircle"
            disabled={page <= 1}
          >
            ← Mais recentes
          </Button>
          <span className="font-mono text-[12px] text-muted-foreground">
            {page}/{pages}
          </span>
          <Button
            render={<Link href={`/historico?pagina=${page + 1}`} />}
            variant="ghost"
            size="sm"
            className="squircle"
            disabled={page >= pages}
          >
            Anteriores →
          </Button>
        </nav>
      ) : null}
    </AppShell>
  );
}
