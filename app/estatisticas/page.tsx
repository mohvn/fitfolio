import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { ExerciseProgress } from "@/components/stats/exercise-progress";
import { ExerciseRanking } from "@/components/stats/exercise-ranking";
import { MuscleBarChart, MuscleRadarChart } from "@/components/stats/muscle-charts";
import { PeriodTabs } from "@/components/stats/period-tabs";
import { TimelineChart } from "@/components/stats/timeline-chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatWeight } from "@/lib/format";
import {
  computeStats,
  parsePeriod,
  PERIODS,
  type ExerciseInfo,
  type PeriodKey,
  type StatsRow,
} from "@/lib/stats";
import { createClient } from "@/utils/supabase/server";

function nowEpoch() {
  return Math.floor(Date.now() / 1000);
}

function periodStart(period: PeriodKey, now: number): string | null {
  const days = PERIODS[period].days;
  return days ? new Date((now - days * 86400) * 1000).toISOString() : null;
}

function formatHours(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  return h ? `${h}h ${m}min` : `${m} min`;
}

const compact = (n: number) =>
  n.toLocaleString("pt-BR", { notation: "compact", maximumFractionDigits: 1 });

export default async function EstatisticasPage({ searchParams }: PageProps<"/estatisticas">) {
  const period = parsePeriod((await searchParams).periodo);
  const now = nowEpoch();

  const supabase = await createClient();
  const [statsRes, exercisesRes] = await Promise.all([
    supabase.rpc("stats_sets", { p_from: periodStart(period, now) }),
    supabase.from("exercises").select("id, name, muscle_group"),
  ]);

  const header = (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="font-medium">Estatísticas</h2>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Séries de aquecimento ficam fora de volume, séries e ranking.
        </p>
      </div>
      <PeriodTabs value={period} />
    </section>
  );

  if (statsRes.error) {
    return (
      <AppShell active="estatisticas">
        {header}
        <EmptyState
          title="Não foi possível carregar as estatísticas"
          description="Rode a migration supabase/migrations/004_stats.sql no SQL Editor do Supabase e recarregue."
        />
      </AppShell>
    );
  }

  const stats = computeStats(
    (statsRes.data ?? []) as StatsRow[],
    (exercisesRes.data ?? []) as ExerciseInfo[],
    period,
    now,
  );
  const { summary } = stats;

  if (summary.workouts === 0) {
    return (
      <AppShell active="estatisticas">
        {header}
        <EmptyState
          title="Sem treinos neste período"
          description="Conclua um treino, importe seu histórico do Hevy ou escolha um período maior."
          actionHref="/importar"
          actionLabel="Importar do Hevy"
        />
      </AppShell>
    );
  }

  const bucketLabel = PERIODS[period].bucket === "week" ? "Semana de" : "";
  const tiles = [
    { label: "Treinos", value: summary.workouts.toLocaleString("pt-BR"), hint: `${formatWeight(summary.workouts / summary.weeks)}/semana` },
    { label: "Tempo total", value: formatHours(summary.totalSeconds), hint: `${Math.round(summary.avgSeconds / 60)} min em média` },
    { label: "Volume", value: `${compact(summary.volume)} kg`, hint: `${compact(summary.volume / summary.workouts)} kg/treino` },
    { label: "Séries", value: summary.sets.toLocaleString("pt-BR"), hint: `${compact(summary.reps)} repetições` },
  ];

  return (
    <AppShell active="estatisticas">
      {header}

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {tiles.map((t) => (
          <Card key={t.label} size="sm" className="squircle gap-1">
            <CardContent className="flex flex-col gap-0.5">
              <span className="text-[12px] text-muted-foreground">{t.label}</span>
              <span className="font-mono text-lg tabular-nums">{t.value}</span>
              <span className="text-[12px] text-muted-foreground">{t.hint}</span>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card className="squircle">
        <CardHeader>
          <CardTitle>Evolução</CardTitle>
          <CardDescription>
            Por {PERIODS[period].bucket === "week" ? "semana" : "mês"}. Duração é a média por treino.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TimelineChart data={stats.timeline} bucketLabel={bucketLabel} />
        </CardContent>
      </Card>

      <Card className="squircle">
        <CardHeader>
          <CardTitle>Por grupo muscular</CardTitle>
          <CardDescription>
            Séries por semana consideram {formatWeight(summary.weeks)} semanas no período.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MuscleBarChart data={stats.muscles} />
        </CardContent>
      </Card>

      <Card className="squircle">
        <CardHeader>
          <CardTitle>Distribuição muscular</CardTitle>
          <CardDescription>Percentual das séries de trabalho em cada grupo.</CardDescription>
        </CardHeader>
        <CardContent>
          <MuscleRadarChart data={stats.muscles} />
        </CardContent>
      </Card>

      <Card className="squircle">
        <CardHeader>
          <CardTitle>Ranking de exercícios</CardTitle>
          <CardDescription>1RM estimado pela fórmula de Epley.</CardDescription>
        </CardHeader>
        <CardContent>
          <ExerciseRanking data={stats.ranking} />
        </CardContent>
      </Card>

      <Card className="squircle">
        <CardHeader>
          <CardTitle>Progressão</CardTitle>
          <CardDescription>Melhor série de cada treino nos exercícios mais frequentes.</CardDescription>
        </CardHeader>
        <CardContent>
          <ExerciseProgress exercises={stats.ranking} progress={stats.progress} />
        </CardContent>
      </Card>
    </AppShell>
  );
}
