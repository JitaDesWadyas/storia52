'use strict';

(() => {
  const primaryStoryIds = ['real01', 'mys02', 'sci01', 'fan02', 'hor02', 'lov01', 'adv01', 'com03'];
  const allStories = window.STORIA52_READY_STORIES || [];
  const storiesById = new Map(allStories.map(story => [story.id, story]));

  const collections = [
    {
      id: 'prima-scintilla',
      title: 'La Prima Scintilla',
      label: 'COLLEZIONE GRATUITA 01',
      shortLabel: 'COLLEZIONE 01',
      status: 'available',
      storyCount: 8,
      storyIds: primaryStoryIds,
      description: 'Otto incipit scelti per iniziare subito: uno per ogni genere, pensati per lasciare spazio alle vostre idee.',
      world: 'Valma è una città moderna attraversata dall’Orla: quartieri popolari, ospedali aperti di notte, teatri in difficoltà, grandi aziende, cantieri e tecnologie che cambiano il modo in cui le persone vivono insieme. Dietro luoghi quotidiani restano archivi, passaggi e fenomeni che nessuno controlla davvero; per questo anche una decisione pubblica finisce quasi sempre per diventare personale.',
      independence: 'Ogni storia è indipendente: non continua le altre e non serve conoscerne nessun’altra per giocare.'
    },
    {
      id: 'nuove-scintille',
      title: 'Nuove Scintille',
      label: 'COLLEZIONE 02',
      shortLabel: 'COLLEZIONE 02',
      status: 'coming-soon',
      storyCount: 16,
      description: 'Sedici nuove storie per ampliare la scelta senza cambiare le regole.',
      independence: 'Anche queste storie saranno complete e indipendenti.'
    }
  ];

  const primary = collections[0];
  const playableStories = primaryStoryIds.map(id => storiesById.get(id)).filter(Boolean).map((story, index) => ({
    ...story,
    collectionId: primary.id,
    collectionIndex: index
  }));

  if (playableStories.length !== primary.storyCount) {
    console.error('La Prima Scintilla non contiene le otto storie previste.', primaryStoryIds.filter(id => !storiesById.has(id)));
  }

  window.STORIA52_READY_COLLECTIONS = collections;
  window.STORIA52_READY_COLLECTION = null;
  window.STORIA52_PRIMARY_COLLECTION_ID = primary.id;
  window.STORIA52_FEATURES = Object.freeze({ customOpening: false, paidCollections: false });
  window.STORIA52_READY_STORIES = playableStories;

  // Non lasciare il catalogo bloccato nei dati usati dal gioco.
  window.STORIA52_READY_STORY_ROWS = playableStories.map(story => ({ ...story }));
})();
