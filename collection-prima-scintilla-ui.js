'use strict';

(() => {
  const S = window.S52;
  if (!S) return;

  S.collections = window.STORIA52_READY_COLLECTIONS || [];
  S.primaryCollectionId = window.STORIA52_PRIMARY_COLLECTION_ID || 'prima-scintilla';
  S.collectionById = id => S.collections.find(collection => collection.id === id) || null;
  S.isCollectionAvailable = id => {
    const collection = S.collectionById(id);
    return Boolean(collection && collection.status === 'available' && collection.id === S.primaryCollectionId);
  };
  S.collectionForSession = session => S.isCollectionAvailable(session?.collectionId) ? S.collectionById(session.collectionId) : null;
  S.storyCollection = story => S.collectionById(story?.collectionId) || null;
  S.storyAllowedInSession = (session, story) => {
    const collection = S.collectionForSession(session);
    return Boolean(collection && story && collection.storyIds.includes(story.id) && story.collectionId === collection.id);
  };

  S.secureCollectionSession = session => {
    if (!session || typeof session !== 'object') return session;
    session.source = 'ready';
    session.spokenOpening = false;
    if (!S.isCollectionAvailable(session.collectionId)) {
      session.collectionId = '';
      session.readyStoryId = '';
      session.openingText = '';
      if (!['setup', 'collections'].includes(session.stage)) session.stage = 'collections';
    }
    if (session.readyStoryId) {
      const story = S.stories.find(item => item.id === session.readyStoryId);
      if (!S.storyAllowedInSession(session, story)) {
        session.readyStoryId = '';
        session.openingText = '';
        session.stage = 'stories';
      }
    }
    return session;
  };

  const originalLoad = S.load;
  S.load = () => S.secureCollectionSession(originalLoad());

  const originalSourceLabel = S.sourceLabel;
  S.sourceLabel = session => {
    if (session?.source !== 'ready') return originalSourceLabel(session);
    return S.collectionForSession(session)?.title || 'Storia pronta';
  };

  const infoBody = collection => `<div class="collection-info-modal"><p>${S.esc(collection.description)}</p>${collection.world ? `<section><h3>La città</h3><p>${S.esc(collection.world)}</p></section>` : ''}<p class="collection-independent-note">${S.esc(collection.independence)}</p></div>`;

  S.openCollectionInfo = collectionId => {
    const collection = S.collectionById(collectionId);
    if (!collection) return;
    const title = collection.status === 'available' ? collection.title : 'In arrivo';
    const body = collection.status === 'available'
      ? infoBody(collection)
      : `<div class="collection-info-modal"><p><strong>${S.esc(collection.title)}</strong> conterrà ${collection.storyCount} nuove storie.</p><p>La raccolta non è ancora disponibile e non può essere attivata dalla pagina, da un invito o modificando il salvataggio locale.</p></div>`;
    S.modal(title, body, { wide: true, className: 'collection-info-dialog' });
  };

  const availableCard = collection => `<article class="collection-choice-card collection-choice-available"><header><span>${S.esc(collection.label)}</span><b>Disponibile</b></header><h3>${S.esc(collection.title)}</h3><p class="collection-choice-description">${S.esc(collection.description)}</p><section class="collection-choice-world"><h4>La città</h4><p>${S.esc(collection.world)}</p></section><p class="collection-independent-note">${S.esc(collection.independence)}</p><footer><span>${collection.storyCount} storie</span><button type="button" class="primary" data-select-collection="${S.esc(collection.id)}">Scegli questa collezione <span aria-hidden="true">→</span></button></footer></article>`;

  const comingCard = collection => `<article class="collection-choice-card collection-choice-coming"><div class="collection-coming-overlay"><span>IN ARRIVO</span></div><header><span>${S.esc(collection.label)}</span><b>Prossimamente</b></header><h3>${S.esc(collection.title)}</h3><p class="collection-choice-description">${S.esc(collection.description)}</p><p class="collection-independent-note">${S.esc(collection.independence)}</p><footer><span>${collection.storyCount} storie</span><button type="button" class="secondary" data-coming-collection="${S.esc(collection.id)}">Scopri di più</button></footer></article>`;

  S.renderCollections = (session, scroll = true) => {
    session.source = 'ready';
    session.stage = 'collections';
    session.collectionId = '';
    session.readyStoryId = '';
    session.openingText = '';
    session.spokenOpening = false;
    session.confirmed = Array(session.count).fill(false);
    S.save(session);

    S.mount(`<section class="surface collection-choice-screen"><div class="screen-heading"><p class="eyebrow">SCEGLI LA COLLEZIONE</p><h2>Da quale raccolta parte la vostra storia?</h2><p>Qui trovate il contesto generale. Dopo la scelta vedrete subito gli incipit, senza ripetere queste informazioni sopra ogni storia.</p></div><div class="collection-choice-grid">${S.collections.map(collection => collection.status === 'available' ? availableCard(collection) : comingCard(collection)).join('')}</div></section>`, { session: true, scroll });

    S.play.querySelectorAll('[data-select-collection]').forEach(button => button.addEventListener('click', () => {
      const collectionId = button.dataset.selectCollection;
      if (!S.isCollectionAvailable(collectionId)) {
        S.openCollectionInfo(collectionId);
        return;
      }
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
    return `<section class="surface story-archive-surface"><div class="screen-heading story-archive-heading"><div class="story-archive-collection-line"><p class="eyebrow">${S.esc(collection?.title || 'STORIE PRONTE')}</p><button type="button" class="collection-info-trigger" data-collection-info="${S.esc(collection?.id || '')}">Informazioni sulla raccolta</button></div><h2>Scegliete una storia.</h2><p>Leggete soltanto gli incipit e scegliete quello che vi dà più idee. La raccolta resta sullo sfondo.</p></div><div class="story-toolbar"><input type="search" data-story-search value="${S.esc(S.storyUi.query)}" placeholder="Cerca titolo, luogo o personaggio"><button type="button" class="secondary" data-random-story>Casuale</button></div><div class="category-grid"><button type="button" class="${S.storyUi.category === 'all' ? 'active' : ''}" data-category="all">Tutte<small>${S.stories.length} storie</small></button>${Object.entries(S.categories).map(([key, category]) => `<button type="button" class="${S.storyUi.category === key ? 'active' : ''}" data-category="${key}">${S.esc(category.symbol)} ${S.esc(category.label)}<small>Genere</small></button>`).join('')}</div><div class="story-list">${visible.map(story => `<article class="ready-story"><div class="meta"><span>${S.esc(S.categories[story.category]?.symbol || '')} ${S.esc(S.categories[story.category]?.label || '')}</span><span>STORIA ${String(S.stories.indexOf(story) + 1).padStart(2, '0')}</span></div><h3>${S.esc(story.title)}</h3><p>${S.highlightStoryOpening(story)}</p><button type="button" data-ready-story="${S.esc(story.id)}">Scegli questa storia</button></article>`).join('') || '<div class="hint">Nessuna storia trovata.</div>'}</div><div class="pagination"><button type="button" data-page-prev${S.storyUi.page === 0 ? ' disabled' : ''}>← Precedenti</button><span>${S.storyUi.page + 1} / ${pages}</span><button type="button" data-page-next${S.storyUi.page >= pages - 1 ? ' disabled' : ''}>Successive →</button></div></section>`;
  };
})();
