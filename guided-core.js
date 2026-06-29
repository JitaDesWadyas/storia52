'use strict';

(() => {
  const G = window.G52 = {
    key: 'storia52_guided_session_v2',
    game: document.querySelector('#game'),
    play: document.querySelector('#play'),
    oldSingle: window.singleMode,
    oldMulti: window.multiMode,
    oldQuick: window.quickMode,
    flow: {},
    playMode: {}
  };

  G.load = () => {
    try { return JSON.parse(localStorage.getItem(G.key) || 'null'); }
    catch { return null; }
  };
  G.save = session => {
    try { localStorage.setItem(G.key, JSON.stringify(session)); }
    catch { /* La partita continua senza salvataggio. */ }
  };
  G.clear = () => {
    try { localStorage.removeItem(G.key); }
    catch { /* Nessuna azione necessaria. */ }
  };
  G.randomIndex = max => {
    const values = new Uint32Array(1);
    crypto.getRandomValues(values);
    return values[0] % max;
  };

  G.rulesMarkup = () => `<div class="session-rules-content">
    <section><span>IL TURNO</span><ol><li>Scarta 1 carta e pescane 1. Con una sola carta puoi tenerla.</li><li>Gioca 1 carta oppure 2 carte compatibili.</li><li>Racconta una scena breve usando qualcosa già introdotto.</li><li>Pesca 1 carta oppure resta con una carta in meno.</li></ol></section>
    <section><span>SEMI</span><div class="rule-mini-grid"><p><b class="red">♥ Cuori</b>Cambia un rapporto.</p><p><b class="red">♦ Quadri</b>Rivela una verità o un indizio.</p><p><b>♣ Fiori</b>Tenta un’azione.</p><p><b>♠ Picche</b>Crea una conseguenza, un ostacolo o una perdita.</p></div></section>
    <section><span>VALORI</span><p><b>Pari:</b> avvicina il protagonista al suo obiettivo. <b>Dispari:</b> lo allontana.</p><p><b>J, Q, K, A:</b> nuovo oggetto, personaggio, luogo o ribaltamento. Le figure si giocano da sole.</p></section>
    <section><span>DUE CARTE</span><p>Sono compatibili con <b>stesso seme e parità diversa</b>, oppure <b>stessa parità e seme diverso</b>.</p></section>
    <section><span>FINALE</span><p>Con 1 carta o 2 compatibili, mostra l’obiettivo segreto e chiudi o trasforma il problema usando elementi già comparsi.</p></section>
  </div>`;

  G.topbar = label => {
    let bar = document.querySelector('.session-topbar');
    if (!bar) {
      bar = document.createElement('div');
      bar.className = 'session-topbar';
      document.body.appendChild(bar);
    }
    bar.innerHTML = `<button type="button" class="session-logo" aria-label="Torna alla schermata iniziale"><img src="icon.svg" alt="STORIA 52"></button><span class="session-label">${escapeHtml(label)}</span><button type="button" class="session-rules-button">Regole</button><button type="button" class="session-exit">Esci</button>`;
    bar.querySelector('.session-logo').addEventListener('click', G.home);
    bar.querySelector('.session-rules-button').addEventListener('click', () => G.modal('Regole', G.rulesMarkup(), { wide: true }));
    bar.querySelector('.session-exit').addEventListener('click', G.home);
  };

  G.enter = (label = 'Partita') => {
    document.body.classList.add('session-active');
    document.body.classList.remove('simple-home', 'rules-active');
    G.topbar(label);
    openPage('play');
    G.game.classList.remove('hidden');
  };

  G.screen = (html, label, options = {}) => {
    const { scroll = true, direction = 'forward' } = options;
    const previousScroll = window.scrollY;
    G.enter(label);
    G.game.innerHTML = `<div class="screen-view screen-${direction}">${html}</div>`;
    const view = G.game.querySelector('.screen-view');
    requestAnimationFrame(() => view?.classList.add('is-visible'));
    if (scroll) {
      requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    } else {
      requestAnimationFrame(() => window.scrollTo({ top: previousScroll, behavior: 'instant' }));
    }
  };

  G.pulse = (element, className = 'is-updating') => {
    if (!element) return;
    element.classList.remove(className);
    void element.offsetWidth;
    element.classList.add(className);
    element.addEventListener('animationend', () => element.classList.remove(className), { once: true });
  };

  G.home = () => {
    document.body.classList.add('simple-home');
    document.body.classList.remove('session-active', 'rules-active');
    document.querySelector('.session-topbar')?.remove();
    document.querySelector('.rules-back')?.remove();
    openPage('play');
    G.game.innerHTML = '';
    G.game.classList.add('hidden');

    const hero = G.play.querySelector('.hero-board');
    const heading = G.play.querySelector('.section-heading');
    const modes = G.play.querySelector('.mode-grid');
    heading?.remove();
    hero.innerHTML = `<div class="simple-hero"><p class="section-kicker">GIOCO NARRATIVO CON UN MAZZO DI CARTE</p><h2>Una storia. Cinquantadue possibilità.</h2><p>Scegli come vuoi iniziare.</p></div>`;

    const saved = G.load();
    modes.innerHTML = `${saved ? `<button type="button" class="home-resume"><span>PARTITA SALVATA</span><b>Riprendi la partita guidata</b><small>Continua dal punto in cui eri rimasto.</small></button>` : ''}
      <button type="button" class="home-choice primary" data-home="guided"><span class="home-choice-icon">1</span><span><b>Partita guidata per principianti</b><small>Aiuto per creare l’incipit e spiegazioni solo quando servono.</small></span><i>→</i></button>
      <button type="button" class="home-choice" data-home="free"><span class="home-choice-icon">2</span><span><b>Gioca senza guida</b><small>Per chi conosce già il gioco e vuole soltanto generare la partita.</small></span><i>→</i></button>
      <button type="button" class="home-choice" data-home="rules"><span class="home-choice-icon">3</span><span><b>Regole</b><small>Apri il regolamento completo.</small></span><i>→</i></button>`;

    modes.querySelector('.home-resume')?.addEventListener('click', () => G.flow.resume(saved));
    modes.querySelector('[data-home="guided"]').addEventListener('click', G.flow.setup);
    modes.querySelector('[data-home="free"]').addEventListener('click', G.freeMenu);
    modes.querySelector('[data-home="rules"]').addEventListener('click', G.rules);
    requestAnimationFrame(() => modes.classList.add('is-visible'));
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  G.rules = () => {
    document.body.classList.remove('simple-home', 'session-active');
    document.body.classList.add('rules-active');
    openPage('rules');
    let back = document.querySelector('.rules-back');
    if (!back) {
      back = document.createElement('button');
      back.type = 'button';
      back.className = 'rules-back';
      back.textContent = '← Torna all’inizio';
      document.querySelector('#rules').prepend(back);
      back.addEventListener('click', G.home);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  G.freeMenu = () => {
    G.screen(`<div class="screen-heading"><p class="eyebrow">SENZA GUIDA</p><h2>Cosa vuoi usare?</h2><p>Il sito genera i contenuti, ma non accompagna i turni.</p></div>
      <div class="free-mode-list">
        <button type="button" data-free="single"><b>Un solo telefono</b><small>Passate il telefono per leggere gli obiettivi.</small><span>→</span></button>
        <button type="button" data-free="multi"><b>Un telefono a testa</b><small>Create un invito privato per ogni giocatore.</small><span>→</span></button>
        <button type="button" data-free="quick"><b>Generatore rapido</b><small>Genera incipit e un solo obiettivo.</small><span>→</span></button>
      </div>`, 'Senza guida');
    G.game.querySelector('[data-free="single"]').addEventListener('click', () => G.oldSingle(G.game));
    G.game.querySelector('[data-free="multi"]').addEventListener('click', () => G.oldMulti(G.game));
    G.game.querySelector('[data-free="quick"]').addEventListener('click', () => G.oldQuick(G.game));
  };

  G.modal = (title, body, options = {}) => {
    const modal = document.createElement('div');
    modal.className = `focus-modal${options.wide ? ' wide' : ''}`;
    modal.innerHTML = `<div class="focus-modal-backdrop"></div><div class="focus-modal-card"><button type="button" class="modal-close" aria-label="Chiudi">×</button><h2>${title}</h2>${body}</div>`;
    const close = () => {
      modal.classList.add('is-closing');
      window.setTimeout(() => modal.remove(), 180);
    };
    modal.querySelector('.focus-modal-backdrop').addEventListener('click', close);
    modal.querySelector('.modal-close').addEventListener('click', close);
    document.body.appendChild(modal);
    requestAnimationFrame(() => modal.classList.add('is-visible'));
    return modal;
  };

  G.init = () => {
    const params = new URLSearchParams(location.search);
    if (params.get('room') && params.get('player')) {
      document.body.classList.add('session-active');
      G.topbar('Invito giocatore');
      return;
    }
    G.home();
  };
})();
