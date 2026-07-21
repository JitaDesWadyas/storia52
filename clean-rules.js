'use strict';

(() => {
  const S = window.S52;

  const polarityCard = ({ symbol, title, description, positiveTitle, positiveText, positiveExample, negativeTitle, negativeText, negativeExample }) => `<article class="polarity-card"><header><span class="polarity-suit red">${symbol}</span><div><h5>${title}</h5><p>${description}</p></div></header><div class="polarity-options"><section><span class="polarity-key">PARI</span><div><b>${positiveTitle}</b><p>${positiveText}</p><em>${positiveExample}</em></div></section><section><span class="polarity-key">DISPARI</span><div><b>${negativeTitle}</b><p>${negativeText}</p><em>${negativeExample}</em></div></section></div></article>`;

  const guideMarkup = ({ eyebrow, title, intro, steps, className = '' }) => `<section class="play-guide ${className}"><header class="play-guide-heading"><p class="eyebrow">${eyebrow}</p><h3>${title}</h3><p>${intro}</p></header><div class="play-guide-steps">${steps.map((step, index) => `<article class="play-guide-step"><span>${index + 1}</span><div><b>${step.title}</b><p>${step.text}</p></div></article>`).join('')}</div></section>`;

  S.cardMeaningMarkup = () => `<div class="card-meaning-board"><section class="meaning-block"><div class="meaning-heading"><span>CARTE NUMERICHE</span><h4>Da 2 a 10: leggi il seme.</h4><p>Cuori e Quadri sono rossi. Per questi due semi conta anche se il numero è pari o dispari.</p></div><div class="polarity-grid">${polarityCard({ symbol: '♥', title: 'Relazione', description: 'Cambia un rapporto tra personaggi.', positiveTitle: 'Relazione positiva', positiveText: 'Il legame aiuta, avvicina o protegge.', positiveExample: 'La guardia riconosce il protagonista e lo lascia passare.', negativeTitle: 'Relazione negativa', negativeText: 'Il legame crea distanza, tensione o tradimento.', negativeExample: 'L’amico rivela il nascondiglio del protagonista.' })}${polarityCard({ symbol: '♦', title: 'Scoperta', description: 'Fa emergere un’informazione o un indizio.', positiveTitle: 'Scoperta positiva', positiveText: 'L’informazione aiuta o apre una possibilità.', positiveExample: 'Il protagonista trova la chiave della cassaforte.', negativeTitle: 'Scoperta negativa', negativeText: 'L’informazione complica la situazione.', negativeExample: 'Il protagonista scopre che la macchina è guasta.' })}</div><div class="plain-suit-grid"><article><span>♣</span><div><b>Azione</b><p>Un personaggio compie un’azione concreta.</p><em>Il protagonista prova a far partire la macchina.</em></div></article><article><span>♠</span><div><b>Ostacolo</b><p>Compare un problema che rende tutto più difficile.</p><em>La strada viene bloccata prima della fuga.</em></div></article></div></section><section class="meaning-block special-meaning-block"><div class="meaning-heading"><span>NUOVI ELEMENTI · J · Q · K · A</span><h4>Guarda il valore e il colore. Ignora completamente il seme.</h4><p>Queste carte aggiungono un nuovo elemento alla storia. Cuori, Quadri, Fiori e Picche non producono nessun secondo effetto.</p></div><div class="special-rank-grid"><article><small>NUOVO ELEMENTO</small><b>J</b><span>Oggetto</span></article><article><small>NUOVO ELEMENTO</small><b>Q</b><span>Personaggio</span></article><article><small>NUOVO ELEMENTO</small><b>K</b><span>Luogo</span></article><article><small>SVOLTA</small><b>A</b><span>Colpo di scena</span></article></div><div class="special-color-rule"><section><span class="red">ROSSA</span><div><b>Entra a favore</b><p>Il nuovo elemento aiuta, oppure il colpo di scena migliora la situazione.</p></div></section><section><span>NERA</span><div><b>Entra come problema</b><p>Il nuovo elemento ostacola, oppure il colpo di scena peggiora la situazione.</p></div></section></div><p class="special-example"><strong>Esempio:</strong> un J♥ aggiunge un nuovo oggetto favorevole. Non crea anche una relazione: il simbolo ♥ va ignorato.</p></section></div>`;

  S.cardRulesMarkup = () => `<div class="card-rules-compact">${S.cardMeaningMarkup()}</div>`;

  S.turnGuideMarkup = () => guideMarkup({
    eyebrow: 'UN TURNO ALLA VOLTA',
    title: 'Il turno',
    intro: 'Una persona completa questi quattro passaggi. Poi continua il giocatore successivo.',
    className: 'play-guide-turn',
    steps: [
      { title: 'Cambia una carta', text: 'Con 2 o più carte in mano devi scartarne 1 e pescarne subito 1. Con una sola carta puoi cambiarla oppure tenerla.' },
      { title: 'Gioca una carta', text: 'Scegli una sola carta e racconta la scena seguendo il suo significato.' },
      { title: 'Aggiungi una scena', text: 'Fai succedere un solo passaggio chiaro e coerente con tutto ciò che è già successo.' },
      { title: 'Pesca oppure passa', text: 'Dopo la scena puoi pescare 1 carta. Poi il turno finisce e continua la persona successiva.' }
    ]
  });

  S.finalRulesMarkup = () => guideMarkup({
    eyebrow: 'ULTIMA CARTA',
    title: 'Come si chiude la storia',
    intro: 'Il finale non è una seconda scena separata: nasce direttamente dalla scena della tua ultima carta.',
    className: 'play-guide-final',
    steps: [
      { title: 'Gioca l’ultima carta', text: 'La giochi normalmente e rispetti il suo significato, come in qualsiasi altro turno.' },
      { title: 'Collegati direttamente al finale', text: 'Mentre racconti quella scena, portala nello stesso racconto fino al finale del tuo obiettivo segreto.' },
      { title: 'Rivela il tuo obiettivo', text: 'Alla fine mostralo agli altri. Il racconto deve usare elementi già comparsi e restare coerente.' },
      { title: 'Chiudete oppure continuate', text: 'Se il finale regge, hai vinto. Se non regge, la partita continua.' }
    ]
  });

  S.rulesMarkup = () => `<div class="rules-menu"><p class="rules-menu-intro">Dalla preparazione al finale: tutte le regole per giocare con un normale mazzo di carte.</p><div class="rulebook"><details><summary>1. Preparazione</summary><div class="body numbered"><p><i>1</i><span>Scegliete una storia pronta oppure inventate l’incipit con le carte.</span></p><p><i>2</i><span>Togliete i jolly, mescolate e date 5 carte a testa.</span></p><p><i>3</i><span>Ogni giocatore legge il proprio obiettivo segreto senza mostrarlo.</span></p></div></details><details><summary>2. Significato delle carte</summary><div class="body">${S.cardRulesMarkup()}</div></details><details><summary>3. Il turno</summary><div class="body">${S.turnGuideMarkup()}</div></details><details><summary>4. Come si chiude la storia</summary><div class="body">${S.finalRulesMarkup()}</div></details></div></div>`;
  S.openRulesModal = () => S.modal('Regole di E POI?', S.rulesMarkup(), { wide: true, className: 'rules-modal' });
})();
