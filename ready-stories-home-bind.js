'use strict';
(() => {
  const G = window.G52;
  if (!G) return;

  const leaveReadyInvite = () => {
    const url = new URL(location.href);
    url.search = '';
    url.hash = 'play';
    history.replaceState(null, '', url);
    window.__storia52DirectInvite = null;
    G.home();
  };

  document.addEventListener('click', event => {
    if (!new URLSearchParams(location.search).has('readyStory')) return;
    if (!event.target.closest('.session-exit,.session-logo')) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    leaveReadyInvite();
  }, true);

  if (document.body.classList.contains('simple-home')) G.home();
})();
