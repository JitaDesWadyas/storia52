'use strict';
(() => {
  const G=window.G52,E=window.OPENING_ENGINE,C=window.OPENING_STEP_COPY;
  if(!G||!E||!C)return;
  const enhance=session=>{
    const key=E.keys[Math.max(0,Math.min(3,Number(session.contextStep)||0))];
    const field=document.querySelector(`[data-context-field="${key}"]`);
    if(!field)return;
    const copy=C[key],heading=field.querySelector('h3');
    const note=field.querySelector('.context-link'),area=field.querySelector('textarea');
    if(heading)heading.textContent=copy.question;
    if(note)note.innerHTML=`<span>LA CARTA DICE</span><q>${E.escape(E.cardText(session,key))}</q><small>${E.escape(copy.hint)}</small>`;
    if(area)area.placeholder=`Esempio: ${copy.sample}`;
    if(!field.querySelector('.concrete-tip')){
      const tip=document.createElement('p');
      tip.className='concrete-tip';
      tip.innerHTML='<b>Controllo:</b> questa frase descrive qualcosa che si può immaginare chiaramente?';
      area?.before(tip);
    }
  };
  const previous=G.flow.contextForm;
  G.flow.contextForm=session=>{
    E.prepare(session);
    previous(session);
    const host=document.querySelector('#contextStepHost');
    const editor=document.querySelector('.context-editor');
    enhance(session);
    if(host)new MutationObserver(()=>requestAnimationFrame(()=>enhance(session))).observe(host,{childList:true,subtree:true});
    if(!editor||editor.dataset.concreteBound==='true')return;
    editor.dataset.concreteBound='true';
    editor.addEventListener('click',event=>{
      const refresh=event.target.closest('[data-refresh]');
      if(refresh){
        event.preventDefault();
        event.stopImmediatePropagation();
        const key=refresh.dataset.refresh;
        session.suggestions[key]=E.batch(session,key);
        G.save(session);
        const row=refresh.closest('.suggestion-row');
        if(row)row.innerHTML=E.markup(session,key);
        G.pulse?.(row,'is-refreshing');
        enhance(session);
        return;
      }
      if(event.target.closest('[data-context-next]')){
        const current=E.keys[Number(session.contextStep)||0];
        const input=document.querySelector(`#context-${current}`);
        if(input)session.context[current]=input.value.trim();
        const next=E.keys[Math.min(3,(Number(session.contextStep)||0)+1)];
        session.suggestions[next]=E.batch(session,next);
        G.save(session);
      }
    },true);
  };
})();
