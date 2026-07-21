'use strict';
(() => {
  const S = window.S52;
  S.getStoryPage = () => {
    const filtered = S.stories.filter(story => {
      const categoryOk = S.storyUi.category === 'all' || story.category === S.storyUi.category;
      const text = `${story.title} ${story.opening} ${story.protagonist} ${story.situation} ${story.objective} ${story.problem}`.toLowerCase();
      return categoryOk && text.includes(S.storyUi.query.toLowerCase());
    });
    const pages = Math.max(1, Math.ceil(filtered.length / 3));
    S.storyUi.page = Math.max(0, Math.min(S.storyUi.page, pages - 1));
    return { filtered, pages, visible: filtered.slice(S.storyUi.page * 3, S.storyUi.page * 3 + 3) };
  };
  S.chooseReadyStory = (session, story) => {
    if (!S.storyAllowedInSession?.(session, story)) {
      session.readyStoryId = '';
      session.openingText = '';
      session.stage = S.isCollectionAvailable?.(session.collectionId) ? 'stories' : 'collections';
      S.save(session);
      S.toast('Questa storia non è disponibile');
      if (session.stage === 'collections') S.renderCollections(session); else S.renderStories(session);
      return;
    }
    session.source = 'ready';
    session.readyStoryId = story.id;
    session.openingText = story.opening;
    session.spokenOpening = false;
    S.continueAfterSource(session);
  };
  S.changeReadyStory = session => {
    session.source = 'ready';
    session.readyStoryId = '';
    session.openingText = '';
    session.spokenOpening = false;
    session.confirmed = Array(session.count).fill(false);
    if (!S.isCollectionAvailable?.(session.collectionId)) {
      session.stage = 'collections';
      S.save(session);
      S.renderCollections(session);
      return;
    }
    session.stage = 'stories';
    S.save(session);
    S.renderStories(session);
  };
})();
