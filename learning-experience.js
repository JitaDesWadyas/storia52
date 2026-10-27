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
    {kind:'cover', chapter:['IL GIOCO','THE GAME'], title:['Una storia.<br>Più piani.','One story.<br>Many agendas.'], body:['Inventate una storia insieme. Ma ognuno cerca, in segreto, di portarla verso il proprio finale.','Build a story together. But secretly, everyone is steering it towards a different ending.']},
    {kind:'opening', chapter:['IL PUNTO DI PARTENZA','THE STARTING POINT'], title:['Si parte da un incipit.','Start with an opening.'], body:['Leggete la storia scelta. Personaggi, luoghi e problemi iniziali sono già parte del vostro mondo.','Read your chosen opening. Its characters, places and problems already belong to your world.']},
    {kind:'secret', chapter:['UN OBIETTIVO A TESTA','ONE GOAL EACH'], title:['Stessa storia.<br>Obiettivi segreti.','Same story.<br>Secret goals.'], body:['Ogni giocatore legge soltanto il proprio obiettivo. Non deve annunciarlo agli altri.','Each player reads only their own goal. Do not reveal it to the others.']},
    {kind:'turn', chapter:['IL TURNO','YOUR TURN'], title:['Quattro passaggi.<br>Una scena.','Four steps.<br>One scene.'], body:['Con almeno due carte, cambi prima una carta. Poi ne giochi una, racconti la scena e decidi se pescare.','With two or more cards, exchange one first. Then play one, narrate the scene and decide whether to draw.']},
    {kind:'card', chapter:['CARTE NUMERICHE · 2–10','NUMBER CARDS · 2–10'], title:['Cuori.<br>Relazione.','Hearts.<br>Relationship.'], body:['Pari: un legame migliora. Dispari: un legame peggiora.','Even: a relationship improves. Odd: a relationship worsens.'], rank:'6',suit:'♥', name:['RELAZIONE POSITIVA','POSITIVE RELATIONSHIP'], example:['♥6 — Il sindaco e i tecnici tornano a fidarsi.','♥6 — The mayor and the engineers start trusting each other again.'], alt:['♥5 — Il sindaco litiga con i tecnici.','♥5 — The mayor argues with the engineers.']},
    {kind:'card', chapter:['CARTE NUMERICHE · 2–10','NUMBER CARDS · 2–10'], title:['Quadri.<br>Scoperta.','Diamonds.<br>Discovery.'], body:['Pari: emerge qualcosa di utile. Dispari: emerge qualcosa che complica.','Even: a useful discovery. Odd: a troubling discovery.'], rank:'8',suit:'♦', name:['SCOPERTA POSITIVA','POSITIVE DISCOVERY'], example:['♦8 — Spunta il progetto originale della statua.','♦8 — The original statue blueprint turns up.'],alt:['♦3 — Si scopre una clausola che blocca i lavori.','♦3 — They uncover a clause that halts the work.']},
    {kind:'card', chapter:['CARTE NUMERICHE · 2–10','NUMBER CARDS · 2–10'], title:['Fiori.<br>Azione.','Clubs.<br>Action.'], body:['Un personaggio prova a fare qualcosa di concreto. Non significa riuscirci automaticamente.','A character tries to do something concrete. Success is not automatic.'], rank:'7',suit:'♣', name:['AZIONE','ACTION'], example:['♣7 — Il sindaco prova a nascondere la statua sotto un telo.','♣7 — The mayor tries to hide the statue under a sheet.']},
    {kind:'card', chapter:['CARTE NUMERICHE · 2–10','NUMBER CARDS · 2–10'], title:['Picche.<br>Ostacolo.','Spades.<br>Obstacle.'], body:['Compare un problema che rende la situazione più difficile.','A problem appears and makes things harder.'], rank:'4',suit:'♠', name:['OSTACOLO','OBSTACLE'], example:['♠4 — Il camion necessario per spostare la statua si rompe.','♠4 — The truck needed to move the statue breaks down.']},
    {kind:'card', chapter:['FIGURE · NUOVO ELEMENTO','FACE CARDS · NEW ELEMENT'], title:['J.<br>Un oggetto.','J.<br>An object.'], body:['Metti in gioco un oggetto nuovo. Non racconti anche tutte le azioni che compirà.','Bring a new object into play. Do not also narrate everything it will do.'], rank:'J',suit:'♠', name:['OGGETTO NEGATIVO','NEGATIVE OBJECT'], example:['J♠ — Nella piazza compare un mortaio.','J♠ — A mortar appears in the square.']},
    {kind:'card', chapter:['FIGURE · NUOVO ELEMENTO','FACE CARDS · NEW ELEMENT'], title:['Q.<br>Un personaggio.','Q.<br>A character.'], body:['Introduci una persona nuova. Le sue azioni si giocheranno con le carte successive.','Introduce a new person. Their actions will be played with later cards.'], rank:'Q',suit:'♠',name:['PERSONAGGIO NEGATIVO','NEGATIVE CHARACTER'], example:['Q♠ — Arriva un sicario incaricato di trovare l’artista.','Q♠ — A hitman arrives, hired to find the artist.']},
    {kind:'card', chapter:['FIGURE · NUOVO ELEMENTO','FACE CARDS · NEW ELEMENT'], title:['K.<br>Un luogo.','K.<br>A place.'], body:['Aggiungi un luogo che potrà entrare nella storia. Il luogo non implica automaticamente uno spostamento.','Add a place that can become part of the story. Creating a place does not automatically move the characters there.'],rank:'K',suit:'♥',name:['LUOGO POSITIVO','POSITIVE LOCATION'],example:['K♥ — Si scopre un magazzino libero dove mettere al sicuro la statua.','K♥ — An available warehouse could shelter the statue.']},
    {kind:'card', chapter:['ASSI · SVOLTA','ACES · TWIST'], title:['A.<br>Un colpo di scena.','A.<br>A plot twist.'], body:['Una svolta cambia la situazione. Deve nascere da un elemento già presente, non da una storia separata.','A twist changes the situation. It must stem from something already in the story, not from a separate storyline.'],rank:'A',suit:'♦',name:['SVOLTA POSITIVA','POSITIVE TWIST'],example:['A♦ — L’artista rivela che la statua funziona anche capovolta.','A♦ — The artist reveals that the statue works upside down too.']},
    {kind:'colors',chapter:['FIGURE E ASSI','FACE CARDS AND ACES'],title:['Rosso aiuta.<br>Nero ostacola.','Red helps.<br>Black hinders.'],body:['Su J, Q, K e A conta soltanto il colore. Non applicare anche il significato del seme.','For J, Q, K and A, only colour counts. Do not also apply the suit meaning.']},
    {kind:'connect',chapter:['LA REGOLA CHE UNISCE TUTTO','THE RULE THAT TIES IT TOGETHER'],title:['«E COME?»','“BUT HOW?”'],body:['Ogni cosa che aggiungi deve collegarsi direttamente a un elemento già presente nella storia. Qualcuno può chiederti di spiegare il collegamento.','Everything you add must connect directly to an element already in the story. Anyone may ask you to explain that connection.']},
    {kind:'ending',chapter:['CHIUDERE LA STORIA','ENDING THE STORY'],title:['La tua ultima carta.<br>Il tuo finale.','Your last card.<br>Your ending.'],body:['Dopo aver giocato l’ultima carta, senza pescare, puoi continuare quella stessa scena fino al tuo obiettivo segreto. Poi lo riveli.','After playing your final card, without drawing, you may continue that same scene to your secret goal. Then reveal it.']},
    {kind:'summary',chapter:['SEI PRONTO','YOU ARE READY'],title:['E poi?<br>Si gioca.','And then?<br>Play.'],body:['Una carta, una scena. Ogni novità si collega direttamente a qualcosa che esiste già. Il tuo obiettivo resta segreto.','One card, one scene. Every new detail connects directly to something already there. Keep your goal secret.']}
  ];

  const card = (rank, suit, mini = false) => '<div class="ep-playing-card '+('♥♦'.includes(suit)?'red':'black')+(mini?' tiny':'')+'" aria-label="'+esc(rank+suit)+'"><span class="ep-pc-corner">'+esc(rank)+'<i>'+esc(suit)+'</i></span><span class="ep-pc-center">'+esc(suit)+'</span><span class="ep-pc-corner bottom">'+esc(rank)+'<i>'+esc(suit)+'</i></span></div>';
  const example = (label, value) => '<div class="ep-example"><span>'+esc(label)+'</span><p>'+fmt(value)+'</p></div>';

  function visualFor(slide) {
    switch (slide.kind) {
      case 'cover':
        return '<div class="ep-cover-art"><div class="ep-cover-orbit orbit-one"></div><div class="ep-cover-orbit orbit-two"></div><div class="ep-cover-card one">'+card('Q','♠')+'</div><div class="ep-cover-card two">'+card('7','♥')+'</div><div class="ep-cover-card three">'+card('A','♦')+'</div><span class="ep-cover-stamp">E POI<span>?</span></span></div>';
      case 'opening':
        return '<div class="ep-story-sheet"><span class="ep-sheet-kicker">'+T('INCIPIT · LA STATUA AL CONTRARIO','OPENING · THE UPSIDE-DOWN STATUE')+'</span><h3>'+T('Una statua.<br>Un errore enorme.','One statue.<br>One enormous mistake.')+'</h3><p>'+T('La nuova statua viene montata capovolta poche ore prima dell’inaugurazione. Il sindaco cerca di salvare la faccia.','The new statue is installed upside down hours before the unveiling. The mayor tries to save face.')+'</p><div class="ep-sheet-tags"><span>'+T('STATUA','STATUE')+'</span><span>'+T('SINDACO','MAYOR')+'</span><span>'+T('PIAZZA','SQUARE')+'</span></div></div>';
      case 'secret':
        return '<div class="ep-secret-stack"><div class="ep-secret-card"><span>01 / '+T('SEGRETO','SECRET')+'</span><b>'+T('Far difendere la statua al sindaco','Make the mayor defend the statue')+'</b></div><div class="ep-secret-card"><span>02 / '+T('SEGRETO','SECRET')+'</span><b>'+T('Far ammettere il vero errore','Expose the real mistake')+'</b></div><div class="ep-secret-card"><span>03 / '+T('SEGRETO','SECRET')+'</span><b>'+T('Salvare l’inaugurazione','Save the unveiling')+'</b></div><p>'+T('Nella partita vera vedi solo il tuo.','In a real game you see only yours.')+'</p></div>';
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
        return '<div class="ep-connect-art"><div class="ep-dialog-bubble first"><small>J♠</small><b>'+T('«In piazza c’è un mortaio!»','“There is a mortar in the square!”')+'</b></div><div class="ep-dialog-bubble ask">'+T('«E come ci è arrivato?»','“But how did it get there?”')+'</div><div class="ep-dialog-bubble answer"><b>'+T('«Lo ha portato il camion che aveva trasportato la statua.»','“The truck that delivered the statue brought it.”')+'</b><span>'+T('COLLEGAMENTO DIRETTO: CAMION / STATUA','DIRECT LINK: TRUCK / STATUE')+'</span></div></div>';
      case 'ending':
        return '<div class="ep-ending-art">'+card('8','♦')+'<div class="ep-ending-arrow">→</div><div class="ep-final-note"><small>'+T('OBIETTIVO SEGRETO','SECRET GOAL')+'</small><b>'+T('Far ammettere il vero errore','Expose the real mistake')+'</b><p>'+T('La scena dell’ultima carta porta al finale.','The final card’s scene leads to the ending.')+'</p></div></div>';
      case 'summary':
        return '<div class="ep-summary-art"><div><strong>♥</strong>'+T('Relazione','Relationship')+'</div><div><strong>♦</strong>'+T('Scoperta','Discovery')+'</div><div><strong>♣</strong>'+T('Azione','Action')+'</div><div><strong>♠</strong>'+T('Ostacolo','Obstacle')+'</div><div><strong>J Q K A</strong>'+T('Oggetto · Persona · Luogo · Svolta','Object · Person · Place · Twist')+'</div></div>';
      default: return '';
    }
  }

  function stageDetail(slide) {
    if (slide.kind === 'card') return '<div class="ep-stage-examples">'+example(T('ESEMPIO','EXAMPLE'), slide.example)+(slide.alt?example(T('ALTRO ESEMPIO','ANOTHER EXAMPLE'),slide.alt):'')+'</div>';
    if (slide.kind === 'connect') return '<div class="ep-stage-rule"><b>'+T('NON SERVE UN VOTO','NO VOTE NEEDED')+'</b><p>'+T('Indica un personaggio, luogo, oggetto o fatto già narrato e spiega il legame diretto. Puoi chiarire il retroscena, ma non aggiungere altre azioni principali gratis.','Name a previously established person, place, object or fact, and explain the direct link. Background detail is fine; extra major actions are not free.')+'</p></div>';
    if (slide.kind === 'colors') return '<div class="ep-stage-rule"><b>'+T('SOLO J, Q, K E A','ONLY J, Q, K AND A')+'</b><p>'+T('Per i numeri 2–10 usi invece il seme; Cuori e Quadri dipendono anche dalla parità.','Number cards 2–10 use their suit; Hearts and Diamonds also depend on whether the number is even or odd.')+'</p></div>';
    if (slide.kind === 'ending') return '<div class="ep-stage-rule"><b>'+T('IL GRUPPO VERIFICA','THE GROUP CHECKS')+'</b><p>'+T('Se il finale rispetta carta, obiettivo e fatti già narrati, la partita finisce. Altrimenti peschi una carta e continuate.','If the ending follows the card, goal and established facts, the game ends. Otherwise draw a card and continue.')+'</p></div>';
    return '';
  }

  let host = null;
  let activeMode = 'deck';
  let index = 0;
  let previouslyFocused = null;
  let touchStart = null;

  function deckMarkup() {
    const slide = slides[index];
    return '<div class="ep-deck"><div class="ep-progress-top"><span>'+fmt(slide.chapter)+'</span><span class="ep-slide-number">'+String(index+1).padStart(2,'0')+' <i>/</i> '+String(slides.length).padStart(2,'0')+'</span></div><div class="ep-progress-line" role="progressbar" aria-label="'+T('Avanzamento tutorial','Tutorial progress')+'" aria-valuemin="1" aria-valuemax="'+slides.length+'" aria-valuenow="'+(index+1)+'"><span style="width:'+((index+1)/slides.length*100)+'%"></span></div><div class="ep-stage ep-stage-'+slide.kind+'" data-swap><div class="ep-stage-copy"><span class="ep-serial">E POI? / '+String(index+1).padStart(2,'0')+'</span><h2>'+L(slide.title)+'</h2><p>'+fmt(slide.body)+'</p>'+stageDetail(slide)+'</div><div class="ep-stage-art" aria-hidden="true">'+visualFor(slide)+'</div></div><div class="ep-deck-bottom"><button type="button" class="ep-button ep-button-ghost" data-action="prev" '+(index===0?'disabled':'')+'><span aria-hidden="true">←</span> '+T('Indietro','Back')+'</button><div class="ep-deck-dots" aria-label="'+T('Vai alla schermata','Jump to slide')+'">'+slides.map((s,i) => '<button type="button" data-slide="'+i+'" class="'+(i===index?'on':'')+'" aria-label="'+T('Schermata ','Slide ')+(i+1)+'" aria-current="'+(i===index?'step':'false')+'"></button>').join('')+'</div><button type="button" class="ep-button ep-button-primary" data-action="'+(index===slides.length-1?'play':'next')+'">'+(index===slides.length-1?T('Inizia una partita','Start a game'):T('Avanti','Next'))+' <span aria-hidden="true">→</span></button></div></div>';
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
      '<tr><td><b>♣ '+T('Fiori','Clubs')+'</b></td><td>'+T('Azione: un personaggio prova a fare qualcosa.','Action: a character attempts something.')+'</td><td>'+T('♣7: il sindaco tenta di nascondere la statua.','♣7: the mayor attempts to hide the statue.')+'</td></tr>'+
      '<tr><td><b>♠ '+T('Picche','Spades')+'</b></td><td>'+T('Ostacolo: un problema rende tutto più difficile.','Obstacle: a problem makes things harder.')+'</td><td>'+T('♠4: il camion si rompe.','♠4: the truck breaks down.')+'</td></tr>'+
      '</tbody></table></div>'+callout('<strong>Fiori è un tentativo.</strong> Giocare ♣ non garantisce automaticamente un esito o il controllo delle azioni successive.','<strong>Clubs is an attempt.</strong> Playing ♣ does not automatically guarantee an outcome or control of subsequent actions.'))},
    {id:'faces',label:T('Figure e assi','Face cards and aces'),html:ruleSection('faces','05','Figure e assi: J, Q, K, A','Face cards and aces: J, Q, K, A',
      '<div class="ep-doc-ranks"><div><b>J</b><span>'+T('Oggetto nuovo','New object')+'</span></div><div><b>Q</b><span>'+T('Personaggio nuovo','New character')+'</span></div><div><b>K</b><span>'+T('Luogo nuovo','New place')+'</span></div><div><b>A</b><span>'+T('Colpo di scena','Plot twist')+'</span></div></div>'+
      para('Per queste carte guarda valore e colore, non il seme: rosso (♥ ♦) = positivo, nero (♣ ♠) = negativo. Una Q nera introduce un personaggio che ostacola, non anche un’azione di Fiori.','For these cards use rank and colour, not the suit: red (♥ ♦) = positive, black (♣ ♠) = negative. A black Q introduces a character who hinders, not an additional Clubs action.')+
      para('La carta introduce soltanto il suo elemento o la sua svolta. Le azioni importanti e le conseguenze successive vanno costruite nei turni dopo.','The card introduces only its element or its twist. Further major actions and consequences must be built in later turns.'))},
    {id:'how',label:T('La regola «E COME?»','The “BUT HOW?” rule'),html:ruleSection('how','06','«E COME?» — collegamento diretto','“BUT HOW?” — direct connection',
      callout('<strong>Regola obbligatoria:</strong> ogni elemento, evento o fatto nuovo che inserisci deve collegarsi <strong>direttamente ad almeno un elemento già presente nella storia</strong>, compreso l’incipit.','<strong>Mandatory rule:</strong> each new object, event or fact must connect <strong>directly to at least one element already present in the story</strong>, including the opening.')+
      list([
        ['Un altro giocatore può chiedere «E come?», «Chi lo ha portato?» o «Che cosa c’entra?».','Another player can ask “But how?”, “Who brought it?” or “What connects it?”.'],
        ['Chi ha giocato indica concretamente una persona, un oggetto, un luogo, un evento o un fatto già raccontato e spiega il legame diretto.','The narrator identifies an established person, object, place, event or fact and explains the direct link.'],
        ['La spiegazione è parte del racconto: può chiarire il passato o i dettagli, ma non regalare un secondo evento principale o altre azioni che richiederebbero carte.','The explanation is part of the story: it may clarify background details, but cannot grant a second major event or additional actions that require cards.'],
        ['Se manca un collegamento diretto, completa o modifica la spiegazione e la scena; la carta giocata resta quella.','If no direct link exists, complete or adjust the explanation and scene; the played card stays the same.']
      ])+
      '<div class="ep-doc-example"><strong>'+T('ESEMPIO: J♠','EXAMPLE: J♠')+'</strong>'+para('«In piazza compare un mortaio». — «E come?». — «Lo ha portato lo stesso camion usato per trasportare la statua». La statua era già nella storia: il suo trasporto è il collegamento diretto.','“A mortar appears in the square.” — “But how?” — “The truck that transported the statue also delivered it.” The statue was already part of the story: its transport is the direct link.')+'</div>'+
      para('<strong>Non si vota.</strong> La domanda serve a rendere esplicito il collegamento, non a bloccare una scelta perché non piace. Non basta rispondere «è successo per caso» o inventare un’altra trama scollegata.','<strong>There is no vote.</strong> The question exposes the link, not a veto against an idea someone dislikes. “It just happened” or an unrelated invented subplot is not enough.'))},
    {id:'ending',label:T('Finale','Ending'),html:ruleSection('ending','07','Tentare il finale','Attempting an ending',
      list([
        ['Dopo aver giocato la tua ultima carta, puoi scegliere di non pescare e tentare il finale.','After playing your last card, you may choose not to draw and attempt the ending.'],
        ['La stessa scena dell’ultima carta prosegue fino a soddisfare la condizione del tuo obiettivo segreto. Non è una seconda scena separata.','The same scene from your last card continues until it satisfies your secret goal condition. It is not a separate second scene.'],
        ['Rivela il tuo obiettivo. Il finale deve rispettare carta, storia e fatti già presenti; non può introdurre una soluzione nuova dal nulla.','Reveal your goal. The ending must follow the card, story and established facts; it cannot conjure an unrelated new solution.'],
        ['Il gruppo verifica se la chiusura rispetta queste condizioni. Se accettata, la partita finisce. Se rifiutata, pesca 1 carta e si continua.','The group checks these conditions. If accepted, the game ends. If rejected, draw 1 card and continue.']
      ])+para('La chiusura mostrata sull’obiettivo è un esempio di possibile esito, non una frase da ripetere alla lettera.','The ending shown on the goal card is an example, not a script to recite word for word.'))},
    {id:'edge',label:T('Chiarimenti','Clarifications'),html:ruleSection('edge','08','Chiarimenti importanti','Important clarifications',
      '<dl class="ep-doc-faq"><dt>'+T('Una J può introdurre un mortaio?','Can a J introduce a mortar?')+'</dt><dd>'+T('Sì, se il colore corrisponde al suo effetto e il mortaio è collegato direttamente a qualcosa che esiste già. La sua attivazione richiederà un’azione successiva.','Yes, if its colour matches the intended effect and the mortar connects directly to something already present. Firing it requires a later action.')+'</dd>'+
      '<dt>'+T('Posso introdurre un sicario con Q?','Can I introduce a hitman with Q?')+'</dt><dd>'+T('Sì, ma la Q non include automaticamente anche il suo attacco: quel tentativo richiede Fiori in un turno successivo.','Yes, but Q does not also make the hitman attack: that attempt requires a Clubs card on a later turn.')+'</dd>'+
      '<dt>'+T('Se qualcuno chiede «E COME?», si vota?','Does “BUT HOW?” trigger a vote?')+'</dt><dd>'+T('No. Si nomina l’elemento già presente e si spiega il legame diretto. Non è un voto di gradimento.','No. Name the established element and explain the direct link. It is not a popularity vote.')+'</dd>'+
      '<dt>'+T('Posso inventare un retroscena nella spiegazione?','Can I invent background details?')+'</dt><dd>'+T('Sì, solo per spiegare il collegamento. Non per aggiungere gratis altre persone, oggetti, luoghi, svolte o azioni principali.','Yes, to explain the link only. Not to add extra major characters, objects, places, twists or actions for free.')+'</dd></dl>')}
  ];

  function manualMarkup() {
    const sections = ruleSections();
    return '<div class="ep-manual"><aside class="ep-manual-index"><div class="ep-index-label">'+T('INDICE','CONTENTS')+'</div><nav aria-label="'+T('Indice regolamento','Rulebook contents')+'">'+sections.map(s => '<a href="#ep-rule-'+s.id+'" data-section="'+s.id+'">'+esc(s.label)+'</a>').join('')+'</nav><div class="ep-index-bottom">'+T('Versione di consultazione · 2026','Reference edition · 2026')+'</div></aside><div class="ep-manual-scroll"><article class="ep-paper"><header class="ep-paper-cover"><div class="ep-paper-supra">E POI? <span> / 01</span></div><p>'+T('MANUALE DI GIOCO','GAME RULEBOOK')+'</p><h1>'+T('Regolamento<br>completo.','Complete<br>rulebook.')+'</h1><div class="ep-paper-meta"><span>'+T('CARTE · STORIE · OBIETTIVI SEGRETI','CARDS · STORIES · SECRET GOALS')+'</span><span>ED. 2026</span></div></header><div class="ep-paper-body"><div class="ep-doc-intro">'+T('Questo documento è la fonte di riferimento per preparazione, carte, turno, collegamenti narrativi e finale.','This document is the reference for setup, cards, turns, narrative links and endings.')+'</div><nav class="ep-doc-toc" aria-label="'+T('Indice nel documento','Contents within the document')+'"><h2>'+T('Indice','Contents')+'</h2>'+sections.map((s,i)=>'<a href="#ep-rule-'+s.id+'" data-section="'+s.id+'"><span>'+String(i+1).padStart(2,'0')+'</span>'+esc(s.label)+'</a>').join('')+'</nav>'+sections.map(s=>s.html).join('')+'<footer class="ep-paper-end"><b>E POI?</b><span>'+T('Una storia, più piani.','One story, many agendas.')+'</span></footer></div></article></div></div>';
  }

  function quickMarkup() {
    return '<div class="ep-quick"><div class="ep-quick-head"><span>E POI? / '+T('PROMEMORIA','CHEAT SHEET')+'</span><h2>'+T('Tutto in un colpo d’occhio.','Everything at a glance.')+'</h2><p>'+T('Per giocare senza interrompere il ritmo.','Keep the story moving.')+'</p></div><div class="ep-quick-grid"><section><h3>'+T('IL TURNO','YOUR TURN')+'</h3><div class="ep-quick-sequence">'+T('Cambia','Exchange')+' <b>→</b> '+T('Gioca','Play')+' <b>→</b> '+T('Racconta','Narrate')+' <b>→</b> '+T('Pesca o passa','Draw or pass')+'</div><small>'+T('Con 2+ carte: cambio obbligatorio. Con 1: facoltativo.','With 2+ cards: mandatory exchange. With 1: optional.')+'</small></section><section><h3>'+T('CARTE NUMERICHE · 2–10','NUMBER CARDS · 2–10')+'</h3><div class="ep-quick-rules"><div><b class="ep-red">♥</b><strong>'+T('Relazione','Relationship')+'</strong><small>'+T('Pari + / dispari −','Even + / odd −')+'</small></div><div><b class="ep-red">♦</b><strong>'+T('Scoperta','Discovery')+'</strong><small>'+T('Pari + / dispari −','Even + / odd −')+'</small></div><div><b>♣</b><strong>'+T('Azione','Action')+'</strong><small>'+T('Un tentativo','An attempt')+'</small></div><div><b>♠</b><strong>'+T('Ostacolo','Obstacle')+'</strong><small>'+T('Un problema','A problem')+'</small></div></div></section><section><h3>'+T('FIGURE E ASSI','FACE CARDS & ACES')+'</h3><div class="ep-quick-ranks"><span><b>J</b>'+T('Oggetto','Object')+'</span><span><b>Q</b>'+T('Persona','Character')+'</span><span><b>K</b>'+T('Luogo','Place')+'</span><span><b>A</b>'+T('Svolta','Twist')+'</span></div><p>'+T('Rosso = positivo · Nero = negativo','Red = positive · Black = negative')+'</p></section><section class="ep-quick-highlight"><h3>'+T('«E COME?»','“BUT HOW?”')+'</h3><p>'+T('Ogni novità si collega <strong>direttamente a un elemento già presente</strong>. Se qualcuno lo chiede, indica quale e spiega il legame. Nessuna votazione.','Every new detail connects <strong>directly to an existing element</strong>. If asked, name that element and explain the link. No vote.')+'</p></section><section><h3>'+T('IL FINALE','THE ENDING')+'</h3><p>'+T('Gioca l’ultima carta → non pescare → completa la stessa scena verso il tuo obiettivo → rivelalo. Il gruppo verifica le condizioni.','Play your final card → do not draw → continue that same scene to your goal → reveal it. The group checks the conditions.')+'</p></section></div><button class="ep-button ep-button-primary" type="button" data-action="manual">'+T('Apri il manuale completo','Open complete rulebook')+' →</button></div>';
  }

  function shellMarkup() {
    return '<div class="ep-learn-dialog" role="dialog" aria-modal="true" aria-label="'+T('Impara E POI? e consulta le regole','Learn E POI? and browse the rules')+'"><header class="ep-learn-header"><div class="ep-learn-brand">E POI<span>?</span><small>'+T('COME SI GIOCA','HOW TO PLAY')+'</small></div><nav class="ep-learn-tabs" aria-label="'+T('Modalità di apprendimento','Learning views')+'"><button type="button" data-action="deck">'+T('Presentazione','Presentation')+'</button><button type="button" data-action="manual">'+T('Regolamento','Rulebook')+'</button><button type="button" data-action="quick">'+T('Promemoria','Quick guide')+'</button></nav><div class="ep-learn-tools"><button class="ep-learn-print" type="button" data-action="print" title="'+T('Stampa o salva come PDF','Print or save as PDF')+'">'+T('PDF / STAMPA','PDF / PRINT')+'</button><button class="ep-learn-close" type="button" data-action="close" aria-label="'+T('Chiudi','Close')+'">×</button></div></header><main class="ep-learn-content" data-content></main></div>';
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
  }
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
  S.openRulesModal = () => view('manual');
  S.openQuickRules = () => view('quick');

  const oldHome = S.homeMarkup;
  S.homeMarkup = () => {
    let html = oldHome();
    html = html.replace('<b>Inizia da qui</b><small>Tutorial completo, passo per passo.</small>',
      '<b>'+T('Impara a giocare','Learn to play')+'</b><small>'+T('Una presentazione animata, carta dopo carta.','An animated presentation, card by card.')+'</small>');
    html = html.replace('<b>Regole complete</b><small>Riferimento rapido durante la partita.</small>',
      '<b>'+T('Regolamento completo','Complete rulebook')+'</b><small>'+T('Il manuale tecnico con indice e stampa PDF.','The indexed technical manual, printable as PDF.')+'</small>');
    const creator = '<button type="button" class="choice-card creator-menu-card"';
    const quick = '<button type="button" class="choice-card ep-home-quick" data-open-panel="quick"><span class="index">◎</span><span><b>'+T('Promemoria rapido','Quick reference')+'</b><small>'+T('Tutte le carte e i turni a colpo d’occhio.','Cards and turns at a glance.')+'</small></span><i>→</i></button>';
    html = html.replace(creator,quick+creator);
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