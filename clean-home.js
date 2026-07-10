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
      label: 'La stessa storia, tre piani',
      title: 'Ora si capisce perché ognuno ha giocato così.',
      instruction: 'Le scene erano coerenti tra loro, ma ogni giocatore le spingeva verso un finale diverso.',
      addition: '',
      objective: '',
      objectiveOwner: '',
      tone: 'reveal'
    }
  ];

  const storyMarkup = index => {
    const additions = tutorialSteps.slice(1, Math.min(index, 3) + 1).filter(step => step.addition);
    return `<div class="tutorial-storyline" aria-live="polite">
      <div class="tutorial-opening"><span>INCIPIT</span><p>${S.esc(tutorialOpening)}</p></div>
      <div class="tutorial-thread">
        ${additions.map((step, i) => `<div class="tutorial-scene tutorial-scene-${step.tone}" style="--scene-delay:${i * 70}ms"><span>${S.esc(step.card)}</span><p>${S.esc(step.addition)}</p></div>`).join('')}
        ${index === 0 ? '<div class="tutorial-waiting"><span></span><span></span><span></span><small>La prima carta sta per entrare nella storia</small></div>' : ''}
      </div>
    </div>`;
  };

  const revealMarkup = () => `<div class="tutorial-reveal-grid">
    ${tutorialSteps.slice(1, 4).map(step => `<article class="tutorial-reveal-card tutorial-reveal-${step.tone}"><div><span>${S.esc(step.card)}</span><b>${S.esc(step.player)}</b></div><p>${S.esc(step.objective)}</p><small>${S.esc(step.label)}</small></article>`).join('')}
  </div>`;

  const stepMarkup = index => {
    const step = tutorialSteps[index];
    const progress = tutorialSteps.map((item, i) => `<span class="${i === index ? 'active' : i < index ? 'done' : ''}" title="${S.esc(item.badge)}"></span>`).join('');
    const isReveal = index === tutorialSteps.length - 1;

    return `<div class="tutorial-experience is-step-${index} tutorial-tone-${step.tone}">
      <div class="tutorial-topline"><p class="eyebrow">${S.esc(step.badge)} · ${S.esc(step.player)}</p><div class="tutorial-progress">${progress}</div></div>
      <div class="tutorial-stage">
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
      </div>
      ${storyMarkup(index)}
    </div>`;
  };

  const howMarkup = () => `<div class="screen-heading modal-heading"><p class="eyebrow">COME SI GIOCA</p><h2>La storia è il campo di gioco.</h2><p>Non devi scrivere un romanzo: devi <strong>reagire alle carte</strong>, improvvisare una scena coerente e spingere la trama verso il tuo <span class="amber-text">obiettivo segreto</span>.</p></div><div class="how-grid modal-grid"><article><span>1</span><b>Crea l'incipit</b><p>Scegli una storia pronta oppure costruisci l'inizio con le carte.</p></article><article><span>2</span><b>Gioca una carta</b><p>Il seme e il valore decidono che tipo di scena devi aggiungere.</p></article><article><span>3</span><b>Aggiungi una scena</b><p>Continua ciò che esiste già. Non cancellare, fai evolvere.</p></article><article><span>4</span><b>Nascondi il tuo piano</b><p>Ogni giocatore punta al proprio obiettivo senza scoprirsi troppo.</p></article><article><span>5</span><b>Chiudi il finale</b><p>Quando puoi, rivela l'obiettivo e dimostra che il finale regge.</p></article></div>`;

  const rulesMarkup = () => `<div class="screen-heading modal-heading"><p class="eyebrow">REGOLE</p><h2>Regole complete, ma leggibili.</h2><p>Apri solo la parte che ti serve. Il senso è semplice: <strong>ogni carta aggiunge qualcosa</strong>, ogni giocatore prova a portare la storia dalla sua parte.</p></div>${S.rulesMarkup ? S.rulesMarkup() : ''}`;

  const tutorialMarkup = () => `<div class="screen-heading modal-heading tutorial-heading"><p class="eyebrow">TUTORIAL INTERATTIVO</p><h2>Una partita in meno di un minuto.</h2><p>Segui tre giocatori mentre costruiscono <strong>la stessa storia</strong> e provano, di nascosto, a piegarla verso tre finali diversi.</p></div><div data-tutorial-host>${stepMarkup(0)}</div><div class="tutorial-actions"><button type="button" class="secondary" data-tutorial-prev disabled>Indietro</button><button type="button" class="primary" data-tutorial-next>Inizia la partita <span aria-hidden="true">→</span></button></div>`;

  const infoMarkup = () => `<div class="screen-heading modal-heading"><p class="eyebrow">INFO · CREDITI · ROADMAP</p><h2>Un progetto pensato per diventare un gioco completo.</h2><p>La web app è il primo passo: <strong>testare il ritmo</strong>, sistemare le storie, rifinire le regole e arrivare a una versione fisica con carte, scatola e regolamento.</p></div><div class="creator-resume">
    <article class="creator-hero-card"><img src="${CREATOR_PHOTO}" alt="Foto del creatore Jita DesWadyas"><div><p class="eyebrow">CREATORE</p><h3>Jita DesWadyas <span>/ JitaDiSwadya (IT)</span></h3><p>Creatore di <strong>E POI?</strong>. L'obiettivo è creare un gioco immediato, sociale e mentale: <span class="amber-text">poche regole</span>, molta improvvisazione, finali diversi ogni volta.</p></div></article>
    <div class="resume-timeline"><article><span>01</span><div><b>Concept</b><p>Gioco narrativo competitivo: tutti costruiscono la stessa storia, ma ognuno prova a guidarla verso un obiettivo segreto.</p></div></article><article><span>02</span><div><b>Web app</b><p>Versione rapida per provare partite, regole, tutorial e storie pronte.</p></div></article><article><span>03</span><div><b>Roadmap</b><p>Più storie, account opzionale, modalità extra, mazzo personalizzato e possibile versione fisica.</p></div></article></div>
    <div class="creator-tags"><span>Game design</span><span>Narrazione</span><span>Web app</span><span>Carte</span><span>Social in arrivo</span><span>Donazioni in arrivo</span></div>
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
      <button type="button" class="choice-card creator-menu-card" data-open-panel="info"><span class="creator-menu-image" aria-hidden="true"><img src="storia52-cards-logo.svg" alt=""></span><span><b>Dietro E POI?</b><small>Come nasce il gioco, chi lo crea e dove vuole arrivare.</small></span><i>→</i></button>
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
      if (index === 0) next.innerHTML = 'Inizia la partita <span aria-hidden="true">→</span>';
      else if (index === tutorialSteps.length - 1) next.innerHTML = 'Rivedi dall’inizio <span aria-hidden="true">↻</span>';
      else next.innerHTML = 'Prossimo turno <span aria-hidden="true">→</span>';
    };

    prev.addEventListener('click', () => {
      index = Math.max(0, index - 1);
      render('back');
    });
    next.addEventListener('click', () => {
      index = index >= tutorialSteps.length - 1 ? 0 : index + 1;
      render('forward');
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