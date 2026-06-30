'use strict';
(() => {
  const G=window.G52,E=window.OPENING_ENGINE,B=window.OPENING_BANK;
  if(!G||!E||!B)return;
  const actionIndexes={protect:[0,1,6,9],truth:[2,5,8,10],relation:[0,2,4,7],sacrifice:[2,6,9,11],prevent:[0,1,7,11],action:[1,3,6,11],fallback:[0,1,7,11]};
  const blockIndexes={time:[1,2,5,6,11],person:[3,7,9,11],evidence:[4,7,8,9],loss:[4,5,8,10],sacrifice:[3,4,9,11],fallback:[0,5,7,9]};
  const costIndexes={time:[0,7,8,11],person:[3,5,6,10],evidence:[2,4,8,11],loss:[0,4,7,8],sacrifice:[5,9,10,11],fallback:[0,2,8,11]};
  const select=(items,indexes)=>E.pick(indexes.map(index=>items[index]));
  E.one=(session,key)=>{
    const kind=E.theme(key,E.cardText(session,key));
    if(key==='identity'){
      const roles=B.roles[kind]||B.roles.fallback;
      const duties=B.dutiesByTheme?.[kind]||B.dutiesByTheme?.fallback||B.duties;
      return `${E.pick(roles)} ${E.pick(duties)}, ${E.pick(B.pressures)}`;
    }
    if(key==='place'){
      const events=B.events[kind]||B.events.fallback;
      return `${E.cap(E.pick(B.places))}, ${E.pick(B.times)}, ${E.pick(events)}`;
    }
    if(key==='opening'){
      const action=select(B.actions,actionIndexes[kind]||actionIndexes.fallback);
      return `${E.cap(action)}, ${E.pick(B.methods)}`;
    }
    const obstacle=select(B.blocks,blockIndexes[kind]||blockIndexes.fallback);
    const consequence=select(B.costs,costIndexes[kind]||costIndexes.fallback);
    return `${E.cap(obstacle)}; ${consequence}`;
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
