import React from 'react';
import {
  Flame,
  Clock,
  Dumbbell,
  CheckCircle2,
  Zap,
  ArrowRight,
  RotateCcw,
  Trophy,
} from 'lucide-react';
import { WorkoutSession } from '../types';
import { CHARACTER_IMAGE } from '../data/exercises';

interface WorkoutSummaryScreenProps {
  session: WorkoutSession;
  currentStreak: number;
  onSaveAndFinish: () => void;
  onKeepGoing: () => void;
}

export const WorkoutSummaryScreen: React.FC<WorkoutSummaryScreenProps> = ({
  session,
  currentStreak,
  onSaveAndFinish,
  onKeepGoing,
}) => {
  const durationMinutes = Math.max(1, Math.round(session.totalSec / 60));
  const estimatedCalories = Math.round(durationMinutes * 5); // 5 cal per min trained from spec
  const completedExercises = session.exercises.filter((e) =>
    e.sets.some((s) => s.completed)
  );
  const totalSetsCompleted = session.exercises.reduce(
    (acc, ex) => acc + ex.sets.filter((s) => s.completed).length,
    0
  );

  return (
    <div className="flex-1 flex flex-col bg-[#FAF9F6] p-4 sm:p-6 overflow-y-auto max-w-md mx-auto w-full">
      {/* Header Banner */}
      <div className="text-center pt-3 pb-5">
        <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-200 text-amber-500 mx-auto flex items-center justify-center mb-3 shadow-sm">
          <Trophy className="w-8 h-8 fill-amber-400 stroke-amber-600" />
        </div>
        <span className="text-xs font-semibold text-sky-600 uppercase tracking-wider block">
          Session Complete
        </span>
        <h2 className="font-heading font-bold text-2xl text-slate-900 mt-0.5">
          Done for today?
        </h2>
        <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
          Awesome work! Every rep builds endurance, strength, and confidence.
        </p>
      </div>

      {/* Row of 4 Stat Cards */}
      <div className="grid grid-cols-2 gap-2.5 mb-5">
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase block">Time</span>
            <span className="font-heading font-bold text-slate-900 text-lg tabular-nums">
              {durationMinutes} <span className="text-xs font-medium text-slate-400">min</span>
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Dumbbell className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase block">Exercises</span>
            <span className="font-heading font-bold text-slate-900 text-lg tabular-nums">
              {session.exercises.length}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase block">Total Sets</span>
            <span className="font-heading font-bold text-slate-900 text-lg tabular-nums">
              {totalSetsCompleted}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase block">Est. Calories</span>
            <span className="font-heading font-bold text-slate-900 text-lg tabular-nums">
              ~{estimatedCalories} <span className="text-xs font-medium text-slate-400">kcal</span>
            </span>
          </div>
        </div>
      </div>

      {/* Streak Update Flame Banner */}
      <div className="mb-5 bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 rounded-3xl p-4 border border-orange-200/80 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20 shrink-0">
            <Flame className="w-6 h-6 fill-white" />
          </div>
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-orange-700">
              Consistency Streak
            </span>
            <h4 className="font-heading font-bold text-base text-slate-900">
              {currentStreak + 1} Days Active!
            </h4>
            <p className="text-[11px] text-slate-500">
              Way to keep your momentum burning strong.
            </p>
          </div>
        </div>
      </div>

      {/* Exercises Logged Summary */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-xs mb-6">
        <h4 className="font-heading font-bold text-sm text-slate-900 mb-3">
          Exercises Completed
        </h4>

        <div className="space-y-2.5">
          {session.exercises.map((ex, idx) => {
            const completedCount = ex.sets.filter((s) => s.completed).length;
            const topWeight = Math.max(...ex.sets.map((s) => s.weightKg), 0);

            return (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50/80 border border-slate-100"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-semibold text-xs text-slate-800 truncate block">
                      {ex.exerciseName}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {completedCount} sets completed · Max {topWeight} kg
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 mt-auto">
        <button
          onClick={onSaveAndFinish}
          className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-heading font-semibold text-sm shadow-lg shadow-emerald-600/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>Finish for Today & Return Home</span>
        </button>

        <button
          onClick={onKeepGoing}
          className="w-full h-11 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-xs active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span>Keep Going (Add More Sets)</span>
        </button>
      </div>
    </div>
  );
};
