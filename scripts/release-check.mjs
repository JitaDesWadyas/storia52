import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = path.resolve(import.meta.dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const exists = file => fs.existsSync(path.join(root, file));
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };

const files = fs.readdirSync(root);
for (const file of files.filter(name => name.endsWith('.js'))) {
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
check(index.includes('virtual-cards.js?v=31') && index.includes('virtual-cards.css?v=31'), 'index.html: carte virtuali v31 non caricate');
check(index.includes('clean-rules.js?v=31') && index.includes('content-polish.js?v=31'), 'index.html: regole v31 non caricate');
check(index.includes('clean-invite-host.js?v=31') && index.includes('clean-invite-data.js?v=31'), 'index.html: QR in partita v31 non caricato');
check(index.includes('pwa-refresh.js?v=31'), 'index.html: refresh PWA v31 non caricato');

const virtualSource = read('virtual-cards.js');
const virtualCss = read('virtual-cards.css');
const rules = read('clean-rules.js');
const tutorial = read('content-polish.js');
const inviteHost = read('clean-invite-host.js');
const inviteData = read('clean-invite-data.js');
check(!virtualSource.includes('Inizia il mio turno'), 'È ancora presente il pulsante inutile di inizio turno');
check(virtualSource.includes("phase: 'exchange'"), 'Il turno non parte direttamente dal cambio');
check(virtualSource.includes('pointerdown') && virtualSource.includes('pointermove'), 'Mancano i gesti di trascinamento');
check(virtualSource.includes('syncSelection') && virtualSource.includes('zone.outerHTML'), 'La selezione rimonta ancora l’intera schermata');
check(virtualSource.includes('playedCard') && virtualSource.includes('settlePlayedCard'), 'La carta giocata non resta sul tavolo');
check(virtualSource.includes('storia52-cards-logo.svg'), 'Il mazzo non usa il logo');
check(virtualSource.includes('data-virtual-invite'), 'La mano virtuale non espone il QR');
check(virtualSource.includes('Mazzo finito: scarti rimescolati'), 'Manca il rimescolamento degli scarti');
check(virtualCss.includes('grid-template-columns:repeat(5,minmax(0,1fr))'), 'Le cinque carte non sono sempre visibili');
check(!/\.virtual-hand\{[^}]*overflow-x\s*:\s*auto/s.test(virtualCss), 'La mano richiede ancora scroll orizzontale');
check(virtualCss.includes('--virtual-bg:#0d0e12'), 'Il tavolo non è scuro');
check(virtualCss.includes('@keyframes virtualShuffle') && virtualCss.includes('@keyframes dealCard'), 'Animazioni virtuali mancanti');
check(rules.includes('Leggi seme e parità') && rules.includes('Pari:') && rules.includes('Dispari:'), 'Le regole non spiegano correttamente la parità');
check(tutorial.includes('Pari:') && tutorial.includes('Dispari:'), 'Il tutorial non mostra positivo e negativo');
check(inviteHost.includes('S.openGameInvite'), 'Manca la funzione condivisa per aprire il QR');
check(inviteData.includes('data-game-invite'), 'I giocatori non possono riaprire il QR');

const sw = read('sw.js');
check(sw.includes('shell-v31') && sw.includes('runtime-v31'), 'Cache PWA v31 non attiva');
check(sw.includes("'./virtual-cards.js'") && sw.includes("'./virtual-cards.css'"), 'Carte virtuali non precacheate');
check(read('pwa-refresh.js').includes('epoi_sw_reload_v31'), 'Refresh PWA v31 non attivo');
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

const assignments = virtual.buildAssignments('TEST-MAZZO', 8);
const assigned = assignments.flatMap(item => item.ownedCards);
check(assignments.every(item => item.hand.length === 5), 'Ogni giocatore non riceve 5 carte');
check(assigned.length === 52 && new Set(assigned).size === 52, 'Distribuzione con carte duplicate o mancanti');

let state = virtual.createState('TEST-TURNO', 4, 0);
check(state.phase === 'exchange', 'Il turno non inizia dal cambio');
let result = virtual.apply(state, 'play', 'TEST-TURNO', 0, state.hand[0]);
check(!result.ok, 'È possibile giocare prima del cambio');
result = virtual.apply(state, 'exchange', 'TEST-TURNO', 0, state.hand[0]);
check(result.ok && result.state.phase === 'play' && result.state.hand.length === 5, 'Il cambio non sostituisce una carta');
state = result.state;
check(!virtual.apply(state, 'exchange', 'TEST-TURNO', 0, state.hand[0]).ok, 'È possibile cambiare due volte');
const played = state.hand[0];
result = virtual.apply(state, 'play', 'TEST-TURNO', 0, played);
check(result.ok && result.state.playedCard === played && !result.state.discard.includes(played), 'La carta giocata non resta sul tavolo');
result = virtual.apply(result.state, 'draw-end', 'TEST-TURNO', 0);
check(result.ok && result.state.phase === 'exchange' && result.state.discard.includes(played), 'La carta non passa agli scarti a fine turno');

let recycle = virtual.createState('TEST-RICICLO', 2, 0);
recycle.discard = [...recycle.drawPile];
recycle.drawPile = [];
recycle.phase = 'afterPlay';
result = virtual.apply(recycle, 'draw-end', 'TEST-RICICLO', 0);
check(result.ok && result.reshuffled && result.state.cycle === 1, 'Gli scarti non vengono rimescolati');

let ending = virtual.createState('TEST-FINALE', 2, 0);
const last = ending.hand[0];
ending.discard.push(...ending.drawPile, ...ending.hand.slice(1));
ending.drawPile = [];
ending.hand = [last];
ending.phase = 'play';
result = virtual.apply(ending, 'play', 'TEST-FINALE', 0, last);
check(result.ok && result.state.hand.length === 0 && result.state.playedCard === last, 'L’ultima carta non resta sul tavolo');
check(virtual.apply(result.state, 'final', 'TEST-FINALE', 0).state.phase === 'final', 'La mano vuota non raggiunge il finale');

evaluate('collection-data.js');
const stories = globalThis.STORIA52_READY_STORIES || [];
check(stories.length === 8 && new Set(stories.map(story => story.category)).size === 8, 'La collezione gratuita non contiene 8 categorie');
for (const file of ['archive-v20-objectives-01.js','archive-v20-objectives-02.js','archive-v20-objectives-03-04.js','archive-v20-objectives-05-06.js','archive-v20-objectives-07-08.js']) evaluate(file);
evaluate('collection-objectives.js');
check(Object.keys(globalThis.STORIA52_READY_OBJECTIVES || {}).length === 8, 'Obiettivi non limitati alle 8 storie');

(0, eval)(read('qr-local.js'));
await globalThis.EpoiQrReady;
const qrSvg = globalThis.EpoiQr.toSvg(`https://example.test/#g=${'A'.repeat(900)}`);
assert.match(qrSvg, /^<svg class="epoi-qr-svg"/);
assert.ok(qrSvg.includes('<path'));

const cleanText = (value, max = 500) => String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
globalThis.window.S52 = {
  limits: { name: 28, inviteCode: 6000 }, stories, primaryCollectionId: 'prima-scintilla', cleanText,
  cleanName: (value, index = 0) => cleanText(value, 28) || `Giocatore ${index + 1}`,
  normalizeSession: session => session,
  storyAllowedInSession: (session, story) => session.collectionId === 'prima-scintilla' && story?.collectionId === 'prima-scintilla',
  objectivesForReadyStory: (story, count) => Array.from({ length: count }, (_, slot) => ({ custom: true, storyId: story.id, slot, title: 'Piano', text: 'Testo', finale: 'Finale' }))
};
(0, eval)(read('invite-codec.js'));
const S = globalThis.window.S52;
const session = { source:'ready', collectionId:'prima-scintilla', readyStoryId:stories[0].id, count:4, delivery:'multi', cardMode:'virtual', cardSeed:'SEED-31', seed:'SEED-31', names:['A','B','C','D'], objectives:S.objectivesForReadyStory(stories[0],4), openingText:stories[0].opening };
const code = await S.encodeGameInvite(session);
const decoded = await S.decodeGameInvite(code);
check(code.startsWith('r4.') && decoded?.cardMode === 'virtual' && decoded?.cardSeed === 'SEED-31', 'Invito r4 non conserva le carte virtuali');
check((await S.decodeGameInvite(`r3.${stories[0].id}.4`))?.cardMode === 'physical', 'Invito r3 non resta compatibile');

if (failures.length) {
  console.error('\nRelease check fallito:\n- ' + failures.join('\n- '));
  process.exit(1);
}
console.log(`Release check completato: parità, mano senza scroll, gesti, carta sul tavolo, QR e cache v31 verificati.`);
