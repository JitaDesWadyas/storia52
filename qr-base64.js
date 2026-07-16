'use strict';
/* Normalizza il payload QR vendorizzato prima della decodifica e ripristina subito atob. */
(() => {
  const nativeAtob = window.atob.bind(window);
  let restored = false;
  const restore = () => {
    if (restored) return;
    restored = true;
    window.atob = nativeAtob;
  };
  window.atob = value => {
    const clean = String(value || '')
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .replace(/[^A-Za-z0-9+/=]/g, '')
      .replace(/=+$/g, '');
    return nativeAtob(clean.padEnd(Math.ceil(clean.length / 4) * 4, '='));
  };
  window.__restoreEpoiAtob = restore;
})();
