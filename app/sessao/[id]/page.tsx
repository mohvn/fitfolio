import Link from "next/link";
import { notFound } from "next/navigation";
import { PencilIcon } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import type { LoggerExercise } from "@/components/session/exercise-block";
import { SessionDurationEditor } from "@/components/session/session-duration-editor";
import { WorkoutLogger } from "@/components/session/workout-logger";
import { Button } from "@/components/ui/button";
import { formatClock, formatWeight } from "@/lib/format";
import { getPreviousSets } from "@/lib/previous";
import { toLoggerSet } from "@/lib/session";
import type { Exercise, SessionExercise, SessionSet, WorkoutSession } from "@/lib/types";
import { createClient } from "@/utils/supabase/server";

export default async function SessaoPage({
  params,
  searchParams,
}: PageProps<"/sessao/[id]">) {
  const { id } = await params;
  const { editar } = await searchParams;
  const editing = editar === "1" || editar === "true";
  const supabase = await createClient();

  const { data: session } = await supabase
    .from("workout_sessions")
    .select("*")
    .eq("id", id)
    .single();

  if (!session) notFound();

  const typedSession = session as WorkoutSession;

  let title = typedSession.title ?? "Treino livre";
  if (!typedSession.title && typedSession.routine_id) {
    const { data: routine } = await supabase
      .from("routines")
      .select("name")
      .eq("id", typedSession.routine_id)
      .single();
    if (routine?.name) title = routine.name;
  }

  const { data: rows } = await supabase
    .from("session_exercises")
    .select(
      "*, exercise:exercises!session_exercises_exercise_id_fkey(*), sets:session_sets!session_sets_session_exercise_id_fkey(*)",
    )
    .eq("session_id", id)
    .order("position", { ascending: true });

  const sessionExercises = ((rows ?? []) as SessionExercise[]).map((row) => ({
    ...row,
    sets: [...row.sets].sort((a, b) => a.set_index - b.set_index),
  }));

  const completed = Boolean(typedSession.completed_at);
  const wantsEditor = !completed || editing;

  if (wantsEditor) {
    const [previous, { data: library }] = await Promise.all([
      getPreviousSets(
        supabase,
        [...new Set(sessionExercises.map((e) => e.exercise_id))],
        id,
      ),
      supabase.from("exercises").select("*").order("name", { ascending: true }),
    ]);

    const initialExercises: LoggerExercise[] = sessionExercises.map((row) => ({
      id: row.id,
      session_id: row.session_id,
      exercise_id: row.exercise_id,
      exercise: row.exercise,
      target_reps: row.target_reps,
      rest_seconds: row.rest_seconds,
      sets: row.sets.map(toLoggerSet),
      previous: previous[row.exercise_id] ?? [],
    }));

    const durationSeconds = completed
      ? (new Date(typedSession.completed_at!).getTime() -
          new Date(typedSession.started_at).getTime()) /
        1000
      : undefined;

    return (
      <AppShell active={completed ? "historico" : "sessao"}>
        <WorkoutLogger
          sessionId={id}
          title={title}
          startedAt={typedSession.started_at}
          initialExercises={initialExercises}
          library={(library ?? []) as Exercise[]}
          mode={completed ? "history" : "live"}
          initialDurationSeconds={durationSeconds}
        />
      </AppShell>
    );
  }

  return (
    <AppShell active="historico">
      <SessionSummary session={typedSession} title={title} exercises={sessionExercises} />
    </AppShell>
  );
}

const SET_TYPE_LABEL: Record<string, string> = { warmup: "A", dropset: "D", failure: "F" };

/** Hevy-style numbering: warm-up/drop/failure get a letter, normal sets are counted. */
function setLabels(sets: SessionSet[]) {
  let n = 0;
  return sets.map((set) => ({
    set,
    label: SET_TYPE_LABEL[set.set_type] ?? String(++n),
  }));
}

function describeSet(set: SessionSet): string {
  const parts: string[] = [];
  if (set.weight_kg != null) parts.push(`${formatWeight(Number(set.weight_kg))} kg`);
  if (set.reps != null) parts.push(`${set.reps} reps`);
  if (set.distance_km != null) parts.push(`${formatWeight(Number(set.distance_km))} km`);
  if (set.duration_seconds != null) parts.push(formatClock(set.duration_seconds));
  return parts.length ? parts.join(" × ") : "—";
}

function SessionSummary({
  session,
  title,
  exercises,
}: {
  session: WorkoutSession;
  title: string;
  exercises: SessionExercise[];
}) {
  const duration =
    (new Date(session.completed_at!).getTime() - new Date(session.started_at).getTime()) / 1000;
  const sets = exercises.flatMap((e) => e.sets);
  const volume = sets.reduce((sum, s) => sum + (Number(s.weight_kg) || 0) * (s.reps ?? 0), 0);
  const date = new Date(session.started_at).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <>
      <section className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[13px] text-muted-foreground">Treino concluído · {date}</p>
            <h2 className="font-medium">{title}</h2>
            <div className="mt-1 flex flex-wrap items-baseline gap-x-3 text-[13px] text-foreground-secondary">
              <SessionDurationEditor sessionId={session.id} durationSeconds={duration} />
              <span>{sets.length} séries</span>
              <span>{formatWeight(volume)} kg</span>
            </div>
            <p className="text-[12px] text-muted-foreground">Toque na duração para editar rápido.</p>
          </div>
          <Button
            render={<Link href={`/sessao/${session.id}?editar=1`} />}
            variant="outline"
            size="sm"
            className="squircle shrink-0"
          >
            <PencilIcon />
            Editar
          </Button>
        </div>
      </section>

      <section className="flex flex-col gap-5">
        {exercises.map((item) => (
          <div key={item.id} className="flex flex-col gap-1.5">
            <h3 className="text-sm">{item.exercise.name}</h3>
            {item.notes ? (
              <p className="text-[13px] text-muted-foreground">{item.notes}</p>
            ) : null}
            <ul className="flex flex-col gap-0.5">
              {setLabels(item.sets).map(({ set, label }) => (
                <li key={set.id} className="flex gap-3 font-mono text-[13px] text-muted-foreground">
                  <span className="w-4 text-foreground-tertiary">{label}</span>
                  <span className="text-foreground-secondary">{describeSet(set)}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <div className="flex flex-wrap gap-2">
        <Button render={<Link href="/historico" />} variant="outline" className="squircle">
          Voltar ao histórico
        </Button>
        <Button render={<Link href="/treinos" />} className="squircle">
          Treinos
        </Button>
      </div>
    </>
  );
}
