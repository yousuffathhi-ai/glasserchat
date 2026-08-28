import React, { useState, useEffect } from 'react';
import {
  Download,
  X,
  Sparkles,
  ShieldCheck,
  Zap,
  Smartphone,
  Share,
  PlusSquare,
  CheckCircle2,
} from 'lucide-react';
import {
  isPWAInstalled,
  isBannerDismissed,
  setBannerDismissed,
  subscribeInstallState,
  triggerPWAInstall,
  isIOS,
} from '../utils/pwa';

interface InstallPwaBannerProps {
  forceShow?: boolean;
  onClose?: () => void;
  onOpenDetailedModal?: () => void;
}

export const InstallPwaBanner: React.FC<InstallPwaBannerProps> = ({
  forceShow = false,
  onClose,
  onOpenDetailedModal,
}) => {
  const [canInstall, setCanInstall] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [installing, setInstalling] = useState<boolean>(false);
  const [installedSuccess, setInstalledSuccess] = useState<boolean>(false);
  const [showIOSGuide, setShowIOSGuide] = useState<boolean>(false);

  useEffect(() => {
    setIsInstalled(isPWAInstalled());
    setIsDismissed(isBannerDismissed());

    const unsubscribe = subscribeInstallState((installable) => {
      setCanInstall(installable);
    });

    return () => unsubscribe();
  }, []);

  // Determine if banner should be rendered
  const isApple = isIOS();
  const shouldShow =
    (forceShow || (!isDismissed && !isInstalled && (canInstall || isApple))) &&
    !isInstalled;

  if (!shouldShow) return null;

  const handleInstallClick = async () => {
    if (isApple && !canInstall) {
      if (onOpenDetailedModal) {
        onOpenDetailedModal();
      } else {
        setShowIOSGuide(true);
      }
      return;
    }

    setInstalling(true);
    const outcome = await triggerPWAInstall();
    setInstalling(false);

    if (outcome === 'accepted') {
      setInstalledSuccess(true);
      setTimeout(() => {
        setIsDismissed(true);
        if (onClose) onClose();
      }, 2500);
    } else if (outcome === 'unsupported' && onOpenDetailedModal) {
      onOpenDetailedModal();
    }
  };

  const handleDismiss = () => {
    setBannerDismissed(true);
    setIsDismissed(true);
    if (onClose) onClose();
  };

  return (
    <aside
      id="pwa-install-banner"
      aria-label="Install GlassChat App"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 z-50 md:max-w-md animate-fade-in transition-all duration-300"
    >
      <div
        className="relative overflow-hidden rounded-3xl bg-[#0B0D0E]/95 border border-emerald-500/50 p-4 sm:p-5 shadow-[0_0_35px_rgba(16,185,129,0.28)] backdrop-blur-2xl text-slate-100 ring-1 ring-emerald-500/20"
      >
        {/* Subtle Ambient Emerald & Neon Lime background glow */}
        <div className="pointer-events-none absolute -top-12 -right-12 h-36 w-36 rounded-full bg-[#CCFF00]/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-emerald-500/20 blur-2xl" />

        {/* Dismiss / Close Button */}
        <button
          id="pwa-banner-dismiss-btn"
          onClick={handleDismiss}
          aria-label="Close Install Banner"
          className="absolute top-3.5 right-3.5 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start space-x-3.5 pr-6">
          {/* GlassChat App Icon */}
          <div className="relative flex-shrink-0">
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl p-0.5 bg-gradient-to-tr from-[#CCFF00] via-emerald-500 to-[#0B0D0E] shadow-md">
              <img
                src="/icon.svg"
                alt="GlassChat by PGV Creation"
                className="w-full h-full rounded-[14px] object-cover bg-[#0B0D0E]"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#CCFF00] text-[#0B0D0E]">
              <Sparkles className="w-2.5 h-2.5" />
            </div>
          </div>

          {/* Banner Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                Install GlassChat App
              </h3>
              <span className="inline-flex items-center px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold tracking-wider uppercase">
                PWA
              </span>
            </div>

            <p className="text-xs text-slate-300 mt-1 leading-snug">
              Fast, zero-latency messenger with offline encryption, HD WebRTC calls & status stories by{' '}
              <span className="text-[#CCFF00] font-semibold">PGV Creation</span>.
            </p>

            {/* Quick Feature Badges */}
            <div className="flex items-center space-x-3 mt-2.5 text-[11px] text-emerald-300/90 font-medium">
              <span className="flex items-center space-x-1">
                <Zap className="w-3 h-3 text-[#CCFF00]" />
                <span>Instant Load</span>
              </span>
              <span className="flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>E2E Encrypted</span>
              </span>
            </div>
          </div>
        </div>

        {/* Success or iOS Guide or Primary CTA Action */}
        <div className="mt-4 pt-3 border-t border-emerald-500/20">
          {installedSuccess ? (
            <div className="flex items-center justify-center space-x-2 py-2 px-3 rounded-2xl bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40">
              <CheckCircle2 className="w-4 h-4 text-[#CCFF00]" />
              <span>GlassChat Installed Successfully!</span>
            </div>
          ) : showIOSGuide ? (
            <div className="space-y-2 text-xs text-slate-300 bg-black/40 p-3 rounded-2xl border border-emerald-500/30">
              <p className="font-bold text-[#CCFF00] flex items-center space-x-1">
                <Smartphone className="w-3.5 h-3.5" />
                <span>Add to Home Screen (iOS Safari):</span>
              </p>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-emerald-400">1.</span>
                <span>Tap the Share icon <Share className="w-3 h-3 inline text-blue-400" /></span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-emerald-400">2.</span>
                <span>Select 'Add to Home Screen' <PlusSquare className="w-3 h-3 inline text-emerald-400" /></span>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                id="pwa-install-now-btn"
                onClick={handleInstallClick}
                disabled={installing}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-[#0B0D0E] font-black text-xs sm:text-sm tracking-wide shadow-[0_0_20px_rgba(204,255,0,0.35)] hover:shadow-[0_0_25px_rgba(204,255,0,0.55)] active:scale-[0.98] transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#0B0D0E]" />
                <span>{installing ? 'Installing...' : 'Install Now'}</span>
              </button>

              <button
                id="pwa-banner-dismiss-link"
                onClick={handleDismiss}
                className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 font-bold text-xs transition-colors"
              >
                Maybe Later
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default InstallPwaBanner;
