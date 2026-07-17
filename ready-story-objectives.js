'use strict';

(() => {
  const S = window.S52;
  if (!S) return;

  const objectivesByStory = window.STORIA52_READY_OBJECTIVES || {};
  const score = value => Array.from(String(value || '')).reduce(
    (total, char, index) => (total + char.charCodeAt(0) * (index + 11)) % 1000003,
    0
  );

  S.objectivesForReadyStory = (story, count = 4, seed = '') => {
    const plans = objectivesByStory[story?.id] || [];
    if (!plans.length) return [];

    const wanted = Math.max(1, Math.min(Number(count) || 4, plans.length));
    const start = score(`${seed}:${story.id}`) % plans.length;
    const step = plans.length === 10 ? 3 : 1;

    return Array.from({ length: wanted }, (_, index) => {
      const slot = (start + index * step) % plans.length;
      const plan = plans[slot];
      return {
        custom: true,
        storyId: story.id,
        slot,
        title: plan.title,
        text: plan.text,
        finale: plan.finale
      };
    });
  };

  const previousChooseReadyStory = S.chooseReadyStory;
  S.chooseReadyStory = (session, story) => {
    if (!story) return;
    session.objectives = S.objectivesForReadyStory(story, session.count, session.seed);
    session.confirmed = Array(session.count).fill(false);
    previousChooseReadyStory(session, story);
  };

  const invalid = (window.STORIA52_READY_STORIES || []).filter(
    story => !Array.isArray(objectivesByStory[story.id]) || objectivesByStory[story.id].length !== 10
  );
  if (invalid.length) {
    console.error('Obiettivi non validi: ogni storia pronta deve avere esattamente 10 finali.', invalid.map(story => story.id));
  }
})();
