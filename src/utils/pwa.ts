// PWA Utility and Installation Handler for ConvoSphere
// Connect. Express. Sphere of Seamless Conversations.

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

const DISMISSAL_KEY = 'convosphere_pwa_banner_dismissed';

export function isPWAInstalled(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  );
}

export function hasDeferredPrompt(): boolean {
  return Boolean(deferredPrompt);
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
          console.log('[ConvoSphere] 🚀 Service Worker registered successfully:', reg.scope);

          reg.onupdatefound = () => {
            const installingWorker = reg.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('[ConvoSphere] ⚡ New ConvoSphere version available; reload to update.');
                }
              };
            }
          };
        })
        .catch((err) => {
          console.warn('[ConvoSphere] ⚠️ PWA Service Worker registration warning:', err);
        });
    });

    // Capture beforeinstallprompt for custom install UI
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e as BeforeInstallPromptEvent;
      console.log('[ConvoSphere] 📥 Captured beforeinstallprompt event.');
      notifyInstallListeners(true);
    });

    // Handle app installed event
    window.addEventListener('appinstalled', () => {
      deferredPrompt = null;
      notifyInstallListeners(false);
      console.log('[ConvoSphere] 🎉 ConvoSphere installed as PWA successfully!');
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
    console.log('[ConvoSphere] User choice for install prompt:', choice.outcome);
    deferredPrompt = null;
    notifyInstallListeners(false);
    return choice.outcome;
  } catch (error) {
    console.error('[ConvoSphere] Error triggering PWA install:', error);
    return 'unsupported';
  }
}

/**
 * Generates the vibrant Glassmorphic ConvoSphere 3D glowing sphere SVG markup.
 * Blends Electric Blue (#007AFF), Vibrant Pink (#FF007F), Light Blue (#00F0FF),
 * Royal Purple (#8A2BE2), and Metallic Gold (#FFD700).
 */
export function getConvoSphereSvgMarkup(size = 512): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="${size}" height="${size}">
  <defs>
    <radialGradient id="csBg" cx="50%" cy="35%" r="85%">
      <stop offset="0%" stop-color="#151C2C" />
      <stop offset="55%" stop-color="#0B0F19" />
      <stop offset="100%" stop-color="#05080E" />
    </radialGradient>
    <linearGradient id="csMultiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00F0FF" />
      <stop offset="30%" stop-color="#007AFF" />
      <stop offset="65%" stop-color="#8A2BE2" />
      <stop offset="100%" stop-color="#FF007F" />
    </linearGradient>
    <radialGradient id="csSphereGrad" cx="36%" cy="32%" r="68%">
      <stop offset="0%" stop-color="#00F0FF" stop-opacity="0.95" />
      <stop offset="28%" stop-color="#007AFF" stop-opacity="0.9" />
      <stop offset="68%" stop-color="#8A2BE2" stop-opacity="0.88" />
      <stop offset="100%" stop-color="#FF007F" stop-opacity="0.98" />
    </radialGradient>
    <radialGradient id="csGoldCore" cx="42%" cy="38%" r="48%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.98" />
      <stop offset="20%" stop-color="#FFF5B8" stop-opacity="0.92" />
      <stop offset="60%" stop-color="#FFD700" stop-opacity="0.85" />
      <stop offset="100%" stop-color="#FFA500" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="csRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00F0FF" />
      <stop offset="35%" stop-color="#FFD700" />
      <stop offset="70%" stop-color="#FF007F" />
      <stop offset="100%" stop-color="#8A2BE2" />
    </linearGradient>
    <filter id="csGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="16" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
    <filter id="csGlassShadow" x="-25%" y="-25%" width="150%" height="150%">
      <feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#8A2BE2" flood-opacity="0.45" />
    </filter>
  </defs>
  <rect width="512" height="512" rx="128" fill="url(#csBg)" />
  <rect x="8" y="8" width="496" height="496" rx="120" fill="none" stroke="url(#csMultiGrad)" stroke-width="3.5" stroke-opacity="0.4" />
  <circle cx="170" cy="180" r="130" fill="#00F0FF" opacity="0.18" filter="url(#csGlow)" />
  <circle cx="340" cy="300" r="140" fill="#FF007F" opacity="0.16" filter="url(#csGlow)" />
  <circle cx="260" cy="240" r="110" fill="#8A2BE2" opacity="0.22" filter="url(#csGlow)" />
  <g filter="url(#csGlow)">
    <ellipse cx="256" cy="240" rx="175" ry="72" transform="rotate(-28 256 240)" fill="none" stroke="url(#csRingGrad)" stroke-width="9" stroke-dasharray="320 60 120 40" stroke-linecap="round" opacity="0.88" />
    <circle cx="120" cy="170" r="13" fill="#FFD700" stroke="#FFFFFF" stroke-width="3" />
    <circle cx="120" cy="170" r="18" fill="#FFD700" opacity="0.4" />
    <ellipse cx="256" cy="240" rx="165" ry="64" transform="rotate(35 256 240)" fill="none" stroke="url(#csMultiGrad)" stroke-width="7" stroke-dasharray="260 80 90 50" stroke-linecap="round" opacity="0.75" />
    <circle cx="380" cy="290" r="11" fill="#00F0FF" stroke="#FFFFFF" stroke-width="2.5" />
    <circle cx="380" cy="290" r="16" fill="#00F0FF" opacity="0.45" />
  </g>
  <g filter="url(#csGlassShadow)">
    <circle cx="256" cy="240" r="118" fill="url(#csSphereGrad)" stroke="rgba(255,255,255,0.45)" stroke-width="4.5" />
    <circle cx="230" cy="210" r="65" fill="url(#csGoldCore)" opacity="0.9" />
    <path d="M 175 195 C 190 145 285 135 325 160 C 300 178 220 185 175 195 Z" fill="#FFFFFF" opacity="0.65" />
    <ellipse cx="225" cy="180" rx="38" ry="16" transform="rotate(-20 225 180)" fill="#FFFFFF" opacity="0.4" />
    <ellipse cx="256" cy="315" rx="72" ry="24" fill="#00F0FF" opacity="0.3" />
  </g>
  <text x="256" y="425" font-family="'Plus Jakarta Sans', -apple-system, sans-serif" font-size="28" font-weight="900" letter-spacing="4" fill="#FFFFFF" text-anchor="middle">
    CONVOSPHERE
  </text>
  <text x="256" y="455" font-family="'Plus Jakarta Sans', -apple-system, sans-serif" font-size="11" font-weight="700" letter-spacing="2.5" fill="#00F0FF" text-anchor="middle" opacity="0.95">
    CONNECT • EXPRESS • SEAMLESS
  </text>
</svg>`;
}

/**
 * Returns a data:image/svg+xml URI string of the Glassmorphic ConvoSphere logo
 * for dynamic client-side PWA icon rendering and instant fallback.
 */
export function getConvoSphereDataUri(): string {
  const svg = getConvoSphereSvgMarkup();
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * Ensures that all HTML link tags (favicons, apple-touch-icons)
 * dynamically point to the high-contrast glowing Glassmorphic ConvoSphere logo
 * if device or network caches haven't refreshed static assets.
 */
export function ensureDynamicPwaIcon(): void {
  if (typeof document === 'undefined') return;
  try {
    const dataUri = getConvoSphereDataUri();

    // Check SVG favicon
    let svgFavicon = document.querySelector<HTMLLinkElement>('link[rel="icon"][type="image/svg+xml"]');
    if (svgFavicon) {
      // Keep /icon.svg or update if missing
      if (!svgFavicon.href) svgFavicon.href = dataUri;
    } else {
      const link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/svg+xml';
      link.href = dataUri;
      document.head.appendChild(link);
    }

    // Check Apple Touch Icon
    const appleTouchIcons = document.querySelectorAll<HTMLLinkElement>('link[rel="apple-touch-icon"]');
    if (appleTouchIcons.length === 0) {
      const link = document.createElement('link');
      link.rel = 'apple-touch-icon';
      link.href = '/pwa-icon-192.png';
      document.head.appendChild(link);
    }
  } catch (err) {
    console.warn('[ConvoSphere] Note on dynamic PWA icon registration:', err);
  }
}
