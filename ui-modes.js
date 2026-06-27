$$('.mode-card').forEach(button=>button.addEventListener('click',()=>openMode(button.dataset.mode)));
function openMode(mode){
  const game=$('#game');game.classList.remove('hidden');
  if(mode==='quick')quickMode(game);if(mode==='single')singleMode(game);if(mode==='multi')multiMode(game);
  scrollToGame();
}

function quickMode(game){
  const state={mode:'random',cards:{protagonist:randomCard(),situation:randomCard(),problem:randomCard(),goal:randomCard(),objective:randomCard()}};
  function setup(){
    game.innerHTML=`<p class="eyebrow">GENERATORE RAPIDO</p><h2>Come vuoi creare la storia?</h2>${choiceToggle(state.mode)}${state.mode==='manual'?`<div class="card-choice-list">${selectorHtml('protagonist','Protagonista','protagonist',state.cards.protagonist)}${selectorHtml('situation','Situazione','situation',state.cards.situation)}${selectorHtml('goal','Obiettivo della storia','objective',state.cards.goal)}${selectorHtml('problem','Problema','problem',state.cards.problem)}${selectorHtml('objective','Obiettivo segreto','objective',state.cards.objective)}</div>`:'<p class="setup-note">Il sistema pescherà protagonista, situazione, obiettivo della storia, problema e obiettivo segreto.</p>'}<div class="button-row"><button type="button" id="makeQuick" class="button button-primary">Crea storia</button></div>`;
    bindChoiceToggle(game,()=>{state.mode='random';setup()},()=>{state.mode='manual';setup()});
    if(state.mode==='manual')bindSelectors(game,state.cards,setup);
    $('#makeQuick').addEventListener('click',()=>{
      const seed=createCode();const story=state.mode==='manual'?{protagonist:state.cards.protagonist,situation:state.cards.situation,problem:state.cards.problem,goal:state.cards.goal}:storyFromSeed(seed);
      const objective=state.mode==='manual'?state.cards.objective:pick(seed,99);quickResult(game,seed,story,objective);
    });
  }
  setup();
}
function quickResult(game,seed,story,objective){
  let open=false;
  function draw(){
    game.innerHTML=`<div class="game-header"><div><p class="eyebrow">GENERATORE RAPIDO</p><h2>Il vostro incipit</h2></div><span class="game-code">${seed}</span></div>${storyStack(story,seed)}<h3>Obiettivo del giocatore</h3><div class="secret-card${open?' open':''}">${open?secretContent(objective):secretClosed()}</div><div class="button-row"><button type="button" id="quickReveal" class="button button-primary">${open?'Nascondi':'Rivela obiettivo'}</button><button type="button" id="quickAgain" class="button button-dark">Nuova storia</button></div>`;
    $('#quickReveal').addEventListener('click',()=>{open=!open;draw()});$('#quickAgain').addEventListener('click',()=>quickMode(game));
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
    const objectiveSelectors=state.mode==='manual'?Array.from({length:state.count},(_,index)=>selectorHtml(`objective${index}`,`Obiettivo giocatore ${index+1}`,'objective',state.objectives[index])).join(''):'';
    game.innerHTML=`${saved?'<div class="resume-box"><b>Hai una partita salvata.</b><button type="button" id="resumeSingle" class="button button-dark">Riprendi</button></div>':''}<p class="eyebrow">UN SOLO TELEFONO</p><h2>Configura la partita</h2><div class="form-grid"><label class="field"><span>Numero giocatori</span><input id="playerCount" type="number" min="2" max="10" value="${state.count}" inputmode="numeric"></label><label class="field"><span>Codice partita</span><input id="singleCode" value="${state.seed}" maxlength="12" autocapitalize="characters"></label></div><div class="setup-section"><b>Carte della partita</b>${choiceToggle(state.mode)}${state.mode==='manual'?`<div class="card-choice-list">${selectorHtml('protagonist','Protagonista','protagonist',state.cards.protagonist)}${selectorHtml('situation','Situazione','situation',state.cards.situation)}${selectorHtml('goal','Obiettivo della storia','objective',state.cards.goal)}${selectorHtml('problem','Problema','problem',state.cards.problem)}${objectiveSelectors}</div>`:'<p class="setup-note">Incipit, obiettivo della storia e obiettivi segreti saranno pescati automaticamente.</p>'}</div><div class="button-row"><button type="button" id="startSingle" class="button button-primary">Crea partita</button><button type="button" id="regenSingleCode" class="button button-ghost">Cambia codice</button></div>`;
    $('#resumeSingle')?.addEventListener('click',()=>renderSingleDashboard(game,saved));
    $('#playerCount').addEventListener('change',event=>{state.count=Math.max(2,Math.min(10,Number(event.target.value)||4));setup()});
    $('#singleCode').addEventListener('input',event=>{state.seed=event.target.value.toUpperCase()});
    $('#regenSingleCode').addEventListener('click',()=>{state.seed=createCode();setup()});
    bindChoiceToggle(game,()=>{state.mode='random';setup()},()=>{state.mode='manual';setup()});
    if(state.mode==='manual'){
      const map={protagonist:state.cards.protagonist,situation:state.cards.situation,goal:state.cards.goal,problem:state.cards.problem};
      state.objectives.slice(0,state.count).forEach((card,index)=>map[`objective${index}`]=card);
      bindSelectors(game,map,()=>{
        state.cards.protagonist=map.protagonist;state.cards.situation=map.situation;state.cards.goal=map.goal;state.cards.problem=map.problem;
        for(let index=0;index<state.count;index++)state.objectives[index]=map[`objective${index}`];setup();
      });
    }
    $('#startSingle').addEventListener('click',()=>{
      const seed=(state.seed.trim()||createCode()).toUpperCase();
      const story=state.mode==='manual'?state.cards:storyFromSeed(seed);
      const objectives=Array.from({length:state.count},(_,index)=>state.mode==='manual'?state.objectives[index]:objectiveFromSeed(seed,index+1));
      const session={seed,count:state.count,story,objectives,viewed:Array(state.count).fill(false)};saveSingle(session);renderSingleDashboard(game,session);
    });
  }
  setup();
}
function renderSingleDashboard(game,session){
  session.story=withStoryGoal(session.story,session.seed);saveSingle(session);
  const players=session.objectives.map((_,index)=>`<button type="button" class="player-slot${session.viewed[index]?' viewed':''}" data-player="${index}"><span>${index+1}</span><b>Giocatore ${index+1}</b><small>${session.viewed[index]?'Già aperto':'Obiettivo nascosto'}</small></button>`).join('');
  game.innerHTML=`<div class="game-header"><div><p class="eyebrow">PARTITA SU UN TELEFONO</p><h2>Incipit pubblico</h2></div><button type="button" id="copySingleCode" class="game-code">${escapeHtml(session.seed)}</button></div>${storyStack(session.story,session.seed)}<div class="section-minihead"><h3>Scegli il giocatore</h3><p>La partita resta qui. Puoi aprire e chiudere qualsiasi obiettivo.</p></div><div class="player-grid">${players}</div><div class="button-row"><button type="button" id="newSingle" class="button button-ghost">Nuova partita</button></div>`;
  $('#copySingleCode').addEventListener('click',()=>copyText(session.seed,'Codice copiato'));
  $$('.player-slot').forEach(button=>button.addEventListener('click',()=>renderSinglePlayer(game,session,Number(button.dataset.player))));
  $('#newSingle').addEventListener('click',()=>{clearSingle();singleMode(game)});
}
function renderSinglePlayer(game,session,index){
  let open=false;const objective=session.objectives[index];
  function draw(){
    game.innerHTML=`<div class="game-header"><div><p class="eyebrow">GIOCATORE ${index+1}</p><h2>Il tuo Obiettivo</h2></div><span class="game-code">${session.seed}</span></div><div class="secret-card${open?' open':''}">${open?secretContent(objective):secretClosed(`Passa il telefono al giocatore ${index+1}`,'Gli altri devono distogliere lo sguardo.')}</div><div class="button-row"><button type="button" id="singlePlayerReveal" class="button button-primary">${open?'Nascondi':'Rivela'}</button><button type="button" id="singlePlayerBack" class="button button-dark">Torna ai giocatori</button></div>`;
    $('#singlePlayerReveal').addEventListener('click',()=>{open=!open;if(open){session.viewed[index]=true;saveSingle(session)}draw()});
    $('#singlePlayerBack').addEventListener('click',()=>renderSingleDashboard(game,session));
  }
  draw();
}

const MULTI_PREFIX='storia52_multi_host_';
function multiMode(game){
  const invite=readInvite();if(invite){showMulti(game,invite);return}
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
    game.innerHTML=`<p class="eyebrow">UN TELEFONO A TESTA</p><h2>Crea la stanza e gli inviti</h2><p class="setup-note">Il numero giocatore viene assegnato automaticamente a ogni invito. Nessuno deve inserirlo.</p><label class="field"><span>Codice partita</span><input id="multiSeed" value="${state.seed}" maxlength="12" autocapitalize="characters"></label><div class="setup-section"><b>Carte dell’incipit</b>${choiceToggle(state.mode)}${state.mode==='manual'?`<div class="card-choice-list">${selectorHtml('protagonist','Protagonista','protagonist',state.cards.protagonist)}${selectorHtml('situation','Situazione','situation',state.cards.situation)}${selectorHtml('goal','Obiettivo della storia','objective',state.cards.goal)}${selectorHtml('problem','Problema','problem',state.cards.problem)}</div>`:'<p class="setup-note">L’incipit e l’obiettivo della storia saranno pescati automaticamente dal codice partita.</p>'}</div><div class="button-row"><button type="button" id="createMultiRoom" class="button button-primary">Crea stanza</button><button type="button" id="regenMultiSeed" class="button button-ghost">Cambia codice</button></div>`;
    $('#multiSeed').addEventListener('input',event=>state.seed=event.target.value.toUpperCase());
    $('#regenMultiSeed').addEventListener('click',()=>{state.seed=createCode();setup()});
    bindChoiceToggle(game,()=>{state.mode='random';setup()},()=>{state.mode='manual';setup()});
    if(state.mode==='manual')bindSelectors(game,state.cards,setup);
    $('#createMultiRoom').addEventListener('click',()=>{
      const seed=(state.seed.trim()||createCode()).toUpperCase();const story=state.mode==='manual'?state.cards:storyFromSeed(seed);
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
  function draw(){
    const assigned=host.assigned.length?host.assigned.map(item=>`<span class="assigned-chip">Giocatore ${item.player} · ${item.card}</span>`).join(''):'<span class="setup-note">Nessun invito creato.</span>';
    game.innerHTML=`<div class="game-header"><div><p class="eyebrow">STANZA MULTI-TELEFONO</p><h2>Inviti progressivi</h2></div><button type="button" id="copyHostCode" class="game-code">${host.seed}</button></div>${storyStack(host.story,host.seed)}<div class="invite-panel"><div class="next-player"><span>PROSSIMO INVITO</span><strong>Giocatore ${host.nextPlayer}</strong></div><div class="setup-section"><b>Obiettivo del prossimo giocatore</b>${choiceToggle(state.objectiveMode)}${state.objectiveMode==='manual'?`<div class="card-choice-list">${selectorHtml('objective','Obiettivo','objective',state.objective)}</div>`:'<p class="setup-note">L’obiettivo sarà pescato automaticamente e inserito nel link privato.</p>'}</div><div class="button-row"><button type="button" id="createInvite" class="button button-primary">Crea invito giocatore ${host.nextPlayer}</button><button type="button" id="resetPlayers" class="button button-ghost">Ricomincia da 1</button></div>${state.lastInvite?`<div class="invite-ready"><b>Invito giocatore ${state.lastInvite.player} pronto</b><p>Il numero e le carte sono già dentro il link.</p><div class="button-row"><button type="button" id="shareInvite" class="button button-dark">Condividi invito</button><button type="button" id="copyInvite" class="button button-ghost">Copia link</button></div></div>`:''}<div class="assigned-list">${assigned}</div></div><div class="button-row"><button type="button" id="backMultiSetup" class="button button-ghost">Nuova stanza</button></div>`;
    $('#copyHostCode').addEventListener('click',()=>copyText(host.seed,'Codice copiato'));
    bindChoiceToggle(game,()=>{state.objectiveMode='random';draw()},()=>{state.objectiveMode='manual';draw()});
    if(state.objectiveMode==='manual'){
      const map={objective:state.objective};bindSelectors(game,map,()=>{state.objective=map.objective;draw()});
    }
    $('#createInvite').addEventListener('click',()=>{
      const player=host.nextPlayer;const objective=state.objectiveMode==='manual'?state.objective:objectiveFromSeed(host.seed,player);
      const url=makeInviteUrl(host,player,objective);state.lastInvite={player,url};host.assigned.push({player,card:cardLabel(objective)});host.nextPlayer+=1;saveMultiHost(host);draw();
    });
    $('#shareInvite')?.addEventListener('click',()=>shareInvite(state.lastInvite));
    $('#copyInvite')?.addEventListener('click',()=>copyText(state.lastInvite.url,'Link invito copiato'));
    $('#resetPlayers').addEventListener('click',()=>{host.nextPlayer=1;host.assigned=[];state.lastInvite=null;saveMultiHost(host);draw()});
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
  function draw(){
    game.innerHTML=`<div class="game-header"><div><p class="eyebrow">GIOCATORE ${invite.player}</p><h2>Incipit pubblico</h2></div><span class="game-code">${invite.seed}</span></div>${storyStack(invite.story,invite.seed)}<h3>Il tuo Obiettivo segreto</h3><div class="secret-card${open?' open':''}">${open?secretContent(invite.objective):secretClosed()}</div><div class="button-row"><button type="button" id="multiReveal" class="button button-primary">${open?'Nascondi':'Rivela'}</button><button type="button" id="leaveInvite" class="button button-ghost">Esci dall’invito</button></div>`;
    $('#multiReveal').addEventListener('click',()=>{open=!open;draw()});
    $('#leaveInvite').addEventListener('click',()=>{const url=new URL(location.href);url.search='';url.hash='play';history.replaceState(null,'',url);multiHostSetup(game)});
  }
  draw();
}

prepareStaticDom();initTheme();renderBrowser();
$('#randomCard').addEventListener('click',()=>{browserState.type=typeKeys[Math.floor(Math.random()*typeKeys.length)];browserState.suit=suitKeys[Math.floor(Math.random()*suitKeys.length)];browserState.number=2+Math.floor(Math.random()*9);renderBrowser()});
$('#copyCard').addEventListener('click',()=>{const suit=SUITS[browserState.suit],text=DATA[browserState.type][browserState.suit][browserState.number-2];copyText(`${browserState.number}${suit.symbol} - ${TYPES[browserState.type]}: ${text}`)});

const requestedPage=location.hash.slice(1);if(['play','cards','rules'].includes(requestedPage))openPage(requestedPage);
const directInvite=readInvite();if(directInvite){openPage('play');const game=$('#game');game.classList.remove('hidden');showMulti(game,directInvite);scrollToGame()}
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}))}
