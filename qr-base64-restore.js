'use strict';
(() => {
  Promise.resolve(window.EpoiQrReady).finally(() => {
    window.__restoreEpoiAtob?.();
    delete window.__restoreEpoiAtob;
  });
})();
