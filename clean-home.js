'use strict';

(() => {
  const S = window.S52;
  const CREATOR_IMAGE = 'creator-jita.svg?v=16';
  const HOME_LOGO = 'storia52-cards-logo.svg';
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
      meaning: 'Scoperta positiva',
      said: 'Dietro la cornice vuota, Luca trova una polizza assicurativa firmata dal padrone della villa.',
      why: 'Il 6 è pari, quindi la scoperta deve essere utile. La polizza continua direttamente il mistero del quadro.',
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
  const finale = 'Marta mostra la polizza e dimostra che il padrone aveva fatto sparire il quadro per incassare l’assicurazione.';

  const tutorialSteps = [
    { kind: 'goal', eyebrow: '1 · COSA STATE FACENDO', title: 'Costruite la stessa storia, ma ognuno prepara un finale diverso.', body: 'A turno aggiungete nuovi fatti. Nel frattempo provate a rendere possibile il vostro obiettivo segreto senza rivelarlo agli altri.' },
    { kind: 'setup', eyebrow: '2 · PRIMA DI INIZIARE', title: 'Preparate storia, mazzo e obiettivi.', body: 'La web app fornisce l’incipit e gli obiettivi. Il mazzo fisico stabilisce che tipo di scena potete aggiungere.' },
    { kind: 'turn', eyebrow: '3 · IL TUO TURNO', title: 'Cambia una carta, gioca e racconta una scena.', body: 'Con 2 o più carte il cambio iniziale è obbligatorio. Con una sola carta puoi cambiarla oppure tenerla.' },
    { kind: 'meaning', eyebrow: '4 · COME LEGGERE LE CARTE', title: 'Numeri: leggi il seme. Figure e Asso: ignora il seme.', body: 'Le carte da 2 a 10 seguono il seme. J, Q, K e A usano soltanto valore e colore: il loro seme non aggiunge nessun altro effetto.' },
    { kind: 'example', sceneIndex: 0, eyebrow: '5 · PRIMO TURNO', title: 'Marta aggiunge la prima scena.' },
    { kind: 'example', sceneIndex: 1, eyebrow: '6 · SECONDO TURNO', title: 'Luca continua esattamente da ciò che è già successo.' },
    { kind: 'example', sceneIndex: 2, eyebrow: '7 · TERZO TURNO', title: 'Sara continua la stessa storia e prepara il proprio obiettivo.' },
    { kind: 'limits', eyebrow: '8 · COSA NON PUOI FARE', title: 'Puoi aggiungere un fatto. Non puoi cancellare o risolvere tutto da solo.', body: 'Ogni scena deve collegarsi a quella precedente e lasciare una situazione comprensibile alla persona successiva.' },
    { kind: 'ending', eyebrow: '9 · IL FINALE', title: 'Il finale dipende dall’obiettivo, non dalla carta.', body: 'Quando resti senza carte e scegli di non pescare, riveli il tuo obiettivo e racconti una conclusione coerente. La carta dell’ultimo turno non impone il finale.' },
    { kind: 'ready', eyebrow: '10 · ADESSO PUOI GIOCARE', title: 'Questo è l’intero ciclo.', body: 'Cambia una carta → gioca una o due carte → racconta una scena → pesca se vuoi → passa il turno.' }
  ];

  const progress = index => tutorialSteps.map((_, i) => `<span class="${i === index ? 'active' : i < index ? 'done' : ''}"></span>`).join('');

  const objectiveCards = () => `<div class="tutorial-objectives"><article><small>MARTA VEDE</small><b>${S.esc(objectives.Marta)}</b></article><article><small>LUCA VEDE</small><b>${S.esc(objectives.Luca)}</b></article><article><small>SARA VEDE</small><b>${S.esc(objectives.Sara)}</b></article></div><p class="tutorial-private-note"><strong>Importante:</strong> nella partita reale ogni persona legge soltanto il proprio obiettivo.</p>`;

  const storyTimeline = count => `<section class="tutorial-timeline"><header><span>UN’UNICA STORIA, TURNO DOPO TURNO</span><p>${S.esc(opening)}</p></header>${playedScenes.slice(0, count).map((scene, i) => `<article class="${i === count - 1 ? 'current' : ''}"><i>${i + 1}</i><div><b>${S.esc(scene.player)} · ${S.esc(scene.card)}</b><p>${S.esc(scene.said)}</p></div></article>`).join('')}</section>`;

  const storyBefore = sceneIndex => {
    const parts = [opening, ...playedScenes.slice(0, sceneIndex).map(scene => scene.said)];
    return parts.join(' ');
  };

  const cardRules = () => S.cardMeaningMarkup ? S.cardMeaningMarkup() : '';

  const exampleMarkup = sceneIndex => {
    const scene = playedScenes[sceneIndex];
    return `<div class="tutorial-example tutorial-tone-${scene.tone}"><p class="tutorial-continuity-note"><strong>Stessa partita:</strong> questa scena continua tutti i fatti mostrati prima.</p><section class="tutorial-before"><span>STORIA FIN QUI</span><p>${S.esc(storyBefore(sceneIndex))}</p></section><div class="tutorial-example-main"><div class="tutorial-card-demo"><small>CARTA GIOCATA</small><b>${S.esc(scene.card)}</b><span>${S.esc(scene.meaning)}</span></div><div class="tutorial-decision"><div><span>1. LEGGE L’EFFETTO</span><p>Con <strong>${S.esc(scene.card)}</strong> deve aggiungere: <strong>${S.esc(scene.meaning.toLowerCase())}</strong>.</p></div><div><span>2. PENSA AL SUO OBIETTIVO</span><p>${S.esc(objectives[scene.player])}</p></div><div class="tutorial-spoken"><span>3. DICE UNA SOLA SCENA</span><blockquote>“${S.esc(scene.said)}”</blockquote></div><div><span>4. PERCHÉ FUNZIONA</span><p>${S.esc(scene.why)}</p></div></div></div>${storyTimeline(sceneIndex + 1)}<aside class="tutorial-pass"><b>Turno concluso.</b><span>Dopo la scena può pescare una carta. Poi continua la persona successiva dalla storia completa qui sopra.</span></aside></div>`;
  };

  const stepContent = step => {
    if (step.kind === 'goal') return `<div class="tutorial-goal"><div><span>INCIPIT COMUNE</span><b>${S.esc(opening)}</b></div>${objectiveCards()}</div>`;
    if (step.kind === 'setup') return `<div class="tutorial-setup"><article><span>1</span><div><b>Scegliete una storia</b><p>Leggete l’incipit ad alta voce. È il punto di partenza comune.</p></div></article><article><span>2</span><div><b>Preparate il mazzo</b><p>Togliete i jolly, mescolate e date 5 carte a ogni giocatore.</p></div></article><article><span>3</span><div><b>Leggete gli obiettivi</b><p>Passate il telefono. Ognuno legge soltanto il proprio obiettivo segreto.</p></div></article><article><span>4</span><div><b>Scegliete chi inizia</b><p>Dopo ogni turno si continua in ordine, una persona alla volta.</p></div></article></div>`;
    if (step.kind === 'turn') return `<div class="tutorial-turn"><article><span>1</span><div><b>Cambia una carta</b><p>Con 2 o più carte è obbligatorio: scartane 1 e pescane 1. Con una sola carta puoi cambiarla oppure tenerla.</p></div></article><article><span>2</span><div><b>Gioca una carta, oppure due insieme</b><p>Con una carta segui il suo effetto. Con due carte racconti una sola scena che rispetta entrambe.</p></div></article><article><span>3</span><div><b>Dì una sola scena</b><p>Aggiungi un fatto chiaro che continua ciò che è già successo. Non raccontare anche la reazione successiva.</p></div></article><article><span>4</span><div><b>Pesca, se vuoi, e termina</b><p>Dopo la scena puoi pescare 1 carta. Poi il turno è finito comunque.</p></div></article></div><aside class="tutorial-core-rule"><strong>Formula pratica:</strong><span>“Gioco questa carta, quindi nella storia succede che…”</span></aside>`;
    if (step.kind === 'meaning') return cardRules();
    if (step.kind === 'example') return exampleMarkup(step.sceneIndex);
    if (step.kind === 'limits') return `<div class="tutorial-do-dont"><section><h4>Puoi farlo</h4><p>“Luca trova una polizza dietro la cornice vuota.”</p><small>Continua il mistero e aggiunge un solo fatto utilizzabile dagli altri.</small></section><section><h4>Non puoi farlo</h4><p>“Il quadro non è mai sparito, il colpevole confessa e tutti tornano a casa.”</p><small>Cancella l’incipit, risolve tutto e impedisce agli altri di giocare.</small></section></div><div class="tutorial-checklist"><b>Prima di parlare, controlla:</b><span>La mia frase rispetta la carta?</span><span>Continua davvero l’ultima situazione?</span><span>Aggiunge un solo passaggio comprensibile?</span><span>Lascia spazio al turno successivo?</span></div>`;
    if (step.kind === 'ending') return `${storyTimeline(playedScenes.length)}<div class="tutorial-ending"><section><span>CONDIZIONE</span><b>Marta non ha più carte e decide di non pescare.</b></section><section><span>OBIETTIVO RIVELATO</span><b>${S.esc(objectives.Marta)}</b></section><p class="tutorial-final-card-note"><strong>La carta dell’ultimo turno non conta per il finale.</strong> Serve soltanto ad aver terminato la mano.</p><blockquote>“${S.esc(finale)}”</blockquote><div><b>Perché Marta vince</b><p>Il padrone, il quadro e la polizza erano già nella storia. Il finale collega questi elementi e raggiunge il suo obiettivo.</p></div></div>`;
    return `<div class="tutorial-cycle"><span>Cambia 1 carta</span><i>→</i><span>Gioca 1 o 2 carte</span><i>→</i><span>Racconta</span><i>→</i><span>Pesca se vuoi</span><i>→</i><span>Passa</span></div><p class="tutorial-cycle-note">Il cambio è obbligatorio con 2 o più carte; con una sola carta è facoltativo.</p><div class="tutorial-ready-actions"><button type="button" class="primary" data-tutorial-play>Prepara una partita <span aria-hidden="true">→</span></button><button type="button" class="secondary" data-tutorial-rules>Consulta le regole</button></div>`;
  };

  const stepMarkup = index => {
    const step = tutorialSteps[index];
    return `<div class="tutorial-pro"><div class="tutorial-pro-top"><div><p class="eyebrow">${S.esc(step.eyebrow)}</p><small>Passaggio ${index + 1} di ${tutorialSteps.length}</small></div><div class="tutorial-progress" aria-label="Avanzamento">${progress(index)}</div></div><header class="tutorial-pro-heading"><h3>${S.esc(step.title)}</h3><p>${S.esc(step.body || '')}</p></header>${stepContent(step)}</div>`;
  };

  const tutorialMarkup = () => `<div class="screen-heading modal-heading tutorial-heading"><p class="eyebrow">TUTORIAL COMPLETO</p><h2>Impara cosa fare davvero durante una partita.</h2><p>Preparazione, carte, turni collegati e finale: un solo esempio completo senza regole sottintese.</p></div><div data-tutorial-host>${stepMarkup(0)}</div><div class="tutorial-actions"><button type="button" class="secondary" data-tutorial-prev disabled>Indietro</button><button type="button" class="primary" data-tutorial-next>Avanti <span aria-hidden="true">→</span></button></div>`;

  const rulesMarkup = () => `<div class="screen-heading modal-heading"><p class="eyebrow">REGOLE COMPLETE</p><h2>Tutto ciò che serve durante la partita.</h2><p>Apri soltanto la sezione che ti serve: preparazione, carte, turno o finale.</p></div>${S.rulesMarkup ? S.rulesMarkup() : ''}`;

  const infoMarkup = () => `<div class="screen-heading modal-heading creator-modal-heading"><p class="eyebrow">DIETRO E POI?</p><h2>Perché esiste e chi l’ha creato.</h2><p>Il progetto, l’idea di gioco e la direzione della versione pubblica.</p></div><div class="creator-editorial creator-page-v16"><section class="creator-intro-card"><img src="${CREATOR_IMAGE}" alt="JitaDesWadyas" width="256" height="256"><div><span class="creator-game-name">E POI?</span><h3>Creato da JitaDesWadyas</h3><p class="creator-role">Sviluppatore · game designer · autore indipendente</p><p>Un gioco narrativo costruito attorno a una tensione semplice: tutti raccontano la stessa storia, ma ciascuno cerca di portarla verso un finale diverso.</p><div class="creator-links"><a href="https://github.com/JitaDesWadyas" target="_blank" rel="noopener noreferrer">GitHub <span aria-hidden="true">↗</span></a><span>JitaDiSwadya · Italia</span></div></div></section><section class="creator-manifesto"><div><p class="eyebrow">IL PUNTO</p><h3>Non un generatore di storie. Un gioco di intenzioni.</h3></div><p>Le carte stabiliscono che tipo di fatto puoi aggiungere. Gli obiettivi segreti creano il conflitto. Il gioco funziona quando una scena sembra naturale, ma in realtà prepara il finale di qualcuno.</p></section><section class="creator-roadmap-pro"><div><p class="eyebrow">DIREZIONE</p><h3>Prima deve funzionare in una serata vera.</h3><p>La web app prepara la partita, distribuisce gli obiettivi e riduce l’attrito. Le storie vengono migliorate attraverso test reali; il mazzo fisico viene dopo.</p></div><ol><li class="done"><b>01</b><span>Idea e regole</span></li><li class="done"><b>02</b><span>Web app</span></li><li class="current"><b>03</b><span>Test pubblici</span></li><li><b>04</b><span>Nuove storie</span></li><li><b>05</b><span>Mazzo fisico</span></li></ol></section><footer class="creator-legal-links"><a href="privacy.html" target="_blank" rel="noopener">Privacy</a><a href="copyright.html" target="_blank" rel="noopener">Copyright e crediti</a><span>© 2026 JitaDesWadyas</span></footer></div>`;

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
      host.querySelector('[data-tutorial-play]')?.addEventListener('click', () => { S.closeModal?.(); S.renderSetup('play'); });
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

    prev.addEventListener('click', () => goTo(index - 1, 'back'));
    next.addEventListener('click', () => goTo(index >= tutorialSteps.length - 1 ? 0 : index + 1, index >= tutorialSteps.length - 1 ? 'back' : 'forward'));
    root.addEventListener('keydown', event => {
      if (event.key === 'ArrowRight') goTo(index >= tutorialSteps.length - 1 ? 0 : index + 1);
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

  S.renderHome = () => {
    S.currentSession = null;
    S.mount(S.homeMarkup(), { session: false });
    S.play.querySelectorAll('[data-home-play]').forEach(button => button.addEventListener('click', () => S.renderSetup('play')));
    S.play.querySelector('[data-home-resume]')?.addEventListener('click', () => S.resume(S.load()));
    S.bindHomeNavigation();
  };
})();
