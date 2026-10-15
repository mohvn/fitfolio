export const MUSCLE_GROUPS = [
  "Peito",
  "Costas",
  "Ombro",
  "Trapézio",
  "Bíceps",
  "Tríceps",
  "Antebraço",
  "Abdômen",
  "Lombar",
  "Quadríceps",
  "Posterior de coxa",
  "Glúteo",
  "Adutores",
  "Abdutores",
  "Panturrilha",
  "Cardio",
  "Outros",
] as const;

export const NO_MUSCLE_GROUP = "Sem grupo";

/** Groups exercises by muscle, ordered like MUSCLE_GROUPS, with unknown groups last. */
export function groupByMuscle<T extends { muscle_group: string | null }>(
  items: T[],
): [string, T[]][] {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const key = item.muscle_group || NO_MUSCLE_GROUP;
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }
  const rank = (g: string) => {
    const i = (MUSCLE_GROUPS as readonly string[]).indexOf(g);
    return i === -1 ? (g === NO_MUSCLE_GROUP ? 1000 : 500) : i;
  };
  return [...groups].sort(([a], [b]) => rank(a) - rank(b) || a.localeCompare(b, "pt-BR"));
}
