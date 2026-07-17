'use strict';

(() => {
  const S = window.S52;
  const CREATOR_IMAGE = 'creator-jita.svg';
  const tutorialOpening = 'Durante una festa in una villa isolata, sparisce un quadro.';
  const scenes = [
    { player: 'Marta', card: '♣ 8', label: 'Azione', text: 'Il padrone chiude le porte e ritira i telefoni.', objective: 'Fai ricadere la colpa sul padrone.', tone: 'clubs' },
    { player: 'Luca', card: '♦ J', label: 'Scoperta · nuovo oggetto', text: 'Luca trova nel camino una fotografia mezza bruciata.', objective: 'Rivela un segreto di famiglia.', tone: 'diamonds' },
    { player: 'Sara', card: '♠ 5', label: 'Ostacolo', text: 'Un blackout blocca le serrature elettroniche della villa.', objective: 'Impedisci al gruppo di uscire.', tone: 'spades' }
  ];
  const tutorialFinale = 'Dietro la fotografia compare il padrone mentre nasconde il quadro: aveva inscenato il furto per incassare l’assicurazione.';

  const tutorialSteps = [
    { kind: 'overview', eyebrow: '1 · SCOPO', title: 'Costruite una sola storia. Ognuno la vuole portare altrove.', body: 'Tutti partono dallo stesso incipit, ma ogni giocatore riceve un obiettivo segreto diverso. Vince chi riesce a chiudere la storia raggiungendo il proprio obiettivo senza forzare ciò che è già successo.' },
    { kind: 'setup', eyebrow: '2 · PREPARAZIONE', title: 'Bastano un mazzo normale e un telefono.', body: 'Togliete i jolly, distribuite 5 carte a testa e fate leggere a ogni giocatore il proprio obiettivo. L’incipit viene mostrato una volta sola: da quel momento la storia cresce scena dopo scena.' },
    { kind: 'cards', eyebrow: '3 · LE CARTE', title: 'La carta decide il tipo di scena, non la frase esatta.', body: 'Il seme indica cosa deve accadere. Il giocatore inventa una scena coerente con tutto ciò che è già stato detto.' },
    { kind: 'turn', eyebrow: '4 · IL TURNO', title: 'Gioca una carta. Aggiungi un solo fatto chiaro.', body: 'In ordine, ogni persona sistema la mano, gioca una carta e racconta cosa cambia. Non si riscrive il passato e non si chiude subito una conseguenza che dovrebbe lasciare spazio al giocatore dopo.' },
    { kind: 'scene', sceneIndex: 0, eyebrow: '5 · PARTITA', title: 'Marta usa un’Azione per preparare il suo piano.' },
    { kind: 'scene', sceneIndex: 1, eyebrow: '6 · PARTITA', title: 'Luca aggiunge un indizio utile al proprio obiettivo.' },
    { kind: 'scene', sceneIndex: 2, eyebrow: '7 · PARTITA', title: 'Sara crea un ostacolo senza cancellare le scene precedenti.' },
    { kind: 'finale', eyebrow: '8 · FINALE', title: 'L’ultima carta può chiudere la storia.', body: 'Marta gioca la sua ultima carta, rivela l’obiettivo e collega elementi già introdotti. Il finale è valido perché non inventa una soluzione dal nulla e porta davvero la colpa sul padrone.' }
  ];

  const progressMarkup = index => tutorialSteps.map((_, i) => `<span class="${i === index ? 'active' : i < index ? 'done' : ''}"></span>`).join('');
  const sceneTimeline = activeIndex => `<div class="tutorial-thread-pro"><div class="tutorial-opening-pro"><span>INCIPIT</span><p>${S.esc(tutorialOpening)}</p></div>${scenes.slice(0, activeIndex + 1).map((scene, i) => `<article class="tutorial-thread-item ${i === activeIndex ? 'current' : ''}"><span>${i + 1}</span><div><b>${S.esc(scene.player)} · ${S.esc(scene.card)}</b><p>${S.esc(scene.text)}</p></div></article>`).join('')}</div>`;

  const cardLegend = () => `<div class="tutorial-card-legend"><article><b class="red">♥</b><span><strong>Relazione</strong><small>Un legame aiuta o complica.</small></span></article><article><b class="red">♦</b><span><strong>Scoperta</strong><small>Emergono informazioni o indizi.</small></span></article><article><b>♣</b><span><strong>Azione</strong><small>Un personaggio fa qualcosa.</small></span></article><article><b>♠</b><span><strong>Ostacolo</strong><small>La situazione diventa più difficile.</small></span></article></div><p class="tutorial-figure-note"><strong>J, Q, K, A:</strong> introducono rispettivamente un oggetto, un personaggio, un luogo o un colpo di scena.</p>`;

  const stepMarkup = index => {
    const step = tutorialSteps[index];
    let content = '';
    if (step.kind === 'overview') content = `<div class="tutorial-principle"><div><span>STORIA COMUNE</span><b>${S.esc(tutorialOpening)}</b></div><div class="tutorial-objective-row"><article><small>MARTA</small><b>Accusa il padrone</b></article><article><small>LUCA</small><b>Scopre un segreto</b></article><article><small>SARA</small><b>Blocca la fuga</b></article></div></div>`;
    if (step.kind === 'setup') content = `<div class="tutorial-setup-grid"><article><span>1</span><b>Scegliete l’incipit</b><p>Storia pronta o creata dal gruppo.</p></article><article><span>2</span><b>Date 5 carte</b><p>Un normale mazzo, senza jolly.</p></article><article><span>3</span><b>Leggete gli obiettivi</b><p>Ognuno vede soltanto il proprio.</p></article><article><span>4</span><b>Scegliete chi inizia</b><p>Poi si procede sempre in ordine.</p></article></div>`;
    if (step.kind === 'cards') content = cardLegend();
    if (step.kind === 'turn') content = `<div class="tutorial-turn-flow"><article><span>1</span><div><b>Sistema la mano</b><p>Se serve, scarta una carta e pescane una.</p></div></article><article><span>2</span><div><b>Gioca una carta</b><p>Leggi seme, valore ed eventuale figura.</p></div></article><article><span>3</span><div><b>Aggiungi la scena</b><p>Una frase chiara, coerente e utile alla storia.</p></div></article><article><span>4</span><div><b>Passa il turno</b><p>Il giocatore dopo continua da ciò che hai lasciato.</p></div></article></div><aside class="tutorial-rule-callout"><b>Regola chiave</b><p>La carta impone il tipo di evento. Non obbliga a raccontare una scena precisa.</p></aside>`;
    if (step.kind === 'scene') {
      const scene = scenes[step.sceneIndex];
      content = `<div class="tutorial-scene-layout tutorial-tone-${scene.tone}"><div class="tutorial-play-card-pro"><small>${S.esc(scene.card)}</small><b>${S.esc(scene.card.split(' ')[0])}</b><span>${S.esc(scene.label)}</span></div><div><p class="tutorial-scene-result">SCENA AGGIUNTA</p><blockquote>${S.esc(scene.text)}</blockquote><aside class="tutorial-secret-pro"><span>OBIETTIVO DI ${S.esc(scene.player).toUpperCase()}</span><b>${S.esc(scene.objective)}</b><p>La scena lo avvicina, ma resta sensata anche per chi non conosce il piano.</p></aside></div></div>${sceneTimeline(step.sceneIndex)}`;
    }
    if (step.kind === 'finale') content = `${sceneTimeline(scenes.length - 1)}<div class="tutorial-finale-pro"><span>OBIETTIVO RIVELATO</span><h4>Fai ricadere la colpa sul padrone.</h4><blockquote>${S.esc(tutorialFinale)}</blockquote><div><b>Marta vince</b><p>Ha usato il padrone, la fotografia e il quadro: tutti elementi già presenti.</p></div></div>`;
    return `<div class="tutorial-pro" data-current-step="${index}"><div class="tutorial-pro-top"><div><p class="eyebrow">${S.esc(step.eyebrow)}</p><span>Passaggio ${index + 1} di ${tutorialSteps.length}</span></div><div class="tutorial-v2-progress" aria-label="Avanzamento">${progressMarkup(index)}</div></div><header class="tutorial-pro-heading"><h3>${S.esc(step.title)}</h3>${step.body ? `<p>${S.esc(step.body)}</p>` : ''}</header>${content}</div>`;
  };

  const tutorialMarkup = () => `<div class="screen-heading modal-heading tutorial-heading"><p class="eyebrow">IMPARA GIOCANDO</p><h2>Come si gioca, dall’incipit al finale.</h2><p>Un unico percorso pratico. Le regole complete restano disponibili come riferimento, senza ripetere la stessa spiegazione tre volte.</p></div><div data-tutorial-host>${stepMarkup(0)}</div><div class="tutorial-actions"><button type="button" class="secondary" data-tutorial-prev disabled>Indietro</button><button type="button" class="primary" data-tutorial-next>Avanti <span aria-hidden="true">→</span></button></div><div class="tutorial-reference"><span>Serve un dettaglio preciso?</span><button type="button" class="text-button" data-tutorial-rules>Apri le regole complete</button></div>`;
  const rulesMarkup = () => `<div class="screen-heading modal-heading"><p class="eyebrow">RIFERIMENTO</p><h2>Regole complete.</h2><p>Usale durante la partita per controllare semi, figure, turno e finale.</p></div>${S.rulesMarkup ? S.rulesMarkup() : ''}`;

  const infoMarkup = () => `<div class="creator-editorial"><header class="creator-editorial-hero"><figure class="creator-portrait"><img src="${CREATOR_IMAGE}" alt="Jita DesWadyas" width="800" height="800"></figure><div><p class="eyebrow">DIETRO E POI?</p><h2>Una storia condivisa.<br>Più piani nascosti.</h2><p><strong>E POI?</strong> nasce da un normale mazzo di carte e da un’idea precisa: tutti costruiscono la stessa storia, ma nessuno vuole portarla nello stesso punto.</p></div></header><section class="creator-manifesto"><div><p class="eyebrow">IL PUNTO</p><h3>Non un generatore di storie. Un gioco di intenzioni.</h3></div><p>Le carte impongono un tipo di scena. Gli obiettivi segreti creano il conflitto. Il divertimento arriva quando una frase sembra innocente, ma in realtà sta preparando il finale di qualcuno.</p></section><section class="creator-profile-pro"><img src="${CREATOR_IMAGE}" alt="Jita DesWadyas" width="800" height="800"><div><p class="eyebrow">CREATO DA</p><h3>Jita DesWadyas</h3><p class="creator-role">Sviluppatore · game designer · autore indipendente</p><p>Creo giochi, strumenti web e mondi narrativi. Con JitaDiSwadya porto lo stesso approccio nella musica: io canto le storie, tu le immagini.</p><div class="creator-links"><a href="https://github.com/JitaDesWadyas" target="_blank" rel="noopener noreferrer">GitHub <span aria-hidden="true">↗</span></a><span>JitaDiSwadya · Italia</span></div></div></section><section class="creator-roadmap-pro"><div><p class="eyebrow">DIREZIONE</p><h3>Prima deve funzionare in una serata vera.</h3><p>La web app prepara la partita, distribuisce gli obiettivi e toglie attrito. Le storie verranno migliorate con test reali; la versione fisica viene dopo.</p></div><ol><li class="done"><b>01</b><span>Idea e regole</span></li><li class="done"><b>02</b><span>Web app</span></li><li class="current"><b>03</b><span>Test pubblici</span></li><li><b>04</b><span>Nuove storie</span></li><li><b>05</b><span>Mazzo fisico</span></li></ol></section><footer class="creator-legal-links"><a href="privacy.html" target="_blank" rel="noopener">Privacy</a><a href="copyright.html" target="_blank" rel="noopener">Copyright e crediti</a><span>© 2026 Jita DesWadyas</span></footer></div>`;

  S.homeMarkup = () => {
    const saved = S.load();
    return `<section class="surface hero product-hero"><div class="hero-copy"><div class="hero-kicker"><p class="eyebrow">GIOCO NARRATIVO · CARTE · OBIETTIVI SEGRETI</p></div><h2 class="hero-title"><span class="line">Un gioco che mette alla prova</span><span class="line line-accent">creatività e immaginazione,</span><span class="line line-final">improvvisando.</span></h2><p class="hero-intro">Aggiungi una scena seguendo le carte. Mentre la storia prende forma, prova a guidarla verso il tuo <strong>obiettivo segreto</strong> senza farti scoprire.</p><div class="hero-divider" aria-hidden="true"><span>Una storia · più piani</span></div></div><div class="hero-actions"><button type="button" class="primary" data-home-play><span class="button-icon" aria-hidden="true">?</span><span>Gioca ora</span><span class="button-arrow" aria-hidden="true">→</span></button><button type="button" class="secondary" data-open-panel="tutorial"><span class="button-icon" aria-hidden="true">▶</span><span>Impara a giocare</span><span class="button-arrow" aria-hidden="true">↗</span></button></div></section><div class="home-divider" aria-hidden="true"><span>✦</span></div><div class="home-grid product-menu compact-product-menu">${saved ? `<button type="button" class="resume-card" data-home-resume><span class="index">↻</span><span><b>Riprendi la partita</b><small>${S.esc(S.sourceLabel(saved))} · ${saved.count || 0} giocatori</small></span><i>→</i></button>` : ''}<button type="button" class="choice-card" data-open-panel="tutorial"><span class="index">?</span><span><b>Inizia da qui</b><small>Impara con una partita guidata.</small></span><i>→</i></button><button type="button" class="choice-card" data-open-panel="rules"><span class="index">📖</span><span><b>Regole complete</b><small>Consultale quando serve.</small></span><i>→</i></button><button type="button" class="choice-card creator-menu-card" data-open-panel="info"><span class="creator-menu-image" aria-hidden="true"><img src="${CREATOR_IMAGE}" alt="" width="800" height="800"></span><span><b>Dietro E POI?</b><small>Perché esiste, chi l’ha creato e dove vuole arrivare.</small></span><i>→</i></button></div>`;
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
    root.querySelector('[data-tutorial-rules]')?.addEventListener('click', () => S.openHomePanel('rules'));
    root.addEventListener('keydown', event => { if (event.key === 'ArrowRight') goTo(index >= tutorialSteps.length - 1 ? 0 : index + 1, 'forward'); if (event.key === 'ArrowLeft') goTo(index - 1, 'back'); });
  };

  S.openHomePanel = panel => {
    const normalized = panel === 'how' ? 'tutorial' : panel;
    const panels = { rules: ['Regole', rulesMarkup()], tutorial: ['Impara a giocare', tutorialMarkup()], info: ['Dietro E POI?', infoMarkup()] };
    const selected = panels[normalized]; if (!selected) return;
    const modal = S.modal(selected[0], selected[1], { wide: true, className: `product-modal product-modal-${normalized}` });
    if (normalized === 'tutorial') S.bindTutorialIn(modal.host);
    if (normalized === 'rules') S.bindRulebook?.(modal.host);
  };
  S.bindHomeNavigation = () => { S.play.querySelectorAll('[data-open-panel]').forEach(button => button.addEventListener('click', () => S.openHomePanel(button.dataset.openPanel))); };
  S.renderHome = () => { S.currentSession = null; S.mount(S.homeMarkup(), { session: false }); S.play.querySelectorAll('[data-home-play]').forEach(button => button.addEventListener('click', () => S.renderSetup('play'))); S.play.querySelector('[data-home-resume]')?.addEventListener('click', () => S.resume(S.load())); S.bindHomeNavigation(); };
})();