'use strict';
(() => {
  const V=window.STORIA52_OPENING_V4;if(!V)return;
  const {G,BANKS,STEPS,rankedBanks,reset,identityBatch,clusterBatch,currentBatch}=V;
  V.activeSession=null;
  V.replaceCard=(session,key)=>{
    let next=randomCard(),tries=0;
    while(cardLabel(next)===cardLabel(session.story[key])&&tries<12){next=randomCard();tries+=1;}
    session.story[key]=next;session.openingV4Signature='';reset(session);G.flow.contextForm(session);
  };
  V.bindRoot=()=>{
    const root=G.game;if(!root||root.dataset.openingV4Bound==='true')return;
    root.dataset.openingV4Bound='true';
    root.addEventListener('click',event=>{
      const session=V.activeSession;if(!session)return;
      const choice=event.target.closest('[data-opening-v4-value]');
      if(choice){
        event.preventDefault();const step=STEPS[session.contextStep],cluster=choice.dataset.openingV4Cluster;
        if(step.key==='identity'&&cluster!==session.openingV4Cluster){
          session.openingV4Cluster=cluster;session.openingV4Seen={};
          session.openingV4Current.place=[];session.openingV4Current.opening=[];session.openingV4Current.stakes=[];
          session.context.place='';session.context.opening='';session.context.stakes='';
        }
        session.context[step.key]=choice.dataset.openingV4Value;session.context.finalOpening='';G.save(session);
        const input=document.getElementById('opening-v4-input');if(input)input.value=choice.dataset.openingV4Value;
        choice.closest('.opening-v4-suggestions')?.querySelectorAll('[data-opening-v4-value]').forEach(button=>button.classList.toggle('selected',button===choice));
        const next=document.querySelector('[data-opening-v4-next]');if(next)next.disabled=false;V.refreshPreview(session);return;
      }
      const more=event.target.closest('[data-opening-v4-more]');
      if(more){
        event.preventDefault();const key=more.dataset.openingV4More;session.openingV4Current[key]=[];
        key==='identity'?identityBatch(session):clusterBatch(session,key);V.drawStep(session);return;
      }
      const change=event.target.closest('[data-opening-v4-change]');
      if(change){event.preventDefault();V.replaceCard(session,change.dataset.openingV4Change);return;}
      if(event.target.closest('[data-opening-v4-back]')){
        event.preventDefault();V.syncInput(session);session.contextStep=Math.max(0,session.contextStep-1);G.save(session);V.drawStep(session);return;
      }
      if(event.target.closest('[data-opening-v4-next]')){
        event.preventDefault();V.syncInput(session);const step=STEPS[session.contextStep];
        if(String(session.context[step.key]||'').trim().length<18)return;
        if(step.key==='identity'&&!session.openingV4Cluster)session.openingV4Cluster=rankedBanks(session)[0]?.bank.id||BANKS[0].id;
        if(session.contextStep<STEPS.length-1){
          session.contextStep+=1;const key=STEPS[session.contextStep].key;session.openingV4Current[key]=[];
          currentBatch(session,key);G.save(session);V.drawStep(session);
        }else{session.context.finalOpening=V.preview(session);G.save(session);G.flow.opening(session);}
        return;
      }
      if(event.target.closest('[data-opening-v4-mode]')){
        event.preventDefault();V.syncInput(session);session.contextMode=session.contextMode==='manual'?'suggestions':'manual';
        session.openingV4Current[STEPS[session.contextStep].key]=[];G.save(session);V.drawStep(session);
        const mode=document.querySelector('[data-opening-v4-mode]');if(mode)mode.textContent=session.contextMode==='manual'?'Usa i suggerimenti':'Scriviamo tutto noi';
      }
    });
  };
})();
