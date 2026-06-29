$$('.mode-card').forEach(button=>button.addEventListener('click',()=>openMode(button.dataset.mode)));

function renderModeScreen(game,html,label='Partita autonoma',options={}){
  const content=`<div class="standalone-flow">${html}</div>`;
  if(window.G52?.screen){
    window.G52.screen(content,label,{scroll:options.scroll!==false,direction:options.direction||'forward'});
    return window.G52.game;
  }
  game.classList.remove('hidden');
  game.innerHTML=content;
  if(options.scroll!==false)scrollToGame();
  return game;
}

function modeHeading(eyebrow,title,description=''){
  return `<div class="screen-heading standalone-heading"><p class="eyebrow">${eyebrow}</p><h2>${title}</h2>${description?`<p>${description}</p>`:''}</div>`;
}

function modeStory(story,seed,title='Le quattro carte della storia'){
  return `<section class="standalone-story-panel"><div class="standalone-section-head"><span>STORIA COMUNE</span><h3>${title}</h3></div>${storyStack(story,seed)}</section>`;
}

function modeActions(primary,secondary=''){
  return `<div class="standalone-actions">${primary}${secondary}</div>`;
}

function autonomousCardHelp(open=false){
  return window.G52?.cardGuideMarkup?.({compact:true,open,title:'Promemoria per leggere le carte fisiche'})||'';
}

function openMode(mode){
  const game=$('#game');game.classList.remove('hidden');
  if(mode==='quick')quickMode(game);
  if(mode==='single')singleMode(game);
  if(mode==='multi')multiMode(game);
  scrollToGame();
}

function quickMode(game){
  const state={mode:'random',cards:{protagonist:randomCard(),situation:randomCard(),problem:randomCard(),goal:randomCard(),objective:randomCard()}};
  function setup(){
    const manual=state.mode==='manual';
    renderModeScreen(game,`${modeHeading('PARTITA AUTONOMA · SOLO GENERATORE','Crea storia e obiettivo in pochi secondi.','Non gestisce i turni: produce soltanto ciò che serve per iniziare.')}
      <section class="standalone-config-panel"><div class="standalone-section-head"><span>SCELTA DELLE CARTE</span><h3>Casuali oppure selezionate da voi</h3></div>${choiceToggle(state.mode)}${manual?`<div class="card-choice-list">${selectorHtml('protagonist','Protagonista','protagonist',state.cards.protagonist)}${selectorHtml('situation','Situazione','situation',state.cards.situation)}${selectorHtml('goal','Obiettivo della storia','objective',state.cards.goal)}${selectorHtml('problem','Problema','problem',state.cards.problem)}${selectorHtml('objective','Obiettivo segreto','objective',state.cards.objective)}</div>`:'<p class="setup-note">L’app pescherà Protagonista, Situazione, Obiettivo della storia, Problema e Obiettivo segreto.</p>'}</section>
      ${modeActions('<button type="button" id="makeQuick" class="main-action">Genera storia e obiettivo</button>','<button type="button" class="secondary-action" data-back-autonomous>Torna alle modalità</button>')}`,'Solo generatore');
    bindChoiceToggle(document,()=>{state.mode='random';setup()},()=>{state.mode='manual';setup()});
    if(manual)bindSelectors(document,state.cards,setup);
    $('#makeQuick').addEventListener('click',()=>{
      const seed=createCode();
      const story=manual?{protagonist:state.cards.protagonist,situation:state.cards.situation,problem:state.cards.problem,goal:state.cards.goal}:storyFromSeed(seed);
      const objective=manual?state.cards.objective:pick(seed,99);
      quickResult(game,seed,story,objective);
    });
    $('[data-back-autonomous]')?.addEventListener('click',()=>window.G52?.freeMenu?.());
  }
  setup();
}

function quickResult(game,seed,story,objective){
  let open=false;
  function draw(local=false){
    renderModeScreen(game,`${modeHeading('SOLO GENERATORE','Storia pronta.','Leggete insieme le quattro carte; l’obiettivo resta privato.')}
      <div class="standalone-code-row"><span>CODICE</span><button type="button" id="copyQuickCode" class="game-code">${seed}</button></div>
      ${modeStory(story,seed)}
      <section class="standalone-secret-panel"><div class="standalone-section-head"><span>CARTA PRIVATA</span><h3>Obiettivo segreto</h3></div><div class="secret-card${open?' open':''}">${open?secretContent(objective):secretClosed()}</div></section>
      ${modeActions(`<button type="button" id="quickReveal" class="main-action">${open?'Nascondi obiettivo':'Rivela obiettivo'}</button>`,'<button type="button" id="quickAgain" class="secondary-action">Genera un’altra storia</button>')}`,'Solo generatore',{scroll:!local});
    $('#copyQuickCode').addEventListener('click',()=>copyText(seed,'Codice copiato'));
    $('#quickReveal').addEventListener('click',()=>{open=!open;draw(true)});
    $('#quickAgain').addEventListener('click',()=>quickMode(game));
  }
  draw();
}

const SINGLE_KEY='storia52_single_session_v2';
function loadSingle(){try{return JSON.parse(localStorage.getItem(SINGLE_KEY)||'null')}catch{return null}}
function saveSingle(state){localStorage.setItem(SINGLE_KEY,JSON.stringify(state))}
function clearSingle(){localStorage.removeItem(SINGLE_KEY)}

function singleMode(game){
  const saved=loadSingle();
  const state={count:4,seed:createCode(),mode:'random',cards:{protagonist:randomCard(),situation:randomCard(),problem:randomCard(),goal:randomCard()},objectives:Array.from({length:10},()=>randomCard())};
  function setup(){
    const manual=state.mode==='manual';
    const objectiveSelectors=manual?Array.from({length:state.count},(_,index)=>selectorHtml(`objective${index}`,`Obiettivo giocatore ${index+1}`,'objective',state.objectives[index])).join(''):'';
    renderModeScreen(game,`${modeHeading('PARTITA AUTONOMA · TELEFONO AL CENTRO','Prepara storia e obiettivi.','L’app distribuisce i contenuti; il gruppo gestisce i turni usando il regolamento nella barra in alto.')}
      ${saved?'<div class="resume-box unified-resume"><div><span>PARTITA SALVATA</span><b>Riprendi la configurazione precedente</b></div><button type="button" id="resumeSingle" class="secondary-action">Riprendi</button></div>':''}
      <section class="standalone-config-panel"><div class="form-grid"><label class="field"><span>Numero giocatori</span><input id="playerCount" type="number" min="2" max="10" value="${state.count}" inputmode="numeric"></label><label class="field"><span>Codice partita</span><input id="singleCode" value="${state.seed}" maxlength="12" autocapitalize="characters"></label></div></section>
      <section class="standalone-config-panel"><div class="standalone-section-head"><span>CARTE DELLA PARTITA</span><h3>Casuali oppure scelte manualmente</h3></div>${choiceToggle(state.mode)}${manual?`<div class="card-choice-list">${selectorHtml('protagonist','Protagonista','protagonist',state.cards.protagonist)}${selectorHtml('situation','Situazione','situation',state.cards.situation)}${selectorHtml('goal','Obiettivo della storia','objective',state.cards.goal)}${selectorHtml('problem','Problema','problem',state.cards.problem)}${objectiveSelectors}</div>`:'<p class="setup-note">L’app pescherà le quattro carte della storia e un obiettivo segreto per ogni giocatore.</p>'}</section>
      ${modeActions('<button type="button" id="startSingle" class="main-action">Crea la partita</button>','<button type="button" id="regenSingleCode" class="secondary-action">Cambia codice</button>')}`,'Telefono al centro');
    $('#resumeSingle')?.addEventListener('click',()=>renderSingleDashboard(game,saved));
    $('#playerCount').addEventListener('change',event=>{state.count=Math.max(2,Math.min(10,Number(event.target.value)||4));setup()});
    $('#singleCode').addEventListener('input',event=>{state.seed=event.target.value.toUpperCase()});
    $('#regenSingleCode').addEventListener('click',()=>{state.seed=createCode();setup()});
    bindChoiceToggle(document,()=>{state.mode='random';setup()},()=>{state.mode='manual';setup()});
    if(manual){
      const map={protagonist:state.cards.protagonist,situation:state.cards.situation,goal:state.cards.goal,problem:state.cards.problem};
      state.objectives.slice(0,state.count).forEach((card,index)=>map[`objective${index}`]=card);
      bindSelectors(document,map,()=>{
        state.cards.protagonist=map.protagonist;state.cards.situation=map.situation;state.cards.goal=map.goal;state.cards.problem=map.problem;
        for(let index=0;index<state.count;index++)state.objectives[index]=map[`objective${index}`];
        setup();
      });
    }
    $('#startSingle').addEventListener('click',()=>{
      const seed=(state.seed.trim()||createCode()).toUpperCase();
      const story=manual?state.cards:storyFromSeed(seed);
      const objectives=Array.from({length:state.count},(_,index)=>manual?state.objectives[index]:objectiveFromSeed(seed,index+1));
      const session={seed,count:state.count,story,objectives,viewed:Array(state.count).fill(false)};
      saveSingle(session);
      renderSingleDashboard(game,session);
    });
  }
  setup();
}

function renderSingleDashboard(game,session){
  session.story=withStoryGoal(session.story,session.seed);saveSingle(session);
  const players=session.objectives.map((_,index)=>`<button type="button" class="player-slot${session.viewed[index]?' viewed':''}" data-player="${index}"><span>${index+1}</span><p><b>Giocatore ${index+1}</b><small>${session.viewed[index]?'Obiettivo già aperto':'Obiettivo nascosto'}</small></p><i>${session.viewed[index]?'Riapri':'Apri'}</i></button>`).join('');
  renderModeScreen(game,`${modeHeading('PARTITA AUTONOMA · TELEFONO AL CENTRO','Storia comune e obiettivi privati.','Prima leggete insieme la storia, poi passate il telefono a un giocatore alla volta.')}
    <div class="standalone-code-row"><span>CODICE</span><button type="button" id="copySingleCode" class="game-code">${escapeHtml(session.seed)}</button></div>
    ${modeStory(session.story,session.seed)}
    <div class="autonomous-next-step"><span>DOPO GLI OBIETTIVI</span><b>Distribuite 5 carte fisiche a testa.</b><p>Gestite i turni al tavolo. Il regolamento completo resta nel pulsante “Regole” in alto.</p></div>
    ${autonomousCardHelp(false)}
    <div class="section-minihead"><h3>Scegli il giocatore</h3><p>Solo il giocatore indicato deve guardare lo schermo.</p></div><div class="player-list">${players}</div>
    <button type="button" id="newSingle" class="text-action">Crea una nuova partita</button>`,'Telefono al centro');
  $('#copySingleCode').addEventListener('click',()=>copyText(session.seed,'Codice copiato'));
  $$('.player-slot').forEach(button=>button.addEventListener('click',()=>renderSinglePlayer(game,session,Number(button.dataset.player))));
  $('#newSingle').addEventListener('click',()=>{clearSingle();singleMode(game)});
}

function renderSinglePlayer(game,session,index){
  let open=false;const objective=session.objectives[index];
  function draw(local=false){
    renderModeScreen(game,`${modeHeading(`GIOCATORE ${index+1}`,'Il tuo obiettivo segreto.','Gli altri distolgono lo sguardo. Questa carta non fa parte della mano fisica.')}
      <div class="secret-card${open?' open':''}">${open?secretContent(objective):secretClosed(`Passa il telefono al giocatore ${index+1}`,'Gli altri devono distogliere lo sguardo.')}</div>
      ${modeActions(`<button type="button" id="singlePlayerReveal" class="main-action">${open?'Nascondi':'Rivela obiettivo'}</button>`,'<button type="button" id="singlePlayerBack" class="secondary-action">Torna ai giocatori</button>')}`,'Obiettivo privato',{scroll:!local});
    $('#singlePlayerReveal').addEventListener('click',()=>{open=!open;if(open){session.viewed[index]=true;saveSingle(session)}draw(true)});
    $('#singlePlayerBack').addEventListener('click',()=>renderSingleDashboard(game,session));
  }
  draw();
}

const MULTI_PREFIX='storia52_multi_host_';
function multiMode(game){
  const invite=readInvite();
  if(invite){showMulti(game,invite);return}
  multiHostSetup(game);
}
function readInvite(){
  const params=new URLSearchParams(location.search);const seed=params.get('room'),player=Number(params.get('player'));
  if(!seed||!player)return null;
  return{seed:seed.toUpperCase(),player,story:parseStory(params.get('story'),seed)||storyFromSeed(seed),objective:parseCard(params.get('objective'))||objectiveFromSeed(seed,player)};
}
function multiHostSetup(game){
  const state={seed:createCode(),mode:'random',cards:{protagonist:randomCard(),situation:randomCard(),problem:randomCard(),goal:randomCard()}};
  function setup(){
    const manual=state.mode==='manual';
    renderModeScreen(game,`${modeHeading('PARTITA AUTONOMA · INVITI PERSONALI','Crea la stanza e gli inviti.','Ogni link contiene già numero del giocatore, storia comune e obiettivo privato.')}
      <section class="standalone-config-panel"><label class="field"><span>Codice partita</span><input id="multiSeed" value="${state.seed}" maxlength="12" autocapitalize="characters"></label></section>
      <section class="standalone-config-panel"><div class="standalone-section-head"><span>CARTE DELLA STORIA</span><h3>Casuali oppure scelte manualmente</h3></div>${choiceToggle(state.mode)}${manual?`<div class="card-choice-list">${selectorHtml('protagonist','Protagonista','protagonist',state.cards.protagonist)}${selectorHtml('situation','Situazione','situation',state.cards.situation)}${selectorHtml('goal','Obiettivo della storia','objective',state.cards.goal)}${selectorHtml('problem','Problema','problem',state.cards.problem)}</div>`:'<p class="setup-note">Le quattro carte della storia saranno generate dal codice partita.</p>'}</section>
      ${modeActions('<button type="button" id="createMultiRoom" class="main-action">Crea stanza</button>','<button type="button" id="regenMultiSeed" class="secondary-action">Cambia codice</button>')}`,'Inviti personali');
    $('#multiSeed').addEventListener('input',event=>state.seed=event.target.value.toUpperCase());
    $('#regenMultiSeed').addEventListener('click',()=>{state.seed=createCode();setup()});
    bindChoiceToggle(document,()=>{state.mode='random';setup()},()=>{state.mode='manual';setup()});
    if(manual)bindSelectors(document,state.cards,setup);
    $('#createMultiRoom').addEventListener('click',()=>{
      const seed=(state.seed.trim()||createCode()).toUpperCase();const story=manual?state.cards:storyFromSeed(seed);
      const saved=loadMultiHost(seed);const host={seed,story,nextPlayer:saved?.nextPlayer||1,assigned:saved?.assigned||[]};saveMultiHost(host);renderMultiLobby(game,host);
    });
  }
  setup();
}
function loadMultiHost(seed){try{return JSON.parse(localStorage.getItem(MULTI_PREFIX+seed)||'null')}catch{return null}}
function saveMultiHost(host){localStorage.setItem(MULTI_PREFIX+host.seed,JSON.stringify(host))}
function makeInviteUrl(host,player,objective){
  const url=new URL(location.href);url.search='';url.hash='play';url.searchParams.set('room',host.seed);url.searchParams.set('player',String(player));url.searchParams.set('story',serializeStory(withStoryGoal(host.story,host.seed)));url.searchParams.set('objective',serializeCard(objective));return url.toString();
}
function renderMultiLobby(game,host){
  host.story=withStoryGoal(host.story,host.seed);saveMultiHost(host);
  const state={objectiveMode:'random',objective:randomCard(),lastInvite:null};
  function draw(local=false){
    const assigned=host.assigned.length?host.assigned.map(item=>`<span class="assigned-chip">Giocatore ${item.player} · ${item.card}</span>`).join(''):'<span class="setup-note">Nessun invito creato.</span>';
    renderModeScreen(game,`${modeHeading('PARTITA AUTONOMA · INVITI PERSONALI','Stanza pronta.','Condividi un link diverso con ogni giocatore.')}
      <div class="standalone-code-row"><span>CODICE STANZA</span><button type="button" id="copyHostCode" class="game-code">${host.seed}</button></div>
      ${modeStory(host.story,host.seed)}
      <div class="autonomous-next-step"><span>QUANDO TUTTI HANNO IL LINK</span><b>Leggete la storia e distribuite 5 carte fisiche a testa.</b><p>La gestione dei turni resta al tavolo; il regolamento è sempre nella barra in alto.</p></div>
      <section class="standalone-config-panel invite-panel"><div class="next-player"><span>PROSSIMO INVITO</span><strong>Giocatore ${host.nextPlayer}</strong></div><div class="setup-section"><b>Obiettivo del prossimo giocatore</b>${choiceToggle(state.objectiveMode)}${state.objectiveMode==='manual'?`<div class="card-choice-list">${selectorHtml('objective','Obiettivo','objective',state.objective)}</div>`:'<p class="setup-note">L’obiettivo sarà pescato automaticamente e inserito nel link privato.</p>'}</div>${modeActions(`<button type="button" id="createInvite" class="main-action">Crea invito giocatore ${host.nextPlayer}</button>`,'<button type="button" id="resetPlayers" class="secondary-action">Ricomincia da 1</button>')}${state.lastInvite?`<div class="invite-ready"><b>Invito giocatore ${state.lastInvite.player} pronto</b><p>Numero, storia e obiettivo sono già dentro il link.</p>${modeActions('<button type="button" id="shareInvite" class="main-action">Condividi invito</button>','<button type="button" id="copyInvite" class="secondary-action">Copia link</button>')}</div>`:''}<div class="assigned-list">${assigned}</div></section>
      <button type="button" id="backMultiSetup" class="text-action">Crea una nuova stanza</button>`,'Inviti personali',{scroll:!local});
    $('#copyHostCode').addEventListener('click',()=>copyText(host.seed,'Codice copiato'));
    bindChoiceToggle(document,()=>{state.objectiveMode='random';draw(true)},()=>{state.objectiveMode='manual';draw(true)});
    if(state.objectiveMode==='manual'){
      const map={objective:state.objective};bindSelectors(document,map,()=>{state.objective=map.objective;draw(true)});
    }
    $('#createInvite').addEventListener('click',()=>{
      const player=host.nextPlayer;const objective=state.objectiveMode==='manual'?state.objective:objectiveFromSeed(host.seed,player);
      const url=makeInviteUrl(host,player,objective);state.lastInvite={player,url};host.assigned.push({player,card:cardLabel(objective)});host.nextPlayer+=1;saveMultiHost(host);draw(true);
    });
    $('#shareInvite')?.addEventListener('click',()=>shareInvite(state.lastInvite));
    $('#copyInvite')?.addEventListener('click',()=>copyText(state.lastInvite.url,'Link invito copiato'));
    $('#resetPlayers').addEventListener('click',()=>{host.nextPlayer=1;host.assigned=[];state.lastInvite=null;saveMultiHost(host);draw(true)});
    $('#backMultiSetup').addEventListener('click',()=>multiHostSetup(game));
  }
  draw();
}
function shareInvite(invite){
  const text=`STORIA 52 · Invito giocatore ${invite.player}`;
  if(navigator.share)navigator.share({title:'STORIA 52',text,url:invite.url}).catch(()=>{});else copyText(`${text}\n${invite.url}`,'Invito copiato');
}
function showMulti(game,invite){
  let open=false;
  function draw(local=false){
    renderModeScreen(game,`${modeHeading(`GIOCATORE ${invite.player}`,'Storia comune e obiettivo privato.','Leggi la storia insieme agli altri; rivela l’obiettivo soltanto quando sei da solo.')}
      <div class="standalone-code-row"><span>CODICE</span><span class="game-code">${invite.seed}</span></div>
      ${modeStory(invite.story,invite.seed)}
      <section class="standalone-secret-panel"><div class="standalone-section-head"><span>CARTA PRIVATA</span><h3>Il tuo obiettivo segreto</h3></div><div class="secret-card${open?' open':''}">${open?secretContent(invite.objective):secretClosed()}</div></section>
      ${autonomousCardHelp(false)}
      ${modeActions(`<button type="button" id="multiReveal" class="main-action">${open?'Nascondi obiettivo':'Rivela obiettivo'}</button>`,'<button type="button" id="leaveInvite" class="secondary-action">Esci dall’invito</button>')}`,'Invito personale',{scroll:!local});
    $('#multiReveal').addEventListener('click',()=>{open=!open;draw(true)});
    $('#leaveInvite').addEventListener('click',()=>{const url=new URL(location.href);url.search='';url.hash='play';history.replaceState(null,'',url);window.__storia52DirectInvite=null;window.G52?.freeMenu?.()||multiHostSetup(game)});
  }
  draw();
}

prepareStaticDom();initTheme();renderBrowser();
$('#randomCard').addEventListener('click',()=>{browserState.type=typeKeys[Math.floor(Math.random()*typeKeys.length)];browserState.suit=suitKeys[Math.floor(Math.random()*suitKeys.length)];browserState.number=2+Math.floor(Math.random()*9);renderBrowser()});
$('#copyCard').addEventListener('click',()=>{const suit=SUITS[browserState.suit],text=DATA[browserState.type][browserState.suit][browserState.number-2];copyText(`${browserState.number}${suit.symbol} - ${TYPES[browserState.type]}: ${text}`)});

const requestedPage=location.hash.slice(1);if(['play','cards','rules'].includes(requestedPage))openPage(requestedPage);
const directInvite=readInvite();if(directInvite)window.__storia52DirectInvite=directInvite;
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}))}
