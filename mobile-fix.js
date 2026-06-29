'use strict';

(() => {
  const STORAGE_KEY = 'storia52_guided_session_v1';
  const game = document.querySelector('#game');
  const originalQuickMode = window.quickMode;
  const originalMultiMode = window.multiMode;
  const originalShowMulti = window.showMulti;

  const SUIT_GUIDE = {
    hearts: { label: 'Cuori', symbol: '♥', text: 'Cambia un rapporto.', red: true },
    diamonds: { label: 'Quadri', symbol: '♦', text: 'Rivela un’informazione, una verità o un indizio.', red: true },
    clubs: { label: 'Fiori', symbol: '♣', text: 'Tenta un’azione.', red: false },
    spades: { label: 'Picche', symbol: '♠', text: 'Introduce una conseguenza, un ostacolo o una perdita.', red: false }
  };

  const FIGURE_GUIDE = {
    A: 'Ribalta la situazione.',
    J: 'Introduce un nuovo oggetto.',
    Q: 'Introduce un nuovo personaggio.',
    K: 'Introduce un nuovo luogo.'
  };

  function loadSession() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); }
    catch { return null; }
  }

  function saveSession(session) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(session)); }
    catch { /* La partita continua anche senza salvataggio locale. */ }
  }

  function clearSession() {
    try { localStorage.removeItem(STORAGE_KEY); }
    catch { /* Nessuna azione necessaria. */ }
  }

  function randomIndex(max) {
    const values = new Uint32Array(1);
    crypto.getRandomValues(values);
    return values[0] % max;
  }

  function makeSession(count = 4) {
    const seed = createCode();
    return {
      stage: 'story',
      seed,
      count,
      story: storyFromSeed(seed),
      objectives: Array.from({ length: count }, (_, index) => objectiveFromSeed(seed, index + 1)),
      confirmed: Array(count).fill(false),
      cardCounts: Array(count).fill(5),
      currentPlayer: 0,
      firstPlayer: randomIndex(count),
      round: 1,
      checklist: [false, false, false, false]
    };
  }

  function setGameContent(html) {
    if (!game) return;
    game.classList.remove('hidden');
    game.innerHTML = html;
    scrollToGame();
  }

  function progress(step, label) {
    const total = 6;
    return `<div class="guide-progress" aria-label="Passaggio ${step} di ${total}">
      <div class="guide-progress-copy"><span>PASSAGGIO ${step} DI ${total}</span><b>${label}</b></div>
      <div class="guide-progress-track"><i style="width:${(step / total) * 100}%"></i></div>
    </div>`;
  }

  function homeSetup() {
    const hero = document.querySelector('.hero-copy');
    const heading = document.querySelector('#play .section-heading');
    const modes = document.querySelector('#play .mode-grid');
    if (!hero || !heading || !modes) return;

    hero.querySelector('.section-kicker').textContent = 'IL SITO TI SPIEGA COSA FARE, PASSO DOPO PASSO.';
    hero.querySelector('h2').textContent = 'Apri il mazzo. Al resto pensiamo insieme.';
    hero.querySelector('h2 + p').textContent = 'Il sito crea la storia, assegna gli obiettivi e guida ogni turno. Le carte fisiche restano al centro del gioco.';

    if (!hero.querySelector('.hero-actions')) {
      const actions = document.createElement('div');
      actions.className = 'hero-actions';
      actions.innerHTML = `<button type="button" class="button button-primary" id="heroGuidedStart">Inizia una partita guidata</button>
        <button type="button" class="button button-ghost" id="heroExample">Guarda un turno di esempio</button>`;
      hero.appendChild(actions);
    }

    heading.innerHTML = `<div><p class="eyebrow">PRIMA VOLTA?</p><h2>Parti da qui.</h2></div><span class="rule-line" aria-hidden="true"></span>`;

    const saved = loadSession();
    modes.innerHTML = `${saved ? `<div class="resume-guide-card"><div><span>PARTITA SALVATA</span><b>Continua da dove eri rimasto</b></div><button type="button" class="button button-dark" id="resumeGuided">Riprendi</button></div>` : ''}
      <button type="button" class="guided-mode-card" id="guidedStart">
        <span class="guided-mode-icon">▶</span>
        <span><b>Partita guidata</b><small>Un solo telefono. Il sito accompagna preparazione, obiettivi, turni e finale.</small></span>
        <span class="guided-mode-arrow">Inizia →</span>
      </button>
      <button type="button" class="guided-example-card" id="guidedExample">
        <span class="example-card-rank">6♥</span>
        <span><b>Non sai ancora come si racconta un turno?</b><small>Guarda un esempio completo in meno di un minuto.</small></span>
      </button>
      <details class="advanced-modes">
        <summary>Strumenti e modalità per chi conosce già il gioco</summary>
        <div class="advanced-mode-grid">
          <button type="button" data-advanced="multi"><b>Un telefono a testa</b><small>Crea inviti privati per ogni giocatore.</small></button>
          <button type="button" data-advanced="quick"><b>Generatore rapido</b><small>Genera soltanto incipit e obiettivo.</small></button>
          <button type="button" data-advanced="rules"><b>Leggi tutte le regole</b><small>Consulta il regolamento completo.</small></button>
        </div>
      </details>`;

    document.querySelector('#heroGuidedStart')?.addEventListener('click', renderPreflight);
    document.querySelector('#heroExample')?.addEventListener('click', renderStandaloneExample);
    document.querySelector('#guidedStart')?.addEventListener('click', renderPreflight);
    document.querySelector('#guidedExample')?.addEventListener('click', renderStandaloneExample);
    document.querySelector('#resumeGuided')?.addEventListener('click', () => renderSession(saved));

    modes.querySelector('[data-advanced="multi"]')?.addEventListener('click', () => {
      game.classList.remove('hidden');
      originalMultiMode?.(game);
      scrollToGame();
    });
    modes.querySelector('[data-advanced="quick"]')?.addEventListener('click', () => {
      game.classList.remove('hidden');
      originalQuickMode?.(game);
      scrollToGame();
    });
    modes.querySelector('[data-advanced="rules"]')?.addEventListener('click', () => openPage('rules'));
  }

  function renderPreflight() {
    setGameContent(`${progress(1, 'Prima di iniziare')}
      <div class="guide-heading"><p class="eyebrow">SERVONO TRE COSE</p><h2>Preparate il tavolo.</h2><p>Il telefono non sostituisce il mazzo: vi assegna la storia e vi dice cosa fare durante la partita.</p></div>
      <div class="need-grid">
        <div class="need-card"><span>♠</span><b>Un mazzo da 52 carte</b><small>Togliete i jolly.</small></div>
        <div class="need-card"><span>●</span><b>Da 2 a 10 giocatori</b><small>Seduti in modo da sentirsi bene.</small></div>
        <div class="need-card"><span>▣</span><b>Un solo telefono</b><small>Lo passerete solo per leggere gli obiettivi.</small></div>
      </div>
      <div class="guide-callout"><b>Cosa farà il sito</b><p>Creerà l’incipit, assegnerà un obiettivo segreto a ciascuno e resterà aperto come guida dei turni.</p></div>
      <div class="button-row"><button type="button" class="button button-primary" id="preflightContinue">Ho tutto — continua</button><button type="button" class="button button-ghost" id="preflightRules">Prima fammi vedere le regole</button></div>`);

    document.querySelector('#preflightContinue')?.addEventListener('click', renderPlayerSetup);
    document.querySelector('#preflightRules')?.addEventListener('click', () => openPage('rules'));
  }

  function renderPlayerSetup() {
    setGameContent(`${progress(2, 'Giocatori')}
      <div class="guide-heading"><p class="eyebrow">CONFIGURAZIONE SEMPLICE</p><h2>Quanti siete?</h2><p>Per la prima partita il sito sceglie automaticamente tutte le carte narrative. Non dovete configurare altro.</p></div>
      <label class="big-player-field"><span>NUMERO DI GIOCATORI</span><select id="guidedPlayerCount" aria-label="Numero di giocatori">${Array.from({ length: 9 }, (_, index) => index + 2).map(value => `<option value="${value}"${value === 4 ? ' selected' : ''}>${value} giocatori</option>`).join('')}</select></label>
      <div class="guide-callout compact"><b>Come userete il telefono</b><p>Resterà al centro. Quando appare un obiettivo, lo passerete soltanto al giocatore indicato.</p></div>
      <div class="button-row"><button type="button" class="button button-primary" id="createGuidedGame">Crea la partita</button><button type="button" class="button button-ghost" id="setupBack">Indietro</button></div>`);

    document.querySelector('#createGuidedGame')?.addEventListener('click', () => {
      const count = Number(document.querySelector('#guidedPlayerCount')?.value) || 4;
      const session = makeSession(count);
      saveSession(session);
      renderStory(session);
    });
    document.querySelector('#setupBack')?.addEventListener('click', renderPreflight);
  }

  function renderStory(session) {
    session.stage = 'story';
    saveSession(session);
    const story = withStoryGoal(session.story, session.seed);
    setGameContent(`${progress(3, 'Incipit comune')}
      <div class="guide-heading"><p class="eyebrow">LEGGETE TUTTO AD ALTA VOCE</p><h2>Questa è la vostra storia.</h2><p>Non dovete scegliere una delle frasi. Vanno usate tutte insieme come punto di partenza.</p></div>
      <div class="read-aloud-box"><span>INCIPIT DA LEGGERE</span>
        <p><b>Il protagonista è</b> ${cardText('protagonist', story.protagonist)}</p>
        <p><b>La situazione iniziale è:</b> ${cardText('situation', story.situation)}</p>
        <p><b>Il suo obiettivo è:</b> ${cardText('objective', story.goal)}</p>
        <p><b>Ma il problema è:</b> ${cardText('problem', story.problem)}</p>
      </div>
      <details class="raw-story-details"><summary>Mostra le quattro carte dell’incipit</summary>${storyStack(story, session.seed)}</details>
      <div class="guide-callout"><b>Prima di continuare</b><p>Date un nome al protagonista e chiarite in una frase dove si trova. Non aggiungete ancora soluzioni al problema.</p></div>
      <div class="button-row"><button type="button" class="button button-primary" id="storyUnderstood">Abbiamo capito la storia</button><button type="button" class="button button-ghost" id="storyRegenerate">Genera un altro incipit</button></div>`);

    document.querySelector('#storyUnderstood')?.addEventListener('click', () => renderObjectives(session));
    document.querySelector('#storyRegenerate')?.addEventListener('click', () => {
      const replacement = makeSession(session.count);
      saveSession(replacement);
      renderStory(replacement);
    });
  }

  function renderObjectives(session) {
    session.stage = 'objectives';
    saveSession(session);
    const confirmedCount = session.confirmed.filter(Boolean).length;
    const players = session.objectives.map((_, index) => `<button type="button" class="player-slot${session.confirmed[index] ? ' viewed confirmed' : ''}" data-player="${index}">
      <span class="player-badge">${index + 1}</span>
      <span class="player-meta"><b>Giocatore ${index + 1}</b><small>${session.confirmed[index] ? 'Obiettivo memorizzato' : 'Da leggere in segreto'}</small></span>
      <span class="player-action">${session.confirmed[index] ? 'Riapri' : 'Apri'}</span>
    </button>`).join('');

    setGameContent(`${progress(4, 'Obiettivi segreti')}
      <div class="guide-heading"><p class="eyebrow">PASSATE IL TELEFONO</p><h2>Un obiettivo alla volta.</h2><p>Gli altri distolgono lo sguardo. Il giocatore legge, memorizza e conferma prima di restituire il telefono.</p></div>
      <div class="objective-status"><span>${confirmedCount}/${session.count}</span><div><b>Giocatori pronti</b><small>${confirmedCount === session.count ? 'Tutti gli obiettivi sono stati letti.' : 'Mancano ancora alcuni giocatori.'}</small></div></div>
      <div class="player-list">${players}</div>
      ${confirmedCount === session.count ? '<div class="all-ready-banner"><b>Tutti pronti.</b><p>Ora preparate le carte fisiche.</p></div><div class="button-row"><button type="button" class="button button-primary" id="objectivesContinue">Prepara il mazzo</button></div>' : ''}`);

    document.querySelectorAll('.player-slot').forEach(button => button.addEventListener('click', () => openObjectiveModal(session, Number(button.dataset.player), false)));
    document.querySelector('#objectivesContinue')?.addEventListener('click', () => renderTableSetup(session));
  }

  function openObjectiveModal(session, index, duringGame) {
    document.querySelector('.player-modal')?.remove();
    let revealed = false;
    const modal = document.createElement('div');
    modal.className = 'player-modal';

    function close() { modal.remove(); }

    function draw() {
      modal.innerHTML = `<button type="button" class="player-modal-backdrop" aria-label="Chiudi"></button>
        <div class="player-modal-card">
          <div class="modal-head"><div><p class="eyebrow">GIOCATORE ${index + 1}</p><h3>${duringGame ? 'Il tuo obiettivo segreto' : 'Leggi e memorizza'}</h3><p>Passa il telefono soltanto a questo giocatore.</p></div><button type="button" class="icon-button" id="closeObjective" aria-label="Chiudi">×</button></div>
          <div class="secret-card${revealed ? ' open' : ''}">${revealed ? secretContent(session.objectives[index]) : secretClosed(`Passa il telefono al giocatore ${index + 1}`, 'Gli altri devono distogliere lo sguardo.')}</div>
          <div class="button-row"><button type="button" id="revealObjective" class="button button-primary">${revealed ? 'Nascondi' : 'Rivela obiettivo'}</button>${revealed && !duringGame ? '<button type="button" id="confirmObjective" class="button button-dark">Ho letto e memorizzato</button>' : ''}${duringGame ? '<button type="button" id="doneObjective" class="button button-ghost">Chiudi</button>' : ''}</div>
        </div>`;
      modal.querySelector('.player-modal-backdrop')?.addEventListener('click', close);
      modal.querySelector('#closeObjective')?.addEventListener('click', close);
      modal.querySelector('#doneObjective')?.addEventListener('click', close);
      modal.querySelector('#revealObjective')?.addEventListener('click', () => { revealed = !revealed; draw(); });
      modal.querySelector('#confirmObjective')?.addEventListener('click', () => {
        session.confirmed[index] = true;
        saveSession(session);
        close();
        renderObjectives(session);
      });
    }

    document.body.appendChild(modal);
    draw();
  }

  function renderTableSetup(session) {
    session.stage = 'table';
    saveSession(session);
    setGameContent(`${progress(5, 'Preparazione del mazzo')}
      <div class="guide-heading"><p class="eyebrow">ORA USATE LE CARTE FISICHE</p><h2>Preparate il tavolo così.</h2></div>
      <div class="table-setup-list">
        <div><span>1</span><p><b>Togliete i jolly</b><small>Servono soltanto le 52 carte normali.</small></p></div>
        <div><span>2</span><p><b>Mescolate il mazzo</b><small>Una persona può farlo mentre gli altri finiscono di leggere.</small></p></div>
        <div><span>3</span><p><b>Date 5 carte a ciascuno</b><small>Tenetele in mano e non mostratele.</small></p></div>
        <div><span>4</span><p><b>Mettete il mazzo al centro</b><small>Lasciate accanto uno spazio per gli scarti.</small></p></div>
        <div><span>5</span><p><b>Non cercate l’obiettivo nel mazzo</b><small>L’obiettivo segreto sul telefono è separato dalle cinque carte.</small></p></div>
      </div>
      <div class="first-player-box"><span>COMINCIA</span><strong>Giocatore ${session.firstPlayer + 1}</strong><p>Il sito lo ha scelto casualmente.</p></div>
      <div class="button-row"><button type="button" class="button button-primary" id="tableReady">Mazzo pronto — mostrami un esempio</button></div>`);

    document.querySelector('#tableReady')?.addEventListener('click', () => renderTutorial(session));
  }

  function exampleMarkup() {
    return `<div class="example-turn">
      <div class="example-card"><span>6</span><b>♥</b><small>CUORI</small></div>
      <div class="example-explanation">
        <div><span>1</span><p><b>Cuori = rapporto</b><small>La scena deve cambiare un rapporto tra personaggi.</small></p></div>
        <div><span>2</span><p><b>6 = pari</b><small>La scena deve avvicinare il protagonista al suo obiettivo.</small></p></div>
        <div><span>3</span><p><b>Usa qualcosa già introdotto</b><small>Non inventare una soluzione scollegata da ciò che è successo.</small></p></div>
      </div>
    </div>
    <div class="spoken-example"><span>ESEMPIO DI SCENA</span><p>“La sorella del protagonista, che prima non voleva aiutarlo, decide di consegnargli la chiave trovata nella scena precedente.”</p></div>
    <div class="why-it-works"><b>Perché funziona</b><p>Cambia un rapporto, aiuta il protagonista e riutilizza la chiave già comparsa nella storia.</p></div>`;
  }

  function renderTutorial(session) {
    session.stage = 'tutorial';
    saveSession(session);
    setGameContent(`${progress(6, 'Primo turno')}
      <div class="guide-heading"><p class="eyebrow">ESEMPIO COMPLETO</p><h2>Come trasformare una carta in una scena.</h2><p>Non dovete descrivere la carta. Dovete raccontare cosa succede nella storia rispettando il suo significato.</p></div>
      ${exampleMarkup()}
      <div class="button-row"><button type="button" class="button button-primary" id="startActualGame">Ho capito — inizia la partita</button></div>`);

    document.querySelector('#startActualGame')?.addEventListener('click', () => {
      session.stage = 'play';
      session.currentPlayer = session.firstPlayer;
      session.checklist = [false, false, false, false];
      saveSession(session);
      renderDashboard(session);
    });
  }

  function renderStandaloneExample() {
    setGameContent(`<div class="guide-progress standalone"><div class="guide-progress-copy"><span>PROVA PRIMA DI GIOCARE</span><b>Un turno spiegato bene</b></div></div>
      <div class="guide-heading"><p class="eyebrow">ESEMPIO COMPLETO</p><h2>Dal 6 di Cuori a una scena.</h2><p>Questo è il ragionamento che un giocatore deve fare quando posa una carta.</p></div>
      ${exampleMarkup()}
      <div class="button-row"><button type="button" class="button button-primary" id="exampleStartGame">Inizia una partita guidata</button><button type="button" class="button button-ghost" id="exampleRules">Leggi tutte le regole</button></div>`);
    document.querySelector('#exampleStartGame')?.addEventListener('click', renderPreflight);
    document.querySelector('#exampleRules')?.addEventListener('click', () => openPage('rules'));
  }

  function renderDashboard(session) {
    session.stage = 'play';
    saveSession(session);
    const player = session.currentPlayer;
    const cardsLeft = session.cardCounts[player];
    const finalNear = cardsLeft <= 2;
    const story = withStoryGoal(session.story, session.seed);
    const steps = [
      ['Scarta e ripesca', 'Scarta obbligatoriamente 1 carta, poi pescane 1. Se ne hai una sola, puoi tenerla.'],
      ['Gioca le carte', 'Gioca 1 carta oppure 2 carte compatibili. Le figure si giocano sempre da sole.'],
      ['Racconta una scena', 'Una scena breve. Rispetta la carta e usa almeno un elemento già introdotto.'],
      ['Decidi se pescare', 'Pesca 1 carta oppure resta volontariamente con una carta in meno.']
    ];

    setGameContent(`<div class="live-game-header"><div><p class="eyebrow">ROUND ${session.round}</p><h2>Turno di Giocatore ${player + 1}</h2></div><button type="button" class="objective-peek" id="peekCurrentObjective">Obiettivo segreto</button></div>
      ${finalNear ? `<div class="final-near-alert"><span>FINALE VICINO</span><b>Ti restano ${cardsLeft} ${cardsLeft === 1 ? 'carta' : 'carte'}.</b><p>${cardsLeft === 1 ? 'Puoi tenere la carta all’inizio del turno e tentare subito il finale.' : 'Puoi tentare il finale soltanto se le due carte sono compatibili.'}</p><div class="final-near-actions"><button type="button" class="button button-dark" id="openFinalHelp">Come tentare il finale</button><button type="button" class="button button-ghost" id="declareVictory">Finale riuscito</button></div></div>` : ''}
      <details class="live-story"><summary>Rivedi l’incipit comune</summary><div class="read-aloud-box small"><p><b>Protagonista:</b> ${cardText('protagonist', story.protagonist)}</p><p><b>Obiettivo:</b> ${cardText('objective', story.goal)}</p><p><b>Problema:</b> ${cardText('problem', story.problem)}</p></div></details>
      <div class="turn-guide-title"><div><span>GUIDA DEL TURNO</span><h3>Fate questi quattro passaggi nell’ordine.</h3></div><small>Toccate un passaggio quando è completato.</small></div>
      <div class="turn-checklist">${steps.map((step, index) => `<button type="button" class="turn-step${session.checklist[index] ? ' done' : ''}" data-step="${index}"><span>${session.checklist[index] ? '✓' : index + 1}</span><p><b>${step[0]}</b><small>${step[1]}</small></p></button>`).join('')}</div>
      <div class="helper-title"><span>SERVE AIUTO?</span><h3>Il sito interpreta le carte per voi.</h3></div>
      <div class="helper-grid">
        <button type="button" id="interpretCard"><span>♣</span><b>Interpreta una carta</b><small>Inserisci valore e seme.</small></button>
        <button type="button" id="checkPair"><span>2×</span><b>Verifica due carte</b><small>Controlla se sono compatibili.</small></button>
        <button type="button" id="quickRules"><span>?</span><b>Regole rapide</b><small>Semi, valori e figure.</small></button>
      </div>
      <div class="cards-left-panel"><div><span>CARTE IN MANO A GIOCATORE ${player + 1}</span><b>Quante ne restano dopo il turno?</b></div><div class="card-count-picker">${[1, 2, 3, 4, 5].map(value => `<button type="button" data-count="${value}" class="${cardsLeft === value ? 'active' : ''}">${value}</button>`).join('')}<button type="button" data-count="6" class="${cardsLeft >= 6 ? 'active' : ''}">6+</button></div></div>
      <div class="button-row live-actions"><button type="button" class="button button-primary" id="finishTurn">Turno concluso → Giocatore ${(player + 1) % session.count + 1}</button><button type="button" class="button button-ghost" id="restartGuided">Termina la partita</button></div>`);

    document.querySelectorAll('.turn-step').forEach(button => button.addEventListener('click', () => {
      const index = Number(button.dataset.step);
      session.checklist[index] = !session.checklist[index];
      saveSession(session);
      renderDashboard(session);
    }));
    document.querySelectorAll('[data-count]').forEach(button => button.addEventListener('click', () => {
      session.cardCounts[player] = Number(button.dataset.count);
      saveSession(session);
      renderDashboard(session);
    }));
    document.querySelector('#peekCurrentObjective')?.addEventListener('click', () => openObjectiveModal(session, player, true));
    document.querySelector('#interpretCard')?.addEventListener('click', openCardInterpreter);
    document.querySelector('#checkPair')?.addEventListener('click', openPairChecker);
    document.querySelector('#quickRules')?.addEventListener('click', openQuickRules);
    document.querySelector('#openFinalHelp')?.addEventListener('click', openFinalHelp);
    document.querySelector('#declareVictory')?.addEventListener('click', () => renderVictory(session, player));
    document.querySelector('#finishTurn')?.addEventListener('click', () => {
      const next = (session.currentPlayer + 1) % session.count;
      if (next === session.firstPlayer) session.round += 1;
      session.currentPlayer = next;
      session.checklist = [false, false, false, false];
      saveSession(session);
      renderDashboard(session);
    });
    document.querySelector('#restartGuided')?.addEventListener('click', () => {
      clearSession();
      renderPreflight();
    });
  }

  function renderVictory(session, player) {
    session.stage = 'finished';
    session.winner = player;
    saveSession(session);
    setGameContent(`<div class="victory-screen"><span class="victory-suits">♥ ♦ ♣ ♠</span><p class="eyebrow">STORIA CONCLUSA</p><h2>Giocatore ${player + 1} ha chiuso la storia.</h2><p>Il finale ha raggiunto il suo obiettivo segreto e ha chiuso o trasformato il problema iniziale.</p><div class="victory-objective">${secretContent(session.objectives[player])}</div><div class="button-row"><button type="button" class="button button-primary" id="newAfterVictory">Nuova partita guidata</button><button type="button" class="button button-ghost" id="backToHomeAfterVictory">Torna alla schermata iniziale</button></div></div>`);
    document.querySelector('#newAfterVictory')?.addEventListener('click', () => { clearSession(); renderPreflight(); });
    document.querySelector('#backToHomeAfterVictory')?.addEventListener('click', () => { clearSession(); game.classList.add('hidden'); window.scrollTo({ top: 0, behavior: 'smooth' }); homeSetup(); });
  }

  function sheet(title, subtitle, body) {
    document.querySelector('.guide-sheet')?.remove();
    const host = document.createElement('div');
    host.className = 'guide-sheet';
    host.innerHTML = `<button type="button" class="guide-sheet-backdrop" aria-label="Chiudi"></button><div class="guide-sheet-card"><div class="modal-head"><div><p class="eyebrow">ASSISTENTE DI GIOCO</p><h3>${title}</h3><p>${subtitle}</p></div><button type="button" class="icon-button" data-close-sheet aria-label="Chiudi">×</button></div><div class="guide-sheet-body">${body}</div></div>`;
    host.querySelector('.guide-sheet-backdrop')?.addEventListener('click', () => host.remove());
    host.querySelector('[data-close-sheet]')?.addEventListener('click', () => host.remove());
    document.body.appendChild(host);
    return host;
  }

  function rankOptions(prefix = '') {
    return ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'].map(value => `<option value="${value}">${prefix}${value}</option>`).join('');
  }

  function suitOptions() {
    return Object.entries(SUIT_GUIDE).map(([key, suit]) => `<option value="${key}">${suit.symbol} ${suit.label}</option>`).join('');
  }

  function describeCard(rank, suitKey) {
    const suit = SUIT_GUIDE[suitKey];
    const number = Number(rank);
    if (Number.isFinite(number)) {
      const even = number % 2 === 0;
      return `<div class="card-result-rank${suit.red ? ' red' : ''}">${rank}${suit.symbol}</div><div class="result-rule"><span>SEME</span><b>${suit.label}: ${suit.text}</b></div><div class="result-rule"><span>VALORE</span><b>${even ? 'Pari: avvicina il protagonista al suo obiettivo.' : 'Dispari: allontana il protagonista dal suo obiettivo.'}</b></div><div class="result-prompt"><b>Quindi racconta:</b><p>Una scena che ${suit.text.toLowerCase()} e che ${even ? 'rende la situazione più favorevole' : 'crea una difficoltà o un passo indietro'}. Collega la scena a qualcosa già accaduto.</p></div>`;
    }
    const favorable = suit.red;
    return `<div class="card-result-rank${suit.red ? ' red' : ''}">${rank}${suit.symbol}</div><div class="result-rule"><span>FIGURA</span><b>${FIGURE_GUIDE[rank]}</b></div><div class="result-rule"><span>COLORE</span><b>${favorable ? 'Rossa: introduce l’elemento in modo favorevole al protagonista.' : 'Nera: introduce l’elemento come ostacolo, minaccia o complicazione.'}</b></div><div class="result-prompt"><b>Importante:</b><p>Le figure non hanno parità e si giocano sempre da sole.</p></div>`;
  }

  function openCardInterpreter() {
    const host = sheet('Interpreta una carta', 'Seleziona la carta fisica che vuoi giocare.', `<div class="interpreter-form"><label><span>VALORE</span><select id="interpretRank">${rankOptions()}</select></label><label><span>SEME</span><select id="interpretSuit">${suitOptions()}</select></label></div><div id="interpretResult" class="interpret-result"></div>`);
    const draw = () => {
      const rank = host.querySelector('#interpretRank').value;
      const suit = host.querySelector('#interpretSuit').value;
      host.querySelector('#interpretResult').innerHTML = describeCard(rank, suit);
    };
    host.querySelector('#interpretRank').addEventListener('change', draw);
    host.querySelector('#interpretSuit').addEventListener('change', draw);
    draw();
  }

  function cardPicker(prefix) {
    return `<div class="pair-card"><b>Carta ${prefix}</b><div><select id="pairRank${prefix}">${rankOptions()}</select><select id="pairSuit${prefix}">${suitOptions()}</select></div></div>`;
  }

  function openPairChecker() {
    const host = sheet('Verifica due carte', 'Le figure non possono mai essere abbinate.', `<div class="pair-grid">${cardPicker('A')}${cardPicker('B')}</div><button type="button" class="button button-primary full-button" id="runPairCheck">Controlla compatibilità</button><div id="pairResult"></div>`);
    host.querySelector('#runPairCheck').addEventListener('click', () => {
      const rankA = host.querySelector('#pairRankA').value;
      const rankB = host.querySelector('#pairRankB').value;
      const suitA = host.querySelector('#pairSuitA').value;
      const suitB = host.querySelector('#pairSuitB').value;
      const numberA = Number(rankA);
      const numberB = Number(rankB);
      const output = host.querySelector('#pairResult');
      if (!Number.isFinite(numberA) || !Number.isFinite(numberB)) {
        output.innerHTML = '<div class="pair-answer no"><b>Non compatibili.</b><p>Le figure si giocano sempre da sole.</p></div>';
        return;
      }
      const sameSuitDifferentParity = suitA === suitB && numberA % 2 !== numberB % 2;
      const sameParityDifferentSuit = suitA !== suitB && numberA % 2 === numberB % 2;
      const compatible = sameSuitDifferentParity || sameParityDifferentSuit;
      output.innerHTML = compatible
        ? `<div class="pair-answer yes"><b>Compatibili.</b><p>${sameSuitDifferentParity ? 'Stesso seme e parità diversa.' : 'Stessa parità e seme diverso.'} Racconta una sola scena che rispetti entrambe le carte.</p></div>`
        : '<div class="pair-answer no"><b>Non compatibili.</b><p>Servono stesso seme e parità diversa, oppure stessa parità e seme diverso.</p></div>';
    });
  }

  function openQuickRules() {
    sheet('Regole rapide', 'Quello che serve durante un turno.', `<div class="quick-rule-list">
      <div><b class="red">♥ Cuori</b><p>Cambia un rapporto.</p></div><div><b class="red">♦ Quadri</b><p>Rivela una verità, informazione o indizio.</p></div><div><b>♣ Fiori</b><p>Tenta un’azione.</p></div><div><b>♠ Picche</b><p>Introduce conseguenza, ostacolo o perdita.</p></div>
      <div><b>Numero pari</b><p>Avvicina il protagonista al suo obiettivo.</p></div><div><b>Numero dispari</b><p>Lo allontana dal suo obiettivo.</p></div>
      <div><b>J / Q / K / A</b><p>Nuovo oggetto, personaggio, luogo o ribaltamento. Le figure si giocano da sole.</p></div>
    </div><div class="guide-callout compact"><b>Regola che non va dimenticata</b><p>Ogni scena deve usare almeno un elemento già introdotto nella storia.</p></div>`);
  }

  function openFinalHelp() {
    sheet('Come tentare il finale', 'Il finale deve chiudere davvero la storia.', `<div class="table-setup-list final-list"><div><span>1</span><p><b>Gioca le carte rimaste</b><small>Una carta, oppure due carte compatibili.</small></p></div><div><span>2</span><p><b>Mostra l’obiettivo segreto</b><small>Da questo momento tutti possono leggerlo.</small></p></div><div><span>3</span><p><b>Raggiungi il finale indicato</b><small>La conclusione deve rispettare la tua carta obiettivo.</small></p></div><div><span>4</span><p><b>Chiudi o trasforma il problema iniziale</b><small>Usa elementi comparsi prima. Non inventare una soluzione dal nulla.</small></p></div></div><div class="guide-callout compact"><b>Opposizione</b><p>Un solo avversario può aggiungere un elemento con una carta compatibile. Non può annullare o riscrivere il finale.</p></div>`);
  }

  function renderSession(session) {
    if (!session) { renderPreflight(); return; }
    const renderers = {
      story: renderStory,
      objectives: renderObjectives,
      table: renderTableSetup,
      tutorial: renderTutorial,
      play: renderDashboard,
      finished: session => renderVictory(session, Number.isInteger(session.winner) ? session.winner : 0)
    };
    (renderers[session.stage] || renderStory)(session);
  }

  function addMultiGuidance() {
    if (!game || game.querySelector('.multi-guide-strip')) return;
    const isInvite = game.textContent.includes('Il tuo Obiettivo segreto');
    const isHost = game.textContent.includes('STANZA MULTI-TELEFONO');
    if (!isInvite && !isHost) return;
    const guide = document.createElement('div');
    guide.className = 'multi-guide-strip';
    guide.innerHTML = isInvite
      ? '<b>Dopo aver letto l’obiettivo:</b><span>Leggete insieme l’incipit, distribuite 5 carte a testa e seguite il turno dalla pagina Regole.</span>'
      : '<b>Quando tutti hanno ricevuto l’invito:</b><span>Leggete l’incipit, togliete i jolly e distribuite 5 carte a testa.</span>';
    game.appendChild(guide);
  }

  if (originalShowMulti) {
    window.showMulti = function enhancedShowMulti(target, invite) {
      originalShowMulti(target, invite);
      addMultiGuidance();
    };
  }

  if (game) {
    new MutationObserver(() => addMultiGuidance()).observe(game, { childList: true, subtree: true });
    addMultiGuidance();
  }

  homeSetup();
})();
