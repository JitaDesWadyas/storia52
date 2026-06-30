'use strict';
(() => {
  const files=['opening-engine-indexes.js','opening-engine-parts.js','opening-engine-stable-batch.js'];
  files.reduce((chain,src)=>chain.then(()=>new Promise((resolve,reject)=>{
    const script=document.createElement('script');
    script.src=src;
    script.onload=resolve;
    script.onerror=reject;
    document.body.appendChild(script);
  })),Promise.resolve());
})();
