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
check(index.includes('virtual-cards.js?v=33') && index.includes('virtual-cards.css?v=33'), 'index.html: tavolo mobile v33 non caricato');
check(index.includes('pwa-refresh.js?v=33'), 'index.html: refresh PWA v33 non caricato');

const virtualSource = read('virtual-cards.js');
const virtualCss = read('virtual-cards.css');
const rules = read('clean-rules.js');
const tutorial = read('content-polish.js');
const inviteHost = read('clean-invite-host.js');
const inviteData = read('clean-invite-data.js');

check(!virtualSource.includes('Inizia il mio turno'), 'È tornato il pulsante inutile di inizio turno');
check(virtualSource.includes("phase: 'exchange'"), 'Il turno non parte direttamente dal cambio');
check((virtualSource.match(/S\.mount\(/g) || []).length === 1, 'Il tavolo viene rimontato durante il turno');
check(!virtualSource.includes('outerHTML'), 'La selezione sostituisce ancora parti strutturali del tavolo');
check(virtualSource.includes('Array.from({ length: 5 }') && virtualCss.includes('grid-template-columns:repeat(5,minmax(0,1fr))'), 'Le cinque carte non hanno slot stabili');
check(virtualSource.includes('createDragGhost') && virtualSource.includes('virtual-drag-ghost'), 'Il trascinamento non usa una carta sovrapposta indipendente dal layout');
check(virtualSource.includes('requestAnimationFrame(applyDragFrame)'), 'Il trascinamento non usa requestAnimationFrame');
check(virtualSource.includes('current.dy <= -72'), 'Il rilascio verso l’alto non ha una soglia chiara');
check(!virtualSource.includes('exchangeGesture') && !virtualSource.includes('Math.abs(current.dx) >= 64'), 'Il cambio richiede ancora un trascinamento laterale');
check(virtualSource.includes("const target = action === 'exchange' ? refs.discard : refs.zone"), 'Cambio e giocata non arrivano alle zone superiori corrette');
check(virtualSource.includes('animateGhostTo(current.ghost, target, action)'), 'La carta non completa visivamente il percorso fino al tavolo');
check(virtualSource.includes('playedCard') && virtualSource.includes('settlePlayedCard'), 'La carta giocata non resta sul tavolo');
check(virtualSource.includes('refs.deck.addEventListener') && virtualSource.includes("run('draw-end')"), 'Il mazzo non è cliccabile per pescare');
check(!virtualSource.includes('data-deck-count') && !virtualSource.includes('data-discard-count'), 'Mazzo o scarti mostrano ancora contatori sovrapposti');
check(!virtualSource.includes('data-table-card><b>—'), 'Il tavolo mostra ancora una carta vuota finta');
check(virtualSource.includes('virtual-drop-visual'), 'Manca la nuova area grafica del tavolo');
check(virtualSource.includes('storia52-cards-logo.svg'), 'Mazzo e scarti non usano il logo');
check(virtualSource.includes("S.modal('Storia'") && virtualSource.includes("S.modal('Regole'"), 'Storia e regole non si aprono in popup');
check(virtualSource.includes('mazzo-condiviso'), 'La distribuzione non usa un mazzo condiviso');
check(virtualSource.includes('Scarti rimescolati'), 'Manca l’avviso di rimescolamento');

check(virtualCss.includes('body.virtual-table-active main{display:flex!important'), 'Il gioco non riempie la parte mobile disponibile');
check(virtualCss.includes('grid-template-columns:72px minmax(0,1fr) 72px'), 'Il tavolo mobile non dispone mazzo, area giocata e scarti in una riga');
check(virtualCss.includes('.virtual-hand-section{position:relative;z-index:3') && virtualCss.includes('overflow:visible'), 'La mano può ancora tagliare la carta trascinata');
check(virtualCss.includes('html[data-theme="dark"] .virtual-game') && virtualCss.includes('--vg-card:#202128'), 'Le carte non seguono il tema scuro');
check(virtualCss.includes('--vg-card:#fffdf7'), 'Le carte non hanno il tema chiaro');
check(virtualCss.includes('.virtual-discard-card.empty img'), 'Gli scarti vuoti non hanno una grafica rifinita');
check(virtualCss.includes('.virtual-drop-visual') && virtualCss.includes('.virtual-play-zone.drag-armed'), 'Il tavolo non reagisce al trascinamento');
check(virtualCss.includes('.virtual-popup-scroll'), 'I popup non hanno un’area scorrevole propria');

check(rules.includes('Leggi seme e parità') && rules.includes('Pari:') && rules.includes('Dispari:'), 'Le regole non spiegano correttamente la parità');
check(tutorial.includes('Pari:') && tutorial.includes('Dispari:'), 'Il tutorial non mostra positivo e negativo');
check(inviteHost.includes('S.openGameInvite'), 'Manca la funzione condivisa per aprire il QR');
check(inviteData.includes('data-game-invite'), 'I giocatori non possono riaprire il QR');

const sw = read('sw.js');
check(sw.includes('shell-v33') && sw.includes('runtime-v33'), 'Cache PWA v33 non attiva');
check(sw.includes("'./virtual-cards.js'") && sw.includes("'./virtual-cards.css'"), 'Carte virtuali non precacheate');
check(read('pwa-refresh.js').includes('epoi_sw_reload_v33'), 'Refresh PWA v33 non attivo');
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
  for (let left = 0; left < assignments.length; left += 1) {
    for (let right = left + 1; right < assignments.length; right += 1) {
      check(!assignments[left].ownedCards.some(card => assignments[right].ownedCards.includes(card)), `${playerCount} giocatori: una carta appartiene a due telefoni`);
    }
  }
}

let state = virtual.createState('TEST-TURNO', 4, 0);
check(state.version === 3 && state.phase === 'exchange', 'Lo stato non usa il motore v3');
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
const session = { source:'ready', collectionId:'prima-scintilla', readyStoryId:stories[0].id, count:4, delivery:'multi', cardMode:'virtual', cardSeed:'SEED-33', seed:'SEED-33', names:['A','B','C','D'], objectives:S.objectivesForReadyStory(stories[0],4), openingText:stories[0].opening };
const code = await S.encodeGameInvite(session);
const decoded = await S.decodeGameInvite(code);
check(code.startsWith('r4.') && decoded?.cardMode === 'virtual' && decoded?.cardSeed === 'SEED-33', 'Invito r4 non conserva le carte virtuali');
check((await S.decodeGameInvite(`r3.${stories[0].id}.4`))?.cardMode === 'physical', 'Invito r3 non resta compatibile');

if (failures.length) {
  console.error('\nRelease check fallito:\n- ' + failures.join('\n- '));
  process.exit(1);
}
console.log('Release check completato: tavolo mobile, trascinamento verso l’alto, nessun contatore visibile e cache v33 verificati.');