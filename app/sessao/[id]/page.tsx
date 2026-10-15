import Link from "next/link";
import { notFound } from "next/navigation";
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

export default async function SessaoPage({ params }: PageProps<"/sessao/[id]">) {
  const { id } = await params;
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

  if (typedSession.completed_at) {
    return (
      <AppShell active="sessao">
        <SessionSummary session={typedSession} title={title} exercises={sessionExercises} />
      </AppShell>
    );
  }

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

  return (
    <AppShell active="sessao">
      <WorkoutLogger
        sessionId={id}
        title={title}
        startedAt={typedSession.started_at}
        initialExercises={initialExercises}
        library={(library ?? []) as Exercise[]}
      />
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
      <section className="flex flex-col gap-1">
        <p className="text-[13px] text-muted-foreground">Treino concluído · {date}</p>
        <h2 className="font-medium">{title}</h2>
        <div className="mt-1 flex flex-wrap items-baseline gap-x-3 text-[13px] text-foreground-secondary">
          <SessionDurationEditor sessionId={session.id} durationSeconds={duration} />
          <span>{sets.length} séries</span>
          <span>{formatWeight(volume)} kg</span>
        </div>
        <p className="text-[12px] text-muted-foreground">Toque na duração para editar.</p>
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

      <Button render={<Link href="/treinos" />} className="squircle self-start">
        Voltar aos treinos
      </Button>
    </>
  );
}
