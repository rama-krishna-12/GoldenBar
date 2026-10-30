import React, { useState, useEffect } from 'react';
import {
  Goal,
  MuscleGroup,
  UserProfile,
  PlanDay,
  WorkoutSession,
  DailyEntry,
  BodyMeasurement,
  AppSettings,
  Exercise,
  AdminImageConfig,
  AppUser,
  SubscriptionSettings,
  TodayRoutine,
} from './types';
import {
  DEFAULT_USER_PROFILE,
  DEFAULT_PLAN_DAYS,
  DEFAULT_DAILY_ENTRY,
  DEFAULT_BODY_MEASUREMENTS,
  DEFAULT_PAST_SESSIONS,
  DEFAULT_APP_SETTINGS,
  DEFAULT_USERS,
  DEFAULT_SUBSCRIPTION_SETTINGS,
} from './data/mockData';
import { EXERCISE_DATABASE, CHARACTER_IMAGE, CHARACTER_BACK_IMAGE } from './data/exercises';
import { PhoneFrame } from './components/PhoneFrame';
import { WaterReminderBanner } from './components/WaterReminderBanner';
import { OfflineIndicator } from './components/OfflineIndicator';
import { Crown, Sparkles, X } from 'lucide-react';

// Screens
import { AuthScreen } from './screens/AuthScreen';
import { AdminDashboardScreen } from './screens/AdminDashboardScreen';
import { HomeScreen } from './screens/HomeScreen';
import { ProfileSetupScreen } from './screens/ProfileSetupScreen';
import { GoalPickerScreen } from './screens/GoalPickerScreen';
import { MuscleTilesScreen } from './screens/MuscleTilesScreen';
import { ExerciseListScreen } from './screens/ExerciseListScreen';
import { ExerciseDetailScreen } from './screens/ExerciseDetailScreen';
import { ExerciseSessionScreen } from './screens/ExerciseSessionScreen';
import { WorkoutSummaryScreen } from './screens/WorkoutSummaryScreen';
import { PlansScreen } from './screens/PlansScreen';
import { DailyTrackerScreen } from './screens/DailyTrackerScreen';
import { ProgressScreen } from './screens/ProgressScreen';
import { ProfileScreen } from './screens/ProfileScreen';

export default function App() {
  // One-time fresh state reset for clean new app: GoldenBar
  if (typeof window !== 'undefined' && !localStorage.getItem('goldenbar_v1_init')) {
    localStorage.clear();
    localStorage.setItem('goldenbar_v1_init', 'true');
  }

  // User Authentication & Management
  const [allUsers, setAllUsers] = useState<AppUser[]>(() => {
    const saved = localStorage.getItem('goldenbar_all_users');
    return saved ? JSON.parse(saved) : DEFAULT_USERS;
  });

  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    const saved = localStorage.getItem('goldenbar_current_user');
    return saved ? JSON.parse(saved) : null; // Starts clean on Sign In screen
  });

  const [subscriptionSettings, setSubscriptionSettings] = useState<SubscriptionSettings>(() => {
    const saved = localStorage.getItem('goldenbar_sub_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SUBSCRIPTION_SETTINGS;
  });

  const [showPaywallModal, setShowPaywallModal] = useState<boolean>(false);

  // Persistent Exercise Library (Supports Admin Customizations)
  const [exercises, setExercises] = useState<Exercise[]>(() => {
    const saved = localStorage.getItem('goldenbar_custom_exercises');
    return saved ? JSON.parse(saved) : EXERCISE_DATABASE;
  });

  // User Storage Scoping Helper: Ensures User A's data never leaks to User B
  const getUserStorageKey = (key: string, userId?: string | null): string => {
    if (!userId) return `goldenbar_guest_${key}`;
    return `goldenbar_${userId}_${key}`;
  };

  // Persistent user fitness state (scoped per user)
  const [profile, setProfile] = useState<UserProfile>(() => {
    if (currentUser) {
      const saved = localStorage.getItem(getUserStorageKey('profile', currentUser.id));
      if (saved) return JSON.parse(saved);
    }
    return DEFAULT_USER_PROFILE;
  });

  const [planDays, setPlanDays] = useState<PlanDay[]>(() => {
    if (currentUser) {
      const saved = localStorage.getItem(getUserStorageKey('plan_days', currentUser.id));
      if (saved) return JSON.parse(saved);
    }
    return DEFAULT_PLAN_DAYS;
  });

  const [dailyEntry, setDailyEntry] = useState<DailyEntry>(() => {
    if (currentUser) {
      const saved = localStorage.getItem(getUserStorageKey('daily_entry', currentUser.id));
      if (saved) return JSON.parse(saved);
    }
    return DEFAULT_DAILY_ENTRY;
  });

  const [bodyMeasurements, setBodyMeasurements] = useState<BodyMeasurement[]>(() => {
    if (currentUser) {
      const saved = localStorage.getItem(getUserStorageKey('measurements', currentUser.id));
      if (saved) return JSON.parse(saved);
    }
    return DEFAULT_BODY_MEASUREMENTS;
  });

  const [pastSessions, setPastSessions] = useState<WorkoutSession[]>(() => {
    if (currentUser) {
      const saved = localStorage.getItem(getUserStorageKey('past_sessions', currentUser.id));
      if (saved) return JSON.parse(saved);
    }
    return DEFAULT_PAST_SESSIONS;
  });

  const [appSettings, setAppSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('goldenbar_settings');
    return saved ? JSON.parse(saved) : DEFAULT_APP_SETTINGS;
  });

  // Admin Image Configuration (Front/Back models & exercise overrides)
  const [imageConfig, setImageConfig] = useState<AdminImageConfig>(() => {
    const saved = localStorage.getItem('goldenbar_image_config');
    return saved
      ? JSON.parse(saved)
      : {
          frontCharacter: CHARACTER_IMAGE,
          backCharacter: CHARACTER_BACK_IMAGE,
          exerciseOverrides: {},
        };
  });

  // Active workout session
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(() => {
    if (currentUser) {
      const saved = localStorage.getItem(getUserStorageKey('active_session', currentUser.id));
      if (saved) return JSON.parse(saved);
    }
    return null;
  });

  // Today's Plan Routine state (Starts blank until user chooses a muscle routine or activates 30-Day Plan)
  const [todayRoutine, setTodayRoutine] = useState<TodayRoutine | null>(() => {
    if (currentUser) {
      const saved = localStorage.getItem(getUserStorageKey('today_routine', currentUser.id));
      if (saved) return JSON.parse(saved);
    }
    return null;
  });

  // 30-Day Guided Plan activation state (Starts inactive/blank until user chooses it)
  const [isPlanActive, setIsPlanActive] = useState<boolean>(() => {
    if (currentUser) {
      return localStorage.getItem(getUserStorageKey('plan_active', currentUser.id)) === 'true';
    }
    return false;
  });

  // Member Navigation state
  const [currentRoute, setCurrentRoute] = useState<string>('home');
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup>('CHEST');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [currentPlanDayIndex, setCurrentPlanDayIndex] = useState<number>(1); // Day 1 of 30

  // Water toast notification
  const [globalWaterToast, setGlobalWaterToast] = useState<boolean>(false);

  // Sync Global Settings & User Directory
  useEffect(() => {
    localStorage.setItem('goldenbar_all_users', JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('goldenbar_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('goldenbar_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('goldenbar_custom_exercises', JSON.stringify(exercises));
  }, [exercises]);

  useEffect(() => {
    localStorage.setItem('goldenbar_sub_settings', JSON.stringify(subscriptionSettings));
  }, [subscriptionSettings]);

  useEffect(() => {
    localStorage.setItem('goldenbar_settings', JSON.stringify(appSettings));
  }, [appSettings]);

  useEffect(() => {
    localStorage.setItem('goldenbar_image_config', JSON.stringify(imageConfig));
  }, [imageConfig]);

  // User Switcher Effect: Loads user-isolated data whenever currentUser changes
  useEffect(() => {
    if (!currentUser) {
      setTodayRoutine(null);
      setIsPlanActive(false);
      setActiveSession(null);
      return;
    }

    const userId = currentUser.id;

    // Load Today Routine for this user
    const savedTodayRoutine = localStorage.getItem(getUserStorageKey('today_routine', userId));
    setTodayRoutine(savedTodayRoutine ? JSON.parse(savedTodayRoutine) : null);

    // Load Plan Active state
    const savedPlanActive = localStorage.getItem(getUserStorageKey('plan_active', userId));
    setIsPlanActive(savedPlanActive === 'true');

    // Load Plan Days
    const savedPlanDays = localStorage.getItem(getUserStorageKey('plan_days', userId));
    setPlanDays(savedPlanDays ? JSON.parse(savedPlanDays) : DEFAULT_PLAN_DAYS);

    // Load Profile
    const savedProfile = localStorage.getItem(getUserStorageKey('profile', userId));
    setProfile(
      savedProfile
        ? JSON.parse(savedProfile)
        : {
            ...DEFAULT_USER_PROFILE,
            name: currentUser.username.charAt(0).toUpperCase() + currentUser.username.slice(1),
          }
    );

    // Load Daily Entry
    const savedDailyEntry = localStorage.getItem(getUserStorageKey('daily_entry', userId));
    setDailyEntry(savedDailyEntry ? JSON.parse(savedDailyEntry) : DEFAULT_DAILY_ENTRY);

    // Load Past Sessions
    const savedPastSessions = localStorage.getItem(getUserStorageKey('past_sessions', userId));
    setPastSessions(savedPastSessions ? JSON.parse(savedPastSessions) : DEFAULT_PAST_SESSIONS);

    // Load Measurements
    const savedMeasurements = localStorage.getItem(getUserStorageKey('measurements', userId));
    setBodyMeasurements(savedMeasurements ? JSON.parse(savedMeasurements) : DEFAULT_BODY_MEASUREMENTS);

    // Load Active Session
    const savedActiveSession = localStorage.getItem(getUserStorageKey('active_session', userId));
    setActiveSession(savedActiveSession ? JSON.parse(savedActiveSession) : null);
  }, [currentUser?.id]);

  // User-scoped sync to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(getUserStorageKey('profile', currentUser.id), JSON.stringify(profile));
    }
  }, [profile, currentUser?.id]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(getUserStorageKey('plan_days', currentUser.id), JSON.stringify(planDays));
    }
  }, [planDays, currentUser?.id]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(getUserStorageKey('daily_entry', currentUser.id), JSON.stringify(dailyEntry));
    }
  }, [dailyEntry, currentUser?.id]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(getUserStorageKey('measurements', currentUser.id), JSON.stringify(bodyMeasurements));
    }
  }, [bodyMeasurements, currentUser?.id]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(getUserStorageKey('past_sessions', currentUser.id), JSON.stringify(pastSessions));
    }
  }, [pastSessions, currentUser?.id]);

  useEffect(() => {
    if (currentUser) {
      if (activeSession) {
        localStorage.setItem(getUserStorageKey('active_session', currentUser.id), JSON.stringify(activeSession));
      } else {
        localStorage.removeItem(getUserStorageKey('active_session', currentUser.id));
      }
    }
  }, [activeSession, currentUser?.id]);

  useEffect(() => {
    if (currentUser) {
      if (todayRoutine) {
        localStorage.setItem(getUserStorageKey('today_routine', currentUser.id), JSON.stringify(todayRoutine));
      } else {
        localStorage.removeItem(getUserStorageKey('today_routine', currentUser.id));
      }
    }
  }, [todayRoutine, currentUser?.id]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(getUserStorageKey('plan_active', currentUser.id), String(isPlanActive));
    }
  }, [isPlanActive, currentUser?.id]);

  // Auth Handlers
  const handleLogin = (user: AppUser) => {
    setCurrentUser(user);
    if (user.role === 'ADMIN') {
      setCurrentRoute('admin');
    } else {
      setCurrentRoute('home');
    }
  };

  const handleRegister = (newUser: AppUser) => {
    setAllUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    setCurrentRoute('setup');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setTodayRoutine(null);
    setIsPlanActive(false);
    setActiveSession(null);
    setCurrentRoute('auth');
  };

  // Check if paywall prevents starting a workout
  const checkPaywallGate = (): boolean => {
    if (!subscriptionSettings.paywallEnabled) return false;
    if (currentUser?.role === 'ADMIN' || currentUser?.isPaid) return false;
    if ((currentUser?.workoutCount || 0) >= subscriptionSettings.freeWorkoutLimit) {
      setShowPaywallModal(true);
      return true;
    }
    return false;
  };

  // Handler to start a custom or plan workout
  const handleStartWorkout = (exercisesToRun: Exercise[], source: 'FREE' | 'PLAN' = 'FREE', planDayIndex?: number) => {
    if (checkPaywallGate()) return;

    const newSession: WorkoutSession = {
      id: `sess_${Date.now()}`,
      date: 'Today',
      source,
      planDayIndex,
      startedAt: Date.now(),
      status: 'IN_PROGRESS',
      totalSec: 0,
      estCalories: 0,
      currentExerciseIndex: 0,
      exercises: exercisesToRun.map((ex) => {
        const rx = ex.prescriptions[profile.goal];
        return {
          exerciseId: ex.id,
          exerciseName: ex.name,
          muscle: ex.muscle,
          status: 'NOT_STARTED',
          sets: Array.from({ length: rx.sets }, (_, i) => ({
            setNumber: i + 1,
            reps: parseInt(rx.reps.split('-')[0], 10) || 10,
            weightKg: 20,
            completed: false,
          })),
        };
      }),
    };

    setActiveSession(newSession);
    setCurrentRoute('session');
  };

  // Routine Management Handlers
  const handleUpdateTodayRoutine = (routine: TodayRoutine | null) => {
    setTodayRoutine(routine);
    if (!routine) {
      setIsPlanActive(false);
    }
  };

  const handleClearTodayRoutine = () => {
    setTodayRoutine(null);
    setIsPlanActive(false);
    if (currentUser) {
      localStorage.removeItem(getUserStorageKey('today_routine', currentUser.id));
      localStorage.removeItem(getUserStorageKey('plan_active', currentUser.id));
    }
  };

  const handleActivatePlan = () => {
    setIsPlanActive(true);
    const day = planDays.find((d) => d.dayIndex === currentPlanDayIndex) || planDays[0];
    const newRoutine: TodayRoutine = {
      type: 'PLAN',
      title: `Day ${day.dayIndex}: ${
        day.isRest
          ? 'Rest & Active Recovery'
          : `${day.muscle.charAt(0) + day.muscle.slice(1).toLowerCase()} Hypertrophy`
      }`,
      muscle: day.isRest ? undefined : (day.muscle as MuscleGroup),
      planDayIndex: day.dayIndex,
      exerciseIds: day.exerciseIds,
      updatedAt: Date.now(),
    };
    setTodayRoutine(newRoutine);
  };

  const handleStartTodayRoutine = () => {
    if (!todayRoutine) {
      setCurrentRoute('muscles');
      return;
    }
    const routineExercises = todayRoutine.exerciseIds
      .map((id) => exercises.find((e) => e.id === id))
      .filter((e): e is Exercise => Boolean(e));

    if (routineExercises.length === 0) {
      if (todayRoutine.muscle) {
        setSelectedMuscle(todayRoutine.muscle);
        setCurrentRoute('exercises');
      } else {
        setCurrentRoute('muscles');
      }
      return;
    }

    handleStartWorkout(
      routineExercises,
      todayRoutine.type === 'PLAN' ? 'PLAN' : 'FREE',
      todayRoutine.planDayIndex
    );
  };

  const handleStartPlanDay = (day: PlanDay) => {
    if (day.isRest) return;
    const planExercises = exercises.filter((e) => day.exerciseIds.includes(e.id));
    if (planExercises.length > 0) {
      handleStartWorkout(planExercises, 'PLAN', day.dayIndex);
    }
  };

  const handleStartSingleExercise = (exercise: Exercise) => {
    handleStartWorkout([exercise], 'FREE');
  };

  const handleNextExercise = () => {
    if (!activeSession) return;
    const nextIdx = activeSession.currentExerciseIndex + 1;
    if (nextIdx < activeSession.exercises.length) {
      setActiveSession({
        ...activeSession,
        currentExerciseIndex: nextIdx,
      });
    } else {
      setCurrentRoute('summary');
    }
  };

  const handleSaveAndFinishWorkout = () => {
    if (!activeSession) return;
    const finishedSession: WorkoutSession = {
      ...activeSession,
      status: 'DONE',
    };

    setPastSessions((prev) => [finishedSession, ...prev]);

    // Update streak and workouts count
    setDailyEntry((prev) => ({
      ...prev,
      workoutDone: true,
      streakDays: prev.streakDays + 1,
    }));

    if (currentUser) {
      const updatedUser: AppUser = {
        ...currentUser,
        workoutCount: (currentUser.workoutCount || 0) + 1,
      };
      setCurrentUser(updatedUser);
      setAllUsers((prev) =>
        prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
      );
    }

    // Advance 30-day plan day
    if (activeSession.planDayIndex) {
      setPlanDays((prev) =>
        prev.map((d) =>
          d.dayIndex === activeSession.planDayIndex ? { ...d, completed: true } : d
        )
      );
      if (currentPlanDayIndex < 30) {
        setCurrentPlanDayIndex((prev) => prev + 1);
      }
    }

    // Finish for Today: clear today's routine and active plan so today's plan is empty
    setTodayRoutine(null);
    setIsPlanActive(false);
    if (currentUser) {
      localStorage.removeItem(getUserStorageKey('today_routine', currentUser.id));
      localStorage.removeItem(getUserStorageKey('plan_active', currentUser.id));
    }

    setActiveSession(null);
    setCurrentRoute('home');
  };

  const handleResetData = () => {
    localStorage.clear();
    setProfile(DEFAULT_USER_PROFILE);
    setPlanDays(DEFAULT_PLAN_DAYS);
    setDailyEntry(DEFAULT_DAILY_ENTRY);
    setBodyMeasurements(DEFAULT_BODY_MEASUREMENTS);
    setPastSessions(DEFAULT_PAST_SESSIONS);
    setAppSettings(DEFAULT_APP_SETTINGS);
    setAllUsers(DEFAULT_USERS);
    setSubscriptionSettings(DEFAULT_SUBSCRIPTION_SETTINGS);
    setExercises(EXERCISE_DATABASE);
    setImageConfig({
      frontCharacter: CHARACTER_IMAGE,
      backCharacter: CHARACTER_BACK_IMAGE,
      exerciseOverrides: {},
    });
    setTodayRoutine(null);
    setIsPlanActive(false);
    setActiveSession(null);
    setCurrentUser(null);
    setCurrentPlanDayIndex(1);
    setCurrentRoute('home');
  };

  const currentPlanDay =
    planDays.find((d) => d.dayIndex === currentPlanDayIndex) || planDays[0];

  // -----------------------------------------------------------------
  // 1. ADMIN USER VIEW: Dedicated Admin Dashboard (No Member Screens)
  // -----------------------------------------------------------------
  if (currentUser && currentUser.role === 'ADMIN') {
    return (
      <>
        <AdminDashboardScreen
          currentUser={currentUser}
          allUsers={allUsers}
          onUpdateUsers={setAllUsers}
          exercises={exercises}
          onUpdateExercises={setExercises}
          imageConfig={imageConfig}
          onUpdateImageConfig={setImageConfig}
          onLogout={handleLogout}
        />
        <OfflineIndicator />
      </>
    );
  }

  // -----------------------------------------------------------------
  // 2. MEMBER & GUEST APP: Clean Mobile Presentation
  // -----------------------------------------------------------------
  return (
    <>
      <PhoneFrame>
        {/* Global water toast alert */}
        <WaterReminderBanner
          show={globalWaterToast}
          onDismiss={() => setGlobalWaterToast(false)}
          autoDismissMs={5000}
        />

        {/* If no user is logged in, show Auth Screen */}
        {!currentUser ? (
          <AuthScreen
            allUsers={allUsers}
            onLogin={handleLogin}
            onRegister={handleRegister}
            onContinueAsGuest={() =>
              handleLogin({
                id: 'usr_guest',
                username: 'guest',
                password: '',
                role: 'MEMBER',
                membershipTier: 'FREE',
                isPaid: false,
                createdAt: new Date().toISOString().split('T')[0],
                workoutCount: 0,
              })
            }
          />
        ) : (
          <>
            {/* Screen Router for Normal Member */}
            {currentRoute === 'home' && (
              <HomeScreen
                profile={profile}
                currentPlanDay={currentPlanDay}
                todayRoutine={todayRoutine}
                isPlanActive={isPlanActive}
                dailyEntry={dailyEntry}
                activeSession={activeSession}
                exercises={exercises}
                customFrontImage={imageConfig.frontCharacter}
                onNavigate={(route) => setCurrentRoute(route)}
                onResumeWorkout={() => setCurrentRoute('session')}
                onStartTodayWorkout={handleStartTodayRoutine}
                onClearTodayRoutine={handleClearTodayRoutine}
              />
            )}

            {currentRoute === 'setup' && (
              <ProfileSetupScreen
                initialProfile={profile}
                onFinishSetup={(newProfile) => {
                  setProfile(newProfile);
                  setCurrentRoute('home');
                }}
                onSkip={() => setCurrentRoute('home')}
              />
            )}

            {currentRoute === 'workouts' && (
              <GoalPickerScreen
                currentGoal={profile.goal}
                onSelectGoal={(newGoal) => setProfile((p) => ({ ...p, goal: newGoal }))}
                onBack={() => setCurrentRoute('home')}
                onContinue={() => setCurrentRoute('muscles')}
              />
            )}

            {currentRoute === 'muscles' && (
              <MuscleTilesScreen
                goal={profile.goal}
                customFrontImage={imageConfig.frontCharacter}
                customBackImage={imageConfig.backCharacter}
                onSelectMuscle={(muscle) => {
                  setSelectedMuscle(muscle);
                  setCurrentRoute('exercises');
                }}
                onChangeGoal={() => setCurrentRoute('workouts')}
                onBack={() => setCurrentRoute('home')}
              />
            )}

            {currentRoute === 'exercises' && (
              <ExerciseListScreen
                muscle={selectedMuscle}
                goal={profile.goal}
                customFrontImage={imageConfig.frontCharacter}
                customBackImage={imageConfig.backCharacter}
                exerciseOverrides={imageConfig.exerciseOverrides}
                exerciseList={exercises}
                currentTodayRoutine={todayRoutine}
                onUpdateTodayRoutine={handleUpdateTodayRoutine}
                onSelectExerciseDetail={(exercise) => {
                  setSelectedExercise(exercise);
                  setCurrentRoute('exercise_detail');
                }}
                onStartSession={(selectedExercises) =>
                  handleStartWorkout(selectedExercises, 'FREE')
                }
                onReturnHome={() => setCurrentRoute('home')}
                onBack={() => setCurrentRoute('muscles')}
              />
            )}

            {currentRoute === 'exercise_detail' && selectedExercise && (
              <ExerciseDetailScreen
                exercise={selectedExercise}
                goal={profile.goal}
                customFrontImage={imageConfig.frontCharacter}
                customBackImage={imageConfig.backCharacter}
                onStartSingleExercise={handleStartSingleExercise}
                onBack={() => setCurrentRoute('exercises')}
              />
            )}

            {currentRoute === 'session' && activeSession && (
              <ExerciseSessionScreen
                session={activeSession}
                goal={profile.goal}
                settings={appSettings}
                customFrontImage={imageConfig.frontCharacter}
                customBackImage={imageConfig.backCharacter}
                onUpdateSession={(updated) => setActiveSession(updated)}
                onFinishExercise={handleNextExercise}
                onPromptSummary={() => setCurrentRoute('summary')}
                onExitSession={() => setCurrentRoute('home')}
              />
            )}

            {currentRoute === 'summary' && activeSession && (
              <WorkoutSummaryScreen
                session={activeSession}
                currentStreak={dailyEntry.streakDays}
                onSaveAndFinish={handleSaveAndFinishWorkout}
                onKeepGoing={() => setCurrentRoute('session')}
              />
            )}

            {currentRoute === 'plans' && (
              <PlansScreen
                planDays={planDays}
                currentDayIndex={currentPlanDayIndex}
                goal={profile.goal}
                isPlanActive={isPlanActive}
                onActivatePlan={handleActivatePlan}
                onDeactivatePlan={handleClearTodayRoutine}
                onSelectDayToTrain={handleStartPlanDay}
                onUpdatePlanDay={(updatedDay) =>
                  setPlanDays((prev) =>
                    prev.map((d) => (d.dayIndex === updatedDay.dayIndex ? updatedDay : d))
                  )
                }
                onBack={() => setCurrentRoute('home')}
              />
            )}

            {currentRoute === 'tracker' && (
              <DailyTrackerScreen
                dailyEntry={dailyEntry}
                currentPlanDay={currentPlanDay}
                onUpdateDailyEntry={(updated) => setDailyEntry(updated)}
                onStartTodayWorkout={handleStartTodayRoutine}
                onBack={() => setCurrentRoute('home')}
              />
            )}

            {currentRoute === 'progress' && (
              <ProgressScreen
                measurements={bodyMeasurements}
                onAddMeasurement={(entry) =>
                  setBodyMeasurements((prev) => [...prev, entry])
                }
                onBack={() => setCurrentRoute('home')}
              />
            )}

            {currentRoute === 'profile' && (
              <ProfileScreen
                profile={profile}
                pastSessions={pastSessions}
                settings={appSettings}
                currentUser={currentUser}
                customFrontImage={imageConfig.frontCharacter}
                onUpdateSettings={(newSettings) => setAppSettings(newSettings)}
                onRetakeSetup={() => setCurrentRoute('setup')}
                onResetAllData={handleResetData}
                onLogout={handleLogout}
                onBack={() => setCurrentRoute('home')}
              />
            )}
          </>
        )}
      </PhoneFrame>

      {/* Paywall Alert Modal for Free Members */}
      {showPaywallModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-amber-200 flex flex-col animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-3 mx-auto">
              <Crown className="w-6 h-6" />
            </div>

            <h3 className="font-heading font-bold text-lg text-slate-900 text-center">
              Unlock GoldenBar Pro
            </h3>
            <p className="text-xs text-slate-600 text-center mt-1 leading-relaxed">
              You've completed your {subscriptionSettings.freeWorkoutLimit} free workouts! Subscribe now to continue training with unlimited 30-day programs.
            </p>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 my-4 text-center">
              <span className="text-[10px] font-semibold text-slate-400 block uppercase">
                Starting at
              </span>
              <span className="font-heading font-bold text-xl text-slate-900">
                ${subscriptionSettings.monthlyPrice}
                <span className="text-xs text-slate-500 font-normal"> / month</span>
              </span>
              <span className="text-[11px] text-emerald-600 font-semibold block mt-0.5">
                or ${subscriptionSettings.annualPrice}/yr (Save 33%)
              </span>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  if (currentUser) {
                    const upgraded: AppUser = {
                      ...currentUser,
                      isPaid: true,
                      membershipTier: 'PRO_MONTHLY',
                    };
                    setCurrentUser(upgraded);
                    setAllUsers((prev) =>
                      prev.map((u) => (u.id === upgraded.id ? upgraded : u))
                    );
                  }
                  setShowPaywallModal(false);
                }}
                className="w-full h-11 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-heading font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>Upgrade to Pro (${subscriptionSettings.monthlyPrice}/mo)</span>
              </button>

              <button
                onClick={() => setShowPaywallModal(false)}
                className="w-full h-9 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Offline Mode Indicator */}
      <OfflineIndicator />
    </>
  );
}
