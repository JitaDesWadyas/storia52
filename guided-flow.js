'use strict';

(() => {
  const G = window.G52;
  const SUGGESTIONS = {
    identity: ['Un giovane al suo primo giorno di lavoro','Una viaggiatrice arrivata in un luogo sconosciuto','Un genitore che sta proteggendo qualcuno','Una guardia durante l’ultimo turno della notte','Una studentessa che ha scoperto qualcosa per caso','Una persona comune con una responsabilità troppo grande','Un ex membro di un gruppo che non voleva più rivedere','Un tecnico chiamato a risolvere un’emergenza'],
    place: ['In una stazione quasi vuota','In un piccolo paese isolato','Dentro un edificio chiuso al pubblico','In una città dove non conosce nessuno','Su un mezzo diretto verso un luogo sconosciuto','In una casa abbandonata da anni','Durante una festa piena di persone','In un luogo di lavoro dopo l’orario di chiusura'],
    opening: ['Sta aspettando qualcuno che non arriva','Si accorge che manca qualcosa di fondamentale','Riceve una notizia che cambia i suoi programmi','Qualcuno lo accusa di qualcosa che non comprende','Un evento interrompe improvvisamente la normalità','Trova un oggetto che non dovrebbe essere lì','Deve iniziare un compito senza essere preparato','Vede una persona fare qualcosa di inspiegabile'],
    stakes: ['Perderebbe l’unica occasione che avrà','Qualcuno vicino a lui sarebbe in pericolo','Verrebbe scoperto un segreto importante','Ha promesso che non avrebbe fallito','Non può più tornare indietro','La situazione peggiorerebbe per tutti','Rischierebbe di perdere una persona importante','È direttamente responsabile di ciò che accadrà']
  };

  const shuffled = key => {
    const items = [...SUGGESTIONS[key]];
    for (let i = items.length - 1; i > 0; i -= 1) {
      const j = G.randomIndex(i + 1);
      [items[i], items[j]] = [items[j], items[i]];
    }
    return items.slice(0, 3);
  };

  const makeSession = count => {
    const seed = createCode();
    const firstPlayer = G.randomIndex(count);
    return {
      stage: 'story', seed, count, firstPlayer, currentPlayer: firstPlayer, round: 1,
      story: storyFromSeed(seed),
      objectives: Array.from({ length: count }, (_, i) => objectiveFromSeed(seed, i + 1)),
      confirmed: Array(count).fill(false),
      contextMode: null,
      context: { identity: '', name: '', place: '', opening: '', stakes: '' },
      suggestions: { identity: shuffled('identity'), place: shuffled('place'), opening: shuffled('opening'), stakes: shuffled('stakes') }
    };
  };

  G.flow.setup = () => {
    G.screen(`<div class="screen-heading"><p class="eyebrow">PARTITA GUIDATA</p><h2>Quanti siete?</h2><p>Serve un mazzo francese da 52 carte senza jolly e un solo telefono.</p></div>
      <label class="player-count-field"><span>NUMERO DI GIOCATORI</span><select id="guidedCount">${Array.from({ length: 9 }, (_, i) => i + 2).map(v => `<option value="${v}"${v === 4 ? ' selected' : ''}>${v} giocatori</option>`).join('')}</select></label>
      <div class="simple-note"><b>Il telefono resterà al centro.</b><p>Lo passerete soltanto per leggere gli obiettivi segreti.</p></div>
      <button type="button" class="main-action" id="createGuided">Crea la storia</button>`, 'Partita guidata');
    document.querySelector('#createGuided').addEventListener('click', () => {
      const session = makeSession(Number(document.querySelector('#guidedCount').value));
      G.save(session);
      G.flow.story(session);
    });
  };

  G.flow.story = session => {
    session.stage = 'story'; G.save(session);
    const story = withStoryGoal(session.story, session.seed);
    G.screen(`<div class="screen-heading"><p class="eyebrow">LA BASE DELLA STORIA</p><h2>Leggete queste quattro carte.</h2><p>Non formano ancora un incipit completo. Dicono soltanto chi seguire, cosa vuole e quale problema affronta.</p></div>
      <div class="story-core">${storyStack(story, session.seed)}</div>
      <div class="simple-note"><b>Ora rendetela concreta.</b><p>Decidete chi è davvero il protagonista, dove si trova, cosa sta accadendo e perché il problema conta.</p></div>
      <button type="button" class="main-action" id="buildOpening">Costruiamo l’incipit</button>
      <button type="button" class="text-action" id="regenerateStory">Queste carte non ci ispirano: cambiale</button>`, 'Creazione dell’incipit');
    document.querySelector('#buildOpening').addEventListener('click', () => G.flow.contextChoice(session));
    document.querySelector('#regenerateStory').addEventListener('click', () => {
      const replacement = makeSession(session.count);
      G.save(replacement); G.flow.story(replacement);
    });
  };

  G.flow.contextChoice = session => {
    session.stage = 'context'; G.save(session);
    G.screen(`<div class="screen-heading"><p class="eyebrow">COMPLETA L’INCIPIT</p><h2>Come volete farlo?</h2><p>Questa fase definisce solo la prima scena. Non decide tutta la storia.</p></div>
      <div class="context-choice-list">
        <button type="button" id="useSuggestions"><b>Aiutaci con dei suggerimenti</b><small>Scegliete, modificate o ignorate le idee proposte.</small><span>→</span></button>
        <button type="button" id="writeOurselves"><b>Facciamo tutto da soli</b><small>Scrivete direttamente i dettagli decisi dal gruppo.</small><span>→</span></button>
      </div>
      <button type="button" class="text-action" id="skipContext">Salta: improvviseremo a voce</button>`, 'Creazione dell’incipit');
    document.querySelector('#useSuggestions').addEventListener('click', () => { session.contextMode = 'suggestions'; G.save(session); G.flow.contextForm(session); });
    document.querySelector('#writeOurselves').addEventListener('click', () => { session.contextMode = 'manual'; G.save(session); G.flow.contextForm(session); });
    document.querySelector('#skipContext').addEventListener('click', () => { session.contextMode = 'skipped'; G.save(session); G.flow.opening(session); });
  };

  const contextField = (session, key, label, question, placeholder) => {
    const value = session.context[key] || '';
    const ideas = session.contextMode === 'suggestions' ? `<div class="suggestion-row">${session.suggestions[key].map(item => `<button type="button" class="suggestion-chip${value === item ? ' selected' : ''}" data-key="${key}" data-value="${escapeHtml(item)}">${escapeHtml(item)}</button>`).join('')}<button type="button" class="refresh-suggestions" data-refresh="${key}">Altre idee</button></div>` : '';
    return `<section class="context-field"><span>${label}</span><h3>${question}</h3>${ideas}<textarea id="context-${key}" rows="2" placeholder="${placeholder}">${escapeHtml(value)}</textarea></section>`;
  };

  G.flow.contextForm = session => {
    session.stage = 'context'; G.save(session);
    const story = withStoryGoal(session.story, session.seed);
    G.screen(`<div class="screen-heading compact"><p class="eyebrow">COMPLETA L’INCIPIT</p><h2>Quattro decisioni semplici.</h2><p>Non cercate la risposta perfetta. Bastano dettagli che tutti riescono a immaginare.</p></div>
      <div class="story-reminder"><b>Base da rispettare</b><p>${cardText('protagonist', story.protagonist)} ${cardText('objective', story.goal)} ${cardText('problem', story.problem)}</p></div>
      <div class="context-form">
        ${contextField(session, 'identity', '1 · CHI', 'Chi è concretamente il protagonista?', 'Esempio: un giovane al suo primo giorno di lavoro')}
        <section class="context-field"><span>NOME · FACOLTATIVO</span><h3>Come si chiama?</h3><input id="context-name" value="${escapeHtml(session.context.name || '')}" placeholder="Esempio: Luca"></section>
        ${contextField(session, 'place', '2 · DOVE', 'Dove comincia la storia?', 'Esempio: in una stazione quasi vuota')}
        ${contextField(session, 'opening', '3 · ADESSO', 'Cosa vedremmo nei primi trenta secondi?', 'Esempio: sta aspettando qualcuno che non arriva')}
        ${contextField(session, 'stakes', '4 · PERCHÉ CONTA', 'Perché non può ignorare il problema?', 'Esempio: perderebbe l’unica occasione che avrà')}
      </div>
      <button type="button" class="main-action" id="confirmContext">Componi l’incipit</button>
      <button type="button" class="text-action" id="changeContextMode">Cambia modalità</button>`, 'Creazione dell’incipit');

    const sync = () => {
      ['identity', 'place', 'opening', 'stakes'].forEach(key => session.context[key] = document.querySelector(`#context-${key}`).value.trim());
      session.context.name = document.querySelector('#context-name').value.trim();
      G.save(session);
    };
    document.querySelectorAll('.suggestion-chip').forEach(button => button.addEventListener('click', () => { sync(); session.context[button.dataset.key] = button.dataset.value; G.save(session); G.flow.contextForm(session); }));
    document.querySelectorAll('[data-refresh]').forEach(button => button.addEventListener('click', () => { sync(); session.suggestions[button.dataset.refresh] = shuffled(button.dataset.refresh); G.save(session); G.flow.contextForm(session); }));
    document.querySelector('#confirmContext').addEventListener('click', () => { sync(); G.flow.opening(session); });
    document.querySelector('#changeContextMode').addEventListener('click', () => { sync(); G.flow.contextChoice(session); });
  };

  const strip = text => String(text || '').replace(/[.!?]+$/, '');
  const lower = text => text ? text.charAt(0).toLowerCase() + text.slice(1) : '';
  G.flow.openingText = session => {
    const story = withStoryGoal(session.story, session.seed);
    const c = session.context;
    const subject = c.name || 'Il protagonista';
    const out = [];
    if (c.identity || c.place) out.push(`${subject}${c.identity ? ` è ${lower(strip(c.identity))}` : ''}${c.place ? `, ${lower(strip(c.place))}` : ''}.`);
    else out.push(`${subject}: ${cardText('protagonist', story.protagonist)}`);
    out.push(c.opening ? `${strip(c.opening)}.` : cardText('situation', story.situation));
    out.push(`Vuole ${lower(strip(cardText('objective', story.goal)))}, ma ${lower(strip(cardText('problem', story.problem)))}.`);
    if (c.stakes) out.push(`Non può ignorarlo: ${lower(strip(c.stakes))}.`);
    return out.join(' ');
  };

  G.flow.opening = session => {
    session.stage = 'opening'; G.save(session);
    const completed = ['identity', 'place', 'opening', 'stakes'].some(key => Boolean(session.context[key]));
    G.screen(`<div class="screen-heading"><p class="eyebrow">INCIPIT PRONTO</p><h2>Leggetelo ad alta voce.</h2><p>Potete cambiare qualsiasi parola. Il testo serve a farvi partire, non a limitarvi.</p></div>
      <div class="opening-result"><span>LA PRIMA SCENA</span><p>${escapeHtml(G.flow.openingText(session))}</p></div>
      ${completed ? '' : '<div class="simple-note"><b>Avete saltato i dettagli.</b><p>Decidete almeno a voce dove si trova il protagonista e cosa sta succedendo.</p></div>'}
      <button type="button" class="main-action" id="openingReady">L’incipit va bene</button>
      <button type="button" class="text-action" id="editOpening">Modifica i dettagli</button>`, 'Creazione dell’incipit');
    document.querySelector('#openingReady').addEventListener('click', () => G.flow.objectives(session));
    document.querySelector('#editOpening').addEventListener('click', () => { if (session.contextMode === 'skipped') session.contextMode = 'manual'; G.flow.contextForm(session); });
  };

  G.flow.objectives = session => {
    session.stage = 'objectives'; G.save(session);
    const ready = session.confirmed.filter(Boolean).length;
    G.screen(`<div class="screen-heading"><p class="eyebrow">OBIETTIVI SEGRETI</p><h2>Passate il telefono.</h2><p>Apre soltanto il giocatore indicato. Gli altri non guardano.</p></div>
      <div class="objective-progress"><b>${ready}/${session.count}</b><span>giocatori pronti</span></div>
      <div class="player-list">${session.objectives.map((_, i) => `<button type="button" class="player-slot${session.confirmed[i] ? ' confirmed' : ''}" data-player="${i}"><span>${i + 1}</span><p><b>Giocatore ${i + 1}</b><small>${session.confirmed[i] ? 'Obiettivo memorizzato' : 'Da leggere'}</small></p><i>${session.confirmed[i] ? 'Riapri' : 'Apri'}</i></button>`).join('')}</div>
      ${ready === session.count ? '<button type="button" class="main-action" id="objectivesDone">Tutti pronti</button>' : ''}`, 'Obiettivi segreti');
    document.querySelectorAll('[data-player]').forEach(button => button.addEventListener('click', () => G.flow.objectiveModal(session, Number(button.dataset.player), false)));
    document.querySelector('#objectivesDone')?.addEventListener('click', () => G.flow.table(session));
  };

  G.flow.objectiveModal = (session, index, duringGame) => {
    let revealed = false;
    const modal = document.createElement('div');
    modal.className = 'focus-modal';
    const close = () => modal.remove();
    const draw = () => {
      modal.innerHTML = `<div class="focus-modal-backdrop"></div><div class="focus-modal-card"><button type="button" class="modal-close">×</button><p class="eyebrow">GIOCATORE ${index + 1}</p><h2>${revealed ? 'Il tuo obiettivo' : `Passa il telefono al giocatore ${index + 1}`}</h2><div class="secret-card${revealed ? ' open' : ''}">${revealed ? secretContent(session.objectives[index]) : secretClosed(`Solo Giocatore ${index + 1} deve guardare`, 'Gli altri distolgono lo sguardo.')}</div><div class="modal-actions"><button type="button" class="main-action" id="toggleObjective">${revealed ? 'Nascondi' : 'Rivela'}</button>${revealed && !duringGame ? '<button type="button" class="secondary-action" id="confirmObjective">Ho letto e memorizzato</button>' : ''}${duringGame ? '<button type="button" class="secondary-action" id="closeObjective">Chiudi</button>' : ''}</div></div>`;
      modal.querySelector('.focus-modal-backdrop').addEventListener('click', close);
      modal.querySelector('.modal-close').addEventListener('click', close);
      modal.querySelector('#closeObjective')?.addEventListener('click', close);
      modal.querySelector('#toggleObjective').addEventListener('click', () => { revealed = !revealed; draw(); });
      modal.querySelector('#confirmObjective')?.addEventListener('click', () => { session.confirmed[index] = true; G.save(session); close(); G.flow.objectives(session); });
    };
    document.body.appendChild(modal); draw();
  };

  G.flow.table = session => {
    session.stage = 'table'; G.save(session);
    G.screen(`<div class="screen-heading"><p class="eyebrow">PREPARATE IL MAZZO</p><h2>Quattro cose, poi iniziate.</h2></div>
      <ol class="plain-steps"><li><span>1</span><p><b>Togliete i jolly e mescolate.</b></p></li><li><span>2</span><p><b>Date 5 carte a ogni giocatore.</b></p></li><li><span>3</span><p><b>Mettete mazzo e scarti al centro.</b></p></li><li><span>4</span><p><b>L’obiettivo sul telefono non fa parte della mano.</b></p></li></ol>
      <div class="first-player"><span>COMINCIA</span><b>Giocatore ${session.firstPlayer + 1}</b></div>
      <button type="button" class="main-action" id="startPlaying">Inizia la partita</button>`, 'Preparazione');
    document.querySelector('#startPlaying').addEventListener('click', () => { session.stage = 'play'; session.currentPlayer = session.firstPlayer; session.round = 1; G.save(session); G.playMode.turn(session); });
  };

  G.flow.resume = session => {
    const stages = { story: G.flow.story, context: current => current.contextMode ? G.flow.contextForm(current) : G.flow.contextChoice(current), opening: G.flow.opening, objectives: G.flow.objectives, table: G.flow.table, play: G.playMode.turn, finished: current => G.playMode.victory(current, current.winner || 0) };
    (stages[session?.stage] || G.flow.story)(session);
  };
})();
