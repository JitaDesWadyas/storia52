'use strict';
(() => {
  const G = window.G52;
  if (!G) return;
  G.cardTypesMarkup = (options = {}) => `<section class="card-types-guide${options.compact ? ' compact' : ''}"><div class="card-types-head"><span>PRIMA DI GIOCARE</span><h3>Non confondere questi tre gruppi.</h3></div><div class="card-types-grid"><article><span>1</span><div><b>Punto di partenza comune</b><p>Potete inventarlo usando 4 carte — protagonista, situazione, obiettivo e problema — oppure scegliere una delle 52 storie pronte.</p></div></article><article><span>2</span><div><b>5 carte in mano</b><p>Sono le carte fisiche che giochi durante i turni.</p></div></article><article><span>3</span><div><b>1 obiettivo segreto</b><p>È privato, resta sul telefono e indica il finale da raggiungere.</p></div></article></div></section>`;
  G.cardGuideMarkup = (options = {}) => {
    const { compact = false, open = false, title = 'Come leggere una carta giocata' } = options;
    return `<details class="card-rules-guide card-guide-simple${compact ? ' compact' : ''}"${open ? ' open' : ''}><summary><span>CARTE DEL TURNO</span><b>${title}</b><i aria-hidden="true">⌄</i></summary><div class="card-rules-guide-body"><div class="simple-suit-rules"><p><b class="red">♥ Cuori pari</b><span>Un rapporto migliora o aiuta.</span></p><p><b class="red">♥ Cuori dispari</b><span>Un rapporto peggiora o complica.</span></p><p><b class="red">♦ Quadri pari</b><span>Scoperta utile.</span></p><p><b class="red">♦ Quadri dispari</b><span>Scoperta pericolosa o negativa.</span></p><p><b>♣ Fiori</b><span>Qualcuno compie un’azione.</span></p><p><b>♠ Picche</b><span>Arriva un ostacolo, una perdita o una conseguenza.</span></p></div><p class="parity-warning"><b>Pari e dispari valgono solo per Cuori e Quadri.</b></p><div class="card-rule-figures"><p><b>J</b><span>Nuovo oggetto</span></p><p><b>Q</b><span>Nuovo personaggio</span></p><p><b>K</b><span>Nuovo luogo</span></p><p><b>A</b><span>Ribalta la situazione</span></p></div><p class="card-rule-note">Le figure non hanno parità. Rosse: entrano a favore del protagonista. Nere: entrano come complicazione.</p></div></details>`;
  };
  const previous = G.flow.story;
  G.flow.story = session => {
    previous(session);
    G.game.querySelectorAll('.story-connection,.inline-explainer,.story-draft').forEach(node => node.remove());
    G.game.querySelector('.screen-heading p:last-child')?.remove();
  };
})();
