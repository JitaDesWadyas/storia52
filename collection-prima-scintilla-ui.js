'use strict';

(() => {
  const S = window.S52;
  if (!S) return;

  const collection = window.STORIA52_READY_COLLECTION || null;
  S.collections = window.STORIA52_READY_COLLECTIONS || [];
  S.collection = collection;
  S.storyCollection = story => S.collections.find(item => item.id === story?.collectionId) || collection;

  const originalSourceLabel = S.sourceLabel;
  S.sourceLabel = session => {
    if (session?.source !== 'ready') return originalSourceLabel(session);
    return S.storyCollection(S.readyStory(session))?.title || 'Storia pronta';
  };

  const collectionBanner = () => {
    if (!collection) return '';
    return `<section class="story-collection-banner"><div class="story-collection-copy"><p class="eyebrow">${S.esc(collection.label)}</p><h3>${S.esc(collection.title)}</h3><p>${S.esc(collection.description)}</p><p class="story-collection-world">${S.esc(collection.world)}</p></div><div class="story-collection-stats" aria-label="Contenuto della collezione"><span><b>${collection.storyCount}</b><small>storie</small></span><span><b>${collection.outcomeCount}</b><small>finali</small></span><span><b>${Object.keys(S.categories).length}</b><small>generi</small></span></div></section>`;
  };

  if (typeof S.homeMarkup === 'function') {
    const originalHomeMarkup = S.homeMarkup;
    S.homeMarkup = () => {
      const html = originalHomeMarkup();
      const compact = collection
        ? `<section class="home-collection-strip"><div><span>${S.esc(collection.label)}</span><b>${S.esc(collection.title)}</b><small>${S.esc(collection.description)}</small></div><i aria-hidden="true">✦</i></section>`
        : '';
      return html.replace('<div class="home-divider"', `${compact}<div class="home-divider"`);
    };
  }

  S.storyArchiveMarkup = ({ visible, pages }) => `<section class="surface story-archive-surface">${collectionBanner()}<div class="screen-heading story-archive-heading"><p class="eyebrow">STORIE PRONTE</p><h2>Scegliete la scintilla iniziale.</h2><p>Ogni storia appartiene a ${S.esc(collection?.title || 'questa collezione')}, ma può essere giocata senza conoscere le altre. Scegliete il genere che vi va oggi e trasformate l’incipit nella vostra storia.</p></div><div class="story-toolbar"><input type="search" data-story-search value="${S.esc(S.storyUi.query)}" placeholder="Cerca titolo, luogo o personaggio"><button type="button" class="secondary" data-random-story>Casuale</button></div><div class="category-grid"><button type="button" class="${S.storyUi.category === 'all' ? 'active' : ''}" data-category="all">Tutte<small>${S.stories.length} storie</small></button>${Object.entries(S.categories).map(([key, category]) => `<button type="button" class="${S.storyUi.category === key ? 'active' : ''}" data-category="${key}">${S.esc(category.symbol)} ${S.esc(category.label)}<small>Genere</small></button>`).join('')}</div><div class="story-list">${visible.map(story => `<article class="ready-story"><div class="meta"><span>${S.esc(S.categories[story.category]?.symbol || '')} ${S.esc(S.categories[story.category]?.label || '')}</span><span>${S.esc(S.storyCollection(story)?.shortLabel || 'COLLEZIONE')} · ${String(S.stories.indexOf(story) + 1).padStart(2, '0')}</span></div><h3>${S.esc(story.title)}</h3><p>${S.highlightStoryOpening(story)}</p><button type="button" data-ready-story="${S.esc(story.id)}">Scegli questa storia</button></article>`).join('') || '<div class="hint">Nessuna storia trovata.</div>'}</div><div class="pagination"><button type="button" data-page-prev${S.storyUi.page === 0 ? ' disabled' : ''}>← Precedenti</button><span>${S.storyUi.page + 1} / ${pages}</span><button type="button" data-page-next${S.storyUi.page >= pages - 1 ? ' disabled' : ''}>Successive →</button></div></section>`;
})();
