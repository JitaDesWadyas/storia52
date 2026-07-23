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
check(index.includes('virtual-cards.js?v=42'), 'index.html: motore virtuale v42 non caricato');
check(index.includes('virtual-cards.css?v=40'), 'index.html: stile virtuale v40 non caricato');
check(index.includes('clean-rules.js?v=33'), 'index.html: regole aggiornate non caricate');
check(index.includes('clean-objectives.js?v=20'), 'index.html: fix obiettivo in partita non caricato');
check(index.includes('collection-data.js?v=30'), 'index.html: incipit bilanciati v30 non caricati');
check(index.includes('collection-objectives.js?v=30'), 'index.html: obiettivi bilanciati v30 non caricati');
check(index.includes('game-balance.js?v=43'), 'index.html: bilanciamento partite v43 non caricato');
check(index.indexOf('clean-invite-data.js?v=31') < index.indexOf('game-balance.js?v=43'), 'index.html: il bilanciamento parte prima dei flussi da correggere');
check(index.indexOf('game-balance.js?v=43') < index.indexOf('clean-init.js?v=23'), 'index.html: il bilanciamento parte dopo l’inizializzazione');
check(!index.includes('virtual-cards-mobile-v35.css') && !index.includes('virtual-table-redesign-v35.js'), 'index.html: vecchi override v35 ancora caricati');
check(index.includes('interaction-polish.js?v=22'), 'index.html: interazioni aggiornate non caricate');
check(index.includes('pwa-refresh.js?v=43'), 'index.html: refresh PWA v43 non caricato');

const virtualSource = read('virtual-cards.js');
const balanceSource = read('game-balance.js');
const virtualCss = read('virtual-cards.css');
const rulesSource = read('clean-rules.js');
const interactionSource = read('interaction-polish.js');
const objectivesSource = read('clean-objectives.js');
const collectionSource = read('collection-data.js');
const collectionObjectivesSource = read('collection-objectives.js');
check(virtualSource.includes("phase: 'exchange'"), 'Il turno non parte dal cambio');
check(virtualSource.includes('mazzo-condiviso'), 'La distribuzione non usa il mazzo condiviso');
check(virtualSource.includes('virtual-card-symbol'), 'Le carte non hanno il simbolo centrale reale');
check(virtualSource.includes('data-phase-callout') && virtualSource.includes('CAMBIA UNA CARTA'), 'La fase corrente non è mostrata in modo evidente');
check(virtualSource.includes('Carta da cambiare') && !virtualSource.includes('La carta apparirà qui'), 'Il tavolo usa ancora un testo generico o rivolto allo sviluppatore');
check(virtualSource.includes('Una relazione si incrina') && virtualSource.includes('Un personaggio tenta un’azione'), 'Le descrizioni delle carte non spiegano chiaramente l’effetto narrativo');
check(virtualSource.includes('data-toggle-cards') && virtualSource.includes('card-back'), 'Manca il comando per girare le carte sul retro');
check(virtualSource.includes('S.openRulesModal?.()'), 'Il menu virtuale non apre le stesse regole della home');
check(virtualSource.includes('const valid = !cancelled && action && dropState(current).valid') && virtualSource.includes('await commitOutcome(outcome, action)'), 'Il drag non esegue direttamente Cambia o Gioca');
check(virtualSource.includes('setPointerCapture') && virtualSource.includes('requestAnimationFrame'), 'Il drag non usa Pointer Events e requestAnimationFrame');
check(virtualSource.includes('virtual-drag-overlay'), 'Il drag non usa un overlay fullscreen');
check(virtualSource.includes('virtual-confetti') && virtualSource.includes('burstConfetti'), 'Manca la celebrazione del finale accettato');
check(virtualSource.includes('Carta scartata') && virtualSource.includes('Carta giocata') && virtualSource.includes('data-open-story'), 'Il tavolo non distingue le carte oppure l’incipit non è apribile');
check(!virtualSource.includes('virtual-discard-stack') && !virtualSource.includes('GIOCA QUI') && !virtualSource.includes('SCARTI</small>'), 'Sono tornate le vecchie zone separate Scarti/Gioca qui');
check(virtualSource.includes('playedCard') && virtualSource.includes('settlePlayedCard'), 'La carta giocata non resta sul tavolo');
check((virtualSource.match(/S\.mount\(/g) || []).length === 1, 'Il tavolo viene rimontato durante il turno');
check(objectivesSource.includes('if (duringGame) return;') && objectivesSource.includes('if (!duringGame && (changed || forceRefresh))'), 'La chiusura dell’obiettivo può ancora rimontare la schermata di gioco');
check(rulesSource.includes('rule-card-mini-sections') && rulesSource.includes('<details open>') && rulesSource.includes('Figure e assi'), 'Le regole delle carte non sono divise in mini sezioni');
check(rulesSource.includes('Solo J, Q, K e A') && !rulesSource.includes('<summary>Positivo e negativo</summary>'), 'La regola del colore non è integrata esclusivamente nelle figure e negli assi');
check(virtualSource.includes("ghost.classList.remove('selected'") && virtualSource.includes('const dropState = current') && virtualSource.includes('distance >= 76'), 'Il drag della carta selezionata o la soglia di rilascio non sono corretti');
check((interactionSource.match(/animation\.cancel\(\);/g) || []).length >= 2, 'L’accordion può ancora restare bloccato all’altezza animata');
check(interactionSource.includes('clearPreviousVirtualDrag') && interactionSource.includes("querySelectorAll('.virtual-drag-ghost')"), 'Un clone di trascinamento precedente può ancora restare sullo schermo');

check(balanceSource.includes('2–3 giocatori: 5 carte a testa') && balanceSource.includes('4 giocatori: 4 carte') && balanceSource.includes('5–8 giocatori: 3 carte'), 'La regola della mano scalata non è dichiarata completamente');
check(balanceSource.includes('players >= 5') && balanceSource.includes('players === 4'), 'La mano scalata non è calcolata in un solo punto');
check(balanceSource.includes('ESEMPIO DI CHIUSURA'), 'L’epilogo è ancora presentato come testo obbligatorio');
check(balanceSource.includes('rispettare l’ultima carta') && balanceSource.includes('non introdurre una soluzione nuova dal nulla'), 'Le regole del finale non proteggono continuità e ultima carta');
check(balanceSource.includes('prepareVirtualState') && balanceSource.includes('initialHandSize'), 'Le carte virtuali non migrano alla mano corretta');
check(balanceSource.includes('data-card-mode="physical"') && balanceSource.includes('data-card-mode="virtual"'), 'La configurazione non mostra la stessa distribuzione per mazzo fisico e virtuale');

check(collectionSource.includes('settimana di paga') && collectionSource.includes('consegna urgente'), 'Primo giorno in Meridiana non mostra il costo della fermata');
check(collectionSource.includes('due cassette') && collectionSource.includes('modulo industriale'), 'Undici minuti non sostiene teorie concorrenti');
check(collectionSource.includes('soltanto un quartiere') && collectionSource.includes('San Lume'), 'Copia Zero non impone una scelta energetica concreta');
check(collectionSource.includes('sigillo contabile del tempio'), 'Il mercante di nomi non introduce la possibile complicità del tempio');
check(collectionSource.includes('Ci ha traditi') && collectionSource.includes('Ha provato a salvarci'), 'Il Lanterna non apre due verità incompatibili sulla nonna');
check(collectionSource.includes('debiti lasciati dall’alluvione'), 'Casa Orla non rende credibile la posizione di Nora');
check(collectionSource.includes('Non sono caduto. Ho trovato ciò che cercavo'), 'Sotto Vetra non rende reale la scelta del lavoratore');
check(collectionObjectivesSource.includes('STORIA52_COLLECTION_BALANCE_PATCHES') && collectionObjectivesSource.includes('Object.assign(objective, patch)'), 'Gli obiettivi non usano una patch completa e verificabile');
check(collectionObjectivesSource.includes('Una galleria fuori dal tempo') && collectionObjectivesSource.includes('Un esperimento industriale'), 'Undici minuti non contiene spiegazioni realmente concorrenti');
check(collectionObjectivesSource.includes('Rispettare la sua scelta di restare') && collectionObjectivesSource.includes('Aprire un accesso pubblico'), 'Sotto Vetra non contiene scelte incompatibili');
check(!collectionObjectivesSource.includes('via Orla 18') && !collectionObjectivesSource.includes('lavanderia'), 'Sotto Vetra contiene ancora il vecchio finale imposto');

check(virtualCss.includes('position:fixed!important;') && virtualCss.includes('height:100dvh!important'), 'La modalità non è fullscreen reale');
check(virtualCss.includes('html body.virtual-table-active .site-header') && virtualCss.includes('.site-footer{display:none!important}'), 'Header o footer restano visibili');
check(virtualCss.includes('env(safe-area-inset-bottom)'), 'Mancano le safe area');
check(virtualCss.includes('flex-wrap:nowrap!important'), 'La mano non resta su una riga sola');
check(virtualCss.includes('opacity:1!important') && virtualCss.includes('DA CAMBIARE') && virtualCss.includes('DA GIOCARE'), 'Simbolo o stato della carta selezionata non sono abbastanza evidenti');
check(virtualCss.includes('width:clamp(72px,20.8vw,88px)') && virtualCss.includes('height:clamp(132px,18.2dvh,172px)'), 'Le carte non hanno la misura da mano singola');
check(virtualCss.includes('.virtual-table-card[hidden],.virtual-focus-placeholder[hidden]{display:none!important}'), 'Le carte nascoste del tavolo possono ancora occupare spazio e tagliare il layout');
check(virtualCss.includes('touch-action:none!important'), 'Le carte non bloccano il pan del browser');
check(virtualCss.includes('visibility:hidden!important'), 'La carta originale non viene nascosta correttamente durante il drag');
check(virtualCss.includes('.virtual-actions[data-count="1"]'), 'L’azione singola non occupa tutta la barra');
check(virtualCss.includes('.virtual-actions button:disabled'), 'Le azioni senza carta selezionata non appaiono disabilitate');
check(virtualCss.includes('html[data-theme="dark"] .virtual-game'), 'Il tema scuro non è supportato');
check(virtualCss.includes('@media(max-height:700px)'), 'Manca l’adattamento per schermi bassi');
check(virtualCss.includes('.rule-card-mini-sections>details'), 'Le mini sezioni delle regole non hanno uno stile dedicato');

const sw = read('sw.js');
check(sw.includes('shell-v43') && sw.includes('runtime-v43'), 'Cache PWA v43 non attiva');
check(sw.includes("'./virtual-cards.css'") && sw.includes("'./virtual-cards.js'") && sw.includes("'./game-balance.js'"), 'Bilanciamento o carte virtuali non precacheati');
check(!sw.includes('virtual-cards-mobile-v35.css') && !sw.includes('virtual-table-redesign-v35.js'), 'Vecchi file v35 ancora nella cache');
check(read('pwa-refresh.js').includes('epoi_sw_reload_v43'), 'Refresh PWA v43 non attivo');
const coreBlock = sw.match(/const CORE_FILES = \[([\s\S]*?)\];/)?.[1] || '';
for (const match of coreBlock.matchAll(/['"]\.\/([^'"]*)['"]/g)) check(exists(match[1]), `sw.js: file mancante ${match[1]}`);

const evaluate = file => (0, eval)(read(file));
globalThis.window = globalThis;
delete globalThis.S52;
evaluate('virtual-cards.js');
globalThis.S52 = {};
evaluate('game-balance.js');
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
  const expectedHand = playerCount <= 3 ? 5 : playerCount === 4 ? 4 : 3;
  const assignments = virtual.buildAssignments(`TEST-${playerCount}`, playerCount);
  const assigned = assignments.flatMap(item => item.ownedCards);
  check(assignments.every(item => item.hand.length === expectedHand), `${playerCount} giocatori: mano iniziale errata`);
  check(assigned.length === 52 && new Set(assigned).size === 52, `${playerCount} giocatori: doppioni o carte mancanti`);
}
let state = virtual.createState('TEST-TURNO', 4, 0);
let outcome = virtual.apply(state, 'exchange', 'TEST-TURNO', 0, state.hand[0]);
check(outcome.ok && outcome.state.phase === 'play' && outcome.state.hand.length === 4, 'Il cambio non conserva la mano scalata');
state = outcome.state;
let played = state.hand[0];
outcome = virtual.apply(state, 'play', 'TEST-TURNO', 0, played);
check(outcome.ok && outcome.state.playedCard === played && !outcome.state.discard.includes(played), 'La carta giocata non resta sul tavolo');
check(!virtual.apply(outcome.state, 'final', 'TEST-TURNO', 0).ok, 'Il finale è consentito prima dell’ultima carta');
outcome = virtual.apply(outcome.state, 'draw-end', 'TEST-TURNO', 0);
check(outcome.ok && outcome.state.discard.includes(played), 'La carta non passa agli scarti a fine turno');

state = virtual.createState('TEST-FINALE', 7, 0);
while (state.hand.length) {
  outcome = state.hand.length > 1
    ? virtual.apply(state, 'exchange', 'TEST-FINALE', 0, state.hand[0])
    : virtual.apply(state, 'skip-exchange', 'TEST-FINALE', 0);
  check(outcome.ok, 'Il turno non raggiunge la giocata finale');
  state = outcome.state;
  played = state.hand[0];
  outcome = virtual.apply(state, 'play', 'TEST-FINALE', 0, played);
  check(outcome.ok, 'Una carta della mano scalata non può essere giocata');
  state = outcome.state;
  if (!state.hand.length) break;
  check(!virtual.apply(state, 'final', 'TEST-FINALE', 0).ok, 'Il finale passa con carte ancora in mano');
  outcome = virtual.apply(state, 'skip-draw', 'TEST-FINALE', 0);
  check(outcome.ok, 'Non è possibile continuare senza pescare');
  state = outcome.state;
}
check(state.hand.length === 0 && state.phase === 'afterPlay', 'L’ultima carta non prepara il finale');
outcome = virtual.apply(state, 'final', 'TEST-FINALE', 0);
check(outcome.ok && outcome.state.phase === 'final', 'Il finale non parte dalla scena dell’ultima carta');

delete globalThis.STORIA52_READY_STORIES;
delete globalThis.STORIA52_READY_CATEGORIES;
evaluate('collection-data.js');
const stories = globalThis.STORIA52_READY_STORIES || [];
check(stories.length === 8 && new Set(stories.map(story => story.id)).size === 8, 'La collezione non contiene otto storie uniche');

globalThis.STORIA52_READY_OBJECTIVES = {};
for (const file of ['archive-v20-objectives-01.js', 'archive-v20-objectives-02.js', 'archive-v20-objectives-03-04.js', 'archive-v20-objectives-05-06.js', 'archive-v20-objectives-07-08.js']) evaluate(file);
evaluate('collection-objectives.js');
const readyIds = ['real01', 'mys02', 'sci01', 'fan02', 'hor02', 'lov01', 'adv01', 'com03'];
check(globalThis.STORIA52_COLLECTION_BALANCE_PATCHES === 39, 'Non sono state applicate tutte le 39 correzioni narrative');
check(Object.keys(globalThis.STORIA52_READY_OBJECTIVES).every(id => readyIds.includes(id)), 'Sono rimasti obiettivi fuori dalla collezione pubblica');
for (const storyId of readyIds) {
  const plans = globalThis.STORIA52_READY_OBJECTIVES[storyId] || [];
  check(plans.length === 8, `${storyId}: servono otto obiettivi`);
  check(new Set(plans.map(plan => plan.title)).size === 8, `${storyId}: titoli obiettivo duplicati`);
  check(plans.every(plan => plan.text && plan.finale), `${storyId}: obiettivo o esempio di chiusura incompleto`);
}
const objectiveText = storyId => (globalThis.STORIA52_READY_OBJECTIVES[storyId] || []).map(plan => `${plan.title} ${plan.text} ${plan.finale}`).join(' ');
check(objectiveText('mys02').includes('Un esperimento industriale') && objectiveText('mys02').includes('Una galleria fuori dal tempo'), 'Undici minuti non conserva le teorie concorrenti dopo il caricamento reale');
check(objectiveText('hor02').includes('La nonna li tradì') && objectiveText('hor02').includes('La nonna provò a salvarli'), 'Il Lanterna non conserva le due verità incompatibili');
check(objectiveText('adv01').includes('Rispettare la sua scelta di restare') && objectiveText('adv01').includes('Un accordo riservato con Meridiana'), 'Sotto Vetra non conserva le coppie di scelte opposte');
check(!/undici minuti|1998|lavanderia|via orla 18/i.test(objectiveText('adv01')), 'Sotto Vetra dipende ancora da un’altra storia o da dettagli imposti');
check(objectiveText('com03').includes('Nessuno vuole più raddrizzarla'), 'La statua conserva l’obiettivo contraddittorio sui progetti');

(0, eval)(read('qr-local.js'));
await globalThis.EpoiQrReady;
const qrSvg = globalThis.EpoiQr.toSvg(`https://example.test/#g=${'A'.repeat(900)}`);
assert.match(qrSvg, /^<svg class="epoi-qr-svg"/);
assert.ok(qrSvg.includes('<path'));

if (failures.length) {
  console.error('\nRelease check fallito:\n- ' + failures.join('\n- '));
  process.exit(1);
}
console.log('Release check completato: mani 5/4/3, finale sull’ultima carta, 39 correzioni narrative, carte virtuali e cache PWA v43 verificati.');
