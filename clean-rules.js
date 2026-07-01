'use strict';

(() => {
  const S = window.S52;

  S.cardRulesMarkup = () => `<div class="suit-rules"><p><b class="red">♥ Cuori pari</b><span>Un rapporto migliora o aiuta.</span></p><p><b class="red">♥ Cuori dispari</b><span>Un rapporto peggiora o complica.</span></p><p><b class="red">♦ Quadri pari</b><span>Una scoperta utile.</span></p><p><b class="red">♦ Quadri dispari</b><span>Una scoperta pericolosa o negativa.</span></p><p><b>♣ Fiori</b><span>Qualcuno compie un’azione.</span></p><p><b>♠ Picche</b><span>Arriva un ostacolo, una perdita o una conseguenza.</span></p></div><p class="rule-note"><b>Pari e dispari valgono solo per Cuori e Quadri.</b></p><div class="figure-grid"><p><b>J</b><span>Nuovo oggetto</span></p><p><b>Q</b><span>Nuovo personaggio</span></p><p><b>K</b><span>Nuovo luogo</span></p><p><b>A</b><span>Ribalta la situazione</span></p></div><p class="rule-note"><b>Le figure non hanno parità e si giocano da sole.</b><br>Rosse: entrano a favore del protagonista. Nere: entrano come complicazione.</p>`;

  S.turnGuideMarkup = () => `<section class="game-card"><h3>Come continua ogni turno</h3><div class="turn-grid"><article class="turn-step"><span>1</span><div><b>Scarta e pesca</b><p>Scarta una carta e pescane una. Con una sola carta puoi riprendere la stessa oppure cambiarla.</p></div></article><article class="turn-step"><span>2</span><div><b>Gioca una carta</b><p>Applica il significato del seme e del valore.</p></div></article><article class="turn-step"><span>3</span><div><b>Continua la storia</b><p>Racconta un solo fatto nuovo usando almeno un elemento già comparso.</p></div></article><article class="turn-step"><span>4</span><div><b>Decidi se pescare</b><p>Pesca una carta oppure resta con una carta in meno.</p></div></article></div></section>`;

  S.finalRulesMarkup = () => `<div class="numbered"><p><i>1</i><span>Dopo il ricambio iniziale devi avere una sola carta.</span></p><p><i>2</i><span>Gioca l’ultima carta e mostra il tuo obiettivo segreto.</span></p><p><i>3</i><span>Raggiungi quel finale usando elementi già comparsi.</span></p><p><i>4</i><span>Chiudi o trasforma il problema iniziale.</span></p></div>`;

  S.rulesMarkup = () => `<section class="surface"><div class="screen-heading"><p class="eyebrow">REGOLAMENTO</p><h2>STORIA 52</h2><p>Una guida unica, uguale a quella disponibile durante la partita.</p></div><div class="rulebook"><details open><summary>1. Preparazione</summary><div class="body numbered"><p><i>1</i><span>Scegliete o inventate l’incipit.</span></p><p><i>2</i><span>Togliete i jolly e distribuite 5 carte a testa.</span></p><p><i>3</i><span>Ogni giocatore legge il proprio obiettivo segreto.</span></p></div></details><details><summary>2. Significato delle carte</summary><div class="body">${S.cardRulesMarkup()}</div></details><details><summary>3. Il turno</summary><div class="body">${S.turnGuideMarkup()}</div></details><details><summary>4. Il finale</summary><div class="body">${S.finalRulesMarkup()}</div></details></div></section>`;

  S.renderRulesPage = () => { S.rules.innerHTML = S.rulesMarkup(); };
  S.openRulesModal = () => S.modal('Regolamento', S.rulesMarkup(), { wide: true });

  S.initArchive = () => {
    renderBrowser();
    document.querySelector('#randomCard').addEventListener('click', () => {
      const card = randomCard();
      browserState.suit = card.suit;
      browserState.number = card.number;
      renderBrowser();
    });
    document.querySelector('#copyCard').addEventListener('click', () => {
      const text = DATA[browserState.type][browserState.suit][browserState.number - 2];
      S.copy(text, 'Carta copiata');
    });
  };
})();
