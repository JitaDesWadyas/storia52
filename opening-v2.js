'use strict';
(() => {
  const G = window.G52;
  if (!G?.flow) return;
  const KEYS = ['identity', 'place', 'opening', 'stakes'];
  const STORY_KEYS = { identity: ['protagonist', 'protagonist'], place: ['situation', 'situation'], opening: ['goal', 'objective'], stakes: ['problem', 'problem'] };
  const WORLDS = window.STORIA52_V2_WORLDS;
  const QUESTIONS = {
    identity: ['Chi seguiamo davvero?', 'Scegli una persona concreta. Una sola caratteristica importante.', 'Esempio: una giovane restauratrice che dipende dal custode.'],
    place: ['Dove comincia la scena?', 'Scegli un luogo e un fatto visibile. Niente spiegazioni astratte.', 'Esempio: nel deposito del museo trova una fotografia recente.'],
    opening: ['Che cosa fa subito?', 'Scegli il primo gesto del protagonista. Deve poter essere raccontato in una frase.', 'Esempio: confronta il registro con la fotografia.'],
    stakes: ['Che cosa lo blocca?', 'Scegli un ostacolo concreto e la conseguenza immediata.', 'Esempio: l’archivio chiude; resta una sola occasione.']
  };
  const pickIndex = length => G.randomIndex ? G.randomIndex(length) : Math.floor(Math.random() * length);
  const strip = value => String(value || '').trim().replace(/[.!?]+$/, '');
  const sentence = value => { const clean = strip(value); return clean ? `${clean.charAt(0).toUpperCase()}${clean.slice(1)}.` : ''; };
  const escape = value => typeof escapeHtml === 'function' ? escapeHtml(String(value)) : String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
  const cardTextFor = (session, key) => { const [storyKey, type] = STORY_KEYS[key]; try { return cardText(type, session.story[storyKey]); } catch (_) { return ''; } };
  const chooseWorld = (session, force = false) => {
    if (session.openingWorld && WORLDS[session.openingWorld] && !force) return session.openingWorld;
    const text = KEYS.map(key => cardTextFor(session, key)).join(' ').toLowerCase();
    let candidates = Object.keys(WORLDS);
    if (/indizio|prova|verità|informazione|segreto/.test(text)) candidates = ['museum', 'hospital', 'station', 'workshop'];
    else if (/rapporto|famiglia|fiducia|persona|gruppo/.test(text)) candidates = ['hospital', 'station', 'museum', 'workshop'];
    else if (/piano|azione|impresa|completare|tentativo/.test(text)) candidates = ['workshop', 'station', 'museum', 'hospital'];
    else if (/perdita|occasione|sacrificio|prezzo/.test(text)) candidates = ['station', 'hospital', 'workshop', 'museum'];
    session.openingWorld = candidates[pickIndex(candidates.length)];
    session.ideaHistory = {};
    return session.openingWorld;
  };
  const poolFor = (session, key) => {
    const world = WORLDS[chooseWorld(session)];
    const pool = [];
    const add = (primary, secondary, separator) => primary.forEach(first => secondary.forEach(second => pool.push({ primary: first, secondary: second, text: `${first}${separator}${second}` })));
    if (key === 'identity') add(world.roles, world.details, ' ');
    if (key === 'place') add(world.places, world.events, ', ');
    if (key === 'opening') add(world.actions, world.methods, ', ');
    if (key === 'stakes') add(world.obstacles, world.costs, '; ');
    return pool;
  };
  const nextIdeas = (session, key) => {
    session.ideaHistory ||= {};
    let seen = new Set(session.ideaHistory[key] || []);
    const pool = poolFor(session, key);
    let available = pool.filter(item => !seen.has(item.text));
    if (available.length < 3) { seen = new Set(); available = [...pool]; }
    const result = [], usedPrimary = new Set(), usedSecondary = new Set();
    while (result.length < 3 && available.length) {
      let candidates = available.filter(item => !usedPrimary.has(item.primary) && !usedSecondary.has(item.secondary));
      if (!candidates.length) candidates = available.filter(item => !usedPrimary.has(item.primary));
      if (!candidates.length) candidates = available;
      const chosen = candidates[pickIndex(candidates.length)];
      result.push(chosen.text);
      usedPrimary.add(chosen.primary);
      usedSecondary.add(chosen.secondary);
      available = available.filter(item => item.text !== chosen.text);
    }
    session.ideaHistory[key] = [...seen, ...result];
    return result;
  };
  const prepareSuggestions = (session, force = false) => {
    session.context ||= {};
    session.suggestions ||= {};
    chooseWorld(session, force);
    KEYS.forEach(key => {
      const current = session.suggestions[key];
      if (force || !Array.isArray(current) || current.length !== 3 || current.some(value => String(value).length > 150)) session.suggestions[key] = nextIdeas(session, key);
    });
    G.save(session);
  };
  const buttons = (session, key) => `${session.suggestions[key].map(item => `<button type="button" class="suggestion-chip${session.context[key] === item ? ' selected' : ''}" data-key="${key}" data-value="${escape(item)}">${escape(item)}</button>`).join('')}<button type="button" class="refresh-suggestions" data-refresh="${key}">↻ Altre 3 idee</button>`;
  const compose = session => {
    const context = session.context || {};
    const completed = KEYS.map(key => strip(context[key])).filter(Boolean);
    if (!completed.length) return 'Scegli una proposta per iniziare a costruire la scena.';
    return completed.map(sentence).join(' ');
  };
  const ensureCompleteContext = session => {
    session.context ||= {};
    prepareSuggestions(session);
    KEYS.forEach(key => { if (!strip(session.context[key])) session.context[key] = session.suggestions[key][0]; });
    session.context.finalOpening = compose(session);
    G.save(session);
  };
  G.flow.openingText = session => session?.context?.finalOpening?.trim() || compose(session);
  const previousOpening = G.flow.opening;
  G.flow.opening = session => { ensureCompleteContext(session); return previousOpening(session); };
  const enhanceStep = session => {
    const key = KEYS[Math.max(0, Math.min(3, Number(session.contextStep) || 0))];
    const field = G.game.querySelector(`[data-context-field="${key}"]`);
    if (!field) return;
    const [question, hint, example] = QUESTIONS[key];
    const heading = field.querySelector('h3');
    if (heading) heading.textContent = question;
    field.querySelector('.v2-card-guide')?.remove();
    const guide = document.createElement('div');
    guide.className = 'v2-card-guide';
    guide.innerHTML = `<span>LA CARTA DICE</span><q>${escape(cardTextFor(session, key))}</q><p>${escape(hint)}</p><small>${escape(example)}</small>`;
    heading?.after(guide);
    const area = field.querySelector('textarea');
    if (area) area.placeholder = example.replace(/^Esempio:\s*/i, '');
    const refresh = field.querySelector('.refresh-suggestions');
    if (refresh) refresh.textContent = '↻ Altre 3 idee';
  };
  const previousContextForm = G.flow.contextForm;
  G.flow.contextForm = session => {
    prepareSuggestions(session);
    previousContextForm(session);
    const host = G.game.querySelector('#contextStepHost');
    const editor = G.game.querySelector('.context-editor');
    enhanceStep(session);
    if (host) new MutationObserver(() => requestAnimationFrame(() => enhanceStep(session))).observe(host, { childList: true, subtree: true });
    if (editor && editor.dataset.v2Bound !== 'true') {
      editor.dataset.v2Bound = 'true';
      editor.addEventListener('click', event => {
        const refresh = event.target.closest('[data-refresh]');
        if (refresh) {
          event.preventDefault();
          event.stopImmediatePropagation();
          const key = refresh.dataset.refresh;
          session.suggestions[key] = nextIdeas(session, key);
          G.save(session);
          const row = refresh.closest('.suggestion-row');
          if (row) row.innerHTML = buttons(session, key);
          G.pulse?.(row, 'is-refreshing');
          enhanceStep(session);
          return;
        }
        if (event.target.closest('[data-context-next]')) {
          const currentKey = KEYS[Number(session.contextStep) || 0];
          const input = G.game.querySelector(`#context-${currentKey}`);
          if (input) session.context[currentKey] = input.value.trim();
          const nextKey = KEYS[Math.min(3, (Number(session.contextStep) || 0) + 1)];
          session.suggestions[nextKey] = nextIdeas(session, nextKey);
          session.context.finalOpening = '';
          G.save(session);
        }
      }, true);
    }
    G.game.querySelectorAll('[data-change-story]').forEach(button => button.addEventListener('click', () => requestAnimationFrame(() => {
      session.openingWorld = '';
      session.ideaHistory = {};
      session.context.finalOpening = '';
      prepareSuggestions(session, true);
      const currentKey = KEYS[Number(session.contextStep) || 0];
      const row = G.game.querySelector(`[data-suggestion-row="${currentKey}"]`);
      if (row) row.innerHTML = buttons(session, currentKey);
      enhanceStep(session);
    })));
  };
  const applyBrand = () => {
    const logo = 'storia52-cards-logo.svg';
    const lockup = document.querySelector('.brand-lockup');
    if (lockup && !lockup.querySelector('.brand-logo-v2')) {
      const image = document.createElement('img'); image.src = logo; image.alt = ''; image.className = 'brand-logo-v2'; lockup.prepend(image);
    }
    const hero = document.querySelector('.hero-copy');
    if (hero) {
      const kicker = hero.querySelector('.section-kicker');
      const title = hero.querySelector('h2');
      const paragraph = hero.querySelector('p:not(.section-kicker)');
      if (kicker) kicker.textContent = 'STORIA 52';
      if (title) title.textContent = 'Un gioco creativo e imprevedibile da vivere in compagnia.';
      if (paragraph) paragraph.textContent = 'Giocate le carte, continuate ciò che è successo e cercate di portare la storia verso il vostro finale.';
    }
    const scene = document.querySelector('.deck-scene');
    if (scene && !scene.querySelector('.hero-logo-v2')) scene.innerHTML = `<img class="hero-logo-v2" src="${logo}" alt="Logo STORIA 52">`;
    document.querySelectorAll('.session-logo img').forEach(image => { if (!image.src.endsWith(logo)) image.src = logo; });
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = 'STORIA 52 — Un gioco creativo e imprevedibile da vivere in compagnia.';
  };
  const style = document.createElement('style');
  style.textContent = `.brand-lockup{display:grid;grid-template-columns:58px minmax(0,1fr);column-gap:12px;align-items:center}.brand-logo-v2{grid-row:1/3;width:58px;height:58px;object-fit:contain}.brand-lockup>.brand-kicker,.brand-lockup>.brand-line{grid-column:2}.hero-logo-v2{width:min(280px,72vw);height:auto;display:block;margin:auto}.v2-card-guide{display:grid;gap:5px;margin:0 0 12px;padding:11px 12px;border-left:4px solid var(--amber);background:var(--card-bg-2)}.v2-card-guide>span{color:var(--amber-deep);font-size:.62rem;font-weight:950;letter-spacing:.1em}.v2-card-guide q{font:700 .94rem/1.38 Georgia,serif}.v2-card-guide p,.v2-card-guide small{margin:0;color:var(--card-muted);line-height:1.38}.suggestion-chip{min-height:0!important;padding:12px!important;font-size:.92rem!important;line-height:1.35!important}.suggestion-chip:after{display:none!important}@media(max-width:760px){.brand-lockup{grid-template-columns:48px minmax(0,1fr)}.brand-logo-v2{width:48px;height:48px}.hero-logo-v2{width:min(220px,65vw)}}`;
  document.head.appendChild(style);
  applyBrand();
  new MutationObserver(applyBrand).observe(document.body, { childList: true, subtree: true });
})();
