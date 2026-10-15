-- Translate Hevy English exercise names to Portuguese and backfill muscle_group.
-- Safe to re-run. When the PT name already exists for the same user, merges FKs into it.

create temporary table hevy_pt (
  en text primary key,
  pt text not null,
  muscle_group text not null
) on commit drop;

insert into hevy_pt (en, pt, muscle_group) values
  ('Air Bike', 'Bicicleta air bike', 'Cardio'),
  ('Arnold Press (Dumbbell)', 'Desenvolvimento Arnold (Halteres)', 'Ombro'),
  ('Back Extension (Hyperextension)', 'Extensão lombar', 'Lombar'),
  ('Band Pullaparts', 'Abertura com elástico', 'Ombro'),
  ('Behind the Back Curl (Cable)', 'Rosca atrás das costas (Cabo)', 'Bíceps'),
  ('Behind the Back Wrist Curl (Barbell)', 'Rosca de punho atrás das costas (Barra)', 'Antebraço'),
  ('Belt Squat (Machine)', 'Agachamento com cinto (Máquina)', 'Quadríceps'),
  ('Bench Press (Barbell)', 'Supino reto (Barra)', 'Peito'),
  ('Bench Press (Cable)', 'Supino no cabo', 'Peito'),
  ('Bent Over Row (Barbell)', 'Remada curvada (Barra)', 'Costas'),
  ('Bicep Curl (Barbell)', 'Rosca direta (Barra)', 'Bíceps'),
  ('Bicep Curl (Cable)', 'Rosca Direta na Polia', 'Bíceps'),
  ('Bicep Curl (Dumbbell)', 'Rosca direta (Halteres)', 'Bíceps'),
  ('Butterfly (Pec Deck)', 'Crucifixo (Peck Deck)', 'Peito'),
  ('Cable Crunch', 'Abdominal na polia', 'Abdômen'),
  ('Cable Fly Crossovers', 'Cross Over Alto', 'Peito'),
  ('Chest Dip (Assisted)', 'Paralela assistida (Peito)', 'Peito'),
  ('Chest Fly (Dumbbell)', 'Crucifixo (Halteres)', 'Peito'),
  ('Chest Fly (Machine)', 'Crucifixo (Máquina)', 'Peito'),
  ('Chest Press (Machine)', 'Supino Máquina', 'Peito'),
  ('Chin Up (Assisted)', 'Barra fixa supinada assistida', 'Costas'),
  ('Concentration Curl', 'Rosca concentrada', 'Bíceps'),
  ('Cross Body Hammer Curl', 'Rosca martelo cruzada', 'Bíceps'),
  ('Crunch', 'Abdominal crunch', 'Abdômen'),
  ('Crunch (Machine)', 'Abdominal (Máquina)', 'Abdômen'),
  ('Crunch (Weighted)', 'Abdominal com peso', 'Abdômen'),
  ('Dead Hang', 'Isometria na barra', 'Antebraço'),
  ('Deadlift (Barbell)', 'Levantamento terra (Barra)', 'Lombar'),
  ('Decline Bench Press (Barbell)', 'Supino declinado (Barra)', 'Peito'),
  ('Diamond Push Up', 'Flexão diamante', 'Tríceps'),
  ('Dumbbell Row', 'Remada Unilateral (Serrote)', 'Costas'),
  ('Encolhimento De Ombros', 'Encolhimento de ombros', 'Trapézio'),
  ('Extensão De Tríceps Testa', 'Tríceps testa', 'Tríceps'),
  ('EZ Bar Biceps Curl', 'Rosca direta (Barra W)', 'Bíceps'),
  ('Face Pull', 'Face Pull', 'Ombro'),
  ('Flexor em Pé (Máquina)', 'Flexora em pé (Máquina)', 'Posterior de coxa'),
  ('Front Raise (Cable)', 'Elevação frontal (Cabo)', 'Ombro'),
  ('Front Raise (Dumbbell)', 'Elevação frontal (Halteres)', 'Ombro'),
  ('Full Squat', 'Agachamento completo', 'Quadríceps'),
  ('Hack Squat (Machine)', 'Agachamento hack (Máquina)', 'Quadríceps'),
  ('Hammer Curl (Cable)', 'Rosca martelo (Cabo)', 'Bíceps'),
  ('Hammer Curl (Dumbbell)', 'Rosca Martelo', 'Bíceps'),
  ('Hip Abduction (Machine)', 'Abdutora', 'Abdutores'),
  ('Hip Adduction (Machine)', 'Adutora', 'Adutores'),
  ('Hip Thrust (Barbell)', 'Hip Thrust', 'Glúteo'),
  ('Incline Bench Press (Barbell)', 'Supino inclinado (Barra)', 'Peito'),
  ('Incline Bench Press (Smith Machine)', 'Supino inclinado (Smith)', 'Peito'),
  ('Incline Chest Press (Machine)', 'Supino Inclinado Máquina', 'Peito'),
  ('Iso-Lateral Chest Press (Machine)', 'Supino iso-lateral (Máquina)', 'Peito'),
  ('Iso-Lateral Low Row', 'Remada baixa iso-lateral', 'Costas'),
  ('Iso-Lateral Row (Machine)', 'Remada iso-lateral (Máquina)', 'Costas'),
  ('L-Sit Hold', 'L-sit (isometria)', 'Abdômen'),
  ('Landmine Row', 'Remada landmine', 'Costas'),
  ('Lat Pulldown - Close Grip (Cable)', 'Puxada Triângulo', 'Costas'),
  ('Lat Pulldown (Cable)', 'Puxada Aberta', 'Costas'),
  ('Lat Pulldown (Machine)', 'Puxada (Máquina)', 'Costas'),
  ('Lateral Raise (Dumbbell)', 'Elevação Lateral', 'Ombro'),
  ('Lateral Raise (Machine)', 'Elevação lateral (Máquina)', 'Ombro'),
  ('Leg Extension (Machine)', 'Extensora', 'Quadríceps'),
  ('Leg Press (Machine)', 'Leg Press', 'Quadríceps'),
  ('Leg Press Horizontal (Machine)', 'Leg press horizontal', 'Quadríceps'),
  ('Low Cable Fly Crossovers', 'Crucifixo baixo no cabo', 'Peito'),
  ('Lying Leg Curl (Machine)', 'Mesa Flexora', 'Posterior de coxa'),
  ('Overhead Press (Dumbbell)', 'Desenvolvimento (Halteres)', 'Ombro'),
  ('Overhead Triceps Extension (Cable)', 'Tríceps overhead (Cabo)', 'Tríceps'),
  ('Pilates', 'Pilates', 'Outros'),
  ('Plank', 'Prancha', 'Abdômen'),
  ('Preacher Curl (Barbell)', 'Rosca Scott (Barra)', 'Bíceps'),
  ('Preacher Curl (Machine)', 'Rosca Scott', 'Bíceps'),
  ('Pull Up (Assisted)', 'Barra fixa assistida', 'Costas'),
  ('Pullover (Dumbbell)', 'Pullover (Halteres)', 'Costas'),
  ('Push Up', 'Flexão de braço', 'Peito'),
  ('Rear Delt Reverse Fly (Cable)', 'Crucifixo invertido (Cabo)', 'Ombro'),
  ('Rear Delt Reverse Fly (Machine)', 'Peck Deck Invertido', 'Ombro'),
  ('Reverse Curl (Cable)', 'Rosca inversa (Cabo)', 'Antebraço'),
  ('Reverse Grip Lat Pulldown (Cable)', 'Puxada pegada supinada', 'Costas'),
  ('Rope Straight Arm Pulldown', 'Pullover na Polia', 'Costas'),
  ('Running', 'Corrida', 'Cardio'),
  ('Seated Cable Row - Bar Grip', 'Remada Pronada', 'Costas'),
  ('Seated Cable Row - Bar Wide Grip', 'Remada baixa (barra aberta)', 'Costas'),
  ('Seated Cable Row - V Grip (Cable)', 'Remada Baixa no Cabo', 'Costas'),
  ('Seated Chest Flys (Cable)', 'Crucifixo sentado (Cabo)', 'Peito'),
  ('Seated Dip Machine', 'Paralela sentada (Máquina)', 'Tríceps'),
  ('Seated Incline Curl (Dumbbell)', 'Rosca inclinada (Halteres)', 'Bíceps'),
  ('Seated Lateral Raise (Dumbbell)', 'Elevação lateral sentada (Halteres)', 'Ombro'),
  ('Seated Leg Curl (Machine)', 'Cadeira Flexora', 'Posterior de coxa'),
  ('Seated Overhead Press (Barbell)', 'Desenvolvimento sentado (Barra)', 'Ombro'),
  ('Seated Overhead Press (Dumbbell)', 'Desenvolvimento sentado (Halteres)', 'Ombro'),
  ('Seated Palms Up Wrist Curl', 'Rosca de punho sentada', 'Antebraço'),
  ('Seated Row (Machine)', 'Remada Cavalinho ou Máquina', 'Costas'),
  ('Seated Shoulder Press (Machine)', 'Desenvolvimento sentado (Máquina)', 'Ombro'),
  ('Seated Triceps Press', 'Tríceps francês sentado', 'Tríceps'),
  ('Seated Wrist Extension (Barbell)', 'Extensão de punho sentada (Barra)', 'Antebraço'),
  ('Shoulder Press (Dumbbell)', 'Desenvolvimento Militar (Halteres)', 'Ombro'),
  ('Shoulder Press (Machine Plates)', 'Desenvolvimento (Máquina de anilhas)', 'Ombro'),
  ('Shrug (Dumbbell)', 'Encolhimento com Halteres', 'Trapézio'),
  ('Single Arm Cable Row', 'Remada unilateral no cabo', 'Costas'),
  ('Single Arm Curl (Cable)', 'Rosca unilateral (Cabo)', 'Bíceps'),
  ('Single Arm Lat Pulldown', 'Puxada unilateral', 'Costas'),
  ('Single Arm Lateral Raise (Cable)', 'Elevação Lateral (Cabo)', 'Ombro'),
  ('Single Arm Tricep Extension (Dumbbell)', 'Tríceps unilateral (Halteres)', 'Tríceps'),
  ('Single Arm Triceps Pushdown (Cable)', 'Tríceps unilateral na polia', 'Tríceps'),
  ('Single Leg Standing Calf Raise (Machine)', 'Panturrilha unilateral em pé', 'Panturrilha'),
  ('Skullcrusher (Dumbbell)', 'Tríceps Testa com Halteres', 'Tríceps'),
  ('Spinning', 'Spinning', 'Cardio'),
  ('Squat (Barbell)', 'Agachamento', 'Quadríceps'),
  ('Squat (Bodyweight)', 'Agachamento (peso corporal)', 'Quadríceps'),
  ('Squat (Smith Machine)', 'Agachamento (Smith)', 'Quadríceps'),
  ('Standing Calf Raise', 'Panturrilha em Pé', 'Panturrilha'),
  ('Standing Calf Raise (Machine)', 'Panturrilha em Pé', 'Panturrilha'),
  ('Standing Leg Curls', 'Flexora em pé', 'Posterior de coxa'),
  ('Straight Arm Lat Pulldown (Cable)', 'Pullover na Polia', 'Costas'),
  ('Straight Leg Deadlift', 'Stiff', 'Posterior de coxa'),
  ('Stretching', 'Alongamento', 'Outros'),
  ('Treadmill', 'Esteira', 'Cardio'),
  ('Triceps Dip (Assisted)', 'Paralela assistida (Tríceps)', 'Tríceps'),
  ('Triceps Extension (Barbell)', 'Tríceps testa (Barra)', 'Tríceps'),
  ('Triceps Extension (Cable)', 'Tríceps Pushdown (Barra V)', 'Tríceps'),
  ('Triceps Extension (Dumbbell)', 'Tríceps testa (Halteres)', 'Tríceps'),
  ('Triceps Extension (Machine)', 'Tríceps (Máquina)', 'Tríceps'),
  ('Triceps Kickback (Dumbbell)', 'Tríceps coice (Halteres)', 'Tríceps'),
  ('Triceps Pushdown', 'Tríceps pushdown', 'Tríceps'),
  ('Triceps Rope Pushdown', 'Tríceps Corda', 'Tríceps'),
  ('Upright Row (Barbell)', 'Remada alta (Barra)', 'Ombro'),
  ('Walking', 'Caminhada', 'Cardio');

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
