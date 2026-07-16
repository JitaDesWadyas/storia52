'use strict';

(() => {
  const S = window.S52 = {
    key: 'storia52_session_v3',
    stories: window.STORIA52_READY_STORIES || [],
    categories: window.STORIA52_READY_CATEGORIES || {},
    play: document.querySelector('#play'),
    storyUi: { category: 'all', query: '', page: 0 },
    currentSession: null,
    limits: Object.freeze({ name: 28, opening: 700, note: 240, inviteCode: 6000, inviteQr: 1900, inviteDecoded: 18000 })
  };

  S.esc = value => escapeHtml(String(value ?? ''));
  S.cleanText = (value, max = 500, multiline = false) => {
    let text = String(value ?? '').normalize('NFKC').replace(multiline ? /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g : /[\u0000-\u001F\u007F]/g, '');
    text = multiline
      ? text.replace(/\r\n?/g, '\n').replace(/[\t ]+/g, ' ').replace(/\n{3,}/g, '\n\n')
      : text.replace(/\s+/g, ' ');
    return text.trim().slice(0, Math.max(0, max));
  };
  S.cleanName = (value, index = 0) => S.cleanText(value, S.limits.name) || `Giocatore ${index + 1}`;
  S.randomIndex = max => {
    if (max <= 0) return 0;
    const values = new Uint32Array(1);
    crypto.getRandomValues(values);
    return values[0] % max;
  };
  S.playerName = (session, index) => S.cleanName(session.names?.[index], index);
  S.normalizeNames = (count, names = []) => Array.from({ length: count }, (_, index) => S.cleanName(names[index], index));
  S.readyStory = session => S.stories.find(story => story.id === session.readyStoryId) || null;
  S.sourceLabel = session => session.source === 'ready' ? 'Storia pronta' : 'Incipit inventato';

  S.load = () => {
    try { return JSON.parse(localStorage.getItem(S.key) || 'null'); }
    catch { return null; }
  };
  S.save = session => {
    S.currentSession = session;
    try { localStorage.setItem(S.key, JSON.stringify(session)); }
    catch { /* Il gioco continua anche senza salvataggio. */ }
  };
  S.clear = () => {
    S.currentSession = null;
    try { localStorage.removeItem(S.key); }
    catch { /* Nessuna azione richiesta. */ }
  };

  S.mount = (html, { session = false, scroll = true, animate = scroll, preserveHash = false } = {}) => {
    const previousY = window.scrollY;
    S.play.innerHTML = `<div class="screen${animate ? ' screen-enter' : ''}">${html}</div>`;
    S.play.classList.add('active');
    document.body.classList.toggle('session-mode', session);
    const exitButton = document.querySelector('#headerExit');
    if (exitButton) exitButton.hidden = !session;
    if (!preserveHash) {
      const url = new URL(location.href);
      url.hash = 'play';
      history.replaceState(null, '', url);
    }
    if (animate) requestAnimationFrame(() => S.play.querySelector('.screen')?.classList.remove('screen-enter'));
    if (scroll) window.scrollTo({ top: 0, behavior: 'smooth' });
    else requestAnimationFrame(() => window.scrollTo({ top: previousY, behavior: 'auto' }));
  };

  S.modal = (title, body, { wide = false, className = '' } = {}) => {
    const host = document.createElement('div');
    host.className = `modal ${className}`;
    host.innerHTML = `<div class="modal-card${wide ? ' wide' : ''}"><button type="button" class="modal-close" aria-label="Chiudi">×</button><h2>${S.esc(title)}</h2>${body}</div>`;
    const close = () => {
      host.classList.add('closing');
      setTimeout(() => host.remove(), 140);
    };
    host.addEventListener('click', event => { if (event.target === host) close(); });
    host.querySelector('.modal-close').addEventListener('click', close);
    document.body.appendChild(host);
    requestAnimationFrame(() => host.classList.add('open'));
    return { host, close };
  };

  S.toast = message => {
    const toast = document.querySelector('#toast');
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(S.toast.timer);
    S.toast.timer = setTimeout(() => toast.classList.remove('show'), 1800);
  };

  S.copy = async (value, message = 'Copiato') => {
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(String(value));
      else {
        const field = document.createElement('textarea');
        field.value = String(value);
        field.setAttribute('readonly', '');
        field.style.position = 'fixed';
        field.style.opacity = '0';
        document.body.appendChild(field);
        field.select();
        if (!document.execCommand('copy')) throw new Error('Copia non disponibile');
        field.remove();
      }
      S.toast(message);
    } catch { S.toast('Copia non disponibile'); }
  };

  S.newSession = mode => {
    const seed = createCode();
    const count = 4;
    const session = {
      version: 3,
      mode: mode || 'play',
      delivery: 'single',
      stage: 'setup',
      count,
      names: Array(count).fill(''),
      source: 'ready',
      seed,
      story: storyFromSeed(seed),
      readyStoryId: '',
      openingText: '',
      openingNotes: { protagonist: '', setting: '', action: '', problem: '' },
      spokenOpening: false,
      objectives: Array.from({ length: count }, (_, index) => objectiveFromSeed(seed, index + 1)),
      confirmed: Array(count).fill(false)
    };
    session.openingText = S.defaultOpening(session);
    return session;
  };

  S.stripPeriod = value => String(value || '').trim().replace(/[.!?]+$/, '');
  S.lowerFirst = value => value ? value.charAt(0).toLowerCase() + value.slice(1) : '';
  S.defaultOpening = session => {
    const story = withStoryGoal(session.story, session.seed);
    const protagonist = S.stripPeriod(cardText('protagonist', story.protagonist));
    const situation = S.stripPeriod(cardText('situation', story.situation));
    const objective = S.lowerFirst(S.stripPeriod(cardText('objective', story.goal)));
    const problem = S.lowerFirst(S.stripPeriod(cardText('problem', story.problem)));
    return `${protagonist}. ${situation}. Vuole ${objective}, ma ${problem}.`;
  };

  S.storyCardsMarkup = (session, { editable = false } = {}) => {
    const story = withStoryGoal(session.story, session.seed);
    const parts = [
      ['protagonist', 'PROTAGONISTA', 'protagonist', story.protagonist],
      ['situation', 'SITUAZIONE', 'situation', story.situation],
      ['goal', 'OBIETTIVO', 'objective', story.goal],
      ['problem', 'PROBLEMA', 'problem', story.problem]
    ];
    return `<div class="story-reference">${parts.map(([key, label, type, card]) => `<article class="story-card${editable ? ' with-action' : ''}"><span class="rank${SUITS[card.suit].red ? ' red' : ''}">${S.esc(cardLabel(card))}</span><div><span>${label}</span><p>${S.esc(cardText(type, card))}</p></div>${editable ? `<button type="button" class="story-card-change" data-change-story-card="${key}">Cambia</button>` : ''}</article>`).join('')}</div>`;
  };

  S.storyContextMarkup = session => {
    const story = S.readyStory(session);
    if (story) return `<div class="story-summary"><article class="ready-story context-story-preview"><div class="meta"><span>${S.esc(S.categories[story.category]?.symbol || '')} ${S.esc(S.categories[story.category]?.label || 'STORIA PRONTA')}</span><span>STORIA ${String(S.stories.indexOf(story) + 1).padStart(2, '0')}</span></div><h3>${S.esc(story.title)}</h3><p>${S.highlightStoryOpening ? S.highlightStoryOpening(story) : S.esc(story.opening)}</p></article></div>`;
    const opening = session.openingText
      ? `<article class="ready-story context-story-preview"><div class="meta"><span>INCIPIT INVENTATO</span><span>4 CARTE</span></div><h3>Incipit</h3><p>${S.highlightOpeningText ? S.highlightOpeningText(session.openingText, session) : S.esc(session.openingText)}</p></article>`
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
