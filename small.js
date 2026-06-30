'use strict';
(() => {
  const G = window.G52;
  if (!G) return;
  const previous = G.flow.setup;
  G.flow.setup = () => {
    previous();
    G.game.querySelector('.card-rules-guide')?.remove();
  };
})();
