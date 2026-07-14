'use strict';
(async () => {
  const S = window.S52;
  initTheme();
  document.querySelector('#headerRules')?.addEventListener('click', () => S.openRulesModal());
  document.querySelector('#headerExit')?.addEventListener('click', () => S.openExitModal());
  if (!await S.renderInviteFromUrl()) S.renderHome();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
