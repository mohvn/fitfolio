import { parseCsv } from "@/lib/csv";
import { HEVY_TRANSLATIONS } from "@/lib/hevy-translations";

export type ImportSet = {
  set_type: string;
  weight_kg: number | null;
  reps: number | null;
  distance_km: number | null;
  duration_seconds: number | null;
};

export type ImportExercise = {
  name: string;
  muscle_group: string | null;
  notes: string | null;
  sets: ImportSet[];
};

export type ImportWorkout = {
  key: string;
  title: string;
  description: string | null;
  started_at: string;
  completed_at: string;
  exercises: ImportExercise[];
};

function translateHevy(hevyName: string): { name: string; muscle_group: string | null } {
  const hit = HEVY_TRANSLATIONS[hevyName];
  return hit ? { name: hit.name, muscle_group: hit.muscle_group } : { name: hevyName, muscle_group: null };
}

const MONTHS: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};

/** "Oct 14, 2026, 5:04 PM" in the browser's local timezone → ISO string. */
function parseHevyDate(value: string): string {
  const match = /^(\w{3}) (\d{1,2}), (\d{4}), (\d{1,2}):(\d{2}) (AM|PM)$/.exec(value.trim());
  const month = match ? MONTHS[match[1]] : undefined;
  if (!match || month === undefined) throw new Error(`Data em formato inesperado: "${value}"`);

  let hours = Number(match[4]) % 12;
  if (match[6] === "PM") hours += 12;

  return new Date(Number(match[3]), month, Number(match[2]), hours, Number(match[5])).toISOString();
}

function num(value: string | undefined): number | null {
  if (value == null || value.trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

const REQUIRED = ["title", "start_time", "end_time", "exercise_title", "set_type", "weight_kg", "reps"];

export function parseHevyCsv(text: string) {
  const [header, ...rows] = parseCsv(text);
  if (!header) throw new Error("Arquivo vazio.");

  const col = Object.fromEntries(header.map((name, i) => [name.trim(), i]));
  const missing = REQUIRED.filter((name) => col[name] === undefined);
  if (missing.length) {
    throw new Error(`Não parece um export do Hevy (faltam colunas: ${missing.join(", ")}).`);
  }

  const get = (row: string[], name: string) => (col[name] === undefined ? "" : row[col[name]] ?? "");
  const workouts = new Map<string, ImportWorkout>();
  const lastExercise = new Map<string, string>();

  for (const row of rows) {
    const title = get(row, "title").trim() || "Treino";
    const startRaw = get(row, "start_time");
    const id = `${startRaw}|${title}`;

    let workout = workouts.get(id);
    if (!workout) {
      const started_at = parseHevyDate(startRaw);
      workout = {
        key: `hevy:${started_at}:${title}`,
        title,
        description: get(row, "description").trim() || null,
        started_at,
        completed_at: parseHevyDate(get(row, "end_time")),
        exercises: [],
      };
      workouts.set(id, workout);
    }

    const hevyName = get(row, "exercise_title").trim();
    if (lastExercise.get(id) !== hevyName) {
      const translated = translateHevy(hevyName);
      workout.exercises.push({
        name: translated.name,
        muscle_group: translated.muscle_group,
        notes: get(row, "exercise_notes").trim() || null,
        sets: [],
      });
      lastExercise.set(id, hevyName);
    }

    workout.exercises.at(-1)!.sets.push({
      set_type: get(row, "set_type").trim() || "normal",
      weight_kg: num(get(row, "weight_kg")),
      reps: num(get(row, "reps")),
      distance_km: num(get(row, "distance_km")),
      duration_seconds: num(get(row, "duration_seconds")),
    });
  }

  const list = [...workouts.values()];
  const hevyNames = new Set(rows.map((r) => get(r, "exercise_title").trim()));

  return {
    workouts: list,
    stats: {
      workouts: list.length,
      sets: rows.length,
      exercises: new Set(list.flatMap((w) => w.exercises.map((e) => e.name))).size,
      mapped: [...hevyNames].filter((n) => HEVY_TRANSLATIONS[n]).length,
      first: list.reduce((min, w) => (w.started_at < min ? w.started_at : min), list[0]?.started_at ?? ""),
      last: list.reduce((max, w) => (w.started_at > max ? w.started_at : max), list[0]?.started_at ?? ""),
    },
  };
}
