'use strict';
(() => {
  const files = [
    'archive-v20-objectives-01.js',
    'archive-v20-objectives-02.js',
    'archive-v20-objectives-03-04.js',
    'archive-v20-objectives-05-06.js',
    'archive-v20-objectives-07-08.js',
    'archive-v20-session-guard.js'
  ];
  document.write(files.map(file => `<script src="${file}?v=20"><\/script>`).join(''));
})();
