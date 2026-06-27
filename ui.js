(()=>{

const SUITS={hearts:{symbol:'♥',name:'Cuori',red:true},diamonds:{symbol:'♦',name:'Quadri',red:true},clubs:{symbol:'♣',name:'Fiori',red:false},spades:{symbol:'♠',name:'Picche',red:false}};
const TYPES={protagonist:'Protagonista',situation:'Situazione',problem:'Problema',objective:'Obiettivo',finale:'Finale'};
const suitKeys=Object.keys(SUITS);
const $=selector=>document.querySelector(selector);
const $$=selector=>[...document.querySelectorAll(selector)];
let browserState={type:'protagonist',suit:'hearts',number:2};

function hash(value){let h=2166136261;for(const char of value){h^=char.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function seeded(seed,offset){let x=(hash(seed)+offset*2654435761)>>>0;x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296}
function pick(seed,offset){const suit=suitKeys[Math.floor(seeded(seed,offset)*4)];const index=Math.floor(seeded(seed,offset+97)*9);return{suit,index,number:index+2}}
function createCode(){const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';const values=new Uint32Array(6);crypto.getRandomValues(values);return[...values].map(value=>chars[value%chars.length]).join('')}
function cardLabel(card){return `${card.number}${SUITS[card.suit].symbol}`}
function cardText(type,card){return DATA[type][card.suit][card.index]}
function storyFromSeed(seed){return{protagonist:pick(seed,1),situation:pick(seed,2),problem:pick(seed,3)}}
function objectiveFromSeed(seed,player){return pick(`${seed}-PLAYER-${player}`,40+player)}
function escapeHtml(value){return String(value).replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]))}
function showToast(message){const toast=$('#toast');toast.textContent=message;toast.classList.add('show');clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>toast.classList.remove('show'),1700)}
function copyText(value,message='Copiato'){navigator.clipboard?.writeText(value).then(()=>showToast(message)).catch(()=>showToast('Copia non disponibile'))}
function scrollToContent(){window.scrollTo({top:0,behavior:'smooth'})}

function openPage(pageId){
  $$('.page').forEach(page=>page.classList.toggle('active',page.id===pageId));
  $$('.main-nav button').forEach(button=>{const active=button.dataset.page===pageId;button.classList.toggle('active',active);if(active)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current')});
  history.replaceState(null,'',`#${pageId}`);scrollToContent();
}
$$('.main-nav button').forEach(button=>button.addEventListener('click',()=>openPage(button.dataset.page)));
const requestedPage=location.hash.slice(1);if(['play','cards','rules'].includes(requestedPage))openPage(requestedPage);

function renderTypeTabs(){
  const host=$('#tabs');host.innerHTML='';
  Object.entries(TYPES).forEach(([key,label])=>{const button=document.createElement('button');button.type='button';button.textContent=label;button.classList.toggle('active',browserState.type===key);button.setAttribute('role','tab');button.setAttribute('aria-selected',browserState.type===key?'true':'false');button.addEventListener('click',()=>{browserState.type=key;renderBrowser()});host.appendChild(button)});
}
function renderSuitPicker(){
  const host=$('#suitPicker');host.innerHTML='';
  suitKeys.forEach(key=>{const suit=SUITS[key];const button=document.createElement('button');button.type='button';button.className=suit.red?'red':'';button.classList.toggle('active',browserState.suit===key);button.innerHTML=`<b>${suit.symbol}</b><small>${suit.name}</small>`;button.addEventListener('click',()=>{browserState.suit=key;renderBrowser()});host.appendChild(button)});
}
function renderNumberPicker(){
  const host=$('#numberPicker');host.innerHTML='';
  for(let number=2;number<=10;number++){const button=document.createElement('button');button.type='button';button.textContent=number;button.classList.toggle('active',browserState.number===number);button.addEventListener('click',()=>{browserState.number=number;renderBrowser()});host.appendChild(button)}
}
function renderPreview(){
  const suit=SUITS[browserState.suit];const text=DATA[browserState.type][browserState.suit][browserState.number-2];const preview=$('#cardPreview');preview.className=`playing-card-preview${suit.red?' red':''}`;preview.dataset.rank=`${browserState.number}\n${suit.symbol}`;preview.innerHTML=`<div class="preview-suit">${suit.symbol}</div><div class="preview-kind">${TYPES[browserState.type].toUpperCase()} · ${suit.name.toUpperCase()}</div><p class="preview-text">${text}</p>`;
}
function renderBrowser(){renderTypeTabs();renderSuitPicker();renderNumberPicker();renderPreview()}
renderBrowser();
$('#randomCard').addEventListener('click',()=>{browserState.type=Object.keys(TYPES)[Math.floor(Math.random()*5)];browserState.suit=suitKeys[Math.floor(Math.random()*4)];browserState.number=2+Math.floor(Math.random()*9);renderBrowser()});
$('#copyCard').addEventListener('click',()=>{const suit=SUITS[browserState.suit];const text=DATA[browserState.type][browserState.suit][browserState.number-2];copyText(`${browserState.number}${suit.symbol} - ${TYPES[browserState.type]}: ${text}`)});

function storySlip(title,type,card){const red=SUITS[card.suit].red?' red':'';return `<div class="story-slip"><span class="slip-card${red}">${cardLabel(card)}</span><small>${title.toUpperCase()}</small>${cardText(type,card)}</div>`}
function storyStack(story){return `<div class="story-stack">${storySlip('Protagonista','protagonist',story.protagonist)}${storySlip('Situazione','situation',story.situation)}${storySlip('Problema','problem',story.problem)}</div>`}
function secretContent(card){return `<div><div class="secret-rank">${cardLabel(card)}</div><div class="secret-type">OBIETTIVO SEGRETO</div><p>${cardText('objective',card)}</p><small class="secret-final"><b>FINALE DA RAGGIUNGERE</b><br>${cardText('finale',card)}</small></div>`}
function secretClosed(label='Obiettivo nascosto',sub='Assicurati che nessuno guardi.'){return `<div><b>${label}</b><p>${sub}</p><small>TOCCA “RIVELA” QUANDO SEI PRONTO</small></div>`}

$$('.mode-card').forEach(button=>button.addEventListener('click',()=>openMode(button.dataset.mode)));
function openMode(mode){const game=$('#game');game.classList.remove('hidden');if(mode==='quick')quickMode(game);if(mode==='single')singleMode(game);if(mode==='multi')multiMode(game);setTimeout(()=>game.scrollIntoView({behavior:'smooth',block:'start'}),40)}

function quickMode(game){
  const seed=createCode(),story=storyFromSeed(seed),objective=pick(seed,99);let open=false;
  function draw(){game.innerHTML=`<div class="game-header"><div><p class="eyebrow">GENERATORE RAPIDO</p><h2>Il vostro incipit</h2></div><span class="game-code">${seed}</span></div>${storyStack(story)}<h3>Obiettivo del giocatore</h3><div id="quickSecret" class="secret-card${open?' open':''}">${open?secretContent(objective):secretClosed()}</div><div class="button-row"><button type="button" id="quickReveal" class="button button-primary">${open?'Nascondi':'Rivela obiettivo'}</button><button type="button" id="quickAgain" class="button button-dark">Nuova storia</button></div>`;$('#quickReveal').addEventListener('click',()=>{open=!open;draw()});$('#quickAgain').addEventListener('click',()=>quickMode(game))}
  draw();
}

function singleMode(game){
  const defaultCode=createCode();
  game.innerHTML=`<p class="eyebrow">UN SOLO TELEFONO</p><h2>Configura la partita</h2><div class="form-grid"><label class="field"><span>Numero giocatori</span><input id="playerCount" type="number" min="2" max="10" value="4" inputmode="numeric"></label><label class="field"><span>Codice partita</span><input id="singleCode" value="${defaultCode}" maxlength="12" autocapitalize="characters"></label></div><div class="button-row"><button type="button" id="startSingle" class="button button-primary">Genera partita</button><button type="button" id="regenSingleCode" class="button button-ghost">Cambia codice</button></div>`;
  $('#regenSingleCode').addEventListener('click',()=>{$('#singleCode').value=createCode()});
  $('#startSingle').addEventListener('click',()=>{const count=Math.max(2,Math.min(10,Number($('#playerCount').value)||4));const seed=($('#singleCode').value.trim()||createCode()).toUpperCase();startSingle(game,seed,count)});
}
function startSingle(game,seed,count){
  const story=storyFromSeed(seed);let player=1;let open=false;
  function draw(){const objective=objectiveFromSeed(seed,player);game.innerHTML=`<div class="game-header"><div><p class="eyebrow">INCIPIT PUBBLICO</p><h2>Partita pronta</h2></div><button type="button" id="copySingleCode" class="game-code">${escapeHtml(seed)}</button></div>${storyStack(story)}<h3>Giocatore ${player} di ${count}</h3><div class="secret-card${open?' open':''}">${open?secretContent(objective):secretClosed(`Passa il telefono al giocatore ${player}`,'Gli altri devono distogliere lo sguardo.')}</div><div class="button-row"><button type="button" id="singleReveal" class="button button-primary">${open?(player<count?'Nascondi e passa':'Nascondi e termina'):'Rivela obiettivo'}</button><button type="button" id="singleBack" class="button button-ghost">Annulla</button></div>`;$('#copySingleCode').addEventListener('click',()=>copyText(seed,'Codice copiato'));$('#singleBack').addEventListener('click',()=>singleMode(game));$('#singleReveal').addEventListener('click',()=>{if(!open){open=true;draw();return}if(player<count){player+=1;open=false;draw();return}finishSingle()})}
  function finishSingle(){game.innerHTML=`<p class="eyebrow">TUTTO PRONTO</p><h2>La storia può iniziare.</h2><p>Tutti hanno visto il proprio Obiettivo segreto.</p><div class="secret-card open"><div><div class="secret-rank">${escapeHtml(seed)}</div><div class="secret-type">CODICE PARTITA</div><p>Conservalo per rigenerare lo stesso incipit.</p></div></div><div class="button-row"><button type="button" id="restartSingle" class="button button-primary">Nuova partita</button></div>`;$('#restartSingle').addEventListener('click',()=>singleMode(game))}
  draw();
}

function multiMode(game){
  const params=new URLSearchParams(location.search);const room=params.get('room')||'';const player=params.get('player')||'1';
  game.innerHTML=`<p class="eyebrow">UN TELEFONO A TESTA</p><h2>Entra nella partita</h2><p>Ogni telefono usa lo stesso codice. Ogni persona sceglie un numero giocatore diverso.</p><div class="form-grid"><label class="field"><span>Codice partita</span><input id="roomCode" value="${escapeHtml(room)}" placeholder="ES. K7M9Q2" maxlength="12" autocapitalize="characters"></label><label class="field"><span>Numero giocatore</span><input id="playerNumber" type="number" min="1" max="10" value="${escapeHtml(player)}" inputmode="numeric"></label></div><div class="button-row"><button type="button" id="joinRoom" class="button button-primary">Apri partita</button><button type="button" id="createRoom" class="button button-dark">Crea codice</button><button type="button" id="shareRoom" class="button button-ghost">Condividi</button></div>`;
  $('#createRoom').addEventListener('click',()=>{const value=createCode();$('#roomCode').value=value;copyText(value,'Codice creato e copiato')});
  $('#shareRoom').addEventListener('click',()=>shareRoom());
  $('#joinRoom').addEventListener('click',()=>{const seed=$('#roomCode').value.trim().toUpperCase();const number=Math.max(1,Math.min(10,Number($('#playerNumber').value)||1));if(!seed){showToast('Inserisci o crea un codice');return}showMulti(game,seed,number)});
  function shareRoom(){let seed=$('#roomCode').value.trim().toUpperCase();if(!seed){seed=createCode();$('#roomCode').value=seed}const url=`${location.origin}${location.pathname}?room=${encodeURIComponent(seed)}#play`;const message=`STORIA 52 - Codice partita: ${seed}`;if(navigator.share)navigator.share({title:'STORIA 52',text:message,url}).catch(()=>{});else copyText(`${message}\n${url}`,'Invito copiato')}
}
function showMulti(game,seed,player){
  const story=storyFromSeed(seed),objective=objectiveFromSeed(seed,player);let open=false;
  function draw(){game.innerHTML=`<div class="game-header"><div><p class="eyebrow">GIOCATORE ${player}</p><h2>Incipit pubblico</h2></div><button type="button" id="copyMultiCode" class="game-code">${escapeHtml(seed)}</button></div>${storyStack(story)}<h3>Il tuo Obiettivo segreto</h3><div class="secret-card${open?' open':''}">${open?secretContent(objective):secretClosed()}</div><div class="button-row"><button type="button" id="multiReveal" class="button button-primary">${open?'Nascondi':'Rivela'}</button><button type="button" id="multiShare" class="button button-dark">Condividi codice</button><button type="button" id="multiBack" class="button button-ghost">Cambia dati</button></div>`;$('#copyMultiCode').addEventListener('click',()=>copyText(seed,'Codice copiato'));$('#multiReveal').addEventListener('click',()=>{open=!open;draw()});$('#multiShare').addEventListener('click',()=>copyText(seed,'Codice copiato'));$('#multiBack').addEventListener('click',()=>multiMode(game))}
  draw();
}

if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}))}

})();
