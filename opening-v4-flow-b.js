'use strict';
(() => {
  const V=window.STORIA52_OPENING_V4;if(!V)return;
  const {G,esc,migrate,reset,preview}=V;
  G.flow.contextForm=raw=>{
    const session=migrate(raw);reset(session);session.contextMode||='suggestions';session.stage='context';session.openingBuilderVersion=4;V.activeSession=session;G.save(session);
    const heading='<div class="screen-heading compact"><p class="eyebrow">FASE 2 · COSTRUISCI L’INCIPIT</p><h2>Quattro domande. Una sola storia coerente.</h2><p>La prima risposta fissa lo scenario. Situazione, obiettivo e problema vengono scelti soltanto dentro quello stesso scenario.</p></div>';
    const live=`<section class="opening-v4-live"><span>INCIPIT IN COSTRUZIONE</span><blockquote>${esc(preview(session))}</blockquote></section>`;
    const workspace=`<div class="context-workspace opening-v4-workspace">${V.storyReference(session)}<div class="context-editor"><div id="contextStepHost"></div><button type="button" class="text-action" data-opening-v4-mode>${session.contextMode==='manual'?'Usa i suggerimenti':'Scriviamo tutto noi'}</button></div></div>`;
    G.screen(G.progressMarkup('opening')+heading+live+workspace,'2/4 · Creazione dell’incipit');
    V.bindRoot();V.drawStep(session);
  };
  const saved=G.load();
  if(saved&&saved.stage==='context')setTimeout(()=>G.flow.contextForm(saved),0);
})();
