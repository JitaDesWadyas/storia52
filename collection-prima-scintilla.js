'use strict';

(() => {
  const collection = {
    id: 'prima-scintilla',
    title: 'La Prima Scintilla',
    label: 'COLLEZIONE GRATUITA 01',
    shortLabel: 'COLLEZIONE 01',
    description: 'Ventiquattro inizi da accendere con la vostra creatività, collegati dallo stesso mondo attraverso epoche e generi diversi.',
    world: 'Valmora è il passato di Harminger. Valma è la città moderna e futura cresciuta sopra le sue tracce. Vetra, l’Orla, il Lanterna, il San Lume e Meridiana ritornano da una storia all’altra, ma ogni partita resta completa anche da sola.',
    free: true,
    storyCount: 24,
    outcomeCount: 192
  };

  window.STORIA52_READY_COLLECTIONS = [collection];
  window.STORIA52_READY_COLLECTION = collection;
  window.STORIA52_READY_STORIES = (window.STORIA52_READY_STORIES || []).map(story => ({
    ...story,
    collectionId: collection.id
  }));
})();
