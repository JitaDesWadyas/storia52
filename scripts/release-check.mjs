import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = path.resolve(import.meta.dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const exists = file => fs.existsSync(path.join(root, file));
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };

const rootFiles = fs.readdirSync(root);
for (const file of rootFiles.filter(name => name.endsWith('.js'))) {
  try { new Function(read(file)); }
  catch (error) { failures.push(`${file}: sintassi non valida (${error.message})`); }
}

for (const htmlFile of ['index.html', 'privacy.html', 'copyright.html']) {
  const html = read(htmlFile);
  for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    const reference = match[1];
    if (/^(?:https?:|mailto:|tel:|data:|#)/i.test(reference)) continue;
    const clean = reference.split(/[?#]/)[0];
    if (clean && clean !== './') check(exists(clean), `${htmlFile}: risorsa locale mancante ${clean}`);
  }
}

for (const cssFile of rootFiles.filter(name => name.endsWith('.css'))) {
  for (const match of read(cssFile).matchAll(/url\((?:"|')?([^"')]+)(?:"|')?\)/g)) {
    const reference = match[1].trim();
    if (/^(?:https?:|data:|#)/i.test(reference)) continue;
    const clean = reference.split(/[?#]/)[0];
    if (clean) check(exists(clean), `${cssFile}: risorsa locale mancante ${clean}`);
  }
}

const index = read('index.html');
const scriptOrder = [...index.matchAll(/<script src="([^"]+)"/g)].map(match => match[1].split('?')[0]);
const styleOrder = [...index.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map(match => match[1].split('?')[0]);
const scriptIndex = name => scriptOrder.indexOf(name);
const styleIndex = name => styleOrder.indexOf(name);

check(new Set(scriptOrder).size === scriptOrder.length, 'index.html: script duplicati');
check(new Set(styleOrder).size === styleOrder.length, 'index.html: fogli di stile duplicati');
check(!index.includes('<style>'), 'index.html: contiene ancora CSS inline');
check(index.includes('initial-skeleton'), 'index.html: skeleton iniziale mancante');
check(styleIndex('loading-skeleton.css') >= 0, 'index.html: loading-skeleton.css non caricato');
check(styleIndex('release-polish.css') >= 0, 'index.html: release-polish.css non caricato');
check(styleIndex('virtual-cards.css') >= 0, 'index.html: virtual-cards.css non caricato');
check(scriptIndex('collection-data.js') < scriptIndex('clean-core.js'), 'index.html: dati collezione caricati dopo il core');
check(scriptIndex('virtual-cards.js') > scriptIndex('clean-rules.js'), 'index.html: carte virtuali caricate prima delle regole');
check(scriptIndex('virtual-cards.js') < scriptIndex('clean-config.js'), 'index.html: carte virtuali caricate dopo la configurazione');
check(scriptIndex('collection-objectives.js') > scriptIndex('archive-v20-objectives-07-08.js'), 'index.html: filtro obiettivi caricato troppo presto');
check(scriptIndex('ready-story-objectives.js') > scriptIndex('collection-objectives.js'), 'index.html: assegnazione obiettivi caricata prima dei dati');
check(scriptIndex('collection-controller.js') > scriptIndex('clean-stories-view.js'), 'index.html: controller collezioni caricato prima della vista');
check(scriptIndex('collection-controller.js') < scriptIndex('clean-objectives.js'), 'index.html: controller collezioni caricato troppo tardi');
check(scriptIndex('invite-codec.js') < scriptIndex('clean-invite-host.js'), 'index.html: codec inviti caricato troppo tardi');
check(scriptIndex('pwa-refresh.js') > scriptIndex('clean-init.js'), 'index.html: refresh PWA non caricato alla fine');
check(!scriptOrder.includes('clean-opening.js'), 'index.html: carica ancora il flusso incipit disattivato');
check(!scriptOrder.some(file => /^ready-story-objectives-\d+\.js$/.test(file)), 'index.html: carica ancora i vecchi pacchetti obiettivi');
check(!scriptOrder.some(file => /^ready-stories-/.test(file)), 'index.html: carica ancora i vecchi wrapper storie');

const activeScripts = scriptOrder.filter(file => file.endsWith('.js'));
for (const file of activeScripts) {
  check(!read(file).includes('document.write'), `${file}: usa ancora document.write`);
}

const controller = read('collection-controller.js');
const collectionCss = read('collection-prima-scintilla.css');
const setup = read('clean-config.js');
const virtualSource = read('virtual-cards.js');
const virtualCss = read('virtual-cards.css');
check(!controller.includes('Qui trovate il contesto generale'), 'Testo interno presente nella scelta collezione');
check(!controller.includes('senza ripetere queste informazioni'), 'Testo interno presente nella scelta collezione');
check(!controller.includes('modificando il salvataggio locale'), 'Dettagli tecnici mostrati agli utenti');
check(controller.includes('Ogni collezione riunisce storie con una propria atmosfera'), 'Testo definitivo della scelta collezione mancante');
check(!controller.includes('collection-coming-overlay'), 'Il cartello In arrivo copre ancora la scheda');
check(!collectionCss.includes('collection-coming-overlay'), 'Il vecchio overlay In arrivo è ancora nello stile');
check(collectionCss.includes('collection-status-coming'), 'Lo stato In arrivo discreto è mancante');
check(setup.includes("session.delivery === 'multi'"), 'La modalità carte non dipende dai telefoni separati');
check(setup.includes('data-card-mode'), 'La scelta del mazzo non è presente nella configurazione');
check(setup.includes("if (session.delivery === 'single') session.cardMode = 'physical'"), 'Un telefono non forza il mazzo reale');
check(setup.includes('mazzo francese da 52 carte'), 'La descrizione del mazzo reale non è precisa');
check(virtualSource.includes('Mazzo finito: scarti rimescolati'), 'Manca l’avviso di rimescolamento');
check(virtualSource.includes("action === 'exchange'"), 'Manca la fase di cambio carta');
check(virtualSource.includes("action === 'draw-end'"), 'Manca la fase di pesca finale');
check(virtualCss.includes('@keyframes dealCard') && virtualCss.includes('@keyframes virtualShuffle'), 'Animazioni delle carte virtuali mancanti');
check(!read('clean-home.js').includes('Il 6 è pari'), 'Il tutorial usa ancora la parità');
check(!read('content-polish.js').includes('PARI') && !read('content-polish.js').includes('DISPARI'), 'Il polish reintroduce ancora la parità');
check(!read('clean-rules.js').includes('PARI') && !read('clean-rules.js').includes('DISPARI'), 'Le regole mostrano ancora la parità');

const removedFiles = [
  'collection-prima-scintilla-stories.js', 'ready-stories-data.js', 'collection-prima-scintilla.js',
  'collection-prima-scintilla-ui.js', 'collection-prima-scintilla-outcomes.js', 'collection-security.js',
  'clean-opening.js', 'archive-v20-session-guard.js', 'archive-v20-invite-codec.js',
  'pwa-refresh-v26.js', 'pwa-refresh-v27.js', 'pwa-refresh-v28.js',
  'release-fixes-v17.css', 'release-fixes-v19.css', 'release-final-v21.css',
  'release-fixes-v23.css', 'release-fixes-v25.css', 'release-fixes-v26.css',
  'opening-loader.js', 'opening-engine.css', 'opening-engine-core.js', 'opening-engine-priority.js',
  'opening-engine-generate.js', 'opening-engine-compose.js', 'opening-engine-copy.js', 'opening-engine-ui.js',
  'opening-engine-stability-loader.js', 'opening-engine-indexes.js', 'opening-engine-parts.js',
  'opening-engine-stable-batch.js', 'opening-bank-small.js', 'opening-bank-people-safe.js',
  'opening-bank-duties.js', 'opening-bank-scenes-a.js', 'opening-bank-scenes-b.js',
  'opening-bank-actions-safe.js', 'opening-bank-obstacles-safe.js'
];
for (const file of removedFiles) check(!exists(file), `File legacy ancora presente: ${file}`);
for (let index = 1; index <= 13; index += 1) {
  check(!exists(`ready-story-objectives-${String(index).padStart(2, '0')}.js`), `Vecchio pacchetto obiettivi ${index} ancora presente`);
}
for (const suffix of ['realistico', 'mistero', 'fantascienza', 'fantasy', 'horror', 'amore', 'avventura', 'commedia']) {
  check(!exists(`ready-stories-${suffix}.js`), `Wrapper storie legacy ancora presente: ${suffix}`);
  check(!exists(`archive-v20-stories-${suffix}.js`), `Archivio storie duplicato ancora presente: ${suffix}`);
}
check(!exists('archive-v20-data.js'), 'Archivio categorie duplicato ancora presente');

const allText = rootFiles
  .filter(name => /\.(?:html|css|js|webmanifest)$/i.test(name) && exists(name))
  .map(read)
  .join('\n');
check(!allText.includes('Harminger'), 'È ancora presente un riferimento a Harminger');
check(!allText.includes('Massimo 28 caratteri'), 'È ancora presente il testo fisso sul limite dei nomi');
check(!allText.includes('api.qrserver.com'), 'È ancora presente il generatore QR esterno');
check(!allText.includes('document.write'), 'È ancora presente document.write nel codice');
check(!allText.includes('const encoded='), 'Il QR locale contiene ancora un payload compresso');

const portrait = fs.readFileSync(path.join(root, 'creator-jita.webp'));
check(portrait.length > 10000, 'Il ritratto WebP sembra vuoto o troppo piccolo');
check(portrait.subarray(0, 4).toString('ascii') === 'RIFF' && portrait.subarray(8, 12).toString('ascii') === 'WEBP', 'creator-jita.webp non è un WebP valido');
check(read('release-polish.css').includes('creator-jita.webp?v=29'), 'La scheda del creatore non usa il WebP');

const sw = read('sw.js');
const coreBlock = sw.match(/const CORE_FILES = \[([\s\S]*?)\];/)?.[1] || '';
for (const match of coreBlock.matchAll(/['"]\.\/([^'"]*)['"]/g)) {
  const file = match[1];
  if (file) check(exists(file), `sw.js: file in cache mancante ${file}`);
}
check(sw.includes('shell-v30') && sw.includes('runtime-v30'), 'sw.js: cache PWA v30 non attiva');
check(sw.includes("'./collection-data.js'"), 'sw.js: dati collezione non precacheati');
check(sw.includes("'./collection-controller.js'"), 'sw.js: controller collezione non precacheato');
check(sw.includes("'./virtual-cards.js'") && sw.includes("'./virtual-cards.css'"), 'sw.js: carte virtuali non precacheate');
check(sw.includes("'./release-polish.css'"), 'sw.js: CSS finale non precacheato');
check(!sw.includes('archive-v20-stories-'), 'sw.js: precachea ancora gli archivi storie legacy');
check(sw.includes('cache.addAll(requests)'), 'sw.js: installazione cache non atomica');
check(sw.includes('staleWhileRevalidate'), 'sw.js: strategia rete instabile mancante');
check(read('pwa-refresh.js').includes('epoi_sw_reload_v30'), 'pwa-refresh.js: refresh v30 non attivo');

const evaluate = file => (0, eval)(read(file));
globalThis.window = globalThis;
delete globalThis.S52;
evaluate('virtual-cards.js');
const virtual = globalThis.EpoiVirtualCardsEngine;
check(Boolean(virtual), 'Motore carte virtuali non inizializzato');
check(virtual?.cardIds.length === 52 && new Set(virtual?.cardIds).size === 52, 'Il mazzo virtuale non contiene 52 carte uniche');
check(virtual?.meaningFor('H-7').title === 'Relazione', 'Il significato di Cuori non è corretto');
check(virtual?.meaningFor('D-6').title === 'Scoperta', 'Il significato di Quadri dipende ancora dalla parità');
check(virtual?.meaningFor('H-J').title.includes('favorevole'), 'Una figura rossa non è favorevole');
check(virtual?.meaningFor('S-A').title.includes('problematico'), 'Un Asso nero non è problematico');

const assignments = virtual.buildAssignments('TEST-MAZZO', 8);
const assignedCards = assignments.flatMap(assignment => assignment.ownedCards);
check(assignments.length === 8, 'Il mazzo non viene distribuito a 8 giocatori');
check(assignments.every(assignment => assignment.hand.length === 5), 'Ogni mano iniziale deve avere 5 carte');
check(assignedCards.length === 52 && new Set(assignedCards).size === 52, 'Le mani private producono carte duplicate o mancanti');

let virtualState = virtual.createState('TEST-TURNO', 4, 0);
let outcome = virtual.apply(virtualState, 'start', 'TEST-TURNO', 0);
check(outcome.ok && outcome.state.phase === 'exchange', 'Il turno non parte dalla fase di cambio');
virtualState = outcome.state;
outcome = virtual.apply(virtualState, 'play', 'TEST-TURNO', 0, virtualState.hand[0]);
check(!outcome.ok, 'È possibile giocare prima del cambio iniziale');
outcome = virtual.apply(virtualState, 'exchange', 'TEST-TURNO', 0, virtualState.hand[0]);
check(outcome.ok && outcome.state.phase === 'play' && outcome.state.hand.length === 5, 'Il cambio non sostituisce esattamente una carta');
virtualState = outcome.state;
outcome = virtual.apply(virtualState, 'exchange', 'TEST-TURNO', 0, virtualState.hand[0]);
check(!outcome.ok, 'È possibile cambiare due volte nello stesso turno');
outcome = virtual.apply(virtualState, 'play', 'TEST-TURNO', 0, virtualState.hand[0]);
check(outcome.ok && outcome.state.phase === 'afterPlay' && outcome.state.hand.length === 4, 'La giocata non rimuove esattamente una carta');
virtualState = outcome.state;
outcome = virtual.apply(virtualState, 'draw-end', 'TEST-TURNO', 0);
check(outcome.ok && outcome.state.phase === 'waiting' && outcome.state.hand.length === 5, 'La pesca non chiude correttamente il turno');

let recycleState = virtual.createState('TEST-RICICLO', 2, 0);
recycleState.discard = [...recycleState.drawPile];
recycleState.drawPile = [];
recycleState.phase = 'afterPlay';
outcome = virtual.apply(recycleState, 'draw-end', 'TEST-RICICLO', 0);
check(outcome.ok && outcome.reshuffled && outcome.state.cycle === 1, 'Gli scarti non vengono rimescolati quando il mazzo finisce');

let finalState = virtual.createState('TEST-FINALE', 2, 0);
finalState.hand = [finalState.hand[0]];
finalState.discard.push(...finalState.drawPile, ...finalState.hand.slice(1));
finalState.drawPile = [];
finalState.phase = 'play';
outcome = virtual.apply(finalState, 'play', 'TEST-FINALE', 0, finalState.hand[0]);
check(outcome.ok && outcome.state.hand.length === 0, 'L’ultima carta non svuota la mano');
outcome = virtual.apply(outcome.state, 'final', 'TEST-FINALE', 0);
check(outcome.ok && outcome.state.phase === 'final', 'La mano vuota non può collegarsi al finale');

evaluate('collection-data.js');
const collections = globalThis.STORIA52_READY_COLLECTIONS || [];
const stories = globalThis.STORIA52_READY_STORIES || [];
const available = collections.find(collection => collection.id === 'prima-scintilla');
const coming = collections.find(collection => collection.id === 'nuove-scintille');
check(collections.length === 2, 'Devono esistere due collezioni');
check(available?.status === 'available' && available.storyCount === 8, 'La Prima Scintilla deve avere 8 storie');
check(coming?.status === 'coming-soon' && coming.storyCount === 16, 'Nuove Scintille deve indicare 16 storie');
check(stories.length === 8 && new Set(stories.map(story => story.category)).size === 8, 'Servono 8 storie, una per categoria');
check(stories.every(story => story.collectionId === 'prima-scintilla'), 'Una storia non appartiene alla collezione gratuita');
check(available?.independence.includes('indipendente'), 'Manca la nota sull’indipendenza delle storie');
check(globalThis.STORIA52_FEATURES?.customOpening === false, 'L’incipit personalizzato non è disattivato');

for (const file of [
  'archive-v20-objectives-01.js', 'archive-v20-objectives-02.js', 'archive-v20-objectives-03-04.js',
  'archive-v20-objectives-05-06.js', 'archive-v20-objectives-07-08.js'
]) evaluate(file);
evaluate('collection-objectives.js');
const objectiveGroups = globalThis.STORIA52_READY_OBJECTIVES || {};
check(Object.keys(objectiveGroups).length === 8, 'In memoria devono restare solo 8 gruppi di obiettivi');
check(Object.values(objectiveGroups).every(group => Array.isArray(group) && group.length === 8), 'Ogni storia deve avere 8 finali');
check(globalThis.STORIA52_COLLECTION_REWRITTEN_OUTCOMES === 16, 'Devono essere applicati 16 finali editoriali');

(0, eval)(read('qr-local.js'));
await globalThis.EpoiQrReady;
const qrSvg = globalThis.EpoiQr.toSvg(`https://example.test/storia52/#g=${'A'.repeat(900)}`);
assert.match(qrSvg, /^<svg class="epoi-qr-svg"/);
assert.ok(qrSvg.includes('<path'));

const cleanText = (value, max = 500) => String(value ?? '').normalize('NFKC').replace(/[\u0000-\u001F\u007F]/g, '').replace(/\s+/g, ' ').trim().slice(0, max);
globalThis.window.S52 = {
  limits: { name: 28, inviteCode: 6000 },
  stories,
  primaryCollectionId: 'prima-scintilla',
  cleanText,
  cleanName: (value, index = 0) => cleanText(value, 28) || `Giocatore ${index + 1}`,
  normalizeSession: session => session,
  storyAllowedInSession: (session, story) => Boolean(session.collectionId === 'prima-scintilla' && story?.collectionId === 'prima-scintilla'),
  objectivesForReadyStory: (story, count) => Array.from({ length: count }, (_, index) => ({ custom: true, storyId: story.id, slot: index, title: `Piano ${index + 1}`, text: 'Testo', finale: 'Finale' }))
};
(0, eval)(read('invite-codec.js'));
const S = globalThis.window.S52;
const story = stories[0];
const readySession = {
  source: 'ready', collectionId: 'prima-scintilla', readyStoryId: story.id, count: 4,
  delivery: 'multi', cardMode: 'virtual', cardSeed: 'SEED-CARTE-30', seed: 'SEED-CARTE-30',
  names: ['Marta', 'Luca', '', 'Sara'], objectives: S.objectivesForReadyStory(story, 4), openingText: story.opening
};
const readyCode = await S.encodeGameInvite(readySession);
check(readyCode.startsWith('r4.'), 'Invito storia pronta non usa il formato r4');
const readyDecoded = await S.decodeGameInvite(readyCode);
check(readyDecoded?.collectionId === 'prima-scintilla' && readyDecoded?.readyStoryId === story.id, 'Invito non ricostruisce la collezione');
check(readyDecoded?.cardMode === 'virtual' && readyDecoded?.cardSeed === 'SEED-CARTE-30', 'Invito non conserva le carte virtuali');
const legacyDecoded = await S.decodeGameInvite(`r3.${story.id}.4`);
check(legacyDecoded?.cardMode === 'physical', 'Un invito r3 precedente non viene mantenuto come mazzo reale');
check(await S.decodeGameInvite('c2.jAAAA') === null, 'Un vecchio invito personalizzato viene ancora accettato');
check(await S.decodeGameInvite('A'.repeat(6001)) === null, 'Invito enorme non rifiutato');

if (failures.length) {
  console.error('\nRelease check fallito:\n- ' + failures.join('\n- '));
  process.exit(1);
}
console.log(`Release check completato: ${scriptOrder.length} script, carte virtuali, turni guidati, rimescolamento e cache v30 verificati.`);
