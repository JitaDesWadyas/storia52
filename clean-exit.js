'use strict';
(() => {
  const S = window.S52;
  S.openExitModal = () => {
    const session = S.currentSession || S.load();
    if (!session) { S.renderHome(); return; }
    const mode = 'play';
    const inGame = session.stage === 'game';
    const canChangeStory = session.source === 'ready' && ['objectives', 'prep', 'game'].includes(session.stage);
    const changeStoryButton = canChangeStory ? '<button type="button" class="secondary" data-exit-change-story>Scegli un’altra storia</button>' : '';
    const body = inGame
      ? `<p>Vuoi uscire o cambiare qualcosa?</p><div class="exit-options"><button type="button" class="primary" data-exit-continue>Continua</button>${changeStoryButton}<button type="button" class="secondary" data-exit-menu>Salva per dopo</button><button type="button" class="secondary" data-exit-finished>La storia è finita</button><button type="button" class="danger" data-exit-abandon>Nuova partita</button></div>`
      : `<p>Puoi tornare al menu, cambiare storia senza perdere i nomi, oppure abbandonare la partita.</p><div class="exit-options"><button type="button" class="primary" data-exit-continue>Continua</button>${changeStoryButton}<button type="button" class="secondary" data-exit-menu>Torna al menu</button><button type="button" class="danger" data-exit-clear>Abbandona la partita</button></div>`;
    const { host, close } = S.modal(inGame ? 'Partita in corso' : 'Uscire?', body);
    host.querySelector('[data-exit-continue]').addEventListener('click', close);
    host.querySelector('[data-exit-menu]').addEventListener('click', () => { close(); S.save(session); S.renderHome(); });
    host.querySelector('[data-exit-change-story]')?.addEventListener('click', () => { close(); S.changeReadyStory(session); });
    host.querySelector('[data-exit-finished]')?.addEventListener('click', () => { close(); S.renderFinished(mode); });
    host.querySelector('[data-exit-abandon]')?.addEventListener('click', () => { close(); S.clear(); S.renderSetup(mode); });
    host.querySelector('[data-exit-clear]')?.addEventListener('click', () => { close(); S.clear(); S.renderHome(); });
  };

  S.renderFinished = (mode = 'play') => {
    S.clear();
    S.mount(`<section class="surface"><div class="screen-heading"><p class="eyebrow">STORIA CONCLUSA</p><h2>La vostra storia è finita.</h2><p>La prossima partita partirà da una nuova scelta.</p></div><div class="actions"><button type="button" class="secondary" data-finished-home>Torna all’inizio</button><button type="button" class="primary" data-finished-new>Nuova storia</button></div></section>`, { session: true });
    S.play.querySelector('[data-finished-home]').addEventListener('click', S.renderHome);
    S.play.querySelector('[data-finished-new]').addEventListener('click', () => S.renderSetup(mode));
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