import React, { useState } from 'react';
import { Share2, Copy, Check, QrCode, Smartphone, X, Send, MessageCircle, Mail, Sparkles, CheckCircle2, ShieldCheck, ExternalLink } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  // Always share the PUBLIC Shared App URL (ais-pre-), NEVER the private Dev URL (ais-dev-)
  const PUBLIC_SHARED_URL = 'https://ais-pre-z44ondzil6uzzp2jd6vw4a-981296436478.asia-east1.run.app';
  
  let shareUrl = PUBLIC_SHARED_URL;
  if (typeof window !== 'undefined' && window.location.origin) {
    // If user is currently browsing on ais-dev-, replace with ais-pre- so friends can access
    shareUrl = window.location.origin.replace('ais-dev-', 'ais-pre-');
  }

  const shareTitle = 'GoldenBar: AI Gym Coach';
  const shareText = 'Check out GoldenBar: AI Gym Coach! Test guided workouts, 50+ exercises, animated muscle mannequins, and 30-day training programs:';

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: `${shareText}\n${shareUrl}`,
          url: shareUrl,
        });
      } catch (e) {
        // User cancelled or not supported
      }
    } else {
      handleCopyLink();
    }
  };

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n\n👉 Open App: ${shareUrl}`)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`;
  const emailUrl = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(shareUrl)}&color=0f172a&bgcolor=ffffff&qzone=1`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-xs">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-slate-900">
                Share With Friends
              </h3>
              <p className="text-[10px] text-slate-500 font-medium">
                Invite friends to check & test GoldenBar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1-Tap Mobile Share Button */}
        <button
          onClick={handleNativeShare}
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 font-heading font-bold text-xs shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer mb-3"
        >
          <Share2 className="w-4 h-4" />
          <span>Share via WhatsApp, Messages, or Apps</span>
        </button>

        {/* Quick Social Buttons */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-[11px] font-bold flex flex-col items-center justify-center gap-1 transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>WhatsApp</span>
          </a>

          <a
            href={telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 text-[11px] font-bold flex flex-col items-center justify-center gap-1 transition-colors"
          >
            <Send className="w-4 h-4 text-sky-600" />
            <span>Telegram</span>
          </a>

          <a
            href={emailUrl}
            className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-bold flex flex-col items-center justify-center gap-1 transition-colors"
          >
            <Mail className="w-4 h-4 text-slate-600" />
            <span>Email</span>
          </a>
        </div>

        {/* Copy App Link Box */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/90 mb-3 space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Direct Web Link
          </span>
          <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-xl border border-slate-200">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="bg-transparent text-xs text-slate-700 font-mono flex-1 truncate outline-hidden px-1 select-all"
            />
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold flex items-center gap-1 transition-colors shrink-0 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* In-Person Camera Scan QR Code */}
        <div className="p-3.5 bg-gradient-to-b from-slate-50 to-white rounded-2xl border border-slate-200 flex flex-col items-center text-center mb-3">
          <span className="text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
            <QrCode className="w-3.5 h-3.5 text-amber-600" />
            Have a Friend Scan with Phone Camera
          </span>
          <p className="text-[10px] text-slate-500 mb-2">
            Point phone camera at this QR code to instantly open and test the app.
          </p>
          <div className="p-2 bg-white rounded-xl shadow-xs border border-slate-200">
            <img
              src={qrCodeUrl}
              alt="Scan QR code to test GoldenBar"
              className="w-36 h-36 rounded-lg object-contain"
            />
          </div>
        </div>

        {/* Important Sharing Note */}
        <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/80 text-[10px] text-amber-950 space-y-1">
          <span className="font-bold flex items-center gap-1 text-amber-900">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            How Friends Can Test Instantly:
          </span>
          <ul className="list-disc list-inside space-y-0.5 text-slate-700 leading-relaxed">
            <li>Friends can open the link in <strong>Chrome</strong> or <strong>Safari</strong> on their phone.</li>
            <li>On the login screen, tap <strong>"Explore as Guest / Tester (1-Tap)"</strong> — no password needed!</li>
            <li>To install on home screen, tap the <strong>"Install App"</strong> banner in Chrome.</li>
          </ul>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-3 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-heading font-semibold text-xs transition-colors cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  );
};
