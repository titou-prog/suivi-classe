const CACHE='suivi-classe-ipad-v25';
const ASSETS=['./','./index.html','./app.js','./progression.html','./verrou.js','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS.map(u=>new Request(u,{cache:'reload'})))).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET') return;
 const url=new URL(e.request.url);
 if(url.pathname.endsWith('/index.html') || url.pathname.endsWith('/progression.html') || url.pathname.endsWith('/') || url.pathname.endsWith('/app.js') || url.pathname.endsWith('/verrou.js') || url.pathname.endsWith('/sw.js') || url.pathname.endsWith('/version.json')){
   e.respondWith(fetch(e.request,{cache:'no-store'}).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r}).catch(()=>caches.match(e.request,{ignoreSearch:true}).then(r=>r||caches.match('./index.html'))));
 } else {
   e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(cached=>cached||fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r}).catch(()=>caches.match('./index.html'))));
 }
});

self.addEventListener('message',e=>{if(e.data==='skip')self.skipWaiting()});
