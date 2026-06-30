'use strict';
(() => {
  const E=window.OPENING_ENGINE;
  if(!E)return;
  const previous=E.theme;
  E.theme=(key,text)=>{
    const value=String(text||'').toLowerCase();
    if(key==='opening'&&(value.includes('sacrificio')||value.includes('prezzo')||value.includes('rinunciare')))return 'sacrifice';
    if(key==='opening'&&(value.includes('impedire')||value.includes('evitando')||value.includes('limitando')))return 'prevent';
    return previous(key,text);
  };
})();
