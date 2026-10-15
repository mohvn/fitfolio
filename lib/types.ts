export type Exercise = {
  id: string;
  user_id: string;
  name: string;
  muscle_group: string | null;
  notes: string | null;
  created_at: string;
};

export type Routine = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type RoutineExercise = {
  id: string;
  routine_id: string;
  exercise_id: string;
  position: number;
  target_sets: number;
  target_reps: string;
  rest_seconds: number | null;
  notes: string | null;
  exercise?: Exercise;
};

export type RoutineWithExercises = Routine & {
  routine_exercises: RoutineExercise[];
};

export type WorkoutSession = {
  id: string;
  user_id: string;
  routine_id: string | null;
  started_at: string;
  completed_at: string | null;
  notes: string | null;
  title: string | null;
  external_key: string | null;
};

export type SessionSet = {
  id: string;
  session_id: string;
  exercise_id: string;
  session_exercise_id: string | null;
  routine_exercise_id: string | null;
  set_index: number;
  reps: number | null;
  weight_kg: number | null;
  set_type: string;
  duration_seconds: number | null;
  distance_km: number | null;
  completed: boolean;
  completed_at: string | null;
};

export type SessionExercise = {
  id: string;
  session_id: string;
  exercise_id: string;
  position: number;
  target_reps: string | null;
  rest_seconds: number | null;
  notes: string | null;
  exercise: Exercise;
  sets: SessionSet[];
};

export type PreviousSet = {
  reps: number | null;
  weight_kg: number | null;
};

export type PreviousMap = Record<string, PreviousSet[]>;
