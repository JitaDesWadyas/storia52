(()=>{
  const load=src=>new Promise((resolve,reject)=>{
    const script=document.createElement('script');
    script.src=src;script.onload=resolve;script.onerror=()=>reject(new Error(`Impossibile caricare ${src}`));
    document.head.appendChild(script);
  });
  load('ui-core.js').then(()=>load('ui-modes.js')).catch(error=>console.error(error));
})();
