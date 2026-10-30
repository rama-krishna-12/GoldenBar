import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Check,
  ChevronRight,
  Plus,
  Minus,
  Timer,
  Droplet,
  Dumbbell,
  CheckCircle2,
  X,
} from 'lucide-react';
import { WorkoutSession, Goal, AppSettings, Exercise } from '../types';
import { CHARACTER_IMAGE, EXERCISE_DATABASE } from '../data/exercises';
import { WaterReminderBanner } from '../components/WaterReminderBanner';
import { RestTimerModal } from '../components/RestTimerModal';
import { MannequinVisual } from '../components/MannequinVisual';
import { playSetCompleteSound } from '../utils/sound';

interface ExerciseSessionScreenProps {
  session: WorkoutSession;
  goal: Goal;
  settings: AppSettings;
  customFrontImage?: string;
  customBackImage?: string;
  onUpdateSession: (updated: WorkoutSession) => void;
  onFinishExercise: () => void;
  onPromptSummary: () => void;
  onExitSession: () => void;
}

export const ExerciseSessionScreen: React.FC<ExerciseSessionScreenProps> = ({
  session,
  goal,
  settings,
  customFrontImage,
  customBackImage,
  onUpdateSession,
  onFinishExercise,
  onPromptSummary,
  onExitSession,
}) => {
  const currentExLog = session.exercises[session.currentExerciseIndex];
  const fullExercise = EXERCISE_DATABASE.find((e) => e.id === currentExLog?.exerciseId);
  const rx = fullExercise?.prescriptions[goal] || { sets: 4, reps: '10', restSec: 60 };

  // Running workout timer
  const [elapsedSec, setElapsedSec] = useState<number>(session.totalSec || 0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);

  // Water banner state
  const [showWaterToast, setShowWaterToast] = useState<boolean>(false);
  const [nextWaterPromptSec, setNextWaterPromptSec] = useState<number>(settings.waterIntervalMin * 60);

  // Rest timer modal state
  const [showRestTimer, setShowRestTimer] = useState<boolean>(false);
  const [restDurationSec, setRestDurationSec] = useState<number>(rx.restSec);

  // Timer tick
  useEffect(() => {
    if (!isTimerRunning) return;
    const interval = setInterval(() => {
      setElapsedSec((prev) => {
        const next = prev + 1;
        // Check water reminder
        if (next >= nextWaterPromptSec) {
          setShowWaterToast(true);
          setNextWaterPromptSec(next + settings.waterIntervalMin * 60);
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning, nextWaterPromptSec, settings.waterIntervalMin]);

  // Sync elapsed time periodically to session object
  useEffect(() => {
    if (elapsedSec % 5 === 0 && elapsedSec > 0) {
      onUpdateSession({
        ...session,
        totalSec: elapsedSec,
      });
    }
  }, [elapsedSec]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Set management
  const handleToggleSetComplete = (setIndex: number) => {
    const updatedExercises = [...session.exercises];
    const currentSets = [...currentExLog.sets];
    const isCompleted = !currentSets[setIndex].completed;

    currentSets[setIndex] = {
      ...currentSets[setIndex],
      completed: isCompleted,
    };

    updatedExercises[session.currentExerciseIndex] = {
      ...currentExLog,
      sets: currentSets,
    };

    onUpdateSession({
      ...session,
      exercises: updatedExercises,
      totalSec: elapsedSec,
    });

    // If marked as completed, trigger rest timer and sound
    if (isCompleted) {
      playSetCompleteSound(settings.soundEnabled);
      setRestDurationSec(rx.restSec);
      setShowRestTimer(true);
    }
  };

  const handleUpdateSetValue = (
    setIndex: number,
    field: 'reps' | 'weightKg',
    delta: number
  ) => {
    const updatedExercises = [...session.exercises];
    const currentSets = [...currentExLog.sets];
    const currentVal = currentSets[setIndex][field];
    const newVal = Math.max(0, currentVal + delta);

    currentSets[setIndex] = {
      ...currentSets[setIndex],
      [field]: newVal,
    };

    updatedExercises[session.currentExerciseIndex] = {
      ...currentExLog,
      sets: currentSets,
    };

    onUpdateSession({
      ...session,
      exercises: updatedExercises,
      totalSec: elapsedSec,
    });
  };

  const handleAddExtraSet = () => {
    const updatedExercises = [...session.exercises];
    const currentSets = [...currentExLog.sets];
    const lastSet = currentSets[currentSets.length - 1];

    currentSets.push({
      setNumber: currentSets.length + 1,
      reps: lastSet ? lastSet.reps : 10,
      weightKg: lastSet ? lastSet.weightKg : 20,
      completed: false,
    });

    updatedExercises[session.currentExerciseIndex] = {
      ...currentExLog,
      sets: currentSets,
    };

    onUpdateSession({
      ...session,
      exercises: updatedExercises,
      totalSec: elapsedSec,
    });
  };

  const isLastExercise = session.currentExerciseIndex === session.exercises.length - 1;

  return (
    <div className="flex-1 flex flex-col bg-[#FAF9F6]">
      {/* Water Reminder Banner */}
      <WaterReminderBanner
        show={showWaterToast}
        onDismiss={() => setShowWaterToast(false)}
        autoDismissMs={5000}
      />

      {/* Rest Countdown Timer Modal */}
      <RestTimerModal
        initialSeconds={restDurationSec}
        isOpen={showRestTimer}
        soundEnabled={settings.soundEnabled}
        onFinish={() => setShowRestTimer(false)}
        onSkip={() => setShowRestTimer(false)}
      />

      {/* Session Top Bar */}
      <div className="bg-white/95 backdrop-blur-md px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-3 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <button
            onClick={onExitSession}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100"
            title="Minimize workout"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <span className="text-[10px] font-semibold text-sky-600 uppercase tracking-wider block">
              Active Exercise {session.currentExerciseIndex + 1} of {session.exercises.length}
            </span>
            <h2 className="font-heading font-bold text-sm text-slate-900 truncate max-w-[190px]">
              {currentExLog.exerciseName}
            </h2>
          </div>
        </div>

        {/* Stopwatch Controller */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-xl">
          <button
            onClick={() => setIsTimerRunning(!isTimerRunning)}
            className="text-slate-600 hover:text-slate-900"
          >
            {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <span className="font-heading font-bold text-xs text-slate-800 tabular-nums">
            {formatTimer(elapsedSec)}
          </span>
        </div>
      </div>

      {/* Exercise Content */}
      <div className="flex-1 overflow-y-auto max-w-md mx-auto w-full p-4 space-y-4 pb-24">
        {/* Animated Character Mannequin Visual with Primary (Light Blue) & Secondary (Light Red) Highlights */}
        <div className="relative">
          <MannequinVisual
            primaryMuscle={currentExLog.muscle}
            secondaryMuscles={fullExercise?.secondaryMuscles || []}
            exerciseId={currentExLog.exerciseId}
            isAnimatedDefault={true}
            customFrontImage={customFrontImage}
            customBackImage={customBackImage}
          />
        </div>

        {/* Set Logging Table Card */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="font-heading font-bold text-sm text-slate-900">
              Log Your Sets
            </h3>
            <span className="text-xs text-slate-400">
              {currentExLog.sets.filter((s) => s.completed).length} of {currentExLog.sets.length} done
            </span>
          </div>

          <div className="space-y-2.5">
            {currentExLog.sets.map((set, sIdx) => {
              const isDone = set.completed;

              return (
                <div
                  key={sIdx}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-2 ${
                    isDone
                      ? 'bg-emerald-50/70 border-emerald-200'
                      : 'bg-slate-50/80 border-slate-200/80'
                  }`}
                >
                  {/* Set Number */}
                  <div className="flex items-center gap-2 min-w-[56px]">
                    <span className="text-xs font-bold text-slate-700">
                      Set {set.setNumber}
                    </span>
                  </div>

                  {/* Weight Controls */}
                  <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-xl border border-slate-200/80">
                    <button
                      onClick={() => handleUpdateSetValue(sIdx, 'weightKg', -2.5)}
                      className="w-5 h-5 rounded-md hover:bg-slate-100 flex items-center justify-center text-slate-500 active:scale-95"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-semibold text-slate-800 tabular-nums min-w-[34px] text-center">
                      {set.weightKg} <span className="text-[10px] text-slate-400">kg</span>
                    </span>
                    <button
                      onClick={() => handleUpdateSetValue(sIdx, 'weightKg', 2.5)}
                      className="w-5 h-5 rounded-md hover:bg-slate-100 flex items-center justify-center text-slate-500 active:scale-95"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Reps Controls */}
                  <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-xl border border-slate-200/80">
                    <button
                      onClick={() => handleUpdateSetValue(sIdx, 'reps', -1)}
                      className="w-5 h-5 rounded-md hover:bg-slate-100 flex items-center justify-center text-slate-500 active:scale-95"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-semibold text-slate-800 tabular-nums min-w-[32px] text-center">
                      {set.reps} <span className="text-[10px] text-slate-400">reps</span>
                    </span>
                    <button
                      onClick={() => handleUpdateSetValue(sIdx, 'reps', 1)}
                      className="w-5 h-5 rounded-md hover:bg-slate-100 flex items-center justify-center text-slate-500 active:scale-95"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Complete Checkbox */}
                  <button
                    onClick={() => handleToggleSetComplete(sIdx)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                      isDone
                        ? 'bg-emerald-500 text-white shadow-xs scale-105'
                        : 'bg-white border border-slate-300 text-slate-400 hover:border-slate-400'
                    }`}
                    aria-label={isDone ? 'Mark set incomplete' : 'Complete set'}
                  >
                    <Check className={`w-4 h-4 ${isDone ? 'stroke-[3]' : ''}`} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Add Set Button */}
          <button
            onClick={handleAddExtraSet}
            className="w-full mt-3 py-2 rounded-xl border border-dashed border-slate-200 text-xs font-semibold text-slate-600 hover:text-sky-600 hover:border-sky-300 transition-colors flex items-center justify-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Extra Set</span>
          </button>
        </div>
      </div>

      {/* Sticky Bottom Actions */}
      <div className="sticky bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white/95 to-transparent border-t border-slate-100 flex items-center gap-3">
        <button
          onClick={onPromptSummary}
          className="h-12 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold active:scale-[0.98] transition-all"
        >
          Finish Today
        </button>

        <button
          onClick={onFinishExercise}
          className="flex-1 h-12 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-heading font-semibold text-sm shadow-lg shadow-sky-600/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          <span>{isLastExercise ? 'Finish Workout' : 'Next Exercise'}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
