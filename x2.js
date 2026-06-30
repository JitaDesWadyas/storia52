'use strict';
(() => {
  const game = document.querySelector('#game');
  if (!game) return;
  const clean = () => {
    game.querySelector('.scene-example')?.remove();
    game.querySelector('#helpCard')?.remove();
    game.querySelector('#helpPair')?.remove();
  };
  new MutationObserver(clean).observe(game, { childList: true, subtree: true });
  clean();
})();
