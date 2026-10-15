"use client";

import { formatClock } from "@/lib/format";
import { useNow } from "@/lib/use-now";

export function ElapsedTime({ startedAt }: { startedAt: string }) {
  const now = useNow();
  const start = new Date(startedAt).getTime();

  return (
    <span className="font-mono tabular-nums">
      {now === 0 ? "0:00" : formatClock((now - start) / 1000)}
    </span>
  );
}
