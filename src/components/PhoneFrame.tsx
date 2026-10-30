import React, { useState } from 'react';
import { Download, FolderArchive, Smartphone, X, FileCode, CheckCircle2, Loader2, AlertCircle, Share2 } from 'lucide-react';
import { ShareModal } from './ShareModal';

interface PhoneFrameProps {
  children: React.ReactNode;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({ children }) => {
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

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

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-slate-800 flex items-center justify-center p-0 sm:p-4 md:p-6 transition-colors selection:bg-sky-200">
      {/* Mobile Frame Container */}
      <div className="relative w-full sm:max-w-[420px] h-[100dvh] sm:h-[880px] bg-[#FAF9F6] sm:rounded-[44px] sm:shadow-2xl sm:shadow-slate-500/20 sm:border-[8px] sm:border-slate-800 flex flex-col overflow-hidden sm:ring-1 sm:ring-slate-900/10">
        {/* Android Status Bar (Shown on desktop frame for native fidelity) */}
        <div className="hidden sm:flex h-9 bg-white/95 backdrop-blur-md px-6 items-center justify-between text-xs font-medium text-slate-700 z-40 shrink-0 border-b border-slate-100 select-none">
          <span className="font-semibold text-[11px] text-slate-800">{currentTime}</span>
          {/* Center camera punch-hole */}
          <div className="w-3.5 h-3.5 rounded-full bg-slate-800 shadow-inner"></div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
            <span className="text-[10px] font-bold">5G</span>
            <div className="w-4 h-2.5 border border-slate-600 rounded-xs flex items-center p-0.5">
              <div className="w-full h-full bg-slate-600 rounded-xs"></div>
            </div>
          </div>
        </div>

        {/* Persistent Top GoldenBar App Bar (Visible on Top of ALL screens) */}
        <div className="bg-slate-900 text-white px-3.5 py-2.5 flex items-center justify-between shrink-0 z-50 border-b border-amber-500/30 shadow-xs select-none">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 text-slate-950 font-black text-xs flex items-center justify-center shadow-xs">
              GB
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-bold text-sm tracking-tight text-white">
                GoldenBar
              </span>
              <span className="text-[10px] font-semibold text-amber-400 font-mono px-1.5 py-0.5 bg-amber-400/10 rounded border border-amber-400/30">
                AI Gym Coach
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Share App with Friends to Test Button */}
            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 hover:bg-amber-300 font-bold text-[10px] transition-all shadow-xs active:scale-95 cursor-pointer"
              title="Share App with Friends to Test"
            >
              <Share2 className="w-3 h-3 text-slate-950" />
              <span>Share App</span>
            </button>

            {/* Quick Download .APK & Android Studio Project Modal Button */}
            <button
              onClick={() => setShowDownloadModal(true)}
              className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 border border-white/20 text-white text-[10px] font-bold transition-all shadow-2xs active:scale-95 cursor-pointer"
              title="Download APK & Android Studio Project"
            >
              <Download className="w-3 h-3 text-white" />
              <span>Project / APK</span>
            </button>

            <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="hidden xs:inline">Online</span>
            </div>
          </div>
        </div>

        {/* Screen Content Body */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative bg-[#FAF9F6] text-slate-800 flex flex-col">
          {children}
        </div>

        {/* Global Download Center Modal */}
        {showDownloadModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
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
                      Project Folder & Mobile Installation
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowDownloadModal(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {downloadError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{downloadError}</span>
                </div>
              )}

              <div className="space-y-3 my-2">
                {/* Option 1: Android Studio Complete Project (.ZIP) - RECOMMENDED FOR APK */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-200 shadow-2xs">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-amber-500 text-white font-bold text-[11px] flex items-center justify-center shadow-xs">
                        1
                      </span>
                      <div>
                        <h4 className="font-heading font-bold text-xs text-slate-900">
                          Android Studio Project Folder
                        </h4>
                        <span className="text-[9px] font-mono font-semibold text-amber-700">
                          goldenbar-android-studio-project.zip · 3.5 MB
                        </span>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                      Official
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-600 mb-2.5 leading-relaxed">
                    Complete Android Studio project with Gradle wrapper, Capacitor native bridge, and compiled GoldenBar assets.
                  </p>
                  <button
                    onClick={() => handleDownload('/goldenbar-android-studio-project.zip', 'goldenbar-android-studio-project.zip')}
                    disabled={downloadingFile === 'goldenbar-android-studio-project.zip'}
                    className="w-full h-9 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 text-slate-950 font-heading font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                  >
                    {downloadingFile === 'goldenbar-android-studio-project.zip' ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Downloading 3.5 MB...</span>
                      </>
                    ) : (
                      <>
                        <FolderArchive className="w-3.5 h-3.5" />
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
                        <span className="text-[9px] font-mono font-semibold text-emerald-700">
                          Direct Chrome / Safari Install
                        </span>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                      Fastest
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-600 mb-2 leading-relaxed">
                    Open on mobile Chrome and tap <strong>"Install app"</strong> in browser menu. Installs immediately with native launcher icon!
                  </p>
                </div>

                {/* Option 3: Full Project Source (.ZIP) */}
                <div className="p-3 rounded-2xl bg-white border border-slate-200">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <FileCode className="w-3.5 h-3.5 text-slate-600" />
                      <span className="font-heading font-bold text-xs text-slate-800">
                        Full Source Code (.ZIP)
                      </span>
                    </div>
                    <span className="text-[9px] text-slate-400 font-mono">11.9 MB</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mb-1.5">
                    Entire TypeScript, React, Vite, and Tailwind source codebase.
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
                        <Download className="w-3 h-3" />
                      </>
                    )}
                  </button>
                </div>

                {/* Quick 1-Click Guide */}
                <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200/80 text-[10px] text-slate-700 space-y-1">
                  <span className="font-heading font-bold text-xs text-amber-900 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                    How to Generate APK in Android Studio:
                  </span>
                  <ol className="list-decimal list-inside space-y-0.5 leading-relaxed text-slate-700">
                    <li>Extract <code className="bg-amber-100/80 px-1 rounded font-mono">goldenbar-android-studio-project.zip</code></li>
                    <li>In Android Studio: <strong>File &gt; Open...</strong> and choose folder</li>
                    <li>Click <strong>Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</strong></li>
                    <li>Click <strong>locate</strong> to grab your signed <code className="bg-amber-100/80 px-1 rounded font-mono">app-debug.apk</code>!</li>
                  </ol>
                </div>
              </div>

              <button
                onClick={() => setShowDownloadModal(false)}
                className="w-full mt-2 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-heading font-semibold text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Global Share Modal */}
        <ShareModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} />

        {/* Android Gesture Bar (Desktop frame bottom) */}
        <div className="hidden sm:flex h-4 bg-white/95 backdrop-blur-md items-center justify-center shrink-0 z-40 border-t border-slate-100">
          <div className="w-28 h-1 bg-slate-300 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};
