'use strict';

(() => {
  if (!('serviceWorker' in navigator)) return;
  // La v42 corregge il drag delle carte selezionate e aggiorna le regole di figure e assi.
  const reloadKey = 'epoi_sw_reload_v42';
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
