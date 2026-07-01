'use strict';

(() => {
  const G = window.G52;
  if (!G) return;

  const originalSave = G.save;
  G.save = session => {
    if (session?.readyStoryId && !session.stage) {
      try { localStorage.setItem('storia52_product_autonomous_v1', JSON.stringify(session)); }
      catch { /* La partita continua senza salvataggio. */ }
      return;
    }
    originalSave(session);
  };

  const renderCardDelivery = () => {
    G.screen(`<div class="screen-heading"><p class="eyebrow">PARTITA AUTONOMA</p><h2>Come userete il telefono?</h2></div>
      <div class="free-mode-list unified-free-menu">
        <button type="button" data-final-free="single"><b>Un telefono al centro</b><small>L’app genera le quattro carte e gli obiettivi sullo stesso dispositivo.</small><span>→</span></button>
        <button type="button" data-final-free="multi"><b>Inviti personali</b><small>Ogni giocatore riceve il proprio obiettivo sul telefono.</small><span>→</span></button>
        <button type="button" data-final-free="quick"><b>Solo generatore</b><small>Genera immediatamente carte e obiettivo.</small><span>→</span></button>
      </div>
      <button type="button" class="text-action" data-final-free-back>Torna alla scelta dell’incipit</button>`, 'Partita autonoma');
    G.game.querySelector('[data-final-free="single"]').addEventListener('click', () => G.oldSingle(G.game));
    G.game.querySelector('[data-final-free="multi"]').addEventListener('click', () => G.oldMulti(G.game));
    G.game.querySelector('[data-final-free="quick"]').addEventListener('click', () => G.oldQuick(G.game));
    G.game.querySelector('[data-final-free-back]').addEventListener('click', G.freeMenu);
  };

  document.addEventListener('click', event => {
    const button = event.target.closest('[data-origin="cards"]');
    if (!button) return;
    const heading = G.game.querySelector('.screen-heading .eyebrow');
    if (heading?.textContent.trim() !== 'PARTITA AUTONOMA') return;
    event.preventDefault();
    event.stopImmediatePropagation();
    renderCardDelivery();
  }, true);
})();
