'use strict';

(() => {
  const S = window.S52;
  if (!S) return;

  const COLLECTION_STAGE = 'collections';
  const VALID_STAGES = new Set(['setup', COLLECTION_STAGE, 'stories', 'objectives', 'prep', 'invites', 'game']);

  S.collections = window.STORIA52_READY_COLLECTIONS || [];
  S.primaryCollectionId = window.STORIA52_PRIMARY_COLLECTION_ID || 'prima-scintilla';
  S.collectionById = id => S.collections.find(collection => collection.id === id) || null;
  S.isCollectionAvailable = id => {
    const collection = S.collectionById(id);
    return Boolean(collection && collection.id === S.primaryCollectionId && collection.status === 'available');
  };
  S.collectionForSession = session => S.isCollectionAvailable(session?.collectionId)
    ? S.collectionById(session.collectionId)
    : null;
  S.storyAllowedInSession = (session, story) => {
    const collection = S.collectionForSession(session);
    return Boolean(collection && story && story.collectionId === collection.id && collection.storyIds.includes(story.id));
  };

  const normalizeCount = value => Math.max(2, Math.min(8, Number(value) || 4));
  const emptyOpeningNotes = () => ({ protagonist: '', setting: '', action: '', problem: '' });
  const cleanSeed = value => S.cleanText(value, 64).replace(/[^A-Za-z0-9_-]/g, '').slice(0, 64);

  const normalizeObjectives = (session, story) => {
    if (!story || typeof S.objectivesForReadyStory !== 'function') return;
    const canonical = Array.isArray(session.objectives)
      ? session.objectives.map(objective => S.objectiveForReadyStorySlot?.(story, objective?.slot)).filter(Boolean)
      : [];
    session.objectives = canonical.length === session.count
      ? canonical
      : S.objectivesForReadyStory(story, session.count, session.seed || 'PARTITA');
  };

  S.normalizeSession = session => {
    if (!session || typeof session !== 'object') return null;

    session.version = Math.max(6, Number(session.version) || 0);
    session.mode = 'play';
    session.source = 'ready';
    session.delivery = session.delivery === 'multi' ? 'multi' : 'single';
    session.cardMode = session.delivery === 'multi' && session.cardMode === 'virtual' ? 'virtual' : 'physical';
    session.cardSeed = cleanSeed(session.cardSeed || session.seed || 'PARTITA') || 'PARTITA';
    session.count = normalizeCount(session.count);
    session.names = Array.from({ length: session.count }, (_, index) => S.cleanText(session.names?.[index] || '', S.limits.name));
    session.confirmed = Array.from({ length: session.count }, (_, index) => Boolean(session.confirmed?.[index]));
    session.spokenOpening = false;
    session.story = null;
    session.openingNotes = emptyOpeningNotes();
    session.stage = VALID_STAGES.has(session.stage) ? session.stage : 'setup';

    if (!S.isCollectionAvailable(session.collectionId)) {
      session.collectionId = '';
      session.readyStoryId = '';
      session.openingText = '';
      session.objectives = [];
      session.confirmed = Array(session.count).fill(false);
      if (session.stage !== 'setup') session.stage = COLLECTION_STAGE;
      return session;
    }

    const story = S.stories.find(item => item.id === session.readyStoryId) || null;
    if (!story || !S.storyAllowedInSession(session, story)) {
      session.readyStoryId = '';
      session.openingText = '';
      session.objectives = [];
      session.confirmed = Array(session.count).fill(false);
      if (!['setup', COLLECTION_STAGE].includes(session.stage)) session.stage = 'stories';
      return session;
    }

    session.openingText = story.opening;
    normalizeObjectives(session, story);
    return session;
  };

  const baseLoad = S.load;
  const baseSave = S.save;
  S.load = () => S.normalizeSession(baseLoad());
  S.save = session => {
    const normalized = S.normalizeSession(session);
    if (normalized) baseSave(normalized);
  };

  const baseSourceLabel = S.sourceLabel;
  S.sourceLabel = session => session?.source === 'ready'
    ? S.collectionForSession(session)?.title || 'Storia pronta'
    : baseSourceLabel(session);

  const availableInfo = collection => `<div class="collection-info-modal"><p>${S.esc(collection.description)}</p><section><h3>La città</h3><p>${S.esc(collection.world)}</p></section><p class="collection-independent-note">${S.esc(collection.independence)}</p></div>`;
  const comingInfo = collection => `<div class="collection-info-modal"><p><strong>${S.esc(collection.title)}</strong> aggiungerà ${collection.storyCount} nuove storie alla scelta.</p><p>${S.esc(collection.description)}</p><p class="collection-independent-note">${S.esc(collection.independence)}</p></div>`;

  S.openCollectionInfo = collectionId => {
    const collection = S.collectionById(collectionId);
    if (!collection) return;
    S.modal(collection.title, collection.status === 'available' ? availableInfo(collection) : comingInfo(collection), {
      wide: true,
      className: 'collection-info-dialog'
    });
  };

  const availableCard = collection => `<article class="collection-choice-card collection-choice-available"><header><span>${S.esc(collection.label)}</span><b class="collection-status collection-status-available">Disponibile</b></header><h3>${S.esc(collection.title)}</h3><p class="collection-choice-description">${S.esc(collection.description)}</p><section class="collection-choice-world"><h4>La città</h4><p>${S.esc(collection.world)}</p></section><p class="collection-independent-note">${S.esc(collection.independence)}</p><footer><span>${collection.storyCount} storie</span><button type="button" class="primary" data-select-collection="${S.esc(collection.id)}">Scegli questa collezione <span aria-hidden="true">→</span></button></footer></article>`;
  const comingCard = collection => `<article class="collection-choice-card collection-choice-coming"><header><span>${S.esc(collection.label)}</span><b class="collection-status collection-status-coming">In arrivo</b></header><h3>${S.esc(collection.title)}</h3><p class="collection-choice-description">${S.esc(collection.description)}</p><p class="collection-independent-note">${S.esc(collection.independence)}</p><footer><span>${collection.storyCount} storie</span><button type="button" class="secondary" data-coming-collection="${S.esc(collection.id)}">Dettagli</button></footer></article>`;

  S.renderCollections = (session, scroll = true) => {
    session.source = 'ready';
    session.stage = COLLECTION_STAGE;
    session.collectionId = '';
    session.readyStoryId = '';
    session.openingText = '';
    session.objectives = [];
    session.confirmed = Array(session.count).fill(false);
    S.save(session);

    const cards = S.collections.map(collection => collection.status === 'available'
      ? availableCard(collection)
      : comingCard(collection)).join('');

    S.mount(`<section class="surface collection-choice-screen"><div class="screen-heading"><p class="eyebrow">SCEGLI LA COLLEZIONE</p><h2>Quale raccolta giocherete?</h2><p>Ogni collezione riunisce storie con una propria atmosfera e un contesto comune.</p></div><div class="collection-choice-grid">${cards}</div></section>`, { session: true, scroll });

    S.play.querySelectorAll('[data-select-collection]').forEach(button => button.addEventListener('click', () => {
      const collectionId = button.dataset.selectCollection;
      if (!S.isCollectionAvailable(collectionId)) return;
      session.collectionId = collectionId;
      session.stage = 'stories';
      S.storyUi = { category: 'all', query: '', page: 0 };
      S.save(session);
      S.renderStories(session);
    }));

    S.play.querySelectorAll('[data-coming-collection]').forEach(button => button.addEventListener('click', () => {
      S.openCollectionInfo(button.dataset.comingCollection);
    }));
  };

  S.storyArchiveMarkup = ({ visible, pages }) => {
    const collection = S.collectionById(S.primaryCollectionId);
    const categoryButtons = Object.entries(S.categories).map(([key, category]) => `<button type="button" class="${S.storyUi.category === key ? 'active' : ''}" data-category="${key}">${S.esc(category.symbol)} ${S.esc(category.label)}<small>Genere</small></button>`).join('');
    const storyCards = visible.map(story => `<article class="ready-story"><div class="meta"><span>${S.esc(S.categories[story.category]?.symbol || '')} ${S.esc(S.categories[story.category]?.label || '')}</span><span>STORIA ${String(S.stories.indexOf(story) + 1).padStart(2, '0')}</span></div><h3>${S.esc(story.title)}</h3><p>${S.highlightStoryOpening(story)}</p><button type="button" data-ready-story="${S.esc(story.id)}">Scegli questa storia</button></article>`).join('');

    return `<section class="surface story-archive-surface"><div class="screen-heading story-archive-heading"><div class="story-archive-collection-line"><p class="eyebrow">${S.esc(collection?.title || 'STORIE PRONTE')}</p><button type="button" class="collection-info-trigger" data-collection-info="${S.esc(collection?.id || '')}">Informazioni sulla raccolta</button></div><h2>Scegliete una storia.</h2><p>Scegliete un genere, leggete gli incipit e decidete da quale situazione iniziare.</p></div><div class="story-toolbar"><input type="search" data-story-search value="${S.esc(S.storyUi.query)}" placeholder="Cerca titolo, luogo o personaggio"><button type="button" class="secondary" data-random-story>Casuale</button></div><div class="category-grid"><button type="button" class="${S.storyUi.category === 'all' ? 'active' : ''}" data-category="all">Tutte<small>${S.stories.length} storie</small></button>${categoryButtons}</div><div class="story-list">${storyCards || '<div class="hint">Nessuna storia trovata.</div>'}</div><div class="pagination"><button type="button" data-page-prev${S.storyUi.page === 0 ? ' disabled' : ''}>← Precedenti</button><span>${S.storyUi.page + 1} / ${pages}</span><button type="button" data-page-next${S.storyUi.page >= pages - 1 ? ' disabled' : ''}>Successive →</button></div></section>`;
  };
})();
