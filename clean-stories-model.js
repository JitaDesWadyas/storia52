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
    if (!story) return;
    session.source = 'ready';
    session.readyStoryId = story.id;
    session.openingText = story.opening;
    session.spokenOpening = false;
    S.continueAfterSource(session);
  };
  S.changeReadyStory = session => {
    session.source = 'ready';
    session.stage = 'stories';
    session.readyStoryId = '';
    session.openingText = '';
    session.spokenOpening = false;
    session.confirmed = Array(session.count).fill(false);
    S.save(session);
    S.renderStories(session);
  };
})();