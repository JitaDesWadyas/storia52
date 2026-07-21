'use strict';

(() => {
  const CREATOR_SRC = 'creator-jita.svg?v=23';

  const refreshCreatorImages = root => {
    const scope = root?.querySelectorAll ? root : document;
    scope.querySelectorAll('img[src*="creator-jita.svg"]').forEach(image => {
      if (image.getAttribute('src') !== CREATOR_SRC) image.setAttribute('src', CREATOR_SRC);
      image.setAttribute('decoding', 'async');
    });
  };

  refreshCreatorImages(document);
  new MutationObserver(records => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE) refreshCreatorImages(node);
      }
    }
  }).observe(document.body, { childList: true, subtree: true });
})();
