'use strict';
(() => {
  const V = window.STORIA52_OPENING_V4;
  if (!V) return;
  V.syncInput = session => {
    const input = document.getElementById('opening-v4-input');
    if (!input) return;
    session.context[V.STEPS[session.contextStep].key] = input.value.trim();
    session.context.finalOpening = '';
    V.G.save(session);
  };
  V.refreshPreview = session => {
    const quote = document.querySelector('.opening-v4-live blockquote');
    if (quote) quote.textContent = V.preview(session);
  };
  V.drawStep = session => {
    const host = document.getElementById('contextStepHost');
    if (!host) return;
    host.innerHTML = V.stepMarkup(session);
    const input = document.getElementById('opening-v4-input');
    const next = host.querySelector('[data-opening-v4-next]');
    const validate = () => { next.disabled = input.value.trim().length < 18; };
    input.addEventListener('input', () => {
      V.syncInput(session);
      validate();
      V.refreshPreview(session);
    });
    validate();
  };
})();
