'use strict';
(() => {
  const load = src => new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
  ['opening-v4-data-1.js','opening-v4-data-2.js','opening-v4-data-3.js','opening-v4-data-4.js','opening-v4-data-ready.js']
    .reduce((chain, src) => chain.then(() => load(src)), Promise.resolve())
    .catch(error => console.error('Impossibile caricare le 1040 frasi dell’incipit.', error));
})();
