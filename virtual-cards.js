'use strict';

(() => {
  const SUITS = Object.freeze([
    { id: 'H', symbol: '♥', name: 'Cuori', red: true },
    { id: 'D', symbol: '♦', name: 'Quadri', red: true },
    { id: 'C', symbol: '♣', name: 'Fiori', red: false },
    { id: 'S', symbol: '♠', name: 'Picche', red: false }
  ]);
  const RANKS = Object.freeze(['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']);
  const CARD_IDS = Object.freeze(SUITS.flatMap(suit => RANKS.map(rank => `${suit.id}-${rank}`)));
  const CARD_ID_SET = new Set(CARD_IDS);

  const hashSeed = value => {
    let hash = 2166136261;
    for (const character of String(value || 'EPOI')) {
      hash ^= character.charCodeAt(0);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  };

  const randomFrom = seed => {
    let state = hashSeed(seed);
    return () => {
      state += 0x6D2B79F5;
      let value = state;
      value = Math.imul(value ^ value >>> 15, value | 1);
      value ^= value + Math.imul(value ^ value >>> 7, value | 61);
      return ((value ^ value >>> 14) >>> 0) / 4294967296;
    };
  };

  const shuffle = (values, seed) => {
    const result = [...values];
    const random = randomFrom(seed);
    for (let index = result.length - 1; index > 0; index -= 1) {
      const target = Math.floor(random() * (index + 1));
      [result[index], result[target]] = [result[target], result[index]];
    }
    return result;
  };

  const cardFromId = id => {
    const [suitId, rank] = String(id || '').split('-');
    const suit = SUITS.find(item => item.id === suitId);
    return suit && RANKS.includes(rank) ? { ...suit, id, rank } : null;
  };

  const polarity = (positive, neutral = false) => neutral
    ? { tone: 'neutral', badge: 'AZIONE' }
    : positive
      ? { tone: 'positive', badge: 'POSITIVA' }
      : { tone: 'negative', badge: 'NEGATIVA' };

  const meaningFor = id => {
    const card = cardFromId(id);
    if (!card) return { title: 'Carta non valida', short: '', text: '', tone: 'neutral', badge: '' };
    const numeric = /^\d+$/.test(card.rank);
    const even = numeric && Number(card.rank) % 2 === 0;

    if (numeric && card.id.startsWith('H-')) {
      return {
        title: `Relazione ${even ? 'positiva' : 'negativa'}`,
        short: 'Relazione',
        text: even ? 'Una relazione si rafforza' : 'Una relazione si incrina',
        ...polarity(even)
      };
    }
    if (numeric && card.id.startsWith('D-')) {
      return {
        title: `Scoperta ${even ? 'positiva' : 'negativa'}`,
        short: 'Scoperta',
        text: even ? 'Una scoperta aiuta i personaggi' : 'Una scoperta crea un problema',
        ...polarity(even)
      };
    }
    if (numeric && card.id.startsWith('C-')) {
      return { title: 'Azione', short: 'Azione', text: 'Un personaggio tenta un’azione', ...polarity(false, true) };
    }
    if (numeric) {
      return { title: 'Ostacolo', short: 'Ostacolo', text: 'Un ostacolo blocca o complica', ...polarity(false) };
    }

    const positive = card.red;
    const special = {
      J: { short: 'Oggetto', good: 'Entra un oggetto che aiuta', bad: 'Entra un oggetto problematico' },
      Q: { short: 'Personaggio', good: 'Entra un personaggio che aiuta', bad: 'Entra un personaggio che ostacola' },
      K: { short: 'Luogo', good: 'Entra un luogo favorevole', bad: 'Entra un luogo pericoloso' },
      A: { short: 'Svolta', good: 'Avviene una svolta favorevole', bad: 'Avviene una svolta sfavorevole' }
    }[card.rank];
    return {
      title: `${special.short} ${positive ? 'positivo' : 'negativo'}`,
      short: special.short,
      text: positive ? special.good : special.bad,
      ...polarity(positive)
    };
  };

  // Il mazzo resta deterministico e ogni carta appartiene a un solo giocatore.
  const buildAssignments = (seed, count) => {
    const playerCount = Math.max(2, Math.min(8, Number(count) || 2));
    const deck = shuffle(CARD_IDS, `${seed}|mazzo-condiviso`);
    const hands = Array.from({ length: playerCount }, () => []);
    const piles = Array.from({ length: playerCount }, () => []);
    let cursor = 0;

    for (let round = 0; round < 5; round += 1) {
      for (let player = 0; player < playerCount; player += 1) hands[player].push(deck[cursor++]);
    }
    let player = 0;
    while (cursor < deck.length) {
      piles[player].push(deck[cursor++]);
      player = (player + 1) % playerCount;
    }
    return hands.map((hand, index) => ({
      hand,
      drawPile: piles[index],
      ownedCards: [...hand, ...piles[index]]
    }));
  };

  const createState = (seed, count, playerIndex) => {
    const assignments = buildAssignments(seed, count);
    const safeIndex = Math.max(0, Math.min(assignments.length - 1, Number(playerIndex) || 0));
    const assignment = assignments[safeIndex];
    return {
      version: 3,
      hand: [...assignment.hand],
      drawPile: [...assignment.drawPile],
      discard: [],
      phase: 'exchange',
      turn: 1,
      cycle: 0,
      playedCard: '',
      lastAction: 'deal'
    };
  };

  const isValidState = (state, seed, count, playerIndex) => {
    if (!state || state.version !== 3 || !['exchange', 'play', 'afterPlay', 'final', 'completed'].includes(state.phase)) return false;
    const assignment = buildAssignments(seed, count)[playerIndex];
    if (!assignment) return false;
    const cards = [
      ...(state.hand || []),
      ...(state.drawPile || []),
      ...(state.discard || []),
      ...(state.playedCard ? [state.playedCard] : [])
    ];
    if (cards.some(card => !CARD_ID_SET.has(card)) || new Set(cards).size !== cards.length) return false;
    const expected = new Set(assignment.ownedCards);
    return cards.length === expected.size && cards.every(card => expected.has(card));
  };

  const drawOne = (state, seed, playerIndex) => {
    let reshuffled = false;
    if (!state.drawPile.length && state.discard.length) {
      state.cycle += 1;
      state.drawPile = shuffle(state.discard, `${seed}|${playerIndex}|riciclo|${state.cycle}`);
      state.discard = [];
      reshuffled = true;
    }
    const card = state.drawPile.shift() || '';
    if (card) state.hand.push(card);
    return { card, reshuffled };
  };

  const settlePlayedCard = state => {
    if (!state.playedCard) return;
    state.discard.push(state.playedCard);
    state.playedCard = '';
  };

  const result = (state, ok, message = '', extra = {}) => ({ state, ok, message, ...extra });
  const apply = (source, action, seed, playerIndex, cardId = '') => {
    const state = JSON.parse(JSON.stringify(source));

    if (action === 'exchange') {
      if (state.phase !== 'exchange') return result(source, false, 'Il cambio è già stato fatto.');
      const index = state.hand.indexOf(cardId);
      if (index < 0) return result(source, false, 'Scegli una carta.');
      state.hand.splice(index, 1);
      state.discard.push(cardId);
      const drawn = drawOne(state, seed, playerIndex);
      state.phase = 'play';
      return result(state, true, '', { drawn: drawn.card, reshuffled: drawn.reshuffled });
    }

    if (action === 'skip-exchange') {
      if (state.phase !== 'exchange') return result(source, false, 'Il cambio è già concluso.');
      if (state.hand.length > 1) return result(source, false, 'Con almeno due carte devi cambiarne una.');
      state.phase = 'play';
      return result(state, true);
    }

    if (action === 'play') {
      if (state.phase !== 'play') return result(source, false, 'Prima cambia una carta.');
      const index = state.hand.indexOf(cardId);
      if (index < 0) return result(source, false, 'Scegli una carta.');
      state.hand.splice(index, 1);
      state.playedCard = cardId;
      state.phase = 'afterPlay';
      return result(state, true);
    }

    if (action === 'draw-end') {
      if (state.phase !== 'afterPlay') return result(source, false, 'Puoi pescare dopo aver giocato.');
      settlePlayedCard(state);
      const drawn = drawOne(state, seed, playerIndex);
      if (!drawn.card) return result(source, false, 'Non ci sono carte disponibili.');
      state.phase = 'exchange';
      state.turn += 1;
      return result(state, true, '', { drawn: drawn.card, reshuffled: drawn.reshuffled });
    }

    if (action === 'skip-draw') {
      if (state.phase !== 'afterPlay') return result(source, false, 'Prima gioca una carta.');
      if (!state.hand.length) return result(source, false, 'Con la mano vuota pesca oppure vai al finale.');
      settlePlayedCard(state);
      state.phase = 'exchange';
      state.turn += 1;
      return result(state, true);
    }

    if (action === 'final') {
      if (state.phase !== 'afterPlay' || state.hand.length) return result(source, false, 'Il finale si tenta dopo l’ultima carta.');
      state.phase = 'final';
      return result(state, true);
    }

    if (action === 'continue') {
      if (state.phase !== 'final') return result(source, false, 'La partita non è nella fase finale.');
      settlePlayedCard(state);
      const drawn = drawOne(state, seed, playerIndex);
      if (!drawn.card) return result(source, false, 'Non ci sono carte disponibili.');
      state.phase = 'exchange';
      state.turn += 1;
      return result(state, true, '', { drawn: drawn.card, reshuffled: drawn.reshuffled });
    }

    if (action === 'complete') {
      if (state.phase !== 'final') return result(source, false, 'Prima racconta il finale.');
      state.phase = 'completed';
      return result(state, true);
    }

    return result(source, false, 'Azione non riconosciuta.');
  };

  const engine = Object.freeze({ cardIds: CARD_IDS, cardFromId, meaningFor, buildAssignments, createState, isValidState, apply });
  window.EpoiVirtualCardsEngine = engine;

  const S = window.S52;
  if (!S) return;

  const storageKey = (session, playerIndex) => `epoi_virtual_${hashSeed(`${session.cardSeed}|${session.readyStoryId}|${session.count}`).toString(36)}_${playerIndex}`;
  const loadState = (session, playerIndex) => {
    let state = null;
    try { state = JSON.parse(localStorage.getItem(storageKey(session, playerIndex)) || 'null'); } catch { /* Riparte dal mazzo deterministico. */ }
    if (!engine.isValidState(state, session.cardSeed, session.count, playerIndex)) state = engine.createState(session.cardSeed, session.count, playerIndex);
    return state;
  };
  const saveState = (session, playerIndex, state) => {
    try { localStorage.setItem(storageKey(session, playerIndex), JSON.stringify(state)); } catch { /* La partita continua. */ }
  };
  const shortText = (value, max = 220) => {
    const clean = String(value || '').replace(/\s+/g, ' ').trim();
    return clean.length > max ? `${clean.slice(0, max - 1).trim()}…` : clean;
  };

  const cardFaceMarkup = id => {
    const card = engine.cardFromId(id);
    const meaning = engine.meaningFor(id);
    if (!card) return '';
    return `<span class="virtual-card-corner"><b>${S.esc(card.rank)}</b><i>${card.symbol}</i></span><span class="virtual-card-symbol" aria-hidden="true">${card.symbol}</span><span class="virtual-card-effect"><em>${S.esc(meaning.badge)}</em><b>${S.esc(meaning.short)}</b><small>${S.esc(meaning.text)}</small></span>`;
  };

  const cardClasses = id => {
    const card = engine.cardFromId(id);
    const meaning = engine.meaningFor(id);
    return `${meaning.tone}${card?.red ? ' red' : ''}`;
  };

  const phaseIndex = phase => ({ exchange: 0, play: 1, afterPlay: 2, final: 2, completed: 2 }[phase] || 0);
  const instructionFor = state => {
    if (state.phase === 'exchange') return state.hand.length > 1 ? 'Scegli una carta da cambiare' : 'Cambia oppure tieni la carta';
    if (state.phase === 'play') return 'Scegli una carta da giocare';
    if (state.phase === 'afterPlay') return 'Racconta la scena, poi scegli';
    if (state.phase === 'final') return 'Collega la scena al tuo obiettivo';
    return 'Finale accettato';
  };

  const partyMarkup = (session, playerIndex) => Array.from({ length: Math.max(2, Math.min(8, Number(session.count) || 2)) }, (_, index) => {
    const name = S.playerName(session, index);
    const initials = name.split(/\s+/).slice(0, 2).map(part => part[0] || '').join('').toUpperCase();
    return `<span class="virtual-party-person${index === playerIndex ? ' active' : ''}" title="${S.esc(name)}">${S.esc(initials || String(index + 1))}</span>`;
  }).join('');

  const shellMarkup = (session, playerIndex) => {
    const story = S.readyStory(session) || {};
    const category = S.categories?.[story.category] || {};
    const opening = session.openingText || story.opening || 'Continuate la storia insieme.';
    return `<section class="virtual-game" data-virtual-root data-phase="exchange">
      <header class="virtual-game-header">
        <div class="virtual-player-title">
          <img src="storia52-cards-logo.svg" alt="E POI?">
          <div class="virtual-player-copy">
            <p>${S.esc(S.playerName(session, playerIndex))}</p>
            <h2><span data-turn-title>Turno 1</span><span aria-hidden="true"> · </span><span data-turn-text>Scegli una carta</span></h2>
          </div>
        </div>
        <div class="virtual-top-actions">
          <button type="button" class="virtual-icon-button virtual-menu-button" data-virtual-menu><span>Menu</span></button>
          <button type="button" class="virtual-icon-button" data-virtual-theme aria-label="Cambia tema">◐</button>
          <button type="button" class="virtual-icon-button" data-virtual-exit aria-label="Esci">×</button>
        </div>
      </header>
      <ol class="virtual-turn-rail" aria-label="Fasi del turno">
        <li data-rail-step="0"><span>1</span><b>Cambia</b></li>
        <li data-rail-step="1"><span>2</span><b>Gioca</b></li>
        <li data-rail-step="2"><span>3</span><b>Chiudi</b></li>
      </ol>
      <section class="virtual-table">
        <button type="button" class="virtual-story-stage" data-open-story aria-label="Apri la storia completa">
          <span class="virtual-story-icon" aria-hidden="true">${S.esc(category.symbol || '✦')}</span>
          <div class="virtual-story-copy">
            <p>${S.esc(category.label || 'Storia')}</p>
            <h3>${S.esc(story.title || 'La storia di questa partita')}</h3>
            <small>${S.esc(shortText(opening, 340))}</small>
          </div>
          <div class="virtual-party" aria-label="Giocatori">${partyMarkup(session, playerIndex)}</div>
        </button>
        <div class="virtual-table-board">
          <button type="button" class="virtual-deck-card" data-virtual-deck aria-label="Mazzo">
            <span class="virtual-deck-layer"></span><span class="virtual-deck-layer"></span><span class="virtual-deck-layer"></span>
            <span class="virtual-deck-face"><img src="storia52-cards-logo.svg" alt=""><small data-deck-action>MAZZO</small></span>
          </button>
          <article class="virtual-card-focus" data-card-focus>
            <span class="virtual-focus-label" data-focus-label>Seleziona una carta</span>
            <span class="virtual-focus-placeholder" data-focus-placeholder aria-hidden="true"><i>↥</i><b data-focus-help>Carta da cambiare</b></span>
            <span class="virtual-table-card" data-table-card hidden></span>
          </article>
        </div>
      </section>
      <div class="virtual-phase-callout" data-phase-callout>
        <b data-phase-title>CAMBIA UNA CARTA</b>
        <span data-phase-help>Tocca per selezionarla oppure trascinala sul tavolo.</span>
      </div>
      <section class="virtual-hand-section">
        <div class="virtual-hand-heading">
          <span>LA TUA MANO</span>
          <div><b data-hand-count></b><button type="button" data-toggle-cards aria-pressed="false">Nascondi</button></div>
        </div>
        <div class="virtual-hand" data-virtual-hand>${Array.from({ length: 5 }, (_, index) => `<button type="button" class="virtual-card-slot empty" data-card-slot="${index}" aria-pressed="false"></button>`).join('')}</div>
        <button type="button" class="virtual-hand-cover" data-hand-cover hidden><span>◉</span><b>Carte nascoste</b><small>Tocca per mostrarle</small></button>
        <p class="virtual-gesture-hint" data-gesture-hint></p>
      </section>
      <div class="virtual-actions" data-virtual-actions>
        <button type="button" class="primary" data-virtual-action="exchange">Cambia</button>
        <button type="button" class="secondary" data-virtual-action="skip-exchange">Tieni</button>
        <button type="button" class="primary" data-virtual-action="play">Gioca</button>
        <button type="button" class="primary" data-virtual-action="draw-end">Pesca</button>
        <button type="button" class="secondary" data-virtual-action="skip-draw">Non pescare</button>
        <button type="button" class="secondary" data-virtual-action="final">Vai al finale</button>
        <button type="button" class="primary" data-virtual-action="complete">Finale accettato</button>
        <button type="button" class="secondary" data-virtual-action="continue">Continuiamo</button>
        <button type="button" class="primary" data-virtual-home>Home</button>
      </div>
      <div class="virtual-drag-overlay" data-drag-overlay></div>
      <div class="virtual-confetti" data-confetti aria-hidden="true"></div>
    </section>`;
  };

  const openStoryPopup = session => S.modal('Storia', `<div class="virtual-popup-scroll">${S.storyContextMarkup(session)}</div>`, { wide: true, className: 'virtual-story-modal' });

  const openMenu = (session, playerIndex, handlers) => {
    const sheet = document.createElement('div');
    sheet.className = 'virtual-menu-sheet';
    sheet.innerHTML = `<section class="virtual-menu-panel"><div class="virtual-menu-head"><h2>Menu</h2><button type="button" class="virtual-icon-button" data-close-menu aria-label="Chiudi">×</button></div><div class="virtual-menu-grid"><button type="button" data-menu-story><span>✦</span><b>Storia</b></button><button type="button" data-menu-rules><span>?</span><b>Regole</b></button><button type="button" data-menu-invite><span>⌁</span><b>Invita</b></button><button type="button" data-menu-objective><span>◎</span><b>Obiettivo</b></button></div></section>`;
    const close = () => sheet.remove();
    sheet.addEventListener('click', event => { if (event.target === sheet) close(); });
    sheet.querySelector('[data-close-menu]').addEventListener('click', close);
    sheet.querySelector('[data-menu-story]').addEventListener('click', () => { close(); openStoryPopup(session); });
    sheet.querySelector('[data-menu-rules]').addEventListener('click', () => { close(); S.openRulesModal?.(); });
    sheet.querySelector('[data-menu-invite]').addEventListener('click', () => { close(); handlers.invite(); });
    sheet.querySelector('[data-menu-objective]').addEventListener('click', () => { close(); S.openObjective(session, playerIndex, true); });
    document.body.appendChild(sheet);
  };

  S.renderVirtualPlayer = (session, playerIndex) => {
    if (session.cardMode !== 'virtual' || session.delivery !== 'multi') {
      S.toast('Le carte virtuali richiedono telefoni separati.');
      return;
    }

    let state = loadState(session, playerIndex);
    let selectedId = '';
    let busy = false;
    let cardsHidden = false;
    let pointer = null;
    let frame = 0;

    document.body.classList.add('virtual-table-active');
    S.mount(shellMarkup(session, playerIndex), { session: true, preserveHash: true, scroll: false, animate: false });
    const root = S.play.querySelector('[data-virtual-root]');
    if (!root) return;

    const refs = {
      title: root.querySelector('[data-turn-title]'),
      text: root.querySelector('[data-turn-text]'),
      handCount: root.querySelector('[data-hand-count]'),
      hint: root.querySelector('[data-gesture-hint]'),
      phaseCallout: root.querySelector('[data-phase-callout]'),
      phaseTitle: root.querySelector('[data-phase-title]'),
      phaseHelp: root.querySelector('[data-phase-help]'),
      deck: root.querySelector('[data-virtual-deck]'),
      deckAction: root.querySelector('[data-deck-action]'),
      focus: root.querySelector('[data-card-focus]'),
      focusLabel: root.querySelector('[data-focus-label]'),
      focusPlaceholder: root.querySelector('[data-focus-placeholder]'),
      focusHelp: root.querySelector('[data-focus-help]'),
      tableCard: root.querySelector('[data-table-card]'),
      slots: [...root.querySelectorAll('[data-card-slot]')],
      actions: [...root.querySelectorAll('[data-virtual-action]')],
      actionsWrap: root.querySelector('[data-virtual-actions]'),
      overlay: root.querySelector('[data-drag-overlay]'),
      confetti: root.querySelector('[data-confetti]'),
      toggleCards: root.querySelector('[data-toggle-cards]'),
      handCover: root.querySelector('[data-hand-cover]'),
      storyStage: root.querySelector('[data-open-story]')
    };

    const cardElement = id => refs.slots.find(slot => slot.dataset.virtualCard === id) || null;
    const primaryAction = () => root.querySelector(`[data-virtual-action="${state.phase === 'exchange' ? 'exchange' : state.phase === 'play' ? 'play' : ''}"]`);
    const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

    const showAction = (action, visible, enabled = true) => {
      const button = root.querySelector(`[data-virtual-action="${action}"]`);
      if (!button) return;
      button.hidden = !visible;
      button.disabled = !enabled || busy || cardsHidden;
    };

    const updateFocus = () => {
      const id = state.playedCard || state.discard.at(-1) || '';
      const played = Boolean(state.playedCard);
      refs.focus.classList.toggle('has-card', Boolean(id));
      refs.focus.classList.toggle('is-played', played);
      refs.focus.classList.toggle('is-discarded', Boolean(id) && !played);
      refs.tableCard.hidden = !id;
      refs.focusPlaceholder.hidden = Boolean(id);

      refs.focusLabel.hidden = !id && state.phase !== 'completed';
      if (state.phase === 'completed') refs.focusLabel.textContent = 'Finale accettato';
      else if (played) refs.focusLabel.textContent = 'Carta giocata';
      else if (id) refs.focusLabel.textContent = 'Carta scartata';
      else refs.focusLabel.textContent = '';
      if (refs.focusHelp) refs.focusHelp.textContent = state.phase === 'exchange' ? 'Carta da cambiare' : 'Carta da giocare';

      refs.tableCard.className = 'virtual-table-card';
      refs.tableCard.innerHTML = id ? cardFaceMarkup(id) : '';
      if (id) refs.tableCard.classList.add(...cardClasses(id).split(' '));
    };

    const updateHand = () => {
      refs.handCount.textContent = `${state.hand.length} ${state.hand.length === 1 ? 'carta' : 'carte'}`;
      refs.slots.forEach((slot, index) => {
        const id = state.hand[index] || '';
        slot.dataset.virtualCard = id;
        slot.className = 'virtual-card-slot';
        slot.disabled = !id || busy || cardsHidden || !['exchange', 'play'].includes(state.phase);
        slot.setAttribute('aria-pressed', String(id === selectedId));
        if (!id) {
          slot.classList.add('empty');
          slot.innerHTML = '';
          slot.removeAttribute('aria-label');
          return;
        }
        const card = engine.cardFromId(id);
        const meaning = engine.meaningFor(id);
        if (cardsHidden) {
          slot.classList.add('card-back');
          slot.innerHTML = '<span class="virtual-card-back-mark"><img src="storia52-cards-logo.svg" alt=""><small>E POI?</small></span>';
          slot.setAttribute('aria-label', 'Carta coperta');
          return;
        }
        slot.classList.add(...cardClasses(id).split(' '));
        if (id === selectedId) slot.classList.add('selected');
        slot.innerHTML = cardFaceMarkup(id);
        slot.setAttribute('aria-label', `${card.rank} di ${card.name}. ${meaning.title}. ${meaning.text}`);
      });
      root.classList.toggle('cards-hidden', cardsHidden);
      refs.handCover.hidden = true;
      refs.toggleCards.textContent = cardsHidden ? 'Mostra' : 'Nascondi';
      refs.toggleCards.setAttribute('aria-pressed', String(cardsHidden));
    };

    const updateActions = () => {
      refs.actions.forEach(button => { button.hidden = true; button.disabled = true; button.classList.remove('drag-suggested'); });
      const selected = Boolean(selectedId);
      showAction('exchange', state.phase === 'exchange', selected);
      showAction('skip-exchange', state.phase === 'exchange' && state.hand.length <= 1, true);
      showAction('play', state.phase === 'play', selected);
      showAction('draw-end', state.phase === 'afterPlay', true);
      showAction('skip-draw', state.phase === 'afterPlay' && state.hand.length > 0, true);
      showAction('final', state.phase === 'afterPlay' && state.hand.length === 0, true);
      showAction('complete', state.phase === 'final', true);
      showAction('continue', state.phase === 'final', true);
      const home = root.querySelector('[data-virtual-home]');
      home.hidden = state.phase !== 'completed';
      home.disabled = busy;
      const visibleActions = [...refs.actions, home].filter(button => !button.hidden).length;
      refs.actionsWrap.dataset.count = String(visibleActions);
    };

    const update = () => {
      root.dataset.phase = state.phase;
      refs.title.textContent = state.phase === 'final' ? 'Finale' : state.phase === 'completed' ? 'Partita conclusa' : `Turno ${state.turn}`;
      refs.text.textContent = instructionFor(state);
      const current = phaseIndex(state.phase);
      root.querySelectorAll('[data-rail-step]').forEach(item => {
        const index = Number(item.dataset.railStep);
        item.classList.toggle('done', index < current);
        item.classList.toggle('current', index === current);
      });
      refs.deckAction.textContent = state.phase === 'afterPlay' || state.phase === 'final' ? 'PESCA' : 'MAZZO';
      refs.deck.classList.toggle('can-draw', state.phase === 'afterPlay' || state.phase === 'final');
      refs.deck.disabled = busy || !['afterPlay', 'final'].includes(state.phase);
      const phaseCopy = state.phase === 'exchange'
        ? [state.hand.length > 1 ? 'CAMBIA UNA CARTA' : 'CAMBIA O TIENI LA CARTA', 'Tocca per selezionarla oppure trascinala sul tavolo.']
        : state.phase === 'play'
          ? ['GIOCA UNA CARTA', 'Tocca per selezionarla oppure trascinala sul tavolo.']
          : state.phase === 'afterPlay'
            ? ['RACCONTA LA SCENA', 'Poi scegli se pescare oppure continuare con una carta in meno.']
            : state.phase === 'final'
              ? ['COLLEGA IL FINALE', 'Rivela il tuo obiettivo e chiudi la storia.']
              : ['FINALE ACCETTATO', 'La storia è conclusa.'];
      refs.phaseTitle.textContent = phaseCopy[0];
      refs.phaseHelp.textContent = phaseCopy[1];
      refs.phaseCallout.dataset.phase = state.phase;
      refs.hint.textContent = state.phase === 'exchange'
        ? 'Tocco: seleziona. Trascinamento verso il tavolo: cambia subito.'
        : state.phase === 'play'
          ? 'Tocco: seleziona. Trascinamento verso il tavolo: gioca subito.'
          : state.phase === 'afterPlay'
            ? 'La carta resta sul tavolo mentre racconti.'
            : state.phase === 'final'
              ? 'Rivela l’obiettivo e racconta il finale.'
              : 'La storia è conclusa.';
      updateFocus();
      updateHand();
      updateActions();
    };

    const selectCard = (id, force = false) => {
      if (busy || cardsHidden || !['exchange', 'play'].includes(state.phase) || !state.hand.includes(id)) return;
      selectedId = force ? id : selectedId === id ? '' : id;
      updateHand();
      updateActions();
      if (selectedId && navigator.vibrate) navigator.vibrate(12);
    };

    const makeGhost = (element, extraClass = '') => {
      const rect = element.getBoundingClientRect();
      const ghost = element.cloneNode(true);
      ghost.classList.remove('selected', 'is-drag-source', 'is-flight-source', 'is-draw-target', 'card-enter');
      ghost.classList.add('virtual-drag-ghost');
      ghost.removeAttribute('aria-pressed');
      if (extraClass) ghost.classList.add(extraClass);
      Object.assign(ghost.style, {
        left: `${rect.left}px`,
        top: `${rect.top}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        transform: 'translate3d(0,0,0)'
      });
      refs.overlay.appendChild(ghost);
      return { ghost, rect };
    };

    const animateGhostBetween = async (ghost, fromRect, targetRect, { rotate = 0, scale = 0.84, duration = 300 } = {}) => {
      if (!ghost || reducedMotion()) return;
      const dx = targetRect.left + targetRect.width / 2 - (fromRect.left + fromRect.width / 2);
      const dy = targetRect.top + targetRect.height / 2 - (fromRect.top + fromRect.height / 2);
      try {
        await ghost.animate([
          { transform: 'translate3d(0,0,0) scale(1) rotate(0deg)', offset: 0 },
          { transform: `translate3d(${dx * .48}px,${dy * .35 - 18}px,0) scale(1.04) rotate(${rotate * .35}deg)`, offset: .48 },
          { transform: `translate3d(${dx}px,${dy}px,0) scale(${scale}) rotate(${rotate}deg)`, offset: 1 }
        ], { duration, easing: 'cubic-bezier(.2,.75,.18,1)', fill: 'forwards' }).finished;
      } catch { /* Stato e interfaccia restano coerenti. */ }
    };

    const animateCardToFocus = async source => {
      if (!source) return;
      const { ghost, rect } = makeGhost(source, 'is-action-flight');
      source.classList.add('is-flight-source');
      const target = refs.focus.getBoundingClientRect();
      await animateGhostBetween(ghost, rect, target, { rotate: state.phase === 'exchange' ? 5 : -2, scale: .9, duration: 320 });
      ghost.remove();
      source.classList.remove('is-flight-source');
    };

    const animateDeckToCard = async id => {
      const target = cardElement(id);
      if (!target) return;
      const sourceRect = refs.deck.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const ghost = target.cloneNode(true);
      ghost.classList.add('virtual-drag-ghost', 'is-draw-flight');
      Object.assign(ghost.style, {
        left: `${targetRect.left}px`,
        top: `${targetRect.top}px`,
        width: `${targetRect.width}px`,
        height: `${targetRect.height}px`
      });
      refs.overlay.appendChild(ghost);
      target.classList.add('is-draw-target');
      const dx = sourceRect.left + sourceRect.width / 2 - (targetRect.left + targetRect.width / 2);
      const dy = sourceRect.top + sourceRect.height / 2 - (targetRect.top + targetRect.height / 2);
      const startScale = Math.max(.42, sourceRect.width / targetRect.width);
      if (!reducedMotion()) {
        try {
          await ghost.animate([
            { transform: `translate3d(${dx}px,${dy}px,0) scale(${startScale}) rotate(-5deg)`, opacity: .85 },
            { transform: `translate3d(${dx * .44}px,${dy * .38 - 18}px,0) scale(.82) rotate(3deg)`, opacity: 1, offset: .52 },
            { transform: 'translate3d(0,0,0) scale(1) rotate(0deg)', opacity: 1 }
          ], { duration: 360, easing: 'cubic-bezier(.2,.75,.18,1)', fill: 'forwards' }).finished;
        } catch { /* La carta appare comunque nella mano. */ }
      }
      ghost.remove();
      target.classList.remove('is-draw-target');
      target.classList.add('card-enter');
      setTimeout(() => target.classList.remove('card-enter'), 360);
    };

    const burstConfetti = () => {
      if (reducedMotion()) return;
      refs.confetti.innerHTML = Array.from({ length: 34 }, (_, index) => `<i style="--i:${index};--x:${(index % 9) - 4};--r:${(index * 37) % 180}deg"></i>`).join('');
      refs.confetti.classList.add('show');
      setTimeout(() => { refs.confetti.classList.remove('show'); refs.confetti.innerHTML = ''; }, 1700);
    };

    const commitOutcome = async (outcome, action) => {
      state = outcome.state;
      selectedId = '';
      saveState(session, playerIndex, state);
      update();
      if (outcome.drawn) await animateDeckToCard(outcome.drawn);
      if (outcome.reshuffled) S.toast('Le carte scartate sono tornate nel mazzo.');
      if (action === 'complete') burstConfetti();
      busy = false;
      update();
    };

    const run = async (action, id = selectedId) => {
      if (busy) return;
      const outcome = engine.apply(state, action, session.cardSeed, playerIndex, id);
      if (!outcome.ok) {
        S.toast(outcome.message);
        if (['exchange', 'play'].includes(action)) root.querySelector('[data-virtual-hand]')?.classList.add('needs-selection');
        setTimeout(() => root.querySelector('[data-virtual-hand]')?.classList.remove('needs-selection'), 420);
        return;
      }

      busy = true;
      updateActions();
      const source = id ? cardElement(id) : null;
      if (source && ['exchange', 'play'].includes(action)) await animateCardToFocus(source);
      await commitOutcome(outcome, action);
    };

    const dropState = current => {
      if (!current?.ghost || !current?.rect) return { valid: false, armed: false };
      const distance = Math.hypot(current.dx, current.dy);
      const focusRect = refs.focus.getBoundingClientRect();
      const ghostRect = current.ghost.getBoundingClientRect();
      const centerX = ghostRect.left + ghostRect.width / 2;
      const centerY = ghostRect.top + ghostRect.height / 2;
      const centerInside = centerX >= focusRect.left - 8 && centerX <= focusRect.right + 8
        && centerY >= focusRect.top - 8 && centerY <= focusRect.bottom + 8;
      const thrownUp = current.dy < -112 && Math.abs(current.dy) > Math.abs(current.dx) * .82;
      const armed = distance >= 76 && (centerInside || thrownUp);
      return { valid: armed, armed };
    };

    const returnDragGhost = async current => {
      if (!current.ghost) return;
      if (!reducedMotion()) {
        try {
          await current.ghost.animate([
            { transform: current.ghost.style.transform || 'translate3d(0,0,0)' },
            { transform: 'translate3d(0,0,0) scale(1)' }
          ], { duration: 170, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'forwards' }).finished;
        } catch { /* Ripristino immediato. */ }
      }
      current.ghost.remove();
      current.slot.classList.remove('is-drag-source');
      refs.focus.classList.remove('drag-armed');
    };

    const finishPointer = async (event, cancelled = false) => {
      if (!pointer || event.pointerId !== pointer.pointerId) return;
      const current = pointer;
      pointer = null;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      current.slot.releasePointerCapture?.(event.pointerId);

      if (!current.dragging) {
        if (!cancelled) selectCard(current.id);
        return;
      }

      const action = state.phase === 'exchange' ? 'exchange' : state.phase === 'play' ? 'play' : '';
      const valid = !cancelled && action && dropState(current).valid;

      if (!valid) {
        await returnDragGhost(current);
        return;
      }

      const outcome = engine.apply(state, action, session.cardSeed, playerIndex, current.id);
      if (!outcome.ok) {
        await returnDragGhost(current);
        S.toast(outcome.message);
        return;
      }

      busy = true;
      selectedId = current.id;
      updateActions();
      refs.focus.classList.add('drag-armed');
      const targetRect = refs.focus.getBoundingClientRect();
      const dx = targetRect.left + targetRect.width / 2 - (current.rect.left + current.rect.width / 2);
      const dy = targetRect.top + targetRect.height / 2 - (current.rect.top + current.rect.height / 2);
      if (!reducedMotion()) {
        try {
          await current.ghost.animate([
            { transform: current.ghost.style.transform || `translate3d(${current.dx}px,${current.dy}px,0)` },
            { transform: `translate3d(${dx}px,${dy}px,0) scale(.88) rotate(${action === 'exchange' ? 5 : -2}deg)` }
          ], { duration: 210, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'forwards' }).finished;
        } catch { /* Lo stato viene comunque applicato. */ }
      }
      current.ghost.remove();
      current.slot.classList.remove('is-drag-source');
      refs.focus.classList.remove('drag-armed');
      await commitOutcome(outcome, action);
    };

    refs.slots.forEach(slot => {
      slot.addEventListener('pointerdown', event => {
        const id = slot.dataset.virtualCard;
        if (!id || busy || cardsHidden || !['exchange', 'play'].includes(state.phase)) return;
        event.preventDefault();
        slot.setPointerCapture?.(event.pointerId);
        pointer = {
          slot,
          id,
          pointerId: event.pointerId,
          startX: event.clientX,
          startY: event.clientY,
          dx: 0,
          dy: 0,
          dragging: false,
          ghost: null
        };
      }, { passive: false });

      slot.addEventListener('pointermove', event => {
        if (!pointer || pointer.slot !== slot || pointer.pointerId !== event.pointerId) return;
        event.preventDefault();
        pointer.dx = event.clientX - pointer.startX;
        pointer.dy = event.clientY - pointer.startY;
        if (!pointer.dragging && Math.hypot(pointer.dx, pointer.dy) >= 15) {
          const made = makeGhost(slot);
          pointer.dragging = true;
          pointer.ghost = made.ghost;
          pointer.rect = made.rect;
          slot.classList.add('is-drag-source');
        }
        if (!pointer.dragging || frame) return;
        frame = requestAnimationFrame(() => {
          frame = 0;
          if (!pointer?.ghost) return;
          pointer.ghost.style.transform = `translate3d(${pointer.dx}px,${pointer.dy}px,0) rotate(${Math.max(-7, Math.min(7, pointer.dx / 18))}deg) scale(1.035)`;
          const armed = dropState(pointer).armed;
          refs.focus.classList.toggle('drag-armed', armed);
          primaryAction()?.classList.toggle('drag-preview', armed);
        });
      }, { passive: false });

      slot.addEventListener('pointerup', event => finishPointer(event));
      slot.addEventListener('pointercancel', event => finishPointer(event, true));
      slot.addEventListener('lostpointercapture', event => {
        if (pointer && pointer.pointerId === event.pointerId) finishPointer(event, true);
      });
      slot.addEventListener('click', event => {
        if (event.detail !== 0) return;
        selectCard(slot.dataset.virtualCard);
      });
    });

    refs.actions.forEach(button => button.addEventListener('click', () => run(button.dataset.virtualAction)));
    refs.deck.addEventListener('click', () => {
      if (state.phase === 'afterPlay') run('draw-end');
      else if (state.phase === 'final') run('continue');
    });
    refs.toggleCards.addEventListener('click', () => {
      cardsHidden = !cardsHidden;
      if (cardsHidden) selectedId = '';
      update();
    });
    refs.handCover.addEventListener('click', () => {
      cardsHidden = false;
      update();
    });
    refs.storyStage.addEventListener('click', () => openStoryPopup(session));
    root.querySelector('[data-virtual-menu]').addEventListener('click', () => openMenu(session, playerIndex, {
      invite: async () => {
        try { await S.openGameInvite(session); }
        catch (error) { S.toast(error?.message || 'Invito non disponibile.'); }
      }
    }));
    root.querySelector('[data-virtual-theme]').addEventListener('click', () => document.querySelector('#themeToggle')?.click());
    root.querySelector('[data-virtual-exit]').addEventListener('click', () => S.openExitModal?.());
    root.querySelector('[data-virtual-home]').addEventListener('click', S.renderHome);

    const cleanup = () => {
      if (pointer?.ghost) pointer.ghost.remove();
      if (pointer?.slot) pointer.slot.classList.remove('is-drag-source');
      pointer = null;
      refs.overlay.innerHTML = '';
      refs.focus.classList.remove('drag-armed');
      document.querySelectorAll('.virtual-menu-sheet').forEach(node => node.remove());
    };
    window.addEventListener('pagehide', cleanup, { once: true });
    const observer = new MutationObserver(() => {
      if (S.play.contains(root)) return;
      cleanup();
      document.body.classList.remove('virtual-table-active');
      observer.disconnect();
    });
    observer.observe(S.play, { childList: true });
    update();
  };
})();
