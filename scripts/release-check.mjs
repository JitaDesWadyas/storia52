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

for (const htmlFile of ['index.html', 'privacy.html', 'copyright.html']) {
  const html = read(htmlFile);
  for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    const reference = match[1];
    if (/^(?:https?:|mailto:|tel:|data:|#)/i.test(reference)) continue;
    const clean = reference.split(/[?#]/)[0];
    if (clean && clean !== './') check(exists(clean), `${htmlFile}: risorsa locale mancante ${clean}`);
  }
}

for (const cssFile of fs.readdirSync(root).filter(name => name.endsWith('.css'))) {
  for (const match of read(cssFile).matchAll(/url\((?:"|')?([^"')]+)(?:"|')?\)/g)) {
    const reference = match[1].trim();
    if (/^(?:https?:|data:|#)/i.test(reference)) continue;
    const clean = reference.split(/[?#]/)[0];
    if (clean) check(exists(clean), `${cssFile}: risorsa locale mancante ${clean}`);
  }
}

const index = read('index.html');
const scriptOrder = [...index.matchAll(/<script src="([^"]+)"/g)].map(match => match[1].split('?')[0]);
const scriptIndex = name => scriptOrder.indexOf(name);
check(index.includes('initial-skeleton'), 'index.html: skeleton iniziale mancante');
check(scriptIndex('collection-prima-scintilla-stories.js') >= 0, 'index.html: catalogo gratuito non caricato');
check(scriptIndex('collection-prima-scintilla-stories.js') < scriptIndex('ready-stories-data.js'), 'index.html: catalogo gratuito caricato troppo tardi');
check(scriptIndex('collection-prima-scintilla.js') > scriptIndex('ready-stories-data.js'), 'index.html: metadati collezione caricati troppo presto');
check(scriptIndex('collection-prima-scintilla.js') < scriptIndex('clean-core.js'), 'index.html: metadati collezione caricati dopo clean-core');
check(scriptIndex('collection-prima-scintilla-outcomes.js') > scriptIndex('ready-story-objectives.js'), 'index.html: finali riscritti caricati prima degli obiettivi');
check(scriptIndex('collection-prima-scintilla-ui.js') > scriptIndex('clean-stories-view.js'), 'index.html: UI collezione caricata prima dell’archivio');
check(scriptIndex('collection-security.js') > scriptIndex('invite-codec.js'), 'index.html: sicurezza inviti caricata troppo presto');
check(scriptIndex('collection-security.js') < scriptIndex('clean-invite-host.js'), 'index.html: sicurezza inviti caricata troppo tardi');
check(scriptIndex('pwa-refresh-v28.js') > scriptIndex('clean-init.js'), 'index.html: refresh PWA v28 non caricato alla fine');
check(!scriptOrder.some(file => /^ready-stories-(?:realistico|mistero|fantascienza|fantasy|horror|amore|avventura|commedia)\.js$/.test(file)), 'index.html: vengono ancora scaricate le 16 storie bloccate');
check(index.includes('creator-jita.webp?v=28'), 'index.html: anteprima WebP del creatore mancante');

const allTextFiles = fs.readdirSync(root).filter(name => /\.(?:html|css|js|webmanifest)$/i.test(name));
const allText = allTextFiles.map(read).join('\n');
check(!allText.includes('Harminger'), 'È ancora presente un riferimento a Harminger');
check(!allText.includes('Massimo 28 caratteri'), 'È ancora presente il testo fisso sul limite dei nomi');
check(!allText.includes('api.qrserver.com'), 'È ancora presente il generatore QR esterno');
check(!allText.includes('creator-jita.png'), 'È ancora presente un riferimento al vecchio PNG');
check(read('clean-config.js').includes('option-locked'), 'L’incipit personalizzato non è visivamente bloccato');
check(read('clean-config.js').includes('S.renderCollections(session)'), 'Il setup non passa dalla scelta collezione');
check(read('collection-security.js').includes("safeCode.startsWith('r2.')"), 'Gli inviti personalizzati non sono bloccati');

const portrait = fs.readFileSync(path.join(root, 'creator-jita.webp'));
check(portrait.length > 10000, 'Il ritratto WebP sembra vuoto o troppo piccolo');
check(portrait.subarray(0, 4).toString('ascii') === 'RIFF' && portrait.subarray(8, 12).toString('ascii') === 'WEBP', 'creator-jita.webp non è un WebP valido');
check(read('release-fixes-v26.css').includes('creator-jita.webp?v=28'), 'Dietro E POI? non usa il ritratto WebP');

const sw = read('sw.js');
const coreBlock = sw.match(/const CORE_FILES = \[([\s\S]*?)\];/)?.[1] || '';
for (const match of coreBlock.matchAll(/['"]\.\/([^'"]*)['"]/g)) {
  const file = match[1];
  if (file) check(exists(file), `sw.js: file in cache mancante ${file}`);
}
check(sw.includes('shell-v28') && sw.includes('runtime-v28'), 'sw.js: cache PWA v28 non attiva');
check(sw.includes("'./creator-jita.webp'"), 'sw.js: ritratto WebP non precacheato');
check(sw.includes("'./collection-security.js'"), 'sw.js: sicurezza collezioni non precacheata');
check(!sw.includes('archive-v20-stories-realistico.js'), 'sw.js: precachea ancora il catalogo bloccato');
check(sw.includes('cache.addAll(requests)'), 'sw.js: installazione cache non atomica');
check(sw.includes('staleWhileRevalidate'), 'sw.js: strategia rete instabile mancante');

const evaluate = file => (0, eval)(read(file));
globalThis.window = globalThis;
evaluate('collection-prima-scintilla-stories.js');
evaluate('ready-stories-data.js');
evaluate('collection-prima-scintilla.js');

const collections = globalThis.STORIA52_READY_COLLECTIONS || [];
const available = collections.find(collection => collection.id === 'prima-scintilla');
const coming = collections.find(collection => collection.id === 'nuove-scintille');
const stories = globalThis.STORIA52_READY_STORIES || [];
check(collections.length === 2, 'Devono esistere due collezioni');
check(available?.status === 'available' && available.storyCount === 8, 'La Prima Scintilla deve avere 8 storie disponibili');
check(coming?.status === 'coming-soon' && coming.storyCount === 16, 'La seconda collezione deve avere 16 storie in arrivo');
check(stories.length === 8 && new Set(stories.map(story => story.category)).size === 8, 'Servono 8 storie, una per categoria');
check(stories.every(story => story.collectionId === 'prima-scintilla'), 'Una storia gratuita non appartiene alla collezione corretta');
check(!available?.world.includes('Valmora'), 'La descrizione moderna della città non deve raccontare Valmora');
check(available?.independence.includes('indipendente'), 'Manca la nota sull’indipendenza delle storie');
check(globalThis.STORIA52_FEATURES?.customOpening === false && globalThis.STORIA52_FEATURES?.paidCollections === false, 'Le funzionalità in arrivo non sono disattivate');

for (const file of [
  'archive-v20-objectives-01.js', 'archive-v20-objectives-02.js', 'archive-v20-objectives-03-04.js',
  'archive-v20-objectives-05-06.js', 'archive-v20-objectives-07-08.js'
]) evaluate(file);
evaluate('collection-prima-scintilla-outcomes.js');
const objectiveGroups = globalThis.STORIA52_READY_OBJECTIVES || {};
check(Object.keys(objectiveGroups).length === 8, 'In memoria devono restare solo gli obiettivi delle 8 storie gratuite');
check(Object.values(objectiveGroups).every(group => Array.isArray(group) && group.length === 8), 'Ogni storia gratuita deve avere 8 finali');
check(globalThis.STORIA52_PRIMA_SCINTILLA_REWRITTEN_OUTCOMES === 16, 'Devono essere applicati 16 finali editoriali alla collezione gratuita');

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
  stories,
  save() {},
  secureCollectionSession(session) { return session; },
  isCollectionAvailable(id) { return id === 'prima-scintilla'; },
  readyStory(session) { return this.stories.find(story => story.id === session.readyStoryId) || null; },
  storyAllowedInSession(session, story) { return Boolean(story && session.collectionId === 'prima-scintilla' && story.collectionId === 'prima-scintilla'); },
  objectivesForReadyStory(story, count) {
    return Array.from({ length: count }, (_, index) => ({ custom: true, storyId: story.id, slot: index, title: `Piano ${index + 1}`, text: `Testo ${index + 1}`, finale: `Finale ${index + 1}` }));
  }
};
(0, eval)(read('invite-codec.js'));
(0, eval)(read('collection-security.js'));
const S = globalThis.window.S52;
const story = stories[0];
const readySession = {
  source: 'ready', collectionId: 'prima-scintilla', readyStoryId: story.id, count: 4,
  names: ['Marta', 'Luca', '', 'Sara'], objectives: S.objectivesForReadyStory(story, 4), openingText: story.opening, spokenOpening: false
};
const readyCode = await S.encodeGameInvite(readySession);
check(readyCode.startsWith('r2.'), 'Invito storia pronta non compatto');
const readyDecoded = await S.decodeGameInvite(readyCode);
check(readyDecoded?.collectionId === 'prima-scintilla' && readyDecoded?.readyStoryId === story.id, 'Invito pronto non ricostruisce la collezione');
let customRejected = false;
try {
  await S.encodeGameInvite({ ...readySession, source: 'cards', collectionId: '', readyStoryId: '' });
} catch { customRejected = true; }
check(customRejected, 'Un invito personalizzato può ancora essere creato');
check(await S.decodeGameInvite('c2.jAAAA') === null, 'Un invito personalizzato può ancora essere importato');
check(await S.decodeGameInvite('A'.repeat(6001)) === null, 'Invito enorme non rifiutato');

if (failures.length) {
  console.error('\nRelease check fallito:\n- ' + failures.join('\n- '));
  process.exit(1);
}
console.log(`Release check completato: ${scriptOrder.length} script, 8+16 collezioni, WebP, blocchi e cache v28 verificati.`);
