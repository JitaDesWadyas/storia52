'use strict';

(() => {
  const S = window.S52;

  const differentCard = previous => {
    let next = randomCard();
    let attempts = 0;
    while (next.suit === previous.suit && next.number === previous.number && attempts < 8) {
      next = randomCard();
      attempts += 1;
    }
    return next;
  };

  const replaceCard = (session, key) => {
    session.story[key] = differentCard(session.story[key]);
    session.openingText = S.defaultOpening(session);
    session.openingEdited = false;
    session.spokenOpening = false;
    S.save(session);
  };

  const bindCardChanges = (session, rerender, beforeChange = () => {}) => {
    S.play.querySelectorAll('[data-change-story-card]').forEach(button => button.addEventListener('click', () => {
      beforeChange();
      replaceCard(session, button.dataset.changeStoryCard);
      rerender(false);
    }));
  };

  S.renderCardsSource = (session, scroll = true) => {
    session.stage = 'cards';
    if (!session.openingText && !session.spokenOpening) session.openingText = S.defaultOpening(session);
    S.save(session);
    S.mount(`<section class="surface"><div class="screen-heading"><p class="eyebrow">INCIPIT INVENTATO</p><h2>Inventate la storia partendo da queste informazioni.</h2><p>Potete cambiare soltanto la carta che non funziona, modificare il riassunto oppure inventare la prima scena direttamente a voce.</p></div>${S.storyCardsMarkup(session, { editable: true })}<label class="field opening-draft"><span>RIASSUNTO MODIFICABILE</span><textarea data-opening-summary>${S.esc(session.openingText)}</textarea><small>È una base automatica: riscrivetela liberamente finché descrive bene l’inizio della storia.</small></label><div class="actions"><button type="button" class="secondary" data-regenerate>Cambia tutte</button><button type="button" class="secondary" data-build-opening>Aiutiamoci con le domande</button></div><div class="actions one"><button type="button" class="primary" data-use-summary>Usa questo incipit</button><button type="button" class="text-button" data-spoken-opening>Inventiamo la prima scena a voce</button></div></section>`, { session: true, scroll });

    const syncSummary = () => {
      session.openingText = S.play.querySelector('[data-opening-summary]').value.trim();
      session.openingEdited = true;
      S.save(session);
    };
    S.play.querySelector('[data-opening-summary]').addEventListener('input', syncSummary);
    bindCardChanges(session, nextScroll => S.renderCardsSource(session, nextScroll));

    S.play.querySelector('[data-regenerate]').addEventListener('click', () => {
      session.seed = createCode();
      session.story = storyFromSeed(session.seed);
      session.objectives = Array.from({ length: session.count }, (_, index) => objectiveFromSeed(session.seed, index + 1));
      session.confirmed = Array(session.count).fill(false);
      session.openingText = S.defaultOpening(session);
      session.openingEdited = false;
      session.spokenOpening = false;
      S.renderCardsSource(session, false);
    });

    S.play.querySelector('[data-build-opening]').addEventListener('click', () => {
      syncSummary();
      S.renderOpeningQuestions(session);
    });
    S.play.querySelector('[data-use-summary]').addEventListener('click', () => {
      syncSummary();
      if (session.openingText.length < 20) { S.toast('Scrivete almeno una frase completa'); return; }
      session.spokenOpening = false;
      S.continueAfterSource(session);
    });
    S.play.querySelector('[data-spoken-opening]').addEventListener('click', () => {
      session.spokenOpening = true;
      session.openingText = '';
      S.continueAfterSource(session);
    });
  };

  S.renderOpeningQuestions = (session, scroll = true) => {
    session.stage = 'questions';
    if (!session.openingText) session.openingText = S.defaultOpening(session);
    S.save(session);
    const notes = session.openingNotes || { protagonist: '', setting: '', action: '', problem: '' };
    S.mount(`<section class="surface"><div class="screen-heading"><p class="eyebrow">COSTRUITE L’INCIPIT</p><h2>Quattro domande, poi sistemate il riassunto.</h2></div>${S.storyCardsMarkup(session, { editable: true })}<div class="question-grid"><label class="question-card"><h3>Chi è davvero il protagonista?</h3><textarea data-note="protagonist" placeholder="Ruolo, carattere, rapporto con ciò che sta succedendo…">${S.esc(notes.protagonist)}</textarea></label><label class="question-card"><h3>Dove e quando comincia?</h3><textarea data-note="setting" placeholder="Un luogo e un momento concreti…">${S.esc(notes.setting)}</textarea></label><label class="question-card"><h3>Cosa sta facendo per raggiungere l’obiettivo?</h3><textarea data-note="action" placeholder="La prima azione visibile della storia…">${S.esc(notes.action)}</textarea></label><label class="question-card"><h3>Come compare subito il problema?</h3><textarea data-note="problem" placeholder="L’ostacolo che interrompe o complica la scena…">${S.esc(notes.problem)}</textarea></label></div><label class="field opening-draft"><span>RIASSUNTO MODIFICABILE</span><textarea data-opening-text>${S.esc(session.openingText)}</textarea><small>Usate le risposte per rendere questa base più concreta e naturale.</small></label><div class="actions"><button type="button" class="secondary" data-back-cards>Torna alle informazioni</button><button type="button" class="primary" data-use-opening>Usa questo incipit</button></div><div class="actions one"><button type="button" class="text-button" data-skip-writing>Continuiamo a voce senza scriverlo</button></div></section>`, { session: true, scroll });

    const sync = () => {
      S.play.querySelectorAll('[data-note]').forEach(field => { session.openingNotes[field.dataset.note] = field.value.trim(); });
      session.openingText = S.play.querySelector('[data-opening-text]').value.trim();
      session.openingEdited = true;
      S.save(session);
    };
    S.play.querySelectorAll('textarea').forEach(field => field.addEventListener('input', sync));
    bindCardChanges(session, nextScroll => S.renderOpeningQuestions(session, nextScroll), sync);
    S.play.querySelector('[data-back-cards]').addEventListener('click', () => { sync(); S.renderCardsSource(session); });
    S.play.querySelector('[data-use-opening]').addEventListener('click', () => {
      sync();
      if (session.openingText.length < 20) { S.toast('Scrivete almeno una frase completa'); return; }
      session.spokenOpening = false;
      S.continueAfterSource(session);
    });
    S.play.querySelector('[data-skip-writing]').addEventListener('click', () => {
      sync();
      session.openingText = '';
      session.spokenOpening = true;
      S.continueAfterSource(session);
    });
  };

})();
