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

  const meaningFor = id => {
    const card = cardFromId(id);
    if (!card) return { title: 'Carta non valida', text: '', short: '' };

    if (card.rank === 'J') {
      return {
        title: `Nuovo oggetto ${card.red ? 'favorevole' : 'problematico'}`,
        short: 'Nuovo oggetto',
        text: `Aggiungi un oggetto che ${card.red ? 'aiuta i personaggi' : 'crea un nuovo problema'}. Ignora il seme.`
      };
    }
    if (card.rank === 'Q') {
      return {
        title: `Nuovo personaggio ${card.red ? 'favorevole' : 'problematico'}`,
        short: 'Nuovo personaggio',
        text: `Fai entrare un personaggio che ${card.red ? 'aiuta o protegge' : 'ostacola o mette pressione'}. Ignora il seme.`
      };
    }
    if (card.rank === 'K') {
      return {
        title: `Nuovo luogo ${card.red ? 'favorevole' : 'problematico'}`,
        short: 'Nuovo luogo',
        text: `Porta la scena in un luogo che ${card.red ? 'offre una possibilità' : 'rende tutto più difficile'}. Ignora il seme.`
      };
    }
    if (card.rank === 'A') {
      return {
        title: `Colpo di scena ${card.red ? 'favorevole' : 'problematico'}`,
        short: 'Colpo di scena',
        text: `Introduci una svolta che ${card.red ? 'migliora la situazione' : 'peggiora la situazione'}. Ignora il seme.`
      };
    }

    const numeric = {
      H: { title: 'Relazione', short: 'Relazione', text: 'Cambia un rapporto tra i personaggi: avvicinali, allontanali, crea fiducia o tensione.' },
      D: { title: 'Scoperta', short: 'Scoperta', text: 'Fai emergere un’informazione, un indizio o una verità importante.' },
      C: { title: 'Azione', short: 'Azione', text: 'Un personaggio prova a fare qualcosa di concreto. La scena mostra cosa succede.' },
      S: { title: 'Ostacolo', short: 'Ostacolo', text: 'Introduci un problema che rende più difficile raggiungere ciò che vogliono i personaggi.' }
    };
    return numeric[card.id.split('-')[0]];
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
      version: 1,
      hand: [...assignment.hand],
      drawPile: [...assignment.drawPile],
      discard: [],
      phase: 'waiting',
      turn: 1,
      cycle: 0,
      playedCard: '',
      lastAction: 'deal'
    };
  };

  const isValidState = (state, seed, count, playerIndex) => {
    if (!state || state.version !== 1) return false;
    if (!['waiting', 'exchange', 'play', 'afterPlay', 'final', 'completed'].includes(state.phase)) return false;
    const assignment = buildAssignments(seed, count)[playerIndex];
    if (!assignment) return false;
    const cards = [...(state.hand || []), ...(state.drawPile || []), ...(state.discard || [])];
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

  const result = (state, ok, message = '', extra = {}) => ({ state, ok, message, ...extra });
  const apply = (source, action, seed, playerIndex, cardId = '') => {
    const state = JSON.parse(JSON.stringify(source));

    if (action === 'start') {
      if (state.phase !== 'waiting') return result(source, false, 'Il turno è già iniziato.');
      state.phase = 'exchange';
      state.lastAction = 'start';
      return result(state, true);
    }

    if (action === 'exchange') {
      if (state.phase !== 'exchange') return result(source, false, 'Il cambio si può fare soltanto all’inizio del turno.');
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
      if (state.phase !== 'play') return result(source, false, 'Prima completa il cambio di inizio turno.');
      const index = state.hand.indexOf(cardId);
      if (index < 0) return result(source, false, 'Scegli una carta della tua mano.');
      state.hand.splice(index, 1);
      state.discard.push(cardId);
      state.playedCard = cardId;
      state.phase = 'afterPlay';
      state.lastAction = 'play';
      return result(state, true);
    }

    if (action === 'draw-end') {
      if (state.phase !== 'afterPlay') return result(source, false, 'Puoi pescare soltanto dopo aver giocato la carta.');
      const drawn = drawOne(state, seed, playerIndex);
      if (!drawn.card) return result(source, false, 'Non ci sono carte disponibili.');
      state.phase = 'waiting';
      state.turn += 1;
      state.playedCard = '';
      state.lastAction = 'draw';
      return result(state, true, '', { drawn: drawn.card, reshuffled: drawn.reshuffled });
    }

    if (action === 'skip-draw') {
      if (state.phase !== 'afterPlay') return result(source, false, 'Prima devi giocare una carta.');
      if (!state.hand.length) return result(source, false, 'Con la mano vuota devi pescare oppure collegarti al finale.');
      state.phase = 'waiting';
      state.turn += 1;
      state.playedCard = '';
      state.lastAction = 'skip-draw';
      return result(state, true);
    }

    if (action === 'final') {
      if (state.phase !== 'afterPlay' || state.hand.length) return result(source, false, 'Puoi tentare il finale soltanto dopo aver giocato l’ultima carta.');
      state.phase = 'final';
      state.lastAction = 'final';
      return result(state, true);
    }

    if (action === 'continue') {
      if (state.phase !== 'final') return result(source, false, 'La partita non è nella fase finale.');
      const drawn = drawOne(state, seed, playerIndex);
      if (!drawn.card) return result(source, false, 'Non ci sono carte disponibili.');
      state.phase = 'waiting';
      state.turn += 1;
      state.playedCard = '';
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
    return `<button type="button" class="virtual-card${card.red ? ' red' : ''}${selected ? ' selected' : ''}${incoming ? ' card-enter' : ''}" data-virtual-card="${S.esc(id)}" aria-pressed="${selected ? 'true' : 'false'}" style="--card-index:${index}"><span class="virtual-card-corner"><b>${S.esc(card.rank)}</b><i>${card.symbol}</i></span><span class="virtual-card-symbol" aria-hidden="true">${card.symbol}</span><span class="virtual-card-copy"><b>${S.esc(meaning.short)}</b><small>${S.esc(meaning.text)}</small></span></button>`;
  };

  const phaseIndex = phase => ({ waiting: 0, exchange: 1, play: 2, afterPlay: 3, final: 3, completed: 3 }[phase] || 0);
  const phaseRail = state => {
    const current = phaseIndex(state.phase);
    const steps = ['Inizio', 'Cambia', 'Gioca', 'Pesca o finale'];
    return `<ol class="virtual-turn-rail">${steps.map((label, index) => `<li class="${index < current ? 'done' : index === current ? 'current' : ''}"><span>${index + 1}</span><b>${label}</b></li>`).join('')}</ol>`;
  };

  const instructionFor = state => {
    if (state.phase === 'waiting') return { title: `Turno ${state.turn}`, text: 'Quando tocca di nuovo a te, avvia il turno. La mano resta privata su questo telefono.' };
    if (state.phase === 'exchange') return state.hand.length > 1
      ? { title: 'Cambia una carta', text: 'Scegli una carta da scartare. Ne riceverai subito una nuova e non potrai cambiare di nuovo in questo turno.' }
      : { title: 'Ultima carta in mano', text: 'Puoi cambiarla oppure tenerla e giocarla.' };
    if (state.phase === 'play') return { title: 'Gioca una carta', text: 'Scegli una sola carta. Il testo sulla carta indica cosa deve succedere nella scena.' };
    if (state.phase === 'afterPlay') return { title: 'Racconta la scena', text: state.hand.length ? 'Dopo la scena scegli se pescare una carta oppure terminare il turno senza pescare.' : 'Hai giocato l’ultima carta: pesca oppure collega direttamente questa scena al finale.' };
    if (state.phase === 'final') return { title: 'Collegati al finale', text: 'Rivela il tuo obiettivo e continua la scena appena raccontata fino a una conclusione coerente.' };
    return { title: 'Storia conclusa', text: 'Il finale è stato accettato. La partita è terminata.' };
  };

  const deckMarkup = state => {
    const discarded = state.discard[state.discard.length - 1];
    const discardCard = discarded ? engine.cardFromId(discarded) : null;
    return `<div class="virtual-deck-area"><div class="virtual-deck-stack" data-virtual-deck><span></span><span></span><span></span><b>${state.drawPile.length}</b><small>mazzo</small></div><div class="virtual-discard${discardCard?.red ? ' red' : ''}">${discardCard ? `<b>${discardCard.rank}${discardCard.symbol}</b><small>scarti · ${state.discard.length}</small>` : '<b>—</b><small>scarti</small>'}</div></div>`;
  };

  const actionMarkup = (state, selectedId) => {
    if (state.phase === 'waiting') return '<button type="button" class="primary virtual-main-action" data-virtual-action="start">Inizia il mio turno</button>';
    if (state.phase === 'exchange') return `<button type="button" class="primary virtual-main-action" data-virtual-action="exchange"${selectedId ? '' : ' disabled'}>Cambia questa carta</button>${state.hand.length <= 1 ? '<button type="button" class="secondary" data-virtual-action="skip-exchange">Tieni la carta</button>' : ''}`;
    if (state.phase === 'play') return `<button type="button" class="primary virtual-main-action" data-virtual-action="play"${selectedId ? '' : ' disabled'}>Gioca questa carta</button>`;
    if (state.phase === 'afterPlay' && state.hand.length) return '<button type="button" class="primary" data-virtual-action="draw-end">Pesca e termina il turno</button><button type="button" class="secondary" data-virtual-action="skip-draw">Termina senza pescare</button>';
    if (state.phase === 'afterPlay') return '<button type="button" class="primary" data-virtual-action="draw-end">Pesca una carta</button><button type="button" class="secondary" data-virtual-action="final">Collegati al finale</button>';
    if (state.phase === 'final') return '<button type="button" class="primary" data-virtual-objective>Rivela obiettivo e racconta</button><button type="button" class="secondary" data-virtual-action="complete">Finale accettato</button><button type="button" class="text-button" data-virtual-action="continue">Continuiamo la partita</button>';
    return '<button type="button" class="primary" data-virtual-home>Torna alla home</button>';
  };

  const animateOut = async (element, action) => {
    if (!element?.animate || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const frames = action === 'play'
      ? [{ transform: 'translateY(0) rotate(0)', opacity: 1 }, { transform: 'translateY(-28px) rotate(-2deg)', opacity: 1, offset: .35 }, { transform: 'translateY(110px) scale(.72) rotate(7deg)', opacity: 0 }]
      : [{ transform: 'translateX(0) rotate(0)', opacity: 1 }, { transform: 'translateX(-18px) rotate(-4deg)', opacity: 1, offset: .3 }, { transform: 'translateX(120px) scale(.76) rotate(12deg)', opacity: 0 }];
    await element.animate(frames, { duration: 430, easing: 'cubic-bezier(.2,.8,.2,1)' }).finished.catch(() => {});
  };

  S.renderVirtualPlayer = (session, playerIndex) => {
    if (session.cardMode !== 'virtual' || session.delivery !== 'multi') {
      S.toast('Le carte virtuali richiedono telefoni separati.');
      return;
    }

    let state = loadState(session, playerIndex);
    let selectedId = '';
    let incomingId = state.lastAction === 'deal' ? state.hand[state.hand.length - 1] : '';

    const commit = (next, { reshuffled = false, drawn = '' } = {}) => {
      state = next;
      incomingId = drawn;
      selectedId = '';
      saveState(session, playerIndex, state);
      draw();
      if (reshuffled) {
        requestAnimationFrame(() => S.play.querySelector('[data-virtual-deck]')?.classList.add('is-shuffling'));
        S.toast('Mazzo finito: scarti rimescolati');
      }
    };

    const run = async action => {
      const selectedCard = selectedId ? S.play.querySelector(`[data-virtual-card="${CSS.escape(selectedId)}"]`) : null;
      if (['exchange', 'play'].includes(action) && selectedCard) await animateOut(selectedCard, action);
      const outcome = engine.apply(state, action, session.cardSeed, playerIndex, selectedId);
      if (!outcome.ok) { S.toast(outcome.message); return; }
      commit(outcome.state, outcome);
    };

    const draw = () => {
      const instruction = instructionFor(state);
      const played = state.playedCard ? engine.cardFromId(state.playedCard) : null;
      const playedMeaning = played ? engine.meaningFor(played.id) : null;
      const hand = state.hand.map((id, index) => cardMarkup(id, index, selectedId === id, incomingId === id)).join('');

      S.mount(`<section class="surface virtual-game"><header class="virtual-game-header"><div><p class="eyebrow">CARTE VIRTUALI · ${S.esc(S.playerName(session, playerIndex))}</p><h2>${S.esc(instruction.title)}</h2><p>${S.esc(instruction.text)}</p></div><button type="button" class="secondary compact" data-virtual-objective>Obiettivo</button></header>${phaseRail(state)}<div class="virtual-table">${deckMarkup(state)}${played ? `<article class="virtual-played-card${played.red ? ' red' : ''}"><span>${played.rank}${played.symbol}</span><div><b>${S.esc(playedMeaning.title)}</b><p>${S.esc(playedMeaning.text)}</p></div></article>` : '<div class="virtual-play-placeholder"><span aria-hidden="true">◇</span><p>La carta giocata apparirà qui.</p></div>'}</div><section class="virtual-hand-section"><div class="virtual-hand-heading"><span>LA TUA MANO</span><b>${state.hand.length} ${state.hand.length === 1 ? 'carta' : 'carte'}</b></div><div class="virtual-hand${state.lastAction === 'deal' ? ' is-dealing' : ''}">${hand || '<div class="virtual-empty-hand">La mano è vuota.</div>'}</div></section><div class="virtual-actions">${actionMarkup(state, selectedId)}</div><details class="virtual-story-details"><summary>Rivedi storia e significato delle carte</summary><div>${S.storyContextMarkup(session)}${S.cardRulesMarkup()}</div></details></section>`, { session: true, preserveHash: true, scroll: false, animate: false });

      S.play.querySelectorAll('[data-virtual-card]').forEach(button => button.addEventListener('click', () => {
        if (!['exchange', 'play'].includes(state.phase)) {
          S.toast(state.phase === 'waiting' ? 'Prima inizia il turno.' : 'La carta è già stata giocata.');
          return;
        }
        selectedId = selectedId === button.dataset.virtualCard ? '' : button.dataset.virtualCard;
        draw();
      }));
      S.play.querySelectorAll('[data-virtual-action]').forEach(button => button.addEventListener('click', () => run(button.dataset.virtualAction)));
      S.play.querySelectorAll('[data-virtual-objective]').forEach(button => button.addEventListener('click', () => S.openObjective(session, playerIndex, true)));
      S.play.querySelector('[data-virtual-home]')?.addEventListener('click', S.renderHome);

      if (state.lastAction) {
        state.lastAction = '';
        saveState(session, playerIndex, state);
      }
      incomingId = '';
    };

    draw();
  };
})();
