const CACHE='yar-keshavarz-v7-clean-20260928';
const CORE=[
 './','./index.html','./manifest.webmanifest',
 './assets/wheat-hero.jpg','./assets/wheat-hero.svg','./assets/logo.png','./assets/icon-192.png','./assets/icon-512.png',
 './data/crop-catalog.js','./modules/crop-advisor.js','./modules/measurement.js'
];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET')return;
 const u=new URL(e.request.url);
 if(u.origin!==location.origin)return;
 e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(r=>{
   if(r.ok){const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c)).catch(()=>{});}
   return r;
 }).catch(()=>caches.match('./index.html'))));
});
