import { parseCsv } from "@/lib/csv";

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

/**
 * Hevy exercise → name used in the FitFolio routines. Only unambiguous matches;
 * everything else keeps the Hevy name.
 */
const ALIASES: Record<string, { name: string; muscle_group: string }> = {
  "Lat Pulldown (Cable)": { name: "Puxada Aberta", muscle_group: "Costas" },
  "Lat Pulldown - Close Grip (Cable)": { name: "Puxada Triângulo", muscle_group: "Costas" },
  "Dumbbell Row": { name: "Remada Unilateral (Serrote)", muscle_group: "Costas" },
  "Seated Cable Row - V Grip (Cable)": { name: "Remada Baixa no Cabo", muscle_group: "Costas" },
  "Face Pull": { name: "Face Pull", muscle_group: "Ombro" },
  "Shrug (Dumbbell)": { name: "Encolhimento com Halteres", muscle_group: "Trapézio" },
  "Preacher Curl (Machine)": { name: "Rosca Scott", muscle_group: "Bíceps" },
  "Hammer Curl (Dumbbell)": { name: "Rosca Martelo", muscle_group: "Bíceps" },
  "Bicep Curl (Cable)": { name: "Rosca Direta na Polia", muscle_group: "Bíceps" },
  "Rear Delt Reverse Fly (Machine)": { name: "Peck Deck Invertido", muscle_group: "Ombro" },
  "Butterfly (Pec Deck)": { name: "Crucifixo (Peck Deck)", muscle_group: "Peito" },
  "Chest Press (Machine)": { name: "Supino Máquina", muscle_group: "Peito" },
  "Incline Chest Press (Machine)": { name: "Supino Inclinado Máquina", muscle_group: "Peito" },
  "Shoulder Press (Dumbbell)": { name: "Desenvolvimento Militar (Halteres)", muscle_group: "Ombro" },
  "Lateral Raise (Dumbbell)": { name: "Elevação Lateral", muscle_group: "Ombro" },
  "Single Arm Lateral Raise (Cable)": { name: "Elevação Lateral (Cabo)", muscle_group: "Ombro" },
  "Triceps Rope Pushdown": { name: "Tríceps Corda", muscle_group: "Tríceps" },
  "Skullcrusher (Dumbbell)": { name: "Tríceps Testa com Halteres", muscle_group: "Tríceps" },
  "Leg Extension (Machine)": { name: "Extensora", muscle_group: "Quadríceps" },
  "Leg Press (Machine)": { name: "Leg Press", muscle_group: "Quadríceps" },
  "Squat (Barbell)": { name: "Agachamento", muscle_group: "Quadríceps" },
  "Lying Leg Curl (Machine)": { name: "Mesa Flexora", muscle_group: "Posterior de coxa" },
  "Seated Leg Curl (Machine)": { name: "Cadeira Flexora", muscle_group: "Posterior de coxa" },
  "Hip Thrust (Barbell)": { name: "Hip Thrust", muscle_group: "Glúteo" },
  "Standing Calf Raise (Machine)": { name: "Panturrilha em Pé", muscle_group: "Panturrilha" },
};

/** Primary muscle group for Hevy exercises that keep their original name. */
const MUSCLE_GROUPS: Record<string, string> = {
  "Air Bike": "Cardio",
  "Arnold Press (Dumbbell)": "Ombro",
  "Back Extension (Hyperextension)": "Lombar",
  "Band Pullaparts": "Ombro",
  "Behind the Back Curl (Cable)": "Bíceps",
  "Behind the Back Wrist Curl (Barbell)": "Antebraço",
  "Belt Squat (Machine)": "Quadríceps",
  "Bench Press (Barbell)": "Peito",
  "Bench Press (Cable)": "Peito",
  "Bent Over Row (Barbell)": "Costas",
  "Bicep Curl (Barbell)": "Bíceps",
  "Bicep Curl (Dumbbell)": "Bíceps",
  "Cable Crunch": "Abdômen",
  "Cable Fly Crossovers": "Peito",
  "Chest Dip (Assisted)": "Peito",
  "Chest Fly (Dumbbell)": "Peito",
  "Chest Fly (Machine)": "Peito",
  "Chin Up (Assisted)": "Costas",
  "Concentration Curl": "Bíceps",
  "Cross Body Hammer Curl": "Bíceps",
  Crunch: "Abdômen",
  "Crunch (Machine)": "Abdômen",
  "Crunch (Weighted)": "Abdômen",
  "Dead Hang": "Antebraço",
  "Deadlift (Barbell)": "Lombar",
  "Decline Bench Press (Barbell)": "Peito",
  "Diamond Push Up": "Tríceps",
  "EZ Bar Biceps Curl": "Bíceps",
  "Encolhimento De Ombros": "Trapézio",
  "Extensão De Tríceps Testa": "Tríceps",
  "Flexor em Pé (Máquina)": "Posterior de coxa",
  "Front Raise (Cable)": "Ombro",
  "Front Raise (Dumbbell)": "Ombro",
  "Full Squat": "Quadríceps",
  "Hack Squat (Machine)": "Quadríceps",
  "Hammer Curl (Cable)": "Bíceps",
  "Hip Abduction (Machine)": "Abdutores",
  "Hip Adduction (Machine)": "Adutores",
  "Incline Bench Press (Barbell)": "Peito",
  "Incline Bench Press (Smith Machine)": "Peito",
  "Iso-Lateral Chest Press (Machine)": "Peito",
  "Iso-Lateral Low Row": "Costas",
  "Iso-Lateral Row (Machine)": "Costas",
  "L-Sit Hold": "Abdômen",
  "Landmine Row": "Costas",
  "Lat Pulldown (Machine)": "Costas",
  "Lateral Raise (Machine)": "Ombro",
  "Leg Press Horizontal (Machine)": "Quadríceps",
  "Low Cable Fly Crossovers": "Peito",
  "Overhead Press (Dumbbell)": "Ombro",
  "Overhead Triceps Extension (Cable)": "Tríceps",
  Pilates: "Outros",
  Plank: "Abdômen",
  "Preacher Curl (Barbell)": "Bíceps",
  "Pull Up (Assisted)": "Costas",
  "Pullover (Dumbbell)": "Costas",
  "Push Up": "Peito",
  "Rear Delt Reverse Fly (Cable)": "Ombro",
  "Reverse Curl (Cable)": "Antebraço",
  "Reverse Grip Lat Pulldown (Cable)": "Costas",
  "Rope Straight Arm Pulldown": "Costas",
  Running: "Cardio",
  "Seated Cable Row - Bar Grip": "Costas",
  "Seated Cable Row - Bar Wide Grip": "Costas",
  "Seated Chest Flys (Cable)": "Peito",
  "Seated Dip Machine": "Tríceps",
  "Seated Incline Curl (Dumbbell)": "Bíceps",
  "Seated Lateral Raise (Dumbbell)": "Ombro",
  "Seated Overhead Press (Barbell)": "Ombro",
  "Seated Overhead Press (Dumbbell)": "Ombro",
  "Seated Palms Up Wrist Curl": "Antebraço",
  "Seated Row (Machine)": "Costas",
  "Seated Shoulder Press (Machine)": "Ombro",
  "Seated Triceps Press": "Tríceps",
  "Seated Wrist Extension (Barbell)": "Antebraço",
  "Shoulder Press (Machine Plates)": "Ombro",
  "Single Arm Cable Row": "Costas",
  "Single Arm Curl (Cable)": "Bíceps",
  "Single Arm Lat Pulldown": "Costas",
  "Single Arm Tricep Extension (Dumbbell)": "Tríceps",
  "Single Arm Triceps Pushdown (Cable)": "Tríceps",
  "Single Leg Standing Calf Raise (Machine)": "Panturrilha",
  Spinning: "Cardio",
  "Squat (Bodyweight)": "Quadríceps",
  "Squat (Smith Machine)": "Quadríceps",
  "Standing Calf Raise": "Panturrilha",
  "Standing Leg Curls": "Posterior de coxa",
  "Straight Arm Lat Pulldown (Cable)": "Costas",
  "Straight Leg Deadlift": "Posterior de coxa",
  Stretching: "Outros",
  Treadmill: "Cardio",
  "Triceps Dip (Assisted)": "Tríceps",
  "Triceps Extension (Barbell)": "Tríceps",
  "Triceps Extension (Cable)": "Tríceps",
  "Triceps Extension (Dumbbell)": "Tríceps",
  "Triceps Extension (Machine)": "Tríceps",
  "Triceps Kickback (Dumbbell)": "Tríceps",
  "Triceps Pushdown": "Tríceps",
  "Upright Row (Barbell)": "Ombro",
  Walking: "Cardio",
};

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
      const alias = ALIASES[hevyName];
      workout.exercises.push({
        name: alias?.name ?? hevyName,
        muscle_group: alias?.muscle_group ?? MUSCLE_GROUPS[hevyName] ?? null,
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
      mapped: [...hevyNames].filter((n) => ALIASES[n]).length,
      first: list.reduce((min, w) => (w.started_at < min ? w.started_at : min), list[0]?.started_at ?? ""),
      last: list.reduce((max, w) => (w.started_at > max ? w.started_at : max), list[0]?.started_at ?? ""),
    },
  };
}
