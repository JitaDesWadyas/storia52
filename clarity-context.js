'use strict';
(() => {
  const G = window.G52;
  if (!G) return;
  G.flow.contextChoice = session => {
    session.contextMode ||= 'suggestions';
    session.contextStep = 0;
    G.save(session);
    G.flow.contextForm(session);
  };
  const previous = G.flow.contextForm;
  G.flow.contextForm = session => {
    previous(session);
    if (session.openingBuilderVersion === 3) return;
    G.game.querySelector('.screen-heading p:last-child')?.remove();
    const workspace = G.game.querySelector('.context-workspace');
    const template = document.querySelector('#clarityLiveOpening');
    if (!workspace || !template) return;
    workspace.before(template.content.cloneNode(true));
    const parts = ['protagonist', 'situation', 'goal', 'problem'];
    const refresh = () => {
      const index = Math.max(0, Math.min(3, Number(session.contextStep) || 0));
      G.game.querySelectorAll('[data-story-key]').forEach(node => { node.hidden = node.dataset.storyKey !== parts[index]; });
      G.game.querySelector('.context-link')?.remove();
      const quote = G.game.querySelector('.opening-live blockquote');
      if (quote) quote.textContent = G.flow.openingText(session);
      const field = G.game.querySelector('.context-field:not(.name-field)');
      field?.classList.toggle('has-selected-answer', Boolean(field.querySelector('.suggestion-chip.selected')));
    };
    const host = G.game.querySelector('#contextStepHost');
    if (host) new MutationObserver(refresh).observe(host, { childList: true, subtree: true });
    G.game.addEventListener('input', refresh);
    G.game.addEventListener('click', () => requestAnimationFrame(refresh));
    refresh();
  };
})();
