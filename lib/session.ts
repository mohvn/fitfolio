import type { SessionSet } from "@/lib/types";

export function toLoggerSet(set: SessionSet) {
  return {
    id: set.id,
    set_index: set.set_index,
    weight: set.weight_kg != null ? String(set.weight_kg) : "",
    reps: set.reps != null ? String(set.reps) : "",
    completed: set.completed,
  };
}
