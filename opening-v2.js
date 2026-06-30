'use strict';
(() => {
  const load = src => new Promise((resolve, reject) => {
    if (document.querySelector('script[src="' + src + '"]')) { resolve(); return; }
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
  load('opening-v3-scenes.js')
    .then(() => load('opening-v3.js'))
    .then(() => load('opening-v3-events.js'))
    .then(() => load('opening-v3-polish.js'))
    .catch(() => console.error('Impossibile caricare il nuovo incipit.'));
})();
