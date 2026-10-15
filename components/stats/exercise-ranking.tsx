"use client";

import { useState } from "react";
import { MetricTabs } from "@/components/stats/metric-tabs";
import { Button } from "@/components/ui/button";
import { formatWeight } from "@/lib/format";
import type { ExerciseRank } from "@/lib/stats";

type Metric = "series" | "treinos" | "volume" | "e1rm";

const OPTIONS: { value: Metric; label: string }[] = [
  { value: "series", label: "Séries" },
  { value: "treinos", label: "Frequência" },
  { value: "volume", label: "Volume" },
  { value: "e1rm", label: "1RM est." },
];

function formatMetric(metric: Metric, value: number): string {
  if (metric === "volume") return `${value.toLocaleString("pt-BR", { notation: "compact" })} kg`;
  if (metric === "e1rm") return `${formatWeight(value)} kg`;
  if (metric === "treinos") return `${value}×`;
  return value.toLocaleString("pt-BR");
}

export function ExerciseRanking({ data }: { data: ExerciseRank[] }) {
  const [metric, setMetric] = useState<Metric>("series");
  const [expanded, setExpanded] = useState(false);

  const sorted = [...data].sort((a, b) => b[metric] - a[metric]).filter((e) => e[metric] > 0);
  const visible = expanded ? sorted.slice(0, 30) : sorted.slice(0, 10);
  const max = sorted[0]?.[metric] ?? 1;

  return (
    <div className="flex flex-col gap-3">
      <MetricTabs value={metric} options={OPTIONS} onChange={setMetric} />

      <ol className="flex flex-col">
        {visible.map((e, i) => (
          <li
            key={e.id}
            className="grid grid-cols-[1.5rem_minmax(0,1fr)_auto] items-center gap-x-[10px] py-1.5"
          >
            <span className="font-mono text-[12px] text-muted-foreground">{i + 1}</span>
            <div className="flex min-w-0 flex-col gap-1">
              <div className="flex items-baseline gap-2">
                <span className="truncate text-sm">{e.name}</span>
                <span className="shrink-0 text-[12px] text-muted-foreground">{e.muscle}</span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-chart-1"
                  style={{ width: `${(e[metric] / max) * 100}%` }}
                />
              </div>
            </div>
            <span className="font-mono text-[13px] tabular-nums text-foreground-secondary">
              {formatMetric(metric, e[metric])}
            </span>
          </li>
        ))}
      </ol>

      {sorted.length > 10 ? (
        <Button
          variant="ghost"
          size="sm"
          className="squircle self-start text-muted-foreground"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? "Mostrar menos" : `Mostrar top ${Math.min(30, sorted.length)}`}
        </Button>
      ) : null}
    </div>
  );
}
