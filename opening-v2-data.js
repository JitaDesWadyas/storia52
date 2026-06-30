'use strict';
(() => {
  const href = 'brand-opening-v3.css';
  if (document.querySelector('link[href="brand-opening-v3.css"]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
})();
