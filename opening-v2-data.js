'use strict';
(() => {
  const styles = ['brand-v4.css', 'opening-v4-a.css', 'opening-v4-b.css'];
  styles.forEach(href => {
    if (document.querySelector('link[href="' + href + '"]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  });
})();
