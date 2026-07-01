'use strict';
(() => {
  const patch = root => {
    if (!root) return;
    const firstStep = root.querySelector('.rules-intro .rules-step:first-child p');
    if (firstStep) firstStep.innerHTML = '<b>Create l’incipit</b> dalle 4 carte oppure scegliete una delle 52 storie pronte.';
    const preparation = root.querySelector('.rules-accordion details:first-child .numbered-list p:nth-child(2) .numbered-copy')
      || root.querySelector('.rules-accordion details:first-child .numbered-list p:nth-child(2)');
    if (preparation) preparation.innerHTML = 'Scegliete il punto di partenza: inventate l’incipit con <b>Protagonista, Situazione, Obiettivo e Problema</b>, oppure usate una delle <b>52 storie pronte</b>.';
  };

  patch(document.querySelector('#clarityRulesTemplate')?.content);
  patch(document.querySelector('#rules'));
})();
