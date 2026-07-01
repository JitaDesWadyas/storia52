'use strict';
(() => {
  const S = window.S52;
  initTheme();
  document.querySelector('#headerRules')?.addEventListener('click', () => S.openRulesModal());
  document.querySelector('#headerExit')?.addEventListener('click', () => S.openExitModal());
  if (!S.renderInviteFromUrl()) S.renderHome();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
