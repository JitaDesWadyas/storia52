'use strict';

(() => {
  const S = window.S52;
  const CREATOR_IMAGE = 'creator-jita.svg';
  const opening = 'Durante una festa in una villa isolata, sparisce un quadro.';
  const objectives = {
    Marta: 'Fai ricadere la colpa sul padrone.',
    Luca: 'Rivela un segreto della famiglia.',
    Sara: 'Impedisci a tutti di lasciare la villa.'
  };
  const playedScenes = [
    { player: 'Marta', card: '♣ 8', meaning: 'Azione', said: 'Il padrone chiude le porte della villa e ritira i telefoni degli invitati.', why: 'È un’azione concreta. Prepara il sospetto sul padrone senza accusarlo direttamente.', tone: 'clubs' },
    { player: 'Luca', card: '♦ J', meaning: 'Scoperta + nuovo oggetto', said: 'Nel camino, Luca trova una fotografia mezza bruciata che mostra il quadro nella villa molti anni prima.', why: 'Il Quadri introduce una scoperta; il J aggiunge un oggetto. La fotografia può portare al segreto di famiglia.', tone: 'diamonds' },
    { player: 'Sara', card: '♠ 5', meaning: 'Ostacolo', said: 'Un blackout blocca le serrature elettroniche e nessuno riesce più ad aprire le porte.', why: 'È un problema nuovo e coerente. Aiuta Sara a impedire la fuga, ma lascia agli altri la possibilità di reagire.', tone: 'spades' }
  ];
  const finale = 'Marta mostra che, sul retro della fotografia, si vede il padrone mentre nasconde il quadro. Aveva inscenato il furto per incassare l’assicurazione.';

  const tutorialSteps = [
    { kind: 'goal', eyebrow: '1 · COSA STATE FACENDO', title: 'Continuate insieme una storia, ma ognuno prepara un finale diverso.', body: 'Non dovete indovinare una risposta corretta. A turno aggiungete nuovi fatti alla stessa storia. Nel frattempo provate a rendere possibile il vostro obiettivo segreto senza dichiararlo agli altri.' },
    { kind: 'setup', eyebrow: '2 · PRIMA DI INIZIARE', title: 'Preparate la partita in quattro passaggi.', body: 'La web app fornisce la storia e gli obiettivi. Il mazzo fisico decide che tipo di scena potete aggiungere.' },
    { kind: 'turn', eyebrow: '3 · COSA FAI NEL TUO TURNO', title: 'Guarda la mano, scegli una carta e pronuncia una nuova scena.', body: 'Il turno non è una discussione libera. La carta scelta impone un vincolo preciso alla frase che aggiungi.' },
    { kind: 'meaning', eyebrow: '4 · COME LEGGERE LA CARTA', title: 'Prima leggi il seme. Poi controlla numero, figura o asso.', body: 'Il seme stabilisce la categoria della scena. Il valore aggiunge eventuali condizioni. La carta non scrive la frase al posto tuo: ti dice che genere di fatto devi inventare.' },
    { kind: 'example', sceneIndex: 0, eyebrow: '5 · ESEMPIO: PRIMO TURNO', title: 'Marta sceglie un’Azione e dice cosa accade.' },
    { kind: 'example', sceneIndex: 1, eyebrow: '6 · ESEMPIO: TURNO SUCCESSIVO', title: 'Luca deve continuare da ciò che Marta ha già stabilito.' },
    { kind: 'example', sceneIndex: 2, eyebrow: '7 · ESEMPIO: USARE IL PROPRIO OBIETTIVO', title: 'Sara spinge la storia verso il suo piano senza rivelarlo.' },
    { kind: 'limits', eyebrow: '8 · COSA NON PUOI DIRE', title: 'Puoi aggiungere. Non puoi cancellare, contraddire o decidere tutto da solo.', body: 'Ogni scena deve lasciare una situazione comprensibile al giocatore successivo. Gli altri possono contestare soltanto una scena che viola la carta o contraddice chiaramente la storia.' },
    { kind: 'ending', eyebrow: '9 · COME FINISCE', title: 'Quando giochi l’ultima carta, puoi tentare il finale.', body: 'Riveli il tuo obiettivo e racconti una conclusione che lo raggiunge usando elementi già introdotti. Se il collegamento è coerente, vinci. Se è forzato o inventa tutto all’ultimo momento, la partita continua.' },
    { kind: 'ready', eyebrow: '10 · ADESSO PUOI GIOCARE', title: 'Il ciclo completo è sempre questo.', body: 'Scegli una carta → leggi il suo vincolo → aggiungi una scena → passa il turno → prepara in segreto il tuo finale.' }
  ];

  const progress = index => tutorialSteps.map((_, i) => `<span class="${i === index ? 'active' : i < index ? 'done' : ''}"></span>`).join('');
  const objectiveCards = () => `<div class="tutorial-objectives"><article><small>MARTA VEDE</small><b>${S.esc(objectives.Marta)}</b></article><article><small>LUCA VEDE</small><b>${S.esc(objectives.Luca)}</b></article><article><small>SARA VEDE</small><b>${S.esc(objectives.Sara)}</b></article></div><p class="tutorial-private-note"><strong>Importante:</strong> nella partita reale ogni persona legge soltanto la propria scheda.</p>`;
  const storyTimeline = count => `<section class="tutorial-timeline"><header><span>STORIA CONDIVISA</span><p>${S.esc(opening)}</p></header>${playedScenes.slice(0, count).map((scene, i) => `<article class="${i === count - 1 ? 'current' : ''}"><i>${i + 1}</i><div><b>${S.esc(scene.player)} · ${S.esc(scene.card)}</b><p>${S.esc(scene.said)}</p></div></article>`).join('')}</section>`;
  const cardRules = () => `<div class="tutorial-suits"><article><b class="red">♥</b><div><strong>Relazione</strong><p>Un rapporto aiuta o peggiora la situazione. Pari = positivo, dispari = negativo.</p></div></article><article><b class="red">♦</b><div><strong>Scoperta</strong><p>Viene scoperto qualcosa. Pari = utile, dispari = problematico.</p></div></article><article><b>♣</b><div><strong>Azione</strong><p>Un personaggio compie un’azione concreta.</p></div></article><article><b>♠</b><div><strong>Ostacolo</strong><p>Compare un problema che rende tutto più difficile.</p></div></article></div><div class="tutorial-special-cards"><b>Carte speciali</b><span><strong>J</strong> nuovo oggetto</span><span><strong>Q</strong> nuovo personaggio</span><span><strong>K</strong> nuovo luogo</span><span><strong>A</strong> colpo di scena</span><p>Una figura rossa entra a favore; una figura nera entra come problema.</p></div>`;

  const exampleMarkup = sceneIndex => {
    const scene = playedScenes[sceneIndex];
    const previous = sceneIndex === 0 ? opening : playedScenes[sceneIndex - 1].said;
    return `<div class="tutorial-example tutorial-tone-${scene.tone}"><section class="tutorial-before"><span>PRIMA DEL TURNO</span><p>${S.esc(previous)}</p></section><div class="tutorial-example-main"><div class="tutorial-card-demo"><small>CARTA SCELTA</small><b>${S.esc(scene.card)}</b><span>${S.esc(scene.meaning)}</span></div><div class="tutorial-decision"><div><span>1. IL GIOCATORE LEGGE IL VINCOLO</span><p>Con <strong>${S.esc(scene.card)}</strong> deve aggiungere: <strong>${S.esc(scene.meaning.toLowerCase())}</strong>.</p></div><div><span>2. PENSA AL PROPRIO OBIETTIVO</span><p>${S.esc(objectives[scene.player])}</p></div><div class="tutorial-spoken"><span>3. DICE AD ALTA VOCE</span><blockquote>“${S.esc(scene.said)}”</blockquote></div><div><span>4. PERCHÉ LA FRASE È VALIDA</span><p>${S.esc(scene.why)}</p></div></div></div>${storyTimeline(sceneIndex + 1)}<aside class="tutorial-pass"><b>Turno concluso.</b><span>Ora il giocatore successivo parte da questa nuova situazione.</span></aside></div>`;
  };

  const stepContent = step => {
    if (step.kind === 'goal') return `<div class="tutorial-goal"><div><span>STESSO INCIPIT</span><b>${S.esc(opening)}</b></div>${objectiveCards()}</div>`;
    if (step.kind === 'setup') return `<div class="tutorial-setup"><article><span>1</span><div><b>Scegliete una storia</b><p>Leggete l’incipit ad alta voce. È il punto di partenza comune.</p></div></article><article><span>2</span><div><b>Preparate il mazzo</b><p>Togliete i jolly, mescolate e date 5 carte a ogni giocatore.</p></div></article><article><span>3</span><div><b>Aprite gli obiettivi</b><p>Passate il telefono. Ognuno legge soltanto il proprio obiettivo segreto.</p></div></article><article><span>4</span><div><b>Stabilite il primo giocatore</b><p>Dopo il suo turno si continua in ordine, una persona alla volta.</p></div></article></div>`;
    if (step.kind === 'turn') return `<div class="tutorial-turn"><article><span>A</span><div><b>Controlla la tua mano</b><p>Scegli una carta che ti permetta di aggiungere una scena sensata. Se vuoi, prima puoi scartare una carta e pescarne una.</p></div></article><article><span>B</span><div><b>Metti la carta sul tavolo</b><p>Dichiara seme e valore, così tutti sanno quale vincolo stai usando.</p></div></article><article><span>C</span><div><b>Pronuncia una scena</b><p>Dici una frase che aggiunge un nuovo fatto. La frase deve rispettare la carta e ciò che è già successo.</p></div></article><article><span>D</span><div><b>Passa al giocatore dopo</b><p>Non racconti anche la sua reazione. Lasci che sia il turno successivo a continuare.</p></div></article></div><aside class="tutorial-core-rule"><strong>Formula pratica:</strong><span>“Gioco questa carta, quindi nella storia succede che…”</span></aside>`;
    if (step.kind === 'meaning') return cardRules();
    if (step.kind === 'example') return exampleMarkup(step.sceneIndex);
    if (step.kind === 'limits') return `<div class="tutorial-do-dont"><section><h4>Puoi farlo</h4><p>“La detective trova una seconda chiave sotto il tappeto.”</p><small>Aggiunge una scoperta e lascia aperte conseguenze future.</small></section><section><h4>Non puoi farlo</h4><p>“Il quadro non è mai sparito, il colpevole confessa e tutti tornano a casa.”</p><small>Cancella l’incipit, risolve tutto e impedisce agli altri di giocare.</small></section></div><div class="tutorial-checklist"><b>Prima di parlare, controlla:</b><span>La mia frase rispetta la carta?</span><span>È compatibile con la storia?</span><span>Aggiunge un solo passaggio comprensibile?</span><span>Lascia spazio al turno successivo?</span></div>`;
    if (step.kind === 'ending') return `${storyTimeline(playedScenes.length)}<div class="tutorial-ending"><section><span>ULTIMA CARTA DI MARTA</span><b>♥ 10 · relazione positiva</b></section><section><span>OBIETTIVO RIVELATO</span><b>${S.esc(objectives.Marta)}</b></section><blockquote>“${S.esc(finale)}”</blockquote><div><b>Perché Marta vince</b><p>Il padrone, il quadro e la fotografia erano già nella storia. Il finale collega questi elementi e raggiunge esattamente il suo obiettivo.</p></div></div>`;
    return `<div class="tutorial-cycle"><span>Scegli</span><i>→</i><span>Leggi</span><i>→</i><span>Racconta</span><i>→</i><span>Passa</span></div><div class="tutorial-ready-actions"><button type="button" class="primary" data-tutorial-play>Prepara una partita <span aria-hidden="true">→</span></button><button type="button" class="secondary" data-tutorial-rules>Consulta le regole</button></div>`;
  };

  const stepMarkup = index => {
    const step = tutorialSteps[index];
    return `<div class="tutorial-pro"><div class="tutorial-pro-top"><div><p class="eyebrow">${S.esc(step.eyebrow)}</p><small>Passaggio ${index + 1} di ${tutorialSteps.length}</small></div><div class="tutorial-progress" aria-label="Avanzamento">${progress(index)}</div></div><header class="tutorial-pro-heading"><h3>${S.esc(step.title)}</h3><p>${S.esc(step.body || '')}</p></header>${stepContent(step)}</div>`;
  };

  const tutorialMarkup = () => `<div class="screen-heading modal-heading tutorial-heading"><p class="eyebrow">TUTORIAL COMPLETO</p><h2>Impara cosa fare davvero durante una partita.</h2><p>Segui l’intero ciclo: preparazione, scelta della carta, frase da dire, continuazione della storia e finale.</p></div><div data-tutorial-host>${stepMarkup(0)}</div><div class="tutorial-actions"><button type="button" class="secondary" data-tutorial-prev disabled>Indietro</button><button type="button" class="primary" data-tutorial-next>Avanti <span aria-hidden="true">→</span></button></div>`;
  const rulesMarkup = () => `<div class="screen-heading modal-heading"><p class="eyebrow">RIFERIMENTO RAPIDO</p><h2>Regole complete.</h2><p>Il tutorial insegna a giocare. Qui puoi ricontrollare il significato preciso di carte, turno e finale.</p></div>${S.rulesMarkup ? S.rulesMarkup() : ''}`;

  const infoMarkup = () => `<div class="creator-editorial"><header class="creator-editorial-hero"><figure class="creator-portrait"><img src="${CREATOR_IMAGE}" alt="Jita DesWadyas" width="800" height="800"></figure><div><p class="eyebrow">DIETRO E POI?</p><h2>Una storia condivisa.<br>Più piani nascosti.</h2><p><strong>E POI?</strong> nasce da un normale mazzo di carte e da un’idea precisa: tutti costruiscono la stessa storia, ma nessuno vuole portarla nello stesso punto.</p></div></header><section class="creator-manifesto"><div><p class="eyebrow">IL PUNTO</p><h3>Non un generatore di storie. Un gioco di intenzioni.</h3></div><p>Le carte impongono un tipo di scena. Gli obiettivi segreti creano il conflitto. Il divertimento arriva quando una frase sembra innocente, ma in realtà sta preparando il finale di qualcuno.</p></section><section class="creator-profile-pro"><img src="${CREATOR_IMAGE}" alt="Jita DesWadyas" width="800" height="800"><div><p class="eyebrow">CREATO DA</p><h3>Jita DesWadyas</h3><p class="creator-role">Sviluppatore · game designer · autore indipendente</p><p>Creo giochi, strumenti web e mondi narrativi. Con JitaDiSwadya porto lo stesso approccio nella musica: io canto le storie, tu le immagini.</p><div class="creator-links"><a href="https://github.com/JitaDesWadyas" target="_blank" rel="noopener noreferrer">GitHub <span aria-hidden="true">↗</span></a><span>JitaDiSwadya · Italia</span></div></div></section><section class="creator-roadmap-pro"><div><p class="eyebrow">DIREZIONE</p><h3>Prima deve funzionare in una serata vera.</h3><p>La web app prepara la partita, distribuisce gli obiettivi e toglie attrito. Le storie verranno migliorate con test reali; la versione fisica viene dopo.</p></div><ol><li class="done"><b>01</b><span>Idea e regole</span></li><li class="done"><b>02</b><span>Web app</span></li><li class="current"><b>03</b><span>Test pubblici</span></li><li><b>04</b><span>Nuove storie</span></li><li><b>05</b><span>Mazzo fisico</span></li></ol></section><footer class="creator-legal-links"><a href="privacy.html" target="_blank" rel="noopener">Privacy</a><a href="copyright.html" target="_blank" rel="noopener">Copyright e crediti</a><span>© 2026 Jita DesWadyas</span></footer></div>`;

  S.homeMarkup = () => {
    const saved = S.load();
    return `<section class="surface hero product-hero"><div class="hero-copy"><div class="hero-kicker"><p class="eyebrow">GIOCO NARRATIVO · CARTE · OBIETTIVI SEGRETI</p></div><h2 class="hero-title"><span class="line">Un gioco che mette alla prova</span><span class="line line-accent">creatività e immaginazione,</span><span class="line line-final">improvvisando.</span></h2><p class="hero-intro">Aggiungi una scena seguendo le carte. Mentre la storia prende forma, prova a guidarla verso il tuo <strong>obiettivo segreto</strong> senza farti scoprire.</p><div class="hero-divider" aria-hidden="true"><span>Una storia · più piani</span></div></div><div class="hero-actions"><button type="button" class="primary" data-home-play><span class="button-icon" aria-hidden="true">?</span><span>Gioca ora</span><span class="button-arrow" aria-hidden="true">→</span></button><button type="button" class="secondary" data-open-panel="tutorial"><span class="button-icon" aria-hidden="true">▶</span><span>Impara a giocare</span><span class="button-arrow" aria-hidden="true">↗</span></button></div></section><div class="home-divider" aria-hidden="true"><span>✦</span></div><div class="home-grid product-menu compact-product-menu">${saved ? `<button type="button" class="resume-card" data-home-resume><span class="index">↻</span><span><b>Riprendi la partita</b><small>${S.esc(S.sourceLabel(saved))} · ${saved.count || 0} giocatori</small></span><i>→</i></button>` : ''}<button type="button" class="choice-card" data-open-panel="tutorial"><span class="index">?</span><span><b>Inizia da qui</b><small>Tutorial completo, passo per passo.</small></span><i>→</i></button><button type="button" class="choice-card" data-open-panel="rules"><span class="index">📖</span><span><b>Regole complete</b><small>Riferimento rapido durante la partita.</small></span><i>→</i></button><button type="button" class="choice-card creator-menu-card" data-open-panel="info"><span class="creator-menu-image" aria-hidden="true"><img src="${CREATOR_IMAGE}" alt="" width="800" height="800"></span><span><b>Dietro E POI?</b><small>Perché esiste, chi l’ha creato e dove vuole arrivare.</small></span><i>→</i></button></div>`;
  };

  S.bindTutorialIn = root => {
    let index = 0;
    const host = root.querySelector('[data-tutorial-host]');
    const prev = root.querySelector('[data-tutorial-prev]');
    const next = root.querySelector('[data-tutorial-next]');
    if (!host || !prev || !next) return;
    const bindStepActions = () => {
      host.querySelector('[data-tutorial-rules]')?.addEventListener('click', () => S.openHomePanel('rules'));
      host.querySelector('[data-tutorial-play]')?.addEventListener('click', () => { S.closeModal?.(); S.renderSetup('play'); });
    };
    const render = direction => {
      host.classList.remove('tutorial-swap-forward', 'tutorial-swap-back'); void host.offsetWidth;
      host.classList.add(direction === 'back' ? 'tutorial-swap-back' : 'tutorial-swap-forward');
      host.innerHTML = stepMarkup(index);
      prev.disabled = index === 0;
      next.innerHTML = index === tutorialSteps.length - 1 ? 'Ricomincia <span aria-hidden="true">↻</span>' : 'Avanti <span aria-hidden="true">→</span>';
      bindStepActions();
    };
    const goTo = (nextIndex, direction = 'forward') => { index = Math.max(0, Math.min(tutorialSteps.length - 1, nextIndex)); render(direction); };
    prev.addEventListener('click', () => goTo(index - 1, 'back'));
    next.addEventListener('click', () => goTo(index >= tutorialSteps.length - 1 ? 0 : index + 1, index >= tutorialSteps.length - 1 ? 'back' : 'forward'));
    root.addEventListener('keydown', event => { if (event.key === 'ArrowRight') goTo(index >= tutorialSteps.length - 1 ? 0 : index + 1); if (event.key === 'ArrowLeft') goTo(index - 1, 'back'); });
  };

  S.openHomePanel = panel => {
    const normalized = panel === 'how' ? 'tutorial' : panel;
    const panels = { tutorial: ['Tutorial', tutorialMarkup()], rules: ['Regole', rulesMarkup()], info: ['Dietro E POI?', infoMarkup()] };
    const selected = panels[normalized]; if (!selected) return;
    const modal = S.modal(selected[0], selected[1], { wide: true, className: `product-modal product-modal-${normalized}` });
    if (normalized === 'tutorial') S.bindTutorialIn(modal.host);
    if (normalized === 'rules') S.bindRulebook?.(modal.host);
  };
  S.bindHomeNavigation = () => { S.play.querySelectorAll('[data-open-panel]').forEach(button => button.addEventListener('click', () => S.openHomePanel(button.dataset.openPanel))); };
  S.renderHome = () => { S.currentSession = null; S.mount(S.homeMarkup(), { session: false }); S.play.querySelectorAll('[data-home-play]').forEach(button => button.addEventListener('click', () => S.renderSetup('play'))); S.play.querySelector('[data-home-resume]')?.addEventListener('click', () => S.resume(S.load())); S.bindHomeNavigation(); };
})();