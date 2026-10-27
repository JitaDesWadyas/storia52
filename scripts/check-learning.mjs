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
assert(index.includes('learning-experience.js?v=1'), 'Missing JS mount');
assert(index.includes('learning-experience.css?v=1'), 'Missing CSS mount');
assert(index.indexOf('locale-runtime.js') < index.indexOf('learning-experience.js'), 'Locale must load first');
assert(index.indexOf('learning-experience.js') < index.indexOf('clean-init.js'), 'Learning must load before app init');
assert(sw.includes("'./learning-experience.js'") && sw.includes("'./learning-experience.css'"), 'Learning is not cached offline');
assert(css.includes('@media print') && css.includes('@media (prefers-reduced-motion:reduce)'), 'Print or reduced-motion CSS missing');
assert(source.includes('Essere semplicemente nello stesso luogo'), 'The E COME direct link requirement is missing');

function checkLanguage(lang) {
  const state = { printed: 0, setups: 0 };
  const classes = () => ({add() {}, remove() {}, toggle() {}});
  const content = {innerHTML: '',scrollTop: 0, querySelector: () => ({scrollTop: 0})};
  const buttons = ['deck','manual','quick'].map(mode => ({
    dataset: {action: mode}, classList: classes(), setAttribute() {}
  }));
  const overlay = {
    innerHTML: '', dataset: {}, handlers: {},
    addEventListener(name, fn) { this.handlers[name] = fn; },
    querySelector(selector) {
      if (selector === '[data-content]') return content;
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
  assert(content.innerHTML.includes(lang==='it'?'Una storia.':'One story.'), 'First slide not rendered');

  for (let i = 0; i < 13; i++) overlay.handlers.click({target:{closest:()=>({dataset:{action:'next'}})}});
  assert(content.innerHTML.includes(lang==='it'?'«E COME?»':'“BUT HOW?”'), 'E COME slide missing');

  window.EpoiLearning.openRulebook();
  assert(content.innerHTML.includes('ep-doc-toc'), 'Document index missing');
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
console.log('Learning checks passed: 16 slides, both languages, quick reference in game, navigation, document, print and offline assets.');
