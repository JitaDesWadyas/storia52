'use strict';
(() => {
  const S = window.S52;
  S.renderStories = session => {
    session.stage = 'stories';
    S.save(session);
    const data = S.getStoryPage();
    S.mount(S.storyArchiveMarkup(data), { label: session.mode === 'guided' ? 'Partita con assistente' : 'Partita autonoma', session: true, scroll: false });
    const search = S.play.querySelector('[data-story-search]');
    search.addEventListener('input', event => {
      S.storyUi.query = event.target.value;
      S.storyUi.page = 0;
      S.renderStories(session);
      requestAnimationFrame(() => {
        const field = S.play.querySelector('[data-story-search]');
        field?.focus({ preventScroll: true });
        field?.setSelectionRange(field.value.length, field.value.length);
      });
    });
    S.play.querySelectorAll('[data-category]').forEach(button => button.addEventListener('click', () => {
      S.storyUi.category = button.dataset.category;
      S.storyUi.page = 0;
      S.renderStories(session);
    }));
    S.play.querySelector('[data-random-story]').addEventListener('click', () => {
      const pool = data.filtered.length ? data.filtered : S.stories;
      S.chooseReadyStory(session, pool[S.randomIndex(pool.length)]);
    });
    S.play.querySelector('[data-page-prev]').addEventListener('click', () => { S.storyUi.page -= 1; S.renderStories(session); });
    S.play.querySelector('[data-page-next]').addEventListener('click', () => { S.storyUi.page += 1; S.renderStories(session); });
    S.play.querySelectorAll('[data-ready-story]').forEach(button => button.addEventListener('click', () => {
      S.chooseReadyStory(session, S.stories.find(story => story.id === button.dataset.readyStory));
    }));
  };
})();
