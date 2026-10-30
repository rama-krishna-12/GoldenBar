import React, { useEffect } from 'react';
import { Droplet, X } from 'lucide-react';

interface WaterReminderBannerProps {
  show: boolean;
  onDismiss: () => void;
  autoDismissMs?: number;
}

export const WaterReminderBanner: React.FC<WaterReminderBannerProps> = ({
  show,
  onDismiss,
  autoDismissMs = 5000,
}) => {
  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, autoDismissMs);
    return () => clearTimeout(timer);
  }, [show, onDismiss, autoDismissMs]);

  if (!show) return null;

  return (
    <div className="fixed top-14 left-4 right-4 z-50 flex items-center justify-center pointer-events-none animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="pointer-events-auto max-w-sm w-full bg-white/95 backdrop-blur-md rounded-2xl shadow-xl shadow-sky-500/10 border border-sky-200/80 p-3.5 flex items-center justify-between gap-3 ring-1 ring-sky-400/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center shrink-0">
            <Droplet className="w-5 h-5 text-sky-500 fill-sky-500 animate-bounce" />
          </div>
          <div>
            <h4 className="font-heading font-semibold text-xs sm:text-sm text-slate-900 leading-tight">
              Time for a sip of water
            </h4>
            <p className="text-[11px] text-slate-500 leading-tight">
              Stay hydrated to sustain muscle power and focus.
            </p>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
