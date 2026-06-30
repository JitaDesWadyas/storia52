'use strict';
(() => {
  const G = window.G52;
  const scenes = window.STORIA52_COMPLETE_SCENES;
  if (!G?.flow || !Array.isArray(scenes)) return;

  document.addEventListener('click', event => {
    if (!event.target.closest('.opening-v3')) return;

    const choice = event.target.closest('[data-opening-v3-choice]');
    if (choice) {
      event.preventDefault();
      event.stopImmediatePropagation();
      const session = G.load();
      const scene = scenes.find(item => item.id === choice.dataset.openingV3Choice);
      if (!session || !scene) return;
      session.context ||= {};
      session.context.finalOpening = scene.text;
      session.openingV3Selected = scene.id;
      session.openingV3Manual = false;
      G.save(session);
      G.flow.opening(session);
      return;
    }

    if (event.target.closest('[data-opening-v3-more]')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      const session = G.load();
      if (!session) return;
      session.openingV3Current = [];
      G.save(session);
      G.flow.contextForm(session);
      return;
    }

    if (event.target.closest('[data-opening-v3-manual]')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      const session = G.load();
      if (!session) return;
      session.context ||= {};
      session.context.finalOpening = '';
      session.openingV3Selected = '';
      session.openingV3Manual = true;
      G.save(session);
      G.flow.opening(session);
    }
  }, true);
})();
