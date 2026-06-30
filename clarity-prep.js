'use strict';

(() => {
  const G = window.G52;
  const game = document.querySelector('#game');

  document.querySelector('#clarity-overrides')?.remove();

  if (!document.querySelector('link[href="layout-repair.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'layout-repair.css';
    document.head.appendChild(link);
  }

  const normalizeNumberedLists = root => {
    root?.querySelectorAll('.numbered-list > p').forEach(row => {
      if (row.querySelector(':scope > .numbered-copy')) return;
      const marker = row.querySelector(':scope > i');
      if (!marker) return;
      const copy = document.createElement('span');
      copy.className = 'numbered-copy';
      [...row.childNodes].forEach(node => {
        if (node !== marker) copy.appendChild(node);
      });
      row.appendChild(copy);
    });
  };

  const repairRulebook = root => {
    if (!root) return;
    root.querySelectorAll('.amber-banner').forEach(node => node.remove());
    root.querySelectorAll('.clarity-rulebook').forEach(rulebook => {
      const cover = rulebook.querySelector('.rulebook-cover');
      if (cover && !rulebook.querySelector(':scope > .rulebook-lead')) {
        const lead = document.createElement('div');
        lead.className = 'rulebook-lead';
        lead.innerHTML = '<span>COME SI GIOCA</span><p>Costruite un incipit comune, continuate la storia una carta alla volta e provate a chiuderla con il vostro obiettivo segreto.</p>';
        cover.after(lead);
      }
    });
    normalizeNumberedLists(root);
  };

  const template = document.querySelector('#clarityRulesTemplate');
  if (template) repairRulebook(template.content);
  repairRulebook(document.querySelector('#rules'));

  if (G) {
    const previousRenderRulesPage = G.renderRulesPage;
    G.renderRulesPage = (...args) => {
      const result = previousRenderRulesPage?.(...args);
      repairRulebook(document.querySelector('#rules'));
      return result;
    };

    const previousOpenRulesModal = G.openRulesModal;
    G.openRulesModal = (...args) => {
      const result = previousOpenRulesModal?.(...args);
      requestAnimationFrame(() => repairRulebook(document.querySelector('.focus-modal:last-of-type')));
      return result;
    };
  }

  if (game) {
    const cleanTurn = () => {
      const title = game.querySelector('.turn-core > div:nth-child(2) b');
      const note = game.querySelector('.turn-core > div:nth-child(2) small');
      if (title) title.textContent = title.textContent.split(' oppure')[0];
      if (note) note.textContent = note.textContent.replace(/ Puoi giocare.+$/, '');
    };
    new MutationObserver(cleanTurn).observe(game, { childList: true, subtree: true });
    cleanTurn();
  }

  if (!document.querySelector('script[src="opening-loader.js"]')) {
    const loader = document.createElement('script');
    loader.src = 'opening-loader.js';
    document.body.appendChild(loader);
  }
})();
