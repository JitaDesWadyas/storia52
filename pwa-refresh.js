'use strict';

(() => {
  if (!('serviceWorker' in navigator)) return;

  // Controlla gli aggiornamenti senza ricaricare la pagina o interrompere una partita.
  window.addEventListener('pageshow', () => {
    navigator.serviceWorker.getRegistration('./').then(registration => {
      registration?.update().catch(() => {});
    }).catch(() => {});
  }, { once: true });
})();
