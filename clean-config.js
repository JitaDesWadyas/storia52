'use strict';

(() => {
  const S = window.S52;

  const namesMarkup = session => `<section class="setup-panel"><div class="setup-head"><div><p class="eyebrow">GIOCATORI</p><b>Nomi e numero partecipanti</b></div><div class="player-count-control" aria-label="Numero di giocatori"><button type="button" data-count-change="-1" aria-label="Togli un giocatore"${session.count <= 2 ? ' disabled' : ''}>−</button><div class="player-count-value"><strong>${session.count}</strong> giocatori</div><button type="button" data-count-change="1" aria-label="Aggiungi un giocatore"${session.count >= 10 ? ' disabled' : ''}>+</button></div></div><div class="name-grid">${Array.from({ length: session.count }, (_, index) => `<label class="field"><span>Giocatore ${index + 1}</span><input data-player-name="${index}" value="${S.esc(session.names[index] || '')}" placeholder="Nome facoltativo" maxlength="${S.limits.name}" autocomplete="off" autocapitalize="words" enterkeyhint="next"><small>Massimo ${S.limits.name} caratteri</small></label>`).join('')}</div></section>`;

  const option = (value, selected, icon, title, copy, attr) => `<button type="button" class="option-card${selected ? ' selected' : ''}" ${attr}="${value}"><span>${icon}</span><div><b>${title}</b><small>${copy}</small></div></button>`;

  S.renderSetup = (mode = 'play', existing = null, scroll = true) => {
    const session = existing || S.newSession(mode);
    session.mode = 'play';
    session.stage = 'setup';
    session.source ||= 'ready';
    session.delivery ||= 'single';
    S.save(session);
    S.mount(`<section class="surface"><div class="screen-heading"><p class="eyebrow">NUOVA PARTITA</p><h2>Preparate la partita.</h2><p>Di base partite da una storia pronta. Potete usare <strong>un solo telefono</strong> oppure condividere <strong>un unico link/QR</strong>: ogni persona sceglierà il proprio nome.</p></div>${namesMarkup(session)}<div class="section-title"><span>INCIPIT</span><h3>Da dove parte la storia?</h3></div><div class="option-grid">${option('ready', session.source === 'ready', '✦', 'Scegliamo una storia pronta', 'È il modo più chiaro e veloce per iniziare.', 'data-source')}${option('cards', session.source === 'cards', '4', 'Inventiamo noi l’incipit', 'L’app pesca quattro informazioni. Voi costruite la scena iniziale.', 'data-source')}</div><div class="section-title"><span>OBIETTIVI SEGRETI</span><h3>Come li leggono i giocatori?</h3></div><div class="option-grid">${option('single', session.delivery === 'single', '1', 'Un telefono', 'Si passa lo stesso telefono: ognuno apre solo il proprio obiettivo.', 'data-delivery')}${option('multi', session.delivery === 'multi', 'QR', 'Telefoni separati', 'Un solo invito per tutti. Ognuno seleziona il proprio giocatore.', 'data-delivery')}</div><div class="actions one"><button type="button" class="primary" data-setup-continue>Continua</button></div></section>`, { session: true, scroll });

    const sync = () => {
      S.play.querySelectorAll('[data-player-name]').forEach(input => {
        const index = Number(input.dataset.playerName);
        session.names[index] = S.cleanText(input.value, S.limits.name);
      });
      S.save(session);
    };

    S.play.querySelectorAll('[data-player-name]').forEach(input => {
      input.addEventListener('input', sync);
      input.addEventListener('blur', () => {
        const clean = S.cleanText(input.value, S.limits.name);
        if (input.value !== clean) input.value = clean;
        sync();
      });
    });
    S.play.querySelectorAll('[data-count-change]').forEach(button => button.addEventListener('click', () => {
      sync();
      session.count = Math.max(2, Math.min(10, session.count + Number(button.dataset.countChange)));
      session.names = Array.from({ length: session.count }, (_, index) => session.names[index] || '');
      session.objectives = Array.from({ length: session.count }, (_, index) => objectiveFromSeed(session.seed, index + 1));
      session.confirmed = Array(session.count).fill(false);
      S.renderSetup('play', session, false);
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
