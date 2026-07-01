'use strict';

(() => {
  const S = window.S52;

  S.renderCardsSource = session => {
    session.stage = 'cards';
    S.save(session);
    S.mount(`<section class="surface"><div class="screen-heading"><p class="eyebrow">INCIPIT INVENTATO</p><h2>Inventate la storia partendo da queste informazioni.</h2><p>Non dovete ripetere le frasi alla lettera. Decidete chi seguite, cosa sta succedendo, cosa vuole ottenere e cosa lo blocca.</p></div>${S.storyCardsMarkup(session)}<div class="actions"><button type="button" class="secondary" data-regenerate>Cambia le informazioni</button><button type="button" class="primary" data-build-opening>Costruiamo meglio l’incipit</button></div><div class="actions one"><button type="button" class="text-button" data-spoken-opening>La inventiamo a voce e iniziamo</button></div></section>`, { label: session.mode === 'guided' ? 'Partita con assistente' : 'Partita autonoma', session: true });
    S.play.querySelector('[data-regenerate]').addEventListener('click', () => {
      session.seed = createCode();
      session.story = storyFromSeed(session.seed);
      session.objectives = Array.from({ length: session.count }, (_, index) => objectiveFromSeed(session.seed, index + 1));
      session.confirmed = Array(session.count).fill(false);
      session.openingText = '';
      session.spokenOpening = false;
      S.renderCardsSource(session);
    });
    S.play.querySelector('[data-build-opening]').addEventListener('click', () => S.renderOpeningQuestions(session));
    S.play.querySelector('[data-spoken-opening]').addEventListener('click', () => {
      session.spokenOpening = true;
      session.openingText = '';
      S.continueAfterSource(session);
    });
  };

  S.renderOpeningQuestions = session => {
    session.stage = 'questions';
    S.save(session);
    const notes = session.openingNotes || { protagonist: '', setting: '', action: '', problem: '' };
    S.mount(`<section class="surface"><div class="screen-heading"><p class="eyebrow">COSTRUITE L’INCIPIT</p><h2>Quattro domande, poi scrivete la prima scena.</h2></div>${S.storyCardsMarkup(session)}<div class="question-grid"><label class="question-card"><h3>Chi è davvero il protagonista?</h3><textarea data-note="protagonist" placeholder="Ruolo, carattere, rapporto con ciò che sta succedendo…">${S.esc(notes.protagonist)}</textarea></label><label class="question-card"><h3>Dove e quando comincia?</h3><textarea data-note="setting" placeholder="Un luogo e un momento concreti…">${S.esc(notes.setting)}</textarea></label><label class="question-card"><h3>Cosa sta facendo per raggiungere l’obiettivo?</h3><textarea data-note="action" placeholder="La prima azione visibile della storia…">${S.esc(notes.action)}</textarea></label><label class="question-card"><h3>Come compare subito il problema?</h3><textarea data-note="problem" placeholder="L’ostacolo che interrompe o complica la scena…">${S.esc(notes.problem)}</textarea></label></div><label class="field section-title"><span>INCIPIT</span><h3>Riassumete tutto in poche frasi.</h3><textarea data-opening-text placeholder="Scrivete qui la prima scena…">${S.esc(session.openingText)}</textarea></label><div class="actions"><button type="button" class="secondary" data-back-cards>Torna alle informazioni</button><button type="button" class="primary" data-use-opening>Usa questo incipit</button></div><div class="actions one"><button type="button" class="text-button" data-skip-writing>Continuiamo a voce senza scriverlo</button></div></section>`, { label: session.mode === 'guided' ? 'Partita con assistente' : 'Partita autonoma', session: true });
    const sync = () => {
      S.play.querySelectorAll('[data-note]').forEach(field => { session.openingNotes[field.dataset.note] = field.value.trim(); });
      session.openingText = S.play.querySelector('[data-opening-text]').value.trim();
      S.save(session);
    };
    S.play.querySelectorAll('textarea').forEach(field => field.addEventListener('input', sync));
    S.play.querySelector('[data-back-cards]').addEventListener('click', () => { sync(); S.renderCardsSource(session); });
    S.play.querySelector('[data-use-opening]').addEventListener('click', () => {
      sync();
      if (session.openingText.length < 20) { S.toast('Scrivete almeno una frase completa'); return; }
      session.spokenOpening = false;
      S.continueAfterSource(session);
    });
    S.play.querySelector('[data-skip-writing]').addEventListener('click', () => { sync(); session.openingText = ''; session.spokenOpening = true; S.continueAfterSource(session); });
  };

})();
