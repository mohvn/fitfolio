-- Rotinas semanais (Push A / Pull A / Legs / Push B / Pull B).
-- Rode no Supabase SQL Editor depois das migrations 001 e 002 e de criar sua conta no app.
-- Reutiliza exercícios com o mesmo nome; pula rotinas que já existem com o mesmo nome.

do $$
declare
  -- Preencha se houver mais de um usuário no projeto, ex.: 'voce@email.com'
  v_email text := null;
  v_rest int := 90;

  v_user uuid;
  v_routine uuid;
  v_exercise uuid;
  v_current text := '';
  v_skip boolean := false;
  r record;
begin
  if v_email is not null then
    select id into v_user from auth.users where lower(email) = lower(v_email);
  elsif (select count(*) from auth.users) = 1 then
    select id into v_user from auth.users;
  else
    raise exception 'Há % usuários; preencha v_email no topo do script.',
      (select count(*) from auth.users);
  end if;

  if v_user is null then
    raise exception 'Usuário não encontrado. Crie sua conta em /cadastro primeiro.';
  end if;

  for r in
    select * from (values
      (1, 'Push A', 'Segunda', 0, 'Supino Inclinado com Halteres', 'Peito', '15/12/8'),
      (1, 'Push A', 'Segunda', 1, 'Supino Máquina', 'Peito', '15/12/8'),
      (1, 'Push A', 'Segunda', 2, 'Paralela (Dips)', 'Peito', '15/12/8'),
      (1, 'Push A', 'Segunda', 3, 'Crucifixo (Peck Deck)', 'Peito', '15/12/8'),
      (1, 'Push A', 'Segunda', 4, 'Desenvolvimento Militar (Halteres)', 'Ombro', '15/12/8'),
      (1, 'Push A', 'Segunda', 5, 'Elevação Lateral', 'Ombro', '15/12/8'),
      (1, 'Push A', 'Segunda', 6, 'Tríceps Corda', 'Tríceps', '15/12/8'),
      (1, 'Push A', 'Segunda', 7, 'Tríceps Francês Unilateral na Polia', 'Tríceps', '15/12/8'),

      (2, 'Pull A', 'Terça', 0, 'Puxada Aberta', 'Costas', '15/12/8'),
      (2, 'Pull A', 'Terça', 1, 'Remada Pronada', 'Costas', '15/12/8'),
      (2, 'Pull A', 'Terça', 2, 'Remada Unilateral (Serrote)', 'Costas', '15/12/8'),
      (2, 'Pull A', 'Terça', 3, 'Pullover na Polia', 'Costas', '15/12/8'),
      (2, 'Pull A', 'Terça', 4, 'Face Pull', 'Ombro', '15/12/8'),
      (2, 'Pull A', 'Terça', 5, 'Encolhimento com Halteres', 'Trapézio', '15/12/8'),
      (2, 'Pull A', 'Terça', 6, 'Rosca Scott', 'Bíceps', '15/12/8'),
      (2, 'Pull A', 'Terça', 7, 'Rosca Alternada', 'Bíceps', '15/12/8'),

      (3, 'Legs', 'Quarta', 0, 'Agachamento', 'Quadríceps', '15/12/8'),
      (3, 'Legs', 'Quarta', 1, 'Leg Press', 'Quadríceps', '15/12/8'),
      (3, 'Legs', 'Quarta', 2, 'Extensora', 'Quadríceps', '15/12/8'),
      (3, 'Legs', 'Quarta', 3, 'Mesa Flexora', 'Posterior de coxa', '15/12/8'),
      (3, 'Legs', 'Quarta', 4, 'Cadeira Flexora', 'Posterior de coxa', '15/12/8'),
      (3, 'Legs', 'Quarta', 5, 'Hip Thrust', 'Glúteo', '15/12/8'),
      (3, 'Legs', 'Quarta', 6, 'Panturrilha em Pé', 'Panturrilha', '15/12/10'),
      (3, 'Legs', 'Quarta', 7, 'Panturrilha Sentada', 'Panturrilha', '15/12/10'),

      (4, 'Push B', 'Quinta', 0, 'Cross Over Alto', 'Peito', '15/12/8'),
      (4, 'Push B', 'Quinta', 1, 'Supino Inclinado Máquina', 'Peito', '15/12/8'),
      (4, 'Push B', 'Quinta', 2, 'Desenvolvimento Máquina ou Halteres (pegada neutra)', 'Ombro', '15/12/8'),
      (4, 'Push B', 'Quinta', 3, 'Elevação Lateral (Cabo)', 'Ombro', '15/12/8'),
      (4, 'Push B', 'Quinta', 4, 'Elevação Lateral Unilateral (Halter)', 'Ombro', '15/12/8'),
      (4, 'Push B', 'Quinta', 5, 'Tríceps Testa com Halteres', 'Tríceps', '15/12/8'),
      (4, 'Push B', 'Quinta', 6, 'Tríceps Pushdown (Barra V)', 'Tríceps', '15/12/8'),
      (4, 'Push B', 'Quinta', 7, 'Tríceps Coice na Polia', 'Tríceps', '15/12/8'),

      (5, 'Pull B', 'Sexta', 0, 'Puxada Triângulo', 'Costas', '15/12/8'),
      (5, 'Pull B', 'Sexta', 1, 'Remada Cavalinho ou Máquina', 'Costas', '15/12/8'),
      (5, 'Pull B', 'Sexta', 2, 'Remada Baixa no Cabo', 'Costas', '15/12/8'),
      (5, 'Pull B', 'Sexta', 3, 'Peck Deck Invertido', 'Ombro', '15/12/8'),
      (5, 'Pull B', 'Sexta', 4, 'Encolhimento na Barra ou Smith', 'Trapézio', '15/12/8'),
      (5, 'Pull B', 'Sexta', 5, 'Remada Alta no Cabo', 'Ombro', '15/12/8'),
      (5, 'Pull B', 'Sexta', 6, 'Rosca Martelo', 'Bíceps', '15/12/8'),
      (5, 'Pull B', 'Sexta', 7, 'Rosca Direta na Polia', 'Bíceps', '15/12/8')
    ) as t(routine_order, routine_name, routine_day, position, exercise_name, muscle_group, reps)
    order by routine_order, position
  loop
    if r.routine_name <> v_current then
      v_current := r.routine_name;
      select id into v_routine
        from public.routines
        where user_id = v_user and name = r.routine_name
        limit 1;

      v_skip := found;
      if v_skip then
        raise notice 'Rotina "%" já existe, pulando.', r.routine_name;
      else
        -- Older updated_at for later days so the list reads Segunda → Sexta.
        insert into public.routines (user_id, name, description, updated_at)
        values (v_user, r.routine_name, r.routine_day,
                now() - make_interval(secs => r.routine_order))
        returning id into v_routine;
      end if;
    end if;

    continue when v_skip;

    select id into v_exercise
      from public.exercises
      where user_id = v_user and lower(name) = lower(r.exercise_name)
      limit 1;

    if not found then
      insert into public.exercises (user_id, name, muscle_group)
      values (v_user, r.exercise_name, r.muscle_group)
      returning id into v_exercise;
    end if;

    insert into public.routine_exercises
      (routine_id, exercise_id, position, target_sets, target_reps, rest_seconds)
    values
      (v_routine, v_exercise, r.position,
       array_length(string_to_array(r.reps, '/'), 1), r.reps, v_rest);
  end loop;
end $$;
