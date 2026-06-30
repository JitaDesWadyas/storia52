'use strict';
(() => {
  const G = window.G52;
  const SCENES = window.STORIA52_COMPLETE_SCENES;
  if (!G?.flow || !Array.isArray(SCENES) || !SCENES.length) return;

  const COMPONENTS = [
    { story: 'protagonist', type: 'protagonist', tag: 'p' },
    { story: 'situation', type: 'situation', tag: 's' },
    { story: 'goal', type: 'objective', tag: 'g' },
    { story: 'problem', type: 'problem', tag: 'r' }
  ];

  const MOTIFS = {
    aiuto: /aiut|collabor|dipende|sostegn/i,
    rapporto: /rapport|fiducia|persona importante|accettat|insieme/i,
    famiglia: /famiglia|familiare|comunità|gruppo|squadra/i,
    protezione: /protegg|salvare|pericolo/i,
    indizio: /indizio|dettaglio|avvertimento/i,
    prova: /prova|document|registr|fotograf|campione/i,
    verità: /verità|convinzione|causa|ricostru|manipolat|segreto/i,
    piano: /piano|impresa|complet|preparat|obiettivo personale/i,
    azione: /agire|azione|tentativo|affrontare|superare|compiere/i,
    occasione: /occasione|possibilità|vicino a ottenere|successo/i,
    perdita: /perd|dannegg|inutilizz|scompar|non potrà tornare/i,
    sacrificio: /sacrific|rinunci|prezzo|costo/i,
    scelta: /scegli|decid|incompatibil|vale davvero/i,
    errore: /errore|fallit|conseguenze/i,
    tempo: /prima che|troppo tardi|pochissimo tempo|ultimo|immediata/i,
    responsabilità: /responsabil|incaricat|riguarda tutti/i
  };

  const escape = value => typeof escapeHtml === 'function'
    ? escapeHtml(String(value))
    : String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));

  const currentStory = session => withStoryGoal(session.story, session.seed);

  const cardInfo = session => {
    const story = currentStory(session);
    return COMPONENTS.map(component => {
      const card = story[component.story];
      const text = cardText(component.type, card);
      const motifs = Object.entries(MOTIFS).filter(([, pattern]) => pattern.test(text)).map(([name]) => name);
      return { ...component, suit: card.suit, text, motifs };
    });
  };

  const signature = session => cardInfo(session).map(info => `${info.tag}:${info.suit}:${info.text}`).join('|');

  const tinyHash = value => {
    let hash = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
      hash ^= value.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  };

  const scoreScene = (scene, info, sig) => {
    let score = 0;
    let exact = 0;
    info.forEach(component => {
      const allowed = scene.suits?.[component.tag] || [];
      if (allowed[0] === component.suit) { score += 10; exact += 1; }
      else if (allowed.includes(component.suit)) { score += 6; exact += 1; }
      component.motifs.forEach(motif => {
        if (scene.motifs?.includes(motif)) score += 3;
      });
    });
    score += (tinyHash(`${sig}:${scene.id}`) % 1000) / 10000;
    return { scene, score, exact };
  };

  const rankedScenes = session => {
    const info = cardInfo(session);
    const sig = signature(session);
    return SCENES.map(scene => scoreScene(scene, info, sig)).sort((a, b) => b.score - a.score);
  };

  const resetForCards = session => {
    const sig = signature(session);
    if (session.openingV3Signature === sig) return;
    session.openingV3Signature = sig;
    session.openingV3Seen = [];
    session.openingV3Current = [];
    session.openingV3Selected = '';
    session.openingV3Manual = false;
    session.context ||= {};
    session.context.finalOpening = '';
    G.save(session);
  };

  const nextBatch = session => {
    resetForCards(session);
    const ranking = rankedScenes(session);
    let seen = new Set(session.openingV3Seen || []);
    let available = ranking.filter(item => !seen.has(item.scene.id));
    if (available.length < 3) {
      seen = new Set();
      available = ranking;
    }
    const batch = [];
    const settings = new Set();
    for (const item of available) {
      if (batch.length >= 3) break;
      if (settings.has(item.scene.setting)) continue;
      batch.push(item);
      settings.add(item.scene.setting);
    }
    if (batch.length < 3) {
      for (const item of available) {
        if (batch.length >= 3) break;
        if (batch.some(selected => selected.scene.id === item.scene.id)) continue;
        batch.push(item);
      }
    }
    session.openingV3Current = batch.map(item => item.scene.id);
    session.openingV3Seen = [...seen, ...session.openingV3Current];
    G.save(session);
    return batch;
  };

  const currentBatch = session => {
    resetForCards(session);
    const ranking = rankedScenes(session);
    const byId = new Map(ranking.map(item => [item.scene.id, item]));
    const current = (session.openingV3Current || []).map(id => byId.get(id)).filter(Boolean);
    return current.length === 3 ? current : nextBatch(session);
  };

  const coherenceMarkup = batch => {
    const best = batch[0];
    if (!best || best.exact >= 3) {
      return '<div class="opening-v3-note good"><b>Le carte hanno un collegamento utilizzabile.</b><p>Le proposte sotto le trasformano in una scena unica, senza copiarle parola per parola.</p></div>';
    }
    return '<div class="opening-v3-note difficult"><b>Questa combinazione tira in direzioni diverse.</b><p>Le proposte la interpretano liberamente. Se nessuna convince, cambiate soltanto la carta che stona.</p></div>';
  };

  const choicesMarkup = (session, batch) => `
    <section class="opening-v3" aria-labelledby="opening-v3-title">
      ${coherenceMarkup(batch)}
      <div class="opening-v3-head">
        <div><span>3 SCENE COMPLETE</span><h3 id="opening-v3-title">Scegliete l’inizio che funziona meglio.</h3></div>
        <p>Ogni proposta usa le quattro carte come vincoli narrativi, non come quattro frasi da incollare.</p>
      </div>
      <div class="opening-v3-grid">
        ${batch.map((item, index) => `<button type="button" class="opening-v3-choice" data-opening-v3-choice="${escape(item.scene.id)}"><span>IDEA ${index + 1}</span><b>${escape(item.scene.title)}</b><p>${escape(item.scene.text)}</p><i>Usa questa scena →</i></button>`).join('')}
      </div>
      <div class="opening-v3-actions">
        <button type="button" class="secondary-action" data-opening-v3-more>↻ Altre 3 scene</button>
        <button type="button" class="text-action" data-opening-v3-manual>Scriviamo noi l’incipit</button>
      </div>
    </section>`;

  const migrate = session => {
    if (!session) return session;
    session.context ||= {};
    if (session.openingBuilderVersion !== 3) {
      const generatedByOldBuilder = Boolean(session.openingWorld || session.openingBuilderVersion === 2 || /Il protagonista è|All’inizio,|Vuole .+, ma|Confronta il registro|Nella biblioteca del museo/i.test(session.context.finalOpening || ''));
      if (generatedByOldBuilder) session.context.finalOpening = '';
      session.openingV3Seen = [];
      session.openingV3Current = [];
      session.openingV3Selected = '';
      session.openingV3Manual = false;
      session.openingBuilderVersion = 3;
      delete session.openingWorld;
      delete session.ideaHistory;
      G.save(session);
    }
    resetForCards(session);
    return session;
  };

  const previousStory = G.flow.story;
  const previousContextForm = G.flow.contextForm;
  const previousOpening = G.flow.opening;

  G.flow.story = rawSession => {
    const session = migrate(rawSession);
    previousStory(session);
    const heading = G.game.querySelector('.screen-heading');
    if (heading) {
      const title = heading.querySelector('h2');
      const copy = heading.querySelector('p:last-child');
      if (title) title.textContent = 'Le carte sono vincoli, non quattro frasi.';
      if (copy) copy.textContent = 'Possono sembrare in contrasto. L’incipit deve trovare un solo evento che le faccia funzionare insieme, oppure farvi capire quale carta cambiare.';
    }
    const referenceTitle = G.game.querySelector('.story-reference-head h3');
    if (referenceTitle) referenceTitle.textContent = 'Quattro direzioni da interpretare insieme';
    const build = G.game.querySelector('#buildOpening');
    if (build) build.textContent = 'Trova 3 incipit coerenti';
    if (!G.game.querySelector('.opening-v3-explanation')) {
      const note = document.createElement('section');
      note.className = 'opening-v3-explanation';
      note.innerHTML = '<b>Non dovete inserire ogni descrizione alla lettera.</b><p>Il protagonista indica chi seguire, la situazione accende la scena, l’obiettivo dà la direzione e il problema crea la tensione. Possono diventare parti dello stesso gesto.</p>';
      G.game.querySelector('.story-reference')?.after(note);
    }
  };

  const renderChoices = session => {
    const batch = currentBatch(session);
    G.game.querySelector('.opening-live')?.remove();
    G.game.querySelectorAll('[data-story-key]').forEach(node => { node.hidden = false; });
    const reference = G.game.querySelector('.story-reference');
    reference?.classList.add('opening-v3-reference');
    const referenceHead = reference?.querySelector('.story-reference-head');
    if (referenceHead) referenceHead.style.display = '';
    const referenceTitle = reference?.querySelector('.story-reference-head h3');
    if (referenceTitle) referenceTitle.textContent = 'Le quattro carte da interpretare';
    const heading = G.game.querySelector('.screen-heading');
    if (heading) {
      heading.classList.add('compact');
      const eyebrow = heading.querySelector('.eyebrow');
      const title = heading.querySelector('h2');
      const copy = heading.querySelector('p:last-child');
      if (eyebrow) eyebrow.textContent = 'FASE 2 · SCEGLI LA PRIMA SCENA';
      if (title) title.textContent = 'Tre incipit già completi.';
      if (copy) copy.textContent = 'Sceglietene uno e modificatelo soltanto se serve. Non dovete completare quattro descrizioni separate.';
    }
    const editor = G.game.querySelector('.context-editor');
    if (!editor) return;
    editor.innerHTML = choicesMarkup(session, batch);
    editor.addEventListener('click', event => {
      const choice = event.target.closest('[data-opening-v3-choice]');
      if (choice) {
        const scene = SCENES.find(item => item.id === choice.dataset.openingV3Choice);
        if (!scene) return;
        session.context.finalOpening = scene.text;
        session.openingV3Selected = scene.id;
        session.openingV3Manual = false;
        G.save(session);
        G.flow.opening(session);
        return;
      }
      if (event.target.closest('[data-opening-v3-more]')) {
        const fresh = nextBatch(session);
        editor.innerHTML = choicesMarkup(session, fresh);
        renderChoiceBindings(session, editor);
        G.pulse?.(editor, 'is-refreshing');
        return;
      }
      if (event.target.closest('[data-opening-v3-manual]')) {
        session.context.finalOpening = '';
        session.openingV3Selected = '';
        session.openingV3Manual = true;
        G.save(session);
        G.flow.opening(session);
      }
    }, { once: true });
    G.game.querySelectorAll('[data-change-story]').forEach(button => button.addEventListener('click', () => {
      window.setTimeout(() => {
        session.openingV3Signature = '';
        resetForCards(session);
        G.flow.contextForm(session);
      }, 180);
    }));
  };

  const renderChoiceBindings = (session, editor) => {
    editor.querySelectorAll('[data-opening-v3-choice]').forEach(button => button.addEventListener('click', () => {
      const scene = SCENES.find(item => item.id === button.dataset.openingV3Choice);
      if (!scene) return;
      session.context.finalOpening = scene.text;
      session.openingV3Selected = scene.id;
      session.openingV3Manual = false;
      G.save(session);
      G.flow.opening(session);
    }));
    editor.querySelector('[data-opening-v3-more]')?.addEventListener('click', () => {
      const fresh = nextBatch(session);
      editor.innerHTML = choicesMarkup(session, fresh);
      renderChoiceBindings(session, editor);
      G.pulse?.(editor, 'is-refreshing');
    });
    editor.querySelector('[data-opening-v3-manual]')?.addEventListener('click', () => {
      session.context.finalOpening = '';
      session.openingV3Selected = '';
      session.openingV3Manual = true;
      G.save(session);
      G.flow.opening(session);
    });
  };

  G.flow.contextChoice = rawSession => {
    const session = migrate(rawSession);
    session.contextMode = 'complete-scenes';
    G.save(session);
    G.flow.contextForm(session);
  };

  G.flow.contextForm = rawSession => {
    const session = migrate(rawSession);
    session.contextMode = 'complete-scenes';
    previousContextForm(session);
    renderChoices(session);
  };

  G.flow.openingText = rawSession => {
    const session = migrate(rawSession);
    return String(session.context?.finalOpening || '').trim() || 'Incipit non ancora scritto.';
  };

  G.flow.opening = rawSession => {
    const session = migrate(rawSession);
    const manual = session.openingV3Manual && !String(session.context.finalOpening || '').trim();
    if (manual) session.context.finalOpening = '\u200B';
    previousOpening(session);
    const heading = G.game.querySelector('.screen-heading');
    if (heading) {
      const title = heading.querySelector('h2');
      const copy = heading.querySelector('p:last-child');
      if (title) title.textContent = manual ? 'Scrivete una scena, non una scheda.' : 'Questa è la prima scena.';
      if (copy) copy.textContent = 'Bastano una o due frasi: chi c’è, che cosa accade adesso, che cosa vuole ottenere e che cosa lo impedisce.';
    }
    const editor = G.game.querySelector('#finalOpening');
    const ready = G.game.querySelector('#openingReady');
    const back = G.game.querySelector('#editOpening');
    if (back) back.textContent = 'Torna alle 3 proposte';
    G.game.querySelector('.story-start-bridge')?.remove();
    const label = editor?.closest('.opening-editor');
    const helper = label?.querySelector('small');
    if (helper) helper.textContent = 'Una scena concreta e leggibile. Non ripetete le quattro carte e non spiegate il resto della storia.';
    if (manual && editor) {
      editor.value = '';
      session.context.finalOpening = '';
      G.save(session);
    }
    const validate = () => {
      const value = String(editor?.value || '').trim();
      if (ready) ready.disabled = value.length < 25;
      label?.classList.toggle('is-empty', value.length < 25);
    };
    editor?.addEventListener('input', validate);
    validate();
  };

  migrate(G.load?.());
})();
