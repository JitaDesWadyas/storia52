'use strict';

(() => {
  const S = window.S52;
  const HOME_LOGO = 'storia52-cards-logo.svg';
  const CREATOR_SRC = 'creator-jita.svg?v=23';
  const opening = 'Durante una festa in una villa isolata, sparisce un quadro.';
  const objectives = {
    Marta: 'Fai ricadere la colpa sul padrone.',
    Luca: 'Rivela un segreto della famiglia.',
    Sara: 'Impedisci a tutti di lasciare la villa.'
  };
  const playedScenes = [
    {
      player: 'Marta',
      card: '♣ 8',
      meaning: 'Azione',
      said: 'Il padrone ordina di chiudere le porte e controllare le borse degli invitati.',
      why: 'È un’azione concreta collegata alla sparizione. Rende il padrone sospetto senza dichiararlo già colpevole.',
      tone: 'clubs'
    },
    {
      player: 'Luca',
      card: '♦ 6',
      meaning: 'Scoperta',
      said: 'Dietro la cornice vuota, Luca trova una polizza assicurativa firmata dal padrone della villa.',
      why: 'La carta impone una scoperta. La polizza continua direttamente il mistero del quadro e diventa utile per i turni successivi.',
      tone: 'diamonds'
    },
    {
      player: 'Sara',
      card: '♠ 5',
      meaning: 'Ostacolo',
      said: 'L’allarme della villa scatta e blocca tutte le uscite automatiche.',
      why: 'È un nuovo problema nato dalla ricerca del quadro. Impedisce la fuga e lascia agli altri la possibilità di reagire.',
      tone: 'spades'
    }
  ];
  const finale = 'Marta mostra la polizza: il padrone prova a strappargliela, ma così facendo rivela di aver nascosto il quadro per incassare l’assicurazione.';

  const tutorialSteps = [
    { kind: 'goal', eyebrow: '1 · COS’È E POI?', title: 'Costruite la stessa storia, ma ognuno prepara un finale diverso.', body: 'A turno aggiungete nuovi fatti e provate a rendere possibile il vostro obiettivo segreto senza rivelarlo agli altri.' },
    { kind: 'setup', eyebrow: '2 · PREPARAZIONE', title: 'Scegliete storia, carte, obiettivi e chi inizia.', body: 'Usate un mazzo da 52 carte oppure, con telefoni separati, una mano virtuale privata.' },
    { kind: 'turn', eyebrow: '3 · IL TUO TURNO', title: 'Cambia, gioca e racconta una sola scena.', body: 'Numeri: segui il seme. J, Q, K e A: usa soltanto valore e colore.' },
    { kind: 'example', eyebrow: '4 · ESEMPIO DI PARTITA', title: 'Ogni scena continua quella precedente.', body: 'Marta, Luca e Sara aggiungono un solo fatto ciascuno alla stessa storia.' },
    { kind: 'ending', eyebrow: '5 · IL FINALE', title: 'L’ultima carta porta direttamente al tuo obiettivo.', body: 'La scena dell’ultima carta e il finale sono un unico racconto.' }
  ];

  const progress = index => tutorialSteps.map((_, i) => `<span class="${i === index ? 'active' : i < index ? 'done' : ''}"></span>`).join('');

  const objectiveCards = () => `<div class="tutorial-objectives"><article><small>MARTA VEDE</small><b>${S.esc(objectives.Marta)}</b></article><article><small>LUCA VEDE</small><b>${S.esc(objectives.Luca)}</b></article><article><small>SARA VEDE</small><b>${S.esc(objectives.Sara)}</b></article></div><p class="tutorial-private-note"><strong>Importante:</strong> nella partita reale ogni persona legge soltanto il proprio obiettivo.</p>`;

  const storyTimeline = count => `<section class="tutorial-timeline"><header><span>UN’UNICA STORIA, TURNO DOPO TURNO</span><p>${S.esc(opening)}</p></header>${playedScenes.slice(0, count).map((scene, i) => `<article class="${i === count - 1 ? 'current' : ''}"><i>${i + 1}</i><div><b>${S.esc(scene.player)} · ${S.esc(scene.card)}</b><p>${S.esc(scene.said)}</p></div></article>`).join('')}</section>`;

  const exampleMarkup = () => `<div class="tutorial-example tutorial-tone-clubs"><p class="tutorial-continuity-note"><strong>Stessa partita:</strong> ogni persona continua da ciò che è già successo.</p>${storyTimeline(playedScenes.length)}<div class="tutorial-do-dont"><section><h4>Da ricordare</h4><p>Continua la storia, aggiungi un solo fatto e lascia spazio alla persona successiva.</p></section><section><h4>Da evitare</h4><p>Non cancellare ciò che è successo e non risolvere tutto da solo.</p></section></div></div>`;

  const stepContent = step => {
    if (step.kind === 'goal') return `<div class="tutorial-goal"><div><span>INCIPIT COMUNE</span><b>${S.esc(opening)}</b></div>${objectiveCards()}</div>`;
    if (step.kind === 'setup') return `<div class="tutorial-setup"><article><span>1</span><div><b>Scegliete una storia</b><p>Leggete l’incipit comune.</p></div></article><article><span>2</span><div><b>Preparate carte e obiettivi</b><p>Ognuno vede soltanto il proprio obiettivo segreto.</p></div></article><article><span>3</span><div><b>Scegliete chi inizia</b><p>Poi continuate in ordine, una persona alla volta.</p></div></article></div><div class="tutorial-ready-actions"><button type="button" class="secondary" data-tutorial-rules>Apri il regolamento completo</button></div>`;
    if (step.kind === 'turn') return `<div class="tutorial-turn"><article><span>1</span><div><b>Cambia una carta</b><p>Con 2 o più carte è obbligatorio; con una sola è facoltativo.</p></div></article><article><span>2</span><div><b>Gioca una carta</b><p>Numeri: segui il seme. J, Q, K e A: usa soltanto valore e colore.</p></div></article><article><span>3</span><div><b>Racconta una scena</b><p>Aggiungi un solo fatto che continua la storia.</p></div></article><article><span>4</span><div><b>Pesca, se vuoi</b><p>Poi passa il turno.</p></div></article></div><aside class="tutorial-core-rule"><strong>In breve:</strong><span>Cambia → gioca → racconta → pesca → passa.</span></aside>`;
    if (step.kind === 'example') return exampleMarkup();
    if (step.kind === 'ending') return `${storyTimeline(playedScenes.length)}<div class="tutorial-ending"><section><span>ULTIMA CARTA</span><b>Marta racconta la scena imposta dalla carta.</b></section><section><span>OBIETTIVO SEGRETO</span><b>${S.esc(objectives.Marta)}</b></section><p class="tutorial-final-card-note"><strong>Scena e finale sono un unico racconto.</strong></p><blockquote>“${S.esc(finale)}”</blockquote><div class="tutorial-ready-actions"><button type="button" class="primary" data-tutorial-play>Prepara una partita <span aria-hidden="true">→</span></button><button type="button" class="secondary" data-tutorial-rules>Apri il regolamento completo</button></div></div>`;
    return '';
  };

  const stepMarkup = index => {
    const step = tutorialSteps[index];
    return `<div class="tutorial-pro"><div class="tutorial-pro-top"><div><p class="eyebrow">${S.esc(step.eyebrow)}</p><small>Passaggio ${index + 1} di ${tutorialSteps.length}</small></div><div class="tutorial-progress" aria-label="Avanzamento">${progress(index)}</div></div><header class="tutorial-pro-heading"><h3>${S.esc(step.title)}</h3><p>${S.esc(step.body || '')}</p></header>${stepContent(step)}</div>`;
  };

  const tutorialMarkup = () => `<div class="screen-heading modal-heading tutorial-heading"><p class="eyebrow">TUTORIAL RAPIDO</p><h2>Impara a giocare in cinque passaggi.</h2><p>Solo ciò che serve per iniziare. Per ogni dettaglio puoi aprire il regolamento completo.</p></div><div data-tutorial-host>${stepMarkup(0)}</div><div class="tutorial-actions"><button type="button" class="secondary" data-tutorial-prev disabled>Indietro</button><button type="button" class="primary" data-tutorial-next>Avanti <span aria-hidden="true">→</span></button></div>`;

  const rulesMarkup = () => `<div class="screen-heading modal-heading"><p class="eyebrow">REGOLE COMPLETE</p><h2>Tutto ciò che serve durante la partita.</h2><p>Apri soltanto la sezione che ti serve: preparazione, carte, turno o finale.</p></div>${S.rulesMarkup ? S.rulesMarkup() : ''}`;

  const infoMarkup = () => `<div class="screen-heading modal-heading creator-modal-heading"><p class="eyebrow">DIETRO E POI?</p><h2>Perché esiste e chi l’ha creato.</h2><p>Il progetto, l’idea di gioco e la direzione della versione pubblica.</p></div><div class="creator-editorial creator-page-v16"><section class="creator-intro-card"><img src="${CREATOR_SRC}" alt="Jita DesWadyas, creatore di E POI?" width="360" height="360" decoding="async"><div class="creator-intro-copy"><span class="creator-game-name">E POI?</span><h3>Creato da JitaDesWadyas</h3><p class="creator-role">Scrittore · sviluppatore · game designer · autore indipendente</p><p>Dopo anni di progetti, lavoro e un sacco di brainstorming, sono arrivato a E POI?: un gioco pensato per riportare creatività e immaginazione nel nostro modo di stare insieme, qualità che il mondo moderno ci porta spesso a usare sempre meno. Immaginare, sognare e comunicare sono tra i doni più umani che abbiamo. Qui si uniscono in una sola esperienza condivisa.</p><div class="creator-links"><a href="https://www.instagram.com/jitadeswadyas" target="_blank" rel="noopener noreferrer">Instagram</a><a href="https://www.youtube.com/@JitaDesWadyas" target="_blank" rel="noopener noreferrer">YouTube</a><a href="https://github.com/JitaDesWadyas" target="_blank" rel="noopener noreferrer">GitHub</a></div></div></section></div>`;

  S.homeMarkup = () => {
    const saved = S.load();
    return `<section class="surface hero product-hero"><div class="hero-copy"><div class="hero-kicker"><p class="eyebrow">GIOCO NARRATIVO · CARTE · OBIETTIVI SEGRETI</p></div><h2 class="hero-title"><span class="line">Un gioco che mette alla prova</span><span class="line line-accent"><span class="hero-creativity">creatività</span> e immaginazione,</span><span class="line line-final">improvvisando.</span></h2><p class="hero-intro">Aggiungi una scena seguendo le carte. Mentre la storia prende forma, prova a guidarla verso il tuo <strong>obiettivo segreto</strong> senza farti scoprire.</p><div class="hero-divider" aria-hidden="true"><span>Una storia · più piani</span></div></div><div class="hero-actions hero-actions-single"><button type="button" class="primary" data-home-play><span class="button-icon" aria-hidden="true">?</span><span>Gioca ora</span><span class="button-arrow" aria-hidden="true">→</span></button></div></section><div class="home-divider" aria-hidden="true"><span>✦</span></div><div class="home-grid product-menu compact-product-menu">${saved ? `<button type="button" class="resume-card" data-home-resume><span class="index">↻</span><span><b>Riprendi la partita</b><small>${S.esc(S.sourceLabel(saved))} · ${saved.count || 0} giocatori</small></span><i>→</i></button>` : ''}<button type="button" class="choice-card" data-open-panel="tutorial"><span class="index">?</span><span><b>Inizia da qui</b><small>Tutorial completo, passo per passo.</small></span><i>→</i></button><button type="button" class="choice-card" data-open-panel="rules"><span class="index">📖</span><span><b>Regole complete</b><small>Riferimento rapido durante la partita.</small></span><i>→</i></button><button type="button" class="choice-card creator-menu-card" data-open-panel="info"><span class="creator-menu-logo" aria-hidden="true"><img src="${HOME_LOGO}" alt="" width="128" height="128"></span><span><b>Dietro E POI?</b><small>Perché esiste, chi l’ha creato e dove vuole arrivare.</small></span><i>→</i></button></div>`;
  };

  S.bindTutorialIn = root => {
    let index = 0;
    const host = root.querySelector('[data-tutorial-host]');
    const prev = root.querySelector('[data-tutorial-prev]');
    const next = root.querySelector('[data-tutorial-next]');
    const modalCard = root.querySelector('.modal-card');
    if (!host || !prev || !next) return;

    const bindStepActions = () => {
      host.querySelector('[data-tutorial-rules]')?.addEventListener('click', () => S.openHomePanel('rules'));
      host.querySelector('[data-tutorial-play]')?.addEventListener('click', () => {
        root.remove();
        document.body.classList.remove('modal-open', 'home-static-entry');
        S.renderSetup('play');
      });
    };

    const scrollContainer = () => host.scrollHeight > host.clientHeight + 8 ? host : modalCard;
    const isAtBottom = element => !element || element.scrollHeight - element.scrollTop - element.clientHeight <= 18;
    const showRestBeforeAdvancing = () => {
      const element = scrollContainer();
      if (isAtBottom(element)) return false;
      element.scrollTo({ top: element.scrollHeight, behavior: 'smooth' });
      return true;
    };

    const returnToTop = () => requestAnimationFrame(() => {
      host.scrollTo({ top: 0, behavior: 'auto' });
      if (modalCard) modalCard.scrollTo({ top: 0, behavior: 'auto' });
    });

    const render = direction => {
      host.classList.remove('tutorial-swap-forward', 'tutorial-swap-back');
      void host.offsetWidth;
      host.classList.add(direction === 'back' ? 'tutorial-swap-back' : 'tutorial-swap-forward');
      host.innerHTML = stepMarkup(index);
      prev.disabled = index === 0;
      next.innerHTML = index === tutorialSteps.length - 1 ? 'Ricomincia <span aria-hidden="true">↻</span>' : 'Avanti <span aria-hidden="true">→</span>';
      bindStepActions();
      returnToTop();
    };

    const goTo = (nextIndex, direction = 'forward') => {
      index = Math.max(0, Math.min(tutorialSteps.length - 1, nextIndex));
      render(direction);
    };

    const advance = () => {
      if (showRestBeforeAdvancing()) return;
      goTo(index >= tutorialSteps.length - 1 ? 0 : index + 1, index >= tutorialSteps.length - 1 ? 'back' : 'forward');
    };

    prev.addEventListener('click', () => goTo(index - 1, 'back'));
    next.addEventListener('click', advance);
    root.addEventListener('keydown', event => {
      if (event.key === 'ArrowRight') advance();
      if (event.key === 'ArrowLeft') goTo(index - 1, 'back');
    });
  };

  S.openHomePanel = panel => {
    const normalized = panel === 'how' ? 'tutorial' : panel;
    const panels = { tutorial: ['Tutorial', tutorialMarkup()], rules: ['Regole', rulesMarkup()], info: ['Dietro E POI?', infoMarkup()] };
    const selected = panels[normalized];
    if (!selected) return;
    const modal = S.modal(selected[0], selected[1], { wide: true, className: `product-modal product-modal-${normalized}` });
    if (normalized === 'tutorial') S.bindTutorialIn(modal.host);
    if (normalized === 'rules') S.bindRulebook?.(modal.host);
  };

  S.bindHomeNavigation = () => {
    S.play.querySelectorAll('[data-open-panel]').forEach(button => button.addEventListener('click', () => S.openHomePanel(button.dataset.openPanel)));
  };

  const resetHomeViewport = () => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    if (location.hash === '#play') {
      const cleanUrl = new URL(location.href);
      cleanUrl.hash = '';
      history.replaceState(null, '', `${cleanUrl.pathname}${cleanUrl.search}`);
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  };

  S.renderHome = () => {
    S.currentSession = null;
    document.body.classList.add('home-static-entry');
    resetHomeViewport();
    S.mount(S.homeMarkup(), { session: false, scroll: false, animate: false, preserveHash: true });
    resetHomeViewport();
    requestAnimationFrame(() => {
      resetHomeViewport();
      requestAnimationFrame(resetHomeViewport);
    });
    S.play.querySelectorAll('[data-home-play]').forEach(button => button.addEventListener('click', () => {
      document.body.classList.remove('home-static-entry');
      S.renderSetup('play');
    }));
    S.play.querySelector('[data-home-resume]')?.addEventListener('click', () => {
      document.body.classList.remove('home-static-entry');
      S.resume(S.load());
    });
    S.bindHomeNavigation();
  };
})();