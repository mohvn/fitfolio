"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function durationParts(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  return { hours: Math.floor(s / 3600), minutes: Math.floor((s % 3600) / 60) };
}

export function partsToSeconds(hours: number, minutes: number) {
  return Math.max(0, hours) * 3600 + Math.max(0, minutes) * 60;
}

export function DurationFields({
  hours,
  minutes,
  onHoursChange,
  onMinutesChange,
  idPrefix = "duration",
}: {
  hours: number;
  minutes: number;
  onHoursChange: (value: number) => void;
  onMinutesChange: (value: number) => void;
  idPrefix?: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${idPrefix}-h`}>Horas</Label>
        <Input
          id={`${idPrefix}-h`}
          type="number"
          min={0}
          max={24}
          inputMode="numeric"
          className="squircle font-mono"
          value={hours}
          onChange={(e) => onHoursChange(Math.max(0, Number(e.target.value) || 0))}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${idPrefix}-m`}>Minutos</Label>
        <Input
          id={`${idPrefix}-m`}
          type="number"
          min={0}
          max={59}
          inputMode="numeric"
          className="squircle font-mono"
          value={minutes}
          onChange={(e) => onMinutesChange(Math.min(59, Math.max(0, Number(e.target.value) || 0)))}
        />
      </div>
    </div>
  );
}
