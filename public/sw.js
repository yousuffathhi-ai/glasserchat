// GlassChat Pro - Progressive Web App Service Worker
// Developed by PGV Creation
const CACHE_NAME = 'glasschat-pgv-v1.2.0';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/manifest.webmanifest',
  '/icon.svg',
  'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Fira+Code:wght@400;500;600&display=swap'
];

// 1. Install Event: Pre-cache App Shell & Core Assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[GlassChat SW] Caching app shell and static assets...');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[GlassChat SW] Partial precache notice:', err);
      });
    })
  );
  self.skipWaiting();
});

// 2. Activate Event: Clean up stale caches & claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[GlassChat SW] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Fetch Event: Stale-While-Revalidate with strict exclusions
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Exclude non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Strictly exclude WebSockets, Realtime endpoints, WebRTC & API routes
  if (
    url.protocol === 'ws:' ||
    url.protocol === 'wss:' ||
    url.pathname.startsWith('/api/') ||
    url.pathname.includes('/socket.io/') ||
    url.pathname.includes('/realtime/') ||
    url.pathname.includes('/rtc/') ||
    url.pathname.includes('/webrtc/') ||
    url.pathname.includes('stun:') ||
    url.pathname.includes('turn:') ||
    url.pathname.includes('/@vite/') ||
    url.pathname.includes('/@react-refresh') ||
    url.pathname.includes('hot-update') ||
    url.searchParams.has('realtime')
  ) {
    return;
  }

  // Stale-While-Revalidate strategy for static UI assets, icons, fonts & scripts
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cachedResponse = await cache.match(request);

      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            (networkResponse.type === 'basic' || networkResponse.type === 'cors')
          ) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        })
        .catch((err) => {
          // If offline and request is page navigation, return cached index.html
          if (request.mode === 'navigate') {
            return cache.match('/index.html') || cache.match('/');
          }
          return cachedResponse || Promise.reject(err);
        });

      // Return cached version immediately if available, while fetching update in background
      return cachedResponse || fetchPromise;
    })
  );
});

// 4. Push Notification Support: Incoming messages and WebRTC calls
self.addEventListener('push', (event) => {
  let notificationData = {
    title: 'GlassChat Messenger',
    body: 'New encrypted message received',
    icon: '/icon.svg',
    badge: '/icon.svg',
    tag: 'glasschat-notification',
    data: {
      url: '/',
      timestamp: Date.now()
    }
  };

  try {
    if (event.data) {
      const parsed = event.data.json();
      notificationData = { ...notificationData, ...parsed };
    }
  } catch (e) {
    if (event.data) {
      notificationData.body = event.data.text();
    }
  }

  const options = {
    body: notificationData.body,
    icon: notificationData.icon || '/icon.svg',
    badge: notificationData.badge || '/icon.svg',
    tag: notificationData.tag || 'glasschat-msg',
    vibrate: [150, 80, 150, 80, 250],
    data: notificationData.data,
    requireInteraction: notificationData.isCall || false,
    actions: notificationData.isCall
      ? [
          { action: 'answer', title: '📞 Answer Call' },
          { action: 'decline', title: '✕ Decline' }
        ]
      : [
          { action: 'open', title: '💬 Reply' },
          { action: 'dismiss', title: 'Dismiss' }
        ]
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

// 5. Notification Click Event: Focus or open window
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'decline' || event.action === 'dismiss') return;

  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing tab if open
      for (const client of clientList) {
        if ('focus' in client) {
          if (client.url.includes(self.location.origin)) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
      }
      // Otherwise open new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// 6. Message handler (Skip waiting on updates)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
