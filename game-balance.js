'use strict';

(() => {
  const S = window.S52;
  const baseEngine = window.EpoiVirtualCardsEngine;
  if (!S || !baseEngine) return;

  const normalizePlayerCount = count => Math.max(2, Math.min(8, Number(count) || 2));
  const handSizeForPlayers = count => {
    const players = normalizePlayerCount(count);
    if (players >= 5) return 3;
    if (players === 4) return 4;
    return 5;
  };
  const handRuleSummary = '2–3 giocatori: 5 carte a testa. 4 giocatori: 4 carte. 5–8 giocatori: 3 carte.';
  const handSizeText = count => {
    const size = handSizeForPlayers(count);
    return `${size} ${size === 1 ? 'carta' : 'carte'} a testa`;
  };

  S.handSizeForPlayers = handSizeForPlayers;
  S.handRuleSummary = handRuleSummary;
  S.handSizeText = handSizeText;

  const rebalanceAssignment = (assignment, targetSize) => {
    const hand = [...(assignment?.hand || [])];
    const drawPile = [...(assignment?.drawPile || [])];
    if (hand.length > targetSize) drawPile.unshift(...hand.splice(targetSize));
    while (hand.length < targetSize && drawPile.length) hand.push(drawPile.shift());
    return {
      ...assignment,
      hand,
      drawPile,
      ownedCards: [...hand, ...drawPile]
    };
  };

  const buildAssignments = (seed, count) => {
    const targetSize = handSizeForPlayers(count);
    return baseEngine.buildAssignments(seed, count).map(assignment => rebalanceAssignment(assignment, targetSize));
  };

  const createState = (seed, count, playerIndex) => {
    const assignments = buildAssignments(seed, count);
    const safeIndex = Math.max(0, Math.min(assignments.length - 1, Number(playerIndex) || 0));
    const assignment = assignments[safeIndex];
    return {
      ...baseEngine.createState(seed, count, safeIndex),
      hand: [...assignment.hand],
      drawPile: [...assignment.drawPile],
      initialHandSize: handSizeForPlayers(count)
    };
  };

  window.EpoiVirtualCardsEngine = Object.freeze({
    ...baseEngine,
    handSizeForPlayers,
    buildAssignments,
    createState
  });

  const hashSeed = value => {
    let hash = 2166136261;
    for (const character of String(value || 'EPOI')) {
      hash ^= character.charCodeAt(0);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  };
  const storageKey = (session, playerIndex) => `epoi_virtual_${hashSeed(`${session.cardSeed}|${session.readyStoryId}|${session.count}`).toString(36)}_${playerIndex}`;
  const untouchedState = state => state
    && state.phase === 'exchange'
    && Number(state.turn) === 1
    && !(state.discard || []).length
    && !state.playedCard;

  const prepareVirtualState = (session, playerIndex) => {
    const targetSize = handSizeForPlayers(session.count);
    const key = storageKey(session, playerIndex);
    let state = null;
    try { state = JSON.parse(localStorage.getItem(key) || 'null'); } catch { /* Riparte da una mano valida. */ }

    if (!baseEngine.isValidState(state, session.cardSeed, session.count, playerIndex)) {
      state = createState(session.cardSeed, session.count, playerIndex);
    } else if (state.initialHandSize !== targetSize && untouchedState(state)) {
      const assignment = rebalanceAssignment({ hand: state.hand, drawPile: state.drawPile }, targetSize);
      state.hand = assignment.hand;
      state.drawPile = assignment.drawPile;
      state.initialHandSize = targetSize;
    }

    const displaySlots = state.initialHandSize
      ? Math.max(targetSize, Number(state.initialHandSize) || targetSize, state.hand.length)
      : Math.max(targetSize, state.hand.length);
    try { localStorage.setItem(key, JSON.stringify(state)); } catch { /* La partita continua anche senza storage. */ }
    return { targetSize, displaySlots: Math.min(5, displaySlots) };
  };

  const originalRenderVirtualPlayer = S.renderVirtualPlayer;
  if (typeof originalRenderVirtualPlayer === 'function') {
    S.renderVirtualPlayer = (session, playerIndex) => {
      const prepared = prepareVirtualState(session, playerIndex);
      const result = originalRenderVirtualPlayer(session, playerIndex);
      const root = S.play?.querySelector('[data-virtual-root]');
      root?.setAttribute('data-initial-hand-size', String(prepared.targetSize));
      root?.querySelectorAll('[data-card-slot]').forEach((slot, index) => {
        if (index < prepared.displaySlots) slot.style.removeProperty('display');
        else slot.style.setProperty('display', 'none', 'important');
      });
      return result;
    };
  }

  const originalRenderSetup = S.renderSetup;
  if (typeof originalRenderSetup === 'function') {
    S.renderSetup = (...args) => {
      const result = originalRenderSetup(...args);
      const session = S.currentSession || S.load?.();
      const count = normalizePlayerCount(session?.count || args[1]?.count || 2);
      const size = handSizeForPlayers(count);
      const virtualOption = S.play?.querySelector('[data-card-mode="virtual"]');
      const virtualIcon = virtualOption?.querySelector(':scope > span');
      const virtualCopy = virtualOption?.querySelector('small');
      if (virtualIcon) virtualIcon.textContent = String(size);
      if (virtualCopy) virtualCopy.textContent = `Ogni giocatore riceve ${handSizeText(count)} sul proprio telefono. L’app guida cambio, giocata e pesca.`;
      const physicalCopy = S.play?.querySelector('[data-card-mode="physical"] small');
      if (physicalCopy) physicalCopy.textContent = `Usate un mazzo francese da 52 carte senza jolly. Con ${count} giocatori distribuite ${handSizeText(count)}.`;
      return result;
    };
  }

  const originalRenderPreparation = S.renderPreparation;
  if (typeof originalRenderPreparation === 'function') {
    S.renderPreparation = (session, ...args) => {
      const result = originalRenderPreparation(session, ...args);
      const steps = S.play?.querySelectorAll('.prep-step b');
      if (steps?.[1]) steps[1].textContent = `Date ${handSizeText(session.count)}.`;
      return result;
    };
  }

  const originalPreparationGuideMarkup = S.preparationGuideMarkup;
  if (typeof originalPreparationGuideMarkup === 'function') {
    S.preparationGuideMarkup = () => originalPreparationGuideMarkup().replace(
      'Con il mazzo reale usate 52 carte francesi e togliete i jolly. Con le carte virtuali ogni giocatore riceve la mano sul proprio telefono.',
      `Usate 52 carte francesi senza jolly. ${handRuleSummary} Le carte virtuali applicano automaticamente la stessa distribuzione.`
    );
  }

  const originalFinalRulesMarkup = S.finalRulesMarkup;
  if (typeof originalFinalRulesMarkup === 'function') {
    S.finalRulesMarkup = () => originalFinalRulesMarkup()
      .replace(
        'Continua quella stessa scena fino alla conclusione indicata dal tuo obiettivo segreto.',
        'Continua quella stessa scena finché soddisfa la condizione del tuo obiettivo segreto. Il finale mostrato sulla carta è soltanto un esempio: adattane i dettagli alla vostra partita.'
      )
      .replace(
        'Mostralo agli altri. Il finale deve usare elementi già comparsi e restare coerente.',
        'Mostralo agli altri. La chiusura deve usare elementi già comparsi, rispettare l’ultima carta e non introdurre una soluzione nuova dal nulla.'
      );
  }

  const originalSecretContent = window.secretContent;
  if (typeof originalSecretContent === 'function') {
    window.secretContent = card => originalSecretContent(card).replace(
      'FINALE DA RAGGIUNGERE',
      'ESEMPIO DI CHIUSURA'
    );
  }
})();
