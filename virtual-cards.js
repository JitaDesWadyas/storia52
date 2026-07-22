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
    return suit && RANKS.includes(rank) ? { id, rank, ...suit } : null;
  };

  const polarity = (positive, neutral = false) => neutral
    ? { tone: 'neutral', badge: 'AZIONE' }
    : positive
      ? { tone: 'positive', badge: 'POSITIVA' }
      : { tone: 'negative', badge: 'NEGATIVA' };

  const meaningFor = id => {
    const card = cardFromId(id);
    if (!card) return { title: 'Carta non valida', short: '', text: '', tone: 'neutral', badge: '' };

    const isEven = /^\d+$/.test(card.rank) && Number(card.rank) % 2 === 0;
    if (/^\d+$/.test(card.rank)) {
      if (card.id.startsWith('H-')) {
        return {
          title: `Relazione ${isEven ? 'positiva' : 'negativa'}`,
          short: 'Relazione',
          text: isEven ? 'Rafforza un legame.' : 'Crea distanza o tensione.',
          ...polarity(isEven)
        };
      }
      if (card.id.startsWith('D-')) {
        return {
          title: `Scoperta ${isEven ? 'positiva' : 'negativa'}`,
          short: 'Scoperta',
          text: isEven ? 'Scopri qualcosa che aiuta.' : 'Scopri qualcosa che complica.',
          ...polarity(isEven)
        };
      }
      if (card.id.startsWith('C-')) {
        return {
          title: 'Azione',
          short: 'Azione',
          text: 'Un personaggio agisce.',
          ...polarity(false, true)
        };
      }
      return {
        title: 'Ostacolo',
        short: 'Ostacolo',
        text: 'Compare un problema.',
        ...polarity(false)
      };
    }

    const positive = card.red;
    const special = {
      J: { short: 'Oggetto', text: positive ? 'Un oggetto aiuta.' : 'Un oggetto crea problemi.' },
      Q: { short: 'Personaggio', text: positive ? 'Una persona aiuta.' : 'Una persona ostacola.' },
      K: { short: 'Luogo', text: positive ? 'Un luogo offre possibilità.' : 'Un luogo complica tutto.' },
      A: { short: 'Svolta', text: positive ? 'La situazione migliora.' : 'La situazione peggiora.' }
    }[card.rank];

    return {
      title: `${special.short} ${positive ? 'positivo' : 'negativo'}`,
      short: special.short,
      text: special.text,
      ...polarity(positive)
    };
  };

  const buildAssignments = (seed, count) => {
    const playerCount = Math.max(2, Math.min(8, Number(count) || 2));
    const deck = shuffle(CARD_IDS, `${seed}|mazzo`);
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
      version: 2,
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
    if (!state || state.version !== 2) return false;
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
      if (state.phase !== 'exchange') return result(source, false, 'Il cambio è già stato fatto in questo turno.');
      const index = state.hand.indexOf(cardId);
      if (index < 0) return result(source, false, 'Scegli una carta della tua mano.');
      state.hand.splice(index, 1);
      state.discard.push(cardId);
      const drawn = drawOne(state, seed, playerIndex);
      state.phase = 'play';
      state.lastAction = 'exchange';
      return result(state, true, '', { drawn: drawn.card, reshuffled: drawn.reshuffled });
    }

    if (action === 'skip-exchange') {
      if (state.phase !== 'exchange') return result(source, false, 'Il cambio è già stato concluso.');
      if (state.hand.length > 1) return result(source, false, 'Con almeno due carte devi cambiarne una.');
      state.phase = 'play';
      state.lastAction = 'skip-exchange';
      return result(state, true);
    }

    if (action === 'play') {
      if (state.phase !== 'play') return result(source, false, 'Prima completa il cambio.');
      const index = state.hand.indexOf(cardId);
      if (index < 0) return result(source, false, 'Scegli una carta della tua mano.');
      state.hand.splice(index, 1);
      state.playedCard = cardId;
      state.phase = 'afterPlay';
      state.lastAction = 'play';
      return result(state, true);
    }

    if (action === 'draw-end') {
      if (state.phase !== 'afterPlay') return result(source, false, 'Puoi pescare soltanto dopo aver giocato.');
      settlePlayedCard(state);
      const drawn = drawOne(state, seed, playerIndex);
      if (!drawn.card) return result(source, false, 'Non ci sono carte disponibili.');
      state.phase = 'exchange';
      state.turn += 1;
      state.lastAction = 'draw';
      return result(state, true, '', { drawn: drawn.card, reshuffled: drawn.reshuffled });
    }

    if (action === 'skip-draw') {
      if (state.phase !== 'afterPlay') return result(source, false, 'Prima devi giocare una carta.');
      if (!state.hand.length) return result(source, false, 'Con la mano vuota devi pescare oppure collegarti al finale.');
      settlePlayedCard(state);
      state.phase = 'exchange';
      state.turn += 1;
      state.lastAction = 'skip-draw';
      return result(state, true);
    }

    if (action === 'final') {
      if (state.phase !== 'afterPlay' || state.hand.length) return result(source, false, 'Puoi tentare il finale soltanto dopo l’ultima carta.');
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

  const engine = Object.freeze({
    cardIds: CARD_IDS,
    cardFromId,
    meaningFor,
    buildAssignments,
    createState,
    isValidState,
    apply
  });
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

  const cardMarkup = (id, index, selected, incoming = false) => {
    const card = engine.cardFromId(id);
    const meaning = engine.meaningFor(id);
    return `<button type="button" class="virtual-card ${meaning.tone}${card.red ? ' red' : ''}${selected ? ' selected' : ''}${incoming ? ' card-enter' : ''}" data-virtual-card="${S.esc(id)}" aria-pressed="${selected ? 'true' : 'false'}" style="--card-index:${index}"><span class="virtual-card-corner"><b>${S.esc(card.rank)}</b><i>${card.symbol}</i></span><span class="virtual-card-effect"><em>${S.esc(meaning.badge)}</em><b>${S.esc(meaning.short)}</b><small>${S.esc(meaning.text)}</small></span></button>`;
  };

  const phaseIndex = phase => ({ exchange: 0, play: 1, afterPlay: 2, final: 2, completed: 2 }[phase] || 0);
  const phaseRail = state => {
    const current = phaseIndex(state.phase);
    const steps = ['Cambia', 'Gioca', 'Pesca o finale'];
    return `<ol class="virtual-turn-rail">${steps.map((label, index) => `<li class="${index < current ? 'done' : index === current ? 'current' : ''}"><span>${index + 1}</span><b>${label}</b></li>`).join('')}</ol>`;
  };

  const instructionFor = state => {
    if (state.phase === 'exchange') return state.hand.length > 1
      ? { title: `Turno ${state.turn} · Cambia`, text: 'Scorri una carta di lato oppure selezionala e conferma.' }
      : { title: `Turno ${state.turn} · Ultima carta`, text: 'Puoi cambiarla oppure tenerla e giocarla.' };
    if (state.phase === 'play') return { title: 'Gioca una carta', text: 'Scorrila verso l’alto oppure selezionala e conferma.' };
    if (state.phase === 'afterPlay') return { title: 'Racconta la scena', text: state.hand.length ? 'Poi pesca oppure termina il turno.' : 'Hai giocato l’ultima carta: pesca oppure collegati al finale.' };
    if (state.phase === 'final') return { title: 'Collegati al finale', text: 'Rivela il tuo obiettivo e continua questa stessa scena fino alla conclusione.' };
    return { title: 'Storia conclusa', text: 'Il finale è stato accettato.' };
  };

  const miniCardMarkup = id => {
    const card = engine.cardFromId(id);
    const meaning = engine.meaningFor(id);
    return `<span class="virtual-mini-card ${meaning.tone}${card.red ? ' red' : ''}"><b>${S.esc(card.rank)}${card.symbol}</b><small>${S.esc(meaning.short)}</small></span>`;
  };

  const deckMarkup = state => {
    const discarded = state.discard[state.discard.length - 1] || '';
    return `<div class="virtual-deck-area"><div class="virtual-deck-card" data-virtual-deck><span class="virtual-deck-layer layer-one"></span><span class="virtual-deck-layer layer-two"></span><div class="virtual-deck-face"><img src="storia52-cards-logo.svg" alt=""><small>MAZZO</small><b>${state.drawPile.length}</b></div></div><div class="virtual-discard-stack" data-virtual-discard>${discarded ? miniCardMarkup(discarded) : '<span class="virtual-discard-empty"><b>◇</b><small>SCARTI</small></span>'}<i>${state.discard.length}</i></div></div>`;
  };

  const playZoneMarkup = (state, selectedId = '') => {
    const id = state.playedCard || selectedId;
    if (!id) return `<div class="virtual-play-zone empty" data-play-zone><span>↑</span><b>${state.phase === 'exchange' ? 'Scegli la carta da cambiare' : 'Trascina qui la carta da giocare'}</b></div>`;
    const card = engine.cardFromId(id);
    const meaning = engine.meaningFor(id);
    const played = Boolean(state.playedCard);
    return `<article class="virtual-play-zone${played ? ' played' : ' preview'} ${meaning.tone}${card.red ? ' red' : ''}" data-play-zone><span class="virtual-table-card"><b>${S.esc(card.rank)}${card.symbol}</b><em>${S.esc(meaning.badge)}</em></span><div><small>${played ? 'CARTA GIOCATA' : 'CARTA SELEZIONATA'}</small><h3>${S.esc(meaning.title)}</h3><p>${S.esc(meaning.text)}</p>${played ? '<strong>Racconta ora la scena.</strong>' : `<strong>${state.phase === 'exchange' ? 'Scorri di lato per cambiarla.' : 'Scorri verso l’alto per giocarla.'}</strong>`}</div></article>`;
  };

  const actionMarkup = (state, selectedId) => {
    if (state.phase === 'exchange') return `<button type="button" class="primary virtual-main-action" data-virtual-action="exchange"${selectedId ? '' : ' disabled'}>Cambia carta</button>${state.hand.length <= 1 ? '<button type="button" class="secondary" data-virtual-action="skip-exchange">Tieni la carta</button>' : ''}`;
    if (state.phase === 'play') return `<button type="button" class="primary virtual-main-action" data-virtual-action="play"${selectedId ? '' : ' disabled'}>Gioca carta</button>`;
    if (state.phase === 'afterPlay' && state.hand.length) return '<button type="button" class="primary" data-virtual-action="draw-end">Pesca e termina</button><button type="button" class="secondary" data-virtual-action="skip-draw">Termina senza pescare</button>';
    if (state.phase === 'afterPlay') return '<button type="button" class="primary" data-virtual-action="draw-end">Pesca una carta</button><button type="button" class="secondary" data-virtual-action="final">Collegati al finale</button>';
    if (state.phase === 'final') return '<button type="button" class="primary" data-virtual-objective>Rivela obiettivo</button><button type="button" class="secondary" data-virtual-action="complete">Finale accettato</button><button type="button" class="text-button" data-virtual-action="continue">Continuiamo</button>';
    return '<button type="button" class="primary" data-virtual-home>Torna alla home</button>';
  };

  const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  const animateTo = async (element, target, action) => {
    if (!element?.animate || !target || reducedMotion()) return;
    const from = element.getBoundingClientRect();
    const to = target.getBoundingClientRect();
    const dx = to.left + to.width / 2 - (from.left + from.width / 2);
    const dy = to.top + to.height / 2 - (from.top + from.height / 2);
    const rotate = action === 'exchange' ? 12 : -4;
    await element.animate([
      { transform: getComputedStyle(element).transform === 'none' ? 'translate(0,0)' : getComputedStyle(element).transform, opacity: 1 },
      { transform: `translate(${dx * .35}px,${dy * .35}px) scale(.94) rotate(${rotate / 3}deg)`, opacity: 1, offset: .36 },
      { transform: `translate(${dx}px,${dy}px) scale(.58) rotate(${rotate}deg)`, opacity: .08 }
    ], { duration: 460, easing: 'cubic-bezier(.2,.82,.22,1)' }).finished.catch(() => {});
  };

  const animatePlayedToDiscard = async () => {
    const played = S.play.querySelector('[data-play-zone].played');
    const discard = S.play.querySelector('[data-virtual-discard]');
    if (!played || !discard) return;
    await animateTo(played, discard, 'exchange');
  };

  S.renderVirtualPlayer = (session, playerIndex) => {
    if (session.cardMode !== 'virtual' || session.delivery !== 'multi') {
      S.toast('Le carte virtuali richiedono telefoni separati.');
      return;
    }

    let state = loadState(session, playerIndex);
    let selectedId = '';
    let incomingId = state.lastAction === 'deal' ? state.hand[state.hand.length - 1] : '';
    let busy = false;

    const save = () => saveState(session, playerIndex, state);

    const bindActionButtons = () => {
      S.play.querySelectorAll('[data-virtual-action]').forEach(button => button.addEventListener('click', () => run(button.dataset.virtualAction)));
      S.play.querySelectorAll('[data-virtual-objective]').forEach(button => button.addEventListener('click', () => S.openObjective(session, playerIndex, true)));
      S.play.querySelectorAll('[data-virtual-invite]').forEach(button => button.addEventListener('click', () => openInvite(button)));
      S.play.querySelector('[data-virtual-home]')?.addEventListener('click', S.renderHome);
    };

    const syncSelection = () => {
      S.play.querySelectorAll('[data-virtual-card]').forEach(button => {
        const selected = button.dataset.virtualCard === selectedId;
        button.classList.toggle('selected', selected);
        button.setAttribute('aria-pressed', String(selected));
      });
      const zone = S.play.querySelector('[data-play-zone]');
      if (zone && !state.playedCard) zone.outerHTML = playZoneMarkup(state, selectedId);
      const actions = S.play.querySelector('[data-virtual-actions]');
      if (actions) {
        actions.innerHTML = actionMarkup(state, selectedId);
        bindActionButtons();
      }
    };

    const commit = (next, { reshuffled = false, drawn = '' } = {}) => {
      state = next;
      incomingId = drawn;
      selectedId = '';
      save();
      render();
      if (reshuffled) {
        requestAnimationFrame(() => S.play.querySelector('[data-virtual-deck]')?.classList.add('is-shuffling'));
        S.toast('Mazzo finito: scarti rimescolati');
      }
    };

    const run = async (action, cardId = selectedId) => {
      if (busy) return;
      busy = true;
      const cardElement = cardId ? S.play.querySelector(`[data-virtual-card="${CSS.escape(cardId)}"]`) : null;
      if (action === 'exchange' && cardElement) await animateTo(cardElement, S.play.querySelector('[data-virtual-discard]'), action);
      if (action === 'play' && cardElement) await animateTo(cardElement, S.play.querySelector('[data-play-zone]'), action);
      if (['draw-end', 'skip-draw', 'continue'].includes(action)) await animatePlayedToDiscard();
      const outcome = engine.apply(state, action, session.cardSeed, playerIndex, cardId);
      busy = false;
      if (!outcome.ok) { S.toast(outcome.message); return; }
      commit(outcome.state, outcome);
    };

    const selectCard = id => {
      if (!['exchange', 'play'].includes(state.phase) || busy) return;
      selectedId = selectedId === id ? '' : id;
      syncSelection();
    };

    const bindGesture = button => {
      const id = button.dataset.virtualCard;
      let start = null;
      let moved = false;

      button.addEventListener('pointerdown', event => {
        if (!['exchange', 'play'].includes(state.phase) || busy) return;
        start = { x: event.clientX, y: event.clientY, pointerId: event.pointerId };
        moved = false;
        button.classList.add('is-dragging');
        button.setPointerCapture?.(event.pointerId);
      });

      button.addEventListener('pointermove', event => {
        if (!start || event.pointerId !== start.pointerId) return;
        const dx = event.clientX - start.x;
        const dy = event.clientY - start.y;
        if (Math.abs(dx) + Math.abs(dy) > 6) moved = true;
        button.style.setProperty('--drag-x', `${dx}px`);
        button.style.setProperty('--drag-y', `${dy}px`);
        button.style.setProperty('--drag-rotate', `${Math.max(-8, Math.min(8, dx / 14))}deg`);
      });

      const finish = event => {
        if (!start || event.pointerId !== start.pointerId) return;
        const dx = event.clientX - start.x;
        const dy = event.clientY - start.y;
        const exchangeGesture = state.phase === 'exchange' && Math.abs(dx) > 52 && Math.abs(dx) > Math.abs(dy);
        const playGesture = state.phase === 'play' && dy < -58 && Math.abs(dy) > Math.abs(dx) * .8;
        start = null;
        button.classList.remove('is-dragging');
        button.style.removeProperty('--drag-x');
        button.style.removeProperty('--drag-y');
        button.style.removeProperty('--drag-rotate');
        if (exchangeGesture || playGesture) {
          button.dataset.suppressClick = 'true';
          selectedId = id;
          syncSelection();
          run(exchangeGesture ? 'exchange' : 'play', id);
        }
      };

      button.addEventListener('pointerup', finish);
      button.addEventListener('pointercancel', event => {
        if (!start || event.pointerId !== start.pointerId) return;
        start = null;
        button.classList.remove('is-dragging');
        button.style.removeProperty('--drag-x');
        button.style.removeProperty('--drag-y');
        button.style.removeProperty('--drag-rotate');
      });
      button.addEventListener('click', event => {
        if (button.dataset.suppressClick === 'true' || moved) {
          delete button.dataset.suppressClick;
          moved = false;
          event.preventDefault();
          return;
        }
        selectCard(id);
      });
    };

    const openInvite = async button => {
      if (button) button.disabled = true;
      try {
        await S.openGameInvite(session);
      } catch (error) {
        S.toast(error?.message || 'Invito non disponibile.');
      } finally {
        if (button) button.disabled = false;
      }
    };

    const render = () => {
      const instruction = instructionFor(state);
      const hand = state.hand.map((id, index) => cardMarkup(id, index, selectedId === id, incomingId === id)).join('');

      S.mount(`<section class="surface virtual-game"><header class="virtual-game-header"><div><p class="eyebrow">CARTE VIRTUALI · ${S.esc(S.playerName(session, playerIndex))}</p><h2>${S.esc(instruction.title)}</h2><p>${S.esc(instruction.text)}</p></div><div class="virtual-header-actions"><button type="button" class="secondary compact" data-virtual-invite>QR invito</button><button type="button" class="secondary compact" data-virtual-objective>Obiettivo</button></div></header>${phaseRail(state)}<div class="virtual-table">${deckMarkup(state)}${playZoneMarkup(state, selectedId)}</div><section class="virtual-hand-section"><div class="virtual-hand-heading"><span>LA TUA MANO</span><b>${state.hand.length} ${state.hand.length === 1 ? 'carta' : 'carte'}</b></div><div class="virtual-hand${state.lastAction === 'deal' ? ' is-dealing' : ''}">${hand || '<div class="virtual-empty-hand">La mano è vuota.</div>'}</div><p class="virtual-gesture-hint">${state.phase === 'exchange' ? 'Scorri una carta di lato per cambiarla.' : state.phase === 'play' ? 'Scorri una carta verso l’alto per giocarla.' : 'La carta giocata resta sul tavolo finché chiudi il turno.'}</p></section><div class="virtual-actions" data-virtual-actions>${actionMarkup(state, selectedId)}</div><details class="virtual-story-details"><summary>Storia e regole delle carte</summary><div>${S.storyContextMarkup(session)}${S.cardRulesMarkup()}</div></details></section>`, { session: true, preserveHash: true, scroll: false, animate: false });

      S.play.querySelectorAll('[data-virtual-card]').forEach(bindGesture);
      bindActionButtons();

      if (state.lastAction) {
        state.lastAction = '';
        save();
      }
      incomingId = '';
    };

    render();
  };
})();
