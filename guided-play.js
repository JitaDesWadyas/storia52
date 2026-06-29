'use strict';

(() => {
  for (const href of ['guided-polish.css', 'guided-clarity.css', 'unified-app.css']) {
    if (document.querySelector(`link[href="${href}"]`)) continue;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }

  const G = window.G52;
  const SUITS = {
    hearts: { symbol: '♥', name: 'Cuori', rule: 'Cambia un rapporto.', red: true },
    diamonds: { symbol: '♦', name: 'Quadri', rule: 'Rivela una verità, un’informazione o un indizio.', red: true },
    clubs: { symbol: '♣', name: 'Fiori', rule: 'Tenta un’azione.', red: false },
    spades: { symbol: '♠', name: 'Picche', rule: 'Introduce una conseguenza, un ostacolo o una perdita.', red: false }
  };
  const FIGURES = { A: 'Ribalta la situazione.', J: 'Introduce un nuovo oggetto.', Q: 'Introduce un nuovo personaggio.', K: 'Introduce un nuovo luogo.' };

  const originalAssistantSetup = G.flow.setup;
  G.flow.setup = () => {
    originalAssistantSetup();
    G.topbar('Partita con assistente');
    const heading = G.game.querySelector('.screen-heading');
    if (!heading) return;
    heading.querySelector('.eyebrow').textContent = 'PARTITA CON ASSISTENTE';
    heading.querySelector('h2').textContent = 'Prima capite quali carte userete.';
    heading.querySelector('p:last-child').textContent = 'L’app costruirà la storia, assegnerà gli obiettivi e accompagnerà ogni turno.';
    heading.insertAdjacentHTML('afterend', `${G.cardTypesMarkup()}${G.cardGuideMarkup({ open: true, title: 'Il seme dice cosa accade; il valore dice come va' })}`);
    const start = G.game.querySelector('#createGuided');
    if (start) start.textContent = 'Genera le quattro carte della storia';
  };

  G.playMode.turn = session => {
    session.stage = 'play';
    G.save(session);
    const player = session.currentPlayer;
    const firstTurn = session.round === 1 && player === session.firstPlayer;
    G.screen(`${G.progressMarkup('play')}<div class="turn-header"><div><p class="eyebrow">FASE 4 · GIRO ${session.round}</p><h1>Giocatore ${player + 1}</h1><p>${firstTurn ? 'Continua la scena iniziale.' : 'È il tuo turno.'}</p></div><button type="button" class="objective-button" id="peekObjective">Il mio obiettivo segreto</button></div>
      <div class="play-workspace">
        <aside class="play-story-side">${G.flow.openingPanel(session, { open: firstTurn, compact: true, intro: firstTurn ? 'Parti dall’ultima frase. Non creare un secondo incipit.' : 'Usalo per mantenere la storia collegata al punto di partenza.' })}</aside>
        <section class="turn-panel">
          ${firstTurn ? '<div class="turn-continuity"><span>PRIMO TURNO</span><b>La storia è già iniziata.</b><p>Guarda l’ultima frase dell’incipit, gioca la carta e racconta che cosa accade subito dopo.</p></div>' : ''}
          <div class="turn-core">
            <div><span>1</span><p><b>Scarta e ripesca</b><small>Scarta sempre 1 carta. Se ne avevi una sola, puoi riprendere quella stessa carta oppure pescarne una diversa.</small></p></div>
            <div><span>2</span><p><b>Leggi e gioca la carta</b><small>Il seme indica che cosa succede; il valore indica se aiuta o ostacola. Puoi giocare 1 carta o 2 compatibili.</small></p></div>
            <div class="scene-step"><span>3</span><p><b>Racconta il fatto successivo</b><small>Usa almeno un elemento già introdotto e applica tutte le indicazioni delle carte giocate.</small></p></div>
            <div><span>4</span><p><b>Pesca oppure resta con una carta in meno</b></p></div>
          </div>
          ${G.cardGuideMarkup({ compact: true, open: firstTurn, title: 'Quale scena impone la carta che hai giocato?' })}
          <details class="scene-example"><summary>Come trasformo la carta in una scena?</summary><div><p><b>Formula semplice:</b> riprendi un elemento già presente → applica il seme → applica il valore → mostra una conseguenza.</p><p><b>Esempio:</b> l’incipit termina con una porta bloccata. Giochi un <b>Fiori pari</b>: il protagonista tenta un’azione che lo avvicina all’obiettivo, quindi forza la serratura e trova un indizio utile.</p><p>Racconta un solo evento. Il giocatore dopo continuerà da quella conseguenza.</p></div></details>
          <details class="optional-help"><summary>Strumenti del turno</summary><div class="optional-help-actions"><button type="button" id="helpCard">Interpreta una carta</button><button type="button" id="helpPair">Verifica due carte</button><button type="button" id="helpFinal">Voglio tentare il finale</button></div></details>
          <button type="button" class="main-action" id="finishTurn">Turno finito · passa a Giocatore ${(player + 1) % session.count + 1}</button>
        </section>
      </div>`, 'Partita con assistente');

    G.flow.bindOpeningPanel(session);
    document.querySelector('#peekObjective').addEventListener('click', () => G.flow.objectiveModal(session, player, true));
    document.querySelector('#helpCard').addEventListener('click', cardInterpreter);
    document.querySelector('#helpPair').addEventListener('click', pairChecker);
    document.querySelector('#helpFinal').addEventListener('click', () => finalHelp(session, player));
    document.querySelector('#finishTurn').addEventListener('click', () => {
      const next = (session.currentPlayer + 1) % session.count;
      if (next === session.firstPlayer) session.round += 1;
      session.currentPlayer = next;
      G.save(session);
      G.playMode.turn(session);
    });
  };

  const rankOptions = () => ['A','2','3','4','5','6','7','8','9','10','J','Q','K'].map(v => `<option value="${v}">${v}</option>`).join('');
  const suitOptions = () => Object.entries(SUITS).map(([key, suit]) => `<option value="${key}">${suit.symbol} ${suit.name}</option>`).join('');

  const cardDescription = (rank, suitKey) => {
    const suit = SUITS[suitKey];
    const number = Number(rank);
    if (Number.isFinite(number)) {
      const favorable = number % 2 === 0;
      return `<div class="card-answer-rank${suit.red ? ' red' : ''}">${rank}${suit.symbol}</div><p><b>${suit.name}:</b> ${suit.rule}</p><p><b>${favorable ? 'Pari' : 'Dispari'}:</b> ${favorable ? 'avvicina il protagonista al suo obiettivo.' : 'allontana il protagonista dal suo obiettivo.'}</p><div class="answer-prompt">Riprendi qualcosa già presente, applica entrambe le indicazioni e racconta una sola conseguenza.</div>`;
    }
    return `<div class="card-answer-rank${suit.red ? ' red' : ''}">${rank}${suit.symbol}</div><p><b>Carta speciale:</b> ${FIGURES[rank]}</p><p><b>${suit.red ? 'Rossa' : 'Nera'}:</b> ${suit.red ? 'introduci l’elemento in modo favorevole.' : 'introduci l’elemento come ostacolo o complicazione.'}</p><div class="answer-prompt">J, Q, K e A non hanno parità e si giocano da soli.</div>`;
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
        answer.innerHTML = '<div class="pair-result no"><b>Non compatibili.</b><p>J, Q, K e A si giocano sempre da soli.</p></div>';
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
    const modal = G.modal('Tentare il finale', `<div class="simple-note"><b>Il ricambio iniziale resta obbligatorio.</b><p>Se hai una sola carta, la scarti e scegli se riprendere proprio quella oppure pescarne una diversa. Non salti questo passaggio.</p></div><ol class="plain-steps compact"><li><span>1</span><p><b>Dopo il ricambio devi avere 1 carta oppure 2 carte compatibili.</b></p></li><li><span>2</span><p><b>Gioca le carte e mostra il tuo obiettivo segreto.</b></p></li><li><span>3</span><p><b>Raggiungi il finale indicato dall’obiettivo.</b></p></li><li><span>4</span><p><b>Chiudi o trasforma il problema usando elementi già comparsi.</b></p></li></ol><div class="simple-note"><b>Il finale deve appartenere a questa storia.</b><p>Riprendi l’incipit e almeno un elemento introdotto nei turni. Non risolvere tutto con qualcosa inventato soltanto adesso.</p></div><div class="simple-note"><b>Opposizione</b><p>Un solo avversario può aggiungere un elemento con una carta compatibile. Non può annullare il finale.</p></div><button type="button" class="main-action" id="finalSucceeded">Il finale è riuscito</button>`);
    modal.querySelector('#finalSucceeded').addEventListener('click', () => { modal.remove(); G.playMode.victory(session, player); });
  }

  G.playMode.victory = (session, player) => {
    session.stage = 'finished';
    session.winner = player;
    G.save(session);
    G.screen(`${G.progressMarkup('play')}<div class="victory"><span>♥ ♦ ♣ ♠</span><p class="eyebrow">STORIA CONCLUSA</p><h1>Vince Giocatore ${player + 1}</h1><p>Ha concluso la storia raggiungendo il proprio obiettivo segreto.</p></div>${G.flow.openingPanel(session, { compact: true, intro: 'Questo era il punto da cui è partita la vostra storia.' })}<button type="button" class="main-action" id="newGame">Nuova partita con assistente</button>`, 'Storia conclusa');
    G.flow.bindOpeningPanel(session);
    document.querySelector('#newGame').addEventListener('click', () => { G.clear(); G.flow.setup(); });
  };

  G.init();
})();
