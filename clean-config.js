'use strict';

(() => {
  const S = window.S52;

  const namesMarkup = session => `<section class="setup-panel"><div class="setup-head"><div><p class="eyebrow">GIOCATORI</p><b>Nomi e numero partecipanti</b></div><div class="player-count-control" aria-label="Numero di giocatori"><button type="button" data-count-change="-1" aria-label="Togli un giocatore"${session.count <= 2 ? ' disabled' : ''}>−</button><div class="player-count-value"><strong>${session.count}</strong> giocatori</div><button type="button" data-count-change="1" aria-label="Aggiungi un giocatore"${session.count >= 10 ? ' disabled' : ''}>+</button></div></div><div class="name-grid">${Array.from({ length: session.count }, (_, index) => `<label class="field"><span>Giocatore ${index + 1}</span><input data-player-name="${index}" value="${S.esc(session.names[index] || '')}" placeholder="Nome facoltativo"></label>`).join('')}</div></section>`;

  const option = (value, selected, icon, title, copy, attr) => `<button type="button" class="option-card${selected ? ' selected' : ''}" ${attr}="${value}"><span>${icon}</span><div><b>${title}</b><small>${copy}</small></div></button>`;

  S.renderSetup = (mode, existing = null, scroll = true) => {
    const session = existing || S.newSession(mode);
    session.mode = mode;
    session.stage = 'setup';
    if (mode === 'guided') session.delivery = 'single';
    S.save(session);
    const delivery = mode === 'autonomous' ? `<div class="section-title"><span>TELEFONI</span><h3>Come volete distribuire gli obiettivi?</h3></div><div class="option-grid">${option('single', session.delivery === 'single', '1', 'Un telefono al centro', 'Passate lo stesso telefono per leggere gli obiettivi segreti.', 'data-delivery')}${option('multi', session.delivery === 'multi', '↗', 'Un telefono a testa', 'Ogni giocatore riceve un link personale con storia, obiettivo e regole.', 'data-delivery')}</div>` : '';
    S.mount(`<section class="surface"><div class="screen-heading"><p class="eyebrow">${mode === 'guided' ? 'PARTITA CON ASSISTENTE' : 'PARTITA AUTONOMA'}</p><h2>Preparate la partita.</h2></div>${namesMarkup(session)}${delivery}<div class="section-title"><span>INCIPIT</span><h3>Da dove parte la storia?</h3></div><div class="option-grid">${option('cards', session.source === 'cards', '4', 'Inventiamo noi l’incipit', 'L’app pesca quattro informazioni. Voi inventate la storia.', 'data-source')}${option('ready', session.source === 'ready', '52', 'Scegliamo una storia pronta', 'Partite da uno dei 52 incipit già scritti.', 'data-source')}</div><div class="actions one"><button type="button" class="primary" data-setup-continue>Continua</button></div></section>`, { session: true, scroll });

    const sync = () => {
      S.play.querySelectorAll('[data-player-name]').forEach(input => { session.names[Number(input.dataset.playerName)] = input.value; });
      S.save(session);
    };

    S.play.querySelectorAll('[data-player-name]').forEach(input => input.addEventListener('input', sync));
    S.play.querySelectorAll('[data-count-change]').forEach(button => button.addEventListener('click', () => {
      sync();
      session.count = Math.max(2, Math.min(10, session.count + Number(button.dataset.countChange)));
      session.names = Array.from({ length: session.count }, (_, index) => session.names[index] || '');
      session.objectives = Array.from({ length: session.count }, (_, index) => objectiveFromSeed(session.seed, index + 1));
      session.confirmed = Array(session.count).fill(false);
      S.renderSetup(mode, session, false);
    }));

    S.play.querySelectorAll('[data-source]').forEach(button => button.addEventListener('click', () => {
      sync();
      session.source = button.dataset.source;
      S.play.querySelectorAll('[data-source]').forEach(item => item.classList.toggle('selected', item === button));
      S.save(session);
    }));

    S.play.querySelectorAll('[data-delivery]').forEach(button => button.addEventListener('click', () => {
      sync();
      session.delivery = button.dataset.delivery;
      S.play.querySelectorAll('[data-delivery]').forEach(item => item.classList.toggle('selected', item === button));
      S.save(session);
    }));

    S.play.querySelector('[data-setup-continue]').addEventListener('click', () => {
      sync();
      session.names = S.normalizeNames(session.count, session.names);
      session.stage = session.source === 'ready' ? 'stories' : 'cards';
      S.save(session);
      if (session.source === 'ready') S.renderStories(session); else S.renderCardsSource(session);
    });
  };

})();
