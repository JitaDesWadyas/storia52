'use strict';
(() => {
  const G = window.G52;
  if (!G) return;

  const description = 'Un gioco creativo e imprevedibile da vivere in compagnia. Giocate le carte, continuate ciò che è successo e cercate di portare la storia verso il vostro finale.';

  const applyBrand = () => {
    document.querySelector('.brand-suits')?.remove();

    const lockup = document.querySelector('.brand-lockup');
    if (lockup) {
      if (!lockup.querySelector('.brand-logo-integrated')) {
        const img = document.createElement('img');
        img.src = 'storia52-cards-logo.svg';
        img.alt = 'Logo STORIA 52';
        img.className = 'brand-logo-integrated';
        lockup.prepend(img);
      }
      const kicker = lockup.querySelector('.brand-kicker');
      if (kicker) kicker.textContent = 'UN GIOCO CREATIVO E IMPREVEDIBILE';
      const line = lockup.querySelector('.brand-line');
      if (line && !lockup.querySelector('.brand-description')) {
        const text = document.createElement('p');
        text.className = 'brand-description';
        text.textContent = description;
        line.after(text);
      }
    }

    const hero = document.querySelector('.hero-copy');
    if (hero) {
      const kicker = hero.querySelector('.section-kicker');
      const title = hero.querySelector('h2');
      const paragraph = hero.querySelector('p:not(.section-kicker)');
      if (kicker) kicker.textContent = 'STORIA 52';
      if (title) title.textContent = 'Un gioco creativo e imprevedibile da vivere in compagnia.';
      if (paragraph) paragraph.textContent = 'Giocate le carte, continuate ciò che è successo e cercate di portare la storia verso il vostro finale.';
    }

    const deck = document.querySelector('.deck-scene');
    if (deck && !deck.querySelector('.hero-logo-integrated')) {
      deck.replaceChildren();
      const img = document.createElement('img');
      img.src = 'storia52-cards-logo.svg';
      img.alt = 'Logo STORIA 52';
      img.className = 'hero-logo-integrated';
      deck.appendChild(img);
    }

    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.content = `STORIA 52 — ${description}`;
  };

  const cleanOpeningCopy = () => {
    document.querySelectorAll('.story-draft').forEach(node => node.remove());
    const template = document.querySelector('#clarityStoryDraft');
    if (template) template.remove();

    const opening = document.querySelector('.opening-v3');
    if (!opening) return;

    const head = opening.querySelector('.opening-v3-head');
    if (head) {
      const label = head.querySelector('span');
      const title = head.querySelector('h3');
      const copy = head.querySelector('p');
      if (label) label.textContent = '3 INCIPIT COMPLETI';
      if (title) title.textContent = 'Scegliete una scena che funziona già.';
      if (copy) copy.textContent = 'Le carte orientano tono, direzione e conflitto. Non vengono copiate né forzate una per una.';
    }

    const note = opening.querySelector('.opening-v3-note');
    if (note) {
      const title = note.querySelector('b');
      const copy = note.querySelector('p');
      if (note.classList.contains('difficult')) {
        if (title) title.textContent = 'Le quattro carte non raccontano naturalmente la stessa storia.';
        if (copy) copy.textContent = 'Per evitare risultati assurdi, le proposte cercano il nucleo comune e lasciano sullo sfondo la carta meno compatibile. Potete cambiarla singolarmente.';
      } else {
        if (title) title.textContent = 'Queste carte hanno un nucleo narrativo comune.';
        if (copy) copy.textContent = 'Le proposte lo trasformano direttamente in una prima scena concreta, senza passare da quattro descrizioni separate.';
      }
    }

    opening.querySelectorAll('.opening-v3-choice').forEach(choice => {
      const action = choice.querySelector('i');
      if (action) action.textContent = 'Scegli questo incipit →';
    });
  };

  const style = document.createElement('style');
  style.textContent = `
    .masthead{align-items:flex-start}
    .brand-lockup{display:grid!important;grid-template-columns:76px minmax(0,1fr);column-gap:14px;align-items:center;max-width:760px}
    .brand-logo-integrated{grid-row:1/4;width:76px;height:76px;object-fit:contain;filter:drop-shadow(0 8px 14px rgba(55,35,5,.16))}
    .brand-lockup>.brand-kicker,.brand-lockup>.brand-line,.brand-lockup>.brand-description{grid-column:2}
    .brand-lockup>.brand-kicker{margin:0 0 2px}
    .brand-lockup>.brand-line{margin:0}
    .brand-description{margin:5px 0 0;max-width:660px;color:var(--card-muted);font-size:.91rem;line-height:1.42}
    .hero-logo-integrated{display:block;width:min(330px,78vw);height:auto;margin:auto;filter:drop-shadow(0 18px 28px rgba(55,35,5,.17))}
    .opening-v3-choice p{font-size:1rem;line-height:1.52}
    .opening-v3-choice b{font-size:1.08rem}
    @media(max-width:760px){
      .brand-lockup{grid-template-columns:58px minmax(0,1fr);column-gap:10px}
      .brand-logo-integrated{width:58px;height:58px}
      .brand-description{grid-column:1/-1;margin-top:8px;font-size:.84rem}
      .hero-logo-integrated{width:min(235px,66vw)}
    }
  `;
  document.head.appendChild(style);

  const refresh = () => {
    applyBrand();
    cleanOpeningCopy();
  };

  refresh();
  new MutationObserver(refresh).observe(document.body, { childList: true, subtree: true });
})();
