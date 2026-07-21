'use strict';

(() => {
  const S = window.S52;
  const COUNTER_START = Math.max(1, S.limits.name - 8);

  const namesMarkup = session => `<section class="setup-panel"><div class="setup-head"><div><p class="eyebrow">GIOCATORI</p><b>Nomi e numero partecipanti</b></div><div class="player-count-control" aria-label="Numero di giocatori"><button type="button" data-count-change="-1" aria-label="Togli un giocatore"${session.count <= 2 ? ' disabled' : ''}>−</button><div class="player-count-value"><strong>${session.count}</strong> giocatori</div><button type="button" data-count-change="1" aria-label="Aggiungi un giocatore"${session.count >= 8 ? ' disabled' : ''}>+</button></div></div><div class="name-grid">${Array.from({ length: session.count }, (_, index) => {
    const value = S.cleanText(session.names[index] || '', S.limits.name);
    const nearLimit = value.length >= COUNTER_START;
    return `<label class="field"><span class="field-label-row"><span>Giocatore ${index + 1}</span><small class="name-limit-counter${value.length >= S.limits.name ? ' at-limit' : nearLimit ? ' near-limit' : ''}" data-name-counter="${index}"${nearLimit ? '' : ' hidden'}>${value.length}/${S.limits.name}</small></span><input data-player-name="${index}" value="${S.esc(value)}" placeholder="Nome facoltativo" maxlength="${S.limits.name}" autocomplete="off" autocapitalize="words" enterkeyhint="next"></label>`;
  }).join('')}</div></section>`;

  const option = (value, selected, icon, title, copy, attr, { locked = false } = {}) => `<button type="button" class="option-card${selected ? ' selected' : ''}${locked ? ' option-locked' : ''}" ${attr}="${value}"${locked ? ' aria-disabled="true" data-coming-soon="true"' : ''}><span>${icon}</span><div><b>${title}</b><small>${copy}</small></div></button>`;

  S.renderSetup = (mode = 'play', existing = null, scroll = true) => {
    const session = S.secureCollectionSession?.(existing || S.newSession(mode)) || existing || S.newSession(mode);
    session.mode = 'play';
    session.stage = 'setup';
    session.source = 'ready';
    session.collectionId = '';
    session.readyStoryId = '';
    session.openingText = '';
    session.spokenOpening = false;
    session.delivery = session.delivery === 'multi' ? 'multi' : 'single';
    S.save(session);

    S.mount(`<section class="surface"><div class="screen-heading"><p class="eyebrow">NUOVA PARTITA</p><h2>Preparate la partita.</h2><p>Scegliete i giocatori e come leggere gli obiettivi. Subito dopo selezionerete la collezione e la storia.</p></div>${namesMarkup(session)}<div class="section-title"><span>INCIPIT</span><h3>Da dove parte la storia?</h3></div><div class="option-grid">${option('ready', true, '✦', 'Scegliamo una storia pronta', 'Sceglierete prima una collezione e poi uno degli incipit disponibili.', 'data-source')}${option('cards', false, '4', 'Inventiamo noi l’incipit', 'Creazione guidata dell’incipit personalizzato.', 'data-source', { locked: true })}</div><div class="section-title"><span>OBIETTIVI SEGRETI</span><h3>Come li leggono i giocatori?</h3></div><div class="option-grid">${option('single', session.delivery === 'single', '1', 'Un telefono', 'Si passa lo stesso telefono: ognuno apre solo il proprio obiettivo.', 'data-delivery')}${option('multi', session.delivery === 'multi', 'QR', 'Telefoni separati', 'Un solo invito per tutti. Ognuno seleziona il proprio giocatore.', 'data-delivery')}</div><div class="actions one"><button type="button" class="primary" data-setup-continue>Continua</button></div></section>`, { session: true, scroll });

    const updateCounter = input => {
      const index = Number(input.dataset.playerName);
      const counter = S.play.querySelector(`[data-name-counter="${index}"]`);
      if (!counter) return;
      const length = Array.from(input.value).length;
      counter.textContent = `${length}/${S.limits.name}`;
      counter.hidden = length < COUNTER_START;
      counter.classList.toggle('near-limit', length >= COUNTER_START && length < S.limits.name);
      counter.classList.toggle('at-limit', length >= S.limits.name);
    };

    const sync = () => {
      S.play.querySelectorAll('[data-player-name]').forEach(input => {
        const index = Number(input.dataset.playerName);
        session.names[index] = S.cleanText(input.value, S.limits.name);
        updateCounter(input);
      });
      session.source = 'ready';
      S.save(session);
    };

    S.play.querySelectorAll('[data-player-name]').forEach(input => {
      updateCounter(input);
      input.addEventListener('input', () => {
        if (Array.from(input.value).length > S.limits.name) input.value = Array.from(input.value).slice(0, S.limits.name).join('');
        sync();
      });
      input.addEventListener('blur', () => {
        const clean = S.cleanText(input.value, S.limits.name);
        if (input.value !== clean) input.value = clean;
        sync();
      });
    });

    S.play.querySelectorAll('[data-count-change]').forEach(button => button.addEventListener('click', () => {
      sync();
      session.count = Math.max(2, Math.min(8, session.count + Number(button.dataset.countChange)));
      session.names = Array.from({ length: session.count }, (_, index) => session.names[index] || '');
      session.objectives = Array.from({ length: session.count }, (_, index) => objectiveFromSeed(session.seed, index + 1));
      session.confirmed = Array(session.count).fill(false);
      S.renderSetup('play', session, false);
    }));

    S.play.querySelector('[data-source="ready"]')?.addEventListener('click', () => {
      sync();
      session.source = 'ready';
    });
    S.play.querySelector('[data-source="cards"]')?.addEventListener('click', () => {
      session.source = 'ready';
      S.toast('Inventiamo noi l’incipit: in arrivo');
    });

    S.play.querySelectorAll('[data-delivery]').forEach(button => button.addEventListener('click', () => {
      sync();
      session.delivery = button.dataset.delivery === 'multi' ? 'multi' : 'single';
      S.play.querySelectorAll('[data-delivery]').forEach(item => item.classList.toggle('selected', item === button));
      S.save(session);
    }));

    S.play.querySelector('[data-setup-continue]').addEventListener('click', () => {
      sync();
      session.names = S.normalizeNames(session.count, session.names);
      session.source = 'ready';
      session.stage = 'collections';
      S.save(session);
      S.renderCollections(session);
    });
  };
})();
