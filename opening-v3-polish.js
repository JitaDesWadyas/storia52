'use strict';
(() => {
  const G = window.G52;
  if (!G) return;

  const title = 'Un gioco creativo e imprevedibile da vivere in compagnia.';
  const description = 'Giocate le carte, continuate ciò che è successo e cercate di portare la storia verso il vostro finale.';

  const setText = (node, value) => {
    if (node && node.textContent !== value) node.textContent = value;
  };

  const applyHomeCopy = () => {
    document.querySelectorAll('.brand-description,.brand-logo-integrated').forEach(node => node.remove());

    const simpleHero = document.querySelector('.simple-hero');
    if (simpleHero) {
      setText(simpleHero.querySelector('.section-kicker'), 'GIOCO NARRATIVO CON UN MAZZO DI CARTE');
      setText(simpleHero.querySelector('h2'), title);
      setText(simpleHero.querySelector('p:not(.section-kicker)'), description);
    }

    const legacyHero = document.querySelector('.hero-copy');
    if (legacyHero) {
      setText(legacyHero.querySelector('.section-kicker'), 'GIOCO NARRATIVO CON UN MAZZO DI CARTE');
      setText(legacyHero.querySelector('h2'), title);
      setText(legacyHero.querySelector('p:not(.section-kicker)'), description);
    }
  };

  const polishOpening = () => {
    document.querySelectorAll('.story-draft').forEach(node => node.remove());
    document.querySelector('#clarityStoryDraft')?.remove();

    const opening = document.querySelector('.opening-v3');
    if (!opening) return;

    const head = opening.querySelector('.opening-v3-head');
    if (head) {
      setText(head.querySelector('span'), '3 INCIPIT COMPLETI');
      setText(head.querySelector('h3'), 'Scegliete una scena che funziona già.');
      setText(head.querySelector('p'), 'Le carte orientano tono, direzione e conflitto. Non vengono copiate né forzate una per una.');
    }

    const note = opening.querySelector('.opening-v3-note');
    if (note) {
      const noteTitle = note.querySelector('b');
      const noteCopy = note.querySelector('p');
      if (note.classList.contains('difficult')) {
        setText(noteTitle, 'Le quattro carte non raccontano naturalmente la stessa storia.');
        setText(noteCopy, 'Per evitare risultati assurdi, le proposte cercano il nucleo comune e lasciano sullo sfondo la carta meno compatibile. Potete cambiarla singolarmente.');
      } else {
        setText(noteTitle, 'Queste carte hanno un nucleo narrativo comune.');
        setText(noteCopy, 'Le proposte lo trasformano direttamente in una prima scena concreta, senza passare da quattro descrizioni separate.');
      }
    }

    opening.querySelectorAll('.opening-v3-choice i').forEach(action => {
      setText(action, 'Scegli questo incipit →');
    });
  };

  const style = document.createElement('style');
  style.textContent = `
    .opening-v3-choice p{font-size:1rem;line-height:1.52}
    .opening-v3-choice b{font-size:1.08rem}
  `;
  document.head.appendChild(style);

  const previousHome = G.home;
  G.home = (...args) => {
    const result = previousHome(...args);
    applyHomeCopy();
    return result;
  };

  const previousScreen = G.screen;
  G.screen = (...args) => {
    const result = previousScreen(...args);
    requestAnimationFrame(polishOpening);
    return result;
  };

  applyHomeCopy();
  polishOpening();
})();
