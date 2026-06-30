'use strict';
(() => {
  const G = window.G52;
  if (!G) return;

  ['brand-v4.css','opening-v4-a.css','opening-v4-b.css'].forEach(href => {
    if (document.querySelector(`link[href="${href}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  });

  const logo = 'storia52-cards-logo.svg';
  const tagline = 'Un gioco creativo e imprevedibile da vivere in compagnia.';
  const description = 'Giocate le carte, continuate ciò che è successo e cercate di portare la storia verso il vostro finale.';

  const applyBrand = () => {
    document.querySelectorAll('.brand-suits').forEach(node => node.remove());
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.content = `STORIA 52 — ${tagline} ${description}`;

    const lockup = document.querySelector('.brand-lockup');
    if (lockup && !lockup.classList.contains('brand-lockup-v4')) {
      const toggle = document.querySelector('#themeToggle');
      const mark = document.createElement('img');
      mark.src = logo;
      mark.alt = 'Logo STORIA 52';
      mark.className = 'brand-mark-v4';
      const copy = document.createElement('div');
      copy.className = 'brand-copy-v4';
      copy.innerHTML = `<p class="brand-kicker">GIOCO NARRATIVO CON UN MAZZO DI CARTE</p><div class="brand-line"><h1>STORIA 52</h1></div><p class="brand-description-v4"><b>${tagline}</b><br>${description}</p>`;
      if (toggle) copy.querySelector('.brand-line').appendChild(toggle);
      lockup.replaceChildren(mark, copy);
      lockup.classList.add('brand-lockup-v4');
    }

    const hero = document.querySelector('.hero-copy');
    if (hero) {
      const kicker = hero.querySelector('.section-kicker');
      const title = hero.querySelector('h2');
      const text = [...hero.querySelectorAll('p')].find(node => !node.classList.contains('section-kicker'));
      if (kicker) kicker.textContent = 'STORIA 52';
      if (title) title.textContent = tagline;
      if (text) text.textContent = description;
    }

    const deck = document.querySelector('.deck-scene');
    if (deck && !deck.querySelector('.hero-brand-mark-v4')) {
      const image = document.createElement('img');
      image.src = logo;
      image.alt = 'Logo STORIA 52';
      image.className = 'hero-brand-mark-v4';
      deck.replaceChildren(image);
      deck.removeAttribute('aria-hidden');
    }

    document.querySelectorAll('.session-logo img').forEach(image => {
      image.src = logo;
      image.alt = 'STORIA 52';
    });
    document.querySelector('#clarityStoryDraft')?.remove();
  };

  applyBrand();
  let queued = false;
  new MutationObserver(() => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; applyBrand(); });
  }).observe(document.body, { childList: true, subtree: true });

  const previous = G.flow.setup;
  G.flow.setup = () => {
    previous();
    G.game.querySelector('.card-rules-guide')?.remove();
  };
})();
