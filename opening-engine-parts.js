'use strict';
(() => {
  const E=window.OPENING_ENGINE,B=window.OPENING_BANK;
  if(!E||!B)return;
  const choose=(items,indexes)=>indexes.map(index=>items[index]);
  E.parts=(session,key)=>{
    const kind=E.theme(key,E.cardText(session,key));
    if(key==='identity')return [B.roles[kind]||B.roles.fallback,B.dutiesByTheme?.[kind]||B.dutiesByTheme.fallback,B.pressures];
    if(key==='place')return [B.places,B.times,B.events[kind]||B.events.fallback];
    if(key==='opening')return [choose(B.actions,E.actionMap[kind]||E.actionMap.fallback),B.methods];
    return [choose(B.blocks,E.blockMap[kind]||E.blockMap.fallback),choose(B.costs,E.costMap[kind]||E.costMap.fallback)];
  };
  E.valueAt=(key,groups,index)=>{
    const values=[];
    groups.forEach(group=>{values.push(group[index%group.length]);index=Math.floor(index/group.length);});
    if(key==='identity')return `${values[0]} ${values[1]}, ${values[2]}`;
    if(key==='place')return `${E.cap(values[0])}, ${values[1]}, ${values[2]}`;
    if(key==='opening')return `${E.cap(values[0])}, ${values[1]}`;
    return `${E.cap(values[0])}; ${values[1]}`;
  };
})();
