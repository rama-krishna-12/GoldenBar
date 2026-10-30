import React, { useState } from 'react';
import {
  Droplets,
  Plus,
  Minus,
  Flame,
  Award,
  Utensils,
  CheckCircle2,
  Play,
  Clock,
  Sparkles,
} from 'lucide-react';
import { DailyEntry, MealItem, PlanDay } from '../types';
import { HeaderBar } from '../components/HeaderBar';

interface DailyTrackerScreenProps {
  dailyEntry: DailyEntry;
  currentPlanDay: PlanDay;
  onUpdateDailyEntry: (updated: DailyEntry) => void;
  onStartTodayWorkout: () => void;
  onBack: () => void;
}

export const DailyTrackerScreen: React.FC<DailyTrackerScreenProps> = ({
  dailyEntry,
  currentPlanDay,
  onUpdateDailyEntry,
  onStartTodayWorkout,
  onBack,
}) => {
  const [newMealText, setNewMealText] = useState('');
  const [newMealType, setNewMealType] = useState<MealItem['type']>('Lunch');
  const [isAddingMeal, setIsAddingMeal] = useState(false);

  const handleAdjustWater = (delta: number) => {
    const nextVal = Math.min(12, Math.max(0, dailyEntry.waterGlasses + delta));
    onUpdateDailyEntry({
      ...dailyEntry,
      waterGlasses: nextVal,
    });
  };

  const handleAddMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMealText.trim()) return;

    const newMeal: MealItem = {
      id: `m_${Date.now()}`,
      type: newMealType,
      text: newMealText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    onUpdateDailyEntry({
      ...dailyEntry,
      meals: [...dailyEntry.meals, newMeal],
    });

    setNewMealText('');
    setIsAddingMeal(false);
  };

  const streakBadges = [
    { title: '3-Day Fire', days: 3, achieved: dailyEntry.streakDays >= 3 },
    { title: '7-Day Warrior', days: 7, achieved: dailyEntry.streakDays >= 7 },
    { title: '14-Day Beast', days: 14, achieved: dailyEntry.streakDays >= 14 },
    { title: '30-Day Master', days: 30, achieved: dailyEntry.streakDays >= 30 },
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#FAF9F6]">
      <HeaderBar title="Daily Tracker" subtitle="Hydration, nutrition notes & streak badges" onBack={onBack} />

      <div className="flex-1 overflow-y-auto max-w-md mx-auto w-full p-4 sm:p-5 space-y-4 pb-20">
        {/* Top Workout Status Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                dailyEntry.workoutDone
                  ? 'bg-emerald-100 text-emerald-600'
                  : 'bg-sky-100 text-sky-600'
              }`}
            >
              {dailyEntry.workoutDone ? (
                <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
              ) : (
                <Play className="w-6 h-6 fill-current" />
              )}
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 block">
                Today's Workout
              </span>
              <h3 className="font-heading font-bold text-base text-slate-900">
                {dailyEntry.workoutDone
                  ? 'Completed for Today!'
                  : `${currentPlanDay.muscle} Session Pending`}
              </h3>
              <p className="text-xs text-slate-600">
                {dailyEntry.workoutDone
                  ? 'Great job keeping consistent!'
                  : '4 exercises lined up · ~30-40 min'}
              </p>
            </div>
          </div>

          {!dailyEntry.workoutDone && (
            <button
              onClick={onStartTodayWorkout}
              className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-md shadow-sky-600/20 active:scale-95 transition-all shrink-0"
            >
              Start
            </button>
          )}
        </div>

        {/* Water Card (8 Glasses) */}
        <div className="bg-white rounded-3xl p-5 border border-sky-100 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
                <Droplets className="w-5 h-5 fill-sky-600" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-sm text-slate-900">
                  Water Intake
                </h3>
                <span className="text-xs text-slate-500 font-medium">
                  {dailyEntry.waterGlasses} of {dailyEntry.targetWaterGlasses} glasses (~2.0L target)
                </span>
              </div>
            </div>

            {/* Stepper buttons */}
            <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200/80">
              <button
                onClick={() => handleAdjustWater(-1)}
                className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center justify-center active:scale-95 transition-all"
                title="Minus 1 glass"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleAdjustWater(1)}
                className="w-7 h-7 rounded-lg bg-sky-600 text-white hover:bg-sky-700 flex items-center justify-center active:scale-95 shadow-xs transition-all"
                title="Plus 1 glass"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 8 Glass Icons Grid */}
          <div className="grid grid-cols-4 gap-2.5 pt-1 mb-2">
            {Array.from({ length: dailyEntry.targetWaterGlasses }).map((_, i) => {
              const isFilled = i < dailyEntry.waterGlasses;
              return (
                <button
                  key={i}
                  onClick={() => {
                    const nextVal = i + 1 === dailyEntry.waterGlasses ? i : i + 1;
                    onUpdateDailyEntry({ ...dailyEntry, waterGlasses: nextVal });
                  }}
                  className={`py-3 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all ${
                    isFilled
                      ? 'bg-sky-500 text-white border-sky-400 shadow-sm shadow-sky-500/20 scale-102'
                      : 'bg-slate-50/80 border-slate-200 text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <Droplets className={`w-5 h-5 ${isFilled ? 'fill-white' : ''}`} />
                  <span className={`text-[10px] font-bold ${isFilled ? 'text-sky-100' : 'text-slate-400'}`}>
                    250 ml
                  </span>
                </button>
              );
            })}
          </div>

          {dailyEntry.waterGlasses >= dailyEntry.targetWaterGlasses && (
            <div className="mt-3 p-2.5 bg-sky-50 rounded-xl border border-sky-200 text-center text-xs text-sky-800 font-semibold flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-500" />
              <span>Hydration target reached today! Excellent work.</span>
            </div>
          )}
        </div>

        {/* Streak & Badges Card */}
        <div className="bg-white rounded-3xl p-5 border border-orange-100 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                <Flame className="w-5 h-5 fill-orange-600" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-sm text-slate-900">
                  {dailyEntry.streakDays} Day Streak
                </h3>
                <span className="text-xs text-slate-500">Keep training to level up</span>
              </div>
            </div>
            <span className="text-xs font-bold text-orange-700 bg-orange-50 px-2.5 py-1 rounded-xl border border-orange-200">
              Active Flame
            </span>
          </div>

          {/* Badges Row */}
          <div className="grid grid-cols-4 gap-2 pt-2">
            {streakBadges.map((badge, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-2xl border text-center flex flex-col items-center justify-center gap-1 ${
                  badge.achieved
                    ? 'bg-amber-50/80 border-amber-300 text-amber-900 shadow-xs'
                    : 'bg-slate-50/70 border-slate-200/70 text-slate-400 opacity-60'
                }`}
              >
                <Award className={`w-5 h-5 ${badge.achieved ? 'text-amber-500 fill-amber-300' : 'text-slate-300'}`} />
                <span className="text-[10px] font-bold leading-tight mt-0.5">
                  {badge.title}
                </span>
                <span className="text-[9px] text-slate-500 font-medium">
                  {badge.days} days
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Meals & Nutrition Note Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Utensils className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-sm text-slate-900">
                Daily Nutrition Notes
              </h3>
            </div>
            <button
              onClick={() => setIsAddingMeal(!isAddingMeal)}
              className="text-xs font-semibold text-sky-600 hover:text-sky-700 bg-sky-50 px-2.5 py-1 rounded-xl"
            >
              {isAddingMeal ? 'Close' : '+ Log Meal'}
            </button>
          </div>

          {isAddingMeal && (
            <form onSubmit={handleAddMeal} className="mb-4 p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5">
              <div className="flex gap-2">
                {(['Breakfast', 'Lunch', 'Dinner', 'Snack'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setNewMealType(type)}
                    className={`flex-1 py-1 rounded-lg text-xs font-semibold transition-all ${
                      newMealType === type
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="e.g. 3 eggs, brown toast & black coffee..."
                value={newMealText}
                onChange={(e) => setNewMealText(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                autoFocus
              />
              <button
                type="submit"
                className="w-full h-9 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                Save Meal Entry
              </button>
            </form>
          )}

          <div className="space-y-2">
            {dailyEntry.meals.map((meal) => (
              <div
                key={meal.id}
                className="p-3 rounded-2xl bg-slate-50/70 border border-slate-100 flex items-start justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md">
                      {meal.type}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">{meal.time}</span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium mt-1 leading-snug">
                    {meal.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
