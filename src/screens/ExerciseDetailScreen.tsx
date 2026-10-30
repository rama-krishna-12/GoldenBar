import React from 'react';
import { Play, AlertCircle, Dumbbell, ShieldAlert, CheckCircle2, ChevronRight, Activity } from 'lucide-react';
import { Exercise, Goal } from '../types';
import { GOAL_DETAILS } from '../data/exercises';
import { HeaderBar } from '../components/HeaderBar';
import { MannequinVisual } from '../components/MannequinVisual';

interface ExerciseDetailScreenProps {
  exercise: Exercise;
  goal: Goal;
  customFrontImage?: string;
  customBackImage?: string;
  onOpenAdminImages?: () => void;
  onStartSingleExercise: (exercise: Exercise) => void;
  onBack: () => void;
}

export const ExerciseDetailScreen: React.FC<ExerciseDetailScreenProps> = ({
  exercise,
  goal,
  customFrontImage,
  customBackImage,
  onOpenAdminImages,
  onStartSingleExercise,
  onBack,
}) => {
  const rx = exercise.prescriptions[goal];

  return (
    <div className="flex-1 flex flex-col bg-[#FAF9F6]">
      <HeaderBar
        title={exercise.name}
        subtitle={exercise.equipment}
        onBack={onBack}
        rightAction={
          onOpenAdminImages ? (
            <button
              onClick={onOpenAdminImages}
              className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-[11px] font-semibold text-slate-700 flex items-center gap-1 transition-colors"
              title="Admin: Change exercise or character image"
            >
              <span>Change Image</span>
            </button>
          ) : undefined
        }
      />

      <div className="flex-1 overflow-y-auto max-w-md mx-auto w-full pb-24">
        {/* Animated Mannequin Visual with Light Blue (Primary) & Light Red (Secondary) Muscle Highlighting */}
        <div className="p-4 pb-0">
          <MannequinVisual
            primaryMuscle={exercise.muscle}
            secondaryMuscles={exercise.secondaryMuscles}
            exerciseId={exercise.id}
            isAnimatedDefault={true}
            customFrontImage={customFrontImage}
            customBackImage={customBackImage}
          />
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          {/* Target & Secondary Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-sky-100 text-sky-800 border border-sky-300 text-xs font-semibold flex items-center gap-1.5 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-sky-500 shadow-[0_0_6px_#0284C7]"></span>
              <span>Primary: {exercise.muscle}</span>
            </span>
            {exercise.secondaryMuscles.map((sec) => (
              <span
                key={sec}
                className="px-2.5 py-1 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs font-medium flex items-center gap-1.5 shadow-xs"
              >
                <span className="w-2 h-2 rounded-full bg-red-400 shadow-[0_0_6px_#F87171]"></span>
                <span>Secondary: {sec}</span>
              </span>
            ))}
            <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium flex items-center gap-1">
              <Dumbbell className="w-3 h-3 text-slate-500" />
              <span>{exercise.equipment}</span>
            </span>
          </div>

          {/* Goal Prescription Card */}
          <div className="bg-white rounded-3xl p-4 border border-sky-200/80 shadow-xs ring-1 ring-sky-500/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-sky-600">
                Prescription for {GOAL_DETAILS[goal].name}
              </span>
              <span className="text-[11px] text-slate-400">Curated plan</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="bg-sky-50/70 p-2.5 rounded-2xl border border-sky-100">
                <span className="text-[10px] text-slate-500 font-semibold block uppercase">Sets</span>
                <span className="font-heading font-bold text-lg text-slate-900">{rx.sets}</span>
              </div>
              <div className="bg-sky-50/70 p-2.5 rounded-2xl border border-sky-100">
                <span className="text-[10px] text-slate-500 font-semibold block uppercase">Reps</span>
                <span className="font-heading font-bold text-lg text-slate-900">{rx.reps}</span>
              </div>
              <div className="bg-sky-50/70 p-2.5 rounded-2xl border border-sky-100">
                <span className="text-[10px] text-slate-500 font-semibold block uppercase">Rest</span>
                <span className="font-heading font-bold text-lg text-slate-900">{rx.restSec}s</span>
              </div>
            </div>
          </div>

          {/* Step-by-Step Execution */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs">
            <h3 className="font-heading font-bold text-sm text-slate-900 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Step-by-Step Instructions</span>
            </h3>

            <div className="space-y-2.5">
              {exercise.steps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed flex-1">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Common Mistakes Card */}
          <div className="bg-amber-50/70 rounded-3xl p-4 border border-amber-200/80 shadow-xs">
            <h3 className="font-heading font-bold text-sm text-amber-900 mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>Common Mistakes to Avoid</span>
            </h3>
            <ul className="space-y-1.5 pl-1">
              {exercise.mistakes.map((mistake, idx) => (
                <li key={idx} className="text-xs text-amber-800 flex items-start gap-2">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>{mistake}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Joint Stress Caution if applicable */}
          {exercise.jointStress && exercise.jointStress.length > 0 && (
            <div className="bg-rose-50/60 rounded-2xl p-3 border border-rose-200 text-xs text-rose-800 flex items-center gap-2.5">
              <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
              <span>
                Places load on <strong>{exercise.jointStress.join(', ')}</strong>. Maintain strict control.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Bottom Start Button */}
      <div className="sticky bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white/95 to-transparent border-t border-slate-100">
        <button
          onClick={() => onStartSingleExercise(exercise)}
          className="w-full h-12 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-heading font-semibold text-sm shadow-lg shadow-sky-600/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Start This Exercise Now</span>
        </button>
      </div>
    </div>
  );
};
