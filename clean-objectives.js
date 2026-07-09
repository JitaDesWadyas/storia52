'use strict';
(() => {
  const S = window.S52;
  S.continueAfterSource = session => {
    S.save(session);
    if (session.delivery === 'multi') S.renderInvites(session);
    else S.renderObjectives(session);
  };

  S.renderObjectives = (session, scroll = true) => {
    session.stage = 'objectives';
    session.names = S.normalizeNames(session.count, session.names);
    session.confirmed ||= Array(session.count).fill(false);
    S.save(session);
    const done = session.confirmed.filter(Boolean).length;
    S.mount(`<section class="surface"><div class="screen-heading"><p class="eyebrow">OBIETTIVI SEGRETI</p><h2>Passate il telefono.</h2><p>Ogni giocatore apre soltanto il proprio obiettivo.</p></div>${S.storyContextMarkup(session)}<div class="objective-progress"><span>Giocatori pronti</span><b>${done}/${session.count}</b></div><div class="player-list">${session.objectives.map((_, index) => `<button type="button" class="player-button${session.confirmed[index] ? ' done' : ''}" data-objective-player="${index}"><span>${index + 1}</span><div><b>${S.esc(S.playerName(session, index))}</b><small>${session.confirmed[index] ? 'Obiettivo memorizzato' : 'Da leggere'}</small></div><i>${session.confirmed[index] ? 'Riapri' : 'Apri'}</i></button>`).join('')}</div><div class="actions one"><button type="button" class="primary" data-objectives-done${done === session.count ? '' : ' disabled'}>Continua</button></div></section>`, { session: true, scroll });
    S.play.querySelectorAll('[data-objective-player]').forEach(button => button.addEventListener('click', () => S.openObjective(session, Number(button.dataset.objectivePlayer), false)));
    S.play.querySelector('[data-objectives-done]').addEventListener('click', () => S.renderPreparation(session, false));
  };

  S.openObjective = (session, index, duringGame) => {
    let revealed = false;
    let seen = Boolean(session.confirmed[index]);
    const { host, close } = S.modal('Obiettivo segreto', '', { className: 'objective-modal' });
    const card = host.querySelector('.modal-card');
    card.classList.add('objective-modal-card');
    const draw = () => {
      card.innerHTML = `<button type="button" class="modal-close" aria-label="Chiudi">×</button><p class="eyebrow">${S.esc(S.playerName(session, index))}</p><h2>Obiettivo segreto</h2><div class="secret-card">${revealed ? secretContent(session.objectives[index]) : secretClosed(`Passa il telefono a ${S.playerName(session, index)}`, 'Gli altri non guardano.')}</div><div class="modal-actions"><button type="button" class="primary" data-toggle-objective>${revealed ? 'Nascondi' : 'Rivela'}</button>${duringGame ? '<button type="button" class="secondary" data-close-objective>Chiudi</button>' : `<button type="button" class="secondary" data-confirm-objective${seen ? '' : ' disabled'}>Ho letto e memorizzato</button>`}</div>`;
      card.querySelector('.modal-close').addEventListener('click', close);
      card.querySelector('[data-close-objective]')?.addEventListener('click', close);
      card.querySelector('[data-toggle-objective]').addEventListener('click', () => {
        revealed = !revealed;
        if (revealed) seen = true;
        draw();
      });
      card.querySelector('[data-confirm-objective]')?.addEventListener('click', () => {
        if (!seen) return;
        session.confirmed[index] = true;
        S.save(session);
        close();
        S.renderObjectives(session, false);
      });
    };
    draw();
  };

})();
