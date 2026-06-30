'use strict';
(() => {
  const G=window.G52,E=window.OPENING_ENGINE;
  if(!G||!E)return;
  E.compose=session=>{
    const context=session.context||{};
    const subject=E.strip(context.name)||'Il protagonista';
    const identity=E.strip(context.identity||E.cardText(session,'identity'));
    const place=E.strip(context.place||E.cardText(session,'place'));
    const action=E.strip(context.opening||E.cardText(session,'opening'));
    const obstacle=E.strip(context.stakes||E.cardText(session,'stakes'));
    const parts=[];
    if(identity)parts.push(`${subject} è ${identity.charAt(0).toLowerCase()}${identity.slice(1)}.`);
    if(place)parts.push(`${E.cap(place)}.`);
    if(action)parts.push(`${E.cap(action)}.`);
    if(obstacle)parts.push(`${E.cap(obstacle)}.`);
    return parts.join(' ').replace(/\s+/g,' ').trim();
  };
  const previousText=G.flow.openingText;
  G.flow.openingText=session=>session?.context?.finalOpening?.trim()||E.compose(session)||previousText?.(session)||'';
  const previousOpening=G.flow.opening;
  G.flow.opening=session=>{
    session.context||={};
    if(!session.context.finalOpening?.trim())session.context.finalOpening=E.compose(session);
    G.save(session);
    return previousOpening(session);
  };
})();
