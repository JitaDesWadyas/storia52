'use strict';
(() => {
  const hasOpenModal = () => [...document.body.children].some(node => node instanceof HTMLElement && node.classList.contains('modal') && node.isConnected);

  const clearStaleScrollLock = () => {
    if (hasOpenModal()) return;
    document.body.classList.remove('modal-open');
    document.documentElement.classList.remove('modal-open');
    for (const element of [document.documentElement, document.body]) {
      element.style.removeProperty('overflow');
      element.style.removeProperty('overflow-y');
      element.style.removeProperty('height');
      element.style.removeProperty('max-height');
      element.style.removeProperty('position');
      element.style.removeProperty('top');
      element.style.removeProperty('width');
      element.style.removeProperty('touch-action');
    }
  };

  clearStaleScrollLock();
  requestAnimationFrame(clearStaleScrollLock);
  window.addEventListener('pageshow', clearStaleScrollLock);
  window.addEventListener('focus', clearStaleScrollLock);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) clearStaleScrollLock();
  });

  new MutationObserver(clearStaleScrollLock).observe(document.body, { childList: true });
})();
