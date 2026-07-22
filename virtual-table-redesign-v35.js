'use strict';

(() => {
  const S = window.S52;
  if (!S || typeof S.renderVirtualPlayer !== 'function') return;

  const originalRenderVirtualPlayer = S.renderVirtualPlayer;
  const categoryMap = window.STORIA52_READY_CATEGORIES || {};
  const storyList = window.STORIA52_READY_STORIES || S.stories || [];

  const shortText = (value, max = 138) => {
    const clean = String(value || '').replace(/\s+/g, ' ').trim();
    return clean.length > max ? `${clean.slice(0, max - 1).trim()}…` : clean;
  };

  const initials = (name, fallback) => {
    const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return fallback;
    return parts.slice(0, 2).map(part => part[0]?.toUpperCase() || '').join('');
  };

  const iconForTool = key => ({ story: '✦', rules: '?', invite: '⌁', objective: '◎' }[key] || '•');

  const toolMarkup = (key, label) => `<span class="virtual-tool-icon" aria-hidden="true">${iconForTool(key)}</span><b>${label}</b>`;

  const buildPartyMarkup = (session, playerIndex) => {
    const names = Array.isArray(session.names) ? session.names : [];
    const count = Math.max(2, Math.min(8, Number(session.count) || names.length || 2));
    return Array.from({ length: count }, (_, index) => {
      const name = names[index] || `Giocatore ${index + 1}`;
      const active = index === playerIndex ? ' active' : '';
      return `<span class="virtual-party-person${active}" title="${S.esc(name)}"><i>${S.esc(initials(name, String(index + 1)))}</i></span>`;
    }).join('');
  };

  const buildStoryStage = (session, playerIndex) => {
    const story = storyList.find(item => item.id === session.readyStoryId) || {};
    const category = categoryMap[story.category] || {};
    const title = story.title || 'La storia di questa partita';
    const opening = session.openingText || story.opening || story.situation || 'Continuate la storia insieme.';
    const categoryLabel = category.label || 'Storia';
    const categorySymbol = category.symbol || '✦';

    const stage = document.createElement('section');
    stage.className = 'virtual-story-stage';
    stage.innerHTML = `
      <div class="virtual-scene-art" aria-hidden="true">
        <span class="scene-orbit orbit-one"></span>
        <span class="scene-orbit orbit-two"></span>
        <span class="scene-mark">${S.esc(categorySymbol)}</span>
      </div>
      <div class="virtual-story-summary">
        <p><span>${S.esc(categorySymbol)}</span>${S.esc(categoryLabel)}</p>
        <h3>${S.esc(title)}</h3>
        <small>${S.esc(shortText(opening))}</small>
      </div>
      <div class="virtual-party" aria-label="Giocatori">${buildPartyMarkup(session, playerIndex)}</div>`;
    return stage;
  };

  const decorateTools = root => {
    const tools = [
      ['[data-virtual-story]', 'story', 'Storia'],
      ['[data-virtual-rules]', 'rules', 'Regole'],
      ['[data-virtual-invite]', 'invite', 'Invita'],
      ['[data-virtual-objective]', 'objective', 'Obiettivo']
    ];
    tools.forEach(([selector, key, label]) => {
      root.querySelectorAll(selector).forEach(button => {
        if (button.dataset.v35Tool === '1') return;
        button.dataset.v35Tool = '1';
        button.classList.add('virtual-tool-button');
        button.innerHTML = toolMarkup(key, label);
      });
    });
  };

  const decorateCard = card => {
    if (!(card instanceof HTMLElement)) return;
    const symbol = card.querySelector('.virtual-card-corner i')?.textContent?.trim() || '';
    if (symbol && card.dataset.suitSymbol !== symbol) card.dataset.suitSymbol = symbol;
  };

  const decorateCards = root => {
    root.querySelectorAll('.virtual-card-slot,.virtual-table-card,.virtual-discard-card').forEach(decorateCard);
  };

  const enhanceVirtualTable = (session, playerIndex) => {
    const root = S.play?.querySelector('[data-virtual-root]');
    if (!root || root.dataset.v35Ready === '1') return;
    root.dataset.v35Ready = '1';
    root.classList.add('virtual-game-v35');

    const table = root.querySelector('.virtual-table');
    if (table && !table.querySelector('.virtual-story-stage')) table.prepend(buildStoryStage(session, playerIndex));

    decorateTools(root);
    decorateCards(root);

    const observer = new MutationObserver(mutations => {
      let cardsChanged = false;
      for (const mutation of mutations) {
        if (mutation.type === 'childList' || mutation.type === 'characterData') {
          cardsChanged = true;
          break;
        }
      }
      if (cardsChanged) decorateCards(root);
    });
    observer.observe(root, { childList: true, subtree: true, characterData: true });

    const lifecycle = new MutationObserver(() => {
      if (S.play?.contains(root)) return;
      observer.disconnect();
      lifecycle.disconnect();
    });
    lifecycle.observe(S.play, { childList: true });
  };

  S.renderVirtualPlayer = (session, playerIndex) => {
    originalRenderVirtualPlayer(session, playerIndex);
    enhanceVirtualTable(session, playerIndex);
  };
})();
