/**
 * One-shot generator: expands Hevy EN → PT map into lib/hevy.ts helpers + SQL migration.
 * Run: bun scripts/gen-exercise-translations.ts
 */
import { writeFileSync } from "fs";

/** Hevy title → { Portuguese name, muscle group } */
const T: Record<string, { name: string; muscle_group: string }> = {
  "Air Bike": { name: "Bicicleta air bike", muscle_group: "Cardio" },
  "Arnold Press (Dumbbell)": { name: "Desenvolvimento Arnold (Halteres)", muscle_group: "Ombro" },
  "Back Extension (Hyperextension)": { name: "Extensão lombar", muscle_group: "Lombar" },
  "Band Pullaparts": { name: "Abertura com elástico", muscle_group: "Ombro" },
  "Behind the Back Curl (Cable)": { name: "Rosca atrás das costas (Cabo)", muscle_group: "Bíceps" },
  "Behind the Back Wrist Curl (Barbell)": {
    name: "Rosca de punho atrás das costas (Barra)",
    muscle_group: "Antebraço",
  },
  "Belt Squat (Machine)": { name: "Agachamento com cinto (Máquina)", muscle_group: "Quadríceps" },
  "Bench Press (Barbell)": { name: "Supino reto (Barra)", muscle_group: "Peito" },
  "Bench Press (Cable)": { name: "Supino no cabo", muscle_group: "Peito" },
  "Bent Over Row (Barbell)": { name: "Remada curvada (Barra)", muscle_group: "Costas" },
  "Bicep Curl (Barbell)": { name: "Rosca direta (Barra)", muscle_group: "Bíceps" },
  "Bicep Curl (Cable)": { name: "Rosca Direta na Polia", muscle_group: "Bíceps" },
  "Bicep Curl (Dumbbell)": { name: "Rosca direta (Halteres)", muscle_group: "Bíceps" },
  "Butterfly (Pec Deck)": { name: "Crucifixo (Peck Deck)", muscle_group: "Peito" },
  "Cable Crunch": { name: "Abdominal na polia", muscle_group: "Abdômen" },
  "Cable Fly Crossovers": { name: "Cross Over Alto", muscle_group: "Peito" },
  "Chest Dip (Assisted)": { name: "Paralela assistida (Peito)", muscle_group: "Peito" },
  "Chest Fly (Dumbbell)": { name: "Crucifixo (Halteres)", muscle_group: "Peito" },
  "Chest Fly (Machine)": { name: "Crucifixo (Máquina)", muscle_group: "Peito" },
  "Chest Press (Machine)": { name: "Supino Máquina", muscle_group: "Peito" },
  "Chin Up (Assisted)": { name: "Barra fixa supinada assistida", muscle_group: "Costas" },
  "Concentration Curl": { name: "Rosca concentrada", muscle_group: "Bíceps" },
  "Cross Body Hammer Curl": { name: "Rosca martelo cruzada", muscle_group: "Bíceps" },
  Crunch: { name: "Abdominal crunch", muscle_group: "Abdômen" },
  "Crunch (Machine)": { name: "Abdominal (Máquina)", muscle_group: "Abdômen" },
  "Crunch (Weighted)": { name: "Abdominal com peso", muscle_group: "Abdômen" },
  "Dead Hang": { name: "Isometria na barra", muscle_group: "Antebraço" },
  "Deadlift (Barbell)": { name: "Levantamento terra (Barra)", muscle_group: "Lombar" },
  "Decline Bench Press (Barbell)": { name: "Supino declinado (Barra)", muscle_group: "Peito" },
  "Diamond Push Up": { name: "Flexão diamante", muscle_group: "Tríceps" },
  "Dumbbell Row": { name: "Remada Unilateral (Serrote)", muscle_group: "Costas" },
  "EZ Bar Biceps Curl": { name: "Rosca direta (Barra W)", muscle_group: "Bíceps" },
  "Encolhimento De Ombros": { name: "Encolhimento de ombros", muscle_group: "Trapézio" },
  "Extensão De Tríceps Testa": { name: "Tríceps testa", muscle_group: "Tríceps" },
  "Face Pull": { name: "Face Pull", muscle_group: "Ombro" },
  "Flexor em Pé (Máquina)": { name: "Flexora em pé (Máquina)", muscle_group: "Posterior de coxa" },
  "Front Raise (Cable)": { name: "Elevação frontal (Cabo)", muscle_group: "Ombro" },
  "Front Raise (Dumbbell)": { name: "Elevação frontal (Halteres)", muscle_group: "Ombro" },
  "Full Squat": { name: "Agachamento completo", muscle_group: "Quadríceps" },
  "Hack Squat (Machine)": { name: "Agachamento hack (Máquina)", muscle_group: "Quadríceps" },
  "Hammer Curl (Cable)": { name: "Rosca martelo (Cabo)", muscle_group: "Bíceps" },
  "Hammer Curl (Dumbbell)": { name: "Rosca Martelo", muscle_group: "Bíceps" },
  "Hip Abduction (Machine)": { name: "Abdutora", muscle_group: "Abdutores" },
  "Hip Adduction (Machine)": { name: "Adutora", muscle_group: "Adutores" },
  "Hip Thrust (Barbell)": { name: "Hip Thrust", muscle_group: "Glúteo" },
  "Incline Bench Press (Barbell)": { name: "Supino Inclinado com Halteres", muscle_group: "Peito" },
  // Barbell incline kept distinct from dumbbell routine name:
  // override below after checking — actually Hevy "Incline Bench Press (Barbell)" ≠ Halteres.
  "Incline Bench Press (Smith Machine)": { name: "Supino inclinado (Smith)", muscle_group: "Peito" },
  "Incline Chest Press (Machine)": { name: "Supino Inclinado Máquina", muscle_group: "Peito" },
  "Iso-Lateral Chest Press (Machine)": { name: "Supino iso-lateral (Máquina)", muscle_group: "Peito" },
  "Iso-Lateral Low Row": { name: "Remada baixa iso-lateral", muscle_group: "Costas" },
  "Iso-Lateral Row (Machine)": { name: "Remada iso-lateral (Máquina)", muscle_group: "Costas" },
  "L-Sit Hold": { name: "L-sit (isometria)", muscle_group: "Abdômen" },
  "Landmine Row": { name: "Remada landmine", muscle_group: "Costas" },
  "Lat Pulldown (Cable)": { name: "Puxada Aberta", muscle_group: "Costas" },
  "Lat Pulldown (Machine)": { name: "Puxada (Máquina)", muscle_group: "Costas" },
  "Lat Pulldown - Close Grip (Cable)": { name: "Puxada Triângulo", muscle_group: "Costas" },
  "Lateral Raise (Dumbbell)": { name: "Elevação Lateral", muscle_group: "Ombro" },
  "Lateral Raise (Machine)": { name: "Elevação lateral (Máquina)", muscle_group: "Ombro" },
  "Leg Extension (Machine)": { name: "Extensora", muscle_group: "Quadríceps" },
  "Leg Press (Machine)": { name: "Leg Press", muscle_group: "Quadríceps" },
  "Leg Press Horizontal (Machine)": { name: "Leg press horizontal", muscle_group: "Quadríceps" },
  "Low Cable Fly Crossovers": { name: "Crucifixo baixo no cabo", muscle_group: "Peito" },
  "Lying Leg Curl (Machine)": { name: "Mesa Flexora", muscle_group: "Posterior de coxa" },
  "Overhead Press (Dumbbell)": { name: "Desenvolvimento (Halteres)", muscle_group: "Ombro" },
  "Overhead Triceps Extension (Cable)": { name: "Tríceps overhead (Cabo)", muscle_group: "Tríceps" },
  Pilates: { name: "Pilates", muscle_group: "Outros" },
  Plank: { name: "Prancha", muscle_group: "Abdômen" },
  "Preacher Curl (Barbell)": { name: "Rosca Scott (Barra)", muscle_group: "Bíceps" },
  "Preacher Curl (Machine)": { name: "Rosca Scott", muscle_group: "Bíceps" },
  "Pull Up (Assisted)": { name: "Barra fixa assistida", muscle_group: "Costas" },
  "Pullover (Dumbbell)": { name: "Pullover (Halteres)", muscle_group: "Costas" },
  "Push Up": { name: "Flexão de braço", muscle_group: "Peito" },
  "Rear Delt Reverse Fly (Cable)": { name: "Crucifixo invertido (Cabo)", muscle_group: "Ombro" },
  "Rear Delt Reverse Fly (Machine)": { name: "Peck Deck Invertido", muscle_group: "Ombro" },
  "Reverse Curl (Cable)": { name: "Rosca inversa (Cabo)", muscle_group: "Antebraço" },
  "Reverse Grip Lat Pulldown (Cable)": { name: "Puxada pegada supinada", muscle_group: "Costas" },
  "Rope Straight Arm Pulldown": { name: "Pullover na Polia", muscle_group: "Costas" },
  Running: { name: "Corrida", muscle_group: "Cardio" },
  "Seated Cable Row - Bar Grip": { name: "Remada Pronada", muscle_group: "Costas" },
  "Seated Cable Row - Bar Wide Grip": { name: "Remada baixa (barra aberta)", muscle_group: "Costas" },
  "Seated Cable Row - V Grip (Cable)": { name: "Remada Baixa no Cabo", muscle_group: "Costas" },
  "Seated Chest Flys (Cable)": { name: "Crucifixo sentado (Cabo)", muscle_group: "Peito" },
  "Seated Dip Machine": { name: "Paralela sentada (Máquina)", muscle_group: "Tríceps" },
  "Seated Incline Curl (Dumbbell)": { name: "Rosca inclinada (Halteres)", muscle_group: "Bíceps" },
  "Seated Lateral Raise (Dumbbell)": {
    name: "Elevação lateral sentada (Halteres)",
    muscle_group: "Ombro",
  },
  "Seated Leg Curl (Machine)": { name: "Cadeira Flexora", muscle_group: "Posterior de coxa" },
  "Seated Overhead Press (Barbell)": { name: "Desenvolvimento sentado (Barra)", muscle_group: "Ombro" },
  "Seated Overhead Press (Dumbbell)": {
    name: "Desenvolvimento sentado (Halteres)",
    muscle_group: "Ombro",
  },
  "Seated Palms Up Wrist Curl": { name: "Rosca de punho sentada", muscle_group: "Antebraço" },
  "Seated Row (Machine)": { name: "Remada Cavalinho ou Máquina", muscle_group: "Costas" },
  "Seated Shoulder Press (Machine)": { name: "Desenvolvimento sentado (Máquina)", muscle_group: "Ombro" },
  "Seated Triceps Press": { name: "Tríceps francês sentado", muscle_group: "Tríceps" },
  "Seated Wrist Extension (Barbell)": {
    name: "Extensão de punho sentada (Barra)",
    muscle_group: "Antebraço",
  },
  "Shoulder Press (Dumbbell)": { name: "Desenvolvimento Militar (Halteres)", muscle_group: "Ombro" },
  "Shoulder Press (Machine Plates)": {
    name: "Desenvolvimento (Máquina de anilhas)",
    muscle_group: "Ombro",
  },
  "Shrug (Dumbbell)": { name: "Encolhimento com Halteres", muscle_group: "Trapézio" },
  "Single Arm Cable Row": { name: "Remada unilateral no cabo", muscle_group: "Costas" },
  "Single Arm Curl (Cable)": { name: "Rosca unilateral (Cabo)", muscle_group: "Bíceps" },
  "Single Arm Lat Pulldown": { name: "Puxada unilateral", muscle_group: "Costas" },
  "Single Arm Lateral Raise (Cable)": { name: "Elevação Lateral (Cabo)", muscle_group: "Ombro" },
  "Single Arm Tricep Extension (Dumbbell)": {
    name: "Tríceps unilateral (Halteres)",
    muscle_group: "Tríceps",
  },
  "Single Arm Triceps Pushdown (Cable)": {
    name: "Tríceps unilateral na polia",
    muscle_group: "Tríceps",
  },
  "Single Leg Standing Calf Raise (Machine)": {
    name: "Panturrilha unilateral em pé",
    muscle_group: "Panturrilha",
  },
  "Skullcrusher (Dumbbell)": { name: "Tríceps Testa com Halteres", muscle_group: "Tríceps" },
  Spinning: { name: "Spinning", muscle_group: "Cardio" },
  "Squat (Barbell)": { name: "Agachamento", muscle_group: "Quadríceps" },
  "Squat (Bodyweight)": { name: "Agachamento (peso corporal)", muscle_group: "Quadríceps" },
  "Squat (Smith Machine)": { name: "Agachamento (Smith)", muscle_group: "Quadríceps" },
  "Standing Calf Raise": { name: "Panturrilha em Pé", muscle_group: "Panturrilha" },
  "Standing Calf Raise (Machine)": { name: "Panturrilha em Pé", muscle_group: "Panturrilha" },
  "Standing Leg Curls": { name: "Flexora em pé", muscle_group: "Posterior de coxa" },
  "Straight Arm Lat Pulldown (Cable)": { name: "Pullover na Polia", muscle_group: "Costas" },
  "Straight Leg Deadlift": { name: "Stiff", muscle_group: "Posterior de coxa" },
  Stretching: { name: "Alongamento", muscle_group: "Outros" },
  Treadmill: { name: "Esteira", muscle_group: "Cardio" },
  "Triceps Dip (Assisted)": { name: "Paralela assistida (Tríceps)", muscle_group: "Tríceps" },
  "Triceps Extension (Barbell)": { name: "Tríceps testa (Barra)", muscle_group: "Tríceps" },
  "Triceps Extension (Cable)": { name: "Tríceps Pushdown (Barra V)", muscle_group: "Tríceps" },
  "Triceps Extension (Dumbbell)": { name: "Tríceps testa (Halteres)", muscle_group: "Tríceps" },
  "Triceps Extension (Machine)": { name: "Tríceps (Máquina)", muscle_group: "Tríceps" },
  "Triceps Kickback (Dumbbell)": { name: "Tríceps coice (Halteres)", muscle_group: "Tríceps" },
  "Triceps Pushdown": { name: "Tríceps pushdown", muscle_group: "Tríceps" },
  "Triceps Rope Pushdown": { name: "Tríceps Corda", muscle_group: "Tríceps" },
  "Upright Row (Barbell)": { name: "Remada alta (Barra)", muscle_group: "Ombro" },
  Walking: { name: "Caminhada", muscle_group: "Cardio" },
};

// Fix incline barbell — should not collide with "Supino Inclinado com Halteres"
T["Incline Bench Press (Barbell)"] = {
  name: "Supino inclinado (Barra)",
  muscle_group: "Peito",
};

const q = (s: string) => `'${s.replace(/'/g, "''")}'`;
const entries = Object.entries(T).sort(([a], [b]) => a.localeCompare(b));

const tsMap = entries
  .map(
    ([en, { name, muscle_group }]) =>
      `  ${JSON.stringify(en)}: { name: ${JSON.stringify(name)}, muscle_group: ${JSON.stringify(muscle_group)} },`,
  )
  .join("\n");

const hevySnippet = `/**
 * Hevy exercise title → Portuguese library name + muscle group.
 * Used on import and kept as the source of truth for EN→PT renames.
 */
export const HEVY_TRANSLATIONS: Record<string, { name: string; muscle_group: string }> = {
${tsMap}
};
`;

writeFileSync("lib/hevy-translations.ts", hevySnippet);

const values = entries.map(([en, { name, muscle_group }]) => `  (${q(en)}, ${q(name)}, ${q(muscle_group)})`).join(",\n");

const sql = `-- Translate Hevy English exercise names to Portuguese and backfill muscle_group.
-- Safe to re-run. When the PT name already exists for the same user, merges FKs into it.

create temporary table hevy_pt (
  en text primary key,
  pt text not null,
  muscle_group text not null
) on commit drop;

insert into hevy_pt (en, pt, muscle_group) values
${values};

-- 1) Rename when the Portuguese name is free for that user
update public.exercises e
set
  name = m.pt,
  muscle_group = coalesce(e.muscle_group, m.muscle_group)
from hevy_pt m
where lower(e.name) = lower(m.en)
  and not exists (
    select 1 from public.exercises x
    where x.user_id = e.user_id
      and lower(x.name) = lower(m.pt)
      and x.id <> e.id
  );

-- 2) Merge into existing Portuguese exercise (history / routines keep pointing to one id)
do $$
declare
  r record;
  v_target uuid;
begin
  for r in
    select e.id as src_id, e.user_id, m.pt, m.muscle_group
    from public.exercises e
    join hevy_pt m on lower(e.name) = lower(m.en)
  loop
    select id into v_target
    from public.exercises
    where user_id = r.user_id and lower(name) = lower(r.pt) and id <> r.src_id
    limit 1;

    if v_target is null then
      continue;
    end if;

    update public.session_sets set exercise_id = v_target where exercise_id = r.src_id;
    update public.session_exercises set exercise_id = v_target where exercise_id = r.src_id;

    -- Drop routine links that would duplicate the same exercise in the same routine
    delete from public.routine_exercises re
    where re.exercise_id = r.src_id
      and exists (
        select 1 from public.routine_exercises other
        where other.routine_id = re.routine_id and other.exercise_id = v_target
      );

    update public.routine_exercises set exercise_id = v_target where exercise_id = r.src_id;

    update public.exercises
    set muscle_group = coalesce(muscle_group, r.muscle_group)
    where id = v_target;

    delete from public.exercises where id = r.src_id;
  end loop;
end $$;

-- 3) Catch any leftover English names that only needed a rename after merges
update public.exercises e
set
  name = m.pt,
  muscle_group = coalesce(e.muscle_group, m.muscle_group)
from hevy_pt m
where lower(e.name) = lower(m.en);

-- Sanity: remaining English Hevy titles (should be empty)
select e.name
from public.exercises e
join hevy_pt m on lower(e.name) = lower(m.en)
order by e.name;
`;

writeFileSync("supabase/migrations/006_translate_exercises_pt.sql", sql);
console.log(`wrote ${entries.length} translations`);
