'use strict';
(async () => {
  try {
    const encoded = String(window.STORIA52_BANKS_GZIP || '');
    if (!encoded || typeof DecompressionStream !== 'function') {
      throw new Error('DecompressionStream non disponibile');
    }
    const binary = atob(encoded);
    const bytes = Uint8Array.from(binary, character => character.charCodeAt(0));
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    const text = await new Response(stream).text();
    const banks = JSON.parse(text);

    banks.forEach(bank => {
      if (bank.id === 'school_project') {
        bank.identity = bank.identity.map(phrase => phrase
          .replace('la persona che le è rimasta accanto', 'la persona che è rimasta al suo fianco')
          .replace('Un ragazzo al primo concorso vuole dimostrare di meritare il posto in squadra e non vuole vincere sacrificando la persona che è rimasta al suo fianco.',
            'Un ragazzo al primo concorso vuole dimostrare di meritare il posto in squadra senza sacrificare l’amico che gli è rimasto accanto.')
          .replace('Il rappresentante della classe deve difendere un gruppo che non si fida più di lui e non vuole vincere sacrificando la persona che è rimasta al suo fianco.',
            'Il rappresentante della classe deve difendere il gruppo senza sacrificare l’unico compagno che continua a fidarsi di lui.'));
      }
      if (bank.id === 'wedding_secret') {
        bank.opening = bank.opening.map(phrase => phrase.replace(
          'Deve parlare con lo sposo senza fermare tutto davanti agli invitati e senza trasformare il matrimonio in uno spettacolo.',
          'Deve parlare con lo sposo in privato prima che il matrimonio diventi uno spettacolo.'
        ));
      }
      if (bank.id === 'theater_script') {
        bank.opening = bank.opening.map(phrase => phrase.replace(
          'Deve dimostrare chi ha sabotato il file senza dividere la compagnia e senza nascondere ciò che è successo.',
          'Deve dire alla compagnia che cosa è successo e dimostrare chi ha sabotato il file.'
        ));
      }
    });

    const phraseCount = banks.reduce((total, bank) =>
      total + bank.identity.length + bank.place.length + bank.opening.length + bank.stakes.length, 0);

    if (banks.length !== 26 || phraseCount < 1000) {
      throw new Error(`Archivio incompleto: ${banks.length} scenari, ${phraseCount} frasi`);
    }

    window.STORIA52_COHERENT_BANKS = banks;
    const script = document.createElement('script');
    script.src = 'opening-v4.js';
    script.async = false;
    document.body.appendChild(script);
  } catch (error) {
    console.error('Impossibile caricare le frasi dell’incipit.', error);
    const toast = document.querySelector('#toast');
    if (toast) toast.textContent = 'Errore nel caricamento dei suggerimenti dell’incipit.';
  }
})();
