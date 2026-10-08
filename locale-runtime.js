'use strict';
/* E POI? offline localization. Only rendered text is translated: game data, seeds,
   private objectives, card state and invite payloads always stay language-neutral. */
(() => {
  const S = window.S52;
  if (!S) return;
  const dict = new Map(Object.entries(window.EPOI_EN_UI || {}));
  const add = (it, en) => {
    if (typeof it === 'string' && typeof en === 'string' && it) dict.set(it, en);
  };
  const storyFields = ['title', 'protagonist', 'situation', 'objective', 'problem', 'opening'];
  for (const story of S.stories || []) {
    const en = window.EPOI_EN_STORIES?.[story.id];
    if (!en) continue;
    for (const field of storyFields) add(story[field], en[field]);
  }
  const objectives = window.STORIA52_READY_OBJECTIVES || {};
  for (const [id, goals] of Object.entries(window.EPOI_EN_OBJECTIVES || {})) {
    const italian = objectives[id] || [];
    for (let i = 0; i < goals.length; i++) {
      for (let j = 0; j < 3; j++) {
        add(italian[i]?.[['title', 'text', 'finale'][j]], goals[i]?.[j]);
      }
    }
  }
  const categories = window.STORIA52_READY_CATEGORIES || {};
  for (const [id, english] of Object.entries(window.EPOI_EN_META?.categories || {})) {
    for (const field of ['label', 'description']) add(categories[id]?.[field], english[field]);
  }
  for (const collection of window.STORIA52_READY_COLLECTIONS || []) {
    const english = window.EPOI_EN_META?.collections?.[collection.id];
    if (!english) continue;
    for (const field of ['title', 'label', 'shortLabel', 'description', 'world', 'independence']) {
      add(collection[field], english[field]);
    }
  }

  const savedLanguage = () => {
    try { return localStorage.getItem('epoi_language') === 'en' ? 'en' : 'it'; }
    catch { return 'it'; }
  };
  let language = savedLanguage();
  const dynamic = value => {
    let m;
    if ((m = /^Giocatore (\d+)$/.exec(value))) return 'Player ' + m[1];
    if ((m = /^GIOCATORE (\d+)$/.exec(value))) return 'PLAYER ' + m[1];
    if ((m = /^(\d+) giocatori$/.exec(value))) return m[1] + ' players';
    if ((m = /^(\d+) giocatori useranno lo stesso invito\.$/.exec(value))) return m[1] + ' players will use the same invitation.';
    if ((m = /^(\d+) storie$/.exec(value))) return m[1] + ' stories';
    if ((m = /^STORIA (\d+)$/.exec(value))) return 'STORY ' + m[1];
    if ((m = /^Turno (\d+)$/.exec(value))) return 'Turn ' + m[1];
    if ((m = /^Passaggio (\d+) di (\d+)$/.exec(value))) return 'Step ' + m[1] + ' of ' + m[2];
    if ((m = /^Sei (.+)\?$/.exec(value))) return 'Are you ' + m[1] + '?';
    if ((m = /^Passa il telefono a (.+)$/.exec(value))) return 'Pass the phone to ' + m[1];
    if ((m = /^QR della partita: (.+)$/.exec(value))) return 'Game QR code: ' + m[1];
    if ((m = /^QR della partita (.+)$/.exec(value))) return 'Game QR code for ' + m[1];
    if ((m = /^([0-9]+) nuove storie alla scelta\.$/.exec(value))) return m[1] + ' new stories to choose from.';
    if ((m = /^([0-9]+) carte$/.exec(value))) return m[1] + ' cards';
    if (/^\d+\/\d+$/.test(value)) return value;
    return value;
  };
  const translate = value => {
    const raw = String(value ?? '');
    if (language !== 'en') return raw;
    const text = raw.trim();
    if (!text) return raw;
    const converted = dict.get(text) || dynamic(text);
    if (converted === text) return raw;
    const offset = raw.indexOf(text);
    return raw.slice(0, offset) + converted + raw.slice(offset + text.length);
  };
  const textStates = new WeakMap();
  const attributeStates = new WeakMap();
  const SKIP = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT']);
  const ATTRS = ['placeholder', 'aria-label', 'title', 'alt'];
  const updateText = node => {
    const value = node.nodeValue;
    const last = textStates.get(node);
    const raw = last && last.shown === value ? last.raw : value;
    const next = translate(raw);
    textStates.set(node, { raw, shown: next });
    if (value !== next) node.nodeValue = next;
  };
  const updateElement = element => {
    if (SKIP.has(element.tagName) || element.isContentEditable) return;
    const states = attributeStates.get(element) || {};
    for (const name of ATTRS) {
      if (!element.hasAttribute(name)) continue;
      const value = element.getAttribute(name);
      const last = states[name];
      const raw = last && last.shown === value ? last.raw : value;
      const next = translate(raw);
      states[name] = { raw, shown: next };
      if (value !== next) element.setAttribute(name, next);
    }
    attributeStates.set(element, states);
  };
  const updateTree = start => {
    if (!start) return;
    if (start.nodeType === 3) { updateText(start); return; }
    if (start.nodeType === 9) { updateTree(start.documentElement); return; }
    if (start.nodeType !== 1 || SKIP.has(start.tagName)) return;
    updateElement(start);
    for (const child of start.childNodes) updateTree(child);
  };
  const apply = () => {
    document.documentElement.lang = language;
    document.documentElement.dataset.lang = language;
    const selector = document.querySelector('#epoiLanguage');
    if (selector && selector.value !== language) selector.value = language;
    updateTree(document);
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = language === 'en'
      ? 'E POI? is a storytelling card game: build one story together while pursuing your own secret goal.'
      : 'E POI? è un gioco narrativo con un normale mazzo di carte: continua la storia e guidala verso il tuo obiettivo segreto.';
  };
  const setLanguage = next => {
    language = next === 'en' ? 'en' : 'it';
    try { localStorage.setItem('epoi_language', language); } catch {}
    apply();
  };
  const selector = document.querySelector('#epoiLanguage');
  selector?.addEventListener('change', event => setLanguage(event.target.value));
  const observer = new MutationObserver(records => {
    for (const record of records) {
      if (record.type === 'characterData') updateText(record.target);
      else if (record.type === 'attributes') updateElement(record.target);
      else for (const node of record.addedNodes) updateTree(node);
    }
  });
  observer.observe(document.documentElement, {
    subtree: true, childList: true, characterData: true,
    attributes: true, attributeFilter: ATTRS
  });
  // Changing the language must never rewrite a saved session or an invite link.
  if (typeof S.copy === 'function') {
    const copy = S.copy;
    S.copy = (value, message) => copy.call(S, translate(value), message);
  }
  window.EpoiI18n = Object.freeze({
    get language() { return language; }, setLanguage,
    translate, apply,
    coverage: () => ({
      stories: Object.keys(window.EPOI_EN_STORIES || {}).length,
      objectives: Object.values(window.EPOI_EN_OBJECTIVES || {}).reduce((n, goals) => n + goals.length, 0),
      interfaceStrings: Object.keys(window.EPOI_EN_UI || {}).length
    })
  });
  apply();
})();
