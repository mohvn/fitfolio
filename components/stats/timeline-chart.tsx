"use client";

import { useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { MetricTabs } from "@/components/stats/metric-tabs";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { TimelinePoint } from "@/lib/stats";

type Metric = "duracao" | "volume" | "reps" | "series" | "treinos";

const OPTIONS: { value: Metric; label: string }[] = [
  { value: "duracao", label: "Duração" },
  { value: "volume", label: "Volume" },
  { value: "reps", label: "Repetições" },
  { value: "series", label: "Séries" },
  { value: "treinos", label: "Treinos" },
];

const config = {
  duracao: { label: "Duração média (min)", color: "var(--chart-1)" },
  volume: { label: "Volume (kg)", color: "var(--chart-1)" },
  reps: { label: "Repetições", color: "var(--chart-1)" },
  series: { label: "Séries", color: "var(--chart-1)" },
  treinos: { label: "Treinos", color: "var(--chart-1)" },
} satisfies ChartConfig;

const compact = (n: number) =>
  n.toLocaleString("pt-BR", { notation: "compact", maximumFractionDigits: 1 });

export function TimelineChart({ data, bucketLabel }: { data: TimelinePoint[]; bucketLabel: string }) {
  const [metric, setMetric] = useState<Metric>("duracao");

  return (
    <div className="flex flex-col gap-3">
      <MetricTabs value={metric} options={OPTIONS} onChange={setMetric} />
      <ChartContainer config={config} className="aspect-auto h-56 w-full">
        <BarChart data={data} margin={{ left: -12, right: 4, top: 8 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} minTickGap={16} />
          <YAxis tickLine={false} axisLine={false} width={44} tickFormatter={compact} />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent labelFormatter={(label) => `${bucketLabel} ${label}`} />}
          />
          <Bar dataKey={metric} fill={`var(--color-${metric})`} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartContainer>
    </div>
  );
}
