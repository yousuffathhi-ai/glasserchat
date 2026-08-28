import React, { useState, useEffect } from 'react';
import {
  Download,
  Sparkles,
  Smartphone,
  Monitor,
  Share,
  PlusSquare,
  CheckCircle2,
  X,
  ShieldCheck,
  Zap,
  WifiOff,
  Bell,
} from 'lucide-react';
import { ThemeMode } from '../types';
import { isPWAInstalled, isIOS, triggerPWAInstall, subscribeInstallState } from '../utils/pwa';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeMode;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose, theme }) => {
  const [canDirectInstall, setCanDirectInstall] = useState(false);
  const [alreadyInstalled, setAlreadyInstalled] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);
  const [isAppleDevice, setIsAppleDevice] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    setAlreadyInstalled(isPWAInstalled());
    setIsAppleDevice(isIOS());

    const unsubscribe = subscribeInstallState((canInstall) => {
      setCanDirectInstall(canInstall);
    });

    return () => unsubscribe();
  }, [isOpen]);

  if (!isOpen) return null;

  const isGold = theme === 'gold-light';

  const handleInstallClick = async () => {
    setIsInstalling(true);
    const outcome = await triggerPWAInstall();
    setIsInstalling(false);
    if (outcome === 'accepted') {
      setInstallSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2500);
    }
  };

  return (
    <div
      id="pwa-install-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in"
      onClick={onClose}
    >
      <div
        id="pwa-install-modal-dialog"
        className={`relative w-full max-w-lg rounded-3xl p-6 sm:p-7 border shadow-[0_0_50px_rgba(16,185,129,0.25)] transition-all select-none overflow-hidden ${
          isGold
            ? 'bg-white/95 border-[#D4AF37]/45 text-slate-800'
            : 'bg-[#0B0D0E]/95 border-emerald-500/40 text-slate-100'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow backlight */}
        <div className="pointer-events-none absolute -top-16 -right-16 h-44 w-44 rounded-full bg-[#CCFF00]/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-44 w-44 rounded-full bg-emerald-500/20 blur-3xl" />

        {/* Close Button */}
        <button
          id="pwa-modal-close-btn"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top App Header with App Icon */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative w-16 h-16 rounded-2xl p-0.5 bg-gradient-to-tr from-[#CCFF00] via-emerald-500 to-[#0B0D0E] shadow-lg flex-shrink-0">
            <img
              src="/icon.svg"
              alt="GlassChat by PGV Creation"
              className="w-full h-full rounded-[14px] object-cover bg-[#0B0D0E]"
            />
            <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-[#CCFF00] text-[#0B0D0E]">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-black tracking-tight text-white">
                GlassChat <span className="text-[#CCFF00]">Pro</span>
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-extrabold border border-emerald-500/30 uppercase tracking-wide">
                PWA
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Progressive Web App by <span className="text-[#CCFF00] font-medium">PGV Creation</span>
            </p>
          </div>
        </div>

        {/* Status: Already Installed */}
        {alreadyInstalled ? (
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 mb-6 flex items-center space-x-3">
            <CheckCircle2 className="w-6 h-6 flex-shrink-0 text-[#CCFF00]" />
            <div>
              <p className="text-xs font-bold text-slate-100">Standalone PWA Active</p>
              <p className="text-[11px] text-slate-300">
                You are currently running GlassChat Pro with native device integration, offline caching, and push alerts.
              </p>
            </div>
          </div>
        ) : installSuccess ? (
          <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 mb-6 flex items-center space-x-3">
            <CheckCircle2 className="w-6 h-6 flex-shrink-0 text-[#CCFF00]" />
            <div>
              <p className="text-xs font-bold text-slate-100">Installation Initiated!</p>
              <p className="text-[11px] text-slate-300">
                GlassChat Pro is now installing. Check your desktop or home screen for the standalone app.
              </p>
            </div>
          </div>
        ) : null}

        {/* Feature Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-[#080A0B] border border-emerald-500/20 flex items-start space-x-2.5">
            <Zap className="w-4 h-4 text-[#CCFF00] flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-slate-200">Zero Latency</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Instant app startup via Stale-While-Revalidate caching.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#080A0B] border border-emerald-500/20 flex items-start space-x-2.5">
            <WifiOff className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-slate-200">Offline Access</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Browse messages, contacts, and media without active Wi-Fi.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#080A0B] border border-emerald-500/20 flex items-start space-x-2.5">
            <Monitor className="w-4 h-4 text-emerald-300 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-slate-200">Full Screen</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Immersive standalone window without browser URL bars.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#080A0B] border border-emerald-500/20 flex items-start space-x-2.5">
            <Bell className="w-4 h-4 text-[#CCFF00] flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-slate-200">Push Alerts</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Hardware push notifications for WebRTC calls and chat.
              </p>
            </div>
          </div>
        </div>

        {/* Installation Instructions / Action Buttons */}
        {!alreadyInstalled && !installSuccess && (
          <div className="space-y-4">
            {canDirectInstall ? (
              <button
                id="pwa-modal-install-btn"
                onClick={handleInstallClick}
                disabled={isInstalling}
                className="w-full py-3.5 px-5 rounded-2xl bg-[#CCFF00] hover:bg-[#b8e600] text-[#0B0D0E] font-black text-sm shadow-[0_0_25px_rgba(204,255,0,0.4)] hover:shadow-[0_0_30px_rgba(204,255,0,0.6)] hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#0B0D0E]" />
                <span>{isInstalling ? 'Installing GlassChat Pro...' : 'Install GlassChat App Now'}</span>
              </button>
            ) : isAppleDevice ? (
              /* iOS Safari Walkthrough */
              <div className="p-4 rounded-2xl bg-[#080A0B] border border-emerald-500/30 space-y-3">
                <p className="text-xs font-bold text-[#CCFF00] flex items-center space-x-1.5">
                  <Smartphone className="w-4 h-4" />
                  <span>iOS Safari Install Guide</span>
                </p>
                <div className="space-y-2.5 text-xs text-slate-300">
                  <div className="flex items-center space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-[#CCFF00] text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                      1
                    </span>
                    <span>
                      Tap the <strong>Share</strong> icon{' '}
                      <Share className="w-3.5 h-3.5 inline mx-1 text-blue-400" /> in Safari navigation bar.
                    </span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-[#CCFF00] text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                      2
                    </span>
                    <span>
                      Scroll down and select <strong>Add to Home Screen</strong>{' '}
                      <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-emerald-400" />.
                    </span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-[#CCFF00] text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                      3
                    </span>
                    <span>Tap <strong>Add</strong> in the top right to launch GlassChat like a native app.</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Desktop / Browser standard install advice */
              <div className="p-4 rounded-2xl bg-[#080A0B] border border-emerald-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                    <Monitor className="w-4 h-4 text-[#CCFF00]" />
                    <span>Browser Installation</span>
                  </p>
                  <span className="text-[10px] text-emerald-400 font-semibold">Chrome, Edge & Android</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Click the install icon in your browser address bar or select <strong>Install GlassChat</strong> from the browser menu.
                </p>
                <button
                  onClick={handleInstallClick}
                  className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 font-bold text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#CCFF00]" />
                  <span>Trigger Install Prompt</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Footer info */}
        <div className="mt-5 pt-4 border-t border-emerald-500/20 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>256-bit AES Encrypted PWA</span>
          </span>
          <span className="text-slate-500">by PGV Creation • v1.2.0</span>
        </div>
      </div>
    </div>
  );
};
