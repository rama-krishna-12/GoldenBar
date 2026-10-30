import React from 'react';
import { Filter } from 'lucide-react';
import { Goal, MuscleGroup } from '../types';
import { MUSCLE_METADATA, GOAL_DETAILS, CHARACTER_IMAGE, CHARACTER_BACK_IMAGE, EXERCISE_DATABASE } from '../data/exercises';
import { HeaderBar } from '../components/HeaderBar';

interface MuscleTilesScreenProps {
  goal: Goal;
  customFrontImage?: string;
  customBackImage?: string;
  onSelectMuscle: (muscle: MuscleGroup) => void;
  onChangeGoal: () => void;
  onBack: () => void;
}

export const MuscleTilesScreen: React.FC<MuscleTilesScreenProps> = ({
  goal,
  customFrontImage,
  customBackImage,
  onSelectMuscle,
  onChangeGoal,
  onBack,
}) => {
  const muscleGroups: MuscleGroup[] = [
    'WARMUP',
    'CHEST',
    'BACK',
    'SHOULDERS',
    'BICEPS',
    'TRICEPS',
    'LEGS',
    'CORE',
    'CARDIO',
  ];

  // Specific zoom/crop positions for the character image per muscle group
  const muscleImageFocus: Record<MuscleGroup, string> = {
    WARMUP: 'object-center scale-90',
    CHEST: 'object-[center_28%] scale-150',
    BACK: 'object-[center_28%] scale-150',
    SHOULDERS: 'object-[center_24%] scale-175',
    BICEPS: 'object-[center_35%] scale-175',
    TRICEPS: 'object-[center_35%] scale-175',
    LEGS: 'object-[center_75%] scale-150',
    CORE: 'object-[center_42%] scale-175',
    CARDIO: 'object-center scale-100',
  };

  return (
    <div className="flex-1 flex flex-col bg-[#FAF9F6]">
      <HeaderBar
        title="Workouts"
        subtitle="Choose target muscle group"
        onBack={onBack}
        rightAction={
          <button
            onClick={onChangeGoal}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200/80 text-xs font-medium transition-colors"
          >
            <Filter className="w-3 h-3 text-sky-500" />
            <span className="truncate max-w-[90px]">{GOAL_DETAILS[goal].name}</span>
          </button>
        }
      />

      <div className="flex-1 p-4 sm:p-5 overflow-y-auto max-w-md mx-auto w-full pb-10">
        {/* Goal Indicator banner */}
        <div className="mb-4 bg-white rounded-2xl p-3 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-sky-500"></div>
            <span className="text-xs text-slate-500">Prescription profile:</span>
            <span className="text-xs font-semibold text-slate-800">{GOAL_DETAILS[goal].name}</span>
          </div>
          <button
            onClick={onChangeGoal}
            className="text-[11px] font-semibold text-sky-600 hover:underline"
          >
            Switch Goal
          </button>
        </div>

        {/* 2-Column Grid of 9 Rounded Muscle Tiles (1st Left, 2nd Right, etc.) */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          {muscleGroups.map((muscle) => {
            const meta = MUSCLE_METADATA[muscle];

            return (
              <button
                key={muscle}
                onClick={() => onSelectMuscle(muscle)}
                className="group relative bg-white rounded-2xl p-2.5 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-sky-300 transition-all duration-200 text-left flex flex-col overflow-hidden active:scale-[0.97] cursor-pointer"
              >
                {/* Character Mannequin Preview Container with Muscle Colored in Light Blue */}
                <div className="relative w-full h-28 rounded-xl bg-slate-900 overflow-hidden mb-2 border border-slate-200/60 shadow-inner flex items-center justify-center">
                  <img
                    src={muscle === 'BACK' ? (customBackImage || CHARACTER_BACK_IMAGE) : (customFrontImage || CHARACTER_IMAGE)}
                    alt={`${meta.name} Anatomical Target`}
                    className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.8] ${muscleImageFocus[muscle]}`}
                  />
                  {/* Primary Muscle Colored in Light Blue (#38BDF8) with color blend mode */}
                  <div className="absolute inset-0 bg-sky-400/40 mix-blend-color pointer-events-none group-hover:bg-sky-400/60 transition-colors" />
                  <div className="absolute inset-0 bg-gradient-to-t from-sky-600/30 via-transparent to-transparent pointer-events-none" />

                  {/* Muscle Tag chip with Light Blue Indicator */}
                  <div className="absolute bottom-1.5 left-1.5 bg-slate-900/95 backdrop-blur-md px-2 py-0.5 rounded-lg border border-sky-400/50 text-[9px] font-bold text-sky-300 flex items-center gap-1 shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_6px_#38BDF8] animate-pulse"></span>
                    <span>{meta.highlightArea}</span>
                  </div>
                </div>

                {/* Only Title - No Subtitle or Count, No Arrow Head */}
                <div className="w-full min-w-0">
                  <h3 className="font-heading font-bold text-slate-900 text-sm leading-tight truncate group-hover:text-sky-600 transition-colors">
                    {meta.name}
                  </h3>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
