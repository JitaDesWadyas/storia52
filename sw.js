const CACHE="storia52-v7";
const FILES=["./","index.html","style.css","update.css","editorial-polish.css","mobile-fix.css","guided-v2.css","app.js","ui-core.js","ui-modes.js","mobile-fix.js","guided-core.js","guided-flow.js","guided-play.js","icon.svg","manifest.webmanifest"];

self.addEventListener("install",event=>{
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)));
});

self.addEventListener("activate",event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET")return;

  const url=new URL(event.request.url);
  const isCoreAsset=url.origin===self.location.origin&&(
    event.request.mode==="navigate"||
    /\.(?:html|css|js|webmanifest)$/.test(url.pathname)
  );

  if(isCoreAsset){
    event.respondWith((async()=>{
      try{
        const response=await fetch(event.request,{cache:"no-store"});
        const cache=await caches.open(CACHE);
        cache.put(event.request,response.clone());
        return response;
      }catch{
        return (await caches.match(event.request))||(await caches.match("index.html"));
      }
    })());
    return;
  }

  event.respondWith(caches.match(event.request).then(hit=>hit||fetch(event.request)));
});
