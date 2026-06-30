'use strict';
(() => {
  const logo = 'storia52-cards-logo.svg';
  const tagline = 'Un gioco creativo e imprevedibile da vivere in compagnia.';
  const description = 'Giocate le carte, continuate ciò che è successo e cercate di portare la storia verso il vostro finale.';

  const apply = () => {
    document.title = 'STORIA 52';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.content = 'STORIA 52 — ' + tagline + ' ' + description;

    document.querySelectorAll('.brand-suits').forEach(node => node.remove());

    const lockup = document.querySelector('.brand-lockup');
    if (lockup && !lockup.classList.contains('brand-lockup-v3')) {
      const toggle = document.querySelector('#themeToggle');
      const mark = document.createElement('img');
      mark.src = logo;
      mark.alt = '';
      mark.className = 'brand-mark-v3';

      const copy = document.createElement('div');
      copy.className = 'brand-copy-v3';
      const kicker = document.createElement('p');
      kicker.className = 'brand-kicker';
      kicker.textContent = 'GIOCO NARRATIVO CON UN MAZZO DI CARTE';
      const line = document.createElement('div');
      line.className = 'brand-line';
      const title = document.createElement('h1');
      title.textContent = 'STORIA 52';
      line.appendChild(title);
      if (toggle) line.appendChild(toggle);
      copy.append(kicker, line);
      lockup.replaceChildren(mark, copy);
      lockup.classList.add('brand-lockup-v3');
    }

    const hero = document.querySelector('.hero-copy');
    if (hero) {
      const kicker = hero.querySelector('.section-kicker');
      const title = hero.querySelector('h2');
      const paragraphs = hero.querySelectorAll('p');
      const copy = Array.from(paragraphs).find(node => !node.classList.contains('section-kicker'));
      if (kicker) kicker.textContent = 'STORIA 52';
      if (title) title.textContent = tagline;
      if (copy) copy.textContent = description;
    }

    const deck = document.querySelector('.deck-scene');
    if (deck && !deck.querySelector('.hero-brand-mark')) {
      const image = document.createElement('img');
      image.src = logo;
      image.alt = 'Logo STORIA 52';
      image.className = 'hero-brand-mark';
      deck.replaceChildren(image);
      deck.removeAttribute('aria-hidden');
    }

    document.querySelectorAll('.rulebook-cover').forEach(cover => {
      if (cover.querySelector('.rules-brand-mark')) return;
      const image = document.createElement('img');
      image.src = logo;
      image.alt = '';
      image.className = 'rules-brand-mark';
      cover.prepend(image);
    });
  };

  let queued = false;
  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      apply();
    });
  };

  apply();
  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
})();
