import {
  UserProfile,
  PlanDay,
  WorkoutSession,
  DailyEntry,
  BodyMeasurement,
  AppSettings,
  AppUser,
  SubscriptionSettings,
} from '../types';

export const DEFAULT_USER_PROFILE: UserProfile = {
  id: '',
  name: '',
  goal: 'MUSCLE_BUILDING',
  level: 'INTERMEDIATE',
  heightCm: 175,
  weightKg: 70,
  age: 25,
  gender: 'Male',
  limitations: [],
  daysPerWeek: 4,
  onboardingDone: false, // Clean new app: not completed until user sets up
};

// 30-Day Rotation Blueprint
const MUSCLE_ROTATION = [
  'CHEST',
  'BACK',
  'REST',
  'SHOULDERS',
  'LEGS',
  'CORE',
  'REST',
] as const;

export const DEFAULT_PLAN_DAYS: PlanDay[] = Array.from({ length: 30 }, (_, i) => {
  const dayIndex = i + 1;
  const rotationIdx = (dayIndex - 1) % MUSCLE_ROTATION.length;
  const muscle = MUSCLE_ROTATION[rotationIdx];
  const isRest = muscle === 'REST';

  let exerciseIds: string[] = [];
  if (muscle === 'CHEST') {
    exerciseIds = [
      'ex_barbell_bench_press',
      'ex_incline_dumbbell_press',
      'ex_dumbbell_flyes',
      'ex_pushups_strict',
    ];
  } else if (muscle === 'BACK') {
    exerciseIds = [
      'ex_lat_pulldown',
      'ex_barbell_bent_row',
      'ex_seated_cable_row',
      'ex_single_arm_dumbbell_row',
    ];
  } else if (muscle === 'SHOULDERS') {
    exerciseIds = [
      'ex_dumbbell_overhead_press',
      'ex_dumbbell_lateral_raise',
      'ex_bent_over_reverse_fly',
      'ex_arnold_press',
    ];
  } else if (muscle === 'LEGS') {
    exerciseIds = [
      'ex_barbell_back_squat',
      'ex_romanian_deadlift',
      'ex_walking_lunges',
      'ex_standing_calf_raise',
    ];
  } else if (muscle === 'CORE') {
    exerciseIds = [
      'ex_hanging_leg_raise',
      'ex_plank_hold',
      'ex_russian_twists',
      'ex_cable_woodchopper',
    ];
  }

  return {
    dayIndex,
    muscle: muscle as any,
    isRest,
    exerciseIds,
    completed: false, // Fresh app: 0 completed days
  };
});

// Clean new app: 0 initial history/sessions
export const DEFAULT_PAST_SESSIONS: WorkoutSession[] = [];

// Clean new app: 0 initial body progress measurements
export const DEFAULT_BODY_MEASUREMENTS: BodyMeasurement[] = [];

// Clean new app: Fresh daily entry for today
export const DEFAULT_DAILY_ENTRY: DailyEntry = {
  date: new Date().toISOString().split('T')[0],
  waterGlasses: 0,
  targetWaterGlasses: 8,
  meals: [],
  streakDays: 0,
  workoutDone: false,
};

export const DEFAULT_APP_SETTINGS: AppSettings = {
  waterIntervalMin: 15,
  units: 'kg',
  soundEnabled: true,
  simulatedWaterTest: false,
};

// 1 Primary Admin User (All registered members are normal users)
export const DEFAULT_USERS: AppUser[] = [
  {
    id: 'usr_admin',
    username: 'admin',
    password: 'admin123',
    role: 'ADMIN',
    membershipTier: 'VIP_ANNUAL',
    isPaid: true,
    createdAt: '2026-10-01',
    workoutCount: 0,
  },
];

export const DEFAULT_SUBSCRIPTION_SETTINGS: SubscriptionSettings = {
  paywallEnabled: false,
  monthlyPrice: 9.99,
  annualPrice: 79.99,
  freeWorkoutLimit: 3,
};
