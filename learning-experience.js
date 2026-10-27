'use strict';

/* E POI? — cinematic learning deck + editorial rulebook + table reference.
   This additive module leaves card distribution, objectives and game state untouched. */
(() => {
  const S = window.S52;
  if (!S) return;

  const english = () => (window.EpoiI18n?.language || document.documentElement.lang) === 'en';
  const T = (it, en) => english() ? en : it;
  const L = value => Array.isArray(value) ? value[english() ? 1 : 0] : value;
  const esc = value => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
  const fmt = value => esc(L(value));
  const reduceMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const slides = [
    {kind:'cover', chapter:['IL GIOCO','THE GAME'], title:['La storia è una.<br>I piani no.','One story.<br>Different plans.'], body:['Raccontate una storia insieme. Ognuno però ha un finale segreto da raggiungere.','Tell a story together. But everyone has a secret ending they’re trying to reach.']},
    {kind:'opening', chapter:['IL PUNTO DI PARTENZA','THE STARTING POINT'], title:['Tutto comincia<br>da qui.','It starts<br>here.'], body:['Leggete l’incipit ad alta voce. Da quel momento, tutto quello che racconta esiste nella vostra storia.','Read the opening aloud. From that moment, everything in it is part of your story.']},
    {kind:'secret', chapter:['UN OBIETTIVO A TESTA','ONE GOAL EACH'], title:['Una storia.<br>Segreti diversi.','One story.<br>Different secrets.'], body:['Leggi il tuo obiettivo senza mostrarlo. Gli altri non devono sapere dove vuoi portare la storia.','Read your goal without showing anyone. Keep your planned ending to yourself.']},
    {kind:'turn', chapter:['IL TURNO','YOUR TURN'], title:['Tocca a te.','Your turn.'], body:['Cambia una carta, gioca e racconta cosa succede. Alla fine scegli se pescare.','Exchange a card, play one, and tell everyone what happens. Then decide whether to draw.']},
    {kind:'card', chapter:['CARTE NUMERICHE · 2–10','NUMBER CARDS · 2–10'], title:['Cuori.<br>I rapporti.','Hearts.<br>Relationships.'], body:['Pari? Due personaggi si avvicinano. Dispari? Si allontanano.','Even? Two characters grow closer. Odd? They drift apart.'], rank:'6',suit:'♥', name:['RELAZIONE POSITIVA','POSITIVE RELATIONSHIP'], example:['♥6 — L’organizzatrice e il giudice tornano a fidarsi.','♥6 — The organiser and the judge begin to trust each other again.'], alt:['♥5 — L’organizzatrice litiga con il giudice.','♥5 — The organiser argues with the judge.']},
    {kind:'card', chapter:['CARTE NUMERICHE · 2–10','NUMBER CARDS · 2–10'], title:['Quadri.<br>Una scoperta.','Diamonds.<br>A discovery.'], body:['Pari: trovi qualcosa che aiuta. Dispari: salta fuori un guaio.','Even: you find something helpful. Odd: you uncover trouble.'], rank:'8',suit:'♦', name:['SCOPERTA POSITIVA','POSITIVE DISCOVERY'], example:['♦8 — Una foto rivela dove è passata la coppa.','♦8 — A photograph reveals where the trophy went.'],alt:['♦3 — Si scopre che la coppa è stata spostata due volte.','♦3 — The trophy was moved twice, complicating the search.']},
    {kind:'card', chapter:['CARTE NUMERICHE · 2–10','NUMBER CARDS · 2–10'], title:['Fiori.<br>Si agisce.','Clubs.<br>Take action.'], body:['Fai agire un personaggio. Può provarci, ma non è detto che ci riesca.','A character makes a move. They can try, but success is not guaranteed.'], rank:'7',suit:'♣', name:['AZIONE','ACTION'], example:['♣7 — L’organizzatrice prova a cercare la coppa dietro il palco.','♣7 — The organiser tries to find the trophy behind the stage.']},
    {kind:'card', chapter:['CARTE NUMERICHE · 2–10','NUMBER CARDS · 2–10'], title:['Picche.<br>Un ostacolo.','Spades.<br>A setback.'], body:['Metti un ostacolo sulla strada dei personaggi. Da ora devono farci i conti.','Put an obstacle in the characters’ way. Now they have to deal with it.'], rank:'4',suit:'♠', name:['OSTACOLO','OBSTACLE'], example:['♠4 — La porta del deposito accanto al palco si blocca.','♠4 — The storage room door beside the stage jams.']},
    {kind:'card', chapter:['FIGURE · NUOVO ELEMENTO','FACE CARDS · NEW ELEMENT'], title:['J.<br>Entra un oggetto.','J.<br>Bring in an object.'], body:['Aggiungi un oggetto alla storia. Che cosa ci faranno i personaggi si vedrà dopo.','Add a new object to the story. What the characters do with it comes later.'], rank:'J',suit:'♠', name:['OGGETTO NEGATIVO','NEGATIVE OBJECT'], example:['J♠ — Sul palco compare un megafono guasto.','J♠ — A broken megaphone appears on the stage.']},
    {kind:'card', chapter:['FIGURE · NUOVO ELEMENTO','FACE CARDS · NEW ELEMENT'], title:['Q.<br>Entra qualcuno.','Q.<br>Someone arrives.'], body:['Presenta un nuovo personaggio. Non puoi fargli compiere anche un’azione importante nello stesso momento.','Introduce a character. You can’t also give them a major action in the same moment.'], rank:'Q',suit:'♠',name:['PERSONAGGIO NEGATIVO','NEGATIVE CHARACTER'], example:['Q♠ — Arriva un concorrente deciso a nascondere la verità.','Q♠ — A contestant arrives, determined to hide the truth.']},
    {kind:'card', chapter:['FIGURE · NUOVO ELEMENTO','FACE CARDS · NEW ELEMENT'], title:['K.<br>Un posto nuovo.','K.<br>Somewhere new.'], body:['Aggiungi un luogo. Per andarci davvero, però, servirà una scena successiva.','Add a location. Actually going there will take another scene.'],rank:'K',suit:'♥',name:['LUOGO POSITIVO','POSITIVE LOCATION'],example:['K♥ — Si scopre una stanza dove cercare la coppa.','K♥ — They discover a room where they can look for the trophy.']},
    {kind:'card', chapter:['ASSI · SVOLTA','ACES · TWIST'], title:['A.<br>Colpo di scena.','A.<br>Plot twist.'], body:['Ribalta la situazione. La svolta deve partire da qualcosa che è già successo.','Turn things upside down. Your twist must grow out of something that already happened.'],rank:'A',suit:'♦',name:['SVOLTA POSITIVA','POSITIVE TWIST'],example:['A♦ — Il giudice rivela che la coppa era stata riparata dalla pioggia.','A♦ — The judge reveals the trophy was sheltered from the rain.']},
    {kind:'colors',chapter:['FIGURE E ASSI','FACE CARDS AND ACES'],title:['Rosso o nero?','Red or black?'],body:['Per J, Q, K e A guarda solo il colore: rosso aiuta, nero mette i bastoni tra le ruote.','For J, Q, K and A, colour is all that matters: red helps, black gets in the way.']},
    {kind:'connect',chapter:['LA REGOLA CHE UNISCE TUTTO','THE RULE THAT TIES IT TOGETHER'],title:['«E COME?»','“BUT HOW?”'],body:['Hai aggiunto qualcosa? Deve avere un legame diretto con ciò che c’è già. E se qualcuno chiede «E come?», spiegaglielo.','Added something new? It must link directly to what’s already there. If someone asks “But how?”, explain the link.']},
    {kind:'ending',chapter:['CHIUDERE LA STORIA','ENDING THE STORY'],title:['Ultima carta.<br>Ultima parola?','Last card.<br>Last word?'],body:['Se hai finito le carte, non pescare. Prova a chiudere la stessa scena con il finale che avevi in mente.','When you run out of cards, don’t draw. Try to end that same scene with your secret goal.']},
    {kind:'summary',chapter:['SEI PRONTO','YOU ARE READY'],title:['Adesso tocca<br>a voi.','Now it’s<br>your turn.'],body:['Giocate una carta alla volta. Continuate la stessa storia, tenete segreto il vostro finale e chiedete «E come?» quando serve.','Play one card at a time. Keep telling the same story, hide your ending, and ask “But how?” when you need to.']}
  ];

  const card = (rank, suit, mini = false) => '<div class="ep-playing-card '+('♥♦'.includes(suit)?'red':'black')+(mini?' tiny':'')+'" aria-label="'+esc(rank+suit)+'"><span class="ep-pc-corner">'+esc(rank)+'<i>'+esc(suit)+'</i></span><span class="ep-pc-center">'+esc(suit)+'</span><span class="ep-pc-corner bottom">'+esc(rank)+'<i>'+esc(suit)+'</i></span></div>';
  const example = (label, value) => {
    const content = fmt(value).replace(/^([♥♦♠♣])([2-9]|10|[JQKA])(?=\s|\s*—)/, (match, suit, rank) =>
      '<strong class="' + ('♥♦'.includes(suit) ? 'ep-example-red' : 'ep-example-black') + '">' + suit + rank + '</strong>');
    return '<div class="ep-example"><span>' + esc(label) + '</span><p>' + content + '</p></div>';
  };

  function visualFor(slide) {
    switch (slide.kind) {
      case 'cover':
        return '<div class="ep-cover-art"><div class="ep-cover-orbit orbit-one"></div><div class="ep-cover-orbit orbit-two"></div><div class="ep-cover-card one">'+card('Q','♠')+'</div><div class="ep-cover-card two">'+card('7','♥')+'</div><div class="ep-cover-card three">'+card('A','♦')+'</div><span class="ep-cover-stamp">E POI<span>?</span></span></div>';
      case 'opening':
        return '<div class="ep-story-sheet"><span class="ep-sheet-kicker">'+T('ESEMPIO INVENTATO · AQUILONI','MADE-UP EXAMPLE · KITE FESTIVAL')+'</span><h3>'+T('La coppa<br>è sparita.','The trophy<br>has vanished.')+'</h3><p>'+T('Alla festa degli aquiloni scompare la coppa dal palco. L’organizzatrice e il giudice devono ritrovarla prima della premiazione.','At a kite festival, a trophy vanishes from the stage. The organiser and judge must find it before the ceremony.')+'</p><div class="ep-sheet-tags"><span>'+T('COPPA','TROPHY')+'</span><span>'+T('GIUDICE','JUDGE')+'</span><span>'+T('PALCO','STAGE')+'</span></div></div>';
      case 'secret':
        return '<div class="ep-secret-stack"><div class="ep-secret-card"><span>01 / '+T('SEGRETO','SECRET')+'</span><b>'+T('Far ritrovare la coppa al giudice','Make the judge recover the trophy')+'</b></div><div class="ep-secret-card"><span>02 / '+T('SEGRETO','SECRET')+'</span><b>'+T('Far scoprire chi ha nascosto la coppa','Expose who hid the trophy')+'</b></div><div class="ep-secret-card"><span>03 / '+T('SEGRETO','SECRET')+'</span><b>'+T('Riuscire a fare la premiazione','Make the award ceremony happen')+'</b></div><p>'+T('Nella partita vedrai soltanto il tuo.','During the game, you’ll only see yours.')+'</p></div>';
      case 'turn':
        return '<div class="ep-turn-steps">'+[
          [T('01','01'),T('CAMBIA','EXCHANGE'),T('Con almeno 2 carte: scarta 1 e pesca 1. Con 1 carta: facoltativo.','With 2+ cards: discard 1 and draw 1. With 1: optional.')],
          ['02',T('GIOCA','PLAY'),T('Scegli una carta dalla mano.','Choose one card from your hand.')],
          ['03',T('RACCONTA','NARRATE'),T('Aggiungi una sola scena seguendo la carta.','Add one scene following the card.')],
          ['04',T('PESCA O PASSA','DRAW OR PASS'),T('Dopo la scena puoi pescare 1 carta o non pescare.','After the scene, you may draw 1 card or not draw.')]
        ].map(s => '<div><span>'+s[0]+'</span><strong>'+s[1]+'</strong><small>'+s[2]+'</small></div>').join('')+'</div>';
      case 'card':
        return '<div class="ep-card-display"><div class="ep-card-halo"></div>'+card(slide.rank,slide.suit)+'<div class="ep-card-foot"><span>'+fmt(slide.name)+'</span></div></div>';
      case 'colors':
        return '<div class="ep-colors-art"><div>'+card('Q','♥')+'<strong>'+T('ROSSA · AIUTA','RED · HELPS')+'</strong></div><div>'+card('Q','♠')+'<strong>'+T('NERA · OSTACOLA','BLACK · HINDERS')+'</strong></div></div>';
      case 'connect':
        return '<div class="ep-connect-art"><div class="ep-dialog-bubble first"><small>J♠</small><b>'+T('«Sul palco c’è un megafono guasto!»','“There is a broken megaphone on the stage!”')+'</b></div><div class="ep-dialog-bubble ask">'+T('«E come ci è arrivato?»','“But how did it get there?”')+'</div><div class="ep-dialog-bubble answer"><b>'+T('«Lo ha portato l’organizzatrice per annunciare il vincitore.»','“The organiser brought it to announce the winner.”')+'</b><span>'+T('COLLEGAMENTO DIRETTO: ORGANIZZATRICE','DIRECT LINK: ORGANISER')+'</span></div></div>';
      case 'ending':
        return '<div class="ep-ending-art">'+card('8','♦')+'<div class="ep-ending-arrow">→</div><div class="ep-final-note"><small>'+T('OBIETTIVO SEGRETO','SECRET GOAL')+'</small><b>'+T('Far scoprire chi ha nascosto la coppa','Expose who hid the trophy')+'</b><p>'+T('La scena dell’ultima carta porta al finale.','The final card’s scene leads to the ending.')+'</p></div></div>';
      case 'summary':
        return '<div class="ep-summary-art"><div><strong>♥</strong>'+T('Relazione','Relationship')+'</div><div><strong>♦</strong>'+T('Scoperta','Discovery')+'</div><div><strong>♣</strong>'+T('Azione','Action')+'</div><div><strong>♠</strong>'+T('Ostacolo','Obstacle')+'</div><div><strong>J Q K A</strong>'+T('Oggetto · Persona · Luogo · Svolta','Object · Person · Place · Twist')+'</div></div>';
      default: return '';
    }
  }

  function stageDetail(slide) {
    if (slide.kind === 'card') return '<div class="ep-stage-examples">'+example(T('ESEMPIO','EXAMPLE'), slide.example)+(slide.alt?example(T('ALTRO ESEMPIO','ANOTHER EXAMPLE'),slide.alt):'')+'</div>';
    if (slide.kind === 'connect') return '<div class="ep-stage-rule"><b>'+T('NESSUNA VOTAZIONE','NO VOTING')+'</b><p>'+T('Indica un personaggio, luogo, oggetto o fatto già narrato e spiega il legame diretto. Puoi chiarire il retroscena, ma non aggiungere altre azioni principali gratis. Essere nello stesso posto non basta.','Name a previously established person, place, object or fact, and explain the direct link. Background detail is fine; extra major actions are not free. Sharing a location is not enough.')+'</p></div>';
    if (slide.kind === 'colors') return '<div class="ep-stage-rule"><b>'+T('SOLO J, Q, K E A','ONLY J, Q, K AND A')+'</b><p>'+T('Per i numeri 2–10 usi invece il seme; Cuori e Quadri dipendono anche dalla parità.','Number cards 2–10 use their suit; Hearts and Diamonds also depend on whether the number is even or odd.')+'</p></div>';
    if (slide.kind === 'ending') return '<div class="ep-stage-rule"><b>'+T('GLI ALTRI CONTROLLANO','THE OTHERS CHECK')+'</b><p>'+T('Se il finale rispetta carta, obiettivo e fatti già narrati, la partita finisce. Altrimenti peschi una carta e continuate.','If the ending follows the card, goal and established facts, the game ends. Otherwise draw a card and continue.')+'</p></div>';
    return '';
  }

  let host = null;
  let activeMode = 'deck';
  let index = 0;
  let previouslyFocused = null;
  let touchStart = null;

  function deckMarkup() {
    const slide = slides[index];
    const previous=index===0?' disabled':'';
    const action=index===slides.length-1?'play':'next';
    const label=index===slides.length-1?T('Gioca ora','Play now'):T('Avanti','Next');
    return `<section class="ep-deck">
      <div class="ep-progress-top"><span>${fmt(slide.chapter)}</span><span>${String(index+1).padStart(2,'0')} / ${slides.length}</span></div>
      <div class="ep-progress-line" role="progressbar" aria-label="${T('Avanzamento','Progress')}" aria-valuemin="1" aria-valuemax="${slides.length}" aria-valuenow="${index+1}"><span style="width:${(index+1)/slides.length*100}%"></span></div>
      <div class="ep-stage ep-stage-${slide.kind}" aria-live="polite">
        <div class="ep-stage-fit">
          <div class="ep-stage-copy"><span class="eyebrow">E POI? · ${String(index+1).padStart(2,'0')}</span><h2>${L(slide.title)}</h2><p>${fmt(slide.body)}</p></div>
          <div class="ep-stage-art" aria-hidden="true">${visualFor(slide)}</div>
          <div class="ep-stage-details">${stageDetail(slide)}</div>
        </div>
      </div>
      <nav class="ep-deck-bottom" aria-label="${T('Navigazione tutorial','Tutorial navigation')}">
        <button type="button" class="secondary ep-button" data-action="prev"${previous}>← ${T('Indietro','Back')}</button>
        <span class="ep-deck-counter">${index+1} / ${slides.length}</span>
        <button type="button" class="primary ep-button" data-action="${action}">${label} →</button>
      </nav>
    </section>`;
  }

  const para = (it,en) => '<p>'+T(it,en)+'</p>';
  const list = items => '<ol>'+items.map(item => '<li>'+T(item[0],item[1])+'</li>').join('')+'</ol>';
  const callout = (it,en) => '<aside class="ep-doc-note">'+T(it,en)+'</aside>';
  const ruleSection = (id,number,titleIt,titleEn,body) => '<section id="ep-rule-'+id+'" class="ep-doc-section"><div class="ep-doc-section-title"><span>'+number+'</span><h2>'+T(titleIt,titleEn)+'</h2></div>'+body+'</section>';

  const ruleSections = () => [
    {id:'overview',label:T('Il gioco','The game'),html:ruleSection('overview','01','Che cos’è E POI?','What is E POI?',
      para('E POI? è un gioco narrativo con carte e obiettivi segreti. Tutti costruiscono la stessa storia, una scena per turno; ciascuno prova a orientarla verso il proprio obiettivo senza dichiararlo agli altri.','E POI? is a storytelling game with cards and secret goals. Everyone builds one story, one scene per turn; each player tries to steer it towards their hidden goal.')
      +para('La storia inizia dall’incipit scelto. I fatti dell’incipit sono già parte della storia e possono essere usati per collegare nuove scene.','The chosen opening starts the story. Its facts already belong to the story and can be used to connect new scenes.'))},
    {id:'setup',label:T('Preparazione','Setup'),html:ruleSection('setup','02','Preparazione','Setup',
      list([
        ['Scegliete un incipit e leggetelo tutti.','Choose an opening and read it together.'],
        ['Usate un mazzo francese di 52 carte senza jolly, fisico o virtuale.','Use a standard 52-card deck without jokers, physical or virtual.'],
        ['Distribuite 5 carte a testa con 2–3 giocatori; 4 con 4 giocatori; 3 con 5–8 giocatori.','Deal 5 cards each for 2–3 players; 4 for 4 players; 3 for 5–8 players.'],
        ['Ognuno legge solo il proprio obiettivo segreto.','Each player reads only their own secret goal.'],
        ['Scegliete il primo giocatore e procedete sempre nello stesso ordine.','Choose the first player and take turns in order.']
      ]))},
    {id:'turn',label:T('Il turno','The turn'),html:ruleSection('turn','03','Come funziona un turno','How a turn works',
      list([
        ['Cambio: se hai almeno 2 carte, scartane 1 e pescane subito 1. Se ne hai 1 sola, puoi cambiarla oppure tenerla.','Exchange: with 2+ cards, discard 1 and draw 1 immediately. With only 1, you may exchange it or keep it.'],
        ['Giocata: scegli e gioca 1 carta dalla tua mano.','Play: choose and play 1 card from your hand.'],
        ['Scena: racconta un solo passaggio della storia rispettando il significato della carta.','Scene: narrate one story development following the meaning of the card.'],
        ['Dopo la scena: puoi pescare 1 carta oppure terminare il turno senza pescare.','After the scene: you may draw 1 card or end the turn without drawing.']
      ])+callout('<strong>Non confondere il cambio iniziale con la pesca finale.</strong> Sono due momenti diversi del turno.','<strong>Do not confuse the initial exchange with the optional final draw.</strong> They are two different steps.'))},
    {id:'numbers',label:T('Carte 2–10','Cards 2–10'),html:ruleSection('numbers','04','Carte numeriche: 2–10','Number cards: 2–10',
      '<div class="ep-doc-table-wrap"><table><thead><tr><th>'+T('Seme','Suit')+'</th><th>'+T('Effetto','Effect')+'</th><th>'+T('Esempio','Example')+'</th></tr></thead><tbody>'+
      '<tr><td><b class="ep-red">♥ '+T('Cuori','Hearts')+'</b></td><td>'+T('Relazione: pari migliora, dispari peggiora.','Relationship: even improves, odd worsens.')+'</td><td>'+T('♥6: torna la fiducia. ♥5: nasce un litigio.','♥6: trust returns. ♥5: an argument begins.')+'</td></tr>'+
      '<tr><td><b class="ep-red">♦ '+T('Quadri','Diamonds')+'</b></td><td>'+T('Scoperta: pari utile, dispari complicante.','Discovery: even helpful, odd troubling.')+'</td><td>'+T('♦8: si trova un documento utile.','♦8: a useful document is found.')+'</td></tr>'+
      '<tr><td><b>♣ '+T('Fiori','Clubs')+'</b></td><td>'+T('Azione: un personaggio prova a fare qualcosa.','Action: a character attempts something.')+'</td><td>'+T('♣7: l’organizzatrice tenta di trovare la coppa.','♣7: the organiser tries to find the trophy.')+'</td></tr>'+
      '<tr><td><b>♠ '+T('Picche','Spades')+'</b></td><td>'+T('Ostacolo: un problema rende tutto più difficile.','Obstacle: a problem makes things harder.')+'</td><td>'+T('♠4: la porta del deposito si blocca.','♠4: the storage door jams.')+'</td></tr>'+
      '</tbody></table></div>'+callout('<strong>Fiori è un tentativo.</strong> Giocare ♣ non garantisce automaticamente un esito o il controllo delle azioni successive.','<strong>Clubs is an attempt.</strong> Playing ♣ does not automatically guarantee an outcome or control of subsequent actions.'))},
    {id:'faces',label:T('Figure e assi','Face cards and aces'),html:ruleSection('faces','05','Figure e assi: J, Q, K, A','Face cards and aces: J, Q, K, A',
      '<div class="ep-doc-ranks"><div><b>J</b><span>'+T('Oggetto nuovo','New object')+'</span></div><div><b>Q</b><span>'+T('Personaggio nuovo','New character')+'</span></div><div><b>K</b><span>'+T('Luogo nuovo','New place')+'</span></div><div><b>A</b><span>'+T('Colpo di scena','Plot twist')+'</span></div></div>'+
      para('Per queste carte guarda valore e colore, non il seme: rosso (♥ ♦) = positivo, nero (♣ ♠) = negativo. Una Q nera introduce un personaggio che ostacola, non anche un’azione di Fiori.','For these cards use rank and colour, not the suit: red (♥ ♦) = positive, black (♣ ♠) = negative. A black Q introduces a character who hinders, not an additional Clubs action.')+
      para('La carta introduce soltanto il suo elemento o la sua svolta. Le azioni importanti e le conseguenze successive vanno costruite nei turni dopo.','The card introduces only its element or its twist. Further major actions and consequences must be built in later turns.'))},
    {id:'how',label:T('La regola «E COME?»','The “BUT HOW?” rule'),html:ruleSection('how','06','«E COME?» — collegamento diretto','“BUT HOW?” — direct connection',
      callout('<strong>Regola obbligatoria:</strong> ogni elemento, evento o fatto nuovo che inserisci deve collegarsi <strong>direttamente ad almeno un elemento già presente nella storia</strong>, compreso l’incipit.','<strong>Mandatory rule:</strong> each new object, event or fact must connect <strong>directly to at least one element already present in the story</strong>, including the opening.')+
      para('Il collegamento deve spiegare concretamente da dove arriva, chi lo porta, perché esiste o che cosa lo provoca. Essere semplicemente nello stesso luogo <strong>non basta</strong>.','The link must concretely explain where it came from, who brought it, why it exists or what caused it. Simply sharing the same location <strong>is not enough</strong>.')+
      list([
        ['Un altro giocatore può chiedere «E come?», «Chi lo ha portato?» o «Che cosa c’entra?».','Another player can ask “But how?”, “Who brought it?” or “What connects it?”.'],
        ['Chi ha giocato indica concretamente una persona, un oggetto, un luogo, un evento o un fatto già raccontato e spiega il legame diretto.','The narrator identifies an established person, object, place, event or fact and explains the direct link.'],
        ['La spiegazione è parte del racconto: può chiarire il passato o i dettagli, ma non regalare un secondo evento principale o altre azioni che richiederebbero carte.','The explanation is part of the story: it may clarify background details, but cannot grant a second major event or additional actions that require cards.'],
        ['Se manca un collegamento diretto, completa o modifica la spiegazione e la scena; la carta giocata resta quella.','If no direct link exists, complete or adjust the explanation and scene; the played card stays the same.']
      ])+
      '<div class="ep-doc-example"><strong>'+T('ESEMPIO: J♠','EXAMPLE: J♠')+'</strong>'+para('«Sul palco compare un megafono guasto». — «E come?». — «Lo ha portato l’organizzatrice per annunciare il vincitore». Il legame diretto è con l’organizzatrice già presente.','“A broken megaphone appears on the stage.” — “But how?” — “The organiser brought it to announce the winner.” The link is directly to the organiser already present.')+'</div>'+
      para('<strong>Non si vota.</strong> La domanda serve a rendere esplicito il collegamento, non a bloccare una scelta perché non piace. Non basta rispondere «è successo per caso» o inventare un’altra trama scollegata.','<strong>There is no vote.</strong> The question exposes the link, not a veto against an idea someone dislikes. “It just happened” or an unrelated invented subplot is not enough.'))},
    {id:'ending',label:T('Finale','Ending'),html:ruleSection('ending','07','Tentare il finale','Attempting an ending',
      list([
        ['Dopo aver giocato la tua ultima carta, puoi scegliere di non pescare e tentare il finale.','After playing your last card, you may choose not to draw and attempt the ending.'],
        ['La stessa scena dell’ultima carta prosegue fino a soddisfare la condizione del tuo obiettivo segreto. Non è una seconda scena separata.','The same scene from your last card continues until it satisfies your secret goal condition. It is not a separate second scene.'],
        ['Rivela il tuo obiettivo. Il finale deve rispettare carta, storia e fatti già presenti; non può introdurre una soluzione nuova dal nulla.','Reveal your goal. The ending must follow the card, story and established facts; it cannot conjure an unrelated new solution.'],
        ['Il gruppo verifica se la chiusura rispetta queste condizioni. Se accettata, la partita finisce. Se rifiutata, pesca 1 carta e si continua.','The group checks these conditions. If accepted, the game ends. If rejected, draw 1 card and continue.']
      ])+para('La chiusura mostrata sull’obiettivo è un esempio di possibile esito, non una frase da ripetere alla lettera.','The ending shown on the goal card is an example, not a script to recite word for word.'))},
    {id:'edge',label:T('Chiarimenti','Clarifications'),html:ruleSection('edge','08','Chiarimenti importanti','Important clarifications',
      '<dl class="ep-doc-faq"><dt>'+T('Una J può introdurre un megafono guasto?','Can a J introduce a broken megaphone?')+'</dt><dd>'+T('Sì, con una J nera e un collegamento diretto a un elemento già esistente. Usarlo o ripararlo richiede un’azione successiva.','Yes, with a black J and a direct link to an existing element. Using or repairing it requires a later action.')+'</dd>'+
      '<dt>'+T('Posso introdurre un imbroglione con Q?','Can I introduce a cheater with Q?')+'</dt><dd>'+T('Sì, ma la Q non include anche il suo sabotaggio: quel tentativo richiede Fiori in un turno successivo.','Yes, but Q does not include sabotage: that attempt needs a Clubs card on a later turn.')+'</dd>'+
      '<dt>'+T('Se qualcuno chiede «E COME?», si vota?','Does “BUT HOW?” trigger a vote?')+'</dt><dd>'+T('No. Si nomina l’elemento già presente e si spiega il legame diretto. Non è un voto di gradimento.','No. Name the established element and explain the direct link. It is not a popularity vote.')+'</dd>'+
      '<dt>'+T('Posso inventare un retroscena nella spiegazione?','Can I invent background details?')+'</dt><dd>'+T('Sì, solo per spiegare il collegamento. Non per aggiungere gratis altre persone, oggetti, luoghi, svolte o azioni principali.','Yes, to explain the link only. Not to add extra major characters, objects, places, twists or actions for free.')+'</dd></dl>')}
  ];

  function manualMarkup() {
    const sections = ruleSections();
    return '<div class="ep-manual"><aside class="ep-manual-index"><div class="ep-index-label">'+T('INDICE','CONTENTS')+'</div><nav aria-label="'+T('Indice regolamento','Rulebook contents')+'">'+sections.map(s => '<a href="#ep-rule-'+s.id+'" data-section="'+s.id+'">'+esc(s.label)+'</a>').join('')+'</nav><div class="ep-index-bottom">'+T('Versione di consultazione · 2026','Reference edition · 2026')+'</div></aside><div class="ep-manual-scroll"><article class="ep-paper"><header class="ep-paper-cover"><div class="ep-paper-supra">E POI? <span> / 01</span></div><p>'+T('MANUALE DI GIOCO','GAME RULEBOOK')+'</p><h1>'+T('Regolamento<br>completo.','Complete<br>rulebook.')+'</h1><div class="ep-paper-meta"><span>'+T('CARTE · STORIE · OBIETTIVI SEGRETI','CARDS · STORIES · SECRET GOALS')+'</span><span>ED. 2026</span></div></header><div class="ep-paper-body"><div class="ep-doc-intro">'+T('Questo documento è la fonte di riferimento per preparazione, carte, turno, collegamenti narrativi e finale.','This document is the reference for setup, cards, turns, narrative links and endings.')+'</div><nav class="ep-doc-toc" aria-label="'+T('Indice nel documento','Contents within the document')+'"><h2>'+T('Indice','Contents')+'</h2>'+sections.map((s,i)=>'<a href="#ep-rule-'+s.id+'" data-section="'+s.id+'"><span>'+String(i+1).padStart(2,'0')+'</span>'+esc(s.label)+'</a>').join('')+'</nav>'+sections.map(s=>s.html).join('')+'<footer class="ep-paper-end"><b>E POI?</b><span>'+T('Una storia, più piani.','One story, many agendas.')+'</span></footer></div></article></div></div>';
  }

  function quickMarkup() {
    return '<div class="ep-quick"><div class="ep-quick-inner"><p class="eyebrow">'+T('PROMEMORIA DI PARTITA','GAME CHEAT SHEET')+'</p>'+S.quickReferenceMarkup()+'<button class="secondary ep-quick-open-manual" type="button" data-action="manual">'+T('Apri il regolamento completo','Open full rulebook')+' →</button></div></div>';
  }

  function shellMarkup() {
    return '<div class="ep-learn-dialog" role="dialog" aria-modal="true" aria-label="'+T('Impara E POI? e consulta le regole','Learn E POI? and browse the rules')+'"><header class="ep-learn-header"><div class="ep-learn-brand">E POI<span>?</span><small>'+T('COME SI GIOCA','HOW TO PLAY')+'</small></div><nav class="ep-learn-tabs" aria-label="'+T('Modalità di apprendimento','Learning views')+'"><button type="button" data-action="deck">'+T('Presentazione','Presentation')+'</button><button type="button" data-action="manual">'+T('Regolamento','Rulebook')+'</button><button type="button" data-action="quick">'+T('Promemoria','Quick guide')+'</button></nav><div class="ep-learn-tools"><button class="ep-learn-print" type="button" data-action="print" title="'+T('Stampa o salva come PDF','Print or save as PDF')+'">'+T('PDF / STAMPA','PDF / PRINT')+'</button><button class="ep-learn-close" type="button" data-action="close" aria-label="'+T('Chiudi','Close')+'">×</button></div></header><main class="ep-learn-content" data-content></main></div>';
  }
  // All content is fitted to the actual space between progress and controls.
  // In mobile mode the stage is non-scrollable, and its content is scaled only when necessary.
  function fitDeck() {
    if (!host || activeMode !== 'deck') return;
    const stage = host.querySelector('.ep-stage');
    const inner = stage?.querySelector('.ep-stage-fit');
    if (!stage || !inner || !window.matchMedia?.('(max-width:760px)').matches) return;
    inner.style.setProperty('--ep-fit-scale', '1');
    const naturalHeight = Math.max(inner.scrollHeight, inner.offsetHeight);
    const naturalWidth = Math.max(inner.scrollWidth, inner.offsetWidth);
    const height = Math.max(1, stage.clientHeight - 8);
    const width = Math.max(1, stage.clientWidth - 8);
    const fit = Math.min(1, height / Math.max(1, naturalHeight), width / Math.max(1, naturalWidth));
    inner.style.setProperty('--ep-fit-scale', String(Math.min(1, Math.max(.01, Math.floor(fit * 1000) / 1000))));
  }

  function render() {
    if (!host) return;
    const content = host.querySelector('[data-content]');
    host.dataset.mode = activeMode;
    host.querySelectorAll('.ep-learn-tabs button').forEach(button => {
      const on = button.dataset.action === activeMode;
      button.classList.toggle('active', on);
      button.setAttribute('aria-current', on?'page':'false');
    });
    content.innerHTML = activeMode === 'deck' ? deckMarkup() : activeMode === 'manual' ? manualMarkup() : quickMarkup();
    content.scrollTop = 0;
    const docScroll = content.querySelector('.ep-manual-scroll');
    if (docScroll) docScroll.scrollTop = 0;
    fitDeck();
    if (typeof requestAnimationFrame === 'function') requestAnimationFrame(fitDeck);
  }
  window.addEventListener?.('resize', () => {
    if (typeof requestAnimationFrame === 'function') requestAnimationFrame(fitDeck);
    else fitDeck();
  });
  window.visualViewport?.addEventListener?.('resize', fitDeck);
  document.fonts?.ready?.then?.(fitDeck);
  function close() {
    if (!host) return;
    const removed = host;
    host = null;
    removed.remove();
    document.body.classList.remove('ep-learn-open');
    previouslyFocused?.isConnected && previouslyFocused.focus();
    previouslyFocused = null;
  }
  function view(mode) {
    const openingNewDialog = !host;
    if (!host) {
      previouslyFocused = document.activeElement;
      host = document.createElement('div');
      host.className = 'ep-learn-overlay';
      host.innerHTML = shellMarkup();
      host.addEventListener('click', event => {
        if (event.target === host) { close(); return; }
        const target = event.target.closest('[data-action],[data-slide],[data-section]');
        if (!target) return;
        if (target.dataset.section) {
          event.preventDefault();
          const section = host.querySelector('#ep-rule-'+target.dataset.section);
          section?.scrollIntoView({behavior:reduceMotion()?'auto':'smooth',block:'start'});
          return;
        }
        if (target.dataset.slide !== undefined) { index = Number(target.dataset.slide); render(); return; }
        const action = target.dataset.action;
        if (action === 'close') return close();
        if (action === 'prev' && index>0) { index--; render(); return; }
        if (action === 'next' && index<slides.length-1) { index++; render(); return; }
        if (action === 'play') { close(); document.body.classList.remove('home-static-entry'); S.renderSetup('play'); return; }
        if (action === 'print') { if (activeMode !== 'manual') { activeMode='manual'; render(); } window.print(); return; }
        if (['deck','manual','quick'].includes(action)) { activeMode=action; render(); }
      });
      host.addEventListener('keydown', event => {
        if (event.key === 'Escape') { event.preventDefault(); close(); return; }
        if (activeMode === 'deck' && ['ArrowRight','ArrowLeft','Home','End'].includes(event.key)) {
          if (event.target.matches('input,textarea,select')) return;
          event.preventDefault();
          if (event.key === 'ArrowRight') index=Math.min(slides.length-1,index+1);
          if (event.key === 'ArrowLeft') index=Math.max(0,index-1);
          if (event.key === 'Home') index=0;
          if (event.key === 'End') index=slides.length-1;
          render();
        }
        if (event.key === 'Tab') {
          const controls = [...host.querySelectorAll('button:not([disabled]),a[href]')].filter(el => el.getClientRects().length);
          if (!controls.length) return;
          const first=controls[0], last=controls[controls.length-1];
          if (event.shiftKey && document.activeElement===first) {event.preventDefault(); last.focus();}
          else if (!event.shiftKey && document.activeElement===last) {event.preventDefault();first.focus();}
        }
      });
      host.addEventListener('touchstart', event => {
        if (activeMode !== 'deck' || event.touches.length !== 1) return;
        touchStart={x:event.touches[0].clientX,y:event.touches[0].clientY};
      }, {passive:true});
      host.addEventListener('touchend', event => {
        if (!touchStart || activeMode!=='deck' || !event.changedTouches.length) {touchStart=null;return;}
        const dx=event.changedTouches[0].clientX-touchStart.x,dy=event.changedTouches[0].clientY-touchStart.y;
        touchStart=null;
        if (Math.abs(dx)>70 && Math.abs(dx)>Math.abs(dy)*1.4) { index=Math.max(0,Math.min(slides.length-1,index+(dx<0?1:-1))); render(); }
      }, {passive:true});
      document.body.appendChild(host);
      document.body.classList.add('ep-learn-open');
    }
    activeMode=mode;
    if (mode === 'deck' && openingNewDialog) index = 0;
    render();
    host.querySelector('[data-action="close"]')?.focus({preventScroll:true});
  }

  // Preserve established game mechanics and the creator panel.
  const oldHomePanel = S.openHomePanel;
  S.openHomePanel = panel => {
    if (panel === 'how' || panel === 'tutorial') return view('deck');
    if (panel === 'rules') return view('manual');
    if (panel === 'quick') return view('quick');
    return oldHomePanel?.(panel);
  };
  S.openRulesModal = () => view('quick');
  S.openQuickRules = () => view('quick');


  S.quickReferenceMarkup = () => `<section class="game-card ep-game-ref" aria-label="${T('Promemoria di gioco','Game quick reference')}">
    <header class="ep-game-ref-head">
      <div><p class="eyebrow">${T('DURANTE LA PARTITA','DURING THE GAME')}</p><h3>${T('Promemoria rapido','Quick reference')}</h3></div>
      <button type="button" class="secondary ep-game-ref-full" data-game-full-rules>${T('Regolamento completo','Full rules')} ↗</button>
    </header>
    <div class="ep-game-ref-turn">
      <strong>${T('IL TURNO','YOUR TURN')}</strong><span>${T('Cambia','Exchange')} <i>→</i> ${T('Gioca','Play')} <i>→</i> ${T('Racconta','Narrate')} <i>→</i> ${T('Pesca o passa','Draw or pass')}</span>
    </div>
    <div class="ep-game-ref-cards">
      <div><b class="ep-red">♥</b><span>${T('Relazione','Relationship')}</span><small>${T('Pari + · dispari −','Even + · odd −')}</small></div>
      <div><b class="ep-red">♦</b><span>${T('Scoperta','Discovery')}</span><small>${T('Pari + · dispari −','Even + · odd −')}</small></div>
      <div><b>♣</b><span>${T('Azione','Action')}</span><small>${T('Un tentativo','An attempt')}</small></div>
      <div><b>♠</b><span>${T('Ostacolo','Obstacle')}</span><small>${T('Una difficoltà','A difficulty')}</small></div>
    </div>
    <div class="ep-game-ref-footer"><span><b>J</b> ${T('Oggetto','Object')}</span><span><b>Q</b> ${T('Personaggio','Character')}</span><span><b>K</b> ${T('Luogo','Place')}</span><span><b>A</b> ${T('Svolta','Twist')}</span></div>
    <p class="ep-game-ref-colors">${T('Figure/assi: rosso positivo · nero negativo.','Face cards/aces: red positive · black negative.')}</p>
    <p class="ep-game-ref-how"><b>${T('«E COME?»','“BUT HOW?”')}</b> ${T('Ogni novità deve collegarsi direttamente a un elemento già presente nella storia.','Every new addition must connect directly to an element already in the story.')}</p>
    <p class="ep-game-ref-end">${T('Finale: con l’ultima carta, non pescare e chiudi nella stessa scena verso il tuo obiettivo.','Ending: with your last card, do not draw and finish in the same scene towards your goal.')}</p>
  </section>`;

  const oldHome = S.homeMarkup;
  S.homeMarkup = () => {
    let html = oldHome();
    html = html.replace('<b>Inizia da qui</b><small>Tutorial completo, passo per passo.</small>',
      '<b>'+T('Impara a giocare','Learn to play')+'</b><small>'+T('Una presentazione animata, carta dopo carta.','An animated presentation, card by card.')+'</small>');
    html = html.replace('<b>Regole complete</b><small>Riferimento rapido durante la partita.</small>',
      '<b>'+T('Regolamento completo','Complete rulebook')+'</b><small>'+T('Il manuale tecnico con indice e stampa PDF.','The indexed technical manual, printable as PDF.')+'</small>');
    return html;
  };

  window.EpoiLearning = Object.freeze({
    openPresentation: () => view('deck'),
    openRulebook: () => view('manual'),
    openQuick: () => view('quick'),
    close,
    slideCount: slides.length
  });
})();