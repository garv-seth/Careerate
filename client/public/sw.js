// Careerate Service Worker
const CACHE_NAME = 'careerate-v2';
const RUNTIME_CACHE = 'careerate-runtime';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/deploy',
  '/integrations',
  '/dashboard',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE)
          .map((cacheName) => {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // API requests - network only (no cache)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({ error: 'Offline. Please check your connection.' }),
          {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      })
    );
    return;
  }

  // Static assets - cache first, fallback to network
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return caches.open(RUNTIME_CACHE).then((cache) => {
        return fetch(request).then((response) => {
          // Only cache successful responses
          if (response.status === 200) {
            cache.put(request, response.clone());
          }
          return response;
        });
      });
    })
  );
});

// Background sync for deployment status
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-deployment-status') {
    event.waitUntil(syncDeploymentStatus());
  }
});

async function syncDeploymentStatus() {
  try {
    const response = await fetch('/api/agent/deploy/status', {
      method: 'GET',
      credentials: 'include'
    });
    if (response.ok) {
      const data = await response.json();
      // Notify user of status changes
      if (data.status === 'completed' || data.status === 'failed') {
        self.registration.showNotification('Careerate Deployment', {
          body: data.status === 'completed' 
            ? '🎉 Your deployment is live!' 
            : '❌ Deployment failed. Check the logs.',
          icon: '/icon-192.png',
          badge: '/icon-96.png',
          tag: 'deployment-status'
        });
      }
    }
  } catch (error) {
    console.error('[SW] Sync failed:', error);
  }
}

// Push notifications for deployment updates
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Careerate Update';
  const options = {
    body: data.body || 'You have a new update',
    icon: '/icon-192.png',
    badge: '/icon-96.png',
    tag: data.tag || 'default',
    data: data.url ? { url: data.url } : undefined,
    actions: [
      { action: 'view', title: 'View' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view' || !event.action) {
    const urlToOpen = event.notification.data?.url || '/';
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // Open a new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
    );
  }
});

