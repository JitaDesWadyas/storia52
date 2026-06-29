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

  G.copyText = async text => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      const copied = document.execCommand('copy');
      area.remove();
      return copied;
    }
  };

  G.progressMarkup = active => {
    const phases = [
      { id: 'story', number: 1, label: 'Carte' },
      { id: 'opening', number: 2, label: 'Incipit' },
      { id: 'objectives', number: 3, label: 'Obiettivi' },
      { id: 'play', number: 4, label: 'Gioco' }
    ];
    const current = Math.max(0, phases.findIndex(phase => phase.id === active));
    return `<nav class="flow-progress" aria-label="Avanzamento della partita"><ol>${phases.map((phase, index) => `<li class="${index < current ? 'completed' : ''}${index === current ? ' current' : ''}"${index === current ? ' aria-current="step"' : ''}><span>${index < current ? '✓' : phase.number}</span><b>${phase.label}</b><small>${phase.number}/4</small></li>`).join('')}</ol></nav>`;
  };

  G.glossaryMarkup = () => `<div class="glossary-grid">
    <p><b>Incipit</b><span>La prima scena vera della storia. Il primo turno continua da lì.</span></p>
    <p><b>Scena breve</b><span>Un solo fatto importante raccontato in poche frasi.</span></p>
    <p><b>Obiettivo della storia</b><span>Ciò che il protagonista cerca di ottenere per tutta la storia.</span></p>
    <p><b>Obiettivo segreto</b><span>La conclusione che ogni giocatore proverà a realizzare. Non fa parte della mano.</span></p>
    <p><b>Finale</b><span>L’ultima scena: raggiunge l’obiettivo segreto e chiude o trasforma il problema iniziale.</span></p>
  </div>`;

  G.cardTypesMarkup = (options = {}) => `<section class="card-types-guide${options.compact ? ' compact' : ''}">
    <div class="card-types-head"><span>QUALI CARTE ESISTONO</span><h3>Tre funzioni diverse, da non confondere.</h3></div>
    <div class="card-types-grid">
      <article><span>1</span><div><b>Quattro carte della storia</b><p><strong>Protagonista</strong>, <strong>Situazione</strong>, <strong>Obiettivo della storia</strong> e <strong>Problema</strong>. Insieme formano l’incipit comune.</p></div></article>
      <article><span>2</span><div><b>Carte fisiche in mano</b><p>Durante il turno il <strong>seme</strong> dice che cosa accade e il <strong>valore</strong> dice se aiuta o ostacola il protagonista.</p></div></article>
      <article><span>3</span><div><b>Obiettivo segreto</b><p>È la carta privata sul telefono. Indica il finale da raggiungere e resta separata dalle carte in mano.</p></div></article>
    </div>
  </section>`;

  G.cardGuideMarkup = (options = {}) => {
    const { compact = false, open = false, title = 'Come si legge una carta giocata' } = options;
    return `<details class="card-rules-guide${compact ? ' compact' : ''}"${open ? ' open' : ''}>
      <summary><span>CARTE DEL TURNO</span><b>${title}</b><i aria-hidden="true">⌄</i></summary>
      <div class="card-rules-guide-body">
        <div class="card-rule-suits">
          <p><b class="red">♥ Cuori</b><span>Cambia un rapporto.</span></p>
          <p><b class="red">♦ Quadri</b><span>Rivela una verità, un’informazione o un indizio.</span></p>
          <p><b>♣ Fiori</b><span>Tenta un’azione.</span></p>
          <p><b>♠ Picche</b><span>Introduce una conseguenza, un ostacolo o una perdita.</span></p>
        </div>
        <div class="card-rule-values">
          <p><b>Numero pari</b><span>Avvicina il protagonista al suo obiettivo.</span></p>
          <p><b>Numero dispari</b><span>Lo allontana dal suo obiettivo.</span></p>
        </div>
        <div class="card-rule-figures">
          <p><b>J</b><span>Nuovo oggetto</span></p><p><b>Q</b><span>Nuovo personaggio</span></p><p><b>K</b><span>Nuovo luogo</span></p><p><b>A</b><span>Ribalta la situazione</span></p>
        </div>
        <p class="card-rule-note"><b>J, Q, K e A non hanno parità e si giocano da soli.</b> Se sono rossi introducono l’elemento in modo favorevole; se sono neri lo introducono come ostacolo o complicazione.</p>
      </div>
    </details>`;
  };

  G.rulebookMarkup = (options = {}) => {
    const { embedded = false } = options;
    return `<div class="unified-rulebook${embedded ? ' embedded' : ''}">
      ${embedded ? '' : `<div class="rulebook-cover"><p class="brand-kicker">GIOCO NARRATIVO CON UN MAZZO DI CARTE</p><div><h2 id="rules-title">STORIA 52</h2><span>REGOLAMENTO</span></div></div><div class="amber-banner">CREA LA STORIA. CHIUDILA CON IL TUO OBIETTIVO SEGRETO.</div>`}
      <div class="rules-intro">
        <div class="rules-step"><span>1</span><p><b>Create l’incipit</b> usando tutte e quattro le carte della storia.</p></div>
        <div class="rules-step"><span>2</span><p><b>Ricevete gli obiettivi segreti</b> e distribuite cinque carte fisiche a testa.</p></div>
        <div class="rules-step"><span>3</span><p><b>Continuate la storia</b> turno dopo turno fino a un finale valido.</p></div>
      </div>
      <div class="rulebook-controls"><button type="button" data-rules-expand>Apri tutte</button><button type="button" data-rules-collapse>Chiudi tutte</button></div>
      <div class="rules-accordion">
        <details open>
          <summary><span>01</span> Le tre funzioni delle carte</summary>
          <div class="details-body">${G.cardTypesMarkup({ compact: true })}</div>
        </details>
        <details>
          <summary><span>02</span> Semi, numeri e carte speciali</summary>
          <div class="details-body">${G.cardGuideMarkup({ compact: true, open: true, title: 'Il seme dice cosa accade; il valore dice come va' })}</div>
        </details>
        <details>
          <summary><span>03</span> Preparazione</summary>
          <div class="details-body numbered-list">
            <p><i>1</i> Togliete i jolly e mescolate il mazzo.</p>
            <p><i>2</i> Date <b>5 carte fisiche</b> a ogni giocatore.</p>
            <p><i>3</i> Create l’incipit con <b>Protagonista, Situazione, Obiettivo della storia e Problema</b>.</p>
            <p><i>4</i> Ogni giocatore legge il proprio <b>Obiettivo segreto</b> e lo tiene separato dalla mano.</p>
          </div>
        </details>
        <details>
          <summary><span>04</span> Il turno</summary>
          <div class="details-body numbered-list">
            <p><i>1</i> <b>Scarta 1 carta e ripesca 1 carta.</b> Se in mano ne avevi una sola, la scarti comunque: puoi riprendere quella stessa carta oppure pescarne una diversa.</p>
            <p><i>2</i> Gioca <b>1 carta</b> oppure <b>2 carte compatibili</b>.</p>
            <p><i>3</i> Racconta un solo fatto successivo: applica la carta e usa almeno un elemento già introdotto.</p>
            <p><i>4</i> Pesca 1 carta oppure resta volontariamente con una carta in meno.</p>
          </div>
        </details>
        <details>
          <summary><span>05</span> Giocare due carte</summary>
          <div class="details-body">
            <p><b>Le due carte sono compatibili soltanto se hanno:</b></p>
            <p>• lo stesso seme e parità diversa;</p>
            <p>• la stessa parità e seme diverso.</p>
            <p class="note">J, Q, K e A si giocano sempre da soli e non possono essere abbinati.</p>
          </div>
        </details>
        <details>
          <summary><span>06</span> Finale e opposizione</summary>
          <div class="details-body">
            <p>Puoi tentare il finale nel tuo turno quando, <b>dopo il ricambio iniziale obbligatorio</b>, hai 1 carta oppure 2 carte compatibili.</p>
            <p class="note">Con una sola carta non salti lo scarto: la scarti e scegli liberamente se riprenderla o cambiarla.</p>
            <div class="numbered-list">
              <p><i>1</i> Gioca la carta rimasta oppure le due carte compatibili.</p>
              <p><i>2</i> Mostra il tuo Obiettivo segreto.</p>
              <p><i>3</i> Raggiungi il finale indicato dall’obiettivo.</p>
              <p><i>4</i> Chiudi o trasforma il problema iniziale usando elementi già comparsi. Non inventare una soluzione scollegata soltanto nel finale.</p>
            </div>
            <div class="opposition-box"><b>OPPOSIZIONE</b><p>Un solo avversario può aggiungere un elemento al finale con una carta compatibile. Non può modificarlo né annullarlo.</p></div>
          </div>
        </details>
        <details>
          <summary><span>07</span> Parole chiave</summary>
          <div class="details-body">${G.glossaryMarkup()}</div>
        </details>
      </div>
      <p class="victory-line">VINCE CHI CONCLUDE LA STORIA CON IL PROPRIO OBIETTIVO SEGRETO.</p>
    </div>`;
  };

  G.bindRulebook = root => {
    if (!root) return;
    const accordion = root.querySelector('.rules-accordion');
    const details = accordion ? [...accordion.children].filter(item => item.tagName === 'DETAILS') : [];
    root.querySelector('[data-rules-expand]')?.addEventListener('click', () => details.forEach(item => { item.open = true; }));
    root.querySelector('[data-rules-collapse]')?.addEventListener('click', () => details.forEach(item => { item.open = false; }));
  };

  G.renderRulesPage = () => {
    const page = document.querySelector('#rules');
    if (!page) return;
    page.innerHTML = G.rulebookMarkup();
    G.bindRulebook(page);
  };

  G.openRulesModal = () => {
    const modal = G.modal('Regole complete', G.rulebookMarkup({ embedded: true }), { wide: true });
    G.bindRulebook(modal);
  };

  G.rulesMarkup = () => G.rulebookMarkup({ embedded: true });

  G.topbar = label => {
    let bar = document.querySelector('.session-topbar');
    if (!bar) {
      bar = document.createElement('div');
      bar.className = 'session-topbar';
      document.body.appendChild(bar);
    }
    bar.innerHTML = `<button type="button" class="session-logo" aria-label="Torna alla schermata iniziale"><img src="icon.svg" alt="STORIA 52"></button><span class="session-label">${escapeHtml(label)}</span><button type="button" class="session-rules-button">Regole</button><button type="button" class="session-exit">Esci</button>`;
    bar.querySelector('.session-logo').addEventListener('click', G.home);
    bar.querySelector('.session-rules-button').addEventListener('click', G.openRulesModal);
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
    if (scroll) requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    else requestAnimationFrame(() => window.scrollTo({ top: previousScroll, behavior: 'instant' }));
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
    hero.innerHTML = `<div class="simple-hero"><p class="section-kicker">GIOCO NARRATIVO CON UN MAZZO DI CARTE</p><h2>Una storia. Cinquantadue possibilità.</h2><p>Scegli quanto deve fare l’app durante la partita.</p></div>`;

    const saved = G.load();
    modes.innerHTML = `${saved ? `<button type="button" class="home-resume"><span>PARTITA SALVATA</span><b>Riprendi partita con assistente</b><small>Continua dal punto in cui eri rimasto.</small></button>` : ''}
      <button type="button" class="home-choice primary" data-home="guided"><span class="home-choice-icon">1</span><span><b>Partita con assistente</b><small>L’app costruisce l’incipit, assegna gli obiettivi e accompagna ogni turno.</small></span><i>→</i></button>
      <button type="button" class="home-choice" data-home="free"><span class="home-choice-icon">2</span><span><b>Partita autonoma</b><small>L’app prepara storia e obiettivi; il gruppo gestisce i turni al tavolo.</small></span><i>→</i></button>
      <button type="button" class="home-choice" data-home="rules"><span class="home-choice-icon">3</span><span><b>Regolamento</b><small>Apri la stessa guida completa disponibile durante la partita.</small></span><i>→</i></button>`;

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
    G.renderRulesPage();
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
    G.screen(`<div class="screen-heading"><p class="eyebrow">PARTITA AUTONOMA</p><h2>Stessa app, meno assistenza.</h2><p>Scegli come distribuire storia e obiettivi. Le regole restano sempre disponibili nella barra in alto.</p></div>
      ${G.cardTypesMarkup({ compact: true })}
      <div class="free-mode-list unified-free-menu">
        <button type="button" data-free="single"><b>Un telefono al centro</b><small>Storia comune e obiettivi privati sullo stesso dispositivo.</small><span>→</span></button>
        <button type="button" data-free="multi"><b>Inviti personali</b><small>Ogni giocatore riceve sul proprio telefono storia e obiettivo.</small><span>→</span></button>
        <button type="button" data-free="quick"><b>Solo generatore</b><small>Crea immediatamente una storia e un obiettivo segreto.</small><span>→</span></button>
      </div>`, 'Partita autonoma');
    G.game.querySelector('[data-free="single"]').addEventListener('click', () => G.oldSingle(G.game));
    G.game.querySelector('[data-free="multi"]').addEventListener('click', () => G.oldMulti(G.game));
    G.game.querySelector('[data-free="quick"]').addEventListener('click', () => G.oldQuick(G.game));
  };

  G.modal = (title, body, options = {}) => {
    const modal = document.createElement('div');
    modal.className = `focus-modal${options.wide ? ' wide' : ''}`;
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', title);
    modal.innerHTML = `<div class="focus-modal-backdrop"></div><div class="focus-modal-card"><button type="button" class="modal-close" aria-label="Chiudi">×</button><h2>${title}</h2>${body}</div>`;
    const close = () => {
      modal.classList.add('is-closing');
      window.setTimeout(() => modal.remove(), 180);
    };
    modal.querySelector('.focus-modal-backdrop').addEventListener('click', close);
    modal.querySelector('.modal-close').addEventListener('click', close);
    modal.addEventListener('keydown', event => { if (event.key === 'Escape') close(); });
    document.body.appendChild(modal);
    requestAnimationFrame(() => {
      modal.classList.add('is-visible');
      modal.querySelector('.modal-close')?.focus({ preventScroll: true });
    });
    return modal;
  };

  G.init = () => {
    G.renderRulesPage();
    const pendingInvite = window.__storia52DirectInvite;
    if (pendingInvite) {
      G.enter('Invito personale');
      window.showMulti?.(G.game, pendingInvite);
      return;
    }
    G.home();
  };
})();
