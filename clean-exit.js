'use strict';
(() => {
  const S = window.S52;
  S.openExitModal = () => {
    const session = S.load();
    const mode = session?.mode || 'guided';
    const inGame = session?.stage === 'game';
    const body = `<p>${inGame ? 'Avete finito la storia?' : 'Volete uscire dalla preparazione?'}</p><div class="exit-options"><button type="button" class="primary" data-exit-continue>Continua</button><button type="button" class="secondary" data-exit-save>Salva per dopo</button>${inGame ? '<button type="button" class="secondary" data-exit-finished>La storia è finita</button>' : ''}<button type="button" class="danger" data-exit-abandon>Abbandona e crea una nuova storia</button></div>`;
    const { host, close } = S.modal(inGame ? 'Avete finito la storia?' : 'Uscire dalla partita?', body);
    host.querySelector('[data-exit-continue]').addEventListener('click', close);
    host.querySelector('[data-exit-save]').addEventListener('click', () => { close(); S.renderHome(); });
    host.querySelector('[data-exit-finished]')?.addEventListener('click', () => { close(); S.renderFinished(mode); });
    host.querySelector('[data-exit-abandon]').addEventListener('click', () => { close(); S.clear(); S.renderSetup(mode); });
  };

  S.renderFinished = (mode = 'guided') => {
    S.clear();
    S.mount(`<section class="surface"><div class="screen-heading"><p class="eyebrow">STORIA CONCLUSA</p><h2>La vostra storia è finita.</h2><p>La prossima partita partirà da una nuova scelta.</p></div><div class="actions"><button type="button" class="secondary" data-finished-home>Torna all’inizio</button><button type="button" class="primary" data-finished-new>Nuova storia</button></div></section>`, { label: 'Storia conclusa', session: true });
    S.play.querySelector('[data-finished-home]').addEventListener('click', S.renderHome);
    S.play.querySelector('[data-finished-new]').addEventListener('click', () => S.renderSetup(mode));
  };

  S.resume = session => {
    if (!session) { S.renderHome(); return; }
    const routes = {
      setup: () => S.renderSetup(session.mode || 'guided', session),
      cards: () => S.renderCardsSource(session),
      questions: () => S.renderOpeningQuestions(session),
      stories: () => S.renderStories(session),
      objectives: () => S.renderObjectives(session),
      prep: () => S.renderPreparation(session),
      invites: () => S.renderInvites(session),
      game: () => session.delivery === 'multi' ? S.renderHostGame(session) : S.renderGame(session)
    };
    (routes[session.stage] || (() => S.renderSetup(session.mode || 'guided', session)))();
  };
})();
