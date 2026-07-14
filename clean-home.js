'use strict';

(() => {
  const S = window.S52;
  const CREATOR_PHOTO = 'https://avatars.githubusercontent.com/u/167089111?v=4';

  const tutorialOpening = 'Durante una festa in una villa isolata, sparisce un quadro.';

  const tutorialSteps = [
    {
      badge: 'INIZIO',
      player: 'Tre giocatori',
      card: '?',
      label: 'Obiettivi segreti',
      title: 'Una storia. Tre finali diversi.',
      instruction: 'Marta, Luca e Sara ricevono un obiettivo che gli altri non vedono.',
      addition: '',
      objective: '',
      objectiveOwner: '',
      tone: 'neutral'
    },
    {
      badge: 'TURNO 1',
      player: 'Marta',
      card: '♣ 8',
      label: 'Azione',
      title: 'Marta fa agire un personaggio.',
      instruction: 'Il padrone chiude le porte e ritira i telefoni.',
      addition: 'Il padrone chiude le porte e ritira i telefoni.',
      objective: 'Fai ricadere la colpa sul padrone.',
      objectiveOwner: 'Marta',
      tone: 'clubs'
    },
    {
      badge: 'TURNO 2',
      player: 'Luca',
      card: '♦ J',
      label: 'Scoperta',
      title: 'Luca aggiunge un indizio.',
      instruction: 'Una foto bruciata collega il quadro alla villa.',
      addition: 'Una foto bruciata collega il quadro alla villa.',
      objective: 'Rivela un segreto di famiglia.',
      objectiveOwner: 'Luca',
      tone: 'diamonds'
    },
    {
      badge: 'TURNO 3',
      player: 'Sara',
      card: '♠ 5',
      label: 'Ostacolo',
      title: 'Sara rende tutto più difficile.',
      instruction: 'Qualcuno blocca la porta e riaccende il camino.',
      addition: 'Qualcuno blocca la porta e riaccende il camino.',
      objective: 'Impedisci al gruppo di uscire.',
      objectiveOwner: 'Sara',
      tone: 'spades'
    },
    {
      badge: 'FINALE',
      player: 'Obiettivi svelati',
      card: '◎',
      label: 'Tre piani',
      title: 'Le intenzioni diventano chiare.',
      instruction: 'Ogni scena era coerente, ma spingeva la storia verso un finale diverso.',
      addition: '',
      objective: '',
      objectiveOwner: '',
      tone: 'reveal'
    }
  ];

  const storyMarkup = index => {
    const sceneSteps = tutorialSteps.slice(1, 4);
    return `<section class="tutorial-storyboard" aria-label="Storia costruita durante la partita">
      <div class="tutorial-opening"><span>INCIPIT</span><p>${S.esc(tutorialOpening)}</p></div>
      <div class="tutorial-scene-reel">
        ${sceneSteps.map((step, sceneIndex) => {
          const unlocked = index > sceneIndex;
          const active = index === sceneIndex + 1;
          return `<article class="tutorial-scene-slot${unlocked ? ' is-filled' : ''}${active ? ' is-current' : ''}">
            <span>${unlocked ? S.esc(step.card) : '·'}</span>
            <p>${unlocked ? S.esc(step.addition) : 'La prossima carta aggiunge una scena.'}</p>
          </article>`;
        }).join('')}
      </div>
    </section>`;
  };

  const revealMarkup = () => `<div class="tutorial-reveal-grid">
    ${tutorialSteps.slice(1, 4).map(step => `<article class="tutorial-reveal-card tutorial-reveal-${step.tone}"><b>${S.esc(step.player)}</b><p>${S.esc(step.objective)}</p></article>`).join('')}
  </div>`;

  const stepMarkup = index => {
    const step = tutorialSteps[index];
    const progress = tutorialSteps.map((item, i) => `<span class="${i === index ? 'active' : i < index ? 'done' : ''}" aria-label="${S.esc(item.badge)}"></span>`).join('');
    const isReveal = index === tutorialSteps.length - 1;

    return `<div class="tutorial-experience tutorial-tone-${step.tone}" data-current-step="${index}">
      <div class="tutorial-topline"><p class="eyebrow">${S.esc(step.badge)} · ${S.esc(step.player)}</p><div class="tutorial-progress" aria-label="Avanzamento">${progress}</div></div>
      <div class="tutorial-frame">
        ${storyMarkup(index)}
        <section class="tutorial-stage">
          <aside class="tutorial-play-card" aria-label="Carta: ${S.esc(step.card)}">
            <span class="tutorial-card-corner">${S.esc(step.card)}</span>
            <span class="tutorial-card-suit">${S.esc(step.card.split(' ')[0])}</span>
            <strong>${S.esc(step.label)}</strong>
          </aside>
          <div class="tutorial-copy">
            <h3>${S.esc(step.title)}</h3>
            <p>${S.esc(step.instruction)}</p>
            ${!isReveal && step.objective ? `<div class="tutorial-secret"><span>OBIETTIVO DI ${S.esc(step.objectiveOwner).toUpperCase()}</span><p>${S.esc(step.objective)}</p></div>` : ''}
            ${isReveal ? revealMarkup() : ''}
          </div>
        </section>
      </div>
    </div>`;
  };

  const howMarkup = () => `<div class="screen-heading modal-heading"><p class="eyebrow">COME SI GIOCA</p><h2>La storia è il campo di gioco.</h2><p>Reagisci alle carte, aggiungi una scena coerente e prova a guidare la trama verso il tuo <strong>obiettivo segreto</strong>.</p></div><div class="how-grid modal-grid"><article><span>1</span><b>Crea l'incipit</b><p>Scegli una storia pronta oppure costruisci l'inizio con le carte.</p></article><article><span>2</span><b>Gioca una carta</b><p>Il seme e il valore stabiliscono cosa entra nella scena.</p></article><article><span>3</span><b>Continua la storia</b><p>Usa ciò che esiste già e aggiungi un nuovo fatto.</p></article><article><span>4</span><b>Nascondi il piano</b><p>Spingi la storia verso il tuo obiettivo senza farti capire.</p></article><article><span>5</span><b>Prova il finale</b><p>Rivela l'obiettivo e chiudi usando gli elementi comparsi.</p></article></div>`;

  const rulesMarkup = () => `<div class="screen-heading modal-heading"><p class="eyebrow">REGOLE</p><h2>Regole del gioco.</h2><p>Ogni carta aggiunge un fatto alla storia. Ogni giocatore cerca di guidarla verso il proprio <strong>obiettivo segreto</strong>.</p></div>${S.rulesMarkup ? S.rulesMarkup() : ''}`;

  const tutorialMarkup = () => `<div class="screen-heading modal-heading tutorial-heading"><p class="eyebrow">COME FUNZIONA</p><h2>Una partita in pochi passaggi.</h2></div><div data-tutorial-host>${stepMarkup(0)}</div><div class="tutorial-actions"><button type="button" class="secondary" data-tutorial-prev disabled>Indietro</button><button type="button" class="primary" data-tutorial-next>Avanti <span aria-hidden="true">→</span></button></div>`;

  const infoMarkup = () => `<div class="screen-heading modal-heading creator-heading"><p class="eyebrow">DIETRO E POI?</p><h2>Da un mazzo normale a una storia contesa.</h2><p><strong>E POI?</strong> nasce per rendere il gioco narrativo immediato, sociale e comprensibile anche a chi non frequenta giochi di ruolo o regolamenti pesanti.</p></div>
    <div class="creator-page">
      <article class="creator-profile">
        <img src="${CREATOR_PHOTO}" alt="Jita DesWadyas">
        <div><p class="eyebrow">CHI SONO</p><h3>Jita DesWadyas</h3><span>JitaDiSwadya · Italia</span><p>Sono uno sviluppatore, game designer, worldbuilder e autore indipendente. Creo giochi, strumenti web e mondi narrativi; con il progetto musicale <strong>JitaDiSwadya</strong> trasformo storie e sensazioni in canzoni.</p></div>
      </article>

      <section class="creator-origin">
        <div><p class="eyebrow">COME È NATO</p><h3>Il problema non era inventare una storia.</h3></div>
        <div class="creator-origin-copy"><p>Volevo un gioco in cui tutti costruissero <strong>la stessa storia</strong>, ma senza collaborare davvero allo stesso finale. Il mazzo da 52 carte era già perfetto: accessibile, economico e presente in quasi ogni casa.</p><p>I semi sono diventati tipi di scena, mentre gli <strong>obiettivi segreti</strong> hanno aggiunto il conflitto. Da lì è nata la web app: prima per provare il ritmo, poi per raccogliere storie, spiegare le regole e preparare una futura versione fisica.</p></div>
      </section>

      <section class="creator-project-section">
        <div class="creator-section-heading"><p class="eyebrow">ALTRI PROGETTI</p><h3>Lo stesso filo, in forme diverse.</h3></div>
        <div class="creator-project-grid">
          <article><b>FEIM</b><p>Un MMORPG sandbox 2D con mondo persistente, economia dei giocatori e narrazione dinamica.</p></article>
          <article><b>FEIM: On The Table</b><p>Una piattaforma per campagne da tavolo, mappe, combattimenti e gestione del mondo.</p></article>
          <article><b>feimWorlds</b><p>Un motore 2D costruito in Go ed Ebitengine per creare mondi e giochi modulari.</p></article>
          <article><b>FEIM Notes</b><p>Uno spazio visuale per note, collegamenti e worldbuilding.</p></article>
          <article><b>JitaDiSwadya</b><p>Musica narrativa: storie, scene e sensazioni trasformate in canzoni.</p></article>
        </div>
      </section>

      <section class="creator-direction">
        <p class="eyebrow">DOVE VUOLE ARRIVARE</p><h3>Prima deve funzionare bene al tavolo.</h3><p>La priorità è rendere ogni partita chiara, veloce e divertente. Poi arriveranno più storie, una modalità multi-telefono più solida e, se il gioco dimostra di reggere, un mazzo personalizzato con scatola e regolamento.</p>
        <div class="creator-path"><span class="done">Idea</span><span class="done">Web app</span><span class="current">Test</span><span>Più storie</span><span>Mazzo fisico</span></div>
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
        <button type="button" class="secondary" data-open-panel="tutorial"><span class="button-icon" aria-hidden="true">▶</span><span>Guarda come funziona</span><span class="button-arrow" aria-hidden="true">↗</span></button>
      </div>
    </section>

    <div class="home-divider" aria-hidden="true"><span>✦</span></div>

    <div class="home-grid product-menu compact-product-menu">
      ${saved ? `<button type="button" class="resume-card" data-home-resume><span class="index">↻</span><span><b>Riprendi la partita</b><small>${S.esc(S.sourceLabel(saved))} · ${saved.count || 0} giocatori</small></span><i>→</i></button>` : ''}
      <button type="button" class="choice-card" data-open-panel="how"><span class="index">?</span><span><b>Inizia da qui</b><small>Il gioco spiegato in 2 minuti.</small></span><i>→</i></button>
      <button type="button" class="choice-card" data-open-panel="rules"><span class="index">📖</span><span><b>Le regole complete</b><small>Tutte le meccaniche, quando ti servono.</small></span><i>→</i></button>
      <button type="button" class="choice-card creator-menu-card" data-open-panel="info"><span class="creator-menu-image" aria-hidden="true"><img src="storia52-cards-logo.svg" alt=""></span><span><b>Dietro E POI?</b><small>La nascita del gioco, il creatore e gli altri progetti.</small></span><i>→</i></button>
    </div>`;
  };

  S.bindTutorialIn = root => {
    let index = 0;
    const host = root.querySelector('[data-tutorial-host]');
    const prev = root.querySelector('[data-tutorial-prev]');
    const next = root.querySelector('[data-tutorial-next]');
    if (!host || !prev || !next) return;

    const render = direction => {
      host.classList.remove('tutorial-swap-forward', 'tutorial-swap-back');
      void host.offsetWidth;
      host.classList.add(direction === 'back' ? 'tutorial-swap-back' : 'tutorial-swap-forward');
      host.innerHTML = stepMarkup(index);
      prev.disabled = index === 0;
      next.innerHTML = index === tutorialSteps.length - 1 ? 'Ricomincia <span aria-hidden="true">↻</span>' : 'Avanti <span aria-hidden="true">→</span>';
    };

    const goTo = (nextIndex, direction = 'forward') => {
      index = Math.max(0, Math.min(tutorialSteps.length - 1, nextIndex));
      render(direction);
    };

    prev.addEventListener('click', () => goTo(index - 1, 'back'));
    next.addEventListener('click', () => goTo(index >= tutorialSteps.length - 1 ? 0 : index + 1, index >= tutorialSteps.length - 1 ? 'back' : 'forward'));
    root.addEventListener('keydown', event => {
      if (event.key === 'ArrowRight') goTo(index >= tutorialSteps.length - 1 ? 0 : index + 1, 'forward');
      if (event.key === 'ArrowLeft') goTo(index - 1, 'back');
    });
  };

  S.openHomePanel = panel => {
    const panels = {
      how: ['Come si gioca', howMarkup()],
      rules: ['Regole', rulesMarkup()],
      tutorial: ['Come funziona', tutorialMarkup()],
      info: ['Dietro E POI?', infoMarkup()]
    };
    const selected = panels[panel];
    if (!selected) return;
    const modal = S.modal(selected[0], selected[1], { wide: true, className: `product-modal product-modal-${panel}` });
    if (panel === 'tutorial') S.bindTutorialIn(modal.host);
    if (panel === 'rules') S.bindRulebook?.(modal.host);
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
