const CACHE='storia52-clean-v13';
const FILES=[
  './','index.html','clean-app.css','app.js','ui-core.js','ready-stories-data.js',
  'clean-core.js','clean-rules.js','clean-home.js','clean-config.js','clean-opening.js',
  'clean-stories-model.js','clean-stories-markup.js','clean-stories-view.js',
  'clean-objectives.js','clean-prep.js','clean-print.js','clean-invite-host.js',
  'clean-invite-data.js','clean-exit.js','clean-init.js','icon.svg',
  'storia52-cards-logo.svg','manifest.webmanifest'
];
self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)));
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  const core=url.origin===self.location.origin&&(event.request.mode==='navigate'||/\.(?:html|css|js|webmanifest)$/.test(url.pathname));
  if(core){
    event.respondWith((async()=>{
      try{
        const response=await fetch(event.request,{cache:'no-store'});
        const cache=await caches.open(CACHE);
        cache.put(event.request,response.clone());
        return response;
      }catch{
        return (await caches.match(event.request))||(await caches.match('index.html'));
      }
    })());
    return;
  }
  event.respondWith(caches.match(event.request).then(hit=>hit||fetch(event.request)));
});
