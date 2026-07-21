'use strict';
(() => {
  const S = window.S52;
  if (!S) return;

  const previousLoad = S.load;
  S.load = () => {
    const session = previousLoad();
    if (!session || typeof session !== 'object') return null;

    if (session.source === 'ready' && session.readyStoryId && !S.stories.some(story => story.id === session.readyStoryId)) {
      return null;
    }

    const count = Math.max(2, Math.min(8, Number(session.count) || 4));
    session.count = count;
    session.names = Array.from({ length: count }, (_, index) => session.names?.[index] || '');
    session.objectives = Array.from({ length: count }, (_, index) => session.objectives?.[index]).filter(Boolean);
    session.confirmed = Array.from({ length: count }, (_, index) => Boolean(session.confirmed?.[index]));
    return session;
  };
})();
