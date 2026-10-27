// Run: node scripts/check-localization-gaps.mjs
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = path.resolve(import.meta.dirname,'..');
const read = file => fs.readFileSync(path.join(root,file),'utf8');

const hero = read('clean-home.js');
const balance = read('game-balance.js');
const controller = read('collection-controller.js');
const index = read('index.html');
const enStories = read('locale-en-stories.js');
for (const js of [hero,balance,controller,enStories]) new Function(js);

assert(hero.includes('e immaginazione,</span> <span class="line line-final">'), 'Hero spans have no visible separating space');

const translations = {};
new Function('window',enStories)(translations);
assert(translations.EPOI_EN_META?.categories?.realistico?.label === 'Drama', 'English genre metadata unavailable');

function checkPreparation() {
  let language='en', changes={};
  const events={};
  let count=4;
  const prepStep={textContent:''};
  const virtualIcon={textContent:''}, virtualCopy={textContent:''}, physicalCopy={textContent:''};
  const root={
    querySelectorAll(sel){return sel==='.prep-step b'?[{textContent:''},prepStep]:[]},
    querySelector(sel){
      if(sel==='[data-card-mode="virtual"]')return {querySelector(query){return query===':scope > span'?virtualIcon:virtualCopy}};
      if(sel==='[data-card-mode="physical"] small')return physicalCopy;
      if(sel==='.prep-grid .prep-step')return prepStep;
      if(sel==='[data-card-mode]')return virtualCopy;
      return null;
    }
  };
  const S={
    currentSession:{count},
    load(){return {count}},
    play:root,
    renderSetup(){},
    renderPreparation(){},
    preparationGuideMarkup(){return 'Con il mazzo reale usate 52 carte francesi e togliete i jolly. Con le carte virtuali ogni giocatore riceve la mano sul proprio telefono.'},
    finalRulesMarkup(){return ''}
  };
  const window={
    S52:S,
    EpoiVirtualCardsEngine:{buildAssignments(){return []}},
    EpoiI18n:{get language(){return language}},
    addEventListener(name,fn){events[name]=fn}
  };
  new Function('window','localStorage',balance)(window,{});
  S.renderPreparation({count});
  assert.equal(prepStep.textContent,'Deal 4 cards each.');
  S.renderSetup();
  assert(virtualCopy.textContent.includes('4 cards') && !virtualCopy.textContent.includes('carte'), 'Virtual setup is not English');
  assert(physicalCopy.textContent.includes('deal 4 cards each'), 'Physical setup is not English');
  assert(S.preparationGuideMarkup().includes('4 players: 4 cards each'), 'Preparation guide is not English');
  language='it';
  events['epoi:languagechange']();
  assert.equal(prepStep.textContent,'Date 4 carte a testa.');
  language='en'; count=2;
  S.renderPreparation({count});
  assert.equal(prepStep.textContent,'Deal 5 cards each.');
}
checkPreparation();

function checkStoryCategories() {
  let language='en';
  const events={};
  const story={id:'real01',category:'realistico',title:'Storia uno',opening:'Incipit'};
  const categories={realistico:{symbol:'●',label:'Dramma'}};
  const collections=[{id:'prima-scintilla',title:'La Prima Scintilla',status:'available',storyIds:['real01']}];
  const S={
    categories,stories:[story],storyUi:{category:'realistico',query:'',page:0},collections,
    primaryCollectionId:'prima-scintilla',limits:{name:30},
    esc:v=>String(v),highlightStoryOpening:s=>s.opening,
    cleanText:v=>String(v),load(){return null},save(){},renderStories(){this.renders=(this.renders||0)+1},
    play:{querySelector:()=>({})},currentSession:{stage:'stories'}
  };
  const window={
    S52:S,STORIA52_READY_COLLECTIONS:collections,
    EPOI_EN_META:translations.EPOI_EN_META,
    EpoiI18n:{get language(){return language}},
    addEventListener(name,fn){events[name]=fn},
    scrollY:0,scrollTo(){}
  };
  new Function('window','requestAnimationFrame',controller)(window,fn=>fn());
  const english=S.storyArchiveMarkup({visible:[story],pages:1});
  assert(english.includes('● Drama'), 'Filter or story meta category remained Italian');
  assert(!english.includes('● Dramma'), 'Italian category visible in English view');
  language='it';
  events['epoi:languagechange']();
  const italian=S.storyArchiveMarkup({visible:[story],pages:1});
  assert(italian.includes('● Dramma'), 'Italian category not restored');
  assert.equal(S.storyUi.category,'realistico','Switching language should preserve selected genre');
  assert.equal(S.renders,1,'Story archive not refreshed on language change');
}
checkStoryCategories();

assert(index.includes('game-balance.js?') && index.includes('collection-controller.js?'), 'Changed files are not included in app');
console.log('English hero spacing, physical/virtual prep and story category language regression checks passed.');
