'use strict';

const CACHE_PREFIX = 'epoi-';
const SHELL_CACHE = `${CACHE_PREFIX}shell-v20`;
const RUNTIME_CACHE = `${CACHE_PREFIX}runtime-v20`;
const CORE_FILES = [
  './', './index.html', './privacy.html', './copyright.html',
  './clean-app.css', './refine-flow.css', './home-product.css', './app-polish.css', './home-fixes.css',
  './tutorial-game.css', './interaction-polish.css', './invite-polish.css', './release-ready.css', './loading-skeleton.css', './ux-rework.css', './scroll-fix.css', './content-polish.css', './public-release-polish.css', './release-fixes-v17.css', './release-fixes-v19.css',
  './app.js', './ui-core.js',
  './archive-v20-stories-realistico.js', './archive-v20-stories-mistero.js', './archive-v20-stories-fantascienza.js', './archive-v20-stories-fantasy.js', './archive-v20-stories-horror.js', './archive-v20-stories-amore.js', './archive-v20-stories-avventura.js', './archive-v20-stories-commedia.js',
  './ready-stories-realistico.js', './ready-stories-mistero.js', './ready-stories-fantascienza.js', './ready-stories-fantasy.js', './ready-stories-horror.js', './ready-stories-amore.js', './ready-stories-avventura.js', './ready-stories-commedia.js', './ready-stories-data.js',
  './clean-core.js', './clean-rules.js', './clean-home.js', './content-polish.js', './public-release-fixes.js',
  './clean-config.js', './clean-opening.js', './clean-stories-model.js',
  './archive-v20-objectives-01.js', './archive-v20-objectives-02.js', './archive-v20-objectives-03-04.js', './archive-v20-objectives-05-06.js', './archive-v20-objectives-07-08.js', './archive-v20-session-guard.js',
  './ready-story-objectives-01.js', './ready-story-objectives-02.js', './ready-story-objectives-03.js', './ready-story-objectives-04.js', './ready-story-objectives-05.js', './ready-story-objectives-06.js', './ready-story-objectives-07.js', './ready-story-objectives-08.js', './ready-story-objectives-09.js', './ready-story-objectives-10.js', './ready-story-objectives-11.js', './ready-story-objectives-12.js', './ready-story-objectives-13.js', './ready-story-objectives.js',
  './clean-stories-markup.js', './clean-stories-view.js', './clean-objectives.js', './clean-prep.js', './clean-print.js',
  './qr-local.js', './invite-codec.js', './archive-v20-invite-codec.js', './clean-invite-host.js', './clean-invite-data.js', './clean-exit.js',
  './interaction-polish.js', './scroll-safety.js', './clean-init.js', './icon.svg', './storia52-cards-logo.svg', './creator-jita.svg',
  './manifest.webmanifest'
];

const scopedUrl = path => new URL(path, self.registration.scope).toString();
const cacheable = response => response && response.ok && (response.type === 'basic' || response.type === 'cors');

const putSafely = async (cacheName, request, response) => {
  if (!cacheable(response)) return;
  const copy = response.clone();
  try {
    const cache = await caches.open(cacheName);
    await cache.put(request, copy);
  } catch { /* La risposta resta comunque utilizzabile. */ }
};

const fetchWithTimeout = (request, timeoutMs = 5000) => new Promise((resolve, reject) => {
  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort();
    reject(new Error('timeout'));
  }, timeoutMs);
  fetch(request, { signal: controller.signal, cache: 'no-cache' }).then(response => {
    clearTimeout(timer);
    resolve(response);
  }, error => {
    clearTimeout(timer);
    reject(error);
  });
});

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL_CACHE);
    const requests = CORE_FILES.map(path => new Request(scopedUrl(path), { cache: 'reload' }));
    await cache.addAll(requests);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== SHELL_CACHE && key !== RUNTIME_CACHE).map(key => caches.delete(key)));
    if (self.registration.navigationPreload) await self.registration.navigationPreload.enable().catch(() => {});
    await self.clients.claim();
  })());
});

const navigationResponse = async event => {
  const request = event.request;
  try {
    const preload = await event.preloadResponse;
    if (preload) {
      event.waitUntil(putSafely(RUNTIME_CACHE, request, preload));
      return preload;
    }
    const network = await fetchWithTimeout(request);
    if (cacheable(network)) event.waitUntil(putSafely(RUNTIME_CACHE, request, network));
    return network;
  } catch {
    return (await caches.match(request, { ignoreSearch: true }))
      || (await caches.match(scopedUrl('./index.html')))
      || (await caches.match(scopedUrl('./')))
      || new Response('<!doctype html><html lang="it"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>E POI?</title><body><h1>E POI?</h1><p>La rete non è disponibile e la pagina non è ancora nella cache.</p></body></html>', { headers: { 'Content-Type': 'text/html; charset=utf-8' }, status: 503 });
  }
};

const staleWhileRevalidate = async event => {
  const request = event.request;
  const cached = await caches.match(request);
  const refresh = fetch(request, { cache: 'no-cache' }).then(async response => {
    await putSafely(RUNTIME_CACHE, request, response);
    return response;
  });
  if (cached) {
    event.waitUntil(refresh.catch(() => {}));
    return cached;
  }
  try { return await refresh; }
  catch { return new Response('', { status: 504, statusText: 'Offline' }); }
};

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(navigationResponse(event));
    return;
  }

  if (/\.(?:css|js|svg|png|jpg|jpeg|webp|ico|webmanifest)$/i.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(event));
  }
});

self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
