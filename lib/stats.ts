import { NO_MUSCLE_GROUP } from "@/lib/muscles";

export const PERIODS = {
  "30d": { label: "30 dias", days: 30, bucket: "week" },
  "90d": { label: "90 dias", days: 90, bucket: "week" },
  "1a": { label: "1 ano", days: 365, bucket: "month" },
  tudo: { label: "Tudo", days: null, bucket: "month" },
} as const;

export type PeriodKey = keyof typeof PERIODS;

export function parsePeriod(value: string | string[] | undefined): PeriodKey {
  const v = Array.isArray(value) ? value[0] : value;
  return v && v in PERIODS ? (v as PeriodKey) : "90d";
}

/** [session_id, started_epoch, duration_s, exercise_id, set_type, weight_kg, reps, duration_s] */
export type StatsRow = [string, number, number, string, string, number | null, number | null, number | null];

export type ExerciseInfo = { id: string; name: string; muscle_group: string | null };

export type TimelinePoint = {
  label: string;
  treinos: number;
  duracao: number;
  volume: number;
  reps: number;
  series: number;
};

export type MusclePoint = {
  muscle: string;
  series: number;
  seriesSemana: number;
  volume: number;
  reps: number;
  share: number;
};

export type ExerciseRank = {
  id: string;
  name: string;
  muscle: string;
  treinos: number;
  series: number;
  reps: number;
  volume: number;
  cargaMax: number;
  e1rm: number;
};

export type ProgressPoint = { date: string; e1rm: number; carga: number };

export type Stats = {
  summary: {
    workouts: number;
    totalSeconds: number;
    avgSeconds: number;
    volume: number;
    sets: number;
    reps: number;
    weeks: number;
  };
  timeline: TimelinePoint[];
  muscles: MusclePoint[];
  ranking: ExerciseRank[];
  progress: Record<string, ProgressPoint[]>;
};

// Brazil has no DST since 2019, so a fixed offset keeps buckets in the user's local calendar.
const TZ_OFFSET_SECONDS = -3 * 3600;
const NO_GROUP = NO_MUSCLE_GROUP;

function localDate(epoch: number): Date {
  return new Date((epoch + TZ_OFFSET_SECONDS) * 1000);
}

function bucketOf(epoch: number, bucket: "week" | "month"): { key: string; label: string } {
  const d = localDate(epoch);
  if (bucket === "month") {
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit", timeZone: "UTC" });
    return { key, label };
  }
  const monday = new Date(d);
  monday.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  const key = monday.toISOString().slice(0, 10);
  const label = monday.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", timeZone: "UTC" });
  return { key, label };
}

/** Epley estimate; above 12 reps it overshoots, so cap the reps used. */
function estimate1rm(weight: number, reps: number): number {
  return reps <= 1 ? weight : weight * (1 + Math.min(reps, 12) / 30);
}

const round = (n: number, digits = 0) => {
  const f = 10 ** digits;
  return Math.round(n * f) / f;
};

export function computeStats(
  rows: StatsRow[],
  exercises: ExerciseInfo[],
  period: PeriodKey,
  now: number,
): Stats {
  const { bucket, days } = PERIODS[period];
  const info = new Map(exercises.map((e) => [e.id, e]));

  const sessions = new Map<string, { start: number; duration: number }>();
  const timeline = new Map<string, TimelinePoint & { sessions: Set<string>; seconds: number }>();
  const muscles = new Map<string, { series: number; volume: number; reps: number }>();
  const ranking = new Map<string, ExerciseRank & { sessions: Set<string> }>();
  const bestPerSession = new Map<string, Map<string, ProgressPoint & { start: number }>>();

  let sets = 0;
  let reps = 0;
  let volume = 0;

  for (const [sessionId, start, duration, exerciseId, setType, weightRaw, repsRaw] of rows) {
    if (!sessions.has(sessionId)) sessions.set(sessionId, { start, duration });

    const b = bucketOf(start, bucket);
    let point = timeline.get(b.key);
    if (!point) {
      point = { label: b.label, treinos: 0, duracao: 0, volume: 0, reps: 0, series: 0, sessions: new Set(), seconds: 0 };
      timeline.set(b.key, point);
    }
    if (!point.sessions.has(sessionId)) {
      point.sessions.add(sessionId);
      point.seconds += duration;
    }

    if (setType === "warmup") continue;

    const weight = weightRaw == null ? 0 : Number(weightRaw);
    const r = repsRaw ?? 0;
    const setVolume = weight * r;

    sets += 1;
    reps += r;
    volume += setVolume;
    point.series += 1;
    point.reps += r;
    point.volume += setVolume;

    const exercise = info.get(exerciseId);
    const muscle = exercise?.muscle_group || NO_GROUP;
    const m = muscles.get(muscle) ?? { series: 0, volume: 0, reps: 0 };
    m.series += 1;
    m.volume += setVolume;
    m.reps += r;
    muscles.set(muscle, m);

    let rank = ranking.get(exerciseId);
    if (!rank) {
      rank = {
        id: exerciseId,
        name: exercise?.name ?? "Exercício removido",
        muscle,
        treinos: 0,
        series: 0,
        reps: 0,
        volume: 0,
        cargaMax: 0,
        e1rm: 0,
        sessions: new Set(),
      };
      ranking.set(exerciseId, rank);
    }
    rank.sessions.add(sessionId);
    rank.series += 1;
    rank.reps += r;
    rank.volume += setVolume;
    rank.cargaMax = Math.max(rank.cargaMax, weight);

    if (weight > 0 && r > 0) {
      const e1rm = estimate1rm(weight, r);
      rank.e1rm = Math.max(rank.e1rm, e1rm);

      const perSession = bestPerSession.get(exerciseId) ?? new Map();
      const best = perSession.get(sessionId);
      if (!best || e1rm > best.e1rm) {
        perSession.set(sessionId, {
          start,
          date: localDate(start).toISOString().slice(0, 10),
          e1rm,
          carga: Math.max(weight, best?.carga ?? 0),
        });
      } else if (weight > best.carga) {
        best.carga = weight;
      }
      bestPerSession.set(exerciseId, perSession);
    }
  }

  const totalSeconds = [...sessions.values()].reduce((s, x) => s + x.duration, 0);
  const firstStart = Math.min(...[...sessions.values()].map((s) => s.start));

  if (sessions.size) {
    // Months are ≥ 28 days, so a 28-day step never skips one; duplicates collapse in the map.
    const step = bucket === "week" ? 7 * 86400 : 28 * 86400;
    const rangeStart = days ? now - days * 86400 : firstStart;
    for (let t = rangeStart; t <= now + step; t += step) {
      const b = bucketOf(Math.min(t, now), bucket);
      if (!timeline.has(b.key)) {
        timeline.set(b.key, {
          label: b.label, treinos: 0, duracao: 0, volume: 0, reps: 0, series: 0,
          sessions: new Set(), seconds: 0,
        });
      }
    }
  }
  const spanDays = days ?? (sessions.size ? (now - firstStart) / 86400 : 7);
  const weeks = Math.max(1, spanDays / 7);

  const muscleList = [...muscles].map(([muscle, m]) => ({
    muscle,
    series: m.series,
    seriesSemana: round(m.series / weeks, 1),
    volume: round(m.volume),
    reps: m.reps,
    share: sets ? round((m.series / sets) * 100, 1) : 0,
  }));
  muscleList.sort((a, b) => b.series - a.series);

  const rankList = [...ranking.values()].map(({ sessions: s, ...r }) => ({
    ...r,
    treinos: s.size,
    volume: round(r.volume),
    e1rm: round(r.e1rm, 1),
  }));
  rankList.sort((a, b) => b.series - a.series);

  const progress: Record<string, ProgressPoint[]> = {};
  for (const r of [...rankList].sort((a, b) => b.treinos - a.treinos).slice(0, 15)) {
    const points = [...(bestPerSession.get(r.id)?.values() ?? [])].sort((a, b) => a.start - b.start);
    if (points.length >= 2) {
      progress[r.id] = points.map(({ date, e1rm, carga }) => ({ date, e1rm: round(e1rm, 1), carga }));
    }
  }

  return {
    summary: {
      workouts: sessions.size,
      totalSeconds,
      avgSeconds: sessions.size ? totalSeconds / sessions.size : 0,
      volume: round(volume),
      sets,
      reps,
      weeks: round(weeks, 1),
    },
    timeline: [...timeline.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, { sessions: s, seconds, ...p }]) => ({
        ...p,
        treinos: s.size,
        duracao: s.size ? round(seconds / s.size / 60) : 0,
        volume: round(p.volume),
      })),
    muscles: muscleList,
    ranking: rankList,
    progress,
  };
}
