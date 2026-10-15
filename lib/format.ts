export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${sec}` : `${m}:${sec}`;
}

export function formatWeight(kg: number): string {
  return kg.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
}

/** Reps target for a given set: "15/12/8" → 15, 12, 8 (last value repeats); "10" → 10; ranges → null. */
export function targetRepsAt(target: string | null, index: number): number | null {
  if (!target) return null;
  const parts = target.split("/").map((p) => p.trim());
  const part = parts[Math.min(index, parts.length - 1)];
  return /^\d+$/.test(part) ? Number(part) : null;
}

export function parseNumber(value: string): number | null {
  const normalized = value.trim().replace(",", ".");
  if (!normalized) return null;
  const n = Number(normalized);
  return Number.isFinite(n) && n >= 0 ? n : null;
}
