"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  LabelList,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  XAxis,
  YAxis,
} from "recharts";
import { MetricTabs } from "@/components/stats/metric-tabs";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { ExerciseRank, MusclePoint } from "@/lib/stats";
import { NO_MUSCLE_GROUP } from "@/lib/muscles";

type Metric = "seriesSemana" | "series" | "volume" | "reps";

const OPTIONS: { value: Metric; label: string }[] = [
  { value: "seriesSemana", label: "Séries/semana" },
  { value: "series", label: "Séries" },
  { value: "volume", label: "Volume" },
  { value: "reps", label: "Repetições" },
];

const barConfig = {
  seriesSemana: { label: "Séries por semana", color: "var(--chart-1)" },
  series: { label: "Séries", color: "var(--chart-1)" },
  volume: { label: "Volume (kg)", color: "var(--chart-1)" },
  reps: { label: "Repetições", color: "var(--chart-1)" },
} satisfies ChartConfig;

const radarConfig = {
  share: { label: "% das séries", color: "var(--chart-1)" },
} satisfies ChartConfig;

const compact = (n: number) =>
  n.toLocaleString("pt-BR", { notation: "compact", maximumFractionDigits: 1 });

export function MuscleBarChart({
  data,
  ranking = [],
  weeks,
}: {
  data: MusclePoint[];
  ranking?: ExerciseRank[];
  weeks?: number;
}) {
  const [metric, setMetric] = useState<Metric>("seriesSemana");
  const sorted = [...data].sort((a, b) => b[metric] - a[metric]);
  const ungrouped = ranking
    .filter((e) => e.muscle === NO_MUSCLE_GROUP && e.series > 0)
    .sort((a, b) => b.series - a.series);

  return (
    <div className="flex flex-col gap-3">
      <MetricTabs value={metric} options={OPTIONS} onChange={setMetric} />
      <ChartContainer
        config={barConfig}
        className="aspect-auto w-full"
        style={{ height: Math.max(160, sorted.length * 30) }}
      >
        <BarChart data={sorted} layout="vertical" margin={{ left: 0, right: 40 }}>
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="muscle"
            tickLine={false}
            axisLine={false}
            width={118}
            interval={0}
          />
          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
          <Bar dataKey={metric} fill={`var(--color-${metric})`} radius={4} barSize={16}>
            <LabelList
              dataKey={metric}
              position="right"
              className="fill-muted-foreground"
              fontSize={11}
              formatter={(v) => (typeof v === "number" ? compact(v) : String(v ?? ""))}
            />
          </Bar>
        </BarChart>
      </ChartContainer>

      {ungrouped.length > 0 ? (
        <div className="flex flex-col gap-2 border-t border-border pt-3">
          <p className="text-[13px] text-muted-foreground">
            Exercícios em {NO_MUSCLE_GROUP} ({ungrouped.length}):
          </p>
          <ul className="flex flex-col gap-1">
            {ungrouped.map((e) => (
              <li
                key={e.id}
                className="flex items-baseline justify-between gap-3 text-[13px]"
              >
                <span className="min-w-0 truncate">{e.name}</span>
                <span className="shrink-0 font-mono tabular-nums text-muted-foreground">
                  {e.series} séries
                  {weeks
                    ? ` · ${(e.series / weeks).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}/sem`
                    : null}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export function MuscleRadarChart({ data }: { data: MusclePoint[] }) {
  // A radar needs ≥ 3 axes; tiny groups just add noise around the edge.
  const points = data.filter((m) => m.share >= 1).slice(0, 10);
  if (points.length < 3) {
    return <p className="text-[13px] text-muted-foreground">Poucos grupos musculares para o radar.</p>;
  }

  return (
    <ChartContainer config={radarConfig} className="mx-auto aspect-square w-full max-w-sm">
      <RadarChart data={points} outerRadius="72%">
        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
        <PolarGrid />
        <PolarAngleAxis dataKey="muscle" tick={{ fontSize: 11 }} />
        <Radar
          dataKey="share"
          fill="var(--color-share)"
          fillOpacity={0.35}
          stroke="var(--color-share)"
          strokeWidth={1.5}
        />
      </RadarChart>
    </ChartContainer>
  );
}
