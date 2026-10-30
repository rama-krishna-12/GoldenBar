import React, { useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  ShieldAlert,
  Dumbbell,
  Target,
  Sparkles,
} from 'lucide-react';
import { UserProfile, Goal, FitnessLevel, JointLimitation } from '../types';
import { GOAL_DETAILS } from '../data/exercises';
import { HeaderBar } from '../components/HeaderBar';

interface ProfileSetupScreenProps {
  initialProfile: UserProfile;
  onFinishSetup: (completedProfile: UserProfile) => void;
  onSkip?: () => void;
}

export const ProfileSetupScreen: React.FC<ProfileSetupScreenProps> = ({
  initialProfile,
  onFinishSetup,
  onSkip,
}) => {
  const [step, setStep] = useState<number>(1);

  // Form State
  const [goal, setGoal] = useState<Goal>(initialProfile.goal);
  const [name, setName] = useState(initialProfile.name || 'Rahul');
  const [age, setAge] = useState(initialProfile.age?.toString() || '26');
  const [heightCm, setHeightCm] = useState(initialProfile.heightCm?.toString() || '178');
  const [weightKg, setWeightKg] = useState(initialProfile.weightKg?.toString() || '76.5');
  const [gender, setGender] = useState(initialProfile.gender || 'Male');
  const [experience, setExperience] = useState<string>('6m-2y');
  const [pushups, setPushups] = useState<string>('6-15');
  const [daysPerWeek, setDaysPerWeek] = useState<number>(4);
  const [limitations, setLimitations] = useState<JointLimitation[]>([]);

  const toggleLimitation = (lim: JointLimitation) => {
    setLimitations((prev) =>
      prev.includes(lim) ? prev.filter((item) => item !== lim) : [...prev, lim]
    );
  };

  const handleNext = () => {
    if (step < 5) {
      setStep((s) => s + 1);
    } else {
      // Calculate level based on pushups & experience
      let calculatedLevel: FitnessLevel = 'INTERMEDIATE';
      if (pushups === '0-5' || experience === 'never') {
        calculatedLevel = 'STARTER';
      } else if (pushups === '16+' && (experience === '6m-2y' || experience === '2y+')) {
        calculatedLevel = 'ADVANCED';
      }

      const finalized: UserProfile = {
        id: initialProfile.id || `usr_${Date.now()}`,
        name: name.trim() || 'Athlete',
        goal,
        level: calculatedLevel,
        heightCm: parseFloat(heightCm) || 175,
        weightKg: parseFloat(weightKg) || 75,
        age: parseInt(age, 10) || 25,
        gender,
        limitations,
        daysPerWeek,
        onboardingDone: true,
      };

      onFinishSetup(finalized);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((s) => s - 1);
    } else if (onSkip) {
      onSkip();
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#FAF9F6]">
      <HeaderBar
        title="Setup Profile"
        subtitle={`Step ${step} of 5 · Calibration`}
        onBack={step > 1 ? handleBack : undefined}
        rightAction={
          step > 1 && onSkip ? (
            <button
              onClick={onSkip}
              className="text-xs font-semibold text-slate-400 hover:text-slate-700 px-2 py-1"
            >
              Skip
            </button>
          ) : undefined
        }
      />

      <div className="flex-1 overflow-y-auto max-w-md mx-auto w-full p-4 sm:p-6 pb-24">
        {/* Progress Tracker */}
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-6">
          <div
            className="bg-sky-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>

        {/* STEP 1: Goal */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-sky-600 block">
                Primary Focus
              </span>
              <h2 className="font-heading font-bold text-xl text-slate-900">
                What brings you to GoldenBar?
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Sets and reps are customized to your choice.
              </p>
            </div>

            <div className="space-y-2.5">
              {(Object.keys(GOAL_DETAILS) as Goal[]).map((goalKey) => {
                const isSelected = goal === goalKey;
                const details = GOAL_DETAILS[goalKey];

                return (
                  <button
                    key={goalKey}
                    onClick={() => setGoal(goalKey)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-sky-50/80 border-sky-400 ring-1 ring-sky-400/40 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-heading font-bold text-sm text-slate-900">
                        {details.name}
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-sky-600 stroke-[3]" />}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{details.tagline}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: Demographics */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-sky-600 block">
                About You
              </span>
              <h2 className="font-heading font-bold text-xl text-slate-900">
                Basic Biometrics
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Used purely to calculate training load and energy burn.
              </p>
            </div>

            <div className="space-y-3 bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="Rahul"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs text-slate-800 font-semibold"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Gender (optional)
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs text-slate-800 font-semibold bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Prefer not to say">Other / Neutral</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs text-slate-800 font-semibold"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs text-slate-800 font-semibold"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Experience */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-sky-600 block">
                Background
              </span>
              <h2 className="font-heading font-bold text-xl text-slate-900">
                How long have you been training?
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Helps determine exercise complexity and baseline weights.
              </p>
            </div>

            <div className="space-y-2.5">
              {[
                { id: 'never', title: 'Never trained', desc: 'Starting from scratch at home or gym' },
                { id: 'under_6m', title: 'Under 6 months', desc: 'Still learning exercise form and machines' },
                { id: '6m-2y', title: '6 months to 2 years', desc: 'Consistent training history with weights' },
                { id: '2y+', title: 'Over 2 years', desc: 'Experienced lifter familiar with compound lifts' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setExperience(opt.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all ${
                    experience === opt.id
                      ? 'bg-sky-50/80 border-sky-400 ring-1 ring-sky-400/40 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-bold text-sm text-slate-900">
                      {opt.title}
                    </span>
                    {experience === opt.id && <Check className="w-4 h-4 text-sky-600 stroke-[3]" />}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: Strength Check & Availability */}
        {step === 4 && (
          <div className="space-y-5">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-sky-600 block">
                Form & Benchmark
              </span>
              <h2 className="font-heading font-bold text-xl text-slate-900">
                Quick Strength Check
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                How many strict push-ups can you perform in a single set?
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: '0-5', label: '0 to 5', sub: 'Starter' },
                { id: '6-15', label: '6 to 15', sub: 'Intermediate' },
                { id: '16+', label: '16 or more', sub: 'Advanced' },
              ].map((b) => (
                <button
                  key={b.id}
                  onClick={() => setPushups(b.id)}
                  className={`py-3.5 px-2 rounded-2xl border text-center transition-all ${
                    pushups === b.id
                      ? 'bg-sky-50/90 border-sky-400 text-sky-900 font-bold ring-1 ring-sky-400/40'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  <span className="font-heading block text-base font-bold">{b.label}</span>
                  <span className="text-[10px] text-slate-400 font-medium block mt-0.5">{b.sub}</span>
                </button>
              ))}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-2">
                How many days a week can you train? ({daysPerWeek} days)
              </label>
              <div className="flex gap-2">
                {[2, 3, 4, 5, 6].map((num) => (
                  <button
                    key={num}
                    onClick={() => setDaysPerWeek(num)}
                    className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                      daysPerWeek === num
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Limitations */}
        {step === 5 && (
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-sky-600 block">
                Joint Protection
              </span>
              <h2 className="font-heading font-bold text-xl text-slate-900">
                Any Joint Limitations?
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                We will automatically filter out or replace exercises that stress these joints.
              </p>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={() => setLimitations([])}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                  limitations.length === 0
                    ? 'bg-sky-50/80 border-sky-400 ring-1 ring-sky-400/40'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-heading font-bold text-sm text-slate-900">
                    No limitations (All joints healthy)
                  </span>
                  {limitations.length === 0 && <Check className="w-4 h-4 text-sky-600 stroke-[3]" />}
                </div>
              </button>

              {(['KNEES', 'LOWER_BACK', 'SHOULDERS', 'WRISTS'] as JointLimitation[]).map((lim) => {
                const isSelected = limitations.includes(lim);
                return (
                  <button
                    key={lim}
                    onClick={() => toggleLimitation(lim)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-amber-50/80 border-amber-400 ring-1 ring-amber-400/40'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-heading font-bold text-sm text-slate-900">
                        {lim === 'LOWER_BACK' ? 'Lower Back Caution' : `${lim.charAt(0) + lim.slice(1).toLowerCase()} Sensitivity`}
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-amber-600 stroke-[3]" />}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Substitutes heavy shear load movements with safer alternatives.
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Next/Finish CTA */}
      <div className="sticky bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white/95 to-transparent border-t border-slate-100">
        <button
          onClick={handleNext}
          className="w-full h-12 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-heading font-semibold text-sm shadow-lg shadow-sky-600/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          <span>{step === 5 ? 'Complete Calibration' : 'Next Step'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
