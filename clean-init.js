'use strict';
(async () => {
  const S = window.S52;

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if (location.hash === '#play') {
    const cleanUrl = new URL(location.href);
    cleanUrl.hash = '';
    history.replaceState(null, '', `${cleanUrl.pathname}${cleanUrl.search}`);
  }
  const pinInitialViewport = () => window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  pinInitialViewport();
  requestAnimationFrame(pinInitialViewport);

  initTheme();

  document.querySelector('#headerRules')?.addEventListener('click', () => S.openRulesModal());
  document.querySelector('#headerExit')?.addEventListener('click', () => S.openExitModal());

  const setConnectionState = online => {
    document.documentElement.classList.toggle('is-offline', !online);
  };
  setConnectionState(navigator.onLine);
  window.addEventListener('offline', () => {
    setConnectionState(false);
    S.toast('Connessione assente: continuo dalla cache');
  });
  window.addEventListener('online', () => {
    setConnectionState(true);
    S.toast('Connessione ripristinata');
  });

  const serviceWorkerTask = 'serviceWorker' in navigator
    ? navigator.serviceWorker.register('./sw.js', { scope: './', updateViaCache: 'none' }).then(registration => {
        registration.update().catch(() => {});
        registration.waiting?.postMessage('SKIP_WAITING');
        registration.addEventListener('updatefound', () => {
          const worker = registration.installing;
          worker?.addEventListener('statechange', () => {
            if (worker.state === 'installed' && navigator.serviceWorker.controller) worker.postMessage('SKIP_WAITING');
          });
        });
        return registration;
      }).catch(() => null)
    : Promise.resolve(null);

  if (!await S.renderInviteFromUrl()) S.renderHome();
  await serviceWorkerTask;
})();
