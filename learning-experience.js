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

  const step = (n, title, body) => '<div class="ep-doc-step"><span class="ep-doc-step-num">'+n+'</span><div><h3>'+T(title[0],title[1])+'</h3><p>'+T(body[0],body[1])+'</p></div></div>';
  const sectionNote = (labelIt, labelEn, textIt, textEn) => '<div class="ep-doc-margin-note"><strong>'+T(labelIt,labelEn)+'</strong><p>'+T(textIt,textEn)+'</p></div>';
  const ruleSections = () => [
    {id:'overview',label:T('Il gioco','The game'),html:ruleSection('overview','01','Una storia, tanti finali','One story, many endings',
      '<p class="ep-doc-lead">'+T('Inventate una storia insieme. Il bello è che nessuno sa come andrà a finire: ognuno ha un obiettivo segreto e cerca di arrivarci usando le carte.','You tell a story together. The fun is that no one knows how it will end: everyone has a secret goal and uses their cards to get there.')+'</p>'+
      para('Il primo pezzo della storia è già scritto: si chiama <strong>incipit</strong>. Leggetelo ad alta voce. Tutto quello che contiene — persone, luoghi, oggetti e fatti — esiste già e può tornare utile nei turni successivi.','The opening is already written. Read it aloud. Everything in it — people, places, objects and events — is already part of the story and can matter later.')+
      '<div class="ep-doc-three"><div><b>01</b><span>'+T('Una storia per tutti','One shared story')+'</span></div><div><b>02</b><span>'+T('Una carta per turno','One card per turn')+'</span></div><div><b>03</b><span>'+T('Un finale segreto a testa','A secret ending each')+'</span></div></div>')},
    {id:'setup',label:T('Prima di iniziare','Before you play'),html:ruleSection('setup','02','Preparate il tavolo','Get ready',
      '<div class="ep-doc-setup-grid"><div><span>52</span><b>'+T('CARTE FRANCESI','STANDARD CARDS')+'</b><small>'+T('Senza jolly','No jokers')+'</small></div><div><span>2–8</span><b>'+T('GIOCATORI','PLAYERS')+'</b><small>'+T('Una storia condivisa','One shared story')+'</small></div></div>'+
      step('1',['Scegliete una storia','Pick a story'],['Leggete insieme l’incipit. Sarà il punto di partenza per tutti.','Read the opening together. That is everyone’s starting point.'])+
      step('2',['Preparate le carte','Get the cards ready'],['Con il mazzo fisico mescolate le 52 carte e date 5 carte a testa. Con le carte virtuali il numero cambia: 5 a testa in 2–3, 4 in 4, 3 in 5–8.','With a physical deck, shuffle 52 cards and deal 5 to each player. The virtual deck deals 5 each for 2–3 players, 4 for 4, and 3 for 5–8.'])+
      step('3',['Tenete segreto l’obiettivo','Keep your goal hidden'],['Ognuno legge solo il proprio. Non mostratelo e non ditelo agli altri.','Each person reads only their own. Do not show it or tell anyone.'])+
      step('4',['Decidete chi comincia','Pick who goes first'],['Scegliete il primo giocatore. Da lì, proseguite sempre nello stesso ordine.','Choose the first player. Keep taking turns in the same order.'])+
      sectionNote('Due modi di giocare','Two ways to play','Se usate le carte virtuali, l’app guida i turni. Con il mazzo fisico fate voi cambi, scarti e pescate.','The app guides each virtual-card turn. With physical cards, you handle exchanges, discards and draws yourselves.'))},
    {id:'turn',label:T('Il turno','Your turn'),html:ruleSection('turn','03','Quando tocca a te','On your turn',
      '<p class="ep-doc-lead">'+T('Cambia, gioca, racconta. Poi scegli se pescare.','Exchange, play, tell the scene. Then decide whether to draw.')+'</p>'+
      step('1',['Cambia una carta','Exchange a card'],['Se ne hai almeno due, scartane una e pescane una nuova. Se te ne resta una sola, puoi anche tenerla.','If you have at least two, discard one and draw a new one. With only one left, you may keep it.'])+
      step('2',['Gioca una carta','Play a card'],['Mettila sul tavolo. Il suo seme, numero o colore dice che tipo di scena puoi raccontare.','Place it on the table. Its suit, number or colour tells you what kind of scene to tell.'])+
      step('3',['Racconta cosa succede','Tell what happens'],['Aggiungi un solo passaggio alla storia. Parti da qualcosa che c’è già e usa il significato della carta.','Add one development to the story. Start from something already there and follow your card.'])+
      step('4',['Pesca oppure passa','Draw or pass'],['Puoi pescare una carta o finire il turno senza pescare. Con l’ultima carta puoi provare a chiudere la storia.','You can draw a card or finish without drawing. If you just played your last card, you can try to end the story.'])+
      sectionNote('Attenzione al cambio','Exchange vs drawing','Il cambio si fa all’inizio, la pesca facoltativa alla fine. Non sono la stessa cosa.','The exchange happens at the start; the optional draw is at the end. They are not the same step.'))},
    {id:'numbers',label:T('Carte numeriche','Number cards'),html:ruleSection('numbers','04','Dal 2 al 10: guarda il seme','Cards 2–10: check the suit',
      '<p class="ep-doc-lead">'+T('Ogni seme fa succedere qualcosa di diverso. Con Cuori e Quadri conta anche se il numero è pari o dispari.','Each suit does something different. For Hearts and Diamonds, even and odd numbers also matter.')+'</p>'+
      '<div class="ep-doc-suit-grid">'+[
        ['♥',['Cuori','Hearts'],['I rapporti tra i personaggi','Relationships between characters'],['Pari: si avvicinano. Dispari: si allontanano.','Even: they grow closer. Odd: they drift apart.'],['♥6 — Il giudice e l’organizzatrice fanno pace.','♥6 — The judge and organiser make up.']],
        ['♦',['Quadri','Diamonds'],['Una scoperta','A discovery'],['Pari: qualcosa di utile. Dispari: una brutta sorpresa.','Even: something useful. Odd: an unwelcome surprise.'],['♦3 — La foto decisiva è venuta sfocata.','♦3 — The crucial photo is blurry.']],
        ['♣',['Fiori','Clubs'],['Un tentativo','An attempt'],['Qualcuno agisce. Non è detto che ci riesca.','Someone takes action. It might not work.'],['♣7 — L’organizzatrice prova ad aprire il deposito.','♣7 — The organiser tries to open the storeroom.']],
        ['♠',['Picche','Spades'],['Un ostacolo','A setback'],['Qualcosa rende la situazione più difficile.','Something makes the situation harder.'],['♠4 — La serratura si inceppa.','♠4 — The lock gets stuck.']]
      ].map(([suit,title,sub,rule,ex])=>'<div class="ep-doc-suit"><span class="ep-doc-suit-symbol '+('♥♦'.includes(suit)?'ep-red':'')+'">'+suit+'</span><div><h3>'+T(title[0],title[1])+'</h3><small>'+T(sub[0],sub[1])+'</small><p>'+T(rule[0],rule[1])+'</p><em>'+T(ex[0],ex[1])+'</em></div></div>').join('')+'</div>')},
    {id:'faces',label:T('Figure e assi','Faces and aces'),html:ruleSection('faces','05','J, Q, K, A: entra qualcosa di nuovo','J, Q, K, A: something new',
      '<p class="ep-doc-lead">'+T('Con queste carte non conta il seme. Guarda la lettera e il colore.','For these cards, ignore the suit. Look at the letter and colour.')+'</p>'+
      '<div class="ep-doc-ranks"><div><b>J</b><span>'+T('Un oggetto','An object')+'</span></div><div><b>Q</b><span>'+T('Un personaggio','A character')+'</span></div><div><b>K</b><span>'+T('Un luogo','A place')+'</span></div><div><b>A</b><span>'+T('Un colpo di scena','A twist')+'</span></div></div>'+
      '<div class="ep-doc-polarity"><div class="is-red"><strong>♥ ♦</strong><h3>'+T('Rosso: aiuta','Red: helps')+'</h3><p>'+T('Il nuovo elemento porta un vantaggio.','The new element brings an advantage.')+'</p></div><div><strong>♣ ♠</strong><h3>'+T('Nero: ostacola','Black: hinders')+'</h3><p>'+T('Il nuovo elemento mette in difficoltà.','The new element makes things harder.')+'</p></div></div>'+
      sectionNote('Una figura, una novità','One card, one new element','Con una Q puoi far arrivare un personaggio. Per farlo agire servirà un’altra carta. Lo stesso vale per oggetti e luoghi.','A Q can introduce a character. Their action needs another card. The same principle applies to objects and places.'))},
    {id:'how',label:T('«E COME?»','“BUT HOW?”'),html:ruleSection('how','06','«E COME?»','“BUT HOW?”',
      '<p class="ep-doc-lead">'+T('Puoi inventare quello che vuoi, ma non può spuntare dal nulla.','You can invent almost anything, but it can’t come from nowhere.')+'</p>'+
      callout('<strong>Ogni cosa nuova deve avere un collegamento diretto con almeno un elemento già presente nella storia.</strong> Vale anche per i fatti dell’incipit.','<strong>Everything new must connect directly to at least one element already in the story.</strong> The opening counts too.')+
      para('Se qualcuno non capisce il collegamento, può chiedere: <strong>«E come?»</strong>. Chi ha giocato spiega chi ha portato l’oggetto, da dove viene il personaggio o che cosa ha causato l’evento.','If someone cannot see the connection, they can ask: <strong>“But how?”</strong> The narrator explains who brought the object, where the character came from, or what caused the event.')+
      '<div class="ep-doc-how-chat"><div><small>J♠</small><p>'+T('«Sul palco c’è un megafono rotto.»','“There’s a broken megaphone on stage.”')+'</p></div><div class="question"><small>'+T('GLI ALTRI','THE OTHERS')+'</small><p>'+T('«E come ci è arrivato?»','“But how did it get there?”')+'</p></div><div><small>'+T('RISPOSTA','ANSWER')+'</small><p>'+T('«L’ha portato l’organizzatrice per la premiazione.»','“The organiser brought it for the awards ceremony.”')+'</p></div></div>'+
      sectionNote('Non è un veto','Not a veto','Non si vota e non si blocca una giocata perché non piace. Basta spiegare il legame. Un dettaglio di retroscena va bene; una seconda azione importante gratis, no. Trovarsi nello stesso luogo non basta.','No voting and no blocking an idea because you dislike it. Explain the link. Background details are fine; a second major action for free is not. Sharing the same location is not enough.')+
      para('Se il collegamento manca, il giocatore completa o cambia la spiegazione. La carta resta giocata.','If the link is missing, the player completes or changes the explanation. The card stays played.'))},
    {id:'ending',label:T('Il finale','The ending'),html:ruleSection('ending','07','Provare a chiudere la storia','Trying to end the story',
      '<p class="ep-doc-lead">'+T('Hai giocato l’ultima carta? Può essere il momento giusto.','Just played your last card? This could be your moment.')+'</p>'+
      step('1',['Non pescare','Do not draw'],['Se vuoi tentare il finale, lascia la mano vuota.','If you want to attempt the ending, leave your hand empty.'])+
      step('2',['Concludi la stessa scena','Finish the same scene'],['Continua quello che hai appena raccontato finché arrivi al tuo obiettivo. Non aggiungere una scena diversa.','Carry on with the scene you just told until it reaches your goal. Do not add a separate scene.'])+
      step('3',['Mostra l’obiettivo','Show your goal'],['Rivelalo agli altri. Devono poter riconoscere che il finale rispetta carta, obiettivo e storia.','Reveal it. The others need to see that your ending follows the card, goal and story.'])+
      step('4',['Si chiude o si continua','End or carry on'],['Se il gruppo accetta, avete finito. Se no, pesca una carta e la storia continua.','If the group accepts, the game ends. Otherwise, draw one card and keep going.'])+
      sectionNote('Niente scorciatoie','No shortcuts','Il finale deve partire da quello che c’è già. Non puoi risolvere tutto facendo comparire all’ultimo una nuova persona, un oggetto o una svolta.','The ending must grow out of what is already there. You cannot solve everything by adding a new person, object or twist out of nowhere.'))},
    {id:'edge',label:T('Dubbi frequenti','Common questions'),html:ruleSection('edge','08','E se succede questo?','What if this happens?',
      '<div class="ep-doc-faq"><div><h3>'+T('Posso far arrivare un personaggio con Q e farlo agire subito?','Can a Q bring in a character and make them act?')+'</h3><p>'+T('No. La Q aggiunge il personaggio. Per farlo agire usi una carta successiva.','No. Q adds the character. A later card makes them act.')+'</p></div>'+
      '<div><h3>'+T('Con Fiori decido anche se l’azione riesce?','Does Clubs guarantee success?')+'</h3><p>'+T('No. Fiori permette un tentativo, non un risultato garantito.','No. Clubs allows an attempt, not guaranteed success.')+'</p></div>'+
      '<div><h3>'+T('Posso inventare qualcosa di assurdo?','Can I invent something ridiculous?')+'</h3><p>'+T('Sì. L’importante è giocare la carta giusta e collegare la novità direttamente alla storia.','Yes. Play the right card and link the new element directly to the story.')+'</p></div>'+
      '<div><h3>'+T('«E COME?» richiede una votazione?','Do we vote on “BUT HOW?”?')+'</h3><p>'+T('No. Chi ha giocato chiarisce il collegamento. Nessun voto, nessuna penalità.','No. The narrator explains the connection. No vote, no penalty.')+'</p></div></div>')}
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