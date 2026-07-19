'use strict';

(() => {
  const S = window.S52;
  if (!S) return;

  const CREATOR_SRC = 'creator-jita.svg?v=14';

  const replaceCreatorImages = root => {
    const scope = root?.querySelectorAll ? root : document;
    scope.querySelectorAll('img[src*="creator-jita.svg"]').forEach(image => {
      if (image.getAttribute('src') !== CREATOR_SRC) image.setAttribute('src', CREATOR_SRC);
      image.setAttribute('decoding', 'async');
    });
  };

  const previousHomeMarkup = S.homeMarkup;
  if (previousHomeMarkup) {
    S.homeMarkup = () => {
      const template = document.createElement('template');
      template.innerHTML = previousHomeMarkup();
      const fragment = template.content;

      const title = fragment.querySelector('.hero-title');
      if (title) {
        title.innerHTML = `
          <span class="line">Un gioco che mette alla prova</span>
          <span class="line line-accent"><span class="hero-creativity">creatività</span> e immaginazione,</span>
          <span class="line line-final">improvvisando.</span>`;
      }

      const heroActions = fragment.querySelector('.hero-actions');
      heroActions?.querySelector('[data-open-panel="tutorial"]')?.remove();
      heroActions?.classList.add('hero-actions-single');

      fragment.querySelector('[data-open-panel="tutorial"]')?.classList.add('menu-card-tutorial');
      fragment.querySelector('[data-open-panel="rules"]')?.classList.add('menu-card-rules');
      fragment.querySelector('[data-open-panel="info"]')?.classList.add('menu-card-info');
      fragment.querySelector('[data-home-resume]')?.classList.add('menu-card-resume');
      replaceCreatorImages(fragment);
      return template.innerHTML;
    };
  }

  const setupTurnCards = host => {
    host.querySelectorAll('.tutorial-setup article,.tutorial-turn article').forEach(card => {
      const badge = card.querySelector(':scope > span');
      const directTitle = card.querySelector(':scope > b');
      const directParagraph = card.querySelector(':scope > p');
      if (badge && (directTitle || directParagraph)) {
        const copy = document.createElement('div');
        copy.className = 'tutorial-step-copy';
        if (directTitle) copy.appendChild(directTitle);
        if (directParagraph) copy.appendChild(directParagraph);
        card.appendChild(copy);
      }
      card.querySelector(':scope > div')?.classList.add('tutorial-step-copy');
    });
  };

  const patchTurnStep = host => {
    const turn = host.querySelector('.tutorial-turn');
    if (!turn || turn.dataset.releasePolished === 'true') return;
    turn.innerHTML = `
      <article><span>1</span><div class="tutorial-step-copy"><b>Scarta e ripesca</b><p>Se hai più di 1 carta in mano, devi scartarne una e pescarne subito una nuova. Con una sola carta salti questo passaggio.</p></div></article>
      <article><span>2</span><div class="tutorial-step-copy"><b>Gioca 1 o 2 carte</b><p>Metti sul tavolo una carta, oppure due carte compatibili. Dichiara seme e valore prima di raccontare.</p></div></article>
      <article><span>3</span><div class="tutorial-step-copy"><b>Dì una sola scena</b><p>Aggiungi un fatto chiaro che rispetta le carte e continua ciò che è già successo, senza decidere anche la reazione successiva.</p></div></article>
      <article><span>4</span><div class="tutorial-step-copy"><b>Pesca, se vuoi, e chiudi</b><p>Dopo aver detto la scena puoi pescare una carta. Poi il turno è finito e gioca la persona successiva.</p></div></article>`;
    turn.dataset.releasePolished = 'true';

    const heading = host.querySelector('.tutorial-pro-heading');
    if (heading) {
      const title = heading.querySelector('h3');
      const body = heading.querySelector('p');
      if (title) title.textContent = 'Scarta, gioca, racconta e chiudi il turno.';
      if (body) body.textContent = 'Il cambio iniziale è obbligatorio quando hai più di una carta. La pesca dopo la scena è facoltativa.';
    }
  };

  const patchSuitCards = host => {
    const grid = host.querySelector('.tutorial-suits');
    if (!grid || grid.dataset.releasePolished === 'true') return;
    const cards = grid.querySelectorAll('article');
    if (cards.length < 4) return;

    cards[0].className = 'tutorial-suit-split';
    cards[0].innerHTML = `<b class="red">♥</b><div><strong>Relazione: positiva o negativa</strong><p>La carta cambia un rapporto tra personaggi.</p><div class="tutorial-outcomes"><span><i>PARI · POSITIVA</i><b>Il legame aiuta</b><small>Avvicina, protegge o crea fiducia.</small><em>La guardia riconosce il protagonista e lo lascia passare.</em></span><span><i>DISPARI · NEGATIVA</i><b>Il legame peggiora</b><small>Allontana, tradisce o crea tensione.</small><em>L’amico rivela il nascondiglio del protagonista.</em></span></div></div>`;

    cards[1].className = 'tutorial-suit-split';
    cards[1].innerHTML = `<b class="red">♦</b><div><strong>Scoperta: positiva o negativa</strong><p>La carta introduce un’informazione o un indizio.</p><div class="tutorial-outcomes"><span><i>PARI · POSITIVA</i><b>Scoperta utile</b><small>Aiuta i personaggi o apre una possibilità.</small><em>Il protagonista trova la chiave della cassaforte.</em></span><span><i>DISPARI · NEGATIVA</i><b>Scoperta problematica</b><small>Rivela qualcosa che complica la situazione.</small><em>Il protagonista scopre che la macchina è guasta.</em></span></div></div>`;
    grid.dataset.releasePolished = 'true';
  };

  const patchExamples = host => {
    const example = host.querySelector('.tutorial-example');
    if (example && !example.querySelector('.tutorial-turn-reminder')) {
      const reminder = document.createElement('aside');
      reminder.className = 'tutorial-turn-reminder';
      reminder.innerHTML = '<b>Prima di giocare:</b><span>se hai più di 1 carta, scarta e ripesca obbligatoriamente.</span>';
      example.prepend(reminder);
    }
    host.querySelectorAll('.tutorial-pass span').forEach(text => {
      text.textContent = 'Dopo la scena il giocatore può pescare una carta. Poi il turno passa alla persona successiva.';
    });
  };

  const patchReadyCycle = host => {
    const cycle = host.querySelector('.tutorial-cycle');
    if (!cycle || cycle.dataset.releasePolished === 'true') return;
    cycle.innerHTML = '<span>Scarta</span><i>→</i><span>Ripesca</span><i>→</i><span>Gioca</span><i>→</i><span>Racconta</span><i>→</i><span>Pesca se vuoi</span><i>→</i><span>Passa</span>';
    cycle.dataset.releasePolished = 'true';
  };

  const polishTutorialStep = host => {
    setupTurnCards(host);
    patchTurnStep(host);
    patchSuitCards(host);
    patchExamples(host);
    patchReadyCycle(host);
  };

  const previousBindTutorialIn = S.bindTutorialIn;
  if (previousBindTutorialIn) {
    S.bindTutorialIn = root => {
      previousBindTutorialIn(root);
      const host = root.querySelector('[data-tutorial-host]');
      const card = root.querySelector('.modal-card');
      if (!host) return;

      const returnToTop = () => requestAnimationFrame(() => {
        host.scrollTo({ top: 0, behavior: 'auto' });
        if (card) card.scrollTo({ top: 0, behavior: 'auto' });
      });
      const refresh = () => {
        polishTutorialStep(host);
        returnToTop();
      };

      polishTutorialStep(host);
      root.querySelector('[data-tutorial-prev]')?.addEventListener('click', refresh);
      root.querySelector('[data-tutorial-next]')?.addEventListener('click', refresh);
      root.addEventListener('keydown', event => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') refresh();
      });

      let scheduled = false;
      new MutationObserver(() => {
        if (scheduled) return;
        scheduled = true;
        requestAnimationFrame(() => {
          scheduled = false;
          polishTutorialStep(host);
        });
      }).observe(host, { childList: true, subtree: true });
    };
  }

  replaceCreatorImages(document);
  new MutationObserver(records => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE) replaceCreatorImages(node);
      }
    }
  }).observe(document.body, { childList: true, subtree: true });
})();
