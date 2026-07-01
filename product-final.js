'use strict';

(() => {
  const G = window.G52;
  const STORIES = window.STORIA52_READY_STORIES || [];
  const CATEGORIES = window.STORIA52_READY_CATEGORIES || {};
  if (!G) return;

  if (!document.querySelector('link[href="product-final.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'product-final.css';
    document.head.appendChild(link);
  }

  const AUTONOMOUS_KEY = 'storia52_product_autonomous_v1';
  const previousHome = G.home;
  const previousFreeMenu = G.freeMenu;

  const esc = value => typeof escapeHtml === 'function'
    ? escapeHtml(String(value ?? ''))
    : String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));

  const playerName = (session, index) => {
    const value = session?.playerNames?.[index]?.trim();
    return value || `Giocatore ${index + 1}`;
  };

  const normalizedNames = (count, names = []) => Array.from({ length: count }, (_, index) => names[index]?.trim() || `Giocatore ${index + 1}`);

  const storyById = id => STORIES.find(story => story.id === id) || null;

  const makeSession = (count, names, openingSource) => {
    const seed = createCode();
    return {
      stage: 'story',
      seed,
      count,
      firstPlayer: 0,
      currentPlayer: 0,
      round: 1,
      story: storyFromSeed(seed),
      objectives: Array.from({ length: count }, (_, index) => objectiveFromSeed(seed, index + 1)),
      confirmed: Array(count).fill(false),
      playerNames: normalizedNames(count, names),
      contextMode: null,
      contextStep: 0,
      context: { identity: '', name: '', place: '', opening: '', stakes: '', finalOpening: '' },
      suggestions: {},
      openingSource
    };
  };

  G.progressMarkup = active => {
    const phases = [
      { id: 'story', label: 'Incipit' },
      { id: 'objectives', label: 'Obiettivi' },
      { id: 'table', label: 'Preparazione' },
      { id: 'play', label: 'Gioco' }
    ];
    const map = { story: 0, opening: 0, objectives: 1, table: 2, play: 3 };
    const current = map[active] ?? 0;
    return `<nav class="flow-progress" aria-label="Avanzamento della partita"><ol>${phases.map((phase, index) => `<li class="${index < current ? 'completed ' : ''}${index === current ? 'current' : ''}"${index === current ? ' aria-current="step"' : ''}><span>${index < current ? '✓' : index + 1}</span><b>${phase.label}</b><small>${index + 1}/4</small></li>`).join('')}</ol></nav>`;
  };

  G.glossaryMarkup = () => `<div class="glossary-grid">
    <p><b>Incipit</b><span>La prima scena della storia.</span></p>
    <p><b>Turno</b><span>Un solo fatto nuovo raccontato usando la carta giocata.</span></p>
    <p><b>Obiettivo segreto</b><span>La conclusione personale che ogni giocatore cerca di raggiungere.</span></p>
    <p><b>Finale</b><span>La scena che realizza l’obiettivo segreto e chiude la storia.</span></p>
  </div>`;

  G.cardGuideMarkup = (options = {}) => {
    const { compact = false, open = false, title = 'Come leggere le carte' } = options;
    return `<details class="card-rules-guide card-guide-simple${compact ? ' compact' : ''}"${open ? ' open' : ''}>
      <summary><span>CARTE DEL TURNO</span><b>${esc(title)}</b><i aria-hidden="true">⌄</i></summary>
      <div class="card-rules-guide-body">
        <div class="simple-suit-rules">
          <p><b class="red">♥ Cuori pari</b><span>Un rapporto migliora o aiuta.</span></p>
          <p><b class="red">♥ Cuori dispari</b><span>Un rapporto peggiora o complica.</span></p>
          <p><b class="red">♦ Quadri pari</b><span>Arriva una scoperta utile.</span></p>
          <p><b class="red">♦ Quadri dispari</b><span>Arriva una scoperta pericolosa o negativa.</span></p>
          <p><b>♣ Fiori</b><span>Qualcuno compie un’azione.</span></p>
          <p><b>♠ Picche</b><span>Arriva un ostacolo, una perdita o una conseguenza.</span></p>
        </div>
        <p class="parity-warning"><b>Pari e dispari valgono soltanto per Cuori e Quadri.</b></p>
        <div class="card-rule-figures"><p><b>J</b><span>Nuovo oggetto</span></p><p><b>Q</b><span>Nuovo personaggio</span></p><p><b>K</b><span>Nuovo luogo</span></p><p><b>A</b><span>Ribalta la situazione</span></p></div>
        <p class="card-rule-note"><b>Le figure non hanno parità e si giocano da sole.</b><br>Rosse: l’elemento entra a favore del protagonista. Nere: entra come complicazione.</p>
      </div>
    </details>`;
  };

  const finalRulesMarkup = () => `<div class="unified-rulebook final-rulebook">
    <div class="rulebook-cover"><p class="brand-kicker">GIOCO NARRATIVO CON UN MAZZO DI CARTE</p><div><h2>STORIA 52</h2><span>REGOLAMENTO</span></div></div>
    <div class="rules-intro compact-rules-intro">
      <div class="rules-step"><span>1</span><p><b>Scegliete l’incipit</b> dalle carte oppure dalle 52 storie pronte.</p></div>
      <div class="rules-step"><span>2</span><p><b>Leggete gli obiettivi</b> e distribuite cinque carte.</p></div>
      <div class="rules-step"><span>3</span><p><b>Continuate la storia</b> una carta alla volta.</p></div>
    </div>
    <div class="rulebook-controls"><button type="button" data-rules-expand>Apri tutte</button><button type="button" data-rules-collapse>Chiudi tutte</button></div>
    <div class="rules-accordion">
      <details open><summary><span>01</span> Preparazione</summary><div class="details-body numbered-list"><p><i>1</i><span class="numbered-copy">Togliete i jolly e mescolate.</span></p><p><i>2</i><span class="numbered-copy">Scegliete o inventate l’incipit.</span></p><p><i>3</i><span class="numbered-copy">Date 5 carte a ogni giocatore.</span></p><p><i>4</i><span class="numbered-copy">Ogni giocatore legge il proprio obiettivo segreto.</span></p></div></details>
      <details><summary><span>02</span> Significato delle carte</summary><div class="details-body">${G.cardGuideMarkup({ compact: true, open: true })}</div></details>
      <details><summary><span>03</span> Come continua un turno</summary><div class="details-body numbered-list"><p><i>1</i><span class="numbered-copy"><b>Scarta 1 carta e pescane 1.</b> Con una sola carta puoi riprendere la stessa oppure cambiarla.</span></p><p><i>2</i><span class="numbered-copy"><b>Gioca 1 carta.</b></span></p><p><i>3</i><span class="numbered-copy">Racconta un solo fatto successivo, applicando la carta e riprendendo almeno un elemento già comparso.</span></p><p><i>4</i><span class="numbered-copy">Pesca 1 carta oppure resta con una carta in meno.</span></p></div></details>
      <details><summary><span>04</span> Come si chiude la storia</summary><div class="details-body"><p>Puoi tentare il finale quando, dopo il ricambio iniziale, ti resta una sola carta.</p><div class="numbered-list"><p><i>1</i><span class="numbered-copy">Gioca l’ultima carta.</span></p><p><i>2</i><span class="numbered-copy">Mostra il tuo obiettivo segreto.</span></p><p><i>3</i><span class="numbered-copy">Raggiungi quel finale usando elementi già comparsi.</span></p><p><i>4</i><span class="numbered-copy">Chiudi o trasforma il problema iniziale.</span></p></div></div></details>
      <details><summary><span>05</span> Parole chiave</summary><div class="details-body">${G.glossaryMarkup()}</div></details>
    </div>
    <p class="victory-line">VINCE CHI CONCLUDE LA STORIA CON IL PROPRIO OBIETTIVO SEGRETO.</p>
  </div>`;

  G.rulebookMarkup = () => finalRulesMarkup();
  G.renderRulesPage = () => {
    const page = document.querySelector('#rules');
    if (!page) return;
    page.innerHTML = finalRulesMarkup();
    G.bindRulebook(page);
  };
  G.openRulesModal = () => {
    const modal = G.modal('Regolamento', finalRulesMarkup(), { wide: true });
    G.bindRulebook(modal);
  };

  const playerSetupMarkup = (count, names) => `<section class="player-setup-panel">
    <div class="player-setup-head"><div><span>GIOCATORI</span><b>Nomi e numero partecipanti</b></div><select data-player-count>${Array.from({ length: 9 }, (_, index) => index + 2).map(value => `<option value="${value}"${value === count ? ' selected' : ''}>${value} giocatori</option>`).join('')}</select></div>
    <div class="player-name-grid">${Array.from({ length: count }, (_, index) => `<label class="player-name-field"><span>GIOCATORE ${index + 1}</span><input data-player-name="${index}" value="${esc(names[index] || '')}" placeholder="Nome facoltativo"></label>`).join('')}</div>
  </section>`;

  const originMarkup = (mode, count, names) => `${mode === 'assistant' ? G.progressMarkup('story') : ''}
    <div class="screen-heading"><p class="eyebrow">${mode === 'assistant' ? 'PARTITA CON ASSISTENTE' : 'PARTITA AUTONOMA'}</p><h2>Come nasce l’incipit?</h2></div>
    ${mode === 'assistant' ? playerSetupMarkup(count, names) : ''}
    <div class="opening-origin-grid">
      <button type="button" class="opening-origin-card" data-origin="cards"><span>1</span><div><b>Inventiamo noi l’incipit</b><p>L’app pesca Protagonista, Situazione, Obiettivo e Problema. Voi darete vita alla storia.</p></div><i>→</i></button>
      <button type="button" class="opening-origin-card" data-origin="ready"><span>52</span><div><b>Usiamo una storia pronta</b><p>Scegliete tra 52 storie già complete.</p></div><i>→</i></button>
    </div>`;

  function renderOrigin(mode) {
    const state = { count: 4, names: ['', '', '', ''] };
    const draw = (preserveScroll = false) => {
      G.screen(originMarkup(mode, state.count, state.names), mode === 'assistant' ? 'Partita con assistente' : 'Partita autonoma', { scroll: !preserveScroll });
      const syncNames = () => {
        G.game.querySelectorAll('[data-player-name]').forEach(input => { state.names[Number(input.dataset.playerName)] = input.value; });
      };
      G.game.querySelector('[data-player-count]')?.addEventListener('change', event => {
        syncNames();
        state.count = Number(event.target.value) || 4;
        state.names = normalizedNames(state.count, state.names).map((name, index) => name === `Giocatore ${index + 1}` ? '' : name);
        draw(true);
      });
      G.game.querySelectorAll('[data-player-name]').forEach(input => input.addEventListener('input', syncNames));
      G.game.querySelector('[data-origin="cards"]').addEventListener('click', () => {
        syncNames();
        if (mode === 'assistant') {
          const session = makeSession(state.count, state.names, 'cards-manual');
          G.save(session);
          G.flow.story(session);
        } else {
          previousFreeMenu();
        }
      });
      G.game.querySelector('[data-origin="ready"]').addEventListener('click', () => {
        syncNames();
        browseStories({ mode, count: state.count, names: state.names, onBack: () => renderOrigin(mode) });
      });
    };
    draw();
  }

  G.flow.setup = () => renderOrigin('assistant');
  G.freeMenu = () => renderOrigin('autonomous');

  function browseStories(options) {
    let category = 'all';
    let query = '';
    let page = 0;
    const pageSize = 3;

    const render = () => {
      G.screen(`<div class="screen-heading"><p class="eyebrow">52 STORIE PRONTE</p><h2>Scegliete l’incipit.</h2></div>
        <div class="library-next-step"><b>Dopo la scelta</b><span>Ogni giocatore leggerà il proprio obiettivo segreto. Poi userete le carte fisiche per continuare da questa scena.</span></div>
        <div class="ready-library-toolbar"><label><span>CERCA</span><input type="search" data-story-search value="${esc(query)}" placeholder="Titolo, luogo, personaggio…"></label><button type="button" data-random-story>Storia casuale</button></div>
        <div class="ready-category-tabs"><button type="button" class="${category === 'all' ? 'active' : ''}" data-category="all">Tutte<small>52</small></button>${Object.entries(CATEGORIES).map(([key, item]) => `<button type="button" class="${category === key ? 'active' : ''}" data-category="${key}">${esc(item.symbol)} ${esc(item.label)}<small>13</small></button>`).join('')}</div>
        <div class="ready-story-grid" data-story-results></div>
        <div class="ready-pagination"><button type="button" data-page-prev>← Precedenti</button><span data-page-status></span><button type="button" data-page-next>Successive →</button></div>
        <button type="button" class="text-action" data-story-back>Torna indietro</button>`, 'Storie pronte');

      const filtered = STORIES.filter(story => {
        const categoryMatch = category === 'all' || story.category === category;
        const text = `${story.title} ${story.opening} ${story.protagonist} ${story.situation} ${story.objective} ${story.problem}`.toLowerCase();
        return categoryMatch && text.includes(query.toLowerCase());
      });
      const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
      page = Math.min(page, pages - 1);
      const visible = filtered.slice(page * pageSize, page * pageSize + pageSize);
      const results = G.game.querySelector('[data-story-results]');
      results.innerHTML = visible.map(story => {
        const categoryData = CATEGORIES[story.category];
        return `<article class="ready-story-card"><div class="ready-story-card-head"><span>${esc(categoryData?.symbol || '')} ${esc(categoryData?.label || '')}</span><small>${String(STORIES.indexOf(story) + 1).padStart(2, '0')}/52</small></div><h3>${esc(story.title)}</h3><p>${esc(story.opening)}</p><button type="button" data-select-story="${esc(story.id)}">Scegli questa storia <i>→</i></button></article>`;
      }).join('') || '<div class="ready-empty"><b>Nessuna storia trovata.</b></div>';
      G.game.querySelector('[data-page-status]').textContent = `${page + 1} / ${pages}`;
      G.game.querySelector('[data-page-prev]').disabled = page === 0;
      G.game.querySelector('[data-page-next]').disabled = page >= pages - 1;

      G.game.querySelector('[data-story-search]').addEventListener('input', event => { query = event.target.value.trim(); page = 0; render(); });
      G.game.querySelectorAll('[data-category]').forEach(button => button.addEventListener('click', () => { category = button.dataset.category; page = 0; render(); }));
      G.game.querySelector('[data-page-prev]').addEventListener('click', () => { page -= 1; render(); });
      G.game.querySelector('[data-page-next]').addEventListener('click', () => { page += 1; render(); });
      G.game.querySelector('[data-random-story]').addEventListener('click', () => {
        const pool = filtered.length ? filtered : STORIES;
        chooseStory(pool[G.randomIndex(pool.length)], options);
      });
      G.game.querySelectorAll('[data-select-story]').forEach(button => button.addEventListener('click', () => chooseStory(storyById(button.dataset.selectStory), options)));
      G.game.querySelector('[data-story-back]').addEventListener('click', options.onBack);
    };
    render();
  }

  function chooseStory(story, options) {
    if (!story) return;
    if (options.mode === 'assistant') {
      const session = makeSession(options.count || 4, options.names || [], 'ready-story');
      session.readyStoryId = story.id;
      session.contextMode = 'ready-story';
      session.context.finalOpening = story.opening;
      session.stage = 'objectives';
      G.save(session);
      G.flow.objectives(session);
      return;
    }
    renderAutonomousDelivery(story);
  }

  function renderAutonomousDelivery(story) {
    G.screen(`<div class="screen-heading"><p class="eyebrow">PARTITA AUTONOMA</p><h2>${esc(story.title)}</h2></div>
      ${window.STORIA52_READY?.storySummaryMarkup?.(story, { compact: true }) || `<blockquote>${esc(story.opening)}</blockquote>`}
      <div class="free-mode-list unified-free-menu"><button type="button" data-delivery="single"><b>Un telefono al centro</b><small>Leggete gli obiettivi uno alla volta sullo stesso dispositivo.</small><span>→</span></button><button type="button" data-delivery="invite"><b>Inviti personali</b><small>Ogni giocatore riceve il proprio link privato.</small><span>→</span></button><button type="button" data-delivery="quick"><b>Solo generatore</b><small>Mostra questa storia e un solo obiettivo.</small><span>→</span></button></div>
      <button type="button" class="text-action" data-change-story>Cambia storia</button>`, 'Partita autonoma');
    G.game.querySelector('[data-delivery="single"]').addEventListener('click', () => autonomousSetup(story, 'single'));
    G.game.querySelector('[data-delivery="invite"]').addEventListener('click', () => autonomousSetup(story, 'invite'));
    G.game.querySelector('[data-delivery="quick"]').addEventListener('click', () => autonomousQuick(story));
    G.game.querySelector('[data-change-story]').addEventListener('click', () => browseStories({ mode: 'autonomous', onBack: G.freeMenu }));
  }

  function autonomousSetup(story, mode) {
    const state = { count: 4, names: ['', '', '', ''] };
    const draw = () => {
      G.screen(`<div class="screen-heading"><p class="eyebrow">${mode === 'invite' ? 'INVITI PERSONALI' : 'UN TELEFONO AL CENTRO'}</p><h2>Chi partecipa?</h2></div>${playerSetupMarkup(state.count, state.names)}<button type="button" class="main-action" data-autonomous-start>Continua</button>`, mode === 'invite' ? 'Inviti personali' : 'Un telefono al centro');
      const sync = () => G.game.querySelectorAll('[data-player-name]').forEach(input => { state.names[Number(input.dataset.playerName)] = input.value; });
      G.game.querySelector('[data-player-count]').addEventListener('change', event => { sync(); state.count = Number(event.target.value); draw(); });
      G.game.querySelectorAll('[data-player-name]').forEach(input => input.addEventListener('input', sync));
      G.game.querySelector('[data-autonomous-start]').addEventListener('click', () => {
        sync();
        const session = { seed: createCode(), count: state.count, playerNames: normalizedNames(state.count, state.names), objectives: Array.from({ length: state.count }, (_, index) => objectiveFromSeed(createCode(), index + 1)), confirmed: Array(state.count).fill(false), readyStoryId: story.id };
        if (mode === 'invite') renderInviteHost(story, session);
        else { localStorage.setItem(AUTONOMOUS_KEY, JSON.stringify(session)); renderAutonomousObjectives(story, session); }
      });
    };
    draw();
  }

  function renderAutonomousObjectives(story, session) {
    const ready = session.confirmed.filter(Boolean).length;
    G.screen(`<div class="screen-heading"><p class="eyebrow">OBIETTIVI SEGRETI</p><h2>Passate il telefono.</h2></div>${window.STORIA52_READY?.storySummaryMarkup?.(story, { compact: true }) || ''}<div class="objective-progress"><b>${ready}/${session.count}</b><span>giocatori pronti</span></div><div class="player-list">${session.objectives.map((_, index) => `<button type="button" class="player-slot${session.confirmed[index] ? ' confirmed' : ''}" data-auto-player="${index}"><span>${index + 1}</span><p><b>${esc(playerName(session, index))}</b><small>${session.confirmed[index] ? 'Obiettivo memorizzato' : 'Da leggere'}</small></p><i>${session.confirmed[index] ? 'Riapri' : 'Apri'}</i></button>`).join('')}</div><button type="button" class="main-action" data-auto-ready${ready === session.count ? '' : ' disabled'}>Siamo pronti</button>`, 'Obiettivi segreti');
    G.game.querySelectorAll('[data-auto-player]').forEach(button => button.addEventListener('click', () => openObjective(session, Number(button.dataset.autoPlayer), { onConfirm: () => { localStorage.setItem(AUTONOMOUS_KEY, JSON.stringify(session)); renderAutonomousObjectives(story, session); } })));
    G.game.querySelector('[data-auto-ready]').addEventListener('click', () => renderAutonomousGame(story, session));
  }

  function renderAutonomousGame(story, session) {
    G.screen(`<div class="screen-heading"><p class="eyebrow">PARTITA AUTONOMA</p><h2>Siete pronti.</h2></div>${window.STORIA52_READY?.storySummaryMarkup?.(story, { compact: true }) || ''}${turnGuideMarkup()}${quickRulesMarkup()}<section class="game-section"><header><span>OBIETTIVI SEGRETI</span><h3>Riaprili quando serve</h3></header><div class="game-objective-list">${session.objectives.map((_, index) => `<button type="button" data-auto-game-objective="${index}"><span>${esc(playerName(session, index))}</span><i>Apri</i></button>`).join('')}</div></section>`, 'Partita autonoma');
    G.game.querySelectorAll('[data-auto-game-objective]').forEach(button => button.addEventListener('click', () => openObjective(session, Number(button.dataset.autoGameObjective), { duringGame: true })));
  }

  function autonomousQuick(story) {
    const session = { count: 1, playerNames: ['Giocatore'], objectives: [objectiveFromSeed(createCode(), 1)], confirmed: [false] };
    G.screen(`<div class="screen-heading"><p class="eyebrow">SOLO GENERATORE</p><h2>${esc(story.title)}</h2></div>${window.STORIA52_READY?.storySummaryMarkup?.(story) || ''}<button type="button" class="main-action" data-quick-objective>Apri obiettivo segreto</button>${quickRulesMarkup()}`, 'Solo generatore');
    G.game.querySelector('[data-quick-objective]').addEventListener('click', () => openObjective(session, 0, { duringGame: true }));
  }

  function renderInviteHost(story, session) {
    const links = session.playerNames.map((name, index) => {
      const url = new URL(location.href);
      url.search = '';
      url.hash = 'play';
      url.searchParams.set('readyStory', story.id);
      url.searchParams.set('room', session.seed);
      url.searchParams.set('player', String(index + 1));
      url.searchParams.set('name', name);
      url.searchParams.set('objective', serializeCard(session.objectives[index]));
      return url.toString();
    });
    G.screen(`<div class="screen-heading"><p class="eyebrow">INVITI PERSONALI</p><h2>Condividi un link per ogni giocatore.</h2></div>${window.STORIA52_READY?.storySummaryMarkup?.(story, { compact: true }) || ''}<div class="game-objective-list">${session.playerNames.map((name, index) => `<button type="button" data-share-player="${index}"><span>${esc(name)}</span><i>Condividi</i></button>`).join('')}</div><div class="autonomous-next-step"><span>DOPO GLI INVITI</span><b>Distribuite cinque carte e iniziate dalla storia scelta.</b></div>`, 'Inviti personali');
    G.game.querySelectorAll('[data-share-player]').forEach(button => button.addEventListener('click', async () => {
      const index = Number(button.dataset.sharePlayer);
      if (navigator.share) await navigator.share({ title: 'STORIA 52', text: `Invito per ${session.playerNames[index]}`, url: links[index] }).catch(() => {});
      else { await G.copyText(links[index]); showToast('Link copiato'); }
    }));
  }

  function openObjective(session, index, options = {}) {
    let revealed = false;
    let hasRevealed = Boolean(session.confirmed?.[index]);
    const modal = document.createElement('div');
    modal.className = 'focus-modal objective-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    const close = () => { modal.classList.add('is-closing'); window.setTimeout(() => modal.remove(), 180); };
    const draw = () => {
      const name = playerName(session, index);
      modal.innerHTML = `<div class="focus-modal-backdrop"></div><div class="focus-modal-card"><button type="button" class="modal-close" aria-label="Chiudi">×</button><p class="eyebrow">${esc(name)}</p><h2>Obiettivo segreto</h2><div class="secret-card${revealed ? ' open' : ''}">${revealed ? secretContent(session.objectives[index]) : secretClosed(`Passa il telefono a ${name}`, 'Gli altri distolgono lo sguardo.')}</div><div class="modal-actions"><button type="button" class="main-action" data-toggle-secret>${revealed ? 'Nascondi' : 'Rivela'}</button>${options.duringGame ? '<button type="button" class="secondary-action" data-close-secret>Chiudi</button>' : `<button type="button" class="secondary-action" data-confirm-secret${hasRevealed ? '' : ' disabled'}>Ho letto e memorizzato</button>`}</div></div>`;
      modal.querySelector('.focus-modal-backdrop').addEventListener('click', close);
      modal.querySelector('.modal-close').addEventListener('click', close);
      modal.querySelector('[data-close-secret]')?.addEventListener('click', close);
      modal.querySelector('[data-toggle-secret]').addEventListener('click', () => { revealed = !revealed; if (revealed) hasRevealed = true; draw(); });
      modal.querySelector('[data-confirm-secret]')?.addEventListener('click', () => {
        if (!hasRevealed) return;
        session.confirmed[index] = true;
        G.save?.(session);
        close();
        window.setTimeout(() => options.onConfirm ? options.onConfirm() : G.flow.objectives(session), 180);
      });
    };
    document.body.appendChild(modal);
    draw();
    requestAnimationFrame(() => modal.classList.add('is-visible'));
  }

  G.flow.objectiveModal = (session, index, duringGame) => openObjective(session, index, { duringGame });

  G.flow.objectives = session => {
    session.stage = 'objectives';
    session.playerNames = normalizedNames(session.count, session.playerNames);
    session.confirmed ||= Array(session.count).fill(false);
    G.save(session);
    const ready = session.confirmed.filter(Boolean).length;
    G.screen(`${G.progressMarkup('objectives')}<div class="screen-heading"><p class="eyebrow">OBIETTIVI SEGRETI</p><h2>Passate il telefono.</h2></div>${G.flow.openingPanel(session, { compact: true })}<div class="objective-progress"><b>${ready}/${session.count}</b><span>giocatori pronti</span></div><div class="player-list">${session.objectives.map((_, index) => `<button type="button" class="player-slot${session.confirmed[index] ? ' confirmed' : ''}" data-player="${index}"><span>${index + 1}</span><p><b>${esc(playerName(session, index))}</b><small>${session.confirmed[index] ? 'Obiettivo memorizzato' : 'Da leggere'}</small></p><i>${session.confirmed[index] ? 'Riapri' : 'Apri'}</i></button>`).join('')}</div><button type="button" class="main-action" id="objectivesDone"${ready === session.count ? '' : ' disabled'}>Continua</button>`, 'Obiettivi segreti');
    G.flow.bindOpeningPanel(session);
    G.game.querySelectorAll('[data-player]').forEach(button => button.addEventListener('click', () => openObjective(session, Number(button.dataset.player))));
    G.game.querySelector('#objectivesDone').addEventListener('click', () => G.flow.table(session));
  };

  G.flow.table = session => {
    session.stage = 'table';
    G.save(session);
    G.screen(`${G.progressMarkup('table')}<div class="screen-heading"><p class="eyebrow">PREPARAZIONE</p><h2>Preparate il tavolo.</h2></div><div class="final-prep">${G.flow.openingPanel(session, { open: true })}<div class="final-prep-grid"><article><span>1</span><div><b>Togliete i jolly e mescolate.</b></div></article><article><span>2</span><div><b>Date 5 carte a ogni giocatore.</b></div></article><article><span>3</span><div><b>Mettete mazzo e scarti al centro.</b></div></article></div><button type="button" class="main-action" id="startPlaying">Siamo pronti</button></div>`, 'Preparazione');
    G.flow.bindOpeningPanel(session);
    G.game.querySelector('#startPlaying').addEventListener('click', () => { session.stage = 'play'; G.save(session); G.playMode.turn(session); });
  };

  const turnGuideMarkup = () => `<section class="game-section"><header><span>COME CONTINUA IL GIOCO</span><h2>Ogni turno segue questi quattro passaggi.</h2></header><div class="turn-guide-list"><article><span>1</span><div><b>Scarta e pesca</b><p>Scarta una carta e pescane una. Con una sola carta puoi riprendere la stessa oppure cambiarla.</p></div></article><article><span>2</span><div><b>Gioca una carta</b><p>Leggi il significato del seme e del valore.</p></div></article><article><span>3</span><div><b>Continua la storia</b><p>Racconta un solo fatto nuovo usando almeno un elemento già comparso.</p></div></article><article><span>4</span><div><b>Decidi se pescare</b><p>Pesca una carta oppure resta con una carta in meno.</p></div></article></div></section>`;

  const quickRulesMarkup = () => `<div class="game-section"><header><span>GUIDA RAPIDA</span><h3>Regole sempre a portata di mano</h3></header>${G.cardGuideMarkup({ compact: true, title: 'Significato delle carte' })}<details class="final-rules"><summary>Come si tenta il finale</summary><div class="final-rules-body"><p>Dopo il ricambio iniziale devi avere una sola carta.</p><ol><li>Gioca l’ultima carta.</li><li>Mostra il tuo obiettivo segreto.</li><li>Raggiungi quel finale usando elementi già comparsi.</li><li>Chiudi o trasforma il problema iniziale.</li></ol></div></details></div>`;

  G.playMode.turn = session => {
    session.stage = 'play';
    session.playerNames = normalizedNames(session.count, session.playerNames);
    G.save(session);
    G.screen(`${G.progressMarkup('play')}<div class="screen-heading"><p class="eyebrow">PARTITA IN CORSO</p><h2>Continuate la storia.</h2></div><div class="game-guide-layout"><main class="game-guide-main">${G.flow.openingPanel(session, { open: true, compact: true })}${turnGuideMarkup()}${quickRulesMarkup()}</main><aside class="game-guide-side"><section class="game-section"><header><span>OBIETTIVI SEGRETI</span><h3>Aprili quando serve</h3></header><div class="game-objective-list">${session.objectives.map((_, index) => `<button type="button" data-game-objective="${index}"><span>${esc(playerName(session, index))}</span><i>Apri</i></button>`).join('')}</div></section></aside></div>`, 'Partita in corso');
    G.flow.bindOpeningPanel(session);
    G.game.querySelectorAll('[data-game-objective]').forEach(button => button.addEventListener('click', () => openObjective(session, Number(button.dataset.gameObjective), { duringGame: true })));
  };

  G.playMode.victory = session => {
    if (session) { session.stage = 'finished'; G.save(session); }
    G.screen(`<div class="victory"><span>♥ ♦ ♣ ♠</span><p class="eyebrow">STORIA CONCLUSA</p><h1>La vostra storia è finita.</h1><p>Potete iniziarne una nuova oppure tornare alla schermata principale.</p></div><div class="ready-confirm-actions"><button type="button" class="secondary-action" data-finish-home>Torna all’inizio</button><button type="button" class="main-action" data-finish-new>Nuova storia</button></div>`, 'Storia conclusa');
    G.game.querySelector('[data-finish-home]').addEventListener('click', () => { G.clear(); G.home(); });
    G.game.querySelector('[data-finish-new]').addEventListener('click', () => { G.clear(); G.flow.setup(); });
  };

  function printSession(session) {
    const readyStory = storyById(session?.readyStoryId);
    const opening = G.flow.openingText(session);
    const cards = readyStory ? [
      ['PROTAGONISTA', readyStory.protagonist], ['SITUAZIONE', readyStory.situation], ['OBIETTIVO', readyStory.objective], ['PROBLEMA', readyStory.problem]
    ] : Object.entries({ protagonist: 'PROTAGONISTA', situation: 'SITUAZIONE', goal: 'OBIETTIVO', problem: 'PROBLEMA' }).map(([key, label]) => [label, cardText(key === 'goal' ? 'objective' : key, session.story[key])]);
    const popup = window.open('', '_blank');
    if (!popup) { showToast('Il browser ha bloccato la stampa'); return; }
    popup.opener = null;
    popup.document.write(`<!doctype html><html lang="it"><head><meta charset="utf-8"><title>STORIA 52 · ${esc(readyStory?.title || 'Incipit')}</title><style>:root{color-scheme:light}*{box-sizing:border-box}body{margin:0;background:#17130d;color:#211a11;font-family:Arial,sans-serif}.sheet{max-width:900px;margin:34px auto;padding:38px;background:#f5ecdb;border:2px solid #c98b1b;border-radius:18px}.brand{display:flex;justify-content:space-between;align-items:end;padding-bottom:18px;border-bottom:2px solid #c98b1b}.brand h1{margin:0;font:800 46px Georgia,serif}.brand span{color:#8d5a00;font-size:12px;font-weight:900;letter-spacing:.12em}.title{margin:30px 0 8px;font:800 36px/1.1 Georgia,serif}.opening{margin:18px 0 26px;padding:24px;background:#fffaf0;border:1px solid #c98b1b;border-left:7px solid #c98b1b;border-radius:10px;font:700 21px/1.55 Georgia,serif}.cards{display:grid;grid-template-columns:1fr 1fr;gap:10px}.card{padding:14px;background:#fffaf0;border:1px solid #d6c5a5;border-radius:8px}.card b{display:block;margin-bottom:6px;color:#8d5a00;font-size:11px;letter-spacing:.1em}.card p{margin:0;font:700 15px/1.4 Georgia,serif}@media print{body{background:white}.sheet{margin:0;max-width:none;border:0;border-radius:0;padding:18mm}.no-print{display:none}}@media(max-width:650px){.sheet{margin:0;border-radius:0}.cards{grid-template-columns:1fr}}</style></head><body><main class="sheet"><div class="brand"><h1>STORIA 52</h1><span>INCIPIT DELLA PARTITA</span></div><h2 class="title">${esc(readyStory?.title || 'La vostra storia')}</h2><blockquote class="opening">${esc(opening)}</blockquote><section class="cards">${cards.map(([label, text]) => `<article class="card"><b>${esc(label)}</b><p>${esc(text)}</p></article>`).join('')}</section></main><script>window.addEventListener('load',()=>setTimeout(()=>window.print(),180));<\/script></body></html>`);
    popup.document.close();
  }

  G.flow.bindOpeningPanel = (session, root = document) => {
    root.querySelectorAll('[data-copy-opening],[data-copy-ready-opening]').forEach(button => button.addEventListener('click', async () => { const copied = await G.copyText(G.flow.openingText(session)); showToast(copied ? 'Incipit copiato' : 'Copia non riuscita'); }));
    root.querySelectorAll('[data-print-opening],[data-print-ready-opening]').forEach(button => button.addEventListener('click', () => printSession(session)));
  };

  function showExitDialog() {
    const session = G.load();
    const modal = G.modal('Avete finito la storia?', `<p>Potete continuare, salvare il punto raggiunto o cominciare una nuova storia.</p><div class="exit-options"><button type="button" class="main-action" data-exit-continue>Continua a giocare</button><button type="button" class="secondary-action" data-exit-save>Salva per dopo</button><button type="button" class="secondary-action" data-exit-finished>Storia conclusa</button><button type="button" class="danger-action" data-exit-new>Abbandona e crea una nuova storia</button></div>`);
    modal.classList.add('exit-dialog');
    modal.querySelector('[data-exit-continue]').addEventListener('click', () => modal.remove());
    modal.querySelector('[data-exit-save]').addEventListener('click', () => { modal.remove(); G.home(); });
    modal.querySelector('[data-exit-finished]').addEventListener('click', () => { modal.remove(); if (session) G.playMode.victory(session); else G.home(); });
    modal.querySelector('[data-exit-new]').addEventListener('click', () => { modal.remove(); G.clear(); G.flow.setup(); });
  }

  G.topbar = label => {
    let bar = document.querySelector('.session-topbar');
    if (!bar) { bar = document.createElement('div'); bar.className = 'session-topbar'; document.body.appendChild(bar); }
    bar.innerHTML = `<button type="button" class="session-logo" aria-label="Gestisci uscita"><img src="storia52-cards-logo.svg" alt="STORIA 52"></button><span class="session-label">${esc(label)}</span><button type="button" class="session-rules-button">Regole</button><button type="button" class="session-exit">Esci</button>`;
    bar.querySelector('.session-logo').addEventListener('click', showExitDialog);
    bar.querySelector('.session-rules-button').addEventListener('click', G.openRulesModal);
    bar.querySelector('.session-exit').addEventListener('click', showExitDialog);
  };

  G.home = () => {
    previousHome();
    const hero = G.play.querySelector('.simple-hero');
    if (hero) {
      const kicker = hero.querySelector('.section-kicker');
      const title = hero.querySelector('h2');
      const copy = hero.querySelector('p:not(.section-kicker)');
      if (kicker) kicker.textContent = 'GIOCO NARRATIVO CON UN MAZZO DI CARTE';
      if (title) title.textContent = 'Usa la creatività per guidare la storia verso il tuo obiettivo segreto.';
      if (copy) copy.textContent = 'Giocate le carte, continuate ciò che è successo e costruite insieme la conclusione.';
    }
  };

  const directName = new URLSearchParams(location.search).get('name');
  if (directName) {
    requestAnimationFrame(() => {
      const eyebrow = G.game.querySelector('.screen-heading .eyebrow');
      if (eyebrow) eyebrow.textContent = directName.toUpperCase();
    });
  }

  G.renderRulesPage();
  if (document.body.classList.contains('simple-home')) G.home();
})();
