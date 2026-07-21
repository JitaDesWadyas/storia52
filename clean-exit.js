'use strict';
(() => {
  const S = window.S52;

  S.openExitModal = () => {
    const session = S.currentSession || S.load();
    if (!session) { S.renderHome(); return; }
    const body = `<p class="exit-note">La partita resta salvata automaticamente.</p><div class="exit-options exit-options-simple"><button type="button" class="primary" data-exit-continue>Continua</button><button type="button" class="secondary" data-exit-home>Torna alla home</button><button type="button" class="danger" data-exit-new>Nuova partita</button></div>`;
    const { host, close } = S.modal('Uscire?', body, { className: 'exit-modal' });
    host.querySelector('[data-exit-continue]').addEventListener('click', close);
    host.querySelector('[data-exit-home]').addEventListener('click', () => {
      S.save(session);
      close();
      setTimeout(S.renderHome, 150);
    });
    host.querySelector('[data-exit-new]').addEventListener('click', () => {
      S.clear();
      close();
      setTimeout(() => S.renderSetup('play'), 150);
    });
  };

  S.resume = session => {
    if (!session) { S.renderHome(); return; }
    const routes = {
      setup: () => S.renderSetup('play', session),
      cards: () => S.renderCardsSource(session),
      questions: () => S.renderOpeningQuestions(session),
      stories: () => S.renderStories(session),
      objectives: () => S.renderObjectives(session),
      prep: () => S.renderPreparation(session),
      invites: () => S.renderInvites(session),
      game: () => session.delivery === 'multi' ? S.renderHostGame(session) : S.renderGame(session)
    };
    (routes[session.stage] || (() => S.renderSetup('play', session)))();
  };
})();
