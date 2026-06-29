'use strict';

(() => {
  if (!document.querySelector('link[href="guided-polish.css"]')) {
    const polish = document.createElement('link');
    polish.rel = 'stylesheet';
    polish.href = 'guided-polish.css';
    document.head.appendChild(polish);
  }

  const G = window.G52;
  const SUITS = {
    hearts: { symbol: '♥', name: 'Cuori', rule: 'Cambia un rapporto.', red: true },
    diamonds: { symbol: '♦', name: 'Quadri', rule: 'Rivela una verità, un’informazione o un indizio.', red: true },
    clubs: { symbol: '♣', name: 'Fiori', rule: 'Tenta un’azione.', red: false },
    spades: { symbol: '♠', name: 'Picche', rule: 'Introduce una conseguenza, un ostacolo o una perdita.', red: false }
  };
  const FIGURES = { A: 'Ribalta la situazione.', J: 'Introduce un nuovo oggetto.', Q: 'Introduce un nuovo personaggio.', K: 'Introduce un nuovo luogo.' };

  G.playMode.turn = session => {
    session.stage = 'play'; G.save(session);
    const player = session.currentPlayer;
    G.screen(`<div class="turn-header"><div><p class="eyebrow">GIRO ${session.round}</p><h1>Giocatore ${player + 1}</h1><p>È il tuo turno.</p></div><button type="button" class="objective-button" id="peekObjective">Il mio obiettivo</button></div>
      <div class="turn-core">
        <div><span>1</span><p><b>Scarta e ripesca</b><small>Se hai una sola carta, puoi tenerla per tentare il finale.</small></p></div>
        <div><span>2</span><p><b>Gioca 1 carta o 2 compatibili</b><small>Le figure si giocano sempre da sole.</small></p></div>
        <div><span>3</span><p><b>Racconta una scena breve</b><small>Usa almeno un elemento già introdotto nella storia.</small></p></div>
        <div><span>4</span><p><b>Pesca oppure resta con una carta in meno</b></p></div>
      </div>
      <details class="optional-help"><summary>Mi serve aiuto</summary><div class="optional-help-actions"><button type="button" id="helpCard">Interpreta una carta</button><button type="button" id="helpPair">Verifica due carte</button><button type="button" id="helpFinal">Voglio tentare il finale</button><button type="button" id="helpStory">Rivedi l’incipit</button></div></details>
      <button type="button" class="main-action" id="finishTurn">Turno finito · passa a Giocatore ${(player + 1) % session.count + 1}</button>`, 'Partita in corso');

    document.querySelector('#peekObjective').addEventListener('click', () => G.flow.objectiveModal(session, player, true));
    document.querySelector('#helpCard').addEventListener('click', cardInterpreter);
    document.querySelector('#helpPair').addEventListener('click', pairChecker);
    document.querySelector('#helpFinal').addEventListener('click', () => finalHelp(session, player));
    document.querySelector('#helpStory').addEventListener('click', () => G.modal('Il vostro incipit', `<div class="opening-result small"><p>${escapeHtml(G.flow.openingText(session))}</p></div>`));
    document.querySelector('#finishTurn').addEventListener('click', () => {
      const next = (session.currentPlayer + 1) % session.count;
      if (next === session.firstPlayer) session.round += 1;
      session.currentPlayer = next;
      G.save(session); G.playMode.turn(session);
    });
  };

  const rankOptions = () => ['A','2','3','4','5','6','7','8','9','10','J','Q','K'].map(v => `<option value="${v}">${v}</option>`).join('');
  const suitOptions = () => Object.entries(SUITS).map(([key, suit]) => `<option value="${key}">${suit.symbol} ${suit.name}</option>`).join('');

  const cardDescription = (rank, suitKey) => {
    const suit = SUITS[suitKey];
    const number = Number(rank);
    if (Number.isFinite(number)) {
      const favorable = number % 2 === 0;
      return `<div class="card-answer-rank${suit.red ? ' red' : ''}">${rank}${suit.symbol}</div><p><b>${suit.name}:</b> ${suit.rule}</p><p><b>${favorable ? 'Pari' : 'Dispari'}:</b> ${favorable ? 'avvicina il protagonista al suo obiettivo.' : 'allontana il protagonista dal suo obiettivo.'}</p><div class="answer-prompt">Racconta una scena che rispetti entrambe le indicazioni e riprenda qualcosa già successo.</div>`;
    }
    return `<div class="card-answer-rank${suit.red ? ' red' : ''}">${rank}${suit.symbol}</div><p><b>Figura:</b> ${FIGURES[rank]}</p><p><b>${suit.red ? 'Rossa' : 'Nera'}:</b> ${suit.red ? 'introduci l’elemento in modo favorevole.' : 'introduci l’elemento come ostacolo o complicazione.'}</p><div class="answer-prompt">Le figure non hanno parità e si giocano da sole.</div>`;
  };

  function cardInterpreter() {
    const modal = G.modal('Interpreta una carta', `<div class="card-form"><label><span>VALORE</span><select id="cardRank">${rankOptions()}</select></label><label><span>SEME</span><select id="cardSuit">${suitOptions()}</select></label></div><div class="card-answer" id="cardAnswer"></div>`);
    const draw = () => modal.querySelector('#cardAnswer').innerHTML = cardDescription(modal.querySelector('#cardRank').value, modal.querySelector('#cardSuit').value);
    modal.querySelector('#cardRank').addEventListener('change', draw);
    modal.querySelector('#cardSuit').addEventListener('change', draw);
    draw();
  }

  function pairChecker() {
    const modal = G.modal('Verifica due carte', `<div class="pair-form"><label><span>CARTA 1</span><div><select id="rankA">${rankOptions()}</select><select id="suitA">${suitOptions()}</select></div></label><label><span>CARTA 2</span><div><select id="rankB">${rankOptions()}</select><select id="suitB">${suitOptions()}</select></div></label></div><button type="button" class="main-action" id="checkPair">Controlla</button><div id="pairAnswer"></div>`);
    modal.querySelector('#checkPair').addEventListener('click', () => {
      const rankA = modal.querySelector('#rankA').value;
      const rankB = modal.querySelector('#rankB').value;
      const numberA = Number(rankA);
      const numberB = Number(rankB);
      const answer = modal.querySelector('#pairAnswer');
      if (!Number.isFinite(numberA) || !Number.isFinite(numberB)) {
        answer.innerHTML = '<div class="pair-result no"><b>Non compatibili.</b><p>Le figure si giocano sempre da sole.</p></div>';
        return;
      }
      const suitA = modal.querySelector('#suitA').value;
      const suitB = modal.querySelector('#suitB').value;
      const sameSuit = suitA === suitB && numberA % 2 !== numberB % 2;
      const sameParity = suitA !== suitB && numberA % 2 === numberB % 2;
      answer.innerHTML = sameSuit || sameParity ? `<div class="pair-result yes"><b>Compatibili.</b><p>${sameSuit ? 'Stesso seme e parità diversa.' : 'Stessa parità e seme diverso.'}</p></div>` : '<div class="pair-result no"><b>Non compatibili.</b><p>Servono stesso seme e parità diversa, oppure stessa parità e seme diverso.</p></div>';
      G.pulse(answer.firstElementChild);
    });
  }

  function finalHelp(session, player) {
    const modal = G.modal('Tentare il finale', `<ol class="plain-steps compact"><li><span>1</span><p><b>Devi avere 1 carta oppure 2 carte compatibili.</b></p></li><li><span>2</span><p><b>Gioca le carte e mostra il tuo obiettivo segreto.</b></p></li><li><span>3</span><p><b>Raggiungi il finale indicato dall’obiettivo.</b></p></li><li><span>4</span><p><b>Chiudi o trasforma il problema usando elementi già comparsi.</b></p></li></ol><div class="simple-note"><b>Opposizione</b><p>Un solo avversario può aggiungere un elemento con una carta compatibile. Non può annullare il finale.</p></div><button type="button" class="main-action" id="finalSucceeded">Il finale è riuscito</button>`);
    modal.querySelector('#finalSucceeded').addEventListener('click', () => { modal.remove(); G.playMode.victory(session, player); });
  }

  G.playMode.victory = (session, player) => {
    session.stage = 'finished'; session.winner = player; G.save(session);
    G.screen(`<div class="victory"><span>♥ ♦ ♣ ♠</span><p class="eyebrow">STORIA CONCLUSA</p><h1>Vince Giocatore ${player + 1}</h1><p>Ha concluso la storia raggiungendo il proprio obiettivo segreto.</p><button type="button" class="main-action" id="newGame">Nuova partita</button></div>`, 'Storia conclusa');
    document.querySelector('#newGame').addEventListener('click', () => { G.clear(); G.flow.setup(); });
  };

  G.init();
})();
