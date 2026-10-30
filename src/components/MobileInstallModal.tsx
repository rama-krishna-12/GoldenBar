import React, { useState } from 'react';
import { Smartphone, Download, QrCode, Copy, Check, ExternalLink, X, Shield, ArrowRight, Laptop, Sparkles, CheckCircle2, FolderArchive, Play, Terminal, Layers, FileCode } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface MobileInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileInstallModal: React.FC<MobileInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'studio' | 'direct' | 'ios'>('studio');
  const [copied, setCopied] = useState<boolean>(false);
  const [installSuccess, setInstallSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://ais-pre-z44ondzil6uzzp2jd6vw4a-981296436478.asia-east1.run.app';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(currentUrl)}&color=0284c7&bgcolor=ffffff&qzone=1`;

  const handleCopyUrl = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleTriggerInstall = async () => {
    const success = await install();
    if (success) {
      setInstallSuccess(true);
    }
  };

  const [downloadingStudio, setDownloadingStudio] = useState<boolean>(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const handleDownloadZip = async (url: string, filename: string) => {
    try {
      setDownloadingStudio(true);
      setDownloadError(null);
      // Bust browser cache completely
      const cacheBustUrl = `${url}?v=${Date.now()}`;
      const response = await fetch(cacheBustUrl, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }
      const blob = await response.blob();
      if (blob.size < 50000) {
        throw new Error('Downloaded file was too small or incomplete. Please use the direct download link.');
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
      console.error('Download error:', err);
      // Fallback: direct window location
      window.location.href = `${url}?v=${Date.now()}`;
    } finally {
      setDownloadingStudio(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-600 via-sky-500 to-indigo-600 px-6 py-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-xs">
              <FolderArchive className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-bold text-lg text-white">Android Studio Project & APK</h3>
                <span className="text-[10px] font-semibold bg-emerald-400 text-emerald-950 px-2 py-0.5 rounded-full font-mono">
                  Ready to Build
                </span>
              </div>
              <p className="text-xs text-sky-100 mt-0.5">
                Download the complete project folder ready to build your .APK in Android Studio
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 bg-slate-50/70 p-1.5 gap-1 shrink-0">
          <button
            onClick={() => setActiveTab('studio')}
            className={`flex-1 py-2 px-3 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'studio'
                ? 'bg-white text-sky-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Android Studio Project (.ZIP)</span>
            <span className="text-[9px] bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.2 rounded-md">3.2MB</span>
          </button>

          <button
            onClick={() => setActiveTab('direct')}
            className={`flex-1 py-2 px-3 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'direct'
                ? 'bg-white text-sky-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Direct Phone Install (PWA)</span>
          </button>

          <button
            onClick={() => setActiveTab('ios')}
            className={`flex-1 py-2 px-3 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'ios'
                ? 'bg-white text-sky-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>iPhone / iOS</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-700 text-sm">
          {activeTab === 'studio' && (
            <div className="space-y-4">
              {/* Highlight Download Card */}
              <div className="bg-gradient-to-br from-sky-50 to-indigo-50/50 border border-sky-200 rounded-2xl p-4 sm:p-5 shadow-xs">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <h4 className="font-heading font-bold text-slate-900 text-base">
                        Android Studio Project Package
                      </h4>
                    </div>
                    <p className="text-xs text-slate-600 max-w-md leading-relaxed">
                      Pre-configured with Android Gradle wrappers, Capacitor native bridge, and compiled production assets. Unzips into <strong>GoldenBar-Android-Studio/</strong> ready to open in Android Studio.
                    </p>
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-500">
                      <span className="bg-white/80 px-2 py-0.5 rounded border border-slate-200/80 font-mono text-sky-700 font-semibold">
                        GoldenBar-Android-Studio/
                      </span>
                      <span>•</span>
                      <span>Package: com.goldenbar.app</span>
                      <span>•</span>
                      <span>Gradle 8.7</span>
                      <span>•</span>
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        3.6 MB
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 w-full sm:w-auto shrink-0">
                    <button
                      onClick={() => handleDownloadZip('/goldenbar-android-studio-project.zip', 'GoldenBar-Android-Studio-Project.zip')}
                      disabled={downloadingStudio}
                      className="px-5 py-3 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 disabled:bg-sky-400 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 group cursor-pointer"
                    >
                      <Download className={`w-4 h-4 ${downloadingStudio ? 'animate-bounce' : 'transition-transform group-hover:-translate-y-0.5'}`} />
                      <span>{downloadingStudio ? 'Downloading (3.6 MB)...' : 'Download Project (.ZIP)'}</span>
                    </button>
                    <a
                      href={`/goldenbar-android-studio-project.zip?t=${Date.now()}`}
                      download="GoldenBar-Android-Studio-Project.zip"
                      className="text-[11px] text-center text-slate-500 hover:text-sky-700 underline underline-offset-2"
                    >
                      Or click here for direct link (3.6 MB)
                    </a>
                  </div>
                </div>

                {downloadError && (
                  <p className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded-lg">{downloadError}</p>
                )}

                {/* Empty Folder Notice for User Clarity */}
                <div className="mt-3 p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
                  <span className="font-semibold block mb-0.5 text-amber-950">💡 Need the Android Studio folder?</span>
                  When extracted, you will find the <strong>GoldenBar-Android-Studio/</strong> folder with <code>START_HERE.txt</code> and all Gradle project files ready for 1-click APK build.
                </div>

                {/* Secondary Full Source Code Download Option */}
                <div className="mt-4 pt-3 border-t border-sky-100 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
                  <span>Need the full React + Vite + Android source?</span>
                  <a
                    href={`/goldenbar-full-project.zip?t=${Date.now()}`}
                    download="GoldenBar-Full-Project.zip"
                    className="inline-flex items-center gap-1.5 font-semibold text-sky-700 hover:text-sky-800 underline underline-offset-2"
                  >
                    <FileCode className="w-3.5 h-3.5" />
                    <span>Download Full Web & Android Source (.ZIP, 12.0 MB)</span>
                  </a>
                </div>
              </div>

              {/* Step-by-Step Instructions */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5 text-sky-600" />
                  How to Build your .APK in Android Studio (3 Steps):
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Step 1 */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 flex flex-col justify-between">
                    <div>
                      <div className="w-6 h-6 rounded-lg bg-sky-600 text-white font-bold text-xs flex items-center justify-center mb-2">
                        1
                      </div>
                      <h5 className="font-bold text-slate-900 text-xs mb-1">Open in Android Studio</h5>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        Unzip the downloaded file. Open Android Studio, click <strong>File &gt; Open</strong> and select the unzipped folder.
                      </p>
                    </div>
                    <span className="text-[10px] text-sky-700 font-medium bg-sky-50 px-2 py-1 rounded mt-2 border border-sky-100 block">
                      Syncs automatically
                    </span>
                  </div>

                  {/* Step 2 */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 flex flex-col justify-between">
                    <div>
                      <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center mb-2">
                        2
                      </div>
                      <h5 className="font-bold text-slate-900 text-xs mb-1">Click "Build APK"</h5>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        In Android Studio top menu, go to:
                        <br />
                        <strong className="text-slate-800">Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</strong>.
                      </p>
                    </div>
                    <span className="text-[10px] text-indigo-700 font-medium bg-indigo-50 px-2 py-1 rounded mt-2 border border-indigo-100 block">
                      Takes ~30 seconds
                    </span>
                  </div>

                  {/* Step 3 */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 flex flex-col justify-between">
                    <div>
                      <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center mb-2">
                        3
                      </div>
                      <h5 className="font-bold text-slate-900 text-xs mb-1">Install on Phone</h5>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        Click the notification popup link <strong className="text-slate-800">"locate"</strong> or navigate to:
                        <br />
                        <code className="text-[10px] bg-slate-200/60 px-1 py-0.5 rounded font-mono break-all">app/build/outputs/apk/debug/app-debug.apk</code>.
                      </p>
                    </div>
                    <span className="text-[10px] text-emerald-700 font-medium bg-emerald-50 px-2 py-1 rounded mt-2 border border-emerald-100 block">
                      Ready to install!
                    </span>
                  </div>
                </div>
              </div>

              {/* Included files summary */}
              <div className="p-3 bg-slate-900 text-slate-300 rounded-2xl text-xs space-y-1.5 font-mono">
                <p className="text-amber-400 font-sans font-semibold">Included in the ZIP Archive:</p>
                <div className="text-[11px] text-slate-400 grid grid-cols-2 gap-1">
                  <div>📁 /app/src/main/assets (Web UI)</div>
                  <div>📁 /gradle/wrapper (Gradle 8.7)</div>
                  <div>📄 AndroidManifest.xml (Permissions)</div>
                  <div>📄 build.gradle & settings.gradle</div>
                  <div>📄 MainActivity.java</div>
                  <div>📄 README_ANDROID_STUDIO.md</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'direct' && (
            <div className="space-y-4">
              <div className="p-4 bg-sky-50/70 border border-sky-100 rounded-2xl flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-semibold text-sky-950">
                    Direct Android WebAPK Installation (Zero Downloads Required)
                  </p>
                  <p className="text-sky-800 leading-relaxed">
                    Android Chrome automatically installs GoldenBar as a full standalone native Android app. It gets its own home screen icon, runs full-screen without URL bars, and operates offline!
                  </p>
                </div>
              </div>

              {/* Install trigger if installable on this device */}
              {isInstallable && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-emerald-950 text-sm">Browser Ready to Install</h4>
                    <p className="text-xs text-emerald-800">Your browser supports 1-click home screen installation.</p>
                  </div>
                  <button
                    onClick={handleTriggerInstall}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    <span>Install to Phone Now</span>
                  </button>
                </div>
              )}

              {installSuccess && (
                <div className="p-3 bg-emerald-100 text-emerald-900 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Installation started! Check your phone's home screen or app drawer.</span>
                </div>
              )}

              {/* QR Code and Step by Step */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col items-center text-center">
                  <span className="text-xs font-bold text-slate-800 mb-2">Scan with Android Camera</span>
                  <div className="p-2 bg-white rounded-xl shadow-xs border border-slate-200">
                    <img
                      src={qrCodeUrl}
                      alt="Scan to open GoldenBar on mobile"
                      className="w-36 h-36 rounded-lg object-contain"
                    />
                  </div>
                  <span className="text-[11px] text-slate-500 mt-2">Opens app instantly on phone</span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 font-bold text-xs flex items-center justify-center shrink-0">
                      1
                    </div>
                    <div className="text-xs">
                      <p className="font-semibold text-slate-900">Open on Android Phone</p>
                      <p className="text-slate-600">Open Google Chrome and navigate to the app URL.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 font-bold text-xs flex items-center justify-center shrink-0">
                      2
                    </div>
                    <div className="text-xs">
                      <p className="font-semibold text-slate-900">Tap "Install" or Browser Menu</p>
                      <p className="text-slate-600">
                        Tap the in-app "Install" banner, or tap the three dots (<strong className="text-slate-800">⋮</strong>) in Chrome and select <strong className="text-slate-800">"Install app"</strong> or <strong className="text-slate-800">"Add to Home screen"</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 font-bold text-xs flex items-center justify-center shrink-0">
                      3
                    </div>
                    <div className="text-xs">
                      <p className="font-semibold text-slate-900">Done! Native Experience</p>
                      <p className="text-slate-600">
                        GoldenBar appears in your launcher with the golden gym logo, runs offline, and behaves exactly like a native app.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Copy URL Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center justify-between gap-2">
                <input
                  type="text"
                  readOnly
                  value={currentUrl}
                  className="bg-transparent text-xs text-slate-600 flex-1 truncate font-mono outline-hidden select-all"
                />
                <button
                  onClick={handleCopyUrl}
                  className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy URL'}</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'ios' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <h4 className="font-bold text-slate-900 text-sm">How to Install on iPhone / iPad (Safari)</h4>
                <div className="space-y-2.5 text-xs text-slate-700">
                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-slate-800 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                      1
                    </div>
                    <p>Open this URL in <strong>Apple Safari</strong> on your iPhone or iPad.</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-slate-800 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                      2
                    </div>
                    <p>Tap the <strong>Share</strong> button (the square with an arrow pointing up) in Safari's toolbar.</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-slate-800 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                      3
                    </div>
                    <p>Scroll down and tap <strong>"Add to Home Screen"</strong>.</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-slate-800 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                      4
                    </div>
                    <p>Tap <strong>"Add"</strong> in the top right. GoldenBar is now installed on your iOS home screen!</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500">
            Offline ready · PWA & Android Studio native Gradle wrapper configured
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
