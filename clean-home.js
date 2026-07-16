'use strict';

(() => {
  const S = window.S52;
  const CREATOR_IMAGE = 'creator-jita.svg';

  const tutorialOpening = 'Durante una festa in una villa isolata, sparisce un quadro.';
  const tutorialFinale = 'Dietro la foto compare il padrone mentre nasconde il quadro: aveva organizzato il furto per incassare l’assicurazione.';

  const tutorialSteps = [
    { badge: 'INIZIO', player: 'Tre giocatori', card: '?', label: 'Obiettivi segreti', title: 'Una storia. Tre finali diversi.', instruction: 'Si gioca a turno, una persona alla volta. Marta, Luca e Sara ricevono un obiettivo che gli altri non vedono.', addition: '', objective: '', objectiveOwner: '', tone: 'neutral' },
    { badge: 'TURNO 1', player: 'Marta', card: '♣ 8', label: 'Azione', title: 'Marta fa agire un personaggio.', instruction: 'Il padrone chiude le porte e ritira i telefoni.', addition: 'Il padrone chiude le porte e ritira i telefoni.', objective: 'Fai ricadere la colpa sul padrone.', objectiveOwner: 'Marta', tone: 'clubs' },
    { badge: 'TURNO 2', player: 'Luca', card: '♦ J', label: 'Scoperta', title: 'Luca aggiunge un indizio.', instruction: 'Una foto bruciata collega il quadro alla villa.', addition: 'Una foto bruciata collega il quadro alla villa.', objective: 'Rivela un segreto di famiglia.', objectiveOwner: 'Luca', tone: 'diamonds' },
    { badge: 'TURNO 3', player: 'Sara', card: '♠ 5', label: 'Ostacolo', title: 'Sara rende tutto più difficile.', instruction: 'Qualcuno blocca la porta e riaccende il camino.', addition: 'Qualcuno blocca la porta e riaccende il camino.', objective: 'Impedisci al gruppo di uscire.', objectiveOwner: 'Sara', tone: 'spades' },
    { badge: 'FINALE', player: 'Marta', card: '♥ 10', label: 'Ultima carta', title: 'Marta collega tutto e prova a chiudere.', instruction: tutorialFinale, addition: tutorialFinale, objective: 'Fai ricadere la colpa sul padrone.', objectiveOwner: 'Marta', tone: 'reveal' }
  ];

  const storyMarkup = index => {
    const sceneSteps = tutorialSteps.slice(1, 4);
    const showFinale = index === tutorialSteps.length - 1;
    return `<section class="tutorial-storyboard" aria-label="Storia costruita durante la partita"><div class="tutorial-opening"><span>INCIPIT</span><p>${S.esc(tutorialOpening)}</p></div><div class="tutorial-scene-reel">${sceneSteps.map((step, sceneIndex) => {
      const unlocked = index > sceneIndex;
      const active = index === sceneIndex + 1;
      return `<article class="tutorial-scene-slot${unlocked ? ' is-filled' : ''}${active ? ' is-current' : ''}"><span>${unlocked ? S.esc(step.card) : '·'}</span><p>${unlocked ? S.esc(step.addition) : 'La prossima carta aggiunge una scena.'}</p></article>`;
    }).join('')}</div>${showFinale ? `<div class="tutorial-final-line"><span>FINALE</span><p>${S.esc(tutorialFinale)}</p></div>` : ''}</section>`;
  };

  const revealMarkup = () => `<div class="tutorial-result"><span>OBIETTIVO RAGGIUNTO</span><b>Marta vince</b><p>Il finale usa gli indizi già comparsi e porta la colpa sul padrone senza cancellare le scene precedenti.</p></div>`;

  const stepMarkup = index => {
    const step = tutorialSteps[index];
    const progress = tutorialSteps.map((item, i) => `<span class="${i === index ? 'active' : i < index ? 'done' : ''}" aria-label="${S.esc(item.badge)}"></span>`).join('');
    const isReveal = index === tutorialSteps.length - 1;
    return `<div class="tutorial-experience tutorial-tone-${step.tone}" data-current-step="${index}"><div class="tutorial-topline"><p class="eyebrow">${S.esc(step.badge)} · ${S.esc(step.player)}</p><div class="tutorial-progress" aria-label="Avanzamento">${progress}</div></div><div class="tutorial-frame">${storyMarkup(index)}<section class="tutorial-stage"><aside class="tutorial-play-card" aria-label="Carta: ${S.esc(step.card)}"><span class="tutorial-card-corner">${S.esc(step.card)}</span><span class="tutorial-card-suit">${S.esc(step.card.split(' ')[0])}</span><strong>${S.esc(step.label)}</strong></aside><div class="tutorial-copy"><h3>${S.esc(step.title)}</h3><p>${S.esc(step.instruction)}</p>${!isReveal && step.objective ? `<div class="tutorial-secret"><span>OBIETTIVO DI ${S.esc(step.objectiveOwner).toUpperCase()}</span><p>${S.esc(step.objective)}</p></div>` : ''}${isReveal ? revealMarkup() : ''}</div></section></div></div>`;
  };

  const howMarkup = () => `<div class="screen-heading modal-heading"><p class="eyebrow">COME SI GIOCA</p><h2>La storia è il campo di gioco.</h2><p>Reagisci alle carte, aggiungi una scena coerente e prova a guidare la trama verso il tuo <strong>obiettivo segreto</strong>.</p></div><div class="how-grid modal-grid"><article><span>1</span><b>Crea l'incipit</b><p>Scegli una storia pronta oppure costruisci l'inizio con le carte.</p></article><article><span>2</span><b>Gioca a turno</b><p>Una persona alla volta gioca una carta e aggiunge una scena.</p></article><article><span>3</span><b>Continua la storia</b><p>Usa ciò che esiste già e aggiungi un nuovo fatto.</p></article><article><span>4</span><b>Nascondi il piano</b><p>Spingi la storia verso il tuo obiettivo senza farti capire.</p></article><article><span>5</span><b>Prova il finale</b><p>Rivela l'obiettivo e chiudi usando gli elementi comparsi.</p></article></div>`;
  const rulesMarkup = () => `<div class="screen-heading modal-heading"><p class="eyebrow">REGOLE</p><h2>Regole del gioco.</h2><p>Ogni carta aggiunge un fatto alla storia. Ogni giocatore cerca di guidarla verso il proprio <strong>obiettivo segreto</strong>.</p></div>${S.rulesMarkup ? S.rulesMarkup() : ''}`;
  const tutorialMarkup = () => `<div class="screen-heading modal-heading tutorial-heading"><p class="eyebrow">COME FUNZIONA</p><h2>Una partita in pochi passaggi.</h2></div><div data-tutorial-host>${stepMarkup(0)}</div><div class="tutorial-actions"><button type="button" class="secondary" data-tutorial-prev disabled>Indietro</button><button type="button" class="primary" data-tutorial-next>Avanti <span aria-hidden="true">→</span></button></div>`;

  const infoMarkup = () => `<div class="creator-editorial"><header class="creator-editorial-hero"><div><p class="eyebrow">DIETRO E POI?</p><h2>Una storia condivisa.<br>Dieci piani nascosti.</h2><p><strong>E POI?</strong> nasce da un’idea semplice: usare un normale mazzo di carte per creare conflitto narrativo senza manuali pesanti, schede o preparazione infinita.</p></div><img src="${CREATOR_IMAGE}" alt="Illustrazione del creatore Jita DesWadyas" width="800" height="800"></header><section class="creator-manifesto"><p class="eyebrow">IL PUNTO DI PARTENZA</p><h3>Non serviva un altro gioco per “raccontare una storia”.</h3><p>Serviva un gioco in cui tutti continuano <strong>la stessa storia</strong>, ma ognuno prova in segreto a portarla da un’altra parte. Le carte danno limiti chiari. Gli obiettivi segreti danno il motivo per discutere, improvvisare e sorprendersi.</p></section><div class="creator-principles"><article><span>01</span><h3>Si capisce subito</h3><p>Un mazzo comune, quattro semi, un’azione per turno. Nessun gergo da gioco di ruolo.</p></article><article><span>02</span><h3>Conta quello che dici</h3><p>Ogni scena deve usare ciò che esiste già. Non si può cancellare la storia quando non conviene.</p></article><article><span>03</span><h3>Il conflitto resta nascosto</h3><p>Tutti collaborano alla trama, ma nessuno conosce il finale che gli altri stanno cercando.</p></article></div><section class="creator-profile-pro"><img src="${CREATOR_IMAGE}" alt="Marchio personale di Jita DesWadyas" width="800" height="800"><div><p class="eyebrow">CREATO DA</p><h3>Jita DesWadyas</h3><p class="creator-role">Sviluppatore · game designer · autore indipendente</p><p>Creo giochi, strumenti web e mondi narrativi. Con <strong>JitaDiSwadya</strong> porto lo stesso approccio nella musica: io canto le storie, tu le immagini.</p><div class="creator-links"><a href="https://github.com/JitaDesWadyas" target="_blank" rel="noopener noreferrer">GitHub <span aria-hidden="true">↗</span></a><span>JitaDiSwadya · Italia</span></div></div></section><section class="creator-roadmap-pro"><div><p class="eyebrow">DIREZIONE</p><h3>Prima deve reggere una serata vera.</h3><p>La web app serve a togliere attrito: prepara la partita, distribuisce gli obiettivi e spiega le regole. Il passo successivo è migliorare le storie con partite reali; solo dopo ha senso una versione fisica completa.</p></div><ol><li class="done"><b>01</b><span>Idea e regole</span></li><li class="done"><b>02</b><span>Web app</span></li><li class="current"><b>03</b><span>Test pubblici</span></li><li><b>04</b><span>Nuove storie</span></li><li><b>05</b><span>Mazzo fisico</span></li></ol></section><footer class="creator-legal-links"><a href="privacy.html" target="_blank" rel="noopener">Privacy</a><a href="copyright.html" target="_blank" rel="noopener">Copyright e crediti</a><span>© 2026 Jita DesWadyas</span></footer></div>`;

  S.homeMarkup = () => {
    const saved = S.load();
    return `<section class="surface hero product-hero"><div class="hero-copy"><div class="hero-kicker"><p class="eyebrow">GIOCO NARRATIVO · CARTE · OBIETTIVI SEGRETI</p></div><h2 class="hero-title"><span class="line">Un gioco che mette alla prova</span><span class="line line-accent">creatività e immaginazione,</span><span class="line line-final">improvvisando.</span></h2><p class="hero-intro">Aggiungi una scena seguendo le carte. Mentre la storia prende forma, prova a guidarla verso il tuo <strong>obiettivo segreto</strong> senza farti scoprire.</p><div class="hero-divider" aria-hidden="true"><span>Una storia · più piani</span></div></div><div class="hero-actions"><button type="button" class="primary" data-home-play><span class="button-icon" aria-hidden="true">?</span><span>Gioca ora</span><span class="button-arrow" aria-hidden="true">→</span></button><button type="button" class="secondary" data-open-panel="tutorial"><span class="button-icon" aria-hidden="true">▶</span><span>Guarda come funziona</span><span class="button-arrow" aria-hidden="true">↗</span></button></div></section><div class="home-divider" aria-hidden="true"><span>✦</span></div><div class="home-grid product-menu compact-product-menu">${saved ? `<button type="button" class="resume-card" data-home-resume><span class="index">↻</span><span><b>Riprendi la partita</b><small>${S.esc(S.sourceLabel(saved))} · ${saved.count || 0} giocatori</small></span><i>→</i></button>` : ''}<button type="button" class="choice-card" data-open-panel="how"><span class="index">?</span><span><b>Inizia da qui</b><small>Il gioco spiegato in 2 minuti.</small></span><i>→</i></button><button type="button" class="choice-card" data-open-panel="rules"><span class="index">📖</span><span><b>Le regole complete</b><small>Tutte le meccaniche, quando ti servono.</small></span><i>→</i></button><button type="button" class="choice-card creator-menu-card" data-open-panel="info"><span class="creator-menu-image" aria-hidden="true"><img src="creator-jita.svg" alt="" width="800" height="800"></span><span><b>Dietro E POI?</b><small>Perché esiste, chi l’ha creato e dove vuole arrivare.</small></span><i>→</i></button></div>`;
  };

  S.bindTutorialIn = root => {
    let index = 0;
    const host = root.querySelector('[data-tutorial-host]');
    const prev = root.querySelector('[data-tutorial-prev]');
    const next = root.querySelector('[data-tutorial-next]');
    if (!host || !prev || !next) return;
    const render = direction => {
      host.classList.remove('tutorial-swap-forward', 'tutorial-swap-back'); void host.offsetWidth;
      host.classList.add(direction === 'back' ? 'tutorial-swap-back' : 'tutorial-swap-forward'); host.innerHTML = stepMarkup(index);
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
