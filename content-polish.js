'use strict';

(() => {
  const enhanceTutorialSuits = root => {
    root.querySelectorAll('.tutorial-suits').forEach(grid => {
      if (grid.dataset.meaningsEnhanced === 'true') return;
      const cards = grid.querySelectorAll('article');
      if (cards.length < 4) return;

      cards[0].innerHTML = `<b class="red">♥</b><div><strong>Relazione</strong><p><b>Pari:</b> avvicina o rafforza. <b>Dispari:</b> allontana o crea tensione.</p><em>♥6 ricostruisce la fiducia. ♥5 crea un conflitto.</em></div>`;
      cards[1].innerHTML = `<b class="red">♦</b><div><strong>Scoperta</strong><p><b>Pari:</b> qualcosa di utile. <b>Dispari:</b> qualcosa che complica.</p><em>♦8 rivela una prova utile. ♦3 rivela un problema.</em></div>`;
      grid.dataset.meaningsEnhanced = 'true';
    });
  };

  const enhanceRulebook = root => {
    root.querySelectorAll('.card-rules-compact .suit-rules').forEach(grid => {
      if (grid.dataset.meaningsEnhanced === 'true') return;
      grid.innerHTML = `<article class="rule-card rule-card-split"><b class="red">♥ Relazione</b><span>La parità decide il tono.</span><div class="rule-outcomes"><p><strong>Pari · positiva</strong><small>Avvicina o rafforza un legame.</small></p><p><strong>Dispari · negativa</strong><small>Allontana o crea tensione.</small></p></div></article><article class="rule-card rule-card-split"><b class="red">♦ Scoperta</b><span>La parità decide il tono.</span><div class="rule-outcomes"><p><strong>Pari · positiva</strong><small>Compare qualcosa di utile.</small></p><p><strong>Dispari · negativa</strong><small>Compare qualcosa che complica.</small></p></div></article><article class="rule-card"><b>♣ Azione</b><strong>Un personaggio agisce</strong><span>L’azione manda avanti la storia e produce una conseguenza.</span></article><article class="rule-card"><b>♠ Ostacolo</b><strong>Compare un problema</strong><span>La situazione diventa più difficile senza cancellare ciò che è già successo.</span></article>`;
      grid.dataset.meaningsEnhanced = 'true';
    });
  };

  const enhanceTutorialCopy = root => {
    root.querySelectorAll('.tutorial-pro').forEach(panel => {
      const eyebrow = panel.querySelector('.tutorial-pro-top .eyebrow')?.textContent || '';
      if (eyebrow.startsWith('4 ·')) {
        const heading = panel.querySelector('.tutorial-pro-heading h3');
        const copy = panel.querySelector('.tutorial-pro-heading p');
        if (heading) heading.textContent = 'Numeri: seme e parità. Figure e Asso: valore e colore.';
        if (copy) copy.textContent = 'Cuori e Quadri sono positivi con numeri pari e negativi con numeri dispari. Fiori e Picche non cambiano effetto.';
      }

      const diamond = panel.querySelector('.tutorial-tone-diamonds');
      if (!diamond) return;
      const meaning = diamond.querySelector('.tutorial-card-demo span');
      if (meaning) meaning.textContent = 'Scoperta positiva';
      const decisions = diamond.querySelectorAll('.tutorial-decision > div');
      if (decisions[0]) decisions[0].querySelector('p').innerHTML = 'Con <strong>♦ 6</strong> deve aggiungere una <strong>scoperta positiva</strong>.';
      if (decisions[3]) decisions[3].querySelector('p').textContent = 'Il 6 è pari: la scoperta deve aiutare. La polizza continua il mistero e prepara i turni successivi.';
    });
  };

  const enhance = root => {
    if (!root?.querySelectorAll) return;
    enhanceTutorialSuits(root);
    enhanceRulebook(root);
    enhanceTutorialCopy(root);
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
