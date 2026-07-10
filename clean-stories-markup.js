'use strict';
(() => {
  const S = window.S52;

  const wordsFrom = value => String(value || '')
    .replace(/[.,;:!?()]/g, ' ')
    .split(/\s+/)
    .map(word => word.trim())
    .filter(word => word.length >= 5 && !/^(della|delle|degli|dallo|dalla|dalle|quell|quando|prima|dopo|mentre|senza|nella|nelle|nell|alla|allo|agli|come|sono|stato|stata|vuole|deve|trova|scopre)$/i.test(word));

  const boldTerms = (text, terms) => {
    const unique = [...new Set(terms)].slice(0, 9);
    if (!unique.length) return S.esc(text);
    const pattern = new RegExp(`\\b(${unique.map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`, 'gi');
    return S.esc(text).replace(pattern, '<strong>$1</strong>');
  };

  S.highlightStoryOpening = story => boldTerms(story.opening, [
    ...wordsFrom(story.title),
    ...wordsFrom(story.protagonist).slice(0, 2),
    ...wordsFrom(story.objective).slice(0, 3),
    ...wordsFrom(story.problem).slice(0, 3)
  ]);

  S.highlightOpeningText = (text, session) => {
    const story = session?.story ? withStoryGoal(session.story, session.seed) : null;
    if (!story) return S.esc(text);
    return boldTerms(text, [
      ...wordsFrom(cardText('protagonist', story.protagonist)).slice(0, 2),
      ...wordsFrom(cardText('situation', story.situation)).slice(0, 3),
      ...wordsFrom(cardText('objective', story.goal)).slice(0, 3),
      ...wordsFrom(cardText('problem', story.problem)).slice(0, 3)
    ]);
  };

  S.storyArchiveMarkup = ({ visible, pages }) => `<section class="surface"><div class="screen-heading"><p class="eyebrow">STORIE PRONTE</p><h2>Scegliete la scena iniziale.</h2><p>Partite da un incipit già scritto. Poi ogni giocatore userà le carte per spingere la storia verso il proprio obiettivo segreto.</p></div><div class="story-toolbar"><input type="search" data-story-search value="${S.esc(S.storyUi.query)}" placeholder="Cerca titolo, luogo o personaggio"><button type="button" class="secondary" data-random-story>Casuale</button></div><div class="category-grid"><button type="button" class="${S.storyUi.category === 'all' ? 'active' : ''}" data-category="all">Tutte<small>Archivio</small></button>${Object.entries(S.categories).map(([key, category]) => `<button type="button" class="${S.storyUi.category === key ? 'active' : ''}" data-category="${key}">${S.esc(category.symbol)} ${S.esc(category.label)}<small>Raccolta</small></button>`).join('')}</div><div class="story-list">${visible.map(story => `<article class="ready-story"><div class="meta"><span>${S.esc(S.categories[story.category]?.symbol || '')} ${S.esc(S.categories[story.category]?.label || '')}</span><span>STORIA ${String(S.stories.indexOf(story) + 1).padStart(2, '0')}</span></div><h3>${S.esc(story.title)}</h3><p>${S.highlightStoryOpening(story)}</p><button type="button" data-ready-story="${S.esc(story.id)}">Scegli questa storia</button></article>`).join('') || '<div class="hint">Nessuna storia trovata.</div>'}</div><div class="pagination"><button type="button" data-page-prev${S.storyUi.page === 0 ? ' disabled' : ''}>← Precedenti</button><span>${S.storyUi.page + 1} / ${pages}</span><button type="button" data-page-next${S.storyUi.page >= pages - 1 ? ' disabled' : ''}>Successive →</button></div></section>`;
})()