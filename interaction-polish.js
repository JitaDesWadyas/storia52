'use strict';

(() => {
  const S = window.S52;
  if (!S) return;

  const motionAllowed = () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  S.bindCreatorMedia = root => {
    root.querySelectorAll('[data-creator-photo]').forEach(image => {
      if (image.dataset.fallbackBound) return;
      image.dataset.fallbackBound = 'true';
      const revealFallback = () => image.closest('.creator-photo-frame')?.classList.add('is-fallback');
      image.addEventListener('error', revealFallback, { once: true });
      if (image.complete && image.naturalWidth === 0) revealFallback();
    });
  };

  const animateRuleBody = (detail, opening) => {
    const body = detail.querySelector(':scope > .body');
    if (!body) return;
    body.getAnimations().forEach(animation => animation.cancel());

    if (opening) {
      detail.open = true;
      detail.classList.add('is-opening');
      const targetHeight = body.scrollHeight;
      if (!motionAllowed()) {
        body.style.height = 'auto';
        body.style.opacity = '1';
        detail.classList.remove('is-opening');
        detail.classList.add('is-open');
        return;
      }
      const animation = body.animate([
        { height: '0px', opacity: 0, transform: 'translateY(-5px)' },
        { height: `${targetHeight}px`, opacity: 1, transform: 'translateY(0)' }
      ], { duration: 260, easing: 'cubic-bezier(.2,.8,.2,1)' });
      animation.onfinish = () => {
        body.style.height = 'auto';
        body.style.opacity = '1';
        detail.classList.remove('is-opening');
        detail.classList.add('is-open');
      };
      return;
    }

    const startHeight = body.getBoundingClientRect().height;
    detail.classList.remove('is-open');
    if (!motionAllowed()) {
      body.style.height = '0px';
      body.style.opacity = '0';
      detail.open = false;
      return;
    }
    const animation = body.animate([
      { height: `${startHeight}px`, opacity: 1, transform: 'translateY(0)' },
      { height: '0px', opacity: 0, transform: 'translateY(-5px)' }
    ], { duration: 210, easing: 'cubic-bezier(.4,0,.2,1)' });
    animation.onfinish = () => {
      body.style.height = '0px';
      body.style.opacity = '0';
      detail.open = false;
    };
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
        detail.open = false;
        detail.classList.remove('is-open', 'is-opening');
        body.style.height = '0px';
        body.style.opacity = '0';
        summary.setAttribute('aria-expanded', 'false');
        summary.addEventListener('click', event => {
          event.preventDefault();
          const willOpen = !detail.open;
          details.filter(other => other !== detail && other.open).forEach(other => {
            other.querySelector(':scope > summary')?.setAttribute('aria-expanded', 'false');
            animateRuleBody(other, false);
          });
          summary.setAttribute('aria-expanded', String(willOpen));
          animateRuleBody(detail, willOpen);
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
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
    S.bindRulebook(host);
    S.bindCreatorMedia(host);
    syncModalState();
  };

  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => mutation.addedNodes.forEach(node => {
      if (!(node instanceof HTMLElement)) return;
      if (node.matches('.modal')) enhanceModal(node);
      node.querySelectorAll?.('.modal').forEach(enhanceModal);
      S.bindRulebook(node);
      S.bindCreatorMedia(node);
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
