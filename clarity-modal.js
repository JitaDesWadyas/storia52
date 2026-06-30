'use strict';
(() => {
  const G = window.G52;
  if (!G) return;
  G.renderRulesPage = () => {};
  G.openRulesModal = () => {
    const source = document.querySelector('#rules');
    const modal = G.modal('Regolamento', source.innerHTML, { wide: true });
    G.bindRulebook(modal);
  };
})();
