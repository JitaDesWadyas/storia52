'use strict';

(() => {
  const G = window.G52;
  const STORIES = window.STORIA52_READY_STORIES;
  const CATEGORIES = window.STORIA52_READY_CATEGORIES;
  if (!G?.flow || !Array.isArray(STORIES) || STORIES.length !== 52 || !CATEGORIES) return;

  if (!document.querySelector('link[href="ready-stories.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'ready-stories.css';
    document.head.appendChild(link);
  }

  const SINGLE_KEY = 'storia52_ready_single_v1';
  const HOST_PREFIX = 'storia52_ready_host_';
  const escape = value => typeof escapeHtml === 'function'
    ? escapeHtml(String(value ?? ''))
    : String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
  const storyById = id => STORIES.find(story => story.id === id) || null;
  const categoryOf = story => CATEGORIES[story.category] || { label: story.category, symbol: '•' };
  const randomStory = list => list[G.randomIndex(list.length)];
  const objectiveFor = (seed, player = 1) => objectiveFromSeed(seed, player);

  const storySummaryMarkup = (story, options = {}) => {
    const category = categoryOf(story);
    const compact = options.compact ? ' compact' : '';
    return `<section class="ready-story-detail${compact}">
      <header><span>${escape(category.symbol)} ${escape(category.label)}</span><h2>${escape(story.title)}</h2></header>
      <blockquote>${escape(story.opening)}</blockquote>
      <div class="ready-story-breakdown">
        <p><span>PROTAGONISTA</span><b>${escape(story.protagonist)}</b></p>
        <p><span>SITUAZIONE</span><b>${escape(story.situation)}</b></p>
        <p><span>OBIETTIVO</span><b>${escape(story.objective)}</b></p>
        <p><span>PROBLEMA</span><b>${escape(story.problem)}</b></p>
      </div>
    </section>`;
  };

  const storyCardMarkup = story => {
    const category = categoryOf(story);
    const number = String(STORIES.indexOf(story) + 1).padStart(2, '0');
    return `<article class="ready-story-card" data-ready-story-card="${escape(story.id)}">
      <div class="ready-story-card-head"><span>${escape(category.symbol)} ${escape(category.label)}</span><small>${number}/52</small></div>
      <h3>${escape(story.title)}</h3>
      <p>${escape(story.opening)}</p>
      <button type="button" data-ready-story-select="${escape(story.id)}">Leggi e scegli <i>→</i></button>
    </article>`;
  };

  const originChoiceMarkup = (mode, count = 4) => `${mode === 'assistant' ? G.progressMarkup('story') : ''}
    <div class="screen-heading"><p class="eyebrow">${mode === 'assistant' ? 'PARTITA CON ASSISTENTE' : 'PARTITA AUTONOMA'}</p><h2>Come nasce l’incipit?</h2><p>I due percorsi sono separati: o costruite una storia dalle carte, oppure scegliete un incipit già scritto.</p></div>
    ${mode === 'assistant' ? `<label class="player-count-field"><span>NUMERO DI GIOCATORI</span><select id="readyPlayerCount">${Array.from({ length: 9 }, (_, index) => index + 2).map(value => `<option value="${value}"${value === count ? ' selected' : ''}>${value} giocatori</option>`).join('')}</select></label>` : ''}
    <div class="opening-origin-grid">
      <button type="button" class="opening-origin-card primary" data-opening-origin="cards"><span>1</span><div><b>Inventiamo noi l’incipit</b><p>${mode === 'assistant' ? 'L’app pesca Protagonista, Situazione, Obiettivo e Problema, poi vi accompagna nel collegarli.' : 'L’app prepara le quattro carte; il gruppo inventa e racconta liberamente la prima scena.'}</p></div><i>→</i></button>
      <button type="button" class="opening-origin-card" data-opening-origin="ready"><span>52</span><div><b>Usiamo una storia pronta</b><p>Scegliete tra 52 incipit completi, divisi in quattro raccolte da tredici.</p></div><i>→</i></button>
    </div>
    <div class="ready-library-count"><b>52 storie scritte a mano</b><span>13 misteri · 13 conflitti · 13 urgenze · 13 storie strane</span></div>`;

  const makeAssistantSession = (count, openingSource) => {
    const seed = createCode();
    const firstPlayer = G.randomIndex(count);
    return {
      stage: 'story', seed, count, firstPlayer, currentPlayer: firstPlayer, round: 1,
      story: storyFromSeed(seed),
      objectives: Array.from({ length: count }, (_, index) => objectiveFor(seed, index + 1)),
      confirmed: Array(count).fill(false),
      contextMode: null,
      contextStep: 0,
      context: { identity: '', name: '', place: '', opening: '', stakes: '', finalOpening: '' },
      suggestions: {},
      openingSource
    };
  };

  const previousFreeMenu = G.freeMenu;
  const previousOpeningText = G.flow.openingText;
  const previousOpeningPanel = G.flow.openingPanel;
  const previousBindOpeningPanel = G.flow.bindOpeningPanel;

  G.flow.setup = () => {
    G.screen(originChoiceMarkup('assistant'), 'Partita con assistente');
    G.game.querySelector('[data-opening-origin="cards"]').addEventListener('click', () => {
      const count = Number(G.game.querySelector('#readyPlayerCount').value) || 4;
      const session = makeAssistantSession(count, 'cards-manual');
      G.save(session);
      G.flow.story(session);
    });
    G.game.querySelector('[data-opening-origin="ready"]').addEventListener('click', () => {
      const count = Number(G.game.querySelector('#readyPlayerCount').value) || 4;
      browseStories({
        label: 'Storia pronta',
        onBack: G.flow.setup,
        onChoose: story => confirmAssistantStory(story, count)
      });
    });
  };

  G.freeMenu = () => {
    G.screen(originChoiceMarkup('autonomous'), 'Partita autonoma');
    const saved = loadReadySingle();
    if (saved && storyById(saved.readyStoryId)) {
      const resume = document.createElement('button');
      resume.type = 'button';
      resume.className = 'ready-resume-button';
      resume.innerHTML = '<span>STORIA PRONTA SALVATA</span><b>Riprendi la partita autonoma</b><small>Continua dalla distribuzione degli obiettivi.</small>';
      G.game.querySelector('.opening-origin-grid').before(resume);
      resume.addEventListener('click', () => renderReadySingleDashboard(saved));
    }
    G.game.querySelector('[data-opening-origin="cards"]').addEventListener('click', previousFreeMenu);
    G.game.querySelector('[data-opening-origin="ready"]').addEventListener('click', () => browseStories({
      label: 'Storia pronta',
      onBack: G.freeMenu,
      onChoose: readyDeliveryChoice
    }));
  };

  function browseStories(options) {
    let category = 'all';
    let query = '';
    let page = 0;
    const pageSize = 6;

    G.screen(`<div class="screen-heading"><p class="eyebrow">ARCHIVIO DI 52 INCIPIT</p><h2>Scegliete una storia pronta.</h2><p>Ogni incipit ha già protagonista, situazione, obiettivo e problema. La continuazione resta completamente vostra.</p></div>
      <div class="ready-library-toolbar"><label><span>CERCA</span><input id="readyStorySearch" type="search" placeholder="Titolo, luogo, personaggio…"></label><button type="button" data-ready-random>Storia casuale</button></div>
      <div class="ready-category-tabs"><button type="button" class="active" data-ready-category="all">Tutte <small>52</small></button>${Object.entries(CATEGORIES).map(([key, item]) => `<button type="button" data-ready-category="${key}">${escape(item.symbol)} ${escape(item.label)} <small>13</small></button>`).join('')}</div>
      <div id="readyStoryResults" class="ready-story-grid"></div>
      <div class="ready-pagination"><button type="button" data-ready-prev>← Precedenti</button><span id="readyPageStatus"></span><button type="button" data-ready-next>Successive →</button></div>
      <button type="button" class="text-action" data-ready-back>Torna indietro</button>`, options.label || 'Storia pronta');

    const results = G.game.querySelector('#readyStoryResults');
    const status = G.game.querySelector('#readyPageStatus');
    const filteredStories = () => STORIES.filter(story => {
      const categoryMatch = category === 'all' || story.category === category;
      const haystack = `${story.title} ${story.opening} ${story.protagonist} ${story.situation} ${story.objective} ${story.problem}`.toLowerCase();
      return categoryMatch && haystack.includes(query.toLowerCase());
    });

    const draw = () => {
      const filtered = filteredStories();
      const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
      page = Math.max(0, Math.min(page, pages - 1));
      const visible = filtered.slice(page * pageSize, page * pageSize + pageSize);
      results.innerHTML = visible.length ? visible.map(storyCardMarkup).join('') : '<div class="ready-empty"><b>Nessuna storia trovata.</b><p>Cambia categoria o cancella la ricerca.</p></div>';
      status.textContent = `${page + 1} / ${pages} · ${filtered.length} storie`;
      G.game.querySelector('[data-ready-prev]').disabled = page === 0;
      G.game.querySelector('[data-ready-next]').disabled = page >= pages - 1;
    };

    G.game.querySelector('#readyStorySearch').addEventListener('input', event => {
      query = event.target.value.trim();
      page = 0;
      draw();
    });
    G.game.querySelector('.ready-category-tabs').addEventListener('click', event => {
      const button = event.target.closest('[data-ready-category]');
      if (!button) return;
      category = button.dataset.readyCategory;
      page = 0;
      G.game.querySelectorAll('[data-ready-category]').forEach(item => item.classList.toggle('active', item === button));
      draw();
    });
    results.addEventListener('click', event => {
      const button = event.target.closest('[data-ready-story-select]');
      if (!button) return;
      const story = storyById(button.dataset.readyStorySelect);
      if (story) confirmStory(story, options);
    });
    G.game.querySelector('[data-ready-random]').addEventListener('click', () => {
      const list = filteredStories();
      if (list.length) confirmStory(randomStory(list), options);
    });
    G.game.querySelector('[data-ready-prev]').addEventListener('click', () => { page -= 1; draw(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
    G.game.querySelector('[data-ready-next]').addEventListener('click', () => { page += 1; draw(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
    G.game.querySelector('[data-ready-back]').addEventListener('click', options.onBack);
    draw();
  }

  function confirmStory(story, options) {
    G.screen(`<div class="screen-heading compact"><p class="eyebrow">STORIA ${String(STORIES.indexOf(story) + 1).padStart(2, '0')} DI 52</p><h2>Leggetela prima di sceglierla.</h2><p>L’incipit fissa il punto di partenza, non il finale.</p></div>
      ${storySummaryMarkup(story)}
      <div class="ready-confirm-actions"><button type="button" class="secondary-action" data-ready-confirm-back>Continua a sfogliare</button><button type="button" class="main-action" data-ready-confirm-use>Usa questa storia</button></div>`, options.label || 'Storia pronta');
    G.game.querySelector('[data-ready-confirm-back]').addEventListener('click', () => browseStories(options));
    G.game.querySelector('[data-ready-confirm-use]').addEventListener('click', () => options.onChoose(story));
  }

  function confirmAssistantStory(story, count) {
    const session = makeAssistantSession(count, 'ready-story');
    session.readyStoryId = story.id;
    session.contextMode = 'ready-story';
    session.context.finalOpening = story.opening;
    session.stage = 'objectives';

    G.screen(`${G.progressMarkup('opening')}<div class="screen-heading"><p class="eyebrow">INCIPIT PRONTO</p><h2>Questa è già la prima scena.</h2><p>Non dovete collegarla alle carte iniziali: la storia è stata scritta come un blocco coerente.</p></div>
      ${storySummaryMarkup(story)}
      <div class="story-start-bridge"><span>DOPO QUESTA SCELTA</span><ol><li><b>Ogni giocatore</b> leggerà il proprio obiettivo segreto.</li><li><b>Il primo turno</b> continuerà dall’ultima frase dell’incipit.</li><li><b>Le carte fisiche</b> decideranno cosa succede da quel momento in poi.</li></ol></div>
      <div class="ready-confirm-actions"><button type="button" class="secondary-action" data-ready-change>Cambia storia</button><button type="button" class="main-action" data-ready-start>Usa questa storia</button></div>`, 'Partita con assistente');
    G.game.querySelector('[data-ready-change]').addEventListener('click', () => browseStories({ label: 'Storia pronta', onBack: G.flow.setup, onChoose: next => confirmAssistantStory(next, count) }));
    G.game.querySelector('[data-ready-start]').addEventListener('click', () => {
      G.save(session);
      G.flow.objectives(session);
    });
  }

  function readyDeliveryChoice(story) {
    G.screen(`<div class="screen-heading"><p class="eyebrow">PARTITA AUTONOMA · STORIA PRONTA</p><h2>Come distribuite gli obiettivi?</h2><p>L’incipit è già scelto. Ora decidete soltanto come usare i telefoni.</p></div>
      ${storySummaryMarkup(story, { compact: true })}
      <div class="free-mode-list unified-free-menu ready-delivery-list">
        <button type="button" data-ready-delivery="single"><b>Un telefono al centro</b><small>Passate lo stesso dispositivo per leggere gli obiettivi.</small><span>→</span></button>
        <button type="button" data-ready-delivery="multi"><b>Inviti personali</b><small>Ogni giocatore riceve storia e obiettivo sul proprio telefono.</small><span>→</span></button>
        <button type="button" data-ready-delivery="quick"><b>Solo generatore</b><small>Mostra la storia e un solo obiettivo segreto.</small><span>→</span></button>
      </div>
      <button type="button" class="text-action" data-ready-change-story>Scegli un’altra storia</button>`, 'Partita autonoma');
    G.game.querySelector('[data-ready-delivery="single"]').addEventListener('click', () => readySingleSetup(story));
    G.game.querySelector('[data-ready-delivery="multi"]').addEventListener('click', () => readyInviteHost(story));
    G.game.querySelector('[data-ready-delivery="quick"]').addEventListener('click', () => readyQuick(story));
    G.game.querySelector('[data-ready-change-story]').addEventListener('click', () => browseStories({ label: 'Storia pronta', onBack: G.freeMenu, onChoose: readyDeliveryChoice }));
  }

  function readySingleSetup(story) {
    G.screen(`<div class="screen-heading"><p class="eyebrow">STORIA PRONTA · TELEFONO AL CENTRO</p><h2>Quanti siete?</h2><p>L’app creerà un obiettivo segreto diverso per ogni giocatore.</p></div>
      ${storySummaryMarkup(story, { compact: true })}
      <label class="player-count-field"><span>NUMERO DI GIOCATORI</span><select id="readySingleCount">${Array.from({ length: 9 }, (_, index) => index + 2).map(value => `<option value="${value}"${value === 4 ? ' selected' : ''}>${value} giocatori</option>`).join('')}</select></label>
      <button type="button" class="main-action" data-ready-single-start>Crea gli obiettivi</button>
      <button type="button" class="text-action" data-ready-single-back>Torna alle modalità</button>`, 'Un telefono al centro');
    G.game.querySelector('[data-ready-single-start]').addEventListener('click', () => {
      const count = Number(G.game.querySelector('#readySingleCount').value) || 4;
      const seed = createCode();
      const session = {
        seed, count, readyStoryId: story.id,
        objectives: Array.from({ length: count }, (_, index) => objectiveFor(seed, index + 1)),
        viewed: Array(count).fill(false)
      };
      saveReadySingle(session);
      renderReadySingleDashboard(session);
    });
    G.game.querySelector('[data-ready-single-back]').addEventListener('click', () => readyDeliveryChoice(story));
  }

  function loadReadySingle() {
    try { return JSON.parse(localStorage.getItem(SINGLE_KEY) || 'null'); }
    catch { return null; }
  }

  function saveReadySingle(session) {
    try { localStorage.setItem(SINGLE_KEY, JSON.stringify(session)); }
    catch { /* La partita continua senza salvataggio. */ }
  }

  function renderReadySingleDashboard(session) {
    const story = storyById(session.readyStoryId);
    if (!story) { G.freeMenu(); return; }
    const players = session.objectives.map((_, index) => `<button type="button" class="player-slot${session.viewed[index] ? ' viewed' : ''}" data-ready-player="${index}"><span>${index + 1}</span><p><b>Giocatore ${index + 1}</b><small>${session.viewed[index] ? 'Obiettivo già aperto' : 'Obiettivo nascosto'}</small></p><i>${session.viewed[index] ? 'Riapri' : 'Apri'}</i></button>`).join('');
    G.screen(`<div class="screen-heading"><p class="eyebrow">PARTITA AUTONOMA · TELEFONO AL CENTRO</p><h2>Prima leggete la storia insieme.</h2><p>Poi passate il telefono a un giocatore alla volta.</p></div>
      ${storySummaryMarkup(story, { compact: true })}
      <div class="autonomous-next-step"><span>PREPARAZIONE</span><b>Distribuite 5 carte fisiche a testa.</b><p>L’obiettivo sul telefono resta separato dalla mano. I turni si gestiscono al tavolo usando il pulsante “Regole”.</p></div>
      <div class="section-minihead"><h3>Obiettivi segreti</h3><p>Solo il giocatore indicato deve guardare lo schermo.</p></div>
      <div class="player-list">${players}</div>
      <button type="button" class="text-action" data-ready-single-reset>Nuova partita autonoma</button>`, 'Un telefono al centro');
    G.game.querySelectorAll('[data-ready-player]').forEach(button => button.addEventListener('click', () => renderReadySinglePlayer(session, Number(button.dataset.readyPlayer))));
    G.game.querySelector('[data-ready-single-reset]').addEventListener('click', () => {
      localStorage.removeItem(SINGLE_KEY);
      G.freeMenu();
    });
  }

  function renderReadySinglePlayer(session, index) {
    let revealed = false;
    const draw = () => {
      G.screen(`<div class="screen-heading"><p class="eyebrow">GIOCATORE ${index + 1}</p><h2>Il tuo obiettivo segreto.</h2><p>Questa carta non fa parte della mano fisica.</p></div>
        <div class="secret-card${revealed ? ' open' : ''}">${revealed ? secretContent(session.objectives[index]) : secretClosed(`Passa il telefono al giocatore ${index + 1}`, 'Gli altri distolgono lo sguardo.')}</div>
        <div class="ready-confirm-actions"><button type="button" class="secondary-action" data-ready-player-back>Torna ai giocatori</button><button type="button" class="main-action" data-ready-player-reveal>${revealed ? 'Nascondi' : 'Rivela obiettivo'}</button></div>`, 'Obiettivo privato', { scroll: !revealed });
      G.game.querySelector('[data-ready-player-back]').addEventListener('click', () => renderReadySingleDashboard(session));
      G.game.querySelector('[data-ready-player-reveal]').addEventListener('click', () => {
        revealed = !revealed;
        if (revealed) {
          session.viewed[index] = true;
          saveReadySingle(session);
        }
        draw();
      });
    };
    draw();
  }

  function readyQuick(story) {
    const seed = createCode();
    const objective = objectiveFor(seed, 1);
    let revealed = false;
    const draw = () => {
      G.screen(`<div class="screen-heading"><p class="eyebrow">STORIA PRONTA · SOLO GENERATORE</p><h2>Storia e obiettivo pronti.</h2><p>Usate il resto del gioco senza accompagnamento dell’app.</p></div>
        ${storySummaryMarkup(story)}
        <section class="standalone-secret-panel"><div class="standalone-section-head"><span>CARTA PRIVATA</span><h3>Obiettivo segreto</h3></div><div class="secret-card${revealed ? ' open' : ''}">${revealed ? secretContent(objective) : secretClosed()}</div></section>
        <div class="ready-confirm-actions"><button type="button" class="secondary-action" data-ready-quick-again>Altra storia</button><button type="button" class="main-action" data-ready-quick-reveal>${revealed ? 'Nascondi obiettivo' : 'Rivela obiettivo'}</button></div>`, 'Solo generatore', { scroll: !revealed });
      G.game.querySelector('[data-ready-quick-again]').addEventListener('click', () => browseStories({ label: 'Storia pronta', onBack: G.freeMenu, onChoose: readyQuick }));
      G.game.querySelector('[data-ready-quick-reveal]').addEventListener('click', () => { revealed = !revealed; draw(); });
    };
    draw();
  }

  function readyInviteHost(story) {
    const seed = createCode();
    const host = { seed, readyStoryId: story.id, nextPlayer: 1, assigned: [] };
    saveReadyHost(host);
    renderReadyHost(host);
  }

  function saveReadyHost(host) {
    try { localStorage.setItem(HOST_PREFIX + host.seed, JSON.stringify(host)); }
    catch { /* Gli inviti possono essere creati anche senza salvataggio. */ }
  }

  function readyInviteUrl(host, player, objective) {
    const url = new URL(location.href);
    url.search = '';
    url.hash = 'play';
    url.searchParams.set('readyStory', host.readyStoryId);
    url.searchParams.set('room', host.seed);
    url.searchParams.set('player', String(player));
    url.searchParams.set('objective', serializeCard(objective));
    return url.toString();
  }

  function renderReadyHost(host) {
    const story = storyById(host.readyStoryId);
    if (!story) { G.freeMenu(); return; }
    let lastInvite = null;
    const draw = local => {
      const assigned = host.assigned.length ? host.assigned.map(item => `<span class="assigned-chip">Giocatore ${item.player} · ${escape(item.card)}</span>`).join('') : '<span class="setup-note">Nessun invito creato.</span>';
      G.screen(`<div class="screen-heading"><p class="eyebrow">STORIA PRONTA · INVITI PERSONALI</p><h2>Condividi un link diverso con ogni giocatore.</h2><p>La storia è uguale per tutti; l’obiettivo nel link è privato.</p></div>
        <div class="standalone-code-row"><span>CODICE STANZA</span><button type="button" class="game-code" data-ready-copy-code>${escape(host.seed)}</button></div>
        ${storySummaryMarkup(story, { compact: true })}
        <section class="standalone-config-panel invite-panel"><div class="next-player"><span>PROSSIMO INVITO</span><strong>Giocatore ${host.nextPlayer}</strong></div>
          <button type="button" class="main-action" data-ready-create-invite>Crea invito giocatore ${host.nextPlayer}</button>
          ${lastInvite ? `<div class="invite-ready"><b>Invito giocatore ${lastInvite.player} pronto</b><p>Storia e obiettivo sono già dentro il link.</p><div class="ready-confirm-actions"><button type="button" class="secondary-action" data-ready-copy-invite>Copia link</button><button type="button" class="main-action" data-ready-share-invite>Condividi</button></div></div>` : ''}
          <div class="assigned-list">${assigned}</div>
        </section>
        <div class="autonomous-next-step"><span>QUANDO TUTTI HANNO IL LINK</span><b>Leggete l’incipit e distribuite 5 carte fisiche a testa.</b><p>La gestione dei turni resta al tavolo.</p></div>
        <button type="button" class="text-action" data-ready-host-reset>Ricomincia dal giocatore 1</button>`, 'Inviti personali', { scroll: !local });
      G.game.querySelector('[data-ready-copy-code]').addEventListener('click', () => copyText(host.seed, 'Codice copiato'));
      G.game.querySelector('[data-ready-create-invite]').addEventListener('click', () => {
        const player = host.nextPlayer;
        const objective = objectiveFor(host.seed, player);
        lastInvite = { player, url: readyInviteUrl(host, player, objective) };
        host.assigned.push({ player, card: cardLabel(objective) });
        host.nextPlayer += 1;
        saveReadyHost(host);
        draw(true);
      });
      G.game.querySelector('[data-ready-copy-invite]')?.addEventListener('click', () => copyText(lastInvite.url, 'Link invito copiato'));
      G.game.querySelector('[data-ready-share-invite]')?.addEventListener('click', () => {
        if (navigator.share) navigator.share({ title: 'STORIA 52', text: `Invito giocatore ${lastInvite.player}`, url: lastInvite.url }).catch(() => {});
        else copyText(lastInvite.url, 'Link invito copiato');
      });
      G.game.querySelector('[data-ready-host-reset]').addEventListener('click', () => {
        host.nextPlayer = 1;
        host.assigned = [];
        lastInvite = null;
        saveReadyHost(host);
        draw(true);
      });
    };
    draw(false);
  }

  function readyStoryFromSession(session) {
    return session?.openingSource === 'ready-story' ? storyById(session.readyStoryId) : null;
  }

  G.flow.openingText = session => {
    const story = readyStoryFromSession(session);
    return story ? story.opening : previousOpeningText(session);
  };

  G.flow.openingPanel = (session, options = {}) => {
    const story = readyStoryFromSession(session);
    if (!story) return previousOpeningPanel(session, options);
    const open = options.open ? ' open' : '';
    const compact = options.compact ? ' compact' : '';
    const intro = options.intro || 'Questa è la scena da cui continua la partita.';
    return `<details class="opening-dock ready-opening-dock${compact}"${open}><summary><span>STORIA PRONTA</span><b>${escape(story.title)}</b><i aria-hidden="true">⌄</i></summary><div class="opening-dock-body"><p class="opening-dock-intro">${escape(intro)}</p><blockquote>${escape(story.opening)}</blockquote><div class="opening-dock-actions"><button type="button" data-copy-ready-opening>Copia incipit</button><button type="button" data-print-ready-opening>Stampa / salva PDF</button></div></div></details>`;
  };

  G.flow.bindOpeningPanel = (session, root = document) => {
    const story = readyStoryFromSession(session);
    if (!story) {
      previousBindOpeningPanel(session, root);
      return;
    }
    root.querySelectorAll('[data-copy-ready-opening]').forEach(button => button.addEventListener('click', async () => {
      const copied = await G.copyText(story.opening);
      showToast(copied ? 'Incipit copiato' : 'Copia non riuscita');
    }));
    root.querySelectorAll('[data-print-ready-opening]').forEach(button => button.addEventListener('click', () => printReadyStory(story)));
  };

  function printReadyStory(story) {
    const popup = window.open('', '_blank');
    if (!popup) { showToast('Il browser ha bloccato la stampa'); return; }
    popup.opener = null;
    popup.document.write(`<!doctype html><html lang="it"><head><meta charset="utf-8"><title>STORIA 52 · ${escape(story.title)}</title><style>body{max-width:780px;margin:48px auto;padding:0 24px;color:#17130d;font:18px/1.55 Georgia,serif}small{font:800 12px Arial,sans-serif;letter-spacing:.1em}h1{font-size:42px;margin:5px 0 22px}blockquote{margin:0 0 26px;padding:24px;border:2px solid #17130d;font-size:22px;line-height:1.5}dl{display:grid;gap:12px}div{padding:12px;border-bottom:1px solid #bbb}dt{font:800 11px Arial,sans-serif;letter-spacing:.1em}dd{margin:4px 0 0}@media print{body{margin:0}}</style></head><body><small>STORIA 52 · ${escape(categoryOf(story).label)}</small><h1>${escape(story.title)}</h1><blockquote>${escape(story.opening)}</blockquote><dl><div><dt>PROTAGONISTA</dt><dd>${escape(story.protagonist)}</dd></div><div><dt>SITUAZIONE</dt><dd>${escape(story.situation)}</dd></div><div><dt>OBIETTIVO</dt><dd>${escape(story.objective)}</dd></div><div><dt>PROBLEMA</dt><dd>${escape(story.problem)}</dd></div></dl><script>window.addEventListener('load',()=>setTimeout(()=>window.print(),150));<\/script></body></html>`);
    popup.document.close();
  }

  function renderReadyInviteFromUrl() {
    const params = new URLSearchParams(location.search);
    const story = storyById(params.get('readyStory'));
    const room = params.get('room');
    const player = Number(params.get('player'));
    const objective = parseCard(params.get('objective'));
    if (!story || !room || !player || !objective) return false;
    let revealed = false;
    const draw = local => {
      G.screen(`<div class="screen-heading"><p class="eyebrow">GIOCATORE ${player}</p><h2>Storia comune e obiettivo privato.</h2><p>Leggi l’incipit insieme agli altri. Rivela la carta soltanto quando sei da solo.</p></div>
        <div class="standalone-code-row"><span>CODICE</span><span class="game-code">${escape(room)}</span></div>
        ${storySummaryMarkup(story, { compact: true })}
        <section class="standalone-secret-panel"><div class="standalone-section-head"><span>CARTA PRIVATA</span><h3>Il tuo obiettivo segreto</h3></div><div class="secret-card${revealed ? ' open' : ''}">${revealed ? secretContent(objective) : secretClosed()}</div></section>
        <div class="ready-confirm-actions"><button type="button" class="secondary-action" data-ready-leave-invite>Esci dall’invito</button><button type="button" class="main-action" data-ready-reveal-invite>${revealed ? 'Nascondi obiettivo' : 'Rivela obiettivo'}</button></div>`, 'Invito personale', { scroll: !local });
      G.game.querySelector('[data-ready-reveal-invite]').addEventListener('click', () => { revealed = !revealed; draw(true); });
      G.game.querySelector('[data-ready-leave-invite]').addEventListener('click', () => {
        const url = new URL(location.href);
        url.search = '';
        url.hash = 'play';
        history.replaceState(null, '', url);
        window.__storia52DirectInvite = null;
        G.freeMenu();
      });
    };
    draw(false);
    return true;
  }

  window.STORIA52_READY = { browseStories, storyById, storySummaryMarkup };
  renderReadyInviteFromUrl();
})();
