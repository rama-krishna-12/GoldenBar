import React, { useState } from 'react';
import {
  Dumbbell,
  Calendar,
  Droplets,
  TrendingUp,
  User,
  Play,
  Flame,
  CheckCircle2,
  Sparkles,
  Info,
  RotateCcw,
  Layers,
  Share2,
  Plus,
} from 'lucide-react';
import { UserProfile, WorkoutSession, PlanDay, DailyEntry, TodayRoutine, Exercise } from '../types';
import { CHARACTER_IMAGE } from '../data/exercises';
import { ShareModal } from '../components/ShareModal';

interface HomeScreenProps {
  profile: UserProfile;
  currentPlanDay: PlanDay;
  todayRoutine: TodayRoutine | null;
  isPlanActive: boolean;
  dailyEntry: DailyEntry;
  activeSession: WorkoutSession | null;
  exercises: Exercise[];
  customFrontImage?: string;
  onNavigate: (route: string) => void;
  onResumeWorkout: () => void;
  onStartTodayWorkout: () => void;
  onClearTodayRoutine?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  profile,
  currentPlanDay,
  todayRoutine,
  isPlanActive,
  dailyEntry,
  activeSession,
  exercises,
  customFrontImage,
  onNavigate,
  onResumeWorkout,
  onStartTodayWorkout,
  onClearTodayRoutine,
}) => {
  const [showSafetyNote, setShowSafetyNote] = useState(false);

  const todayDateString = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  // Resolve exercises for the current routine
  const routineExerciseObjects = todayRoutine
    ? todayRoutine.exerciseIds
        .map((id) => exercises.find((e) => e.id === id))
        .filter((e): e is Exercise => e !== undefined)
    : [];

  const tiles = [
    {
      id: 'workouts',
      title: 'Workout',
      icon: Dumbbell,
      tintBg: 'bg-white hover:bg-sky-50/70',
      borderColor: 'border-slate-200/90 hover:border-sky-300',
      iconBg: 'bg-sky-100 text-sky-600',
      targetRoute: 'workouts',
    },
    {
      id: 'plans',
      title: 'Plans',
      icon: Calendar,
      tintBg: 'bg-white hover:bg-orange-50/70',
      borderColor: 'border-slate-200/90 hover:border-orange-300',
      iconBg: 'bg-orange-100 text-orange-600',
      targetRoute: 'plans',
    },
    {
      id: 'tracker',
      title: 'Daily Tracker',
      icon: Droplets,
      tintBg: 'bg-white hover:bg-emerald-50/70',
      borderColor: 'border-slate-200/90 hover:border-emerald-300',
      iconBg: 'bg-emerald-100 text-emerald-600',
      targetRoute: 'tracker',
    },
    {
      id: 'progress',
      title: 'Progress',
      icon: TrendingUp,
      tintBg: 'bg-white hover:bg-purple-50/70',
      borderColor: 'border-slate-200/90 hover:border-purple-300',
      iconBg: 'bg-purple-100 text-purple-600',
      targetRoute: 'progress',
    },
    {
      id: 'profile',
      title: 'Profile',
      icon: User,
      tintBg: 'bg-white hover:bg-slate-100/70',
      borderColor: 'border-slate-200/90 hover:border-slate-300',
      iconBg: 'bg-slate-100 text-slate-700',
      targetRoute: 'profile',
    },
  ];

  return (
    <div className="flex-1 p-4 sm:p-5 overflow-y-auto max-w-md mx-auto w-full pb-10">
      {/* Top Greeting & Date Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
            {todayDateString}
          </span>
          <h2 className="font-heading font-bold text-2xl text-slate-900 tracking-tight">
            {profile.name ? `Hello, ${profile.name}` : 'Welcome Back'}
          </h2>
        </div>

        <button
          onClick={() => onNavigate('profile')}
          className="relative w-11 h-11 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center overflow-hidden hover:scale-105 active:scale-95 transition-all"
          title="View Profile"
        >
          <img
            src={customFrontImage || CHARACTER_IMAGE}
            alt="User Character Avatar"
            className="w-full h-full object-cover object-top"
          />
        </button>
      </div>

      {/* Safety Note */}
      {showSafetyNote && (
        <div className="mb-4 p-3.5 bg-amber-50/90 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5 animate-in fade-in duration-200">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold block">Safety Note</span>
            GoldenBar provides general fitness guidance, not medical advice. Check with a physician before starting any training program.
          </div>
          <button
            onClick={() => setShowSafetyNote(false)}
            className="text-amber-500 hover:text-amber-800 text-xs font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Resume Active Session Card (If mid-workout) */}
      {activeSession && activeSession.status === 'IN_PROGRESS' && (
        <div className="mb-4 bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-3xl p-4 shadow-lg shadow-sky-500/20 flex items-center justify-between gap-3 animate-pulse">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs text-sky-100 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-300"></span>
              <span>Workout in progress</span>
            </div>
            <h4 className="font-heading font-bold text-base truncate">
              {activeSession.exercises[activeSession.currentExerciseIndex]?.exerciseName || 'Current Exercise'}
            </h4>
            <p className="text-xs text-sky-100">
              Exercise {activeSession.currentExerciseIndex + 1} of {activeSession.exercises.length}
            </p>
          </div>
          <button
            onClick={onResumeWorkout}
            className="px-4 py-2 rounded-xl bg-white text-sky-700 font-semibold text-xs shadow-xs hover:bg-sky-50 active:scale-95 transition-all flex items-center gap-1.5 shrink-0"
          >
            <Play className="w-3.5 h-3.5 fill-sky-700" />
            <span>Resume</span>
          </button>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TODAY'S PLAN ROUTINE CARD (BLANK UNTIL CHOSEN)        */}
      {/* ---------------------------------------------------- */}
      {!todayRoutine ? (
        /* Blank State: User hasn't chosen a routine or plan yet */
        <div className="mb-5 bg-white rounded-3xl p-5 border border-dashed border-amber-300 shadow-xs animate-in fade-in duration-200">
          <div className="flex items-start gap-3.5 mb-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0 text-amber-600 shadow-2xs">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-full inline-block">
                Plan Routine · Blank
              </span>
              <h4 className="font-heading font-bold text-slate-900 text-base mt-1">
                No Workout Selected for Today
              </h4>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Choose a muscle workout (e.g. Chest) from the library or activate the 30-Day guided plan.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-100">
            <button
              onClick={() => onNavigate('muscles')}
              className="p-3 rounded-2xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200/80 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all text-center"
            >
              <Flame className="w-4 h-4 text-sky-600 shrink-0" />
              <span>Pick Workout (e.g. Chest)</span>
            </button>

            <button
              onClick={() => onNavigate('plans')}
              className="p-3 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all text-center"
            >
              <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Activate 30-Day Plan</span>
            </button>
          </div>
        </div>
      ) : (
        /* Active State: Workout chosen (e.g. Chest) or 30-Day Plan active */
        <div className="mb-5 bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-start gap-3 min-w-0">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs ${
                  todayRoutine.type === 'PLAN'
                    ? 'bg-orange-50 border border-orange-200 text-orange-600'
                    : 'bg-amber-50 border border-amber-200 text-amber-600'
                }`}
              >
                {todayRoutine.type === 'PLAN' ? (
                  <Flame className="w-6 h-6 fill-current" />
                ) : (
                  <Dumbbell className="w-6 h-6" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      todayRoutine.type === 'PLAN'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    {todayRoutine.type === 'PLAN'
                      ? `30-Day Plan · Day ${todayRoutine.planDayIndex || 1}`
                      : "Today's Plan Routine"}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {routineExerciseObjects.length} {routineExerciseObjects.length === 1 ? 'Exercise' : 'Exercises'}
                  </span>
                </div>
                <h4 className="font-heading font-bold text-slate-900 text-base sm:text-lg mt-0.5 truncate">
                  {todayRoutine.title}
                </h4>
              </div>
            </div>

            <button
              onClick={onStartTodayWorkout}
              className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-heading font-semibold text-xs shadow-md flex items-center gap-1.5 shrink-0 active:scale-95 transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start</span>
            </button>
          </div>

          {/* List of Added Exercises in Today's Routine */}
          <div className="bg-slate-50/80 rounded-2xl p-3 border border-slate-200/60 space-y-1.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Exercises Included in Today's Plan:
            </span>
            {routineExerciseObjects.map((ex, idx) => (
              <div
                key={ex.id}
                className="flex items-center justify-between text-xs py-1.5 px-2.5 bg-white rounded-xl border border-slate-200/60"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-600 text-[10px] flex items-center justify-center font-bold shrink-0">
                    {idx + 1}
                  </span>
                  <span className="font-semibold text-slate-800 truncate">{ex.name}</span>
                </div>
                <span className="text-[10px] font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md shrink-0 border border-slate-200/50">
                  {ex.equipment}
                </span>
              </div>
            ))}
          </div>

          {/* Card Footer Controls */}
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-xs gap-2">
            <button
              onClick={() => onNavigate(todayRoutine.type === 'PLAN' ? 'plans' : 'muscles')}
              className="text-sky-600 hover:text-sky-800 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{todayRoutine.type === 'PLAN' ? 'View 30-Day Schedule' : '+ Add Exercise'}</span>
            </button>

            {onClearTodayRoutine && (
              <div className="flex items-center gap-2">
                <button
                  onClick={onClearTodayRoutine}
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                  title="Finish workout and clear today's plan"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Finish for Today</span>
                </button>

                <button
                  onClick={onClearTodayRoutine}
                  className="text-slate-400 hover:text-slate-600 text-[11px] font-medium cursor-pointer"
                  title="Remove all exercises from today"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Section Header */}
      <div className="mb-3 px-1">
        <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
          Explore GoldenBar
        </span>
      </div>

      {/* 2-Column Straight Tiles Grid (1st Left, 2nd Right, 3rd Left, 4th Right, 5th Left) */}
      <div className="grid grid-cols-2 gap-3">
        {tiles.map((tile) => {
          const Icon = tile.icon;
          return (
            <button
              key={tile.id}
              onClick={() => onNavigate(tile.targetRoute)}
              className={`w-full text-left rounded-2xl p-3.5 border ${tile.borderColor} ${tile.tintBg} shadow-xs hover:shadow-md transition-all duration-200 active:scale-[0.97] flex flex-col items-start gap-2.5 group cursor-pointer overflow-hidden`}
            >
              <div
                className={`w-10 h-10 rounded-xl ${tile.iconBg} flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="w-full min-w-0">
                <h3 className="font-heading font-bold text-sm sm:text-base text-slate-900 truncate">
                  {tile.title}
                </h3>
              </div>
            </button>
          );
        })}
      </div>

      {/* Subtle Character Feature Card */}
      <div className="mt-6 bg-white/80 rounded-3xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-900 shrink-0 border border-slate-200">
          <img
            src={customFrontImage || CHARACTER_IMAGE}
            alt="GoldenBar AI Coach"
            className="w-full h-full object-cover object-top"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="font-heading font-semibold text-xs text-slate-900">
              Anatomical Mannequin Form
            </span>
          </div>
          <p className="text-[11px] text-slate-600 line-clamp-2">
            Targeted muscle glow highlighting primary & secondary muscular activations with joint stress awareness.
          </p>
        </div>
      </div>
    </div>
  );
};
