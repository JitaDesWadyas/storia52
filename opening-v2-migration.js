'use strict';
(() => {
  const logo = 'storia52-cards-logo.svg';
  const apply = () => {
    document.querySelectorAll('.brand-suits').forEach(node => node.remove());
    document.querySelectorAll('.session-logo img').forEach(image => {
      image.src = logo;
      image.alt = 'STORIA 52';
    });
    document.querySelector('#clarityStoryDraft')?.remove();
  };
  apply();
  let queued = false;
  new MutationObserver(() => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; apply(); });
  }).observe(document.body, { childList: true, subtree: true });
})();
