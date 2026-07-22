import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = path.resolve(import.meta.dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const exists = file => fs.existsSync(path.join(root, file));
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };

for (const file of fs.readdirSync(root).filter(name => name.endsWith('.js'))) {
  try { new Function(read(file)); }
  catch (error) { failures.push(`${file}: sintassi non valida (${error.message})`); }
}

const index = read('index.html');
for (const match of index.matchAll(/(?:src|href)="([^"#?]+)(?:[?#][^"]*)?"/g)) {
  const reference = match[1];
  if (/^(?:https?:|mailto:|tel:|data:)/i.test(reference) || reference === './') continue;
  check(exists(reference), `index.html: risorsa mancante ${reference}`);
}
const scripts = [...index.matchAll(/<script src="([^"?]+)/g)].map(match => match[1]);
const styles = [...index.matchAll(/<link rel="stylesheet" href="([^"?]+)/g)].map(match => match[1]);
check(new Set(scripts).size === scripts.length, 'index.html: script duplicati');
check(new Set(styles).size === styles.length, 'index.html: stili duplicati');
check(index.includes('virtual-cards.js?v=36'), 'index.html: motore virtuale v36 non caricato');
check(index.includes('virtual-cards.css?v=36'), 'index.html: stile virtuale v36 non caricato');
check(!index.includes('virtual-cards-mobile-v35.css') && !index.includes('virtual-table-redesign-v35.js'), 'index.html: vecchi override v35 ancora caricati');
check(index.includes('pwa-refresh.js?v=36'), 'index.html: refresh PWA v36 non caricato');

const virtualSource = read('virtual-cards.js');
const virtualCss = read('virtual-cards.css');
check(virtualSource.includes("phase:'exchange'"), 'Il turno non parte dal cambio');
check(virtualSource.includes('mazzo-condiviso'), 'La distribuzione non usa il mazzo condiviso');
check(virtualSource.includes('virtual-card-symbol'), 'Le carte non hanno il simbolo centrale reale');
check(virtualSource.includes('virtual-menu-sheet'), 'Manca il menu di gioco compatto');
check(virtualSource.includes('setPointerCapture') && virtualSource.includes('requestAnimationFrame'), 'Il drag non usa Pointer Events e requestAnimationFrame');
check(virtualSource.includes('virtual-drag-overlay'), 'Il drag non usa un overlay fullscreen');
check(virtualSource.includes('playedCard') && virtualSource.includes('settlePlayedCard'), 'La carta giocata non resta sul tavolo');
check((virtualSource.match(/S\.mount\(/g) || []).length === 1, 'Il tavolo viene rimontato durante il turno');
check(virtualCss.includes('position:fixed!important;inset:0!important'), 'La modalità non è fullscreen reale');
check(virtualCss.includes('.site-header,body.virtual-table-active .site-footer{display:none!important}'), 'Header o footer restano visibili');
check(virtualCss.includes('height:100dvh!important'), 'Manca il supporto 100dvh');
check(virtualCss.includes('env(safe-area-inset-bottom)'), 'Mancano le safe area');
check(virtualCss.includes('flex-wrap:wrap!important'), 'La mano non dispone le carte su più righe');
check(virtualCss.includes('touch-action:none!important'), 'Le carte non bloccano il pan del browser');
check(virtualCss.includes('visibility:hidden!important'), 'La carta originale non viene nascosta durante il drag');
check(virtualCss.includes('grid-template-columns:repeat(2,minmax(0,1fr))'), 'La barra azioni non limita le azioni visibili');
check(virtualCss.includes('html[data-theme="dark"] .virtual-game'), 'Il tema scuro non è supportato');
check(virtualCss.includes('@media(max-height:700px)'), 'Manca l’adattamento per schermi bassi');

const sw = read('sw.js');
check(sw.includes('shell-v36') && sw.includes('runtime-v36'), 'Cache PWA v36 non attiva');
check(sw.includes("'./virtual-cards.css'") && sw.includes("'./virtual-cards.js'"), 'Carte virtuali non precacheate');
check(!sw.includes('virtual-cards-mobile-v35.css') && !sw.includes('virtual-table-redesign-v35.js'), 'Vecchi file v35 ancora nella cache');
check(read('pwa-refresh.js').includes('epoi_sw_reload_v36'), 'Refresh PWA v36 non attivo');
const coreBlock = sw.match(/const CORE_FILES = \[([\s\S]*?)\];/)?.[1] || '';
for (const match of coreBlock.matchAll(/['"]\.\/([^'"]*)['"]/g)) check(exists(match[1]), `sw.js: file mancante ${match[1]}`);

const evaluate = file => (0, eval)(read(file));
globalThis.window = globalThis;
delete globalThis.S52;
evaluate('virtual-cards.js');
const virtual = globalThis.EpoiVirtualCardsEngine;
check(virtual?.cardIds.length === 52 && new Set(virtual.cardIds).size === 52, 'Il mazzo non contiene 52 carte uniche');
check(virtual.meaningFor('H-6').title === 'Relazione positiva', 'Cuori pari non positivo');
check(virtual.meaningFor('H-7').title === 'Relazione negativa', 'Cuori dispari non negativo');
check(virtual.meaningFor('D-6').title === 'Scoperta positiva', 'Quadri pari non positivo');
check(virtual.meaningFor('D-3').title === 'Scoperta negativa', 'Quadri dispari non negativo');
check(virtual.meaningFor('C-5').title === 'Azione', 'Fiori non produce Azione');
check(virtual.meaningFor('S-8').title === 'Ostacolo', 'Picche non produce Ostacolo');
check(virtual.meaningFor('H-J').tone === 'positive' && virtual.meaningFor('S-A').tone === 'negative', 'Figure e assi non rispettano il colore');
for (const playerCount of [2,3,4,5,6,7,8]) {
  const assignments = virtual.buildAssignments(`TEST-${playerCount}`, playerCount);
  const assigned = assignments.flatMap(item => item.ownedCards);
  check(assignments.every(item => item.hand.length === 5), `${playerCount} giocatori: mano iniziale errata`);
  check(assigned.length === 52 && new Set(assigned).size === 52, `${playerCount} giocatori: doppioni o carte mancanti`);
}
let state = virtual.createState('TEST-TURNO',4,0);
let outcome = virtual.apply(state,'exchange','TEST-TURNO',0,state.hand[0]);
check(outcome.ok && outcome.state.phase === 'play' && outcome.state.hand.length === 5, 'Il cambio non sostituisce una carta');
state = outcome.state;
const played = state.hand[0];
outcome = virtual.apply(state,'play','TEST-TURNO',0,played);
check(outcome.ok && outcome.state.playedCard === played && !outcome.state.discard.includes(played), 'La carta giocata non resta sul tavolo');
outcome = virtual.apply(outcome.state,'draw-end','TEST-TURNO',0);
check(outcome.ok && outcome.state.discard.includes(played), 'La carta non passa agli scarti a fine turno');

(0, eval)(read('qr-local.js'));
await globalThis.EpoiQrReady;
const qrSvg = globalThis.EpoiQr.toSvg(`https://example.test/#g=${'A'.repeat(900)}`);
assert.match(qrSvg, /^<svg class="epoi-qr-svg"/);
assert.ok(qrSvg.includes('<path'));

if (failures.length) {
  console.error('\nRelease check fallito:\n- ' + failures.join('\n- '));
  process.exit(1);
}
console.log('Release check completato: modalità virtuale v36 consolidata, fullscreen, drag completo, fasi, temi e cache verificati.');
