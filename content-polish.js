'use strict';

(() => {
  const enhanceTutorialSuits = root => {
    root.querySelectorAll('.tutorial-suits').forEach(grid => {
      if (grid.dataset.meaningsEnhanced === 'true') return;
      const cards = grid.querySelectorAll('article');
      if (cards.length < 4) return;

      cards[0].innerHTML = `<b class="red">♥</b><div><strong>Relazione</strong><p>Cambia un rapporto tra personaggi: fiducia, vicinanza, tensione o tradimento.</p><em>La guardia riconosce il protagonista e decide di aiutarlo.</em></div>`;
      cards[1].innerHTML = `<b class="red">♦</b><div><strong>Scoperta</strong><p>Introduce un’informazione, un indizio o una verità importante.</p><em>Il protagonista trova la chiave della cassaforte.</em></div>`;
      grid.dataset.meaningsEnhanced = 'true';
    });
  };

  const enhanceRulebook = root => {
    root.querySelectorAll('.card-rules-compact .suit-rules').forEach(grid => {
      if (grid.dataset.meaningsEnhanced === 'true') return;
      grid.innerHTML = `<article class="rule-card"><b class="red">♥ Relazione</b><strong>Cambia un rapporto</strong><span>Il legame tra due personaggi si avvicina, si rompe o crea tensione.</span><em>Una persona decide di aiutare il protagonista.</em></article><article class="rule-card"><b class="red">♦ Scoperta</b><strong>Compare un’informazione</strong><span>Un indizio o una verità cambia ciò che i personaggi sanno.</span><em>Il protagonista trova una prova nascosta.</em></article><article class="rule-card"><b>♣ Azione</b><strong>Un personaggio agisce</strong><span>L’azione manda avanti la storia e produce una conseguenza.</span><em>Il protagonista prova a far partire la macchina.</em></article><article class="rule-card"><b>♠ Ostacolo</b><strong>Compare un problema</strong><span>La situazione diventa più difficile senza cancellare ciò che è già successo.</span><em>La strada viene bloccata prima della fuga.</em></article>`;
      grid.dataset.meaningsEnhanced = 'true';
    });
  };

  const enhance = root => {
    if (!root?.querySelectorAll) return;
    enhanceTutorialSuits(root);
    enhanceRulebook(root);
  };

  enhance(document);
  new MutationObserver(records => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE) enhance(node);
      }
    }
  }).observe(document.body, { childList: true, subtree: true });
})();
