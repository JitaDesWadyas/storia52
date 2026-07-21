'use strict';
(() => {
  const categories = {
    realistico: { label: 'Realistico', symbol: '●', description: 'Lavoro, famiglia, denaro e decisioni credibili con conseguenze concrete.' },
    mistero: { label: 'Mistero', symbol: '♦', description: 'Indizi, sparizioni e verità nascoste da ricostruire insieme.' },
    fantascienza: { label: 'Fantascienza', symbol: '✦', description: 'Tecnologia e futuri in cui ogni scelta cambia le regole.' },
    fantasy: { label: 'Fantasy', symbol: '♜', description: 'Valmora, magia e patti difficili da spezzare.' },
    horror: { label: 'Horror', symbol: '☾', description: 'Luoghi e presenze inquietanti, con una via d’uscita da conquistare.' },
    amore: { label: 'Amore e relazioni', symbol: '♥', description: 'Legami, ex, promesse e sentimenti messi davanti a una scelta reale.' },
    avventura: { label: 'Avventura', symbol: '▲', description: 'Viaggi, spedizioni e missioni in cui tempo e territorio contano.' },
    commedia: { label: 'Commedia e assurdo', symbol: '♣', description: 'Situazioni ingestibili, equivoci e piani che possono diventare geniali.' }
  };
  const rows = window.STORIA52_READY_STORY_ROWS || [];
  const rank = { realistico: 0, mistero: 1, fantascienza: 2, fantasy: 3, horror: 4, amore: 5, avventura: 6, commedia: 7 };
  const groups = Object.fromEntries(Object.keys(categories).map(key => [key, rows.filter(story => story.category === key)]));
  const stories = [];
  for (let index = 0; stories.length < rows.length; index += 1) {
    for (const key of Object.keys(categories).sort((a, b) => rank[a] - rank[b])) {
      if (groups[key][index]) stories.push(groups[key][index]);
    }
  }
  const ids = new Set(stories.map(story => story.id));
  const invalidCategory = stories.find(story => !categories[story.category]);
  const invalidDistribution = Object.keys(categories).find(key => groups[key].length !== 3);
  if (stories.length !== 24 || ids.size !== 24 || invalidCategory || invalidDistribution) {
    console.error('Archivio v20 non valido: servono 24 storie uniche, 3 per categoria.');
  }
  window.STORIA52_READY_CATEGORIES = categories;
  window.STORIA52_READY_STORIES = stories;
})();
