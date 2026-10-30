import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Moon,
  ChevronRight,
  Edit3,
  Flame,
  ArrowRight,
  RotateCcw,
  Check,
  MoveVertical,
  Sparkles,
  Play
} from 'lucide-react';
import { PlanDay, Goal, MuscleGroup, Exercise } from '../types';
import { EXERCISE_DATABASE, MUSCLE_METADATA } from '../data/exercises';
import { HeaderBar } from '../components/HeaderBar';

interface PlansScreenProps {
  planDays: PlanDay[];
  currentDayIndex: number;
  goal: Goal;
  isPlanActive: boolean;
  onActivatePlan: () => void;
  onDeactivatePlan?: () => void;
  onSelectDayToTrain: (day: PlanDay) => void;
  onUpdatePlanDay: (updatedDay: PlanDay) => void;
  onBack: () => void;
}

export const PlansScreen: React.FC<PlansScreenProps> = ({
  planDays,
  currentDayIndex,
  goal,
  isPlanActive,
  onActivatePlan,
  onDeactivatePlan,
  onSelectDayToTrain,
  onUpdatePlanDay,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<'30day' | 'weekly'>('30day');
  const [editingDay, setEditingDay] = useState<PlanDay | null>(null);
  const [selectedExerciseIds, setSelectedExerciseIds] = useState<string[]>([]);

  const todayDay = planDays.find((d) => d.dayIndex === currentDayIndex) || planDays[0];

  const handleOpenDaySetup = (day: PlanDay) => {
    if (day.isRest) return;
    setEditingDay(day);
    setSelectedExerciseIds(day.exerciseIds || []);
  };

  const handleToggleExerciseSelection = (id: string) => {
    setSelectedExerciseIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        if (prev.length >= 4) {
          return [...prev.slice(1), id];
        }
        return [...prev, id];
      }
    });
  };

  const handleSaveDaySetup = () => {
    if (!editingDay) return;
    const updated: PlanDay = {
      ...editingDay,
      exerciseIds: selectedExerciseIds,
    };
    onUpdatePlanDay(updated);
    setEditingDay(null);
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="flex-1 flex flex-col bg-[#FAF9F6]">
      <HeaderBar
        title="Training Plans"
        subtitle={isPlanActive ? `Day ${todayDay.dayIndex} of 30 Active` : '30-Day Periodized Program'}
        onBack={onBack}
        rightAction={
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab('30day')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeTab === '30day'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              30-Day
            </button>
            <button
              onClick={() => setActiveTab('weekly')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'weekly'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Weekly
            </button>
          </div>
        }
      />

      {/* S10 Day Setup Modal (Pick 4) */}
      {editingDay && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className="text-[10px] font-semibold text-sky-600 uppercase tracking-wider">
                  Day {editingDay.dayIndex} Setup · {editingDay.muscle}
                </span>
                <h3 className="font-heading font-bold text-base text-slate-900">
                  Pick 4 Exercises
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  These 4 will repeat whenever {editingDay.muscle} day returns.
                </p>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-sky-50 text-sky-700 border border-sky-200">
                {selectedExerciseIds.length}/4
              </span>
            </div>

            {/* Curated list for this muscle */}
            <div className="flex-1 overflow-y-auto space-y-2 py-2 pr-1">
              {EXERCISE_DATABASE.filter((e) => e.muscle === editingDay.muscle).map((ex) => {
                const isSelected = selectedExerciseIds.includes(ex.id);
                const rx = ex.prescriptions[goal];

                return (
                  <button
                    key={ex.id}
                    onClick={() => handleToggleExerciseSelection(ex.id)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between gap-2.5 ${
                      isSelected
                        ? 'bg-sky-50/80 border-sky-300 ring-1 ring-sky-300'
                        : 'bg-white border-slate-200/80 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <h4 className="font-heading font-semibold text-xs text-slate-900">
                        {ex.name}
                      </h4>
                      <span className="text-[10px] text-slate-500">
                        {rx.sets} sets · {rx.reps} reps
                      </span>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-sky-600 border-sky-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
              <button
                onClick={() => setEditingDay(null)}
                className="flex-1 h-10 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDaySetup}
                disabled={selectedExerciseIds.length === 0}
                className="flex-1 h-10 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs shadow-md shadow-sky-600/20 disabled:bg-slate-200 disabled:text-slate-400 transition-all"
              >
                Save ({selectedExerciseIds.length}/4)
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto max-w-md mx-auto w-full p-4 sm:p-5 space-y-4 pb-20">
        {/* Top Status Card: Active or Inactive State */}
        {!isPlanActive ? (
          /* Inactive Plan Banner */
          <div className="bg-gradient-to-br from-amber-50 via-white to-orange-50 rounded-3xl p-5 border border-amber-200/90 shadow-sm animate-in fade-in duration-200">
            <div className="flex items-start gap-3.5 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full inline-block">
                  30-Day Routine · Inactive
                </span>
                <h2 className="font-heading font-bold text-lg text-slate-900 mt-1">
                  Activate 30-Day Guided Plan
                </h2>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Start a structured 30-day program with automated muscle rotations, built-in rest recovery, and progressive overload.
                </p>
              </div>
            </div>

            <button
              onClick={onActivatePlan}
              className="w-full h-11 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-heading font-semibold text-xs shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99] mt-3"
            >
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>Activate 30-Day Plan & Set Today's Workout</span>
            </button>
          </div>
        ) : (
          /* Active Plan Card */
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs animate-in fade-in duration-200">
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-orange-600">
                  Active Cycle
                </span>
                <h2 className="font-heading font-bold text-xl text-slate-900">
                  Day {todayDay.dayIndex} of 30
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {todayDay.isRest ? 'Rest Day' : `Today: ${todayDay.muscle} Focus`}
                </p>
              </div>

              <div className="w-11 h-11 rounded-2xl bg-orange-50 border border-orange-200/80 flex items-center justify-center text-orange-500">
                <Flame className="w-6 h-6 fill-orange-500" />
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-3">
              <div
                className="bg-gradient-to-r from-orange-400 to-sky-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${(todayDay.dayIndex / 30) * 100}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Progress: {Math.round((todayDay.dayIndex / 30) * 100)}%</span>
              <span>{30 - todayDay.dayIndex} days remaining</span>
            </div>

            {!todayDay.isRest && (
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => onSelectDayToTrain(todayDay)}
                  className="flex-1 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start Day {todayDay.dayIndex} ({todayDay.muscle})</span>
                </button>
                <button
                  onClick={() => handleOpenDaySetup(todayDay)}
                  className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors"
                  title="Edit 4 Exercises"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 1: 30-Day Grid */}
        {activeTab === '30day' ? (
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading font-bold text-sm text-slate-900">
                30-Day Program Timeline
              </h3>
              <span className="text-[11px] text-slate-500">
                {isPlanActive ? 'Tap any day to view or edit' : 'Preview mode'}
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {planDays.map((day) => {
                const isToday = isPlanActive && day.dayIndex === currentDayIndex;
                const isPassed = isPlanActive && day.dayIndex < currentDayIndex;
                const isCompleted = day.completed;

                return (
                  <button
                    key={day.dayIndex}
                    onClick={() => {
                      if (!day.isRest) {
                        onSelectDayToTrain(day);
                      }
                    }}
                    disabled={day.isRest}
                    className={`aspect-square rounded-2xl p-1.5 flex flex-col items-center justify-between border transition-all text-center relative ${
                      isToday
                        ? 'border-orange-500 bg-orange-500 text-white shadow-md shadow-orange-500/20 ring-2 ring-orange-200'
                        : isCompleted
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                        : isPassed
                        ? 'border-slate-200 bg-slate-50 text-slate-400'
                        : day.isRest
                        ? 'border-slate-100 bg-slate-50/50 text-slate-400 cursor-not-allowed'
                        : 'border-slate-200/90 bg-white hover:border-sky-300 hover:bg-sky-50/40 text-slate-800'
                    }`}
                  >
                    <span className="text-[10px] font-bold">D{day.dayIndex}</span>

                    {day.isRest ? (
                      <Moon className="w-3.5 h-3.5 text-slate-400" />
                    ) : isCompleted ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <span className="text-[8px] font-semibold truncate max-w-full">
                        {day.muscle.slice(0, 3)}
                      </span>
                    )}

                    <span
                      className={`text-[8px] font-medium leading-none ${
                        isToday ? 'text-white' : 'text-slate-400'
                      }`}
                    >
                      {day.isRest ? 'Rest' : `${day.exerciseIds.length}ex`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Tab 2: Weekly View */
          <div className="space-y-2.5">
            {daysOfWeek.map((dayName, idx) => {
              const matchedPlanDay = planDays[idx % planDays.length];

              return (
                <div
                  key={dayName}
                  className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-xs flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-700">
                      {dayName.slice(0, 3)}
                    </div>
                    <div>
                      <h4 className="font-heading font-semibold text-xs text-slate-900">
                        {dayName}
                      </h4>
                      <span className="text-[11px] text-slate-500">
                        {matchedPlanDay.isRest ? 'Rest & Recovery' : `${matchedPlanDay.muscle} Hypertrophy`}
                      </span>
                    </div>
                  </div>

                  {!matchedPlanDay.isRest ? (
                    <button
                      onClick={() => onSelectDayToTrain(matchedPlanDay)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1 shadow-xs"
                    >
                      <span>Train</span>
                    </button>
                  ) : (
                    <span className="text-xs font-medium text-slate-400 px-2 py-1">
                      Rest
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
