// CardsDiary Service Worker v1
// Caches all static assets on first load; serves from cache on repeat visits.
// Cloudinary images are cached with a network-first strategy for freshness.

const CACHE_NAME = 'cardsdiary-v3';
const CLOUDINARY_CACHE = 'cardsdiary-images-v3';

// Static assets to cache immediately on SW install
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/collection.html',
    '/viewer.html',
    '/about-us.html',
    '/contact-us.html',
    '/privacy-policy.html',
    '/terms-conditions.html',
    '/disclaimer.html',
    '/style.css',
    '/script.js',
    '/logo.png',
    '/logo2.png'
];

// ── Install: pre-cache all static assets ───────────────────────────────────
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            // addAll fails silently per-item so won't break on missing files
            return Promise.allSettled(
                STATIC_ASSETS.map(url => cache.add(url).catch(() => { }))
            );
        }).then(() => self.skipWaiting())
    );
});

// ── Activate: delete old caches ─────────────────────────────────────────────
self.addEventListener('activate', (event) => {
    const currentCaches = [CACHE_NAME, CLOUDINARY_CACHE];
    event.waitUntil(
        caches.keys().then((cacheNames) =>
            Promise.all(
                cacheNames
                    .filter((name) => !currentCaches.includes(name))
                    .map((name) => caches.delete(name))
            )
        ).then(() => self.clients.claim())
    );
});

// ── Fetch: serve from cache or network ─────────────────────────────────────
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Skip non-GET, chrome-extension, and dev tool requests
    if (event.request.method !== 'GET') return;
    if (url.protocol === 'chrome-extension:') return;

    // Cloudinary images: Cache-first with network update in background
    if (url.hostname === 'res.cloudinary.com') {
        event.respondWith(cloudinaryStrategy(event.request));
        return;
    }

    // Google Fonts: Stale-while-revalidate
    if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
        event.respondWith(staleWhileRevalidate(event.request, CACHE_NAME));
        return;
    }

    // Static assets: Cache-first
    if (url.hostname === self.location.hostname || url.hostname === 'localhost') {
        event.respondWith(cacheFirst(event.request, CACHE_NAME));
        return;
    }
});

// ── Strategies ──────────────────────────────────────────────────────────────

// Cache-first: fast on repeat, network fallback on miss
async function cacheFirst(request, cacheName) {
    const cached = await caches.match(request);
    if (cached) return cached;
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch {
        return new Response('Offline – please check your connection.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain' }
        });
    }
}

// Cloudinary: cache-first, update cache in background
async function cloudinaryStrategy(request) {
    const cache = await caches.open(CLOUDINARY_CACHE);
    const cached = await cache.match(request);
    const networkFetch = fetch(request).then((res) => {
        if (res.ok) cache.put(request, res.clone());
        return res;
    }).catch(() => null);
    return cached || networkFetch;
}

// Stale-while-revalidate: serve cached, fetch fresh for next time
async function staleWhileRevalidate(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    const networkFetch = fetch(request).then((res) => {
        if (res.ok) cache.put(request, res.clone());
        return res;
    }).catch(() => null);
    return cached || networkFetch;
}
