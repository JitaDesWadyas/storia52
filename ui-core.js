'use strict';

const SUITS={
  hearts:{symbol:'♥',name:'Cuori',red:true},
  diamonds:{symbol:'♦',name:'Quadri',red:true},
  clubs:{symbol:'♣',name:'Fiori',red:false},
  spades:{symbol:'♠',name:'Picche',red:false}
};
const TYPES={protagonist:'Protagonista',situation:'Situazione',problem:'Problema',objective:'Obiettivo',finale:'Finale'};
const suitKeys=Object.keys(SUITS);
const typeKeys=Object.keys(TYPES);
const $=selector=>document.querySelector(selector);
const $$=selector=>[...document.querySelectorAll(selector)];
let browserState={type:'protagonist',suit:'hearts',number:2};

function prepareStaticDom(){
  /* Le regole, il pulsante tema e il CSS sono ora presenti direttamente nell'HTML. */
}

function hash(value){let h=2166136261;for(const char of value){h^=char.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function seeded(seed,offset){let x=(hash(seed)+offset*2654435761)>>>0;x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296}
function pick(seed,offset){const suit=suitKeys[Math.floor(seeded(seed,offset)*4)];const index=Math.floor(seeded(seed,offset+97)*9);return{suit,index,number:index+2}}
function createCode(){const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';const values=new Uint32Array(6);crypto.getRandomValues(values);return[...values].map(value=>chars[value%chars.length]).join('')}
function normalizeCard(card){return{...card,index:Number(card.number)-2,number:Number(card.number)}}
function cardLabel(card){return `${card.number}${SUITS[card.suit].symbol}`}
function cardText(type,card){return DATA[type][card.suit][card.index]}
function storyFromSeed(seed){return{protagonist:pick(seed,1),situation:pick(seed,2),problem:pick(seed,3),goal:pick(seed,4)}}
function withStoryGoal(story,seed='STORIA52'){return story?.goal?story:{...story,goal:pick(seed,4)}}
function objectiveFromSeed(seed,player){return pick(`${seed}-PLAYER-${player}`,40+player)}
function escapeHtml(value){return String(value).replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]))}
function showToast(message){const toast=$('#toast');toast.textContent=message;toast.classList.add('show');clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>toast.classList.remove('show'),1700)}
function copyText(value,message='Copiato'){if(!navigator.clipboard){showToast('Copia non disponibile');return}navigator.clipboard.writeText(value).then(()=>showToast(message)).catch(()=>showToast('Copia non disponibile'))}
function scrollToGame(){setTimeout(()=>$('#game')?.scrollIntoView({behavior:'smooth',block:'start'}),40)}
function randomCard(){return pick(createCode(),Math.floor(Math.random()*900)+1)}
function serializeCard(card){return `${card.suit[0]}${card.number}`}
function parseCard(value){const map={h:'hearts',d:'diamonds',c:'clubs',s:'spades'};const suit=map[String(value||'')[0]];const number=Number(String(value||'').slice(1));if(!suit||number<2||number>10)return null;return{suit,number,index:number-2}}
function serializeStory(story){const complete=withStoryGoal(story);return [complete.protagonist,complete.situation,complete.problem,complete.goal].map(serializeCard).join('.')}
function parseStory(value,seed='STORIA52'){
  const cards=String(value||'').split('.').map(parseCard);
  if(![3,4].includes(cards.length)||cards.some(card=>!card))return null;
  return withStoryGoal({protagonist:cards[0],situation:cards[1],problem:cards[2],goal:cards[3]},seed);
}

function storedTheme(){
  try{return localStorage.getItem('storia52_theme')==='dark'?'dark':'light'}catch{return'light'}
}
function applyTheme(theme,{persist=true}={}){
  const next=theme==='dark'?'dark':'light';
  document.documentElement.dataset.theme=next;
  if(persist){try{localStorage.setItem('storia52_theme',next)}catch{}}
  updateThemeButton();
}
function initTheme(){
  applyTheme(document.documentElement.dataset.theme||storedTheme(),{persist:false});
  const button=$('#themeToggle');
  if(!button)return;
  button.addEventListener('click',()=>{
    const current=document.documentElement.dataset.theme;
    applyTheme(current==='dark'?'light':'dark');
  });
}
function updateThemeButton(){
  const button=$('#themeToggle');if(!button)return;
  const dark=document.documentElement.dataset.theme==='dark';
  button.setAttribute('aria-pressed',String(dark));
  button.setAttribute('aria-label',dark?'Passa al tema chiaro':'Passa al tema scuro');
  const icon=button.querySelector('.theme-toggle-icon');
  if(icon)icon.textContent=dark?'☀':'☾';
}

function openPage(pageId){
  $$('.page').forEach(page=>page.classList.toggle('active',page.id===pageId));
  $$('.main-nav button').forEach(button=>{
    const active=button.dataset.page===pageId;
    button.classList.toggle('active',active);
    if(active)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');
  });
  const url=new URL(location.href);url.hash=pageId;history.replaceState(null,'',url);
  window.scrollTo({top:0,behavior:'smooth'});
}
$$('.main-nav button').forEach(button=>button.addEventListener('click',()=>openPage(button.dataset.page)));

function renderTypeTabs(){
  const host=$('#tabs');host.innerHTML='';
  Object.entries(TYPES).forEach(([key,label])=>{
    const button=document.createElement('button');button.type='button';button.textContent=label;
    button.classList.toggle('active',browserState.type===key);button.setAttribute('role','tab');
    button.setAttribute('aria-selected',browserState.type===key?'true':'false');
    button.addEventListener('click',()=>{browserState.type=key;renderBrowser()});host.appendChild(button);
  });
}
function renderSuitPicker(){
  const host=$('#suitPicker');host.innerHTML='';
  suitKeys.forEach(key=>{
    const suit=SUITS[key],button=document.createElement('button');button.type='button';button.className=suit.red?'red':'';
    button.classList.toggle('active',browserState.suit===key);button.innerHTML=`<b>${suit.symbol}</b><small>${suit.name}</small>`;
    button.addEventListener('click',()=>{browserState.suit=key;renderBrowser()});host.appendChild(button);
  });
}
function renderNumberPicker(){
  const host=$('#numberPicker');host.innerHTML='';
  for(let number=2;number<=10;number++){
    const button=document.createElement('button');button.type='button';button.textContent=number;
    button.classList.toggle('active',browserState.number===number);
    button.addEventListener('click',()=>{browserState.number=number;renderBrowser()});host.appendChild(button);
  }
}
function renderPreview(){
  const suit=SUITS[browserState.suit],text=DATA[browserState.type][browserState.suit][browserState.number-2],preview=$('#cardPreview');
  preview.className=`playing-card-preview${suit.red?' red':''}`;preview.dataset.rank=`${browserState.number}\n${suit.symbol}`;
  preview.innerHTML=`<div class="preview-suit">${suit.symbol}</div><div class="preview-kind">${TYPES[browserState.type].toUpperCase()} · ${suit.name.toUpperCase()}</div><p class="preview-text">${text}</p>`;
}
function renderBrowser(){renderTypeTabs();renderSuitPicker();renderNumberPicker();renderPreview()}

function storySlip(title,type,card){
  const red=SUITS[card.suit].red?' red':'';
  return `<div class="story-slip"><span class="slip-card${red}">${cardLabel(card)}</span><small>${title.toUpperCase()}</small>${cardText(type,card)}</div>`;
}
function storyStack(story,seed){const complete=withStoryGoal(story,seed);return `<div class="story-stack">${storySlip('Protagonista','protagonist',complete.protagonist)}${storySlip('Situazione','situation',complete.situation)}${storySlip('Obiettivo della storia','objective',complete.goal)}${storySlip('Problema','problem',complete.problem)}</div>`}
function secretContent(card){
  if(card?.custom){
    return `<div class="secret-content"><div class="secret-rank">${escapeHtml(card.title||'Obiettivo')}</div><div class="secret-type">OBIETTIVO SEGRETO</div><p>${escapeHtml(card.text)}</p><small class="secret-final"><b>FINALE DA RAGGIUNGERE</b><br>${escapeHtml(card.finale)}</small></div>`;
  }
  return `<div class="secret-content"><div class="secret-rank">${cardLabel(card)}</div><div class="secret-type">OBIETTIVO SEGRETO</div><p>${cardText('objective',card)}</p><small class="secret-final"><b>FINALE DA RAGGIUNGERE</b><br>${cardText('finale',card)}</small></div>`
}
function secretClosed(label='Obiettivo nascosto',sub='Assicurati che nessuno guardi.'){
  return `<div class="secret-closed"><span class="secret-lock" aria-hidden="true">♠</span><b>${label}</b><p>${sub}</p><small>PREMI “RIVELA” QUANDO SEI PRONTO</small></div>`;
}
function selectorHtml(key,label,type,card){
  const suitOptions=suitKeys.map(suit=>`<option value="${suit}"${card.suit===suit?' selected':''}>${SUITS[suit].symbol} ${SUITS[suit].name}</option>`).join('');
  const numberOptions=Array.from({length:9},(_,index)=>index+2).map(number=>`<option value="${number}"${card.number===number?' selected':''}>${number}</option>`).join('');
  return `<div class="card-choice" data-card-key="${key}"><span class="choice-mini ${SUITS[card.suit].red?'red':''}">${cardLabel(card)}</span><div class="choice-main"><b>${label}</b><p>${cardText(type,card)}</p><div class="choice-controls"><select data-part="suit" aria-label="Seme ${label}">${suitOptions}</select><select data-part="number" aria-label="Numero ${label}">${numberOptions}</select></div></div></div>`;
}
function bindSelectors(root,selections,onChange){
  root.querySelectorAll('[data-card-key]').forEach(host=>{
    const key=host.dataset.cardKey;
    host.querySelectorAll('select').forEach(select=>select.addEventListener('change',()=>{
      const suit=host.querySelector('[data-part="suit"]').value;
      const number=Number(host.querySelector('[data-part="number"]').value);
      selections[key]=normalizeCard({suit,number});onChange?.();
    }));
  });
}
function choiceToggle(current){
  return `<div class="choice-toggle"><button type="button" class="${current==='random'?'active':''}" data-choice="random">Casuali</button><button type="button" class="${current==='manual'?'active':''}" data-choice="manual">Scegli le carte</button></div>`;
}
function bindChoiceToggle(root,onRandom,onManual){
  root.querySelector('[data-choice="random"]')?.addEventListener('click',onRandom);
  root.querySelector('[data-choice="manual"]')?.addEventListener('click',onManual);
}
