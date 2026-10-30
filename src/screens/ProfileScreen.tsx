import React, { useState } from 'react';
import {
  User,
  History,
  Settings,
  Bell,
  ShieldCheck,
  Dumbbell,
  Calendar as CalendarIcon,
  Clock,
  RotateCcw,
  Sparkles,
  Info,
  LogOut,
  Users,
  Smartphone,
  Download,
  FileCode,
  FolderArchive,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { UserProfile, WorkoutSession, AppSettings, AppUser } from '../types';
import { CHARACTER_IMAGE, GOAL_DETAILS } from '../data/exercises';
import { HeaderBar } from '../components/HeaderBar';

interface ProfileScreenProps {
  profile: UserProfile;
  pastSessions: WorkoutSession[];
  settings: AppSettings;
  currentUser?: AppUser | null;
  customFrontImage?: string;
  onUpdateSettings: (settings: AppSettings) => void;
  onRetakeSetup: () => void;
  onResetAllData: () => void;
  onLogout?: () => void;
  onBack: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  profile,
  pastSessions,
  settings,
  currentUser,
  customFrontImage,
  onUpdateSettings,
  onRetakeSetup,
  onResetAllData,
  onLogout,
  onBack,
}) => {
  const [activeSubModal, setActiveSubModal] = useState<'history' | 'settings' | 'safety' | 'download' | null>(null);
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [selectedSessionDate, setSelectedSessionDate] = useState<string>('Yesterday');
  const isAdmin = currentUser?.role === 'ADMIN';

  const handleDownload = async (url: string, filename: string) => {
    try {
      setDownloadingFile(filename);
      setDownloadError(null);
      const cacheBustUrl = `${url}?t=${Date.now()}`;
      const response = await fetch(cacheBustUrl, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }
      const blob = await response.blob();
      if (blob.size < 50000) {
        throw new Error('Downloaded file was an auth redirect (under 50KB). Please open the direct link in browser.');
      }
      const blobUrl = window.URL.createObjectURL(blob);
      const tempLink = document.createElement('a');
      tempLink.href = blobUrl;
      tempLink.download = filename;
      document.body.appendChild(tempLink);
      tempLink.click();
      document.body.removeChild(tempLink);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err: any) {
      setDownloadError(err?.message || 'Download failed');
    } finally {
      setDownloadingFile(null);
    }
  };

  const selectedSession =
    pastSessions.find((s) => s.date === selectedSessionDate) || pastSessions[0];

  return (
    <div className="flex-1 flex flex-col bg-[#FAF9F6]">
      <HeaderBar title="My Profile" subtitle="Account, history & personal preferences" onBack={onBack} />

      {/* S15 Workout History Modal */}
      {activeSubModal === 'history' && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-[10px] font-semibold text-sky-600 uppercase tracking-wider">
                  Workout History
                </span>
                <h3 className="font-heading font-bold text-base text-slate-900">
                  Past Training Logs
                </h3>
              </div>
              <button
                onClick={() => setActiveSubModal(null)}
                className="text-xs font-semibold text-slate-400 hover:text-slate-700 px-2 py-1"
              >
                Done
              </button>
            </div>

            {/* Date Pill Selector */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1 no-scrollbar">
              {pastSessions.map((sess) => (
                <button
                  key={sess.id}
                  onClick={() => setSelectedSessionDate(sess.date)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedSessionDate === sess.date
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {sess.date}
                </button>
              ))}
            </div>

            {/* Selected Day's Workout Details */}
            {selectedSession ? (
              <div className="flex-1 overflow-y-auto space-y-3">
                <div className="bg-sky-50/70 p-3 rounded-2xl border border-sky-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-sky-600" />
                    <span className="text-slate-700 font-medium">
                      Duration: {Math.round(selectedSession.totalSec / 60)} mins
                    </span>
                  </div>
                  <span className="font-semibold text-sky-700">
                    ~{selectedSession.estCalories} kcal
                  </span>
                </div>

                <div className="space-y-2">
                  {selectedSession.exercises.map((ex, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-heading font-bold text-xs text-slate-900">
                          {ex.exerciseName}
                        </h4>
                        <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                          {ex.muscle}
                        </span>
                      </div>

                      <div className="grid grid-cols-4 gap-1.5 pt-1 text-[11px]">
                        {ex.sets.map((s) => (
                          <div
                            key={s.setNumber}
                            className="bg-white p-1.5 rounded-lg border border-slate-200/80 text-center"
                          >
                            <span className="text-[9px] text-slate-400 block font-semibold">
                              S{s.setNumber}
                            </span>
                            <span className="font-bold text-slate-800">
                              {s.weightKg}k × {s.reps}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                No past sessions recorded yet. Complete a workout to see it here!
              </div>
            )}
          </div>
        </div>
      )}

      {/* S16 Reminders & Settings Modal */}
      {activeSubModal === 'settings' && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 flex flex-col animate-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-heading font-bold text-base text-slate-900">
                Settings & Reminders
              </h3>
              <button
                onClick={() => setActiveSubModal(null)}
                className="text-xs font-semibold text-sky-600 hover:text-sky-700"
              >
                Close
              </button>
            </div>

            {/* Water Interval Setting */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Water Reminder Frequency
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[10, 15, 20].map((mins) => (
                  <button
                    key={mins}
                    onClick={() =>
                      onUpdateSettings({ ...settings, waterIntervalMin: mins })
                    }
                    className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                      settings.waterIntervalMin === mins
                        ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Every {mins}m
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Discreet 5-second popup during active workouts.
              </p>
            </div>

            {/* Weight Units */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Weight Units
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['kg', 'lb'] as const).map((unit) => (
                  <button
                    key={unit}
                    onClick={() => onUpdateSettings({ ...settings, units: unit })}
                    className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                      settings.units === unit
                        ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {unit.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Sound Effects */}
            <div className="flex items-center justify-between py-1">
              <div>
                <span className="text-xs font-semibold text-slate-800 block">
                  Audio & Timer Cues
                </span>
                <span className="text-[10px] text-slate-400">
                  Subtle sound feedback on set logging
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, soundEnabled: e.target.checked })
                }
                className="w-5 h-5 rounded-md text-sky-600 focus:ring-sky-500"
              />
            </div>

            {/* Reset App Data */}
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  onResetAllData();
                  setActiveSubModal(null);
                }}
                className="w-full py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Clean Prototype Defaults</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Safety Modal */}
      {activeSubModal === 'safety' && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 flex flex-col animate-in zoom-in-95 duration-200">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-base text-slate-900 mb-2">
              Safety & Health Advisory
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              GoldenBar provides general physical fitness, movement guidance, and strength exercise protocols. It does not constitute medical advice or clinical diagnosis. If you experience acute joint discomfort, sharp pain, or have preexisting cardiovascular conditions, cease activity immediately and consult a healthcare professional.
            </p>
            <button
              onClick={() => setActiveSubModal(null)}
              className="w-full h-10 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-colors"
            >
              Understood
            </button>
          </div>
        </div>
      )}

      {/* S16 Download .APK & Android Project Modal */}
      {activeSubModal === 'download' && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 flex flex-col max-h-[88vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-slate-900">
                    Download for Android
                  </h3>
                  <span className="text-[10px] text-slate-500 font-medium">
                    .APK & Complete Android Studio Project
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveSubModal(null)}
                className="text-xs font-semibold text-slate-400 hover:text-slate-700 px-2 py-1"
              >
                Done
              </button>
            </div>

            {downloadError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{downloadError}</span>
              </div>
            )}

            <div className="space-y-3.5 my-2">
              {/* Option 1: Android Studio Complete Project (.ZIP) - RECOMMENDED FOR APK */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-200 shadow-2xs">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-amber-500 text-white font-bold text-[11px] flex items-center justify-center shadow-xs">
                      1
                    </span>
                    <div>
                      <h4 className="font-heading font-bold text-xs text-slate-900">
                        Android Studio Project Folder
                      </h4>
                      <span className="text-[10px] font-mono font-semibold text-amber-700">
                        goldenbar-android-studio-project.zip · 3.5 MB
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                    Official
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mb-2.5 leading-relaxed">
                  Complete native project ready to open in Android Studio. Includes Gradle wrapper, Capacitor native bridge, and compiled GoldenBar assets.
                </p>
                <button
                  onClick={() => handleDownload('/goldenbar-android-studio-project.zip', 'goldenbar-android-studio-project.zip')}
                  disabled={downloadingFile === 'goldenbar-android-studio-project.zip'}
                  className="w-full h-10 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 text-slate-950 font-heading font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                >
                  {downloadingFile === 'goldenbar-android-studio-project.zip' ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Downloading 3.5 MB...</span>
                    </>
                  ) : (
                    <>
                      <FolderArchive className="w-4 h-4 text-slate-950" />
                      <span>Download Android Studio Project (.ZIP)</span>
                    </>
                  )}
                </button>
              </div>

              {/* Option 2: Instant PWA Mobile Installation (100% Native Feel, 0 Build) */}
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-2xs">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center shadow-xs">
                      2
                    </span>
                    <div>
                      <h4 className="font-heading font-bold text-xs text-slate-900">
                        Instant Mobile App (No Build)
                      </h4>
                      <span className="text-[10px] font-mono font-semibold text-emerald-700">
                        Direct Chrome / Safari Install
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                    Fastest
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mb-1 leading-relaxed">
                  Open on mobile Chrome and tap <strong>"Install app"</strong> in browser menu. Installs immediately with native launcher icon!
                </p>
              </div>

              {/* Option 3: Full Project Source (.ZIP) */}
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <FileCode className="w-4 h-4 text-slate-600" />
                    <span className="font-heading font-bold text-xs text-slate-800">
                      Full Source Code (.ZIP)
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">11.9 MB</span>
                </div>
                <p className="text-[10px] text-slate-500 mb-2">
                  Complete TypeScript, React, Vite, and Tailwind source code.
                </p>
                <button
                  onClick={() => handleDownload('/goldenbar-full-project.zip', 'goldenbar-full-project.zip')}
                  disabled={downloadingFile === 'goldenbar-full-project.zip'}
                  className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer"
                >
                  {downloadingFile === 'goldenbar-full-project.zip' ? (
                    <span>Downloading 11.9 MB...</span>
                  ) : (
                    <>
                      <span>Download Full Source (.ZIP)</span>
                      <Download className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>

              {/* 1-Click Guide */}
              <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200/80 text-[10px] text-slate-700 space-y-1">
                <span className="font-heading font-bold text-xs text-amber-900 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                  How to Build APK in Android Studio:
                </span>
                <ol className="list-decimal list-inside space-y-0.5 leading-relaxed text-slate-700">
                  <li>Unzip <code className="bg-amber-100/80 px-1 rounded font-mono">goldenbar-android-studio-project.zip</code></li>
                  <li>In Android Studio: <strong>File &gt; Open...</strong> and choose folder</li>
                  <li>Click <strong>Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</strong></li>
                  <li>Click <strong>locate</strong> to grab your signed <code className="bg-amber-100/80 px-1 rounded font-mono">app-debug.apk</code>!</li>
                </ol>
              </div>
            </div>

            <button
              onClick={() => setActiveSubModal(null)}
              className="w-full mt-2 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-heading font-semibold text-xs transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto max-w-md mx-auto w-full p-4 sm:p-5 space-y-4 pb-20">
        {/* Profile Card with Mannequin Character */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 overflow-hidden shrink-0 border border-slate-200 shadow-sm">
            <img
              src={customFrontImage || CHARACTER_IMAGE}
              alt="Profile Character Avatar"
              className="w-full h-full object-cover object-top"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-heading font-bold text-lg text-slate-900 truncate">
                {currentUser?.username || profile.name}
              </h2>
              {currentUser && (
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    isAdmin
                      ? 'bg-slate-900 text-amber-300'
                      : currentUser.isPaid
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {isAdmin ? 'Admin' : currentUser.isPaid ? 'Paid Pro' : 'Free Tier'}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-100 text-sky-700">
                {GOAL_DETAILS[profile.goal].name}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                {profile.level}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {profile.heightCm} cm · {profile.weightKg} kg · {profile.age} yrs
            </p>
          </div>
        </div>

        {/* Current Active Plan Card */}
        <div className="bg-white rounded-3xl p-5 border border-orange-100 shadow-xs">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-orange-600 block">
            Program Track
          </span>
          <h3 className="font-heading font-bold text-base text-slate-900 mt-0.5">
            30-Day {GOAL_DETAILS[profile.goal].name}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Structured rotation · 4 training days/week · Day 12 active
          </p>
        </div>

        {/* 2-Column Action Tiles (1st Left, 2nd Right, 3rd Left, 4th Right, etc.) */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setActiveSubModal('history')}
            className="w-full text-left p-3.5 rounded-2xl bg-white border border-slate-200/90 hover:border-sky-300 shadow-xs hover:shadow-md transition-all active:scale-[0.97] flex flex-col items-start gap-2.5 cursor-pointer overflow-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 shadow-2xs">
              <History className="w-5 h-5" />
            </div>
            <div className="w-full min-w-0">
              <h3 className="font-heading font-bold text-sm text-slate-900 truncate">
                Workout History
              </h3>
            </div>
          </button>

          <button
            onClick={() => setActiveSubModal('settings')}
            className="w-full text-left p-3.5 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-300 shadow-xs hover:shadow-md transition-all active:scale-[0.97] flex flex-col items-start gap-2.5 cursor-pointer overflow-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 shadow-2xs">
              <Settings className="w-5 h-5" />
            </div>
            <div className="w-full min-w-0">
              <h3 className="font-heading font-bold text-sm text-slate-900 truncate">
                Settings
              </h3>
            </div>
          </button>

          <button
            onClick={() => setActiveSubModal('download')}
            className="w-full text-left p-3.5 rounded-2xl bg-white border border-amber-300/80 hover:border-amber-400 shadow-xs hover:shadow-md transition-all active:scale-[0.97] flex flex-col items-start gap-2.5 cursor-pointer overflow-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 shadow-2xs">
              <Smartphone className="w-5 h-5 text-amber-700" />
            </div>
            <div className="w-full min-w-0">
              <h3 className="font-heading font-bold text-sm text-slate-900 truncate">
                Download APK
              </h3>
            </div>
          </button>

          <button
            onClick={onRetakeSetup}
            className="w-full text-left p-3.5 rounded-2xl bg-white border border-slate-200/90 hover:border-orange-300 shadow-xs hover:shadow-md transition-all active:scale-[0.97] flex flex-col items-start gap-2.5 cursor-pointer overflow-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 shadow-2xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="w-full min-w-0">
              <h3 className="font-heading font-bold text-sm text-slate-900 truncate">
                Recalibrate Goal
              </h3>
            </div>
          </button>

          <button
            onClick={() => setActiveSubModal('safety')}
            className="w-full text-left p-3.5 rounded-2xl bg-white border border-slate-200/90 hover:border-emerald-300 shadow-xs hover:shadow-md transition-all active:scale-[0.97] flex flex-col items-start gap-2.5 cursor-pointer overflow-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="w-full min-w-0">
              <h3 className="font-heading font-bold text-sm text-slate-900 truncate">
                Safety Notice
              </h3>
            </div>
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              className="w-full text-left p-3.5 rounded-2xl bg-white border border-rose-200 hover:border-rose-300 shadow-xs hover:shadow-md transition-all active:scale-[0.97] flex flex-col items-start gap-2.5 cursor-pointer overflow-hidden"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 shadow-2xs">
                <LogOut className="w-5 h-5" />
              </div>
              <div className="w-full min-w-0">
                <h3 className="font-heading font-bold text-sm text-rose-600 truncate">
                  Sign Out
                </h3>
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
