"use client";

import { useState, useTransition } from "react";
import { updateSessionDuration } from "@/app/actions/sessions";
import {
  DurationFields,
  durationParts,
  partsToSeconds,
} from "@/components/session/duration-fields";
import { Button } from "@/components/ui/button";
import { formatClock } from "@/lib/format";

export function SessionDurationEditor({
  sessionId,
  durationSeconds,
}: {
  sessionId: string;
  durationSeconds: number;
}) {
  const initial = durationParts(durationSeconds);
  const [hours, setHours] = useState(initial.hours);
  const [minutes, setMinutes] = useState(initial.minutes);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!editing) {
    return (
      <button
        type="button"
        className="font-mono text-foreground-secondary underline-offset-4 hover:underline"
        onClick={() => {
          const parts = durationParts(durationSeconds);
          setHours(parts.hours);
          setMinutes(parts.minutes);
          setEditing(true);
        }}
      >
        {formatClock(durationSeconds)}
      </button>
    );
  }

  return (
    <div className="flex max-w-xs flex-col gap-3">
      <DurationFields
        idPrefix="summary"
        hours={hours}
        minutes={minutes}
        onHoursChange={setHours}
        onMinutesChange={setMinutes}
      />
      {error ? <p className="text-[13px] text-destructive">{error}</p> : null}
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          className="squircle"
          loading={pending}
          disabled={partsToSeconds(hours, minutes) < 60}
          onClick={() =>
            startTransition(async () => {
              const result = await updateSessionDuration(sessionId, partsToSeconds(hours, minutes));
              if (result.error) {
                setError(result.error);
                return;
              }
              setEditing(false);
              setError(null);
            })
          }
        >
          Salvar duração
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="squircle"
          disabled={pending}
          onClick={() => {
            setEditing(false);
            setError(null);
          }}
        >
          Cancelar
        </Button>
      </div>
    </div>
  );
}
