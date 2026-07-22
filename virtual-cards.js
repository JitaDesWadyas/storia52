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
        text: even ? 'Rafforza un legame' : 'Crea distanza o tensione',
        ...polarity(even)
      };
    }
    if (numeric && card.id.startsWith('D-')) {
      return {
        title: `Scoperta ${even ? 'positiva' : 'negativa'}`,
        short: 'Scoperta',
        text: even ? 'Scopri qualcosa che aiuta' : 'Scopri qualcosa che complica',
        ...polarity(even)
      };
    }
    if (numeric && card.id.startsWith('C-')) {
      return { title: 'Azione', short: 'Azione', text: 'Un personaggio agisce', ...polarity(false, true) };
    }
    if (numeric) {
      return { title: 'Ostacolo', short: 'Ostacolo', text: 'Compare un problema', ...polarity(false) };
    }

    const positive = card.red;
    const special = {
      J: { short: 'Oggetto', good: 'Un oggetto aiuta', bad: 'Un oggetto crea problemi' },
      Q: { short: 'Personaggio', good: 'Una persona aiuta', bad: 'Una persona ostacola' },
      K: { short: 'Luogo', good: 'Un luogo offre possibilità', bad: 'Un luogo complica tutto' },
      A: { short: 'Svolta', good: 'La situazione migliora', bad: 'La situazione peggiora' }
    }[card.rank];

    return {
      title: `${special.short} ${positive ? 'positivo' : 'negativo'}`,
      short: special.short,
      text: positive ? special.good : special.bad,
      ...polarity(positive)
    };
  };

  // Un mazzo deterministico viene diviso fra tutti i telefoni. Ogni carta
  // appartiene a un solo giocatore, anche dopo pescate e rimescolamenti.
  const buildAssignments = (seed, count) => {
    const playerCount = Math.max(2, Math.min(8, Number(count) || 2));
    const deck = shuffle(CARD_IDS, `${seed}|mazzo-condiviso`);
    const hands = Array.from({ length: playerCount }, () => []);
    const piles = Array.from({ length: playerCount }, () => []);
    let cursor = 0;

    for (let round = 0; round < 5; round += 1) {
      for (let player = 0; player < playerCount; player += 1) {
        hands[player].push(deck[cursor]);
        cursor += 1;
      }
    }

    let player = 0;
    while (cursor < deck.length) {
      piles[player].push(deck[cursor]);
      cursor += 1;
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
    if (!state || state.version !== 3) return false;
    if (!['exchange', 'play', 'afterPlay', 'final', 'completed'].includes(state.phase)) return false;
    const assignment = buildAssignments(seed, count)[playerIndex];
    if (!assignment) return false;
    const cards = [
      ...(state.hand || []),
      ...(state.drawPile || []),
      ...(state.discard || []),
      ...(state.playedCard ? [state.playedCard] : [])
    ];
    if (cards.some(card => !CARD_ID_SET.has(card))) return false;
    if (new Set(cards).size !== cards.length) return false;
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
      state.lastAction = 'exchange';
      return result(state, true, '', { drawn: drawn.card, reshuffled: drawn.reshuffled });
    }

    if (action === 'skip-exchange') {
      if (state.phase !== 'exchange') return result(source, false, 'Il cambio è già concluso.');
      if (state.hand.length > 1) return result(source, false, 'Con almeno due carte devi cambiarne una.');
      state.phase = 'play';
      state.lastAction = 'skip-exchange';
      return result(state, true);
    }

    if (action === 'play') {
      if (state.phase !== 'play') return result(source, false, 'Prima cambia una carta.');
      const index = state.hand.indexOf(cardId);
      if (index < 0) return result(source, false, 'Scegli una carta.');
      state.hand.splice(index, 1);
      state.playedCard = cardId;
      state.phase = 'afterPlay';
      state.lastAction = 'play';
      return result(state, true);
    }

    if (action === 'draw-end') {
      if (state.phase !== 'afterPlay') return result(source, false, 'Puoi pescare dopo aver giocato.');
      settlePlayedCard(state);
      const drawn = drawOne(state, seed, playerIndex);
      if (!drawn.card) return result(source, false, 'Non ci sono carte disponibili.');
      state.phase = 'exchange';
      state.turn += 1;
      state.lastAction = 'draw';
      return result(state, true, '', { drawn: drawn.card, reshuffled: drawn.reshuffled });
    }

    if (action === 'skip-draw') {
      if (state.phase !== 'afterPlay') return result(source, false, 'Prima gioca una carta.');
      if (!state.hand.length) return result(source, false, 'Con la mano vuota pesca oppure vai al finale.');
      settlePlayedCard(state);
      state.phase = 'exchange';
      state.turn += 1;
      state.lastAction = 'skip-draw';
      return result(state, true);
    }

    if (action === 'final') {
      if (state.phase !== 'afterPlay' || state.hand.length) return result(source, false, 'Il finale si tenta dopo l’ultima carta.');
      state.phase = 'final';
      state.lastAction = 'final';
      return result(state, true);
    }

    if (action === 'continue') {
      if (state.phase !== 'final') return result(source, false, 'La partita non è nella fase finale.');
      settlePlayedCard(state);
      const drawn = drawOne(state, seed, playerIndex);
      if (!drawn.card) return result(source, false, 'Non ci sono carte disponibili.');
      state.phase = 'exchange';
      state.turn += 1;
      state.lastAction = 'continue';
      return result(state, true, '', { drawn: drawn.card, reshuffled: drawn.reshuffled });
    }

    if (action === 'complete') {
      if (state.phase !== 'final') return result(source, false, 'Prima racconta il finale.');
      state.phase = 'completed';
      state.lastAction = 'complete';
      return result(state, true);
    }

    return result(source, false, 'Azione non riconosciuta.');
  };

  const engine = Object.freeze({ cardIds: CARD_IDS, cardFromId, meaningFor, buildAssignments, createState, isValidState, apply });
  window.EpoiVirtualCardsEngine = engine;

  const S = window.S52;
  if (!S) return;

  const storageKey = (session, playerIndex) => {
    const game = `${session.cardSeed}|${session.readyStoryId}|${session.count}`;
    return `epoi_virtual_${hashSeed(game).toString(36)}_${playerIndex}`;
  };

  const loadState = (session, playerIndex) => {
    const key = storageKey(session, playerIndex);
    let state = null;
    try { state = JSON.parse(localStorage.getItem(key) || 'null'); }
    catch { /* Lo stato viene ricreato. */ }
    if (!engine.isValidState(state, session.cardSeed, session.count, playerIndex)) {
      state = engine.createState(session.cardSeed, session.count, playerIndex);
      try { localStorage.setItem(key, JSON.stringify(state)); } catch { /* Il gioco continua. */ }
    }
    return state;
  };

  const saveState = (session, playerIndex, state) => {
    try { localStorage.setItem(storageKey(session, playerIndex), JSON.stringify(state)); }
    catch { /* Il gioco continua anche senza persistenza. */ }
  };

  const cardFaceMarkup = id => {
    const card = engine.cardFromId(id);
    const meaning = engine.meaningFor(id);
    if (!card) return '';
    return `<span class="virtual-card-corner"><b>${S.esc(card.rank)}</b><i>${card.symbol}</i></span><span class="virtual-card-effect"><em>${S.esc(meaning.badge)}</em><b>${S.esc(meaning.short)}</b><small>${S.esc(meaning.text)}</small></span>`;
  };

  const cardSlotMarkup = index => `<button type="button" class="virtual-card-slot empty" data-card-slot="${index}" aria-pressed="false" aria-label="Carta ${index + 1}"><span class="virtual-empty-slot" aria-hidden="true"></span></button>`;

  const phaseIndex = phase => ({ exchange: 0, play: 1, afterPlay: 2, final: 2, completed: 2 }[phase] || 0);
  const instructionFor = state => {
    if (state.phase === 'exchange') return state.hand.length > 1
      ? { title: `Turno ${state.turn}`, text: 'Trascina in alto una carta da cambiare' }
      : { title: `Turno ${state.turn}`, text: 'Cambia o tieni l’ultima carta' };
    if (state.phase === 'play') return { title: `Turno ${state.turn}`, text: 'Trascina in alto la carta da giocare' };
    if (state.phase === 'afterPlay') return { title: `Turno ${state.turn}`, text: state.hand.length ? 'Racconta, poi pesca o non pescare' : 'Racconta, poi pesca o vai al finale' };
    if (state.phase === 'final') return { title: 'Finale', text: 'Collega questa scena al tuo obiettivo' };
    return { title: 'Partita conclusa', text: 'Il finale è stato accettato' };
  };

  const actionShellMarkup = () => `
    <button type="button" class="primary" data-virtual-action="exchange">Cambia</button>
    <button type="button" class="secondary" data-virtual-action="skip-exchange">Tieni</button>
    <button type="button" class="primary" data-virtual-action="play">Gioca</button>
    <button type="button" class="primary" data-virtual-action="draw-end">Pesca</button>
    <button type="button" class="secondary" data-virtual-action="skip-draw">Non pescare</button>
    <button type="button" class="secondary" data-virtual-action="final">Finale</button>
    <button type="button" class="primary" data-virtual-objective data-action-objective hidden>Obiettivo</button>
    <button type="button" class="secondary" data-virtual-action="complete">Finale accettato</button>
    <button type="button" class="text-button" data-virtual-action="continue">Continuiamo</button>
    <button type="button" class="primary" data-virtual-home>Home</button>`;

  const shellMarkup = (session, playerIndex) => `<section class="surface virtual-game" data-virtual-root data-phase="exchange">
    <header class="virtual-game-header">
      <div class="virtual-player-title"><p class="eyebrow">${S.esc(S.playerName(session, playerIndex))}</p><div><h2 data-turn-title>Turno 1</h2><p data-turn-text>Trascina in alto una carta</p></div></div>
      <nav class="virtual-header-actions" aria-label="Strumenti partita">
        <button type="button" class="secondary compact" data-virtual-story>Storia</button>
        <button type="button" class="secondary compact" data-virtual-rules>Regole</button>
        <button type="button" class="secondary compact" data-virtual-invite>QR</button>
        <button type="button" class="secondary compact" data-virtual-objective>Obiettivo</button>
      </nav>
    </header>
    <ol class="virtual-turn-rail" aria-label="Fasi del turno">
      <li data-rail-step="0"><span>1</span><b>Cambia</b></li>
      <li data-rail-step="1"><span>2</span><b>Gioca</b></li>
      <li data-rail-step="2"><span>3</span><b>Chiudi</b></li>
    </ol>
    <section class="virtual-table" aria-label="Tavolo di gioco">
      <button type="button" class="virtual-deck-card" data-virtual-deck aria-label="Mazzo">
        <span class="virtual-deck-layer layer-four"></span><span class="virtual-deck-layer layer-three"></span><span class="virtual-deck-layer layer-two"></span><span class="virtual-deck-layer layer-one"></span>
        <span class="virtual-deck-face"><img src="storia52-cards-logo.svg" alt=""><small data-deck-action>MAZZO</small></span>
      </button>
      <article class="virtual-play-zone empty" data-play-zone>
        <div class="virtual-drop-visual" data-drop-visual aria-hidden="true"><span>↑</span><i></i></div>
        <span class="virtual-table-card" data-table-card hidden><span class="virtual-card-corner"><b></b><i></i></span><span class="virtual-card-effect"><em></em><b></b><small></small></span></span>
        <div class="virtual-zone-copy"><small data-zone-label>TAVOLO</small><h3 data-zone-title>Trascina una carta verso l’alto</h3><p data-zone-text>La vedrai arrivare qui e resterà sul tavolo mentre racconti.</p></div>
      </article>
      <div class="virtual-discard-stack" data-virtual-discard aria-label="Scarti">
        <span class="virtual-discard-card empty" data-discard-card><img src="storia52-cards-logo.svg" alt=""><small>SCARTI</small></span>
      </div>
    </section>
    <section class="virtual-hand-section">
      <div class="virtual-hand-heading"><span>LA TUA MANO</span><b data-hand-count>5 carte</b></div>
      <div class="virtual-hand" data-virtual-hand>${Array.from({ length: 5 }, (_, index) => cardSlotMarkup(index)).join('')}</div>
      <p class="virtual-gesture-hint" data-gesture-hint>Trascina sempre verso l’alto.</p>
    </section>
    <div class="virtual-actions" data-virtual-actions>${actionShellMarkup()}</div>
  </section>`;

  const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  const freezeGhostAtRect = (ghost, rect) => {
    Object.assign(ghost.style, {
      left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px`, transform: 'none'
    });
  };

  const animateGhostTo = async (ghost, target, kind) => {
    if (!ghost || !target) return;
    const from = ghost.getBoundingClientRect();
    const to = target.getBoundingClientRect();
    freezeGhostAtRect(ghost, from);
    if (reducedMotion()) return;
    const dx = to.left + to.width / 2 - (from.left + from.width / 2);
    const dy = to.top + to.height / 2 - (from.top + from.height / 2);
    const rotate = kind === 'exchange' ? 7 : -2;
    try {
      await ghost.animate([
        { transform: 'translate3d(0,0,0) scale(1) rotate(0)', opacity: 1 },
        { transform: `translate3d(${dx}px,${dy}px,0) scale(.72) rotate(${rotate}deg)`, opacity: .94 }
      ], { duration: 260, easing: 'cubic-bezier(.18,.78,.22,1)', fill: 'forwards' }).finished;
    } catch { /* L’azione continua. */ }
  };

  const animateGhostBack = async (ghost, sourceRect) => {
    if (!ghost) return;
    const from = ghost.getBoundingClientRect();
    freezeGhostAtRect(ghost, from);
    if (reducedMotion()) return;
    const dx = sourceRect.left - from.left;
    const dy = sourceRect.top - from.top;
    try {
      await ghost.animate([
        { transform: 'translate3d(0,0,0) scale(1.03)', opacity: 1 },
        { transform: `translate3d(${dx}px,${dy}px,0) scale(1)`, opacity: 1 }
      ], { duration: 180, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'forwards' }).finished;
    } catch { /* Il rilascio continua. */ }
  };

  const animateFlight = async (element, target, kind) => {
    if (!element || !target) return;
    const from = element.getBoundingClientRect();
    const ghost = element.cloneNode(true);
    ghost.classList.add('virtual-drag-ghost', 'is-button-flight');
    Object.assign(ghost.style, { position: 'fixed', left: `${from.left}px`, top: `${from.top}px`, width: `${from.width}px`, height: `${from.height}px`, zIndex: '9999', pointerEvents: 'none' });
    document.body.appendChild(ghost);
    element.classList.add('is-flight-source');
    await animateGhostTo(ghost, target, kind);
    ghost.remove();
    element.classList.remove('is-flight-source');
  };

  const openRulesPopup = initial => {
    const sections = {
      cards: ['Carte', () => S.cardRulesMarkup()],
      turn: ['Turno', () => S.turnGuideMarkup()],
      final: ['Finale', () => S.finalRulesMarkup()]
    };
    const body = `<div class="virtual-popup"><nav class="virtual-popup-tabs">${Object.entries(sections).map(([id, [label]]) => `<button type="button" class="${id === initial ? 'active' : ''}" data-rule-tab="${id}">${label}</button>`).join('')}</nav><div class="virtual-popup-scroll" data-rule-panel>${sections[initial][1]()}</div></div>`;
    const modal = S.modal('Regole', body, { wide: true, className: 'virtual-rules-modal' });
    const panel = modal.host.querySelector('[data-rule-panel]');
    modal.host.querySelectorAll('[data-rule-tab]').forEach(button => button.addEventListener('click', () => {
      const section = sections[button.dataset.ruleTab];
      if (!section || !panel) return;
      modal.host.querySelectorAll('[data-rule-tab]').forEach(item => item.classList.toggle('active', item === button));
      panel.innerHTML = section[1]();
      panel.scrollTop = 0;
      S.bindRulebook?.(panel);
    }));
    S.bindRulebook?.(panel);
  };

  const openStoryPopup = session => {
    S.modal('Storia', `<div class="virtual-popup-scroll virtual-story-popup">${S.storyContextMarkup(session)}</div>`, { wide: true, className: 'virtual-story-modal' });
  };

  S.renderVirtualPlayer = (session, playerIndex) => {
    if (session.cardMode !== 'virtual' || session.delivery !== 'multi') {
      S.toast('Le carte virtuali richiedono telefoni separati.');
      return;
    }

    let state = loadState(session, playerIndex);
    let selectedId = '';
    let busy = false;
    let incomingId = state.lastAction === 'deal' ? state.hand[state.hand.length - 1] : '';
    let drag = null;
    let dragFrame = 0;

    document.body.classList.add('virtual-table-active');
    S.mount(shellMarkup(session, playerIndex), { session: true, preserveHash: true, scroll: false, animate: false });
    const root = S.play.querySelector('[data-virtual-root]');
    if (!root) return;

    const refs = {
      title: root.querySelector('[data-turn-title]'),
      text: root.querySelector('[data-turn-text]'),
      handCount: root.querySelector('[data-hand-count]'),
      hint: root.querySelector('[data-gesture-hint]'),
      deck: root.querySelector('[data-virtual-deck]'),
      deckAction: root.querySelector('[data-deck-action]'),
      discard: root.querySelector('[data-virtual-discard]'),
      discardCard: root.querySelector('[data-discard-card]'),
      zone: root.querySelector('[data-play-zone]'),
      dropVisual: root.querySelector('[data-drop-visual]'),
      tableCard: root.querySelector('[data-table-card]'),
      zoneLabel: root.querySelector('[data-zone-label]'),
      zoneTitle: root.querySelector('[data-zone-title]'),
      zoneText: root.querySelector('[data-zone-text]'),
      slots: [...root.querySelectorAll('[data-card-slot]')],
      actions: [...root.querySelectorAll('[data-virtual-action]')],
      objectiveButtons: [...root.querySelectorAll('[data-virtual-objective]')]
    };

    const save = () => saveState(session, playerIndex, state);
    const cardElement = id => refs.slots.find(slot => slot.dataset.virtualCard === id) || null;

    const updateRail = () => {
      const current = phaseIndex(state.phase);
      root.querySelectorAll('[data-rail-step]').forEach(item => {
        const index = Number(item.dataset.railStep);
        item.classList.toggle('done', index < current);
        item.classList.toggle('current', index === current);
      });
    };

    const updateHand = () => {
      refs.handCount.textContent = `${state.hand.length} ${state.hand.length === 1 ? 'carta' : 'carte'}`;
      refs.slots.forEach((slot, index) => {
        const id = state.hand[index] || '';
        slot.dataset.virtualCard = id;
        slot.disabled = !id || busy || !['exchange', 'play'].includes(state.phase);
        slot.className = 'virtual-card-slot';
        slot.setAttribute('aria-pressed', String(Boolean(id && id === selectedId)));
        if (!id) {
          slot.classList.add('empty');
          slot.removeAttribute('aria-label');
          slot.innerHTML = '<span class="virtual-empty-slot" aria-hidden="true"></span>';
          return;
        }
        const card = engine.cardFromId(id);
        const meaning = engine.meaningFor(id);
        slot.classList.add(meaning.tone);
        if (card.red) slot.classList.add('red');
        if (id === selectedId) slot.classList.add('selected');
        if (id === incomingId) slot.classList.add('card-enter');
        slot.setAttribute('aria-label', `${card.rank} di ${card.name}: ${meaning.title}. ${meaning.text}`);
        slot.innerHTML = cardFaceMarkup(id);
      });
    };

    const updateDeck = () => {
      refs.deckAction.textContent = state.phase === 'afterPlay' ? 'PESCA' : 'MAZZO';
      refs.deck.classList.toggle('can-draw', state.phase === 'afterPlay');
      refs.deck.disabled = busy || state.phase !== 'afterPlay';
      refs.deck.setAttribute('aria-label', state.phase === 'afterPlay'
        ? `Pesca una carta. ${state.drawPile.length} carte disponibili.`
        : `Mazzo. ${state.drawPile.length} carte disponibili.`);
    };

    const updateDiscard = () => {
      const id = state.discard[state.discard.length - 1] || '';
      refs.discardCard.className = 'virtual-discard-card';
      if (!id) {
        refs.discardCard.classList.add('empty');
        refs.discardCard.innerHTML = '<img src="storia52-cards-logo.svg" alt=""><small>SCARTI</small>';
        return;
      }
      const card = engine.cardFromId(id);
      const meaning = engine.meaningFor(id);
      refs.discardCard.classList.add(meaning.tone);
      if (card.red) refs.discardCard.classList.add('red');
      refs.discardCard.innerHTML = `<span class="virtual-card-corner"><b>${S.esc(card.rank)}</b><i>${card.symbol}</i></span><span class="virtual-card-effect"><em>${S.esc(meaning.badge)}</em><b>${S.esc(meaning.short)}</b><small>${S.esc(meaning.text)}</small></span>`;
    };

    const updateZone = () => {
      const id = state.playedCard;
      refs.zone.className = 'virtual-play-zone';
      refs.tableCard.className = 'virtual-table-card';
      if (!id) {
        refs.zone.classList.add('empty');
        refs.dropVisual.hidden = false;
        refs.tableCard.hidden = true;
        refs.zoneLabel.textContent = state.phase === 'exchange' ? 'CAMBIO' : 'TAVOLO';
        refs.zoneTitle.textContent = state.phase === 'exchange' ? 'Trascina in alto verso gli scarti' : 'Trascina in alto verso il tavolo';
        refs.zoneText.textContent = state.phase === 'exchange'
          ? 'La carta salirà dalla mano e verrà sostituita.'
          : 'La carta salirà dalla mano e resterà qui mentre racconti.';
        return;
      }
      const card = engine.cardFromId(id);
      const meaning = engine.meaningFor(id);
      refs.zone.classList.add(meaning.tone, 'played');
      refs.tableCard.classList.add(meaning.tone);
      if (card.red) {
        refs.zone.classList.add('red');
        refs.tableCard.classList.add('red');
      }
      refs.dropVisual.hidden = true;
      refs.tableCard.hidden = false;
      refs.tableCard.innerHTML = cardFaceMarkup(id);
      refs.zoneLabel.textContent = 'CARTA GIOCATA';
      refs.zoneTitle.textContent = meaning.title;
      refs.zoneText.textContent = `${meaning.text}. Racconta la scena.`;
    };

    const showAction = (action, visible, enabled = true) => {
      const button = root.querySelector(`[data-virtual-action="${action}"]`);
      if (!button) return;
      button.hidden = !visible;
      button.disabled = !enabled || busy;
    };

    const updateActions = () => {
      refs.actions.forEach(button => { button.hidden = true; button.disabled = true; });
      refs.objectiveButtons.forEach(button => {
        button.disabled = busy;
        button.hidden = button.hasAttribute('data-action-objective') ? state.phase !== 'final' : false;
      });
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
      if (home) home.hidden = state.phase !== 'completed';
    };

    const updateTargets = () => {
      refs.discard.classList.toggle('is-drop-target', state.phase === 'exchange');
      refs.zone.classList.toggle('is-drop-target', state.phase === 'play');
    };

    const update = () => {
      const instruction = instructionFor(state);
      root.dataset.phase = state.phase;
      refs.title.textContent = instruction.title;
      refs.text.textContent = instruction.text;
      refs.hint.textContent = state.phase === 'exchange'
        ? 'Trascina una carta verso l’alto per cambiarla.'
        : state.phase === 'play'
          ? 'Trascina una carta verso l’alto per giocarla.'
          : state.phase === 'afterPlay'
            ? 'Tocca il mazzo per pescare.'
            : 'Usa i pulsanti per continuare.';
      updateRail();
      updateHand();
      updateDeck();
      updateDiscard();
      updateZone();
      updateTargets();
      updateActions();
      incomingId = '';
    };

    const select = id => {
      if (busy || !['exchange', 'play'].includes(state.phase) || !state.hand.includes(id)) return;
      selectedId = selectedId === id ? '' : id;
      updateHand();
      updateActions();
    };

    const commitOutcome = outcome => {
      state = outcome.state;
      selectedId = '';
      incomingId = outcome.drawn || '';
      busy = false;
      save();
      update();
      if (outcome.reshuffled) {
        refs.deck.classList.remove('is-shuffling');
        void refs.deck.offsetWidth;
        refs.deck.classList.add('is-shuffling');
        S.toast('Scarti rimescolati');
      }
    };

    const run = async (action, id = selectedId) => {
      if (busy) return;
      const outcome = engine.apply(state, action, session.cardSeed, playerIndex, id);
      if (!outcome.ok) { S.toast(outcome.message); return; }

      busy = true;
      updateActions();
      const source = id ? cardElement(id) : null;
      if (action === 'exchange') await animateFlight(source, refs.discard, 'exchange');
      if (action === 'play') await animateFlight(source, refs.zone, 'play');
      if (['draw-end', 'skip-draw', 'continue'].includes(action) && state.playedCard) {
        await animateFlight(refs.tableCard, refs.discard, 'exchange');
      }
      commitOutcome(outcome);
    };

    const createDragGhost = slot => {
      const rect = slot.getBoundingClientRect();
      const ghost = slot.cloneNode(true);
      ghost.classList.add('virtual-drag-ghost');
      ghost.classList.remove('selected', 'card-enter');
      Object.assign(ghost.style, {
        position: 'fixed', left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px`, margin: '0', zIndex: '9999', pointerEvents: 'none', transform: 'translate3d(0,0,0)'
      });
      document.body.appendChild(ghost);
      slot.classList.add('is-drag-source');
      return { ghost, rect };
    };

    const applyDragFrame = () => {
      dragFrame = 0;
      if (!drag) return;
      const x = drag.dx;
      const y = Math.min(18, drag.dy);
      const rotate = Math.max(-7, Math.min(7, x / 18));
      drag.ghost.style.transform = `translate3d(${x}px,${y}px,0) rotate(${rotate}deg) scale(1.035)`;
      const armed = y <= -54;
      refs.discard.classList.toggle('drag-armed', armed && state.phase === 'exchange');
      refs.zone.classList.toggle('drag-armed', armed && state.phase === 'play');
    };

    const clearDragTargets = () => {
      refs.discard.classList.remove('drag-armed');
      refs.zone.classList.remove('drag-armed');
    };

    const finishDrag = async (event, cancelled = false) => {
      if (!drag || drag.pointerId !== event.pointerId) return;
      const current = drag;
      drag = null;
      if (dragFrame) cancelAnimationFrame(dragFrame);
      dragFrame = 0;
      clearDragTargets();

      const valid = !cancelled && current.dy <= -72 && Math.abs(current.dy) > Math.abs(current.dx) * .55;
      const action = state.phase === 'exchange' ? 'exchange' : state.phase === 'play' ? 'play' : '';
      const target = action === 'exchange' ? refs.discard : refs.zone;
      current.slot.dataset.ignoreClickUntil = String(performance.now() + 500);

      if (!valid || !action) {
        await animateGhostBack(current.ghost, current.sourceRect);
        current.ghost.remove();
        current.slot.classList.remove('is-drag-source');
        return;
      }

      const outcome = engine.apply(state, action, session.cardSeed, playerIndex, current.id);
      if (!outcome.ok) {
        await animateGhostBack(current.ghost, current.sourceRect);
        current.ghost.remove();
        current.slot.classList.remove('is-drag-source');
        S.toast(outcome.message);
        return;
      }

      busy = true;
      selectedId = current.id;
      updateActions();
      await animateGhostTo(current.ghost, target, action);
      current.ghost.remove();
      current.slot.classList.remove('is-drag-source');
      commitOutcome(outcome);
    };

    refs.slots.forEach(slot => {
      slot.addEventListener('pointerdown', event => {
        const id = slot.dataset.virtualCard;
        if (!id || busy || !['exchange', 'play'].includes(state.phase)) return;
        event.preventDefault();
        const { ghost, rect } = createDragGhost(slot);
        drag = {
          slot, ghost, sourceRect: rect, id, pointerId: event.pointerId,
          startX: event.clientX, startY: event.clientY, dx: 0, dy: 0
        };
        slot.setPointerCapture?.(event.pointerId);
      });

      slot.addEventListener('pointermove', event => {
        if (!drag || drag.slot !== slot || drag.pointerId !== event.pointerId) return;
        event.preventDefault();
        drag.dx = event.clientX - drag.startX;
        drag.dy = event.clientY - drag.startY;
        if (!dragFrame) dragFrame = requestAnimationFrame(applyDragFrame);
      });

      slot.addEventListener('pointerup', event => finishDrag(event));
      slot.addEventListener('pointercancel', event => finishDrag(event, true));
      slot.addEventListener('click', () => {
        const ignoreUntil = Number(slot.dataset.ignoreClickUntil || 0);
        if (performance.now() < ignoreUntil) return;
        delete slot.dataset.ignoreClickUntil;
        select(slot.dataset.virtualCard);
      });
    });

    refs.actions.forEach(button => button.addEventListener('click', () => run(button.dataset.virtualAction)));
    refs.objectiveButtons.forEach(button => button.addEventListener('click', () => S.openObjective(session, playerIndex, true)));
    root.querySelector('[data-virtual-story]')?.addEventListener('click', () => openStoryPopup(session));
    root.querySelector('[data-virtual-rules]')?.addEventListener('click', () => openRulesPopup('cards'));
    root.querySelector('[data-virtual-invite]')?.addEventListener('click', async event => {
      const button = event.currentTarget;
      button.disabled = true;
      try { await S.openGameInvite(session); }
      catch (error) { S.toast(error?.message || 'Invito non disponibile.'); }
      finally { button.disabled = false; }
    });
    root.querySelector('[data-virtual-home]')?.addEventListener('click', S.renderHome);
    refs.deck.addEventListener('click', () => {
      if (state.phase === 'afterPlay') run('draw-end');
    });

    const cleanupObserver = new MutationObserver(() => {
      if (S.play.querySelector('[data-virtual-root]')) return;
      document.body.classList.remove('virtual-table-active');
      document.querySelectorAll('.virtual-drag-ghost').forEach(node => node.remove());
      cleanupObserver.disconnect();
    });
    cleanupObserver.observe(S.play, { childList: true, subtree: false });

    if (state.lastAction) {
      state.lastAction = '';
      save();
    }
    update();
  };
})();