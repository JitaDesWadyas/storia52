'use strict';
(() => {
  const G=window.G52,E=window.OPENING_ENGINE,B=window.OPENING_BANK;
  if(!G||!E||!B)return;
  E.one=(session,key)=>{
    const kind=E.theme(key,E.cardText(session,key));
    if(key==='identity'){
      const roles=B.roles[kind]||B.roles.fallback;
      return `${E.pick(roles)} ${E.pick(B.duties)}, ${E.pick(B.pressures)}`;
    }
    if(key==='place'){
      const events=B.events[kind]||B.events.fallback;
      return `${E.cap(E.pick(B.places))}, ${E.pick(B.times)}, ${E.pick(events)}`;
    }
    if(key==='opening')return `${E.cap(E.pick(B.actions))}, ${E.pick(B.methods)}`;
    return `${E.cap(E.pick(B.blocks))}; ${E.pick(B.costs)}`;
  };
  E.batch=(session,key,amount=6)=>{
    session.concreteHistory||={};
    const previous=new Set(session.concreteHistory[key]||[]),items=[];
    for(let tries=0;items.length<amount&&tries<160;tries+=1){
      const value=E.one(session,key);
      if(!previous.has(value)&&!items.includes(value))items.push(value);
    }
    session.concreteHistory[key]=[...previous,...items].slice(-72);
    return items;
  };
  E.prepare=session=>{
    session.suggestions||={};
    E.keys.forEach(key=>{
      const current=session.suggestions[key];
      const generic=Array.isArray(current)&&current.some(value=>/problema si manifesta|situazione è peggiore|primo passo del suo piano/i.test(value));
      if(!Array.isArray(current)||current.length<6||generic)session.suggestions[key]=E.batch(session,key);
    });
    G.save(session);
  };
  E.markup=(session,key)=>`${session.suggestions[key].map(value=>`<button type="button" class="suggestion-chip${session.context?.[key]===value?' selected':''}" data-key="${key}" data-value="${E.escape(value)}">${E.escape(value)}</button>`).join('')}<button type="button" class="refresh-suggestions" data-refresh="${key}">↻ Altre 6 idee</button>`;
})();
