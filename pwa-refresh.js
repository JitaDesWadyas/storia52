'use strict';

(() => {
  if (!('serviceWorker' in navigator)) return;
  // La v41 aggiorna l'accordion delle regole e la pulizia dei trascinamenti delle carte.
  const reloadKey = 'epoi_sw_reload_v41';
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    try {
      if (sessionStorage.getItem(reloadKey) === '1') return;
      sessionStorage.setItem(reloadKey, '1');
    } catch { /* Il refresh funziona anche senza sessionStorage. */ }
    location.reload();
  });
  window.addEventListener('pageshow', () => {
    navigator.serviceWorker.getRegistration('./').then(registration => {
      registration?.update().catch(() => {});
      registration?.waiting?.postMessage('SKIP_WAITING');
    }).catch(() => {});
  }, { once: true });
})();
