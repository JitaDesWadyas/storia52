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
check(index.includes('virtual-cards.js?v=37'), 'index.html: motore virtuale v37 non caricato');
check(index.includes('virtual-cards.css?v=37'), 'index.html: stile virtuale v37 non caricato');
check(index.includes('clean-rules.js?v=32'), 'index.html: regole aggiornate non caricate');
check(index.includes('clean-objectives.js?v=20'), 'index.html: fix obiettivo in partita non caricato');
check(!index.includes('virtual-cards-mobile-v35.css') && !index.includes('virtual-table-redesign-v35.js'), 'index.html: vecchi override v35 ancora caricati');
check(index.includes('pwa-refresh.js?v=37'), 'index.html: refresh PWA v37 non caricato');

const virtualSource = read('virtual-cards.js');
const virtualCss = read('virtual-cards.css');
const rulesSource = read('clean-rules.js');
const objectivesSource = read('clean-objectives.js');
check(virtualSource.includes("phase: 'exchange'"), 'Il turno non parte dal cambio');
check(virtualSource.includes('mazzo-condiviso'), 'La distribuzione non usa il mazzo condiviso');
check(virtualSource.includes('virtual-card-symbol'), 'Le carte non hanno il simbolo centrale reale');
check(virtualSource.includes('data-toggle-cards'), 'Manca il comando per nascondere le carte');
check(virtualSource.includes('S.openRulesModal?.()'), 'Il menu virtuale non apre le stesse regole della home');
check(virtualSource.includes('drag-suggested') && virtualSource.includes('selectCard(current.id, true)'), 'Il drag non seleziona la carta e non evidenzia l’azione');
check(virtualSource.includes('setPointerCapture') && virtualSource.includes('requestAnimationFrame'), 'Il drag non usa Pointer Events e requestAnimationFrame');
check(virtualSource.includes('virtual-drag-overlay'), 'Il drag non usa un overlay fullscreen');
check(virtualSource.includes('virtual-confetti') && virtualSource.includes('burstConfetti'), 'Manca la celebrazione del finale accettato');
check(virtualSource.includes('Carta scartata') && virtualSource.includes('Carta giocata'), 'Il tavolo non distingue carta scartata e carta giocata');
check(!virtualSource.includes('virtual-discard-stack') && !virtualSource.includes('GIOCA QUI') && !virtualSource.includes('SCARTI</small>'), 'Sono tornate le vecchie zone separate Scarti/Gioca qui');
check(virtualSource.includes('playedCard') && virtualSource.includes('settlePlayedCard'), 'La carta giocata non resta sul tavolo');
check((virtualSource.match(/S\.mount\(/g) || []).length === 1, 'Il tavolo viene rimontato durante il turno');
check(objectivesSource.includes('if (duringGame) return;') && objectivesSource.includes('if (!duringGame && (changed || forceRefresh))'), 'La chiusura dell’obiettivo può ancora rimontare la schermata di gioco');
check(rulesSource.includes('rule-card-mini-sections') && rulesSource.includes('<details open>') && rulesSource.includes('Figure e assi'), 'Le regole delle carte non sono divise in mini sezioni');

check(virtualCss.includes('position:fixed!important;') && virtualCss.includes('height:100dvh!important'), 'La modalità non è fullscreen reale');
check(virtualCss.includes('html body.virtual-table-active .site-header') && virtualCss.includes('.site-footer{display:none!important}'), 'Header o footer restano visibili');
check(virtualCss.includes('env(safe-area-inset-bottom)'), 'Mancano le safe area');
check(virtualCss.includes('flex-wrap:wrap!important'), 'La mano non dispone le carte su più righe');
check(virtualCss.includes('width:clamp(96px,28vw,108px)') && virtualCss.includes('height:clamp(116px,15dvh,130px)'), 'Le carte della mano non hanno dimensioni mobili bilanciate');
check(virtualCss.includes('grid-template-rows:auto auto clamp(196px,27dvh,246px)'), 'Il tavolo non ha spazio stabile sufficiente');
check(virtualCss.includes('.virtual-table-card[hidden],.virtual-focus-placeholder[hidden]{display:none!important}'), 'Le carte nascoste del tavolo possono ancora occupare spazio e tagliare il layout');
check(virtualCss.includes('touch-action:none!important'), 'Le carte non bloccano il pan del browser');
check(virtualCss.includes('visibility:hidden!important'), 'La carta originale non viene nascosta correttamente durante il drag');
check(virtualCss.includes('.virtual-actions[data-count="1"]'), 'L’azione singola non occupa tutta la barra');
check(virtualCss.includes('.virtual-actions button:disabled'), 'Le azioni senza carta selezionata non appaiono disabilitate');
check(virtualCss.includes('html[data-theme="dark"] .virtual-game'), 'Il tema scuro non è supportato');
check(virtualCss.includes('@media(max-height:700px)'), 'Manca l’adattamento per schermi bassi');
check(virtualCss.includes('.rule-card-mini-sections>details'), 'Le mini sezioni delle regole non hanno uno stile dedicato');

const sw = read('sw.js');
check(sw.includes('shell-v37') && sw.includes('runtime-v37'), 'Cache PWA v37 non attiva');
check(sw.includes("'./virtual-cards.css'") && sw.includes("'./virtual-cards.js'"), 'Carte virtuali non precacheate');
check(!sw.includes('virtual-cards-mobile-v35.css') && !sw.includes('virtual-table-redesign-v35.js'), 'Vecchi file v35 ancora nella cache');
check(read('pwa-refresh.js').includes('epoi_sw_reload_v37'), 'Refresh PWA v37 non attivo');
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
for (const playerCount of [2, 3, 4, 5, 6, 7, 8]) {
  const assignments = virtual.buildAssignments(`TEST-${playerCount}`, playerCount);
  const assigned = assignments.flatMap(item => item.ownedCards);
  check(assignments.every(item => item.hand.length === 5), `${playerCount} giocatori: mano iniziale errata`);
  check(assigned.length === 52 && new Set(assigned).size === 52, `${playerCount} giocatori: doppioni o carte mancanti`);
}
let state = virtual.createState('TEST-TURNO', 4, 0);
let outcome = virtual.apply(state, 'exchange', 'TEST-TURNO', 0, state.hand[0]);
check(outcome.ok && outcome.state.phase === 'play' && outcome.state.hand.length === 5, 'Il cambio non sostituisce una carta');
state = outcome.state;
const played = state.hand[0];
outcome = virtual.apply(state, 'play', 'TEST-TURNO', 0, played);
check(outcome.ok && outcome.state.playedCard === played && !outcome.state.discard.includes(played), 'La carta giocata non resta sul tavolo');
outcome = virtual.apply(outcome.state, 'draw-end', 'TEST-TURNO', 0);
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
console.log('Release check completato: modalità virtuale v37, proporzioni mobili bilanciate, selezione/drag, regole, privacy, finale e cache verificati.');
