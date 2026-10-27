// Run: node scripts/check-mobile-navigation.mjs
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve(import.meta.dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const core=read('clean-core.js'),learning=read('learning-experience.js'),runtime=read('locale-runtime.js');
const homeLocale=read('locale-en-ui-home.js'),css=read('locale.css');
new Function(core);
new Function(learning);
new Function(runtime);
assert(css.includes('white-space:normal!important'), 'English headline must wrap');
assert(homeLocale.includes('"improvvisando.":"made up as you go."'), 'Long hero headline was not shortened');
assert(runtime.includes("new CustomEvent('epoi:languagechange'"), 'Language change notification missing');

// Exercise real popstate and pushState handling without browser dependencies.
function testBack() {
  const events={};
  const history={state:null,pushes:0,pushState(state){this.state=state;this.pushes++;},replaceState(state){this.state=state;}};
  const modal={querySelector(){return {click(){modal.closed++}}},closed:0};
  let modals=[];
  const document={
    querySelector(){return {}},
    querySelectorAll(){return modals},
    body:{classList:{contains(name){return name==='session-mode' && sessionActive},appendChild(){}}}
  };
  const window={addEventListener(name,fn){events[name]=fn},S52:null};
  const location={href:'http://localhost:8080/'};
  let sessionActive=false;
  new Function('window','document','history','location','requestAnimationFrame',core)(
    window,document,history,location,fn=>fn());
  const S=window.S52;
  let slides=0,confirms=0;
  window.EpoiLearning={handleBack(){slides++;return true;}};
  S.armBrowserBack(); S.armBrowserBack();
  assert.equal(history.pushes,1,'Guard duplicated');
  history.state=null;events.popstate({state:null});
  assert.equal(slides,1,'Back did not return to previous slide');
  assert.equal(history.pushes,2,'Guard was not restored');

  window.EpoiLearning=null;
  modals=[modal];history.state=null;events.popstate({state:null});
  assert.equal(modal.closed,1,'Back did not dismiss open modal');
  assert.equal(history.pushes,3);

  modals=[];sessionActive=true;
  S.openExitModal=()=>confirms++;
  history.state=null;events.popstate({state:null});
  assert.equal(confirms,1,'Back skipped saved-session exit confirmation');
  assert.equal(history.pushes,4);

  sessionActive=false;S.currentSession=null;
  history.state=null;events.popstate({state:null});
  assert.equal(history.pushes,4,'Home Back must not be trapped');
}
testBack();

// Exercise the learning deck and rulebook without reloading the game.
function testLearning() {
 const events={}; const state={language:'it',changes:0};
 const classes=()=>({add(){},remove(){},toggle(){}});
 const content={innerHTML:'',scrollTop:0,querySelector(){return manualScroll}};
 const manualScroll={scrollTop:0};
 const overlay={
   dataset:{},innerHTML:'',handlers:{},
   addEventListener(event,fn){this.handlers[event]=fn},
   querySelector(selector){
     if(selector==='[data-content]')return content;
     if(selector==='.ep-manual-scroll')return manualScroll;
     if(selector==='[data-action="close"]')return {focus(){}};
     return null;
   },
   querySelectorAll(){return ['deck','manual','quick'].map(action=>({dataset:{action},classList:classes(),setAttribute(){}}))},
   remove(){}
 };
 const document={
   documentElement:{lang:'it'},activeElement:{isConnected:true,focus(){},dataset:{}},
   body:{classList:classes(),appendChild(){}},createElement(){return overlay},
   fonts:{ready:{then(){}}}
 };
 const S={
   homeMarkup:()=>'<b>Inizia da qui</b><small>Tutorial completo, passo per passo.</small><b>Regole complete</b><small>Riferimento rapido durante la partita.</small><button type="button" class="choice-card creator-menu-card"',
   openHomePanel(){},renderSetup(){},
   play:{querySelector(){return null}}
 };
 const win={
   S52:S,
   EpoiI18n:{
     get language(){return state.language},
     setLanguage(next){
       state.language=next;document.documentElement.lang=next;
       events['epoi:languagechange']?.();
     },
     apply(){state.changes++}
   },
   addEventListener(name,fn){events[name]=fn},
   matchMedia:()=>({matches:true}),
   armBrowserBack(){},
   print(){}
 };
 new Function('window','document',learning)(win,document);
 win.EpoiLearning.openPresentation();
 assert(content.innerHTML.includes('La storia è una.'),'Italian first slide wrong');
 for(let i=0;i<2;i++)overlay.handlers.click({target:{closest:()=>({dataset:{action:'next'}})}});
 assert(content.innerHTML.includes('03 / 16'),'Deck did not advance');
 // The in-panel IT/EN button uses the same service as the site header.
 overlay.handlers.click({target:{closest:()=>({dataset:{action:'language'}})}});
 assert.equal(state.language,'en');
 assert(content.innerHTML.includes('One story.'),'Open slide did not translate immediately');
 assert(content.innerHTML.includes('03 / 16'),'Language toggle reset the deck');
 win.EpoiLearning.openRulebook();
 manualScroll.scrollTop=250;
 overlay.handlers.click({target:{closest:()=>({dataset:{action:'language'}})}});
 assert(content.innerHTML.includes('Le regole'),'Rulebook did not switch back to Italian');
 assert.equal(manualScroll.scrollTop,250,'Rulebook lost reading position');
 assert(state.changes>=2,'Localization rerender did not refresh locale runtime');
}
testLearning();
console.log('Mobile navigation and live bilingual presentation checks passed.');
