"use client";

import { useState } from "react";
import Link from "next/link";
import { UploadIcon } from "lucide-react";
import { importWorkoutsBatch } from "@/app/actions/import";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { parseHevyCsv, type ImportWorkout } from "@/lib/hevy";

const BATCH_SIZE = 20;

type Parsed = ReturnType<typeof parseHevyCsv>;

const dateFmt = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric" });

export function HevyImport() {
  const [parsed, setParsed] = useState<Parsed | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState({ done: 0, imported: 0, skipped: 0 });
  const [finished, setFinished] = useState(false);

  const onFile = async (file: File | undefined) => {
    setError(null);
    setParsed(null);
    setFinished(false);
    setProgress({ done: 0, imported: 0, skipped: 0 });
    if (!file) return;

    try {
      setParsed(parseHevyCsv(await file.text()));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível ler o arquivo.");
    }
  };

  const run = async (workouts: ImportWorkout[]) => {
    setRunning(true);
    setError(null);
    let imported = 0;
    let skipped = 0;

    for (let i = 0; i < workouts.length; i += BATCH_SIZE) {
      const result = await importWorkoutsBatch(workouts.slice(i, i + BATCH_SIZE));
      if ("error" in result) {
        setError(`Parou no treino ${i + 1}: ${result.error}. Rode de novo — o que já entrou é pulado.`);
        setRunning(false);
        return;
      }
      imported += result.imported;
      skipped += result.skipped;
      setProgress({ done: Math.min(i + BATCH_SIZE, workouts.length), imported, skipped });
    }

    setRunning(false);
    setFinished(true);
  };

  const total = parsed?.workouts.length ?? 0;
  const pct = total ? (progress.done / total) * 100 : 0;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="hevy-file">Arquivo CSV</Label>
        <Input
          id="hevy-file"
          type="file"
          accept=".csv,text/csv"
          nativeInput
          disabled={running}
          onChange={(e) => void onFile(e.target.files?.[0])}
          className="squircle"
        />
      </div>

      {parsed ? (
        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-[13px] sm:grid-cols-4">
          {[
            ["Treinos", parsed.stats.workouts.toLocaleString("pt-BR")],
            ["Séries", parsed.stats.sets.toLocaleString("pt-BR")],
            ["Exercícios", parsed.stats.exercises.toLocaleString("pt-BR")],
            ["Período", `${dateFmt(parsed.stats.first)} – ${dateFmt(parsed.stats.last)}`],
          ].map(([label, value]) => (
            <div key={label} className="flex flex-col">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="text-foreground">{value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {parsed && parsed.stats.mapped > 0 ? (
        <p className="text-[13px] text-foreground-secondary">
          {parsed.stats.mapped} exercícios do Hevy foram ligados aos nomes das suas rotinas
          (ex.: Lat Pulldown → Puxada Aberta), então o histórico aparece na coluna “Anterior”.
        </p>
      ) : null}

      {running || finished ? (
        <div className="flex flex-col gap-2">
          <div className="h-1 overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-primary transition-[width] duration-300" style={{ width: `${pct}%` }} />
          </div>
          <p className="font-mono text-[12px] text-muted-foreground">
            {progress.done}/{total} · {progress.imported} importados · {progress.skipped} já existiam
          </p>
        </div>
      ) : null}

      {error ? (
        <p className="text-[13px] text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {finished ? (
        <Button render={<Link href="/historico" />} className="squircle self-start">
          Ver histórico
        </Button>
      ) : (
        <Button
          className="squircle self-start"
          disabled={!parsed || total === 0}
          loading={running}
          onClick={() => parsed && void run(parsed.workouts)}
        >
          <UploadIcon />
          Importar {total ? `${total} treinos` : ""}
        </Button>
      )}
    </div>
  );
}
