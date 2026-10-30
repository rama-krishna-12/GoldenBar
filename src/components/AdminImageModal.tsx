import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Link as LinkIcon,
  RotateCcw,
  Check,
  Image as ImageIcon,
  Shield,
  Layers,
  Sparkles,
  Eye,
  AlertCircle,
} from 'lucide-react';
import { AdminImageConfig, Exercise } from '../types';
import { CHARACTER_IMAGE, CHARACTER_BACK_IMAGE, EXERCISE_DATABASE } from '../data/exercises';

interface AdminImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AdminImageConfig;
  onUpdateConfig: (newConfig: AdminImageConfig) => void;
}

export const AdminImageModal: React.FC<AdminImageModalProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
}) => {
  const [activeTab, setActiveTab] = useState<'character' | 'exercises'>('character');

  // Input states for URL insertion
  const [frontUrl, setFrontUrl] = useState('');
  const [backUrl, setBackUrl] = useState('');
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>(
    EXERCISE_DATABASE[0]?.id || ''
  );
  const [exerciseUrl, setExerciseUrl] = useState('');
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);

  // Hidden file inputs
  const frontFileInputRef = useRef<HTMLInputElement>(null);
  const backFileInputRef = useRef<HTMLInputElement>(null);
  const exerciseFileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle local file upload via FileReader
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'front' | 'back' | 'exercise'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (target === 'front') {
        onUpdateConfig({ ...config, frontCharacter: dataUrl });
        triggerNotice('Front character image updated!');
      } else if (target === 'back') {
        onUpdateConfig({ ...config, backCharacter: dataUrl });
        triggerNotice('Back character image updated!');
      } else if (target === 'exercise') {
        onUpdateConfig({
          ...config,
          exerciseOverrides: {
            ...config.exerciseOverrides,
            [selectedExerciseId]: dataUrl,
          },
        });
        triggerNotice('Exercise image updated!');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset input
  };

  const triggerNotice = (msg: string) => {
    setSaveSuccessNotice(msg);
    setTimeout(() => setSaveSuccessNotice(null), 3000);
  };

  const handleApplyFrontUrl = () => {
    if (!frontUrl.trim()) return;
    onUpdateConfig({ ...config, frontCharacter: frontUrl.trim() });
    setFrontUrl('');
    triggerNotice('Front character URL applied!');
  };

  const handleApplyBackUrl = () => {
    if (!backUrl.trim()) return;
    onUpdateConfig({ ...config, backCharacter: backUrl.trim() });
    setBackUrl('');
    triggerNotice('Back character URL applied!');
  };

  const handleApplyExerciseUrl = () => {
    if (!exerciseUrl.trim()) return;
    onUpdateConfig({
      ...config,
      exerciseOverrides: {
        ...config.exerciseOverrides,
        [selectedExerciseId]: exerciseUrl.trim(),
      },
    });
    setExerciseUrl('');
    triggerNotice('Exercise image URL applied!');
  };

  const handleResetCharacter = (view: 'front' | 'back' | 'all') => {
    if (view === 'front') {
      onUpdateConfig({ ...config, frontCharacter: CHARACTER_IMAGE });
      triggerNotice('Front character reset to default.');
    } else if (view === 'back') {
      onUpdateConfig({ ...config, backCharacter: CHARACTER_BACK_IMAGE });
      triggerNotice('Back character reset to default.');
    } else {
      onUpdateConfig({
        ...config,
        frontCharacter: CHARACTER_IMAGE,
        backCharacter: CHARACTER_BACK_IMAGE,
      });
      triggerNotice('Both character views reset to default.');
    }
  };

  const handleRemoveExerciseOverride = () => {
    const updated = { ...config.exerciseOverrides };
    delete updated[selectedExerciseId];
    onUpdateConfig({ ...config, exerciseOverrides: updated });
    triggerNotice('Exercise reset to default graphic.');
  };

  const currentExercise = EXERCISE_DATABASE.find((e) => e.id === selectedExerciseId);
  const currentExerciseImg =
    config.exerciseOverrides[selectedExerciseId] ||
    (currentExercise?.muscle === 'BACK' ? config.backCharacter : config.frontCharacter);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-xs">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-bold text-base text-slate-900">
                  Admin Asset Studio
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
                  Image Manager
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Change character models, upload custom poses, or override exercise images
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success toast inside modal */}
        {saveSuccessNotice && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 flex items-center gap-2 text-xs font-semibold text-emerald-800 animate-in fade-in duration-150">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{saveSuccessNotice}</span>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="px-5 pt-3 pb-1 border-b border-slate-100 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('character')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'character'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Character 360° Views</span>
          </button>
          <button
            onClick={() => setActiveTab('exercises')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'exercises'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Exercise Overrides</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* TAB 1: Character 360 Models */}
          {activeTab === 'character' && (
            <div className="space-y-6">
              {/* SECTION 1: FRONT VIEW */}
              <div className="p-4 rounded-3xl border border-slate-200 bg-slate-50/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
                    <h4 className="font-heading font-bold text-sm text-slate-900">
                      Front Character View (Anterior)
                    </h4>
                  </div>
                  {config.frontCharacter !== CHARACTER_IMAGE && (
                    <button
                      onClick={() => handleResetCharacter('front')}
                      className="text-[11px] font-semibold text-rose-600 hover:underline flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  {/* Thumbnail */}
                  <div className="w-20 h-28 rounded-2xl bg-slate-900 overflow-hidden border border-slate-300 shadow-sm shrink-0 flex items-center justify-center relative">
                    <img
                      src={config.frontCharacter}
                      alt="Front Character"
                      className="w-full h-full object-contain"
                    />
                    <span className="absolute bottom-1 bg-black/70 text-white text-[9px] px-1 rounded font-mono">
                      0° Front
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex-1 space-y-2">
                    {/* Hidden input */}
                    <input
                      type="file"
                      ref={frontFileInputRef}
                      onChange={(e) => handleFileUpload(e, 'front')}
                      accept="image/*"
                      className="hidden"
                    />

                    <button
                      onClick={() => frontFileInputRef.current?.click()}
                      className="w-full h-9 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5 text-sky-600" />
                      <span>Upload Image from Device</span>
                    </button>

                    {/* URL Input */}
                    <div className="flex items-center gap-1.5">
                      <input
                        type="url"
                        placeholder="Or paste image URL (https://...)"
                        value={frontUrl}
                        onChange={(e) => setFrontUrl(e.target.value)}
                        className="flex-1 h-8 px-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                      />
                      <button
                        onClick={handleApplyFrontUrl}
                        disabled={!frontUrl.trim()}
                        className="h-8 px-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold disabled:bg-slate-200 disabled:text-slate-400"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: BACK VIEW */}
              <div className="p-4 rounded-3xl border border-slate-200 bg-slate-50/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                    <h4 className="font-heading font-bold text-sm text-slate-900">
                      Back Character View (Posterior)
                    </h4>
                  </div>
                  {config.backCharacter !== CHARACTER_BACK_IMAGE && (
                    <button
                      onClick={() => handleResetCharacter('back')}
                      className="text-[11px] font-semibold text-rose-600 hover:underline flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  {/* Thumbnail */}
                  <div className="w-20 h-28 rounded-2xl bg-slate-900 overflow-hidden border border-slate-300 shadow-sm shrink-0 flex items-center justify-center relative">
                    <img
                      src={config.backCharacter}
                      alt="Back Character"
                      className="w-full h-full object-contain"
                    />
                    <span className="absolute bottom-1 bg-black/70 text-white text-[9px] px-1 rounded font-mono">
                      180° Back
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex-1 space-y-2">
                    <input
                      type="file"
                      ref={backFileInputRef}
                      onChange={(e) => handleFileUpload(e, 'back')}
                      accept="image/*"
                      className="hidden"
                    />

                    <button
                      onClick={() => backFileInputRef.current?.click()}
                      className="w-full h-9 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5 text-red-500" />
                      <span>Upload Image from Device</span>
                    </button>

                    {/* URL Input */}
                    <div className="flex items-center gap-1.5">
                      <input
                        type="url"
                        placeholder="Or paste image URL (https://...)"
                        value={backUrl}
                        onChange={(e) => setBackUrl(e.target.value)}
                        className="flex-1 h-8 px-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                      />
                      <button
                        onClick={handleApplyBackUrl}
                        disabled={!backUrl.trim()}
                        className="h-8 px-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold disabled:bg-slate-200 disabled:text-slate-400"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reset All Characters */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
                <span className="text-slate-500">Need to restore original 3D models?</span>
                <button
                  onClick={() => handleResetCharacter('all')}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Restore Defaults</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Exercise Overrides */}
          {activeTab === 'exercises' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Select Exercise to Customize
                </label>
                <select
                  value={selectedExerciseId}
                  onChange={(e) => setSelectedExerciseId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs text-slate-900 font-semibold bg-white"
                >
                  {EXERCISE_DATABASE.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.name} ({ex.muscle})
                    </option>
                  ))}
                </select>
              </div>

              {currentExercise && (
                <div className="p-4 rounded-3xl border border-slate-200 bg-slate-50/70 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-heading font-bold text-sm text-slate-900">
                        {currentExercise.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Target: {currentExercise.muscle} · {currentExercise.equipment}
                      </p>
                    </div>

                    {config.exerciseOverrides[selectedExerciseId] && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                        Custom Image Active
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Thumbnail preview */}
                    <div className="w-20 h-24 rounded-2xl bg-slate-900 overflow-hidden border border-slate-300 shadow-sm shrink-0 flex items-center justify-center">
                      <img
                        src={currentExerciseImg}
                        alt={currentExercise.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex-1 space-y-2">
                      <input
                        type="file"
                        ref={exerciseFileInputRef}
                        onChange={(e) => handleFileUpload(e, 'exercise')}
                        accept="image/*"
                        className="hidden"
                      />

                      <button
                        onClick={() => exerciseFileInputRef.current?.click()}
                        className="w-full h-9 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5 text-sky-600" />
                        <span>Upload Custom Photo</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <input
                          type="url"
                          placeholder="Paste image URL (https://...)"
                          value={exerciseUrl}
                          onChange={(e) => setExerciseUrl(e.target.value)}
                          className="flex-1 h-8 px-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                        />
                        <button
                          onClick={handleApplyExerciseUrl}
                          disabled={!exerciseUrl.trim()}
                          className="h-8 px-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold disabled:bg-slate-200 disabled:text-slate-400"
                        >
                          Apply
                        </button>
                      </div>

                      {config.exerciseOverrides[selectedExerciseId] && (
                        <button
                          onClick={handleRemoveExerciseOverride}
                          className="text-[11px] font-semibold text-rose-600 hover:underline flex items-center gap-1 pt-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Remove Custom Image</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="p-3 bg-sky-50 rounded-2xl border border-sky-100 text-[11px] text-sky-800 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-600 shrink-0" />
                <span>
                  Any custom image uploaded here will appear across the exercise list, details, and workout tracker automatically.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-md shadow-sky-600/20 active:scale-95 transition-all"
          >
            Save & Done
          </button>
        </div>
      </div>
    </div>
  );
};
