// PWA Utility and Installation Handler for GlassChat Pro
// Developed by PGV Creation

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// Global reference for the install prompt event
let deferredPrompt: BeforeInstallPromptEvent | null = null;
const installListeners: Array<(canInstall: boolean) => void> = [];

const DISMISSAL_KEY = 'glasschat_pwa_banner_dismissed';

export function isPWAInstalled(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  );
}

export function isIOS(): boolean {
  if (typeof window === 'undefined') return false;
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
}

export function isSafari(): boolean {
  if (typeof window === 'undefined') return false;
  const userAgent = window.navigator.userAgent.toLowerCase();
  return userAgent.includes('safari') && !userAgent.includes('chrome') && !userAgent.includes('crios');
}

export function isBannerDismissed(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const dismissedTime = localStorage.getItem(DISMISSAL_KEY);
    if (!dismissedTime) return false;
    // Expire dismissal after 7 days so users can be reminded gracefully
    const expiry = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - parseInt(dismissedTime, 10) > expiry) {
      localStorage.removeItem(DISMISSAL_KEY);
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
}

export function setBannerDismissed(dismissed = true): void {
  if (typeof window === 'undefined') return;
  try {
    if (dismissed) {
      localStorage.setItem(DISMISSAL_KEY, Date.now().toString());
    } else {
      localStorage.removeItem(DISMISSAL_KEY);
    }
  } catch (e) {
    console.warn('LocalStorage error setting dismissal:', e);
  }
}

export function registerServiceWorker(): void {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((reg) => {
          console.log('[PGV Creation] 🚀 Service Worker registered successfully:', reg.scope);

          reg.onupdatefound = () => {
            const installingWorker = reg.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('[PGV Creation] ⚡ New GlassChat version available; reload to update.');
                }
              };
            }
          };
        })
        .catch((err) => {
          console.warn('[PGV Creation] ⚠️ PWA Service Worker registration warning:', err);
        });
    });

    // Capture beforeinstallprompt for custom install UI
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e as BeforeInstallPromptEvent;
      console.log('[PGV Creation] 📥 Captured beforeinstallprompt event.');
      notifyInstallListeners(true);
    });

    // Handle app installed event
    window.addEventListener('appinstalled', () => {
      deferredPrompt = null;
      notifyInstallListeners(false);
      console.log('[PGV Creation] 🎉 GlassChat Pro installed as PWA successfully!');
    });
  }
}

export function subscribeInstallState(callback: (canInstall: boolean) => void): () => void {
  installListeners.push(callback);
  // Initial callback state
  callback(Boolean(deferredPrompt));
  return () => {
    const index = installListeners.indexOf(callback);
    if (index > -1) {
      installListeners.splice(index, 1);
    }
  };
}

function notifyInstallListeners(canInstall: boolean): void {
  installListeners.forEach((listener) => listener(canInstall));
}

export async function triggerPWAInstall(): Promise<'accepted' | 'dismissed' | 'unsupported'> {
  if (!deferredPrompt) {
    return 'unsupported';
  }

  try {
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    console.log('[PGV Creation] User choice for install prompt:', choice.outcome);
    deferredPrompt = null;
    notifyInstallListeners(false);
    return choice.outcome;
  } catch (error) {
    console.error('[PGV Creation] Error triggering PWA install:', error);
    return 'unsupported';
  }
}
