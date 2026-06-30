'use strict';
(() => {
  if(!document.querySelector('link[href="opening-engine.css"]')){
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href='opening-engine.css';
    document.head.appendChild(link);
  }
  const files=['opening-bank-people-safe.js','opening-bank-duties.js','opening-bank-scenes-a.js','opening-bank-scenes-b.js','opening-bank-actions-safe.js','opening-bank-obstacles-safe.js','opening-engine-core.js','opening-engine-generate.js','opening-engine-compose.js','opening-engine-copy.js','opening-engine-ui.js'];
  files.reduce((chain,src)=>chain.then(()=>new Promise((resolve,reject)=>{
    if(document.querySelector(`script[src="${src}"]`)){resolve();return;}
    const script=document.createElement('script');
    script.src=src;
    script.onload=resolve;
    script.onerror=reject;
    document.body.appendChild(script);
  })),Promise.resolve()).catch(()=>console.error('Impossibile caricare il generatore concreto degli incipit.'));
})();
