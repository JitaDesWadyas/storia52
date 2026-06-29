'use strict';

(() => {
  const G = window.G52;
  const SUGGESTIONS = {
    identity: ['Un giovane al suo primo giorno di lavoro','Una viaggiatrice arrivata in un luogo sconosciuto','Un genitore che sta proteggendo qualcuno','Una guardia durante l’ultimo turno della notte','Una studentessa che ha scoperto qualcosa per caso','Una persona comune con una responsabilità troppo grande','Un ex membro di un gruppo che non voleva più rivedere','Un tecnico chiamato a risolvere un’emergenza'],
    place: ['In una stazione quasi vuota, poco prima dell’alba','In un piccolo paese isolato durante una festa','Dentro un edificio chiuso al pubblico','In una città dove non conosce nessuno','Su un mezzo diretto verso un luogo sconosciuto','In una casa abbandonata da anni','Durante una cerimonia piena di persone','In un luogo di lavoro dopo l’orario di chiusura'],
    opening: ['Sta cercando di convincere qualcuno ad aiutarlo','Sta seguendo una pista che sembra portare nella direzione sbagliata','Sta preparando il primo passo del suo piano','Sta aspettando il momento giusto per agire','Sta cercando qualcosa che gli permetta di continuare','Sta facendo una domanda a cui nessuno vuole rispondere','Sta tentando di raggiungere una persona importante','Sta nascondendo agli altri ciò che vuole davvero'],
    stakes: ['Il problema si manifesta quando qualcuno interrompe il suo piano','Capisce che fallire metterebbe in pericolo una persona vicina','Scopre che non può più tornare indietro','Qualcuno gli impone una scelta immediata','Un dettaglio rivela che la situazione è peggiore del previsto','Rischia di perdere l’unica occasione che avrà','Il problema coinvolge direttamente una persona importante','Si rende conto di essere responsabile di ciò che accadrà']
  };

  const STORY_PARTS = {
    protagonist: { label: 'PROTAGONISTA', type: 'protagonist', role: 'Chi seguirete nella storia.' },
    situation: { label: 'SITUAZIONE', type: 'situation', role: 'Che cosa sta accadendo all’inizio.' },
    goal: { label: 'OBIETTIVO', type: 'objective', role: 'Che cosa vuole ottenere il protagonista.' },
    problem: { label: 'PROBLEMA', type: 'problem', role: 'Che cosa ostacola o complica tutto.' }
  };

  const CONTEXT_STEPS = [
    { key: 'identity', label: 'PROTAGONISTA', question: 'Chi è concretamente questa persona?', link: 'PROTAGONISTA', placeholder: 'Esempio: un giovane al suo primo giorno di lavoro' },
    { key: 'place', label: 'SITUAZIONE', question: 'Dove e quando comincia la scena?', link: 'SITUAZIONE', placeholder: 'Esempio: in una stazione quasi vuota, poco prima dell’alba' },
    { key: 'opening', label: 'OBIETTIVO', question: 'Che cosa sta facendo adesso per raggiungerlo?', link: 'OBIETTIVO', placeholder: 'Esempio: sta cercando di convincere qualcuno ad aiutarlo' },
    { key: 'stakes', label: 'PROBLEMA', question: 'Come si manifesta subito e perché è grave?', link: 'PROBLEMA', placeholder: 'Esempio: qualcuno interrompe il piano e gli impone una scelta' }
  ];

  const shuffled = key => {
    const items = [...SUGGESTIONS[key]];
    for (let i = items.length - 1; i > 0; i -= 1) {
      const j = G.randomIndex(i + 1);
      [items[i], items[j]] = [items[j], items[i]];
    }
    return items.slice(0, 3);
  };

  const normalizeSession = session => {
    if (!session.context) session.context = {};
    session.context = {
      identity: session.context.identity || '',
      name: session.context.name || '',
      place: session.context.place || '',
      opening: session.context.opening || '',
      stakes: session.context.stakes || '',
      finalOpening: session.context.finalOpening || ''
    };
    if (!session.suggestions) session.suggestions = {};
    for (const key of Object.keys(SUGGESTIONS)) {
      if (!Array.isArray(session.suggestions[key]) || session.suggestions[key].length < 3) session.suggestions[key] = shuffled(key);
    }
    session.contextStep = Math.min(CONTEXT_STEPS.length - 1, Math.max(0, Number(session.contextStep) || 0));
    session.story = withStoryGoal(session.story, session.seed);
    return session;
  };

  const makeSession = count => {
    const seed = createCode();
    const firstPlayer = G.randomIndex(count);
    return normalizeSession({
      stage: 'story', seed, count, firstPlayer, currentPlayer: firstPlayer, round: 1,
      story: storyFromSeed(seed),
      objectives: Array.from({ length: count }, (_, i) => objectiveFromSeed(seed, i + 1)),
      confirmed: Array(count).fill(false),
      contextMode: null,
      contextStep: 0,
      context: {},
      suggestions: {}
    });
  };

  const storyPartMarkup = (session, key, editable) => {
    const story = withStoryGoal(session.story, session.seed);
    const card = story[key];
    const spec = STORY_PARTS[key];
    const red = SUITS[card.suit].red ? ' red' : '';
    return `<article class="story-part" data-story-key="${key}">
      <span class="story-part-rank${red}">${cardLabel(card)}</span>
      <div class="story-part-copy"><small>${spec.label}</small><p class="story-part-text">${cardText(spec.type, card)}</p><em>${spec.role}</em></div>
      ${editable ? `<button type="button" class="change-story-card" data-change-story="${key}" aria-label="Cambia carta ${spec.label.toLowerCase()}">Cambia</button>` : ''}
    </article>`;
  };

  const storyReference = (session, options = {}) => {
    const { editable = true, compact = false, sticky = false, title = 'Le quattro carte da collegare' } = options;
    return `<section class="story-reference${compact ? ' compact' : ''}${sticky ? ' sticky' : ''}">
      <div class="story-reference-head"><div><span>RIFERIMENTO DELLA STORIA</span><h3>${title}</h3></div>${editable ? '<small>Se una carta non funziona, cambia solo quella.</small>' : ''}</div>
      <div class="story-parts">${Object.keys(STORY_PARTS).map(key => storyPartMarkup(session, key, editable)).join('')}</div>
    </section>`;
  };

  const updateStoryPartNodes = (session, key) => {
    const story = withStoryGoal(session.story, session.seed);
    const card = story[key];
    const spec = STORY_PARTS[key];
    document.querySelectorAll(`[data-story-key="${key}"]`).forEach(node => {
      const rank = node.querySelector('.story-part-rank');
      rank.textContent = cardLabel(card);
      rank.classList.toggle('red', SUITS[card.suit].red);
      node.querySelector('.story-part-text').textContent = cardText(spec.type, card);
      G.pulse(node, 'is-changing');
    });
  };

  const replaceStoryPart = (session, key) => {
    const current = session.story[key];
    let next = randomCard();
    let attempts = 0;
    while (cardLabel(next) === cardLabel(current) && attempts < 10) {
      next = randomCard();
      attempts += 1;
    }
    session.story[key] = next;
    session.context.finalOpening = '';
    G.save(session);
    updateStoryPartNodes(session, key);
    showToast(`${STORY_PARTS[key].label.toLowerCase()} cambiato`);
  };

  const bindStoryChanges = session => {
    document.querySelectorAll('[data-change-story]').forEach(button => button.addEventListener('click', () => replaceStoryPart(session, button.dataset.changeStory)));
  };

  const replaceAllStoryParts = session => {
    Object.keys(STORY_PARTS).forEach((key, index) => window.setTimeout(() => replaceStoryPart(session, key), index * 90));
  };

  G.flow.setup = () => {
    G.screen(`${G.progressMarkup('story')}<div class="screen-heading"><p class="eyebrow">PARTITA GUIDATA</p><h2>Quanti siete?</h2><p>Serve un mazzo francese da 52 carte senza jolly e un solo telefono.</p></div>
      <label class="player-count-field"><span>NUMERO DI GIOCATORI</span><select id="guidedCount">${Array.from({ length: 9 }, (_, i) => i + 2).map(v => `<option value="${v}"${v === 4 ? ' selected' : ''}>${v} giocatori</option>`).join('')}</select></label>
      <div class="simple-note"><b>Il telefono resterà al centro.</b><p>Lo passerete soltanto per leggere gli obiettivi segreti.</p></div>
      <button type="button" class="main-action" id="createGuided">Genera le quattro carte</button>`, 'Partita guidata');
    document.querySelector('#createGuided').addEventListener('click', () => {
      const session = makeSession(Number(document.querySelector('#guidedCount').value));
      G.save(session);
      G.flow.story(session);
    });
  };

  G.flow.story = rawSession => {
    const session = normalizeSession(rawSession);
    session.stage = 'story';
    G.save(session);
    G.screen(`${G.progressMarkup('story')}<div class="screen-heading"><p class="eyebrow">FASE 1 · LE QUATTRO CARTE</p><h2>Prima capite che funzione ha ciascuna.</h2><p>Non devono essere già perfettamente coerenti. Il gioco comincia quando inventate un collegamento credibile fra loro.</p></div>
      ${storyReference(session, { editable: true, title: 'Questi sono i quattro vincoli della storia' })}
      <div class="story-connection"><span>COME SI COLLEGANO</span><p><b>Seguite il protagonista</b> dentro la situazione iniziale. Fategli inseguire il suo obiettivo, mentre il problema gli impedisce di ottenerlo facilmente.</p><div><i>PROTAGONISTA</i><b>→</b><i>SITUAZIONE</i><b>→</b><i>OBIETTIVO</i><b>↔</b><i>PROBLEMA</i></div></div>
      <details class="inline-explainer"><summary>Vedi un esempio concreto</summary><div><p><b>Carte immaginarie:</b> una viaggiatrice, una stazione vuota, trovare una persona, un blackout.</p><p><b>Prima scena:</b> “Marta arriva nella stazione prima dell’alba per incontrare suo fratello. Le luci si spengono e l’ultimo treno riparte senza di lui.”</p><p>Non sono quattro frasi separate: sono un solo momento che contiene tutte le carte.</p></div></details>
      <details class="inline-explainer compact"><summary>Che cos’è un incipit?</summary><div>${G.glossaryMarkup()}</div></details>
      <button type="button" class="main-action" id="buildOpening">Costruisci la prima scena</button>
      <button type="button" class="text-action" id="changeAllStory">Cambia tutte e quattro le carte</button>`, '1/4 · Carte della storia');
    bindStoryChanges(session);
    document.querySelector('#buildOpening').addEventListener('click', () => G.flow.contextChoice(session));
    document.querySelector('#changeAllStory').addEventListener('click', () => replaceAllStoryParts(session));
  };

  G.flow.contextChoice = rawSession => {
    const session = normalizeSession(rawSession);
    session.stage = 'context';
    G.save(session);
    G.screen(`${G.progressMarkup('opening')}<div class="screen-heading"><p class="eyebrow">FASE 2 · COMPLETA L’INCIPIT</p><h2>Trasformate le carte in una scena vera.</h2><p>Alla fine avrete già l’inizio della storia. Il primo giocatore dovrà soltanto continuare da lì.</p></div>
      ${storyReference(session, { editable: true, compact: true, title: 'Usate tutte queste informazioni' })}
      <div class="context-choice-list">
        <button type="button" id="useSuggestions"><b>Aiutaci con dei suggerimenti</b><small>Una domanda alla volta, con idee da scegliere o modificare.</small><span>→</span></button>
        <button type="button" id="writeOurselves"><b>Facciamo tutto da soli</b><small>Una domanda alla volta, senza proposte automatiche.</small><span>→</span></button>
      </div>
      <button type="button" class="text-action" id="skipContext">Salta: scriveremo direttamente l’incipit</button>`, '2/4 · Creazione dell’incipit');
    bindStoryChanges(session);
    document.querySelector('#useSuggestions').addEventListener('click', () => { session.contextMode = 'suggestions'; session.contextStep = 0; G.save(session); G.flow.contextForm(session); });
    document.querySelector('#writeOurselves').addEventListener('click', () => { session.contextMode = 'manual'; session.contextStep = 0; G.save(session); G.flow.contextForm(session); });
    document.querySelector('#skipContext').addEventListener('click', () => { session.contextMode = 'skipped'; G.save(session); G.flow.opening(session); });
  };

  const suggestionButtons = (session, key) => `${session.suggestions[key].map(item => `<button type="button" class="suggestion-chip${session.context[key] === item ? ' selected' : ''}" data-key="${key}" data-value="${escapeHtml(item)}">${escapeHtml(item)}</button>`).join('')}<button type="button" class="refresh-suggestions" data-refresh="${key}">↻ Altre idee</button>`;

  const contextField = (session, step) => {
    const ideas = session.contextMode === 'suggestions' ? `<div class="suggestion-row" data-suggestion-row="${step.key}">${suggestionButtons(session, step.key)}</div>` : '';
    return `<section class="context-field" data-context-field="${step.key}"><span>${session.contextStep + 1} · ${step.label}</span><h3>${step.question}</h3><p class="context-link">Rendi concreta la carta <b>${step.link}</b>, senza sostituirla.</p>${ideas}<textarea id="context-${step.key}" rows="3" placeholder="${step.placeholder}">${escapeHtml(session.context[step.key])}</textarea></section>`;
  };

  const syncContext = session => {
    ['identity', 'place', 'opening', 'stakes'].forEach(key => {
      const field = document.querySelector(`#context-${key}`);
      if (field) session.context[key] = field.value.trim();
    });
    const name = document.querySelector('#context-name');
    if (name) session.context.name = name.value.trim();
    session.context.finalOpening = '';
    G.save(session);
  };

  const contextStepMarkup = session => {
    const step = CONTEXT_STEPS[session.contextStep];
    const nameField = step.key === 'identity' ? `<section class="context-field name-field"><span>NOME · FACOLTATIVO</span><h3>Come si chiama?</h3><p class="context-link">Serve soltanto a rendere più naturale il racconto.</p><input id="context-name" value="${escapeHtml(session.context.name)}" placeholder="Esempio: Luca"></section>` : '';
    const isLast = session.contextStep === CONTEXT_STEPS.length - 1;
    return `<div class="context-step-status"><span>DOMANDA ${session.contextStep + 1} DI ${CONTEXT_STEPS.length}</span><div aria-hidden="true">${CONTEXT_STEPS.map((_, index) => `<i class="${index < session.contextStep ? 'done' : ''}${index === session.contextStep ? ' current' : ''}"></i>`).join('')}</div></div>
      <div class="context-step-card">${contextField(session, step)}${nameField}</div>
      <div class="context-step-actions">${session.contextStep > 0 ? '<button type="button" class="secondary-action" data-context-back>Indietro</button>' : '<span></span>'}<button type="button" class="main-action" ${isLast ? 'data-context-confirm' : 'data-context-next'}>${isLast ? 'Componi l’incipit' : 'Avanti'}</button></div>`;
  };

  const drawContextStep = (session, direction = 'forward') => {
    const host = document.querySelector('#contextStepHost');
    if (!host) return;
    host.innerHTML = contextStepMarkup(session);
    host.dataset.direction = direction;
    G.pulse(host, direction === 'back' ? 'step-back' : 'step-forward');
  };

  const bindContextInteractions = session => {
    const editor = document.querySelector('.context-editor');
    editor.addEventListener('input', event => {
      if (!event.target.matches('textarea,input')) return;
      syncContext(session);
    });
    editor.addEventListener('click', event => {
      const chip = event.target.closest('.suggestion-chip');
      if (chip) {
        const key = chip.dataset.key;
        const field = document.querySelector(`#context-${key}`);
        field.value = chip.dataset.value;
        session.context[key] = chip.dataset.value;
        session.context.finalOpening = '';
        G.save(session);
        chip.closest('.suggestion-row').querySelectorAll('.suggestion-chip').forEach(item => item.classList.toggle('selected', item === chip));
        G.pulse(chip.closest('.context-field'), 'is-confirmed');
        return;
      }
      const refresh = event.target.closest('[data-refresh]');
      if (refresh) {
        const key = refresh.dataset.refresh;
        session.suggestions[key] = shuffled(key);
        G.save(session);
        const row = refresh.closest('.suggestion-row');
        row.innerHTML = suggestionButtons(session, key);
        G.pulse(row, 'is-refreshing');
        return;
      }
      if (event.target.closest('[data-context-next]')) {
        syncContext(session);
        session.contextStep = Math.min(CONTEXT_STEPS.length - 1, session.contextStep + 1);
        G.save(session);
        drawContextStep(session, 'forward');
        return;
      }
      if (event.target.closest('[data-context-back]')) {
        syncContext(session);
        session.contextStep = Math.max(0, session.contextStep - 1);
        G.save(session);
        drawContextStep(session, 'back');
        return;
      }
      if (event.target.closest('[data-context-confirm]')) {
        syncContext(session);
        G.flow.opening(session);
      }
    });
  };

  G.flow.contextForm = rawSession => {
    const session = normalizeSession(rawSession);
    session.stage = 'context';
    G.save(session);
    G.screen(`${G.progressMarkup('opening')}<div class="screen-heading compact"><p class="eyebrow">FASE 2 · COSTRUISCI LA PRIMA SCENA</p><h2>Una domanda alla volta.</h2><p>Non inventate quattro idee nuove: spiegate come le quattro carte possono esistere nello stesso momento.</p></div>
      <div class="context-workspace">
        ${storyReference(session, { editable: true, compact: true, sticky: true, title: 'Le carte che state collegando' })}
        <div class="context-editor"><div id="contextStepHost"></div><button type="button" class="text-action" id="changeContextMode">Cambia modalità</button></div>
      </div>`, '2/4 · Creazione dell’incipit');
    bindStoryChanges(session);
    drawContextStep(session);
    bindContextInteractions(session);
    document.querySelector('#changeContextMode').addEventListener('click', () => { syncContext(session); G.flow.contextChoice(session); });
  };

  const strip = text => String(text || '').replace(/[.!?]+$/, '');
  const lower = text => text ? text.charAt(0).toLowerCase() + text.slice(1) : '';

  const generatedOpeningText = session => {
    const story = withStoryGoal(session.story, session.seed);
    const c = session.context;
    const protagonistCard = strip(cardText('protagonist', story.protagonist));
    const situationCard = strip(cardText('situation', story.situation));
    const goalCard = strip(cardText('objective', story.goal));
    const problemCard = strip(cardText('problem', story.problem));
    const subject = c.name || 'Il protagonista';
    const out = [];
    if (c.identity) out.push(`${subject} è ${lower(strip(c.identity))}${c.place ? `, ${lower(strip(c.place))}` : ''}.`);
    else out.push(`${subject} è ${lower(protagonistCard)}${c.place ? `, ${lower(strip(c.place))}` : ''}.`);
    out.push(`All’inizio, ${lower(situationCard)}.`);
    if (c.opening) out.push(`${strip(c.opening)}.`);
    out.push(`Vuole ${lower(goalCard)}, ma ${lower(problemCard)}.`);
    if (c.stakes) out.push(`${strip(c.stakes)}.`);
    return out.join(' ');
  };

  G.flow.openingText = rawSession => {
    const session = normalizeSession(rawSession);
    return session.context.finalOpening?.trim() || generatedOpeningText(session);
  };

  G.flow.openingPanel = (rawSession, options = {}) => {
    const session = normalizeSession(rawSession);
    const { open = false, compact = false, intro = 'Questa è la scena da cui continua la partita.' } = options;
    return `<details class="opening-dock${compact ? ' compact' : ''}"${open ? ' open' : ''}><summary><span>INCIPIT DELLA STORIA</span><b>Rileggi la prima scena</b><i aria-hidden="true">⌄</i></summary><div class="opening-dock-body"><p class="opening-dock-intro">${intro}</p><blockquote>${escapeHtml(G.flow.openingText(session))}</blockquote><div class="opening-dock-actions"><button type="button" data-copy-opening>Copia incipit</button><button type="button" data-print-opening>Stampa / salva PDF</button></div></div></details>`;
  };

  const printOpening = session => {
    const story = withStoryGoal(session.story, session.seed);
    const cards = Object.keys(STORY_PARTS).map(key => {
      const spec = STORY_PARTS[key];
      return `<li><b>${spec.label}</b><span>${escapeHtml(cardText(spec.type, story[key]))}</span></li>`;
    }).join('');
    const popup = window.open('', '_blank');
    if (!popup) {
      showToast('Il browser ha bloccato la stampa');
      return;
    }
    popup.opener = null;
    popup.document.write(`<!doctype html><html lang="it"><head><meta charset="utf-8"><title>STORIA 52 · Incipit</title><style>body{max-width:760px;margin:48px auto;padding:0 24px;color:#17130d;font:18px/1.6 Georgia,serif}h1{font-size:42px;margin:0 0 4px}small{font:700 12px Arial,sans-serif;letter-spacing:.12em}blockquote{margin:28px 0;padding:24px;border:2px solid #17130d;font-size:23px;line-height:1.55}ul{padding:0;list-style:none}li{display:grid;gap:3px;padding:10px 0;border-bottom:1px solid #bbb}li b{font:800 11px Arial,sans-serif;letter-spacing:.1em}@media print{body{margin:0}}</style></head><body><small>GIOCO NARRATIVO CON UN MAZZO DI CARTE</small><h1>STORIA 52</h1><p>Incipit della partita</p><blockquote>${escapeHtml(G.flow.openingText(session))}</blockquote><h2>Le quattro carte</h2><ul>${cards}</ul><script>window.addEventListener('load',()=>setTimeout(()=>window.print(),150));<\/script></body></html>`);
    popup.document.close();
  };

  G.flow.bindOpeningPanel = (session, root = document) => {
    root.querySelectorAll('[data-copy-opening]').forEach(button => button.addEventListener('click', async () => {
      const copied = await G.copyText(G.flow.openingText(session));
      showToast(copied ? 'Incipit copiato' : 'Copia non riuscita');
    }));
    root.querySelectorAll('[data-print-opening]').forEach(button => button.addEventListener('click', () => printOpening(session)));
  };

  G.flow.opening = rawSession => {
    const session = normalizeSession(rawSession);
    session.stage = 'opening';
    if (!session.context.finalOpening) session.context.finalOpening = generatedOpeningText(session);
    G.save(session);
    const completed = ['identity', 'place', 'opening', 'stakes'].some(key => Boolean(session.context[key]));
    G.screen(`${G.progressMarkup('opening')}<div class="screen-heading"><p class="eyebrow">FASE 2 · INCIPIT PRONTO</p><h2>Questa è già la prima scena.</h2><p>Leggetela e sistematela insieme. Quando inizierà la partita, il primo giocatore racconterà soltanto ciò che succede subito dopo.</p></div>
      ${storyReference(session, { editable: false, compact: true, title: 'Controllate che l’incipit contenga tutto' })}
      <label class="opening-editor"><span>LA PRIMA SCENA</span><textarea id="finalOpening" rows="8">${escapeHtml(session.context.finalOpening)}</textarea><small>Potete riscrivere liberamente il testo senza cambiare le quattro carte.</small></label>
      <div class="story-start-bridge"><span>COME DIVENTA UNA PARTITA</span><ol><li><b>Adesso:</b> fissate questa prima scena.</li><li><b>Poi:</b> ogni giocatore legge il proprio obiettivo segreto.</li><li><b>Primo turno:</b> si continua dall’ultima frase dell’incipit usando la carta giocata.</li></ol><p>Non dovete creare un altro inizio e non dovete ricominciare da zero.</p></div>
      ${completed ? '' : '<div class="simple-note"><b>Avete saltato i dettagli.</b><p>Prima di continuare, chiarite almeno dove si trova il protagonista e come compare il problema.</p></div>'}
      <div class="opening-export-actions"><button type="button" class="secondary-action" data-copy-opening>Copia incipit</button><button type="button" class="secondary-action" data-print-opening>Stampa / salva PDF</button></div>
      <button type="button" class="main-action" id="openingReady">Continua agli obiettivi segreti</button>
      <button type="button" class="text-action" id="editOpening">Torna alle domande</button>`, '2/4 · Incipit pronto');
    const editor = document.querySelector('#finalOpening');
    editor.addEventListener('input', () => { session.context.finalOpening = editor.value.trim(); G.save(session); });
    G.flow.bindOpeningPanel(session);
    document.querySelector('#openingReady').addEventListener('click', () => { session.context.finalOpening = editor.value.trim(); G.save(session); G.flow.objectives(session); });
    document.querySelector('#editOpening').addEventListener('click', () => { if (session.contextMode === 'skipped') session.contextMode = 'manual'; G.flow.contextForm(session); });
  };

  G.flow.objectives = rawSession => {
    const session = normalizeSession(rawSession);
    session.stage = 'objectives';
    G.save(session);
    const ready = session.confirmed.filter(Boolean).length;
    G.screen(`${G.progressMarkup('objectives')}<div class="screen-heading"><p class="eyebrow">FASE 3 · OBIETTIVI SEGRETI</p><h2>La storia è pronta. Ora passate il telefono.</h2><p>Apre soltanto il giocatore indicato. Gli altri non guardano.</p></div>
      ${G.flow.openingPanel(session, { compact: true, intro: 'L’incipit resta qui: potete rileggerlo senza tornare indietro.' })}
      <div class="objective-progress"><b>${ready}/${session.count}</b><span>giocatori pronti</span></div>
      <div class="player-list">${session.objectives.map((_, i) => `<button type="button" class="player-slot${session.confirmed[i] ? ' confirmed' : ''}" data-player="${i}"><span>${i + 1}</span><p><b>Giocatore ${i + 1}</b><small>${session.confirmed[i] ? 'Obiettivo memorizzato' : 'Da leggere'}</small></p><i>${session.confirmed[i] ? 'Riapri' : 'Apri'}</i></button>`).join('')}</div>
      ${ready === session.count ? '<button type="button" class="main-action" id="objectivesDone">Tutti pronti · prepara il tavolo</button>' : ''}`, '3/4 · Obiettivi segreti');
    G.flow.bindOpeningPanel(session);
    document.querySelectorAll('[data-player]').forEach(button => button.addEventListener('click', () => G.flow.objectiveModal(session, Number(button.dataset.player), false)));
    document.querySelector('#objectivesDone')?.addEventListener('click', () => G.flow.table(session));
  };

  G.flow.objectiveModal = (session, index, duringGame) => {
    let revealed = false;
    const modal = document.createElement('div');
    modal.className = 'focus-modal objective-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    const close = () => {
      modal.classList.add('is-closing');
      window.setTimeout(() => modal.remove(), 180);
    };
    const draw = () => {
      modal.innerHTML = `<div class="focus-modal-backdrop"></div><div class="focus-modal-card"><button type="button" class="modal-close" aria-label="Chiudi">×</button><p class="eyebrow">GIOCATORE ${index + 1}</p><h2>${revealed ? 'Il tuo obiettivo' : `Passa il telefono al giocatore ${index + 1}`}</h2><div class="secret-card${revealed ? ' open' : ''}">${revealed ? secretContent(session.objectives[index]) : secretClosed(`Solo Giocatore ${index + 1} deve guardare`, 'Gli altri distolgono lo sguardo.')}</div><div class="modal-actions"><button type="button" class="main-action" id="toggleObjective">${revealed ? 'Nascondi' : 'Rivela'}</button>${revealed && !duringGame ? '<button type="button" class="secondary-action" id="confirmObjective">Ho letto e memorizzato</button>' : ''}${duringGame ? '<button type="button" class="secondary-action" id="closeObjective">Chiudi</button>' : ''}</div></div>`;
      modal.querySelector('.focus-modal-backdrop').addEventListener('click', close);
      modal.querySelector('.modal-close').addEventListener('click', close);
      modal.querySelector('#closeObjective')?.addEventListener('click', close);
      modal.querySelector('#toggleObjective').addEventListener('click', () => { revealed = !revealed; draw(); G.pulse(modal.querySelector('.secret-card'), 'is-revealing'); });
      modal.querySelector('#confirmObjective')?.addEventListener('click', () => { session.confirmed[index] = true; G.save(session); close(); window.setTimeout(() => G.flow.objectives(session), 180); });
    };
    document.body.appendChild(modal);
    draw();
    requestAnimationFrame(() => modal.classList.add('is-visible'));
  };

  G.flow.table = rawSession => {
    const session = normalizeSession(rawSession);
    session.stage = 'table';
    G.save(session);
    G.screen(`${G.progressMarkup('objectives')}<div class="screen-heading"><p class="eyebrow">FASE 3 · PREPARATE IL MAZZO</p><h2>Quattro cose, poi la storia continua.</h2></div>
      ${G.flow.openingPanel(session, { open: true, intro: 'Leggetelo ad alta voce prima di premere “Inizia la partita”.' })}
      <ol class="plain-steps"><li><span>1</span><p><b>Togliete i jolly e mescolate.</b></p></li><li><span>2</span><p><b>Date 5 carte a ogni giocatore.</b></p></li><li><span>3</span><p><b>Mettete mazzo e scarti al centro.</b></p></li><li><span>4</span><p><b>L’obiettivo sul telefono non fa parte della mano.</b></p></li></ol>
      <div class="first-player"><span>COMINCIA</span><b>Giocatore ${session.firstPlayer + 1}</b></div>
      <div class="start-story-callout"><span>IL PRIMO TURNO NON CREA UN NUOVO INIZIO</span><b>Giocatore ${session.firstPlayer + 1} continua dall’ultima frase dell’incipit.</b><p>Gioca la carta, applica il suo significato e racconta il fatto successivo.</p></div>
      <button type="button" class="main-action" id="startPlaying">Inizia: continua la storia</button>`, '3/4 · Preparazione');
    G.flow.bindOpeningPanel(session);
    document.querySelector('#startPlaying').addEventListener('click', () => { session.stage = 'play'; session.currentPlayer = session.firstPlayer; session.round = 1; G.save(session); G.playMode.turn(session); });
  };

  G.flow.resume = rawSession => {
    const session = normalizeSession(rawSession);
    const stages = { story: G.flow.story, context: current => current.contextMode ? G.flow.contextForm(current) : G.flow.contextChoice(current), opening: G.flow.opening, objectives: G.flow.objectives, table: G.flow.table, play: G.playMode.turn, finished: current => G.playMode.victory(current, current.winner || 0) };
    (stages[session?.stage] || G.flow.story)(session);
  };
})();
