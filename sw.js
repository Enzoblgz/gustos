// Service worker Gustos — cache du shell + offline
// Bump CACHE_VERSION à chaque déploiement (suivre le ?v= de index.html)
const CACHE_VERSION = 'gustos-v37';
const SHELL = [
  './',
  'index.html',
  'style.css?v=37',
  'app.js?v=37',
  'config.js',
  'manifest.json',
  'Images/gustos-logo-transparent-background.png',
  'icons/icon-192.png',
  'icons/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      // 'gustos-state' porte l'instantané du planning : il survit aux versions
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_VERSION && k !== 'gustos-state').map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// ===== Rappel du dîner =====
// Chrome (Android, app installée) réveille le SW périodiquement. On lit
// l'instantané du planning déposé par la page dans le Cache API — le SW n'a
// pas accès au localStorage — et on notifie une seule fois par jour.
async function showDinnerReminder() {
  const c = await caches.open('gustos-state');
  const res = await c.match('/__gustos_today');
  if (!res) return;
  const d = await res.json().catch(() => null);
  if (!d || !d.enabled || !d.title) return;

  const today = new Date().toISOString().slice(0, 10);
  if (d.date !== today) return;                  // instantané périmé
  const sent = await c.match('/__gustos_notified');
  if (sent && (await sent.text()) === today) return;

  const h = new Date().getHours();
  if (h < 16 || h > 21) return;                  // fenêtre « avant le dîner »

  await self.registration.showNotification(d.title, {
    body: d.body, icon: 'icons/icon-192.png', badge: 'icons/icon-192.png',
    tag: 'gustos-dinner', lang: d.lang || 'fr', data: { url: './?view=planning' },
  });
  await c.put('/__gustos_notified', new Response(today));
}

self.addEventListener('periodicsync', e => {
  if (e.tag === 'gustos-dinner') e.waitUntil(showDinnerReminder());
});

// Un clic sur la notification ouvre l'app (ou remet au premier plan l'onglet déjà ouvert)
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const target = e.notification.data?.url || './';
  e.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const cl of all) {
      if (cl.url.includes(self.registration.scope)) { await cl.focus(); return; }
    }
    await self.clients.openWindow(target);
  })());
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  // Supabase (données + auth + realtime) : toujours réseau, jamais de cache
  if (url.hostname.endsWith('.supabase.co')) return;

  // Navigation : réseau d'abord, fallback sur le shell en cache (offline)
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then(c => c.put('index.html', copy));
          return res;
        })
        .catch(() => caches.match('index.html'))
    );
    return;
  }

  // Statique (même origine, Google Fonts, CDN Supabase JS) : stale-while-revalidate
  const cacheable = url.origin === location.origin
    || url.hostname === 'fonts.googleapis.com'
    || url.hostname === 'fonts.gstatic.com'
    || url.hostname === 'cdn.jsdelivr.net';
  if (!cacheable) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      const fresh = fetch(e.request).then(res => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then(c => c.put(e.request, copy));
        }
        return res;
      }).catch(() => cached);
      return cached || fresh;
    })
  );
});
