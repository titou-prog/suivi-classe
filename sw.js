// Service worker de Suivi de classe — V26
// - Pages et scripts de l'appli : réseau d'abord (toujours la dernière version), copie de secours hors ligne.
//   Correctif V26 : sur iPad, fetch(requête de navigation, options) échouait → l'appli restait bloquée sur l'ancienne version.
//   On redemande maintenant l'adresse (URL) elle-même.
// - Icônes et manifeste : copie locale d'abord.
// - Requêtes vers d'autres sites (IA, Pronote…) : jamais interceptées ni mises en cache.
const CACHE='suivi-classe-ipad-v26';
const ASSETS=['./','./index.html','./app.js','./progression.html','./verrou.js','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
const FRESH=/\/(index\.html|progression\.html|app\.js|verrou\.js|sw\.js|version\.json)?$/;
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS.map(u=>new Request(u,{cache:'reload'})))).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('message',e=>{if(e.data==='skip')self.skipWaiting()});
self.addEventListener('fetch',e=>{
 const req=e.request;
 if(req.method!=='GET')return;
 const url=new URL(req.url);
 if(url.origin!==self.location.origin)return; // autres sites : pas d'interception
 if(req.mode==='navigate'||FRESH.test(url.pathname)){
  e.respondWith(
   fetch(url.href,{cache:'no-store',credentials:'same-origin'}).then(r=>{
    if(r&&r.ok){const copy=r.clone();const key=url.origin+url.pathname;caches.open(CACHE).then(c=>c.put(key,copy)).catch(()=>{})}
    return r;
   }).catch(()=>caches.match(url.origin+url.pathname).then(r=>r||caches.match(req,{ignoreSearch:true})).then(r=>r||caches.match('./index.html')))
  );
  return;
 }
 e.respondWith(caches.match(req,{ignoreSearch:true}).then(cached=>cached||fetch(req).then(r=>{if(r&&r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(req,copy)).catch(()=>{})}return r})).catch(()=>caches.match('./index.html')));
});
