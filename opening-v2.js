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
    .then(() => load('ready-stories-data.js'))
    .then(() => load('ready-stories-ui.js'))
    .then(() => load('ready-stories-rules.js'))
    .then(() => load('ready-stories-card-path.js'))
    .then(() => load('ready-stories-home-bind.js'))
    .then(() => load('product-final.js'))
    .then(() => load('product-final-patch.js'))
    .catch(error => console.error('Impossibile caricare il sistema degli incipit.', error));
})();
