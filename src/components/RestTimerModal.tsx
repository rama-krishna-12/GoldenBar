import React, { useEffect, useState, useRef } from 'react';
import { Timer, Plus, SkipForward, Play, Pause } from 'lucide-react';
import { playTimerFinishSound } from '../utils/sound';

interface RestTimerModalProps {
  initialSeconds: number;
  isOpen: boolean;
  soundEnabled?: boolean;
  onFinish: () => void;
  onSkip: () => void;
}

export const RestTimerModal: React.FC<RestTimerModalProps> = ({
  initialSeconds,
  isOpen,
  soundEnabled = true,
  onFinish,
  onSkip,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isPaused, setIsPaused] = useState(false);
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  useEffect(() => {
    if (isOpen) {
      setSecondsLeft(initialSeconds);
      setIsPaused(false);
    }
  }, [isOpen, initialSeconds]);

  useEffect(() => {
    if (!isOpen || isPaused) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          playTimerFinishSound(soundEnabled);
          onFinishRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, isPaused, soundEnabled]);

  if (!isOpen) return null;

  const totalTime = Math.max(initialSeconds, secondsLeft);
  const progressPercent = totalTime > 0 ? ((totalTime - secondsLeft) / totalTime) * 100 : 100;
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xs w-full p-6 shadow-2xl border border-slate-100 flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
        <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center mb-3">
          <Timer className="w-5 h-5" />
        </div>

        <h3 className="font-heading font-semibold text-slate-800 text-base">Rest & Recover</h3>
        <p className="text-xs text-slate-500 mb-5">Catch your breath before the next set</p>

        {/* Circular Display */}
        <div className="relative w-36 h-36 flex items-center justify-center mb-6">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="44"
              className="stroke-slate-100"
              strokeWidth="6"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="44"
              className="stroke-sky-500 transition-all duration-1000 ease-linear"
              strokeWidth="6"
              strokeDasharray={2 * Math.PI * 44}
              strokeDashoffset={(2 * Math.PI * 44) * (1 - progressPercent / 100)}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="font-heading font-bold text-3xl text-slate-900 tracking-tight tabular-nums">
              {formattedTime}
            </span>
            <span className="text-[10px] text-slate-600 font-medium">RECOVERY</span>
          </div>
        </div>

        {/* Quick Adjustment and Skip */}
        <div className="flex items-center gap-2 w-full mb-3">
          <button
            onClick={() => setSecondsLeft((s) => s + 15)}
            className="flex-1 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-xs font-medium text-slate-700 flex items-center justify-center gap-1 active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+15s</span>
          </button>
          <button
            onClick={() => setIsPaused((p) => !p)}
            className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-700 flex items-center justify-center active:scale-95 transition-all"
          >
            {isPaused ? <Play className="w-4 h-4 ml-0.5" /> : <Pause className="w-4 h-4" />}
          </button>
          <button
            onClick={onSkip}
            className="flex-1 h-10 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-xs font-medium text-sky-700 flex items-center justify-center gap-1 active:scale-95 transition-all"
          >
            <SkipForward className="w-3.5 h-3.5" />
            <span>Skip</span>
          </button>
        </div>
      </div>
    </div>
  );
};
