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
  ArrowRight,
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

  useEffect(() => {
    setAlreadyInstalled(isPWAInstalled());
    setIsAppleDevice(isIOS());

    const unsubscribe = subscribeInstallState((canInstall) => {
      setCanDirectInstall(canInstall);
    });

    return () => unsubscribe();
  }, [isOpen]);

  if (!isOpen) return null;

  const isSophisticatedDark = theme === 'sophisticated-dark';
  const isGold = theme === 'gold-light';

  const handleInstallClick = async () => {
    const outcome = await triggerPWAInstall();
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xl animate-fade-in"
      onClick={onClose}
    >
      <div
        id="pwa-install-modal-dialog"
        className={`relative w-full max-w-lg rounded-3xl p-6 sm:p-7 border shadow-2xl transition-all select-none overflow-hidden ${
          isSophisticatedDark
            ? 'bg-[#121417]/95 border-[#D4AF37]/35 text-slate-100'
            : isGold
            ? 'bg-white/95 border-[#D4AF37]/45 text-slate-800'
            : 'bg-[#0B0D0E]/95 border-emerald-500/30 text-slate-100'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top App Header with App Icon */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative w-16 h-16 rounded-2xl p-0.5 bg-gradient-to-tr from-[#D4AF37] to-[#AA7C11] shadow-lg flex-shrink-0">
            <img
              src="/icon.svg"
              alt="GlassChat Pro Icon"
              className="w-full h-full rounded-[14px] object-cover bg-[#0E1013]"
            />
            <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-[#D4AF37] text-slate-950">
              <Sparkles className="w-3 h-3" />
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold font-display gold-text-gradient">
                GlassChat Pro
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] font-extrabold border border-[#D4AF37]/30 uppercase tracking-wide">
                PWA
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Install the progressive desktop & mobile app
            </p>
          </div>
        </div>

        {/* Status: Already Installed */}
        {alreadyInstalled ? (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-6 flex items-center space-x-3">
            <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-100">PWA Is Running in Standalone Mode</p>
              <p className="text-[11px] text-slate-400">
                You are currently experiencing GlassChat Pro with full offline caching and zero browser bars.
              </p>
            </div>
          </div>
        ) : installSuccess ? (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-6 flex items-center space-x-3">
            <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-100">Installation Initiated!</p>
              <p className="text-[11px] text-slate-400">
                GlassChat Pro has been added to your device. Check your home screen or application launcher.
              </p>
            </div>
          </div>
        ) : null}

        {/* Feature Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-black/20 border border-white/5 flex items-start space-x-2.5">
            <Zap className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-slate-200">Zero Latency</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Instant app startup from local service worker cache.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-black/20 border border-white/5 flex items-start space-x-2.5">
            <WifiOff className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-slate-200">Offline Access</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Read message threads and contacts without active internet.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-black/20 border border-white/5 flex items-start space-x-2.5">
            <Monitor className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-slate-200">Full Screen</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Standalone distraction-free UI without browser address bars.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-black/20 border border-white/5 flex items-start space-x-2.5">
            <Bell className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-slate-200">Push Alerts</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Background call rings and encrypted message notifications.
              </p>
            </div>
          </div>
        </div>

        {/* Installation Instructions / Action Buttons */}
        {!alreadyInstalled && !installSuccess && (
          <div className="space-y-4">
            {canDirectInstall ? (
              <button
                onClick={handleInstallClick}
                className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#F4D06F] to-[#AA7C11] text-slate-950 font-extrabold text-sm shadow-xl hover:shadow-[#D4AF37]/30 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Install GlassChat Pro Now</span>
              </button>
            ) : isAppleDevice ? (
              /* iOS Safari Walkthrough */
              <div className="p-4 rounded-2xl bg-black/30 border border-[#D4AF37]/30 space-y-3">
                <p className="text-xs font-bold text-[#D4AF37] flex items-center space-x-1.5">
                  <Smartphone className="w-4 h-4" />
                  <span>iOS Safari Install Guide</span>
                </p>
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] text-[11px] font-bold flex items-center justify-center">
                      1
                    </span>
                    <span>
                      Tap the <strong>Share</strong> icon{' '}
                      <Share className="w-3.5 h-3.5 inline mx-1 text-blue-400" /> at bottom of Safari.
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] text-[11px] font-bold flex items-center justify-center">
                      2
                    </span>
                    <span>
                      Scroll down and select <strong>Add to Home Screen</strong>{' '}
                      <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-emerald-400" />.
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] text-[11px] font-bold flex items-center justify-center">
                      3
                    </span>
                    <span>Tap <strong>Add</strong> in top right to launch as a native app.</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Desktop / Browser standard install advice */
              <div className="p-4 rounded-2xl bg-black/30 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                    <Monitor className="w-4 h-4 text-[#D4AF37]" />
                    <span>Browser Installation</span>
                  </p>
                  <span className="text-[10px] text-slate-400">Chrome, Edge & Android</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Click the install icon in your browser's address bar (top right on Chrome/Edge desktop) or select <strong>Install App</strong> from the browser menu.
                </p>
                <button
                  onClick={handleInstallClick}
                  className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 font-bold text-xs transition-all flex items-center justify-center space-x-2"
                >
                  <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Check Install Prompt</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Footer info */}
        <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>256-bit AES E2EE PWA</span>
          </span>
          <span>Version 1.0.0</span>
        </div>
      </div>
    </div>
  );
};
