'use strict';

(() => {
  const SINGLE_KEY = 'storia52_single_session_v3';

  const figureGrid = document.querySelector('.figure-grid');
  if (figureGrid) {
    figureGrid.innerHTML = '<span><b>JACK</b> nuovo oggetto</span><span><b>DONNA</b> nuovo personaggio</span><span><b>RE</b> nuovo luogo</span><span><b>ASSO</b> ribalta la situazione</span>';
  }

  function loadSingleV3() {
    try { return JSON.parse(localStorage.getItem(SINGLE_KEY) || 'null'); }
    catch { return null; }
  }
  function saveSingleV3(session) { localStorage.setItem(SINGLE_KEY, JSON.stringify(session)); }
  function clearSingleV3() { localStorage.removeItem(SINGLE_KEY); }
  function closePlayerModal() { document.querySelector('.player-modal')?.remove(); }

  window.singleMode = function singleMode(game) {
    closePlayerModal();
    const saved = loadSingleV3();
    const state = {
      count: 4,
      mode: 'random',
      cards: { protagonist: randomCard(), situation: randomCard(), problem: randomCard() },
      objectives: Array.from({ length: 10 }, () => randomCard())
    };

    function renderSetup() {
      const objectiveSelectors = state.mode === 'manual'
        ? Array.from({ length: state.count }, (_, index) => selectorHtml(`objective${index}`, `Obiettivo giocatore ${index + 1}`, 'objective', state.objectives[index])).join('')
        : '';

      game.innerHTML = `${saved ? '<div class="resume-box"><b>Hai una partita salvata.</b><button type="button" id="resumeSingle" class="button button-dark">Riprendi</button></div>' : ''}
        <p class="eyebrow">UN SOLO TELEFONO</p>
        <h2>Configura la partita</h2>
        <div class="form-grid">
          <label class="field"><span>Numero giocatori</span><input id="playerCount" type="number" min="2" max="10" value="${state.count}" inputmode="numeric"></label>
        </div>
        <div class="setup-section">
          <b>Carte della partita</b>
          ${choiceToggle(state.mode)}
          ${state.mode === 'manual' ? `<div class="card-choice-list">${selectorHtml('protagonist', 'Protagonista', 'protagonist', state.cards.protagonist)}${selectorHtml('situation', 'Situazione', 'situation', state.cards.situation)}${selectorHtml('problem', 'Problema', 'problem', state.cards.problem)}${objectiveSelectors}</div>` : '<p class="setup-note">Incipit e obiettivi saranno pescati automaticamente.</p>'}
        </div>
        <div class="button-row"><button type="button" id="startSingle" class="button button-primary">Crea partita</button></div>`;

      document.querySelector('#resumeSingle')?.addEventListener('click', () => renderSingleDashboardV3(game, saved));
      document.querySelector('#playerCount').addEventListener('change', event => {
        state.count = Math.max(2, Math.min(10, Number(event.target.value) || 4));
        renderSetup();
      });
      bindChoiceToggle(game, () => { state.mode = 'random'; renderSetup(); }, () => { state.mode = 'manual'; renderSetup(); });

      if (state.mode === 'manual') {
        const map = { protagonist: state.cards.protagonist, situation: state.cards.situation, problem: state.cards.problem };
        state.objectives.slice(0, state.count).forEach((card, index) => { map[`objective${index}`] = card; });
        bindSelectors(game, map, () => {
          state.cards.protagonist = map.protagonist;
          state.cards.situation = map.situation;
          state.cards.problem = map.problem;
          for (let index = 0; index < state.count; index++) state.objectives[index] = map[`objective${index}`];
          renderSetup();
        });
      }

      document.querySelector('#startSingle').addEventListener('click', () => {
        const seed = createCode();
        const story = state.mode === 'manual' ? state.cards : storyFromSeed(seed);
        const objectives = Array.from({ length: state.count }, (_, index) => state.mode === 'manual' ? state.objectives[index] : objectiveFromSeed(seed, index + 1));
        const session = { seed, count: state.count, story, objectives, viewed: Array(state.count).fill(false) };
        saveSingleV3(session);
        renderSingleDashboardV3(game, session);
      });
    }

    renderSetup();
  };

  function renderSingleDashboardV3(game, session) {
    saveSingleV3(session);
    const players = session.objectives.map((_, index) => `
      <button type="button" class="player-slot${session.viewed[index] ? ' viewed' : ''}" data-player="${index}">
        <span class="player-badge">${index + 1}</span>
        <span class="player-meta"><b>Giocatore ${index + 1}</b><small>${session.viewed[index] ? 'Obiettivo già aperto' : 'Obiettivo nascosto'}</small></span>
        <span class="player-action">Apri</span>
      </button>`).join('');

    game.innerHTML = `<div class="game-header"><div><p class="eyebrow">PARTITA SU UN TELEFONO</p><h2>Incipit pubblico</h2></div></div>
      ${storyStack(session.story)}
      <div class="section-minihead"><h3>Scegli il giocatore</h3><p>Tocca un giocatore: l’obiettivo si apre sopra la partita senza spostare la pagina.</p></div>
      <div class="player-list">${players}</div>
      <div class="button-row"><button type="button" id="newSingle" class="button button-ghost">Nuova partita</button></div>`;

    document.querySelectorAll('.player-slot').forEach(button => button.addEventListener('click', () => openPlayerModal(game, session, Number(button.dataset.player))));
    document.querySelector('#newSingle').addEventListener('click', () => { closePlayerModal(); clearSingleV3(); window.singleMode(game); });
  }

  function openPlayerModal(game, session, index) {
    closePlayerModal();
    let revealed = false;
    const objective = session.objectives[index];
    const modal = document.createElement('div');
    modal.className = 'player-modal';

    function renderModal() {
      modal.innerHTML = `
        <button type="button" class="player-modal-backdrop" aria-label="Chiudi"></button>
        <div class="player-modal-card">
          <div class="modal-head">
            <div><p class="eyebrow">GIOCATORE ${index + 1}</p><h3>Il tuo Obiettivo</h3><p>Passa il telefono solo a questo giocatore.</p></div>
            <button type="button" class="icon-button" id="closePlayerModal" aria-label="Chiudi">×</button>
          </div>
          <div class="secret-card${revealed ? ' open' : ''}">${revealed ? secretContent(objective) : secretClosed(`Passa il telefono al giocatore ${index + 1}`, 'Gli altri devono distogliere lo sguardo.')}</div>
          <div class="button-row"><button type="button" id="revealPlayerObjective" class="button button-primary">${revealed ? 'Nascondi' : 'Rivela'}</button><button type="button" id="finishPlayerObjective" class="button button-ghost">Chiudi</button></div>
        </div>`;

      modal.querySelector('.player-modal-backdrop').addEventListener('click', closePlayerModal);
      modal.querySelector('#closePlayerModal').addEventListener('click', closePlayerModal);
      modal.querySelector('#finishPlayerObjective').addEventListener('click', closePlayerModal);
      modal.querySelector('#revealPlayerObjective').addEventListener('click', () => {
        revealed = !revealed;
        if (revealed) {
          session.viewed[index] = true;
          saveSingleV3(session);
          const tile = game.querySelector(`.player-slot[data-player="${index}"]`);
          tile?.classList.add('viewed');
          const status = tile?.querySelector('small');
          if (status) status.textContent = 'Obiettivo già aperto';
        }
        renderModal();
      });
    }

    document.body.appendChild(modal);
    renderModal();
  }

  window.renderMultiLobby = function renderMultiLobby(game, host) {
    const state = { objectiveMode: 'random', objective: randomCard(), lastInvite: null };

    function draw() {
      const assigned = host.assigned.length
        ? host.assigned.map(item => `<div class="assigned-chip"><b>Giocatore ${item.player}</b><span>${item.card}</span></div>`).join('')
        : '<span class="setup-note">Nessun invito creato.</span>';

      game.innerHTML = `<div class="game-header"><div><p class="eyebrow">STANZA MULTI-TELEFONO</p><h2>Inviti progressivi</h2></div><button type="button" id="copyHostCode" class="game-code">${host.seed}</button></div>
        ${storyStack(host.story)}
        <div class="invite-panel">
          <div class="next-player"><div><span>PROSSIMO INVITO</span><div class="invite-player">Giocatore ${host.nextPlayer}</div></div><div class="invite-badge">${host.nextPlayer}</div></div>
          <div class="setup-section"><b>Obiettivo del prossimo giocatore</b>${choiceToggle(state.objectiveMode)}${state.objectiveMode === 'manual' ? `<div class="card-choice-list">${selectorHtml('objective', 'Obiettivo', 'objective', state.objective)}</div>` : '<p class="setup-note">L’obiettivo sarà pescato automaticamente e inserito nel link privato.</p>'}</div>
          <div class="button-row"><button type="button" id="createInvite" class="button button-primary">Crea invito giocatore ${host.nextPlayer}</button><button type="button" id="resetPlayers" class="button button-ghost">Ricomincia da 1</button></div>
          ${state.lastInvite ? `<div class="invite-ready"><b>Invito giocatore ${state.lastInvite.player} pronto</b><p>Il numero e le carte sono già dentro il link.</p><div class="button-row"><button type="button" id="shareInvite" class="button button-dark">Condividi invito</button><button type="button" id="copyInvite" class="button button-ghost">Copia link</button></div></div>` : ''}
          <div class="assigned-list">${assigned}</div>
        </div>
        <div class="button-row"><button type="button" id="backMultiSetup" class="button button-ghost">Nuova stanza</button></div>`;

      document.querySelector('#copyHostCode').addEventListener('click', () => copyText(host.seed, 'Codice copiato'));
      bindChoiceToggle(game, () => { state.objectiveMode = 'random'; draw(); }, () => { state.objectiveMode = 'manual'; draw(); });
      if (state.objectiveMode === 'manual') {
        const map = { objective: state.objective };
        bindSelectors(game, map, () => { state.objective = map.objective; draw(); });
      }
      document.querySelector('#createInvite').addEventListener('click', () => {
        const player = host.nextPlayer;
        const objective = state.objectiveMode === 'manual' ? state.objective : objectiveFromSeed(host.seed, player);
        const url = makeInviteUrl(host, player, objective);
        state.lastInvite = { player, url };
        host.assigned.push({ player, card: cardLabel(objective) });
        host.nextPlayer += 1;
        saveMultiHost(host);
        draw();
      });
      document.querySelector('#shareInvite')?.addEventListener('click', () => shareInvite(state.lastInvite));
      document.querySelector('#copyInvite')?.addEventListener('click', () => copyText(state.lastInvite.url, 'Link invito copiato'));
      document.querySelector('#resetPlayers').addEventListener('click', () => { host.nextPlayer = 1; host.assigned = []; state.lastInvite = null; saveMultiHost(host); draw(); });
      document.querySelector('#backMultiSetup').addEventListener('click', () => multiHostSetup(game));
    }

    draw();
  };
})();
