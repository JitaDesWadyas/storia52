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

  const cleanOpening = value => S.cleanText(value, S.limits.opening, true);
  const cleanNote = value => S.cleanText(value, S.limits.note, true);

  S.renderCardsSource = (session, scroll = true) => {
    session.stage = 'cards';
    if (!session.openingText && !session.spokenOpening) session.openingText = S.defaultOpening(session);
    session.openingText = cleanOpening(session.openingText);
    S.save(session);
    S.mount(`<section class="surface"><div class="screen-heading"><p class="eyebrow">INCIPIT INVENTATO</p><h2>Inventate la storia partendo da queste informazioni.</h2><p>Potete cambiare soltanto la carta che non funziona, modificare il riassunto oppure inventare la prima scena direttamente a voce.</p></div>${S.storyCardsMarkup(session, { editable: true })}<label class="field opening-draft"><span>RIASSUNTO MODIFICABILE</span><textarea data-opening-summary maxlength="${S.limits.opening}">${S.esc(session.openingText)}</textarea><small>È una base automatica. Massimo ${S.limits.opening} caratteri, così l’invito resta affidabile anche su telefoni diversi.</small></label><div class="actions"><button type="button" class="secondary" data-regenerate>Cambia tutte</button><button type="button" class="secondary" data-build-opening>Aiutiamoci con le domande</button></div><div class="actions one"><button type="button" class="primary" data-use-summary>Usa questo incipit</button><button type="button" class="text-button" data-spoken-opening>Inventiamo la prima scena a voce</button></div></section>`, { session: true, scroll });

    const field = S.play.querySelector('[data-opening-summary]');
    const syncSummary = () => {
      session.openingText = cleanOpening(field.value);
      session.openingEdited = true;
      S.save(session);
    };
    field.addEventListener('input', syncSummary);
    field.addEventListener('blur', () => { field.value = cleanOpening(field.value); syncSummary(); });
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
    session.openingText = cleanOpening(session.openingText);
    S.save(session);
    const notes = session.openingNotes || { protagonist: '', setting: '', action: '', problem: '' };
    S.mount(`<section class="surface"><div class="screen-heading"><p class="eyebrow">COSTRUITE L’INCIPIT</p><h2>Quattro domande, poi sistemate il riassunto.</h2></div>${S.storyCardsMarkup(session, { editable: true })}<div class="question-grid"><label class="question-card"><h3>Chi è davvero il protagonista?</h3><textarea data-note="protagonist" maxlength="${S.limits.note}" placeholder="Ruolo, carattere, rapporto con ciò che sta succedendo…">${S.esc(notes.protagonist)}</textarea></label><label class="question-card"><h3>Dove e quando comincia?</h3><textarea data-note="setting" maxlength="${S.limits.note}" placeholder="Un luogo e un momento concreti…">${S.esc(notes.setting)}</textarea></label><label class="question-card"><h3>Cosa sta facendo per raggiungere l’obiettivo?</h3><textarea data-note="action" maxlength="${S.limits.note}" placeholder="La prima azione visibile della storia…">${S.esc(notes.action)}</textarea></label><label class="question-card"><h3>Come compare subito il problema?</h3><textarea data-note="problem" maxlength="${S.limits.note}" placeholder="L’ostacolo che interrompe o complica la scena…">${S.esc(notes.problem)}</textarea></label></div><label class="field opening-draft"><span>RIASSUNTO MODIFICABILE</span><textarea data-opening-text maxlength="${S.limits.opening}">${S.esc(session.openingText)}</textarea><small>Massimo ${S.limits.opening} caratteri.</small></label><div class="actions"><button type="button" class="secondary" data-back-cards>Torna alle informazioni</button><button type="button" class="primary" data-use-opening>Usa questo incipit</button></div><div class="actions one"><button type="button" class="text-button" data-skip-writing>Continuiamo a voce senza scriverlo</button></div></section>`, { session: true, scroll });

    const sync = () => {
      S.play.querySelectorAll('[data-note]').forEach(noteField => { session.openingNotes[noteField.dataset.note] = cleanNote(noteField.value); });
      session.openingText = cleanOpening(S.play.querySelector('[data-opening-text]').value);
      session.openingEdited = true;
      S.save(session);
    };
    S.play.querySelectorAll('textarea').forEach(noteField => {
      noteField.addEventListener('input', sync);
      noteField.addEventListener('blur', () => {
        noteField.value = noteField.matches('[data-opening-text]') ? cleanOpening(noteField.value) : cleanNote(noteField.value);
        sync();
      });
    });
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
