// PWA Utility and Installation Handler for GlassChat Pro

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

export function registerServiceWorker(): void {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('✨ GlassChat Pro PWA Service Worker registered:', reg.scope);

          // Check for service worker updates
          reg.onupdatefound = () => {
            const installingWorker = reg.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('New content available; please refresh.');
                }
              };
            }
          };
        })
        .catch((err) => {
          console.warn('PWA Service Worker registration warning:', err);
        });
    });

    // Capture beforeinstallprompt for custom install UI
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e as BeforeInstallPromptEvent;
      notifyInstallListeners(true);
    });

    // Handle app installed event
    window.addEventListener('appinstalled', () => {
      deferredPrompt = null;
      notifyInstallListeners(false);
      console.log('🎉 GlassChat Pro installed as PWA successfully!');
    });
  }
}

export function subscribeInstallState(callback: (canInstall: boolean) => void): () => void {
  installListeners.push(callback);
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
    deferredPrompt = null;
    notifyInstallListeners(false);
    return choice.outcome;
  } catch (error) {
    console.error('Error triggering PWA install:', error);
    return 'unsupported';
  }
}
