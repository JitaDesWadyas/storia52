'use strict';

(() => {
  const S = window.S52;
  const CREATOR_PHOTO = window.S52_CREATOR_PHOTO || 'creator-jita.svg';

  const tutorialOpening = 'Durante una festa in una villa isolata, la corrente salta. Quando le luci tornano, dal salone è sparito un quadro che nessuno avrebbe dovuto conoscere.';

  const tutorialSteps = [
    {
      badge: 'INIZIO',
      player: 'La storia',
      suit: 'start',
      card: '?',
      label: 'Un solo incipit',
      title: 'Tutti partono dalla stessa scena.',
      instruction: 'Ogni giocatore riceve un obiettivo segreto. Nessuno sa cosa vogliono ottenere gli altri.',
      addition: '',
      objective: 'Fai ricadere la colpa sul padrone di casa.',
      objectiveOwner: 'Marta',
      tone: 'neutral'
    },
    {
      badge: 'TURNO 1',
      player: 'Marta',
      suit: 'clubs',
      card: '♣ 8',
      label: 'Azione',
      title: 'Marta manda avanti la storia.',
      instruction: 'Con Fiori, un personaggio agisce. Marta deve anche avvicinarsi al proprio obiettivo senza renderlo evidente.',
      addition: 'Il padrone di casa chiude tutte le porte e ordina agli invitati di consegnargli i telefoni.',
      objective: 'Fai ricadere la colpa sul padrone di casa.',
      objectiveOwner: 'Marta',
      tone: 'clubs'
    },
    {
      badge: 'TURNO 2',
      player: 'Luca',
      suit: 'diamonds',
      card: '♦ J',
      label: 'Scoperta',
      title: 'Luca aggiunge una nuova informazione.',
      instruction: 'Con Quadri emerge qualcosa che prima non si sapeva. La scena precedente resta vera: la storia continua da lì.',
      addition: 'Una ragazza trova nel camino una fotografia bruciata: ritrae il quadro nella stessa villa, molti anni prima.',
      objective: 'Rivela che il quadro nasconde un segreto di famiglia.',
      objectiveOwner: 'Luca',
      tone: 'diamonds'
    },
    {
      badge: 'TURNO 3',
      player: 'Sara',
      suit: 'spades',
      card: '♠ 5',
      label: 'Ostacolo',
      title: 'Sara complica la situazione.',
      instruction: 'Con Picche accade qualcosa che rende tutto più difficile. Non serve chiudere subito la scena: basta lasciare agli altri qualcosa da continuare.',
      addition: 'Prima che possano esaminare la fotografia, qualcuno riaccende il camino e blocca la porta del salone dall’esterno.',
      objective: 'Impedisci al gruppo di lasciare la villa.',
      objectiveOwner: 'Sara',
      tone: 'spades'
    },
    {
      badge: 'FINALE',
      player: 'Obiettivi svelati',
      suit: 'reveal',
      card: '◎',
      label: 'Tre piani',
      title: 'Ora si capisce perché ognuno ha giocato così.',
      instruction: 'Le scene erano coerenti tra loro, ma ogni giocatore le spingeva verso un finale diverso.',
      addition: '',
      objective: '',
      objectiveOwner: '',
      tone: 'reveal'
    }
  ];

  const storyMarkup = index => {
    const sceneSteps = tutorialSteps.slice(1, 4);
    return `<section class="tutorial-storyboard" aria-live="polite">
      <div class="tutorial-opening"><span>INCIPIT</span><p>${S.esc(tutorialOpening)}</p></div>
      <div class="tutorial-scene-reel">
        ${sceneSteps.map((step, sceneIndex) => {
          const unlocked = index > sceneIndex;
          const active = index === sceneIndex + 1;
          return `<article class="tutorial-scene-slot tutorial-scene-${step.tone}${unlocked ? ' is-filled' : ''}${active ? ' is-current' : ''}" style="--scene-delay:${sceneIndex * 70}ms">
            <span>${unlocked ? S.esc(step.card) : String(sceneIndex + 1).padStart(2, '0')}</span>
            <div><small>${unlocked ? S.esc(step.player) : 'PROSSIMA SCENA'}</small><p>${unlocked ? S.esc(step.addition) : 'La storia resta ferma finché non entra una nuova carta.'}</p></div>
          </article>`;
        }).join('')}
      </div>
    </section>`;
  };

  const revealMarkup = () => `<div class="tutorial-reveal-grid">
    ${tutorialSteps.slice(1, 4).map(step => `<article class="tutorial-reveal-card tutorial-reveal-${step.tone}"><div><span>${S.esc(step.card)}</span><b>${S.esc(step.player)}</b></div><p>${S.esc(step.objective)}</p><small>${S.esc(step.label)}</small></article>`).join('')}
  </div>`;

  const stepMarkup = index => {
    const step = tutorialSteps[index];
    const progress = tutorialSteps.map((item, i) => `<button type="button" class="${i === index ? 'active' : i < index ? 'done' : ''}" data-tutorial-step="${i}" aria-label="Vai a ${S.esc(item.badge)}" aria-current="${i === index ? 'step' : 'false'}"><span></span></button>`).join('');
    const isReveal = index === tutorialSteps.length - 1;

    return `<div class="tutorial-experience is-step-${index} tutorial-tone-${step.tone}" data-current-step="${index}">
      <div class="tutorial-topline"><p class="eyebrow">${S.esc(step.badge)} · ${S.esc(step.player)}</p><div class="tutorial-progress" aria-label="Avanzamento tutorial">${progress}</div></div>
      <div class="tutorial-frame">
        <section class="tutorial-stage">
          <aside class="tutorial-play-card" aria-label="Carta giocata: ${S.esc(step.card)}">
            <span class="tutorial-card-corner">${S.esc(step.card)}</span>
            <strong>${S.esc(step.label)}</strong>
            <span class="tutorial-card-suit">${S.esc(step.card.split(' ')[0])}</span>
          </aside>
          <div class="tutorial-copy">
            <h3>${S.esc(step.title)}</h3>
            <p>${S.esc(step.instruction)}</p>
            ${!isReveal && step.objective ? `<div class="tutorial-secret"><span>OBIETTIVO SEGRETO DI ${S.esc(step.objectiveOwner).toUpperCase()}</span><p>${S.esc(step.objective)}</p><i>Solo ${S.esc(step.objectiveOwner)} lo vede</i></div>` : ''}
            ${isReveal ? revealMarkup() : ''}
          </div>
        </section>
        ${storyMarkup(index)}
      </div>
    </div>`;
  };

  const howMarkup = () => `<div class="screen-heading modal-heading"><p class="eyebrow">COME SI GIOCA</p><h2>La storia è il campo di gioco.</h2><p>Non devi scrivere un romanzo: devi <strong>reagire alle carte</strong>, improvvisare una scena coerente e spingere la trama verso il tuo <span class="amber-text">obiettivo segreto</span>.</p></div><div class="how-grid modal-grid"><article><span>1</span><b>Crea l'incipit</b><p>Scegli una storia pronta oppure costruisci l'inizio con le carte.</p></article><article><span>2</span><b>Gioca una carta</b><p>Il seme e il valore decidono che tipo di scena devi aggiungere.</p></article><article><span>3</span><b>Aggiungi una scena</b><p>Continua ciò che esiste già. Non cancellare, fai evolvere.</p></article><article><span>4</span><b>Nascondi il tuo piano</b><p>Ogni giocatore punta al proprio obiettivo senza scoprirsi troppo.</p></article><article><span>5</span><b>Chiudi il finale</b><p>Quando puoi, rivela l'obiettivo e dimostra che il finale regge.</p></article></div>`;

  const rulesMarkup = () => `<div class="screen-heading modal-heading"><p class="eyebrow">REGOLE</p><h2>Regole complete, senza muro di testo.</h2><p>Apri una sezione alla volta. <strong>Ogni carta aggiunge un fatto</strong>; ogni giocatore prova a portare la storia dalla propria parte.</p></div>${S.rulesMarkup ? S.rulesMarkup() : ''}`;

  const tutorialMarkup = () => `<div class="screen-heading modal-heading tutorial-heading"><p class="eyebrow">TUTORIAL INTERATTIVO</p><h2>Guarda una partita prendere forma.</h2><p>Tre giocatori, una sola storia e tre obiettivi che nessun altro può vedere.</p></div><div data-tutorial-host>${stepMarkup(0)}</div><div class="tutorial-actions"><button type="button" class="secondary" data-tutorial-prev disabled>Indietro</button><button type="button" class="secondary tutorial-autoplay" data-tutorial-play aria-pressed="false"><span aria-hidden="true">▶</span> Riproduci</button><button type="button" class="primary" data-tutorial-next>Inizia <span aria-hidden="true">→</span></button></div>`;

  const infoMarkup = () => `<div class="screen-heading modal-heading creator-heading"><p class="eyebrow">DIETRO E POI?</p><h2>Un gioco semplice da aprire, difficile da prevedere.</h2><p>La web app serve a provare il cuore del gioco: <strong>come cambia una storia quando ogni persona la vuole portare da un'altra parte</strong>.</p></div>
    <div class="creator-story-layout">
      <article class="creator-identity-card">
        <div class="creator-visual">
          <div class="creator-photo-frame"><img data-creator-photo src="${CREATOR_PHOTO}" alt="Jita DesWadyas, creatore di E POI?"><img class="creator-photo-fallback" src="storia52-cards-logo.svg" alt="" aria-hidden="true"></div>
          <div class="creator-card-mark" aria-hidden="true"><span>♥</span><span>♠</span><b>?</b></div>
        </div>
        <div class="creator-identity-copy"><p class="eyebrow">CREATO DA</p><h3>Jita DesWadyas</h3><span>JitaDiSwadya · Italia</span><p>Ho costruito <strong>E POI?</strong> per far giocare anche chi non ama regolamenti pesanti o giochi narrativi da “esperti”. Servono carte, immaginazione e la voglia di sorprendere gli altri.</p></div>
      </article>
      <section class="creator-principles" aria-label="Principi del gioco">
        <article><span>01</span><div><b>Immediato</b><p>Si capisce giocando. Le carte dicono che tipo di scena aggiungere.</p></div></article>
        <article><span>02</span><div><b>Competitivo senza punti</b><p>Non devi fare il punteggio più alto: devi far arrivare la storia al tuo finale.</p></div></article>
        <article><span>03</span><div><b>Ogni partita cambia</b><p>La stessa storia può diventare comica, tesa o assurda in base alle persone al tavolo.</p></div></article>
      </section>
      <section class="creator-roadmap-board">
        <div><p class="eyebrow">DA PROTOTIPO A GIOCO</p><h3>La direzione è concreta.</h3><p>Prima si sistema il ritmo della web app. Poi arrivano più storie, modalità online più solide e, se il gioco funziona davvero, un mazzo fisico con identità propria.</p></div>
        <ol><li class="done"><span></span><b>Web app giocabile</b><small>Base pronta</small></li><li class="current"><span></span><b>Test e rifinitura</b><small>Adesso</small></li><li><span></span><b>Più contenuti</b><small>Prossimo passo</small></li><li><span></span><b>Mazzo fisico</b><small>Obiettivo</small></li></ol>
      </section>
    </div>`;

  S.homeMarkup = () => {
    const saved = S.load();
    return `<section class="surface hero product-hero">
      <div class="hero-copy">
        <div class="hero-kicker"><p class="eyebrow">GIOCO NARRATIVO · CARTE · OBIETTIVI SEGRETI</p></div>
        <h2 class="hero-title">
          <span class="line">Un gioco che mette alla prova</span>
          <span class="line line-accent">creatività e immaginazione,</span>
          <span class="line line-final">improvvisando.</span>
        </h2>
        <p class="hero-intro">Aggiungi una scena seguendo le carte. Mentre la storia prende forma, prova a guidarla verso il tuo <strong>obiettivo segreto</strong> senza farti scoprire.</p>
        <div class="hero-divider" aria-hidden="true"><span>Una storia · più piani</span></div>
      </div>
      <div class="hero-actions">
        <button type="button" class="primary" data-home-play><span class="button-icon" aria-hidden="true">?</span><span>Gioca ora</span><span class="button-arrow" aria-hidden="true">→</span></button>
        <button type="button" class="secondary" data-open-panel="tutorial"><span class="button-icon" aria-hidden="true">▶</span><span>Guarda il tutorial</span><span class="button-arrow" aria-hidden="true">↗</span></button>
      </div>
    </section>

    <div class="home-divider" aria-hidden="true"><span>✦</span></div>

    <div class="home-grid product-menu compact-product-menu">
      ${saved ? `<button type="button" class="resume-card" data-home-resume><span class="index">↻</span><span><b>Riprendi la partita</b><small>${S.esc(S.sourceLabel(saved))} · ${saved.count || 0} giocatori</small></span><i>→</i></button>` : ''}
      <button type="button" class="choice-card" data-open-panel="how"><span class="index">?</span><span><b>Inizia da qui</b><small>Il gioco spiegato in 2 minuti.</small></span><i>→</i></button>
      <button type="button" class="choice-card" data-open-panel="rules"><span class="index">📖</span><span><b>Le regole complete</b><small>Tutte le meccaniche, quando ti servono.</small></span><i>→</i></button>
      <button type="button" class="choice-card creator-menu-card" data-open-panel="info"><span class="creator-menu-image" aria-hidden="true"><img src="storia52-cards-logo.svg" alt=""></span><span><b>Dietro E POI?</b><small>Perché esiste, chi lo crea e dove vuole arrivare.</small></span><i>→</i></button>
    </div>`;
  };

  S.bindTutorialIn = root => {
    let index = 0;
    let autoplayTimer = null;
    const host = root.querySelector('[data-tutorial-host]');
    const prev = root.querySelector('[data-tutorial-prev]');
    const next = root.querySelector('[data-tutorial-next]');
    const play = root.querySelector('[data-tutorial-play]');
    if (!host || !prev || !next || !play) return;

    const stopAutoplay = () => {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
      play.setAttribute('aria-pressed', 'false');
      play.innerHTML = '<span aria-hidden="true">▶</span> Riproduci';
    };

    const render = direction => {
      host.classList.remove('tutorial-swap-forward', 'tutorial-swap-back');
      void host.offsetWidth;
      host.classList.add(direction === 'back' ? 'tutorial-swap-back' : 'tutorial-swap-forward');
      host.innerHTML = stepMarkup(index);
      prev.disabled = index === 0;
      if (index === 0) next.innerHTML = 'Inizia <span aria-hidden="true">→</span>';
      else if (index === tutorialSteps.length - 1) next.innerHTML = 'Rivedi <span aria-hidden="true">↻</span>';
      else next.innerHTML = 'Prossimo turno <span aria-hidden="true">→</span>';
      if (index === tutorialSteps.length - 1 && autoplayTimer) stopAutoplay();
    };

    const goTo = (nextIndex, direction = 'forward') => {
      index = Math.max(0, Math.min(tutorialSteps.length - 1, nextIndex));
      render(direction);
    };

    prev.addEventListener('click', () => goTo(index - 1, 'back'));
    next.addEventListener('click', () => goTo(index >= tutorialSteps.length - 1 ? 0 : index + 1, 'forward'));
    play.addEventListener('click', () => {
      if (autoplayTimer) { stopAutoplay(); return; }
      play.setAttribute('aria-pressed', 'true');
      play.innerHTML = '<span aria-hidden="true">Ⅱ</span> Pausa';
      if (index === tutorialSteps.length - 1) goTo(0, 'back');
      autoplayTimer = setInterval(() => goTo(index + 1, 'forward'), 3800);
    });
    host.addEventListener('click', event => {
      const target = event.target.closest('[data-tutorial-step]');
      if (!target) return;
      const targetIndex = Number(target.dataset.tutorialStep);
      goTo(targetIndex, targetIndex < index ? 'back' : 'forward');
    });
    root.addEventListener('keydown', event => {
      if (event.key === 'ArrowRight') goTo(index >= tutorialSteps.length - 1 ? 0 : index + 1, 'forward');
      if (event.key === 'ArrowLeft') goTo(index - 1, 'back');
    });
  };

  S.openHomePanel = panel => {
    const panels = {
      how: ['Come si gioca', howMarkup()],
      rules: ['Regole', rulesMarkup()],
      tutorial: ['Tutorial', tutorialMarkup()],
      info: ['Info e creatore', infoMarkup()]
    };
    const selected = panels[panel];
    if (!selected) return;
    const modal = S.modal(selected[0], selected[1], { wide: true, className: `product-modal product-modal-${panel}` });
    if (panel === 'tutorial') S.bindTutorialIn(modal.host);
    if (panel === 'rules') S.bindRulebook?.(modal.host);
    if (panel === 'info') S.bindCreatorMedia?.(modal.host);
  };

  S.bindHomeNavigation = () => {
    S.play.querySelectorAll('[data-open-panel]').forEach(button => button.addEventListener('click', () => S.openHomePanel(button.dataset.openPanel)));
  };

  S.renderHome = () => {
    S.currentSession = null;
    S.mount(S.homeMarkup(), { session: false });
    S.play.querySelectorAll('[data-home-play]').forEach(button => button.addEventListener('click', () => S.renderSetup('play')));
    S.play.querySelector('[data-home-resume]')?.addEventListener('click', () => S.resume(S.load()));
    S.bindHomeNavigation();
  };
})();
