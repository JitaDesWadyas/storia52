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
check(index.includes('virtual-cards.js?v=33'), 'index.html: motore carte non caricato');
check(index.includes('virtual-table-redesign-v35.js?v=35'), 'index.html: enhancer tavolo v35 non caricato');
check(index.includes('virtual-cards-mobile-v35.css?v=35'), 'index.html: layout mobile v35 non caricato');
check(!index.includes('virtual-cards-mobile-v34.css'), 'index.html: vecchio layout v34 ancora caricato');
check(scripts.indexOf('virtual-table-redesign-v35.js') > scripts.indexOf('virtual-cards.js'), 'L’enhancer v35 viene caricato prima del motore');
check(index.includes('pwa-refresh.js?v=35'), 'index.html: refresh PWA v35 non caricato');

const virtualSource = read('virtual-cards.js');
const redesignSource = read('virtual-table-redesign-v35.js');
const mobileCss = read('virtual-cards-mobile-v35.css');
const rules = read('clean-rules.js');
const tutorial = read('content-polish.js');
const inviteHost = read('clean-invite-host.js');
const inviteData = read('clean-invite-data.js');

check(!virtualSource.includes('Inizia il mio turno'), 'È tornato il pulsante inutile di inizio turno');
check(virtualSource.includes("phase: 'exchange'"), 'Il turno non parte direttamente dal cambio');
check((virtualSource.match(/S\.mount\(/g) || []).length === 1, 'Il tavolo viene rimontato durante il turno');
check(virtualSource.includes('createDragGhost') && virtualSource.includes('requestAnimationFrame(applyDragFrame)'), 'Il trascinamento non usa il motore fluido');
check(virtualSource.includes('playedCard') && virtualSource.includes('settlePlayedCard'), 'La carta giocata non resta sul tavolo');
check(virtualSource.includes('refs.deck.addEventListener') && virtualSource.includes("run('draw-end')"), 'Il mazzo non è cliccabile per pescare');
check(!virtualSource.includes('data-deck-count') && !virtualSource.includes('data-discard-count'), 'Mazzo o scarti mostrano contatori sovrapposti');
check(virtualSource.includes('mazzo-condiviso'), 'La distribuzione non usa un mazzo condiviso');

check(redesignSource.includes('originalRenderVirtualPlayer'), 'Il redesign non avvolge il renderer esistente');
check(redesignSource.includes('virtual-story-stage'), 'Manca la scena della storia sul tavolo');
check(redesignSource.includes('virtual-party-person'), 'Mancano i giocatori rappresentati sul tavolo');
check(redesignSource.includes('dataset.suitSymbol'), 'Le carte non ricevono il simbolo centrale');
check(redesignSource.includes('MutationObserver'), 'Le carte aggiornate non vengono ridecorate');
check(redesignSource.includes('virtual-tool-button'), 'I comandi non sono raccolti nella nuova barra');

check(mobileCss.includes('.virtual-game-v35'), 'Manca il contenitore del redesign v35');
check(mobileCss.includes('grid-template-columns:repeat(4,minmax(0,1fr))'), 'I quattro strumenti non sono raccolti in una barra');
check(mobileCss.includes('grid-template-rows:62px minmax(92px,1fr)'), 'Il tavolo non integra storia e zona di gioco');
check(mobileCss.includes('content:attr(data-suit-symbol)'), 'Manca il simbolo grande al centro delle carte');
check(mobileCss.includes('.virtual-drag-ghost{display:grid!important'), 'Il fantasma non conserva la grafica completa della carta');
check(mobileCss.includes('background:var(--v35-card,#fffdf7)!important'), 'Il fantasma può trascinare soltanto le scritte');
check(mobileCss.includes('.virtual-card-slot.is-drag-source{visibility:hidden!important'), 'La carta originale resta visibile durante il trascinamento');
check(mobileCss.includes('grid-template-rows:auto 29px minmax(184px,1fr) 164px 58px'), 'Il layout mobile non ha zone stabili');
check(mobileCss.includes('height:128px!important'), 'Le carte non hanno una misura mobile controllata');
check(mobileCss.includes('.virtual-actions button{width:100%!important'), 'I pulsanti principali non sono grandi e touch-friendly');
check(mobileCss.includes('html[data-theme="dark"] .virtual-game-v35'), 'Il redesign non supporta il tema scuro');
check(mobileCss.includes('@media(max-width:390px)') && mobileCss.includes('@media(max-height:700px)'), 'Mancano adattamenti per telefoni stretti o bassi');

check(rules.includes('Leggi seme e parità') && rules.includes('Pari:') && rules.includes('Dispari:'), 'Le regole non spiegano correttamente la parità');
check(tutorial.includes('Pari:') && tutorial.includes('Dispari:'), 'Il tutorial non mostra positivo e negativo');
check(inviteHost.includes('S.openGameInvite'), 'Manca la funzione condivisa per aprire il QR');
check(inviteData.includes('data-game-invite'), 'I giocatori non possono riaprire il QR');

const sw = read('sw.js');
check(sw.includes('shell-v35') && sw.includes('runtime-v35'), 'Cache PWA v35 non attiva');
check(sw.includes("'./virtual-cards-mobile-v35.css'") && sw.includes("'./virtual-table-redesign-v35.js'"), 'Il redesign v35 non è precacheato');
check(!sw.includes('virtual-cards-mobile-v34.css'), 'Il vecchio layout v34 è ancora nella cache');
check(read('pwa-refresh.js').includes('epoi_sw_reload_v35'), 'Refresh PWA v35 non attivo');
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
  const assignments = virtual.buildAssignments(`TEST-MAZZO-${playerCount}`, playerCount);
  const assigned = assignments.flatMap(item => item.ownedCards);
  check(assignments.every(item => item.hand.length === 5), `${playerCount} giocatori: una mano iniziale non ha 5 carte`);
  check(assigned.length === 52 && new Set(assigned).size === 52, `${playerCount} giocatori: distribuzione con doppioni o carte mancanti`);
}

let state = virtual.createState('TEST-TURNO', 4, 0);
let result = virtual.apply(state, 'exchange', 'TEST-TURNO', 0, state.hand[0]);
check(result.ok && result.state.phase === 'play' && result.state.hand.length === 5, 'Il cambio non sostituisce una carta');
state = result.state;
const played = state.hand[0];
result = virtual.apply(state, 'play', 'TEST-TURNO', 0, played);
check(result.ok && result.state.playedCard === played && !result.state.discard.includes(played), 'La carta giocata non resta sul tavolo');
result = virtual.apply(result.state, 'draw-end', 'TEST-TURNO', 0);
check(result.ok && result.state.discard.includes(played), 'La carta non passa agli scarti a fine turno');

let recycle = virtual.createState('TEST-RICICLO', 2, 0);
recycle.discard = [...recycle.drawPile];
recycle.drawPile = [];
recycle.phase = 'afterPlay';
result = virtual.apply(recycle, 'draw-end', 'TEST-RICICLO', 0);
check(result.ok && result.reshuffled, 'Gli scarti non vengono rimescolati');

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
const session = { source:'ready', collectionId:'prima-scintilla', readyStoryId:stories[0].id, count:4, delivery:'multi', cardMode:'virtual', cardSeed:'SEED-35', seed:'SEED-35', names:['A','B','C','D'], objectives:S.objectivesForReadyStory(stories[0],4), openingText:stories[0].opening };
const code = await S.encodeGameInvite(session);
const decoded = await S.decodeGameInvite(code);
check(code.startsWith('r4.') && decoded?.cardMode === 'virtual' && decoded?.cardSeed === 'SEED-35', 'Invito r4 non conserva le carte virtuali');
check((await S.decodeGameInvite(`r3.${stories[0].id}.4`))?.cardMode === 'physical', 'Invito r3 non resta compatibile');

if (failures.length) {
  console.error('\nRelease check fallito:\n- ' + failures.join('\n- '));
  process.exit(1);
}
console.log('Release check completato: tavolo narrativo mobile, carte complete, simboli centrali, drag e cache v35 verificati.');
