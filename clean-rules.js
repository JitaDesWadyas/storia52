'use strict';

(() => {
  const S = window.S52;

  const guideMarkup = ({ eyebrow, title, intro, steps, className = '' }) => `<section class="play-guide ${className}"><header class="play-guide-heading"><p class="eyebrow">${eyebrow}</p><h3>${title}</h3><p>${intro}</p></header><div class="play-guide-steps">${steps.map((step, index) => `<article class="play-guide-step"><span>${index + 1}</span><div><b>${step.title}</b><p>${step.text}</p></div></article>`).join('')}</div></section>`;

  S.cardMeaningMarkup = () => `<div class="card-meaning-board"><section class="meaning-block"><div class="meaning-heading"><span>CARTE NUMERICHE · DA 2 A 10</span><h4>Leggi seme e parità.</h4><p>Cuori e Quadri sono positivi con un numero pari e negativi con un numero dispari. Fiori e Picche non cambiano effetto.</p></div><div class="plain-suit-grid"><article><span class="red">♥</span><div><b>Relazione</b><p><strong>Pari:</strong> rafforza o avvicina. <strong>Dispari:</strong> allontana o crea tensione.</p><em>♥6: due personaggi tornano a fidarsi. ♥5: nasce un conflitto tra loro.</em></div></article><article><span class="red">♦</span><div><b>Scoperta</b><p><strong>Pari:</strong> emerge qualcosa di utile. <strong>Dispari:</strong> emerge qualcosa che complica.</p><em>♦8: viene trovata una prova utile. ♦3: viene scoperto un problema nascosto.</em></div></article><article><span>♣</span><div><b>Azione</b><p>Un personaggio prova a fare qualcosa di concreto.</p><em>Il protagonista tenta di aprire la porta bloccata.</em></div></article><article><span>♠</span><div><b>Ostacolo</b><p>Compare un problema che rende tutto più difficile.</p><em>La strada viene chiusa prima della fuga.</em></div></article></div></section><section class="meaning-block special-meaning-block"><div class="meaning-heading"><span>J · Q · K · A</span><h4>Guarda valore e colore. Ignora il seme.</h4><p>Rosso significa positivo, nero significa negativo.</p></div><div class="special-rank-grid"><article><small>NUOVO ELEMENTO</small><b>J</b><span>Oggetto</span></article><article><small>NUOVO ELEMENTO</small><b>Q</b><span>Personaggio</span></article><article><small>NUOVO ELEMENTO</small><b>K</b><span>Luogo</span></article><article><small>SVOLTA</small><b>A</b><span>Colpo di scena</span></article></div><div class="special-color-rule"><section><span class="red">ROSSA</span><div><b>Positiva</b><p>Aiuta i personaggi o migliora la situazione.</p></div></section><section><span>NERA</span><div><b>Negativa</b><p>Ostacola i personaggi o peggiora la situazione.</p></div></section></div><p class="special-example"><strong>Esempio:</strong> un J♥ aggiunge un oggetto positivo. Il simbolo ♥ non crea anche una relazione.</p></section></div>`;

  S.cardRulesMarkup = () => `<div class="card-rules-compact">${S.cardMeaningMarkup()}</div>`;

  S.preparationGuideMarkup = () => guideMarkup({
    eyebrow: 'PRIMA DI COMINCIARE',
    title: 'Preparazione',
    intro: 'Preparate la storia, gli obiettivi segreti e il tipo di mazzo scelto.',
    className: 'play-guide-preparation',
    steps: [
      { title: 'Scegliete la storia', text: 'Selezionate una collezione e uno degli incipit disponibili.' },
      { title: 'Preparate le carte', text: 'Con il mazzo reale usate 52 carte francesi e togliete i jolly. Con le carte virtuali ogni giocatore riceve la mano sul proprio telefono.' },
      { title: 'Leggete gli obiettivi', text: 'Ogni persona legge soltanto il proprio obiettivo segreto, senza mostrarlo agli altri.' },
      { title: 'Decidete chi inizia', text: 'Scegliete il primo giocatore. Poi i turni continuano sempre nello stesso ordine.' }
    ]
  });

  S.turnGuideMarkup = () => guideMarkup({
    eyebrow: 'UN TURNO ALLA VOLTA',
    title: 'Il turno',
    intro: 'Una persona completa questi passaggi. Le carte virtuali li mostrano uno alla volta e impediscono di ripeterli per errore.',
    className: 'play-guide-turn',
    steps: [
      { title: 'Cambia una carta', text: 'Con 2 o più carte in mano scartane 1 e pescane subito 1. Con una sola carta puoi cambiarla oppure tenerla.' },
      { title: 'Gioca una carta', text: 'Scegli una sola carta e racconta la scena seguendo seme, parità o colore.' },
      { title: 'Aggiungi una scena', text: 'Fai succedere un solo passaggio chiaro e coerente con ciò che è già apparso.' },
      { title: 'Pesca oppure termina', text: 'Dopo la scena puoi pescare 1 carta oppure terminare il turno senza pescare. Con la mano vuota puoi pescare oppure collegarti al finale.' }
    ]
  });

  S.finalRulesMarkup = () => guideMarkup({
    eyebrow: 'ULTIMA CARTA',
    title: 'Come si chiude la storia',
    intro: 'Il finale nasce direttamente dalla scena della tua ultima carta, senza aggiungere una seconda scena separata.',
    className: 'play-guide-final',
    steps: [
      { title: 'Gioca l’ultima carta', text: 'Giocala normalmente e rispetta il suo significato.' },
      { title: 'Collegati al finale', text: 'Continua quella stessa scena fino alla conclusione indicata dal tuo obiettivo segreto.' },
      { title: 'Rivela il tuo obiettivo', text: 'Mostralo agli altri. Il finale deve usare elementi già comparsi e restare coerente.' },
      { title: 'Chiudete oppure continuate', text: 'Se il finale regge, hai vinto. Altrimenti pesca una carta e la partita continua.' }
    ]
  });

  S.rulesMarkup = () => `<div class="rules-menu"><p class="rules-menu-intro">Dalla preparazione al finale: tutte le regole per giocare con un mazzo reale o con le carte virtuali.</p><div class="rulebook"><details><summary>1. Preparazione</summary><div class="body">${S.preparationGuideMarkup()}</div></details><details><summary>2. Significato delle carte</summary><div class="body">${S.cardRulesMarkup()}</div></details><details><summary>3. Il turno</summary><div class="body">${S.turnGuideMarkup()}</div></details><details><summary>4. Come si chiude la storia</summary><div class="body">${S.finalRulesMarkup()}</div></details></div></div>`;
  S.openRulesModal = () => S.modal('Regole di E POI?', S.rulesMarkup(), { wide: true, className: 'rules-modal' });
})();
