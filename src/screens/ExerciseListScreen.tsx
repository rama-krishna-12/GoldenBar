import React, { useState } from 'react';
import { Play, Check, AlertTriangle, Layers, Plus, CheckCircle2, Home, Sparkles, Flame, Dumbbell } from 'lucide-react';
import { Exercise, Goal, MuscleGroup, TodayRoutine } from '../types';
import { EXERCISE_DATABASE, MUSCLE_METADATA, CHARACTER_IMAGE, CHARACTER_BACK_IMAGE } from '../data/exercises';
import { HeaderBar } from '../components/HeaderBar';
import { sortExercisesForWorkout, generateRoutineTitle } from '../utils/workoutSequencer';

interface ExerciseListScreenProps {
  muscle: MuscleGroup;
  goal: Goal;
  customFrontImage?: string;
  customBackImage?: string;
  exerciseOverrides?: Record<string, string>;
  exerciseList?: Exercise[];
  currentTodayRoutine?: TodayRoutine | null;
  onUpdateTodayRoutine?: (routine: TodayRoutine | null) => void;
  onSelectExerciseDetail: (exercise: Exercise) => void;
  onStartSession: (selectedExercises: Exercise[]) => void;
  onReturnHome?: () => void;
  onBack: () => void;
}

export const ExerciseListScreen: React.FC<ExerciseListScreenProps> = ({
  muscle,
  goal,
  customFrontImage,
  customBackImage,
  exerciseOverrides = {},
  exerciseList,
  currentTodayRoutine,
  onUpdateTodayRoutine,
  onSelectExerciseDetail,
  onStartSession,
  onReturnHome,
  onBack,
}) => {
  const muscleMeta = MUSCLE_METADATA[muscle];
  const allExercises = exerciseList || EXERCISE_DATABASE;
  const exercises = allExercises.filter((e) => e.muscle === muscle);

  // Global routine IDs (across ALL modules: Cardio, Chest, Back, Legs, etc.)
  const routineExerciseIds = currentTodayRoutine?.exerciseIds || [];
  const totalRoutineCount = routineExerciseIds.length;

  // Selected for this specific muscle
  const selectedIdsForThisMuscle = exercises
    .filter((e) => routineExerciseIds.includes(e.id))
    .map((e) => e.id);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleToggleExercise = (exercise: Exercise, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const isAlreadyAdded = routineExerciseIds.includes(exercise.id);
    let nextAllIds: string[];

    if (isAlreadyAdded) {
      nextAllIds = routineExerciseIds.filter((id) => id !== exercise.id);
      showToast(`Removed ${exercise.name} from Today's Plan`);
    } else {
      nextAllIds = [...routineExerciseIds, exercise.id];
      showToast(`Added ${exercise.name} to Today's Plan!`);
    }

    // Auto-sort into optimal workout order: Warmup -> Cardio -> Strength -> Core
    const sortedIds = sortExercisesForWorkout(nextAllIds, allExercises);
    const title = generateRoutineTitle(sortedIds, allExercises);

    if (sortedIds.length > 0) {
      onUpdateTodayRoutine?.({
        type: 'CUSTOM',
        title,
        muscle: sortedIds.length === 1 ? exercise.muscle : undefined,
        exerciseIds: sortedIds,
        updatedAt: Date.now(),
      });
    } else {
      onUpdateTodayRoutine?.(null);
    }
  };

  const handleSelectAllThisMuscle = () => {
    const thisMuscleIds = exercises.map((e) => e.id);
    const allSelected = thisMuscleIds.every((id) => routineExerciseIds.includes(id));
    let nextAllIds: string[];

    if (allSelected) {
      // Remove all exercises of this muscle, keep other modules (e.g. Cardio)
      nextAllIds = routineExerciseIds.filter((id) => !thisMuscleIds.includes(id));
      showToast(`Cleared ${muscleMeta.name} exercises`);
    } else {
      // Add all exercises of this muscle, keep existing from other modules
      nextAllIds = Array.from(new Set([...routineExerciseIds, ...thisMuscleIds]));
      showToast(`Added all ${muscleMeta.name} exercises to Today's Plan!`);
    }

    const sortedIds = sortExercisesForWorkout(nextAllIds, allExercises);
    const title = generateRoutineTitle(sortedIds, allExercises);

    if (sortedIds.length > 0) {
      onUpdateTodayRoutine?.({
        type: 'CUSTOM',
        title,
        exerciseIds: sortedIds,
        updatedAt: Date.now(),
      });
    } else {
      onUpdateTodayRoutine?.(null);
    }
  };

  const handleStartWorkout = () => {
    // Start all exercises in Today's Routine in the optimal sequence (Cardio first, then Strength!)
    const activeIds = totalRoutineCount > 0 ? routineExerciseIds : selectedIdsForThisMuscle;
    const selected = activeIds
      .map((id) => allExercises.find((e) => e.id === id))
      .filter((e): e is Exercise => Boolean(e));

    if (selected.length === 0) return;
    onStartSession(selected);
  };

  // Find other modules that are currently included in Today's plan
  const otherModulesInPlan = Array.from(
    new Set(
      routineExerciseIds
        .map((id) => allExercises.find((e) => e.id === id)?.muscle)
        .filter((m): m is MuscleGroup => Boolean(m && m !== muscle))
    )
  );

  return (
    <div className="flex-1 flex flex-col bg-[#FAF9F6]">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <HeaderBar
        title={`${muscleMeta.name} Workout`}
        subtitle={`${exercises.length} exercises available`}
        onBack={onBack}
        rightAction={
          <button
            onClick={handleSelectAllThisMuscle}
            className="text-xs font-semibold text-sky-600 hover:text-sky-700 px-2 py-1 cursor-pointer"
          >
            {selectedIdsForThisMuscle.length === exercises.length ? 'Clear Muscle' : 'Select All'}
          </button>
        }
      />

      <div className="flex-1 p-4 sm:p-5 overflow-y-auto max-w-md mx-auto w-full pb-28">
        {/* Dynamic Today's Plan status banner with Multi-Module Awareness */}
        <div className="mb-4 bg-gradient-to-r from-amber-500/10 via-amber-400/15 to-yellow-400/10 rounded-2xl p-3.5 border border-amber-300 shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                {totalRoutineCount}
              </div>
              <div>
                <span className="font-heading font-bold text-xs text-slate-900 block">
                  {totalRoutineCount === 0
                    ? `Build Today's Routine (${muscleMeta.name})`
                    : currentTodayRoutine?.title || `Today's Plan (${totalRoutineCount} Selected)`}
                </span>
                <span className="text-[10px] text-slate-500">
                  {totalRoutineCount === 0
                    ? 'Tap "+ Add to Today\'s Plan" on any exercise below'
                    : `${selectedIdsForThisMuscle.length} from ${muscleMeta.name} · ${totalRoutineCount} total in plan`}
                </span>
              </div>
            </div>

            {totalRoutineCount > 0 && (
              <span className="text-[9px] font-bold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Sequenced
              </span>
            )}
          </div>

          {/* Multi-Module Note: Explaining optimal sequencing (Cardio first, then Strength) */}
          {otherModulesInPlan.length > 0 && (
            <div className="mt-2 pt-2 border-t border-amber-200/70 flex items-center gap-1.5 text-[10px] text-amber-900 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>
                Combined with {otherModulesInPlan.map((m) => MUSCLE_METADATA[m]?.name || m).join(', ')}.
                {muscle === 'CARDIO' || otherModulesInPlan.includes('CARDIO')
                  ? ' Cardio exercises are automatically placed first as warm-up!'
                  : ''}
              </span>
            </div>
          )}
        </div>

        {/* Exercise List */}
        <div className="space-y-3">
          {exercises.map((exercise) => {
            const rx = exercise.prescriptions[goal];
            const isAdded = routineExerciseIds.includes(exercise.id);

            const thumbSrc =
              exerciseOverrides[exercise.id] ||
              (exercise.muscle === 'BACK'
                ? (customBackImage || CHARACTER_BACK_IMAGE)
                : (customFrontImage || CHARACTER_IMAGE));

            return (
              <div
                key={exercise.id}
                onClick={() => onSelectExerciseDetail(exercise)}
                className={`w-full text-left p-3.5 rounded-3xl border transition-all duration-200 flex flex-col gap-3 cursor-pointer group active:scale-[0.99] ${
                  isAdded
                    ? 'bg-white border-amber-400 shadow-sm ring-1 ring-amber-400/40'
                    : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-2xl bg-slate-900 overflow-hidden shrink-0 border border-slate-200/80 relative flex items-center justify-center">
                    <img
                      src={thumbSrc}
                      alt={exercise.name}
                      className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-sky-400/35 mix-blend-color pointer-events-none" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60 uppercase">
                        {exercise.muscle}
                      </span>
                      <span className="text-[10px] text-slate-400">· {exercise.equipment}</span>
                    </div>

                    <h4 className="font-heading font-bold text-sm text-slate-900 truncate group-hover:text-amber-600 transition-colors">
                      {exercise.name}
                    </h4>

                    {/* Prescriptions: Sets x Reps */}
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-600">
                      <span className="font-semibold">{rx.sets} sets</span>
                      <span className="text-slate-300">|</span>
                      <span>{rx.reps} reps</span>
                      <span className="text-slate-300">|</span>
                      <span className="text-slate-400 font-mono text-[11px]">{rx.restSec}s rest</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions: Toggle Add to Plan Button */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="text-[10px] text-slate-400 flex items-center gap-1 truncate">
                    {exercise.secondaryMuscles.length > 0 && (
                      <span>Secondary: {exercise.secondaryMuscles.slice(0, 2).join(', ')}</span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleToggleExercise(exercise, e)}
                    className={`h-8 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isAdded
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-xs active:scale-95'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Added in Today's Plan</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Add to Today's Plan</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sticky Bottom Actions Bar */}
      <div className="sticky bottom-0 left-0 right-0 p-3.5 bg-white/95 backdrop-blur-md border-t border-slate-200/80 flex items-center gap-2 max-w-md mx-auto w-full z-30">
        {onReturnHome && (
          <button
            onClick={onReturnHome}
            className="h-11 px-3.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
            title="Save and view on Home screen"
          >
            <Home className="w-4 h-4 text-slate-500" />
            <span className="hidden xs:inline">Home</span>
          </button>
        )}

        <button
          onClick={handleStartWorkout}
          disabled={totalRoutineCount === 0}
          className={`flex-1 h-11 rounded-xl font-heading font-semibold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer ${
            totalRoutineCount > 0
              ? 'bg-slate-900 hover:bg-slate-800 text-white active:scale-[0.99]'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
          }`}
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>
            {totalRoutineCount === 0
              ? 'Select Exercises to Begin'
              : `Start Workout (${totalRoutineCount} Exercises)`}
          </span>
        </button>
      </div>
    </div>
  );
};
