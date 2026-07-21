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
      body.style.height = '0px';
      body.style.opacity = '0';
      await nextFrame();
      const targetHeight = body.scrollHeight;

      if (isHeavyRuleBody(body, targetHeight)) {
        body.style.height = 'auto';
        const animation = body.animate([
          { opacity: 0, transform: 'translateY(-5px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ], { duration: 180, easing: 'cubic-bezier(.22,.72,.2,1)', fill: 'both' });
        await animation.finished.catch(() => {});
        body.style.opacity = '1';
        body.style.transform = '';
        detail.classList.remove('is-opening');
        detail.classList.add('is-open');
        summary.setAttribute('aria-expanded', 'true');
        detail.dataset.animating = 'false';
        return;
      }

      const duration = Math.max(360, Math.min(560, 300 + targetHeight * .08));
      const animation = body.animate([
        { height: '0px', opacity: 0, transform: 'translateY(-8px)' },
        { height: `${targetHeight}px`, opacity: 1, transform: 'translateY(0)' }
      ], { duration, easing: 'cubic-bezier(.22,.72,.2,1)', fill: 'both' });
      await animation.finished.catch(() => {});
      body.style.height = 'auto';
      body.style.opacity = '1';
      body.style.transform = '';
      detail.classList.remove('is-opening');
      detail.classList.add('is-open');
      summary.setAttribute('aria-expanded', 'true');
      detail.dataset.animating = 'false';
      return;
    }

    const startHeight = body.getBoundingClientRect().height || body.scrollHeight;
    body.style.height = `${startHeight}px`;
    body.style.opacity = '1';
    detail.classList.remove('is-open');
    detail.classList.add('is-closing');
    await nextFrame();

    if (isHeavyRuleBody(body, startHeight)) {
      const animation = body.animate([
        { opacity: 1, transform: 'translateY(0)' },
        { opacity: 0, transform: 'translateY(-4px)' }
      ], { duration: 140, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'both' });
      await animation.finished.catch(() => {});
      body.style.height = '0px';
      body.style.opacity = '0';
      body.style.transform = '';
      detail.open = false;
      detail.classList.remove('is-closing');
      summary.setAttribute('aria-expanded', 'false');
      detail.dataset.animating = 'false';
      return;
    }

    const duration = Math.max(300, Math.min(460, 250 + startHeight * .06));
    const animation = body.animate([
      { height: `${startHeight}px`, opacity: 1, transform: 'translateY(0)' },
      { height: '0px', opacity: 0, transform: 'translateY(-6px)' }
    ], { duration, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'both' });
    await animation.finished.catch(() => {});
    body.style.height = '0px';
    body.style.opacity = '0';
    body.style.transform = '';
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
