'use strict';
(() => {
  const G = window.G52;
  const template = document.querySelector('#clarityRulesTemplate');
  if (!G || !template) return;
  G.renderRulesPage = () => {
    const page = document.querySelector('#rules');
    if (!page) return;
    page.replaceChildren(template.content.cloneNode(true));
    G.bindRulebook(page);
  };
  G.openRulesModal = () => {
    const modal = G.modal('Regolamento', template.innerHTML, { wide: true });
    G.bindRulebook(modal);
  };
  G.renderRulesPage();
})();
