'use strict';
(() => {
  const V=window.STORIA52_OPENING_V4;if(!V)return;
  const {G,migrate,reset,preview}=V;
  const oldStory=G.flow.story,oldOpening=G.flow.opening;
  G.flow.story=raw=>{
    const session=migrate(raw);session.openingBuilderVersion=4;oldStory(session);
    const title=G.game.querySelector('.screen-heading h2'),copy=G.game.querySelector('.screen-heading p:last-child');
    if(title)title.textContent='Quattro carte, una sola storia.';
    if(copy)copy.textContent='Le domande propongono risposte già appartenenti allo stesso scenario.';
    const build=G.game.querySelector('#buildOpening');if(build)build.textContent='Costruisci l’incipit con 4 domande';
  };
  G.flow.contextChoice=raw=>{
    const session=migrate(raw);session.contextMode||='suggestions';session.contextStep=0;reset(session);G.save(session);G.flow.contextForm(session);
  };
  G.flow.openingText=raw=>{const session=migrate(raw);return String(session.context?.finalOpening||'').trim()||preview(session);};
  G.flow.opening=raw=>{
    const session=migrate(raw);session.context.finalOpening=preview(session);G.save(session);oldOpening(session);
    const title=G.game.querySelector('.screen-heading h2'),copy=G.game.querySelector('.screen-heading p:last-child');
    if(title)title.textContent='Questo è l’incipit.';
    if(copy)copy.textContent='Le quattro risposte appartengono allo stesso scenario. Puoi rifinire il testo senza inventare nuovi collegamenti.';
    const ref=G.game.querySelector('.story-reference-head h3');if(ref)ref.textContent='Le quattro carte usate per costruire l’incipit';
    const editor=G.game.querySelector('#finalOpening');if(editor)editor.value=session.context.finalOpening;
  };
  const saved=G.load?.();if(saved)migrate(saved);
})();
