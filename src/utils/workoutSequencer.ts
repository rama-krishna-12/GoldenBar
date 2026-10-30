import { MuscleGroup, Exercise, TodayRoutine } from '../types';

export const MUSCLE_SEQUENCE_ORDER: Record<MuscleGroup, number> = {
  WARMUP: 1,
  CARDIO: 2,
  CHEST: 3,
  BACK: 4,
  LEGS: 5,
  SHOULDERS: 6,
  BICEPS: 7,
  TRICEPS: 8,
  CORE: 9,
};

/**
 * Sorts exercise IDs into the most effective and safe workout sequence:
 * 1. Warm-up & Flexibility (WARMUP)
 * 2. Cardio & Metabolic Conditioning (CARDIO)
 * 3. Compound & Strength Hypertrophy (CHEST, BACK, LEGS, SHOULDERS, ARMS)
 * 4. Core & Abs (CORE)
 */
export const sortExercisesForWorkout = (
  exerciseIds: string[],
  allExercises: Exercise[]
): string[] => {
  const map = new Map(allExercises.map((e) => [e.id, e]));

  // Deduplicate and sort
  const unique = Array.from(new Set(exerciseIds));

  return unique.sort((idA, idB) => {
    const exA = map.get(idA);
    const exB = map.get(idB);
    if (!exA || !exB) return 0;

    const orderA = MUSCLE_SEQUENCE_ORDER[exA.muscle] ?? 5;
    const orderB = MUSCLE_SEQUENCE_ORDER[exB.muscle] ?? 5;

    if (orderA !== orderB) {
      return orderA - orderB;
    }
    // Keep secondary alphabetical sorting within same category
    return exA.name.localeCompare(exB.name);
  });
};

/**
 * Generates an intuitive title based on selected exercises across multiple modules.
 * Examples:
 * - "Cardio + Chest Workout (4 Exercises)"
 * - "Cardio & Conditioning"
 * - "Full Body Custom Routine (6 Exercises)"
 */
export const generateRoutineTitle = (
  exerciseIds: string[],
  allExercises: Exercise[]
): string => {
  const map = new Map(allExercises.map((e) => [e.id, e]));
  const muscles = new Set<MuscleGroup>();

  exerciseIds.forEach((id) => {
    const ex = map.get(id);
    if (ex) muscles.add(ex.muscle);
  });

  const muscleList = Array.from(muscles);

  if (muscleList.length === 0) {
    return "Today's Custom Workout";
  }

  const hasCardio = muscles.has('CARDIO');
  const strengthMuscles = muscleList.filter((m) => m !== 'CARDIO' && m !== 'WARMUP' && m !== 'CORE');

  if (hasCardio && strengthMuscles.length > 0) {
    const strengthNames = strengthMuscles
      .map((m) => m.charAt(0) + m.slice(1).toLowerCase())
      .join(' & ');
    return `Cardio + ${strengthNames} (${exerciseIds.length} Exercises)`;
  }

  if (hasCardio && muscleList.length === 1) {
    return 'Cardio & Conditioning Routine';
  }

  if (strengthMuscles.length === 1) {
    const name = strengthMuscles[0].charAt(0) + strengthMuscles[0].slice(1).toLowerCase();
    return `${name} Workout (${exerciseIds.length} Exercises)`;
  }

  if (strengthMuscles.length > 1) {
    return `Mixed Strength & Conditioning (${exerciseIds.length} Exercises)`;
  }

  if (muscles.has('CORE')) {
    return `Core & Abs Workout (${exerciseIds.length} Exercises)`;
  }

  return `Custom Workout (${exerciseIds.length} Exercises)`;
};
