import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface HeaderBarProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  title,
  subtitle,
  onBack,
  rightAction,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/70 px-4 py-3 flex items-center justify-between gap-3 min-h-[56px]">
      <div className="flex items-center gap-2.5 min-w-0">
        {onBack && (
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-700 hover:bg-slate-100 active:scale-95 transition-all shrink-0"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </button>
        )}
        <div className="min-w-0">
          <h1 className="font-heading font-semibold text-base sm:text-lg text-slate-900 truncate leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[11px] text-slate-600 truncate -mt-0.5 font-medium">{subtitle}</p>
          )}
        </div>
      </div>

      {rightAction && <div className="shrink-0 flex items-center">{rightAction}</div>}
    </header>
  );
};
