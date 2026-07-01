'use strict';
(() => {
  const S = window.S52;
  initTheme();
  S.initArchive();
  S.renderRulesPage();
  document.querySelectorAll('.main-nav button').forEach(button => button.addEventListener('click', () => {
    const page = button.dataset.page;
    if (page === 'play') S.renderHome();
    else {
      if (page === 'rules') S.renderRulesPage();
      openPage(page);
    }
  }));
  if (!S.renderInviteFromUrl()) S.renderHome();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
