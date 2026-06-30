'use strict';
(() => {
  const G=window.G52,E=window.OPENING_ENGINE;
  if(!G||!E?.parts)return;
  E.batch=(session,key,amount=6)=>{
    session.concreteHistory||={};
    let history=new Set(session.concreteHistory[key]||[]);
    const groups=E.parts(session,key);
    const total=groups.reduce((count,group)=>count*group.length,1);
    const start=G.randomIndex?G.randomIndex(total):Math.floor(Math.random()*total);
    const result=[];
    for(let pass=0;pass<2&&result.length<amount;pass+=1){
      for(let offset=0;offset<total&&result.length<amount;offset+=1){
        const value=E.valueAt(key,groups,(start+offset)%total);
        if(!history.has(value)&&!result.includes(value))result.push(value);
      }
      if(result.length<amount)history=new Set();
    }
    session.concreteHistory[key]=[...history,...result].slice(-72);
    return result;
  };
})();
