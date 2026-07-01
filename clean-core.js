'use strict';

(() => {
  const S = window.S52 = {
    key: 'storia52_session_v3',
    stories: window.STORIA52_READY_STORIES || [],
    categories: window.STORIA52_READY_CATEGORIES || {},
    play: document.querySelector('#play'),
    rules: document.querySelector('#rules'),
    storyUi: { category: 'all', query: '', page: 0 }
  };

  S.esc = value => escapeHtml(String(value ?? ''));
  S.randomIndex = max => {
    if (max <= 0) return 0;
    const values = new Uint32Array(1);
    crypto.getRandomValues(values);
    return values[0] % max;
  };
  S.playerName = (session, index) => session.names?.[index]?.trim() || `Giocatore ${index + 1}`;
  S.normalizeNames = (count, names = []) => Array.from({ length: count }, (_, index) => names[index]?.trim() || `Giocatore ${index + 1}`);
  S.readyStory = session => S.stories.find(story => story.id === session.readyStoryId) || null;
  S.sourceLabel = session => session.source === 'ready' ? 'Storia pronta' : 'Incipit inventato';

  S.load = () => {
    try { return JSON.parse(localStorage.getItem(S.key) || 'null'); }
    catch { return null; }
  };
  S.save = session => {
    try { localStorage.setItem(S.key, JSON.stringify(session)); }
    catch { /* Il gioco continua anche senza salvataggio. */ }
  };
  S.clear = () => {
    try { localStorage.removeItem(S.key); }
    catch { /* Nessuna azione richiesta. */ }
  };

  S.sessionBar = label => `<div class="session-bar"><div class="session-title"><img src="storia52-cards-logo.svg" alt=""><span>${S.esc(label)}</span></div><div class="session-actions"><button type="button" data-session-rules>Regole</button><button type="button" data-session-exit>Esci</button></div></div>`;

  S.mount = (html, { label = 'STORIA 52', session = false, scroll = true } = {}) => {
    S.play.innerHTML = `<div class="screen">${session ? S.sessionBar(label) : ''}${html}</div>`;
    openPage('play');
    document.body.classList.toggle('session-mode', session);
    document.querySelector('.main-nav')?.classList.toggle('hidden', session);
    S.play.querySelector('[data-session-rules]')?.addEventListener('click', () => S.openRulesModal());
    S.play.querySelector('[data-session-exit]')?.addEventListener('click', () => S.openExitModal());
    if (scroll) window.scrollTo({ top: 0, behavior: 'auto' });
  };

  S.modal = (title, body, { wide = false, className = '' } = {}) => {
    const host = document.createElement('div');
    host.className = `modal ${className}`;
    host.innerHTML = `<div class="modal-card${wide ? ' wide' : ''}"><button type="button" class="modal-close" aria-label="Chiudi">×</button><h2>${S.esc(title)}</h2>${body}</div>`;
    const close = () => host.remove();
    host.addEventListener('click', event => { if (event.target === host) close(); });
    host.querySelector('.modal-close').addEventListener('click', close);
    document.body.appendChild(host);
    return { host, close };
  };

  S.toast = message => {
    const toast = document.querySelector('#toast');
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(S.toast.timer);
    S.toast.timer = setTimeout(() => toast.classList.remove('show'), 1800);
  };

  S.copy = (value, message = 'Copiato') => {
    if (!navigator.clipboard) { S.toast('Copia non disponibile'); return; }
    navigator.clipboard.writeText(value).then(() => S.toast(message)).catch(() => S.toast('Copia non disponibile'));
  };

  S.newSession = mode => {
    const seed = createCode();
    const count = 4;
    return {
      version: 3,
      mode,
      delivery: 'single',
      stage: 'setup',
      count,
      names: Array(count).fill(''),
      source: 'cards',
      seed,
      story: storyFromSeed(seed),
      readyStoryId: '',
      openingText: '',
      openingNotes: { protagonist: '', setting: '', action: '', problem: '' },
      spokenOpening: false,
      objectives: Array.from({ length: count }, (_, index) => objectiveFromSeed(seed, index + 1)),
      confirmed: Array(count).fill(false)
    };
  };

  S.storyCardsMarkup = session => {
    const story = withStoryGoal(session.story, session.seed);
    const parts = [
      ['PROTAGONISTA', 'protagonist', story.protagonist],
      ['SITUAZIONE', 'situation', story.situation],
      ['OBIETTIVO', 'objective', story.goal],
      ['PROBLEMA', 'problem', story.problem]
    ];
    return `<div class="story-reference">${parts.map(([label, type, card]) => `<article class="story-card"><span class="rank${SUITS[card.suit].red ? ' red' : ''}">${S.esc(cardLabel(card))}</span><div><span>${label}</span><p>${S.esc(cardText(type, card))}</p></div></article>`).join('')}</div>`;
  };

  S.storyContextMarkup = session => {
    const story = S.readyStory(session);
    if (story) return `<div class="story-summary"><p class="eyebrow">${S.esc(story.title)}</p><div class="opening-box">${S.esc(story.opening)}</div></div>`;
    const opening = session.openingText
      ? `<div class="opening-box">${S.esc(session.openingText)}</div>`
      : `<div class="hint"><b>La storia viene inventata a voce.</b> Usate le quattro informazioni qui sotto come punto di partenza.</div>`;
    return `<div class="story-summary">${opening}${S.storyCardsMarkup(session)}</div>`;
  };

  S.storyText = session => {
    const story = S.readyStory(session);
    if (story) return story.opening;
    if (session.openingText) return session.openingText;
    const complete = withStoryGoal(session.story, session.seed);
    return [
      `Protagonista: ${cardText('protagonist', complete.protagonist)}`,
      `Situazione: ${cardText('situation', complete.situation)}`,
      `Obiettivo: ${cardText('objective', complete.goal)}`,
      `Problema: ${cardText('problem', complete.problem)}`
    ].join('\n');
  };
})();
