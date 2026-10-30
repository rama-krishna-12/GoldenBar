import React, { useState } from 'react';
import { Target, Zap, Dumbbell, ShieldCheck, Heart, ArrowRight } from 'lucide-react';
import { Goal } from '../types';
import { GOAL_DETAILS } from '../data/exercises';
import { HeaderBar } from '../components/HeaderBar';

interface GoalPickerScreenProps {
  currentGoal: Goal;
  onSelectGoal: (goal: Goal) => void;
  onBack: () => void;
  onContinue: () => void;
}

export const GoalPickerScreen: React.FC<GoalPickerScreenProps> = ({
  currentGoal,
  onSelectGoal,
  onBack,
  onContinue,
}) => {
  const [selectedGoal, setSelectedGoal] = useState<Goal>(currentGoal);

  const goalIcons: Record<Goal, React.ElementType> = {
    WEIGHT_LOSS: Zap,
    MUSCLE_BUILDING: Dumbbell,
    LEAN_TONING: Target,
    STRENGTH_ENDURANCE: ShieldCheck,
    GENERAL_FITNESS: Heart,
  };

  const handleSelect = (goal: Goal) => {
    setSelectedGoal(goal);
    onSelectGoal(goal);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#FAF9F6]">
      <HeaderBar title="Choose Your Goal" subtitle="Customizes sets, reps & rest across all workouts" onBack={onBack} />

      <div className="flex-1 p-4 sm:p-6 overflow-y-auto max-w-md mx-auto w-full pb-24">
        <div className="mb-4">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Step 1 · Workout Objective
          </span>
          <h2 className="font-heading font-bold text-xl text-slate-900">
            What is your primary goal?
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            You can adjust this anytime or select a different goal for a single session.
          </p>
        </div>

        {/* 2-Column Grid (1st Left, 2nd Right, 3rd Left, 4th Right, 5th Left) */}
        <div className="grid grid-cols-2 gap-3">
          {(Object.keys(GOAL_DETAILS) as Goal[]).map((goalKey) => {
            const goal = GOAL_DETAILS[goalKey];
            const Icon = goalIcons[goalKey];
            const isSelected = selectedGoal === goalKey;

            return (
              <button
                key={goalKey}
                onClick={() => handleSelect(goalKey)}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all duration-200 flex flex-col items-start gap-2.5 active:scale-[0.97] cursor-pointer overflow-hidden ${
                  isSelected
                    ? 'bg-sky-50/90 border-sky-500 shadow-sm ring-2 ring-sky-400/30'
                    : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-xs'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-sky-500 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="w-full min-w-0">
                  <h3 className="font-heading font-bold text-slate-900 text-sm leading-tight truncate">
                    {goal.name}
                  </h3>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sticky Bottom Continue Button */}
      <div className="sticky bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white/95 to-transparent border-t border-slate-100">
        <button
          onClick={onContinue}
          className="w-full h-12 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-heading font-semibold text-sm shadow-lg shadow-sky-600/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          <span>Continue to Muscle Groups</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
