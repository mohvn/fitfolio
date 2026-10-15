"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  addSessionExercise,
  addSessionSet,
  discardSession,
  finishSession,
  moveSessionExercise,
  removeSessionExercise,
  removeSessionSet,
  updateSessionExerciseRest,
  updateSessionSet,
} from "@/app/actions/sessions";
import { AddExerciseDialog } from "@/components/session/add-exercise-dialog";
import {
  DurationFields,
  durationParts,
  partsToSeconds,
} from "@/components/session/duration-fields";
import { ElapsedTime } from "@/components/session/elapsed-time";
import {
  ExerciseBlock,
  type LoggerExercise,
  type LoggerSet,
} from "@/components/session/exercise-block";
import { RestTimer, type RestState } from "@/components/session/rest-timer";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPopup,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatWeight, parseNumber, targetRepsAt } from "@/lib/format";
import { toLoggerSet } from "@/lib/session";
import { restEndingIn, useNow } from "@/lib/use-now";
import type { Exercise } from "@/lib/types";

const ease = [0.22, 1, 0.36, 1] as const;

export function WorkoutLogger({
  sessionId,
  title,
  startedAt,
  initialExercises,
  library,
}: {
  sessionId: string;
  title: string;
  startedAt: string;
  initialExercises: LoggerExercise[];
  library: Exercise[];
}) {
  const [exercises, setExercises] = useState(initialExercises);
  const [rest, setRest] = useState<RestState>(null);
  const [error, setError] = useState<string | null>(null);
  const [addingExercise, setAddingExercise] = useState(false);
  const [addingSetFor, setAddingSetFor] = useState<string | null>(null);
  const [finishOpen, setFinishOpen] = useState(false);
  const [finishHours, setFinishHours] = useState(0);
  const [finishMinutes, setFinishMinutes] = useState(0);
  const [finishing, startFinish] = useTransition();
  const [discarding, startDiscard] = useTransition();
  const now = useNow();
  const elapsedSeconds =
    now > 0
      ? Math.max(60, Math.floor((now - new Date(startedAt).getTime()) / 1000))
      : 60;

  const report = useCallback((result: { error?: string } | void) => {
    if (result && "error" in result && result.error) setError(result.error);
  }, []);

  const patchSet = (exerciseId: string, setId: string, patch: Partial<LoggerSet>) => {
    setExercises((list) =>
      list.map((item) =>
        item.id !== exerciseId
          ? item
          : {
              ...item,
              sets: item.sets.map((set) => (set.id === setId ? { ...set, ...patch } : set)),
            },
      ),
    );
  };

  const persistSet = (set: LoggerSet) => {
    void updateSessionSet(set.id, {
      weight_kg: parseNumber(set.weight),
      reps: parseNumber(set.reps),
      completed: set.completed,
    }).then(report);
  };

  const toggleSet = (item: LoggerExercise, setId: string) => {
    const index = item.sets.findIndex((s) => s.id === setId);
    const set = item.sets[index];
    if (!set) return;

    const completing = !set.completed;
    const previous = item.previous[index];
    const fallbackReps = previous?.reps ?? targetRepsAt(item.target_reps, index);

    const next: LoggerSet = {
      ...set,
      completed: completing,
      weight:
        completing && !set.weight && previous?.weight_kg != null
          ? String(previous.weight_kg)
          : set.weight,
      reps: completing && !set.reps && fallbackReps != null ? String(fallbackReps) : set.reps,
    };

    patchSet(item.id, setId, next);
    persistSet(next);

    if (completing && item.rest_seconds) {
      setRest(restEndingIn(item.rest_seconds));
    }
  };

  const addSet = async (item: LoggerExercise) => {
    setAddingSetFor(item.id);
    const nextIndex = Math.max(0, ...item.sets.map((s) => s.set_index)) + 1;
    const result = await addSessionSet(item, nextIndex);
    setAddingSetFor(null);

    if ("error" in result) return setError(result.error);

    const last = item.sets.at(-1);
    const created = toLoggerSet(result.set);
    setExercises((list) =>
      list.map((e) =>
        e.id === item.id
          ? { ...e, sets: [...e.sets, { ...created, weight: last?.weight ?? "", reps: last?.reps ?? "" }] }
          : e,
      ),
    );
  };

  const removeSet = (item: LoggerExercise, setId: string) => {
    setExercises((list) =>
      list.map((e) => (e.id === item.id ? { ...e, sets: e.sets.filter((s) => s.id !== setId) } : e)),
    );
    void removeSessionSet(setId).then(report);
  };

  const removeExercise = (item: LoggerExercise) => {
    setExercises((list) => list.filter((e) => e.id !== item.id));
    void removeSessionExercise(item.id).then(report);
  };

  const moveExercise = (item: LoggerExercise, direction: "up" | "down") => {
    setExercises((list) => {
      const index = list.findIndex((e) => e.id === item.id);
      const swapIndex = direction === "up" ? index - 1 : index + 1;
      if (index < 0 || swapIndex < 0 || swapIndex >= list.length) return list;
      const next = [...list];
      [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
      return next;
    });
    void moveSessionExercise(sessionId, item.id, direction).then(report);
  };

  const changeRest = (item: LoggerExercise, seconds: number | null) => {
    setExercises((list) => list.map((e) => (e.id === item.id ? { ...e, rest_seconds: seconds } : e)));
    void updateSessionExerciseRest(item.id, seconds).then(report);
  };

  const addExercise = async (exercise: Exercise) => {
    setAddingExercise(true);
    const result = await addSessionExercise(sessionId, exercise.id, exercises.length);
    setAddingExercise(false);

    if ("error" in result) return setError(result.error);

    setExercises((list) => [
      ...list,
      {
        id: result.exercise.id,
        session_id: result.exercise.session_id,
        exercise_id: result.exercise.exercise_id,
        exercise: result.exercise.exercise,
        target_reps: result.exercise.target_reps,
        rest_seconds: result.exercise.rest_seconds,
        sets: result.exercise.sets.map(toLoggerSet),
        previous: result.previous,
      },
    ]);
  };

  const stats = useMemo(() => {
    let sets = 0;
    let volume = 0;
    for (const item of exercises) {
      for (const set of item.sets) {
        if (!set.completed) continue;
        sets += 1;
        volume += (parseNumber(set.weight) ?? 0) * (parseNumber(set.reps) ?? 0);
      }
    }
    return { sets, volume };
  }, [exercises]);

  return (
    <div className="flex flex-col gap-section pb-28">
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="truncate font-medium">{title}</h2>
          <p className="mt-1 flex flex-wrap gap-x-3 text-[13px] text-muted-foreground">
            <ElapsedTime startedAt={startedAt} />
            <span>{stats.sets} séries</span>
            <span>{formatWeight(stats.volume)} kg</span>
          </p>
        </div>
        <Dialog
          open={finishOpen}
          onOpenChange={(open) => {
            if (open) {
              const parts = durationParts(elapsedSeconds);
              setFinishHours(parts.hours);
              setFinishMinutes(parts.minutes);
            }
            setFinishOpen(open);
          }}
        >
          <DialogTrigger
            render={
              <Button className="squircle shrink-0" disabled={stats.sets === 0} loading={finishing} />
            }
          >
            Concluir
          </DialogTrigger>
          <DialogPopup className="squircle">
            <DialogHeader>
              <DialogTitle className="font-medium text-base">Concluir treino</DialogTitle>
              <DialogDescription>
                Confira a duração antes de salvar. O tempo começa no início da sessão.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3 px-4 pb-2">
              <DurationFields
                idPrefix="finish"
                hours={finishHours}
                minutes={finishMinutes}
                onHoursChange={setFinishHours}
                onMinutesChange={setFinishMinutes}
              />
            </div>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" className="squircle" />}>
                Continuar
              </DialogClose>
              <Button
                className="squircle"
                loading={finishing}
                disabled={partsToSeconds(finishHours, finishMinutes) < 60}
                onClick={() =>
                  startFinish(() =>
                    finishSession(sessionId, partsToSeconds(finishHours, finishMinutes)),
                  )
                }
              >
                Salvar treino
              </Button>
            </DialogFooter>
          </DialogPopup>
        </Dialog>
      </header>

      {error ? (
        <p className="-mt-6 text-[13px] text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {exercises.length === 0 ? (
        <p className="text-[13px] text-muted-foreground">
          Treino vazio. Adicione exercícios para começar a registrar séries.
        </p>
      ) : null}

      <AnimatePresence initial={false}>
        {exercises.map((item, index) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease }}
          >
            <ExerciseBlock
              item={item}
              index={index}
              total={exercises.length}
              addingSet={addingSetFor === item.id}
              onDraft={(setId, field, value) => patchSet(item.id, setId, { [field]: value })}
              onCommit={(setId) => {
                const set = item.sets.find((s) => s.id === setId);
                if (set) persistSet(set);
              }}
              onToggle={(setId) => toggleSet(item, setId)}
              onAddSet={() => void addSet(item)}
              onRemoveSet={(setId) => removeSet(item, setId)}
              onRemove={() => removeExercise(item)}
              onMove={(direction) => moveExercise(item, direction)}
              onRestChange={(seconds) => changeRest(item, seconds)}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="flex flex-col gap-2">
        <AddExerciseDialog library={library} pending={addingExercise} onPick={addExercise} />

        <Dialog>
          <DialogTrigger
            render={<Button variant="ghost" className="squircle w-full text-destructive" />}
          >
            Descartar treino
          </DialogTrigger>
          <DialogPopup className="squircle">
            <DialogHeader>
              <DialogTitle className="font-medium text-base">Descartar treino?</DialogTitle>
              <DialogDescription>
                Todas as séries registradas nesta sessão serão apagadas.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" className="squircle" />}>
                Continuar treinando
              </DialogClose>
              <Button
                variant="destructive"
                className="squircle"
                loading={discarding}
                onClick={() => startDiscard(() => discardSession(sessionId))}
              >
                Descartar
              </Button>
            </DialogFooter>
          </DialogPopup>
        </Dialog>
      </div>

      <RestTimer rest={rest} onChange={setRest} />
    </div>
  );
}
