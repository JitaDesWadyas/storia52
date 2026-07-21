'use strict';
(() => {
  const files = [
    'archive-v20-stories-realistico.js',
    'archive-v20-stories-mistero.js',
    'archive-v20-stories-fantascienza.js',
    'archive-v20-stories-fantasy.js',
    'archive-v20-stories-horror.js',
    'archive-v20-stories-amore.js',
    'archive-v20-stories-avventura.js',
    'archive-v20-stories-commedia.js'
  ];
  document.write(files.map(file => `<script src="${file}?v=20"><\/script>`).join(''));
})();
