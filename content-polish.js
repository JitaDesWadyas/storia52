'use strict';

(() => {
  const enhanceTutorialSuits = root => {
    root.querySelectorAll('.tutorial-suits').forEach(grid => {
      if (grid.dataset.outcomesEnhanced === 'true') return;
      const cards = grid.querySelectorAll('article');
      if (cards.length < 4) return;

      cards[0].classList.add('tutorial-suit-split');
      cards[0].innerHTML = `<b class="red">♥</b><div><strong>Relazione</strong><p>La carta modifica un rapporto tra personaggi.</p><div class="tutorial-outcomes"><span><i>PARI</i><b>Relazione positiva</b><small>Un legame aiuta, migliora o avvicina.</small><em>La guardia riconosce il protagonista e lo lascia passare.</em></span><span><i>DISPARI</i><b>Relazione negativa</b><small>Un legame crea tensione, distanza o tradimento.</small><em>L’amico rivela il nascondiglio del protagonista.</em></span></div></div>`;

      cards[1].classList.add('tutorial-suit-split');
      cards[1].innerHTML = `<b class="red">♦</b><div><strong>Scoperta</strong><p>La carta introduce un’informazione o un indizio.</p><div class="tutorial-outcomes"><span><i>PARI</i><b>Scoperta positiva</b><small>Viene trovato qualcosa di utile.</small><em>Il protagonista trova la chiave della cassaforte.</em></span><span><i>DISPARI</i><b>Scoperta negativa</b><small>Viene scoperto qualcosa che complica tutto.</small><em>Il protagonista scopre che la macchina è guasta.</em></span></div></div>`;

      grid.dataset.outcomesEnhanced = 'true';
    });
  };

  const enhanceRulebook = root => {
    root.querySelectorAll('.card-rules-compact .suit-rules').forEach(grid => {
      if (grid.dataset.outcomesEnhanced === 'true') return;
      grid.innerHTML = `
        <article class="rule-card rule-card-split"><b class="red">♥ Relazione</b><span>Un rapporto tra personaggi cambia.</span><div class="rule-outcomes"><p><strong>Pari · positiva</strong><small>Il legame aiuta o migliora la situazione.</small><em>La guardia riconosce il protagonista e lo lascia passare.</em></p><p><strong>Dispari · negativa</strong><small>Il legame crea tensione o peggiora la situazione.</small><em>L’amico tradisce il protagonista e rivela il nascondiglio.</em></p></div></article>
        <article class="rule-card rule-card-split"><b class="red">♦ Scoperta</b><span>Compare un’informazione o un indizio.</span><div class="rule-outcomes"><p><strong>Pari · positiva</strong><small>Viene scoperto qualcosa di utile.</small><em>Il protagonista trova la chiave della cassaforte.</em></p><p><strong>Dispari · negativa</strong><small>Viene scoperto qualcosa che complica tutto.</small><em>Il protagonista scopre che la macchina è guasta.</em></p></div></article>
        <article class="rule-card"><b>♣ Azione</b><strong>Un personaggio agisce</strong><span>L’azione manda avanti la storia e lascia una conseguenza al giocatore successivo.</span><em>Il protagonista prova a far partire la macchina.</em></article>
        <article class="rule-card"><b>♠ Ostacolo</b><strong>Compare un problema</strong><span>La situazione diventa più difficile senza cancellare ciò che è già successo.</span><em>La strada viene bloccata prima della fuga.</em></article>`;
      grid.dataset.outcomesEnhanced = 'true';
    });
  };

  const enhance = root => {
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
