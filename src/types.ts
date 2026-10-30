export type Goal =
  | 'WEIGHT_LOSS'
  | 'MUSCLE_BUILDING'
  | 'LEAN_TONING'
  | 'STRENGTH_ENDURANCE'
  | 'GENERAL_FITNESS';

export type MuscleGroup =
  | 'WARMUP'
  | 'CHEST'
  | 'BACK'
  | 'SHOULDERS'
  | 'BICEPS'
  | 'TRICEPS'
  | 'LEGS'
  | 'CORE'
  | 'CARDIO';

export type FitnessLevel = 'STARTER' | 'INTERMEDIATE' | 'ADVANCED';

export type JointLimitation = 'KNEES' | 'LOWER_BACK' | 'SHOULDERS' | 'WRISTS';

export interface GoalPrescription {
  goal: Goal;
  sets: number;
  reps: string;
  restSec: number;
  recommended: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  muscle: MuscleGroup;
  secondaryMuscles: string[];
  equipment: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  media?: string;
  steps: string[];
  mistakes: string[];
  jointStress?: JointLimitation[];
  prescriptions: Record<Goal, { sets: number; reps: string; restSec: number }>;
}

export interface UserProfile {
  id: string;
  name: string;
  goal: Goal;
  level: FitnessLevel;
  heightCm: number;
  weightKg: number;
  age: number;
  gender?: string;
  limitations: JointLimitation[];
  daysPerWeek: number;
  onboardingDone: boolean;
}

export interface SetLog {
  setNumber: number;
  reps: number;
  weightKg: number;
  completed: boolean;
}

export interface ExerciseSessionLog {
  exerciseId: string;
  exerciseName: string;
  muscle: MuscleGroup;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'FINISHED';
  sets: SetLog[];
}

export interface WorkoutSession {
  id: string;
  date: string;
  source: 'FREE' | 'PLAN';
  planDayIndex?: number;
  startedAt: number; // timestamp
  finishedAt?: number;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'DONE';
  totalSec: number;
  estCalories: number;
  exercises: ExerciseSessionLog[];
  currentExerciseIndex: number;
}

export interface MealItem {
  id: string;
  type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  text: string;
  time: string;
}

export interface DailyEntry {
  date: string; // YYYY-MM-DD
  waterGlasses: number;
  targetWaterGlasses: number;
  meals: MealItem[];
  streakDays: number;
  workoutDone: boolean;
}

export interface BodyMeasurement {
  id: string;
  date: string;
  weightKg: number;
  chest: number;
  waist: number;
  hips: number;
  arm: number;
  thigh: number;
}

export interface PlanDay {
  dayIndex: number; // 1 to 30
  muscle: MuscleGroup | 'REST';
  isRest: boolean;
  exerciseIds: string[];
  completed?: boolean;
}

export interface TodayRoutine {
  type: 'CUSTOM' | 'PLAN';
  title: string;
  muscle?: MuscleGroup;
  planDayIndex?: number;
  exerciseIds: string[];
  updatedAt?: number;
}

export interface AppSettings {
  waterIntervalMin: number; // 10, 15, 20
  units: 'kg' | 'lb';
  soundEnabled: boolean;
  simulatedWaterTest: boolean;
}

export interface AdminImageConfig {
  frontCharacter: string;
  backCharacter: string;
  exerciseOverrides: Record<string, string>;
}

export type UserRole = 'ADMIN' | 'MEMBER';
export type MembershipTier = 'FREE' | 'PRO_MONTHLY' | 'VIP_ANNUAL';

export interface AppUser {
  id: string;
  username: string;
  password: string; // Plaintext or hashed for prototype admin viewing
  role: UserRole;
  membershipTier: MembershipTier;
  isPaid: boolean;
  createdAt: string;
  workoutCount: number;
}

export interface SubscriptionSettings {
  paywallEnabled: boolean;
  monthlyPrice: number; // e.g. 9.99
  annualPrice: number; // e.g. 79.99
  freeWorkoutLimit: number; // e.g. 3 workouts free before paywall
}


