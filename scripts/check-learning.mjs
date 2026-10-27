// Run with: node scripts/check-learning.mjs
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = path.resolve(import.meta.dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const source = read('learning-experience.js');
const css = read('learning-experience.css');
const index = read('index.html');
const sw = read('sw.js');

new Function(source);
assert(index.includes('learning-experience.js?v=4'), 'Missing JS mount');
assert(index.includes('learning-experience.css?v=4'), 'Missing CSS mount');
assert(index.indexOf('locale-runtime.js') < index.indexOf('learning-experience.js'), 'Locale must load first');
assert(index.indexOf('learning-experience.js') < index.indexOf('clean-init.js'), 'Learning must load before app init');
assert(sw.includes("'./learning-experience.js'") && sw.includes("'./learning-experience.css'"), 'Learning is not cached offline');
assert(css.includes('@media print') && css.includes('@media (prefers-reduced-motion:reduce)'), 'Print or reduced-motion CSS missing');
assert(css.includes('orientation:landscape') && css.includes('.ep-stage-fit') && css.includes('overflow:hidden!important'), 'Non-scrolling fitted mobile layout is missing');
assert(source.includes('function fitDeck()') && source.includes('--ep-fit-scale'), 'Viewport fit algorithm missing');
assert(!/statua|mortaio|sindaco|sicario|inaugurazione|camion|artista/i.test(source), 'Tutorial still borrows a playable story');
assert(source.includes('ESEMPIO INVENTATO · AQUILONI'), 'Tutorial-only illustrative scenario missing');
assert(css.includes('.ep-deck-counter {display:none;}'), 'Mobile control footer still duplicates progress');
assert(!/backdrop-filter\s*:|filter\s*:\s*blur\(/.test(css.replace(/\/\*[\s\S]*?\*\//g,'')), 'Expensive blur/filter restored');
assert(source.includes('collegamento diretto con almeno un elemento già presente'), 'The E COME direct link requirement is missing');
assert(source.includes('function goToSlide(') && source.includes('function animateSlide('), 'Motion system missing');
assert(source.includes('ep-secret-card') && source.includes('ep-colors-art'), 'Distinct slide animations missing');
assert(source.includes('ep-doc-how-chat') && source.includes('ep-doc-suit-grid'), 'Illustrated rulebook sections missing');

function checkLanguage(lang) {
  const state = { printed: 0, setups: 0 };
  const classes = () => ({add() {}, remove() {}, toggle() {}});
  const content = {innerHTML: '',scrollTop: 0, querySelector: () => ({scrollTop: 0})};
  const viewport = {height: 440, width: 360};
  const fitted = {scale: 1, count: 0};
  const inner = {
    scrollHeight: 580, offsetHeight: 580, scrollWidth: 360, offsetWidth: 360,
    style: {setProperty(name, value) {
      if (name === '--ep-fit-scale') { fitted.scale = Number(value); fitted.count++; }
    }}
  };
  const stage = {
    get clientHeight() {return viewport.height;},
    get clientWidth() {return viewport.width;},
    querySelector(selector) {return selector === '.ep-stage-fit' ? inner : null;}
  };
  const buttons = ['deck','manual','quick'].map(mode => ({
    dataset: {action: mode}, classList: classes(), setAttribute() {}
  }));
  const overlay = {
    innerHTML: '', dataset: {}, handlers: {},
    addEventListener(name, fn) { this.handlers[name] = fn; },
    querySelector(selector) {
      if (selector === '[data-content]') return content;
      if (selector === '.ep-stage') return stage;
      if (selector === '[data-action="close"]') return {focus() {}};
      return null;
    },
    querySelectorAll() { return buttons; },
    remove() {}
  };
  const document = {
    documentElement: {lang}, activeElement: {isConnected: true, focus() {}},
    body: {classList: classes(), appendChild() {}},
    createElement: () => overlay
  };
  const window = {
    S52: {
      homeMarkup: () => '<b>Inizia da qui</b><small>Tutorial completo, passo per passo.</small><b>Regole complete</b><small>Riferimento rapido durante la partita.</small><button type="button" class="choice-card creator-menu-card"',
      openHomePanel() {},
      renderSetup() { state.setups++; }
    },
    EpoiI18n: {language: lang},
    matchMedia: () => ({matches: true}),
    print() { state.printed++; }
  };

  new Function('window','document',source)(window,document);
  assert.equal(window.EpoiLearning.slideCount,16);
  assert(window.S52.quickReferenceMarkup().includes('ep-game-ref'), 'Shared game quick reference missing');
  assert(!window.S52.homeMarkup().includes('data-open-panel="quick"'), 'Quick reference must not be an extra home item');
  window.EpoiLearning.openPresentation();
  assert(content.innerHTML.includes(lang==='it'?'La storia è una.':'One story.'), 'First slide not rendered');
  assert(fitted.scale < 1 && fitted.scale * inner.offsetHeight <= viewport.height - 6, 'Tall slide is clipped');
  viewport.height = 245;  // simulate browser toolbars and small-screen landscape height
  window.EpoiLearning.openRulebook();
  window.EpoiLearning.openPresentation();
  assert(fitted.scale * inner.offsetHeight <= viewport.height - 6, 'Short viewport is clipped');
  viewport.height = 440;

  for (let i = 0; i < 16; i++) {
    const slide = content.innerHTML;
    assert(slide.includes('ep-stage-copy') && slide.includes('ep-stage-art') && slide.includes('ep-stage-fit'), 'Slide ' + (i + 1) + ' missing fitted content');
    assert(fitted.scale * inner.offsetHeight <= viewport.height - 6, 'Slide ' + (i + 1) + ' extends below available stage');
    assert(slide.includes('aria-valuenow="' + (i + 1) + '"'), 'Progress mismatch on slide ' + (i + 1));
    if (i >= 4 && i <= 11) {
      assert(slide.includes('ep-playing-card'), 'Card illustration absent on slide ' + (i + 1));
      assert(slide.includes('ep-stage-examples'), 'Card examples absent on slide ' + (i + 1));
    }
    if (i < 15) overlay.handlers.click({target:{closest:()=>({dataset:{action:'next'}})}});
  }
  assert(content.innerHTML.includes('data-action="play"'), 'Last slide must offer to play');
  for (let i = 0; i < 2; i++) overlay.handlers.click({target:{closest:()=>({dataset:{action:'prev'}})}});
  assert(content.innerHTML.includes(lang==='it'?'«E COME?»':'“BUT HOW?”'), 'E COME slide missing');
  assert(content.innerHTML.includes('ep-stage-connect'), 'E COME art/layout missing');

  window.EpoiLearning.openRulebook();
  window.EpoiLearning.openPresentation();
  assert(content.innerHTML.includes('ep-stage-connect'), 'Presentation progress should survive tab switching');
  window.EpoiLearning.openRulebook();
  assert(content.innerHTML.includes('ep-doc-toc'), 'Document index missing');
  assert(content.innerHTML.includes('ep-paper-cover-cards'), 'Rulebook cover missing card illustration');
  assert(content.innerHTML.includes('ep-doc-suit-grid'), 'Rulebook card guide missing');
  assert(content.innerHTML.includes('ep-doc-step'), 'Rulebook step-by-step examples missing');
  assert(content.innerHTML.includes('data-section="how"'), 'Rulebook links are not navigable');
  assert(content.innerHTML.includes('ep-rule-how'), 'Direct-link rule absent');
  overlay.handlers.click({target:{closest:()=>({dataset:{action:'print'}})}});
  assert.equal(state.printed,1);

  window.EpoiLearning.openQuick();
  assert(content.innerHTML.includes(lang==='it'?'PROMEMORIA':'CHEAT SHEET'), 'Quick sheet missing');
  window.EpoiLearning.close();
}
checkLanguage('it');
checkLanguage('en');
const game = read('clean-prep.js');
assert(game.includes('S.quickReferenceMarkup()'), 'Physical game does not show the quick reference');
assert(game.includes("data-game-full-rules"), 'Physical game has no way to open full rules');
assert(!game.includes('S.turnGuideMarkup()') && !game.includes('S.cardRulesMarkup()'), 'Old oversized game rule sections are still rendered');
console.log('Learning checks passed: 16 fitted non-scrolling slides in IT/EN, short viewport, independent example, game reference, manual, print and PWA assets.');
