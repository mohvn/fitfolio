"use client";

import { useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatWeight } from "@/lib/format";
import type { ExerciseRank, ProgressPoint } from "@/lib/stats";

const config = {
  e1rm: { label: "1RM estimado (kg)", color: "var(--chart-1)" },
  carga: { label: "Carga máxima (kg)", color: "var(--chart-3)" },
} satisfies ChartConfig;

const shortDate = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });

export function ExerciseProgress({
  exercises,
  progress,
}: {
  exercises: ExerciseRank[];
  progress: Record<string, ProgressPoint[]>;
}) {
  const options = exercises
    .filter((e) => progress[e.id])
    .sort((a, b) => b.treinos - a.treinos)
    .map((e) => ({ value: e.id, label: e.name }));

  const [selected, setSelected] = useState(options[0]?.value ?? "");

  if (options.length === 0) {
    return (
      <p className="text-[13px] text-muted-foreground">
        Precisa de pelo menos 2 treinos com carga no mesmo exercício.
      </p>
    );
  }

  const data = progress[selected] ?? [];
  const first = data[0]?.e1rm ?? 0;
  const last = data.at(-1)?.e1rm ?? 0;
  const best = Math.max(...data.map((d) => d.e1rm));
  const delta = first ? ((last - first) / first) * 100 : 0;

  return (
    <div className="flex flex-col gap-3">
      <Select items={options} value={selected} onValueChange={(v) => v && setSelected(v)}>
        <SelectTrigger size="sm" className="squircle w-full sm:w-80">
          <SelectValue />
        </SelectTrigger>
        <SelectPopup>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectPopup>
      </Select>

      <dl className="flex flex-wrap gap-x-6 gap-y-1 text-[13px]">
        <div className="flex gap-1.5">
          <dt className="text-muted-foreground">Melhor 1RM est.</dt>
          <dd className="font-mono">{formatWeight(best)} kg</dd>
        </div>
        <div className="flex gap-1.5">
          <dt className="text-muted-foreground">Evolução no período</dt>
          <dd className={delta >= 0 ? "font-mono text-chart-4" : "font-mono text-destructive"}>
            {delta >= 0 ? "+" : ""}
            {delta.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%
          </dd>
        </div>
        <div className="flex gap-1.5">
          <dt className="text-muted-foreground">Treinos</dt>
          <dd className="font-mono">{data.length}</dd>
        </div>
      </dl>

      <ChartContainer config={config} className="aspect-auto h-56 w-full">
        <LineChart data={data} margin={{ left: -12, right: 8, top: 8 }}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={24}
            tickFormatter={shortDate}
          />
          <YAxis tickLine={false} axisLine={false} width={44} domain={["auto", "auto"]} />
          <ChartTooltip
            content={<ChartTooltipContent labelFormatter={(label) => shortDate(String(label))} />}
          />
          <Line dataKey="e1rm" stroke="var(--color-e1rm)" strokeWidth={2} dot={false} type="monotone" />
          <Line
            dataKey="carga"
            stroke="var(--color-carga)"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            dot={false}
            type="monotone"
          />
        </LineChart>
      </ChartContainer>
    </div>
  );
}
