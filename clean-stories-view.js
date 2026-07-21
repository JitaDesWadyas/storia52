'use strict';

(() => {
  const S = window.S52;

  S.renderStories = (session, scroll = true) => {
    S.normalizeSession?.(session);
    if (!S.isCollectionAvailable?.(session.collectionId)) {
      S.renderCollections(session, scroll);
      return;
    }

    session.source = 'ready';
    session.stage = 'stories';
    S.save(session);

    const data = S.getStoryPage();
    S.mount(S.storyArchiveMarkup(data), { session: true, scroll });

    S.play.querySelector('[data-story-search]')?.addEventListener('input', event => {
      S.storyUi.query = S.cleanText(event.target.value, 80);
      S.storyUi.page = 0;
      S.renderStories(session, false);
      requestAnimationFrame(() => {
        const field = S.play.querySelector('[data-story-search]');
        field?.focus({ preventScroll: true });
        field?.setSelectionRange(field.value.length, field.value.length);
      });
    });

    S.play.querySelectorAll('[data-category]').forEach(button => button.addEventListener('click', () => {
      S.storyUi.category = S.categories[button.dataset.category] ? button.dataset.category : 'all';
      S.storyUi.page = 0;
      S.renderStories(session, false);
    }));

    S.play.querySelector('[data-random-story]')?.addEventListener('click', () => {
      const pool = data.filtered.length ? data.filtered : S.stories;
      if (pool.length) S.chooseReadyStory(session, pool[S.randomIndex(pool.length)]);
    });
    S.play.querySelector('[data-page-prev]')?.addEventListener('click', () => {
      S.storyUi.page -= 1;
      S.renderStories(session, false);
    });
    S.play.querySelector('[data-page-next]')?.addEventListener('click', () => {
      S.storyUi.page += 1;
      S.renderStories(session, false);
    });
    S.play.querySelector('[data-collection-info]')?.addEventListener('click', event => {
      S.openCollectionInfo(event.currentTarget.dataset.collectionInfo);
    });
    S.play.querySelectorAll('[data-ready-story]').forEach(button => button.addEventListener('click', () => {
      S.chooseReadyStory(session, S.stories.find(story => story.id === button.dataset.readyStory));
    }));
  };
})();
