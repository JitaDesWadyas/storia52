'use strict';
(() => {
  const game = document.querySelector('#game');
  if (!game) return;
  const clean = () => {
    const title = game.querySelector('.turn-core > div:nth-child(2) b');
    const note = game.querySelector('.turn-core > div:nth-child(2) small');
    if (title) title.textContent = title.textContent.split(' oppure')[0];
    if (note) note.textContent = note.textContent.replace(/ Puoi giocare.+$/, '');
  };
  new MutationObserver(clean).observe(game, { childList: true, subtree: true });
  clean();
})();
