import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = path.resolve(import.meta.dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const exists = file => fs.existsSync(path.join(root, file));

const failures = [];
const check = (condition, message) => {
  if (!condition) failures.push(message);
};

for (const file of fs.readdirSync(root).filter(name => name.endsWith('.js'))) {
  try { new Function(read(file)); }
  catch (error) { failures.push(`${file}: sintassi non valida (${error.message})`); }
}

for (const htmlFile of ['index.html', 'privacy.html', 'copyright.html']) {
  const html = read(htmlFile);
  const references = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(match => match[1]);
  for (const reference of references) {
    if (/^(?:https?:|mailto:|tel:|data:|#)/i.test(reference)) continue;
    const clean = reference.split(/[?#]/)[0];
    if (!clean || clean === './') continue;
    check(exists(clean), `${htmlFile}: risorsa locale mancante ${clean}`);
  }
}

for (const cssFile of fs.readdirSync(root).filter(name => name.endsWith('.css'))) {
  const css = read(cssFile);
  const references = [...css.matchAll(/url\((?:"|')?([^"')]+)(?:"|')?\)/g)].map(match => match[1].trim());
  for (const reference of references) {
    if (/^(?:https?:|data:|#)/i.test(reference)) continue;
    const clean = reference.split(/[?#]/)[0];
    if (clean) check(exists(clean), `${cssFile}: risorsa locale mancante ${clean}`);
  }
}

const index = read('index.html');
const scriptOrder = [...index.matchAll(/<script src="([^"]+)"/g)].map(match => match[1]);
const scriptIndex = name => scriptOrder.findIndex(source => source.split('?')[0] === name);
const qrIndex = scriptOrder.indexOf('qr-local.js');
const inviteHostIndex = scriptOrder.indexOf('clean-invite-host.js');
check(qrIndex >= 0, 'index.html: qr-local.js non caricato');
check(qrIndex < inviteHostIndex, 'index.html: il QR locale deve caricarsi prima del flusso inviti');
check(index.includes('initial-skeleton'), 'index.html: skeleton iniziale mancante');
check(scriptIndex('collection-prima-scintilla.js') > scriptIndex('ready-stories-data.js'), 'index.html: metadati collezione caricati troppo presto');
check(scriptIndex('collection-prima-scintilla.js') < scriptIndex('clean-core.js'), 'index.html: metadati collezione caricati dopo clean-core');
check(scriptIndex('collection-prima-scintilla-outcomes.js') > scriptIndex('ready-story-objectives.js'), 'index.html: finali riscritti caricati prima degli obiettivi');
check(scriptIndex('collection-prima-scintilla-outcomes.js') < scriptIndex('clean-objectives.js'), 'index.html: finali riscritti caricati troppo tardi');
check(scriptIndex('collection-prima-scintilla-ui.js') > scriptIndex('clean-stories-view.js'), 'index.html: UI collezione caricata prima dell’archivio storie');
check(scriptIndex('pwa-refresh-v27.js') > scriptIndex('clean-init.js'), 'index.html: refresh PWA v27 non caricato alla fine');

const allText = fs.readdirSync(root)
  .filter(name => /\.(?:html|css|js|webmanifest)$/i.test(name))
  .map(read)
  .join('\n');
check(!allText.includes('api.qrserver.com'), 'È ancora presente il generatore QR esterno');
check(!allText.includes('creator-jita.png'), 'È ancora presente un riferimento all’immagine PNG mancante');
check(!allText.includes('const encoded='), 'Il QR locale contiene ancora un payload compresso');

const sw = read('sw.js');
const coreBlock = sw.match(/const CORE_FILES = \[([\s\S]*?)\];/)?.[1] || '';
for (const match of coreBlock.matchAll(/['"]\.\/([^'"]*)['"]/g)) {
  const file = match[1];
  if (file) check(exists(file), `sw.js: file in cache mancante ${file}`);
}
check(sw.includes('cache.addAll(requests)'), 'sw.js: installazione della cache non atomica');
check(sw.includes('staleWhileRevalidate'), 'sw.js: strategia rete instabile mancante');
check(sw.includes('shell-v27') && sw.includes('runtime-v27'), 'sw.js: cache PWA v27 non attiva');

const evaluate = file => (0, eval)(read(file));
globalThis.window = globalThis;
for (const file of [
  'archive-v20-stories-realistico.js', 'archive-v20-stories-mistero.js', 'archive-v20-stories-fantascienza.js', 'archive-v20-stories-fantasy.js',
  'archive-v20-stories-horror.js', 'archive-v20-stories-amore.js', 'archive-v20-stories-avventura.js', 'archive-v20-stories-commedia.js'
]) evaluate(file);
evaluate('ready-stories-data.js');
evaluate('collection-prima-scintilla.js');
check(globalThis.STORIA52_READY_COLLECTION?.id === 'prima-scintilla', 'Collezione La Prima Scintilla non inizializzata');
check(globalThis.STORIA52_READY_COLLECTION?.title === 'La Prima Scintilla', 'Nome della collezione non corretto');
check(globalThis.STORIA52_READY_STORIES?.length === 24, 'La Prima Scintilla deve contenere 24 storie');
check(globalThis.STORIA52_READY_STORIES?.every(story => story.collectionId === 'prima-scintilla'), 'Alcune storie non appartengono a La Prima Scintilla');

for (const file of [
  'archive-v20-objectives-01.js', 'archive-v20-objectives-02.js', 'archive-v20-objectives-03-04.js',
  'archive-v20-objectives-05-06.js', 'archive-v20-objectives-07-08.js'
]) evaluate(file);
evaluate('collection-prima-scintilla-outcomes.js');
const objectiveGroups = globalThis.STORIA52_READY_OBJECTIVES || {};
check(Object.keys(objectiveGroups).length === 24, 'La Prima Scintilla deve avere obiettivi per 24 storie');
check(Object.values(objectiveGroups).every(group => Array.isArray(group) && group.length === 8), 'Ogni storia deve avere 8 finali');
check(globalThis.STORIA52_PRIMA_SCINTILLA_REWRITTEN_OUTCOMES === 48, 'Devono essere applicati esattamente 48 finali riscritti');

(0, eval)(read('qr-local.js'));
await globalThis.EpoiQrReady;
const qrSvg = globalThis.EpoiQr.toSvg(`https://example.test/storia52/#g=${'A'.repeat(900)}`);
assert.match(qrSvg, /^<svg class="epoi-qr-svg"/);
assert.ok(qrSvg.includes('<path'));

const cleanText = (value, max = 500, multiline = false) => {
  let text = String(value ?? '').normalize('NFKC').replace(multiline ? /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g : /[\u0000-\u001F\u007F]/g, '');
  text = multiline ? text.replace(/\r\n?/g, '\n').replace(/[\t ]+/g, ' ').replace(/\n{3,}/g, '\n\n') : text.replace(/\s+/g, ' ');
  return text.trim().slice(0, max);
};
const story = { id: 'ready-one', title: 'Test', category: 'mystery' };
globalThis.serializeStory = value => JSON.stringify(value);
globalThis.parseStory = value => { try { return JSON.parse(value); } catch { return null; } };
globalThis.serializeCard = value => value ? `${value.suit}:${value.number}` : '';
globalThis.parseCard = value => {
  const [suit, number] = String(value || '').split(':');
  return suit && Number(number) ? { suit, number: Number(number) } : null;
};
globalThis.window.S52 = {
  limits: { name: 28, opening: 700, inviteCode: 6000, inviteQr: 1900, inviteDecoded: 18000 },
  cleanText,
  cleanName: (value, index = 0) => cleanText(value, 28) || `Giocatore ${index + 1}`,
  playerName(session, index) { return this.cleanName(session.names?.[index], index); },
  stories: [story],
  objectivesForReadyStory(value, count) {
    return Array.from({ length: count }, (_, index) => ({ custom: true, storyId: value.id, slot: index, title: `Piano ${index + 1}`, text: `Testo ${index + 1}`, finale: `Finale ${index + 1}` }));
  }
};
(0, eval)(read('invite-codec.js'));
const S = globalThis.window.S52;
const readySession = {
  source: 'ready', readyStoryId: story.id, count: 10,
  names: ['  Marta  ', '', 'Luca', '', '', '', '', '', '', 'Sara'],
  objectives: S.objectivesForReadyStory(story, 10), openingText: '', spokenOpening: false
};
const readyCode = await S.encodeGameInvite(readySession);
check(readyCode.startsWith('r2.'), 'Invito storia pronta non compatto');
const readyDecoded = await S.decodeGameInvite(readyCode);
check(readyDecoded?.count === 10, 'Invito storia pronta: numero giocatori errato');
check(readyDecoded?.names[0] === 'Marta' && readyDecoded?.names[9] === 'Sara', 'Invito storia pronta: nomi non conservati');

const customSession = {
  source: 'cards', count: 4, names: ['Uno', 'Due', 'Tre', 'Quattro'],
  story: { protagonist: 'A', situation: 'B', goal: 'C', problem: 'D' },
  openingText: 'Un incipit personalizzato abbastanza lungo da essere realistico.', spokenOpening: false,
  objectives: Array.from({ length: 4 }, (_, index) => ({ custom: true, title: `Obiettivo ${index + 1}`, text: `Porta la storia verso il piano ${index + 1}.`, finale: `Chiudi con il finale ${index + 1}.` }))
};
const customCode = await S.encodeGameInvite(customSession);
check(customCode.startsWith('c2.'), 'Invito personalizzato: formato errato');
const customDecoded = await S.decodeGameInvite(customCode);
check(customDecoded?.count === 4 && customDecoded?.openingText === customSession.openingText, 'Invito personalizzato: dati non ricostruiti');

const legacyCode = await S.encodeInvite(readySession, 0, readySession.objectives[0]);
const legacyDecoded = await S.decodeInvite(legacyCode);
check(legacyDecoded?.names[0] === 'Marta', 'Compatibilità invito personale precedente rotta');
check(await S.decodeGameInvite('A'.repeat(6001)) === null, 'Invito enorme non rifiutato');

if (failures.length) {
  console.error('\nRelease check fallito:\n- ' + failures.join('\n- '));
  process.exit(1);
}
console.log(`Release check completato: ${scriptOrder.length} script, La Prima Scintilla, QR locale, inviti e cache v27 verificati.`);
