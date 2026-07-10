'use strict';

(() => {
  const S = window.S52;
  const CREATOR_PHOTO = window.S52_CREATOR_PHOTO || 'creator-jita.svg';

  const tutorialSteps = [
    {
      badge: 'Turno 1',
      card: '♥ 6',
      player: 'Marta',
      title: 'Un legame salva la scena',
      text: 'Marta gioca Cuori pari: la guardia riconosce il protagonista e lo lascia passare.',
      story: 'Il protagonista entra nell\'archivio grazie a una vecchia conoscenza.'
    },
    {
      badge: 'Turno 2',
      card: '♠ 9',
      player: 'Luca',
      title: 'Arriva una conseguenza',
      text: 'Luca gioca Picche: la porta si chiude alle sue spalle e l\'allarme inizia a lampeggiare.',
      story: 'La scena non cancella la precedente: la complica.'
    },
    {
      badge: 'Turno 3',
      card: '♦ Q',
      player: 'Sara',
      title: 'La scoperta cambia tutto',
      text: 'Sara gioca una Regina di Quadri: trova una donna che conosce il codice, ma vuole qualcosa in cambio.',
      story: 'Ogni carta aggiunge un pezzo e la storia prende una direzione.'
    },
    {
      badge: 'Finale',
      card: '🎯',
      player: 'Rivelazione',
      title: 'Obiettivi segreti',
      text: 'Marta voleva salvare la guardia. Luca voleva bloccare la fuga. Sara voleva far comparire un alleato ambiguo.',
      story: 'Alla fine si scopre chi ha guidato meglio la storia verso il proprio obiettivo.'
    }
  ];

  const stepMarkup = index => {
    const step = tutorialSteps[index];
    const progress = tutorialSteps.map((_, i) => `<span class="${i === index ? 'active' : ''}"></span>`).join('');
    return `<div class="tutorial-stage is-step-${index}">
      <div class="tutorial-card" aria-hidden="true"><span>${S.esc(step.card)}</span></div>
      <div class="tutorial-copy">
        <p class="eyebrow">${S.esc(step.badge)} · ${S.esc(step.player)}</p>
        <h3>${S.esc(step.title)}</h3>
        <p>${S.esc(step.text)}</p>
        <div class="tutorial-story">${S.esc(step.story)}</div>
      </div>
      <div class="tutorial-progress">${progress}</div>
    </div>`;
  };

  const howMarkup = () => `<div class="screen-heading modal-heading"><p class="eyebrow">COME SI GIOCA</p><h2>La storia è il campo di gioco.</h2><p>Non devi scrivere un romanzo: devi <strong>reagire alle carte</strong>, improvvisare una scena coerente e spingere la trama verso il tuo <span class="amber-text">obiettivo segreto</span>.</p></div><div class="how-grid modal-grid"><article><span>1</span><b>Crea l'incipit</b><p>Scegli una storia pronta oppure costruisci l'inizio con le carte.</p></article><article><span>2</span><b>Gioca una carta</b><p>Il seme e il valore decidono che tipo di scena devi aggiungere.</p></article><article><span>3</span><b>Aggiungi una scena</b><p>Continua ciò che esiste già. Non cancellare, fai evolvere.</p></article><article><span>4</span><b>Nascondi il tuo piano</b><p>Ogni giocatore punta al proprio obiettivo senza scoprirsi troppo.</p></article><article><span>5</span><b>Chiudi il finale</b><p>Quando puoi, rivela l'obiettivo e dimostra che il finale regge.</p></article></div>`;

  const rulesMarkup = () => `<div class="screen-heading modal-heading"><p class="eyebrow">REGOLE</p><h2>Regole complete, ma leggibili.</h2><p>Apri solo la parte che ti serve. Il senso è semplice: <strong>ogni carta aggiunge qualcosa</strong>, ogni giocatore prova a portare la storia dalla sua parte.</p></div>${S.rulesMarkup ? S.rulesMarkup() : ''}`;

  const tutorialMarkup = () => `<div class="screen-heading modal-heading"><p class="eyebrow">TUTORIAL</p><h2>Guarda una partita dimostrativa.</h2><p>Non devi fare niente: premi avanti, vedi tre turni rapidi e poi la rivelazione finale.</p></div><div data-tutorial-host>${stepMarkup(0)}</div><div class="tutorial-actions"><button type="button" class="secondary" data-tutorial-prev disabled>Indietro</button><button type="button" class="primary" data-tutorial-next>Avanti</button></div>`;

  const infoMarkup = () => `<div class="screen-heading modal-heading"><p class="eyebrow">INFO · CREDITI · ROADMAP</p><h2>Un progetto pensato per diventare un gioco completo.</h2><p>La web app è il primo passo: <strong>testare il ritmo</strong>, sistemare le storie, rifinire le regole e arrivare a una versione fisica con carte, scatola e regolamento.</p></div><div class="creator-resume">
    <article class="creator-hero-card"><img src="${CREATOR_PHOTO}" alt="Foto del creatore Jita DesWadyas"><div><p class="eyebrow">CREATORE</p><h3>Jita DesWadyas <span>/ JitaDiSwadya (IT)</span></h3><p>Creatore di <strong>STORIA 52</strong>. L'obiettivo è creare un gioco immediato, sociale e mentale: <span class="amber-text">poche regole</span>, molta improvvisazione, finali diversi ogni volta.</p></div></article>
    <div class="resume-timeline"><article><span>01</span><div><b>Concept</b><p>Gioco narrativo competitivo: tutti costruiscono la stessa storia, ma ognuno prova a guidarla verso un obiettivo segreto.</p></div></article><article><span>02</span><div><b>Web app</b><p>Versione rapida per provare partite, regole, tutorial e 52 storie pronte.</p></div></article><article><span>03</span><div><b>Roadmap</b><p>Più storie, account opzionale, modalità extra, mazzo personalizzato e possibile versione fisica.</p></div></article></div>
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
        <button type="button" class="primary" data-home-play><span class="button-icon" aria-hidden="true">52</span><span>Gioca ora</span><span class="button-arrow" aria-hidden="true">→</span></button>
        <button type="button" class="secondary" data-open-panel="tutorial"><span class="button-icon" aria-hidden="true">▶</span><span>Guarda il tutorial</span><span class="button-arrow" aria-hidden="true">↗</span></button>
      </div>
    </section>

    <div class="home-divider" aria-hidden="true"><span>✦</span></div>

    <div class="home-grid product-menu compact-product-menu">
      ${saved ? `<button type="button" class="resume-card" data-home-resume><span class="index">↻</span><span><b>Riprendi la partita</b><small>${S.esc(S.sourceLabel(saved))} · ${saved.count || 0} giocatori</small></span><i>→</i></button>` : ''}
      <button type="button" class="choice-card" data-open-panel="how"><span class="index">?</span><span><b>Inizia da qui</b><small>Il gioco spiegato in 2 minuti.</small></span><i>→</i></button>
      <button type="button" class="choice-card" data-open-panel="rules"><span class="index">📖</span><span><b>Le regole complete</b><small>Tutte le meccaniche, quando ti servono.</small></span><i>→</i></button>
      <button type="button" class="choice-card creator-menu-card" data-open-panel="info"><span class="creator-menu-image" aria-hidden="true"><img src="storia52-cards-logo.svg" alt=""></span><span><b>Dietro STORIA 52</b><small>Come nasce il gioco, chi lo crea e dove vuole arrivare.</small></span><i>→</i></button>
    </div>`;
  };

  S.bindTutorialIn = root => {
    let index = 0;
    const host = root.querySelector('[data-tutorial-host]');
    const prev = root.querySelector('[data-tutorial-prev]');
    const next = root.querySelector('[data-tutorial-next]');
    if (!host || !prev || !next) return;

    const render = () => {
      host.innerHTML = stepMarkup(index);
      prev.disabled = index === 0;
      next.textContent = index === tutorialSteps.length - 1 ? 'Rivedi' : 'Avanti';
    };

    prev.addEventListener('click', () => {
      index = Math.max(0, index - 1);
      render();
    });
    next.addEventListener('click', () => {
      index = index >= tutorialSteps.length - 1 ? 0 : index + 1;
      render();
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
