'use strict';

(() => {
  const S = window.S52;
  if (!S) return;

  const motionAllowed = () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nextFrame = () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  const isHeavyRuleBody = (body, height = body.scrollHeight) => Boolean(body.querySelector('.card-meaning-board')) || height > 720;

  const animateRuleBody = async (detail, opening) => {
    const body = detail.querySelector(':scope > .body');
    const summary = detail.querySelector(':scope > summary');
    if (!body || !summary || detail.dataset.animating === 'true') return;

    detail.dataset.animating = 'true';
    body.getAnimations().forEach(animation => animation.cancel());

    if (!motionAllowed()) {
      detail.open = opening;
      detail.classList.toggle('is-open', opening);
      body.style.height = opening ? 'auto' : '0px';
      body.style.opacity = opening ? '1' : '0';
      summary.setAttribute('aria-expanded', String(opening));
      detail.dataset.animating = 'false';
      return;
    }

    if (opening) {
      detail.open = true;
      detail.classList.add('is-opening');
      body.style.contentVisibility = 'visible';
      body.style.height = '0px';
      body.style.opacity = '0';
      body.style.overflow = 'hidden';
      await nextFrame();
      const targetHeight = body.scrollHeight;
      const heavy = isHeavyRuleBody(body, targetHeight);
      const duration = heavy
        ? Math.max(1100, Math.min(1450, 900 + targetHeight * .2))
        : Math.max(420, Math.min(650, 330 + targetHeight * .1));
      const animation = body.animate([
        { height: '0px', opacity: 0, transform: 'translateY(-10px)' },
        { height: `${targetHeight}px`, opacity: 1, transform: 'translateY(0)' }
      ], { duration, easing: 'cubic-bezier(.16,.72,.18,1)', fill: 'both' });
      await animation.finished.catch(() => {});
      body.style.height = 'auto';
      body.style.opacity = '1';
      body.style.transform = '';
      body.style.overflow = '';
      detail.classList.remove('is-opening');
      detail.classList.add('is-open');
      summary.setAttribute('aria-expanded', 'true');
      detail.dataset.animating = 'false';
      return;
    }

    const startHeight = body.getBoundingClientRect().height || body.scrollHeight;
    body.style.contentVisibility = 'visible';
    body.style.height = `${startHeight}px`;
    body.style.opacity = '1';
    body.style.overflow = 'hidden';
    detail.classList.remove('is-open');
    detail.classList.add('is-closing');
    await nextFrame();

    const heavy = isHeavyRuleBody(body, startHeight);
    const duration = heavy
      ? Math.max(780, Math.min(1100, 660 + startHeight * .14))
      : Math.max(340, Math.min(520, 280 + startHeight * .07));
    const animation = body.animate([
      { height: `${startHeight}px`, opacity: 1, transform: 'translateY(0)' },
      { height: '0px', opacity: 0, transform: 'translateY(-8px)' }
    ], { duration, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'both' });
    await animation.finished.catch(() => {});
    body.style.height = '0px';
    body.style.opacity = '0';
    body.style.transform = '';
    body.style.overflow = '';
    detail.open = false;
    detail.classList.remove('is-closing');
    summary.setAttribute('aria-expanded', 'false');
    detail.dataset.animating = 'false';
  };

  S.bindRulebook = root => {
    root.querySelectorAll('.rulebook').forEach(rulebook => {
      if (rulebook.dataset.animatedRulebook) return;
      rulebook.dataset.animatedRulebook = 'true';
      const details = [...rulebook.querySelectorAll(':scope > details')];

      details.forEach(detail => {
        const summary = detail.querySelector(':scope > summary');
        const body = detail.querySelector(':scope > .body');
        if (!summary || !body) return;

        const initiallyOpen = detail.open;
        detail.classList.toggle('is-open', initiallyOpen);
        body.style.height = initiallyOpen ? 'auto' : '0px';
        body.style.opacity = initiallyOpen ? '1' : '0';
        summary.setAttribute('aria-expanded', String(initiallyOpen));

        summary.addEventListener('click', event => {
          event.preventDefault();
          animateRuleBody(detail, !detail.open);
        });
      });
    });
  };

  const syncModalState = () => document.body.classList.toggle('modal-open', Boolean(document.querySelector('.modal')));

  const enhanceModal = host => {
    if (!(host instanceof HTMLElement) || !host.classList.contains('modal') || host.dataset.enhancedModal) return;
    host.dataset.enhancedModal = 'true';
    host.setAttribute('role', 'dialog');
    host.setAttribute('aria-modal', 'true');
    const card = host.querySelector('.modal-card');
    const close = host.querySelector('.modal-close');
    const title = card?.querySelector(':scope > h2');
    if (title) {
      if (!title.id) title.id = `modal-title-${Math.random().toString(36).slice(2, 8)}`;
      host.setAttribute('aria-labelledby', title.id);
    }
    requestAnimationFrame(() => close?.focus({ preventScroll: true }));
    host.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close?.click();
        return;
      }
      if (event.key !== 'Tab' || !card) return;
      const focusable = [...card.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter(element => element.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
    S.bindRulebook(host);
    syncModalState();
  };

  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => mutation.addedNodes.forEach(node => {
      if (!(node instanceof HTMLElement)) return;
      if (node.matches('.modal')) enhanceModal(node);
      node.querySelectorAll?.('.modal').forEach(enhanceModal);
      S.bindRulebook(node);
    }));
    syncModalState();
  });
  observer.observe(document.body, { childList: true, subtree: true });
  document.querySelectorAll('.modal').forEach(enhanceModal);

  const baseOpenRulesModal = S.openRulesModal;
  if (baseOpenRulesModal) {
    S.openRulesModal = (...args) => {
      const modal = baseOpenRulesModal(...args);
      requestAnimationFrame(() => document.querySelectorAll('.rules-modal').forEach(enhanceModal));
      return modal;
    };
  }

  document.addEventListener('dragstart', event => {
    if (event.target instanceof HTMLImageElement) event.preventDefault();
  });
})();
