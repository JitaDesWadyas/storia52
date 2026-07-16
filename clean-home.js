'use strict';

(() => {
  const S = window.S52;
  const CREATOR_IMAGE = 'creator-jita.svg';
  const tutorialOpening = 'Durante una festa in una villa isolata, sparisce un quadro.';
  const tutorialFinale = 'Dietro la foto compare il padrone mentre nasconde il quadro: aveva organizzato il furto per incassare l’assicurazione.';
  const tutorialSteps = [
    { badge: 'INIZIO', player: 'Tutti', card: '?', label: 'Obiettivi segreti', title: 'Una storia, tre piani diversi.', instruction: 'Marta, Luca e Sara leggono un obiettivo che gli altri non vedono.', addition: '', objective: '', owner: '', tone: 'neutral' },
    { badge: 'TURNO 1', player: 'Marta', card: '♣ 8', label: 'Azione', title: 'Marta fa agire il padrone.', instruction: 'Il padrone chiude le porte e ritira i telefoni.', addition: 'Il padrone chiude le porte e ritira i telefoni.', objective: 'Fai ricadere la colpa sul padrone.', owner: 'Marta', tone: 'clubs' },
    { badge: 'TURNO 2', player: 'Luca', card: '♦ J', label: 'Scoperta', title: 'Luca aggiunge un indizio.', instruction: 'Una foto bruciata collega il quadro alla villa.', addition: 'Una foto bruciata collega il quadro alla villa.', objective: 'Rivela un segreto di famiglia.', owner: 'Luca', tone: 'diamonds' },
    { badge: 'TURNO 3', player: 'Sara', card: '♠ 5', label: 'Ostacolo', title: 'Sara blocca la fuga.', instruction: 'Qualcuno chiude l’uscita e riaccende il camino.', addition: 'Qualcuno chiude l’uscita e riaccende il camino.', objective: 'Impedisci al gruppo di uscire.', owner: 'Sara', tone: 'spades' },
    { badge: 'FINALE', player: 'Marta', card: '♥ 10', label: 'Ultima carta', title: 'Marta collega gli indizi e chiude.', instruction: tutorialFinale, addition: tutorialFinale, objective: 'Fai ricadere la colpa sul padrone.', owner: 'Marta', tone: 'reveal' }
  ];

  const storySoFar = index => {
    const parts = [tutorialOpening, ...tutorialSteps.slice(1, Math.min(index + 1, 4)).map(step => step.addition)];
    if (index === tutorialSteps.length - 1) parts.push(tutorialFinale);
    return parts.filter(Boolean).join(' ');
  };

  const stepMarkup = index => {
    const step = tutorialSteps[index];
    const isFinale = index === tutorialSteps.length - 1;
    const progress = tutorialSteps.map((_, i) => `<span class="${i === index ? 'active' : i < index ? 'done' : ''}"></span>`).join('');
    const suit = step.card.includes(' ') ? step.card.split(' ')[0] : step.card;
    return `<div class="tutorial-v2 tutorial-tone-${step.tone}" data-current-step="${index}"><div class="tutorial-v2-top"><div><p class="eyebrow">${S.esc(step.badge)} · ${S.esc(step.player)}</p><span>Passaggio ${index + 1} di ${tutorialSteps.length}</span></div><div class="tutorial-v2-progress" aria-label="Avanzamento">${progress}</div></div><section class="tutorial-v2-story"><span>STORIA FINORA</span><p>${S.esc(storySoFar(index))}</p></section><div class="tutorial-v2-main"><div class="tutorial-v2-card"><small>${S.esc(step.card)}</small><b>${S.esc(suit)}</b><span>${S.esc(step.label)}</span></div><div class="tutorial-v2-copy"><p class="tutorial-v2-action">COSA SUCCEDE</p><h3>${S.esc(step.title)}</h3><p>${S.esc(step.instruction)}</p>${step.objective && !isFinale ? `<aside class="tutorial-v2-secret"><span>PIANO DI ${S.esc(step.owner).toUpperCase()}</span><b>${S.esc(step.objective)}</b></aside>` : ''}${isFinale ? `<aside class="tutorial-v2-win"><span>OBIETTIVO RAGGIUNTO</span><b>Marta vince</b><p>Il finale usa elementi già introdotti e porta la colpa sul padrone.</p></aside>` : ''}</div></div></div>`;
  };

  const howMarkup = () => `<div class="screen-heading modal-heading"><p class="eyebrow">COME SI GIOCA</p><h2>La storia è il campo di gioco.</h2><p>Gioca una carta, aggiungi una scena coerente e prova a guidare la trama verso il tuo <strong>obiettivo segreto</strong>.</p></div><div class="how-grid modal-grid"><article><span>1</span><b>Crea l’incipit</b><p>Scegli una storia pronta oppure costruisci l’inizio con le carte.</p></article><article><span>2</span><b>Gioca a turno</b><p>Una persona gioca una carta e aggiunge una scena.</p></article><article><span>3</span><b>Nascondi il piano</b><p>Spingi la storia verso il tuo obiettivo senza farti capire.</p></article><article><span>4</span><b>Chiudi la storia</b><p>Usa gli elementi già comparsi per raggiungere il finale.</p></article></div>`;
  const rulesMarkup = () => `<div class="screen-heading modal-heading"><p class="eyebrow">REGOLE</p><h2>Regole del gioco.</h2><p>Ogni carta aggiunge un fatto alla storia. Ogni giocatore cerca di guidarla verso il proprio <strong>obiettivo segreto</strong>.</p></div>${S.rulesMarkup ? S.rulesMarkup() : ''}`;
  const tutorialMarkup = () => `<div class="screen-heading modal-heading tutorial-heading"><p class="eyebrow">COME FUNZIONA</p><h2>Guarda una partita vera.</h2></div><div data-tutorial-host>${stepMarkup(0)}</div><div class="tutorial-actions"><button type="button" class="secondary" data-tutorial-prev disabled>Indietro</button><button type="button" class="primary" data-tutorial-next>Avanti <span aria-hidden="true">→</span></button></div>`;

  const infoMarkup = () => `<div class="creator-editorial"><header class="creator-editorial-hero"><figure class="creator-portrait"><img src="${CREATOR_IMAGE}" alt="Jita DesWadyas" width="800" height="800"></figure><div><p class="eyebrow">DIETRO E POI?</p><h2>Una storia condivisa.<br>Più piani nascosti.</h2><p><strong>E POI?</strong> nasce da un normale mazzo di carte e da un’idea precisa: tutti costruiscono la stessa storia, ma nessuno vuole portarla nello stesso punto.</p></div></header><section class="creator-manifesto"><div><p class="eyebrow">IL PUNTO</p><h3>Non un generatore di storie. Un gioco di intenzioni.</h3></div><p>Le carte impongono un tipo di scena. Gli obiettivi segreti creano il conflitto. Il divertimento arriva quando una frase sembra innocente, ma in realtà sta preparando il finale di qualcuno.</p></section><section class="creator-profile-pro"><img src="${CREATOR_IMAGE}" alt="Jita DesWadyas" width="800" height="800"><div><p class="eyebrow">CREATO DA</p><h3>Jita DesWadyas</h3><p class="creator-role">Sviluppatore · game designer · autore indipendente</p><p>Creo giochi, strumenti web e mondi narrativi. Con JitaDiSwadya porto lo stesso approccio nella musica: io canto le storie, tu le immagini.</p><div class="creator-links"><a href="https://github.com/JitaDesWadyas" target="_blank" rel="noopener noreferrer">GitHub <span aria-hidden="true">↗</span></a><span>JitaDiSwadya · Italia</span></div></div></section><section class="creator-roadmap-pro"><div><p class="eyebrow">DIREZIONE</p><h3>Prima deve funzionare in una serata vera.</h3><p>La web app prepara la partita, distribuisce gli obiettivi e toglie attrito. Le storie verranno migliorate con test reali; la versione fisica viene dopo.</p></div><ol><li class="done"><b>01</b><span>Idea e regole</span></li><li class="done"><b>02</b><span>Web app</span></li><li class="current"><b>03</b><span>Test pubblici</span></li><li><b>04</b><span>Nuove storie</span></li><li><b>05</b><span>Mazzo fisico</span></li></ol></section><footer class="creator-legal-links"><a href="privacy.html" target="_blank" rel="noopener">Privacy</a><a href="copyright.html" target="_blank" rel="noopener">Copyright e crediti</a><span>© 2026 Jita DesWadyas</span></footer></div>`;

  S.homeMarkup = () => {
    const saved = S.load();
    return `<section class="surface hero product-hero"><div class="hero-copy"><div class="hero-kicker"><p class="eyebrow">GIOCO NARRATIVO · CARTE · OBIETTIVI SEGRETI</p></div><h2 class="hero-title"><span class="line">Un gioco che mette alla prova</span><span class="line line-accent">creatività e immaginazione,</span><span class="line line-final">improvvisando.</span></h2><p class="hero-intro">Aggiungi una scena seguendo le carte. Mentre la storia prende forma, prova a guidarla verso il tuo <strong>obiettivo segreto</strong> senza farti scoprire.</p><div class="hero-divider" aria-hidden="true"><span>Una storia · più piani</span></div></div><div class="hero-actions"><button type="button" class="primary" data-home-play><span class="button-icon" aria-hidden="true">?</span><span>Gioca ora</span><span class="button-arrow" aria-hidden="true">→</span></button><button type="button" class="secondary" data-open-panel="tutorial"><span class="button-icon" aria-hidden="true">▶</span><span>Guarda come funziona</span><span class="button-arrow" aria-hidden="true">↗</span></button></div></section><div class="home-divider" aria-hidden="true"><span>✦</span></div><div class="home-grid product-menu compact-product-menu">${saved ? `<button type="button" class="resume-card" data-home-resume><span class="index">↻</span><span><b>Riprendi la partita</b><small>${S.esc(S.sourceLabel(saved))} · ${saved.count || 0} giocatori</small></span><i>→</i></button>` : ''}<button type="button" class="choice-card" data-open-panel="how"><span class="index">?</span><span><b>Inizia da qui</b><small>Il gioco spiegato in 2 minuti.</small></span><i>→</i></button><button type="button" class="choice-card" data-open-panel="rules"><span class="index">📖</span><span><b>Le regole complete</b><small>Tutte le meccaniche, quando ti servono.</small></span><i>→</i></button><button type="button" class="choice-card creator-menu-card" data-open-panel="info"><span class="creator-menu-image" aria-hidden="true"><img src="${CREATOR_IMAGE}" alt="" width="800" height="800"></span><span><b>Dietro E POI?</b><small>Perché esiste, chi l’ha creato e dove vuole arrivare.</small></span><i>→</i></button></div>`;
  };

  S.bindTutorialIn = root => {
    let index = 0;
    const host = root.querySelector('[data-tutorial-host]');
    const prev = root.querySelector('[data-tutorial-prev]');
    const next = root.querySelector('[data-tutorial-next]');
    if (!host || !prev || !next) return;
    const render = direction => {
      host.classList.remove('tutorial-swap-forward', 'tutorial-swap-back'); void host.offsetWidth;
      host.classList.add(direction === 'back' ? 'tutorial-swap-back' : 'tutorial-swap-forward');
      host.innerHTML = stepMarkup(index);
      prev.disabled = index === 0;
      next.innerHTML = index === tutorialSteps.length - 1 ? 'Ricomincia <span aria-hidden="true">↻</span>' : 'Avanti <span aria-hidden="true">→</span>';
    };
    const goTo = (nextIndex, direction = 'forward') => { index = Math.max(0, Math.min(tutorialSteps.length - 1, nextIndex)); render(direction); };
    prev.addEventListener('click', () => goTo(index - 1, 'back'));
    next.addEventListener('click', () => goTo(index >= tutorialSteps.length - 1 ? 0 : index + 1, index >= tutorialSteps.length - 1 ? 'back' : 'forward'));
    root.addEventListener('keydown', event => { if (event.key === 'ArrowRight') goTo(index >= tutorialSteps.length - 1 ? 0 : index + 1, 'forward'); if (event.key === 'ArrowLeft') goTo(index - 1, 'back'); });
  };

  S.openHomePanel = panel => {
    const panels = { how: ['Come si gioca', howMarkup()], rules: ['Regole', rulesMarkup()], tutorial: ['Come funziona', tutorialMarkup()], info: ['Dietro E POI?', infoMarkup()] };
    const selected = panels[panel]; if (!selected) return;
    const modal = S.modal(selected[0], selected[1], { wide: true, className: `product-modal product-modal-${panel}` });
    if (panel === 'tutorial') S.bindTutorialIn(modal.host);
    if (panel === 'rules') S.bindRulebook?.(modal.host);
  };
  S.bindHomeNavigation = () => { S.play.querySelectorAll('[data-open-panel]').forEach(button => button.addEventListener('click', () => S.openHomePanel(button.dataset.openPanel))); };
  S.renderHome = () => { S.currentSession = null; S.mount(S.homeMarkup(), { session: false }); S.play.querySelectorAll('[data-home-play]').forEach(button => button.addEventListener('click', () => S.renderSetup('play'))); S.play.querySelector('[data-home-resume]')?.addEventListener('click', () => S.resume(S.load())); S.bindHomeNavigation(); };
})();
