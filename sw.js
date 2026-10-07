const CACHE='yar-keshavarz-shell-v110';
const CORE=[
  './','./index.html','./offline/offline-ai.js','./offline/agriculture-db.js',
  './offline/agriculture-db-extended.js','./offline/calculators.js',
  './offline/context-engine.js','./offline/crop-profiles-universal.js',
  './offline/crop-profiles.js','./offline/crop-ui.js',
  './offline/global-agriculture-brain.js','./offline/global-crop-registry.js',
  './offline/intent-engine.js','./offline/specialized-crop-profiles.js',
  './offline/universal-crop-engine.js','./manifest.webmanifest','./icon-192.png',
  './icon-512.png','./logo.png','./wheat-hero.jpg','./admin.html','./admin.js',
  './admin.css','./data/knowledge/knowledge.json'
];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE).catch(()=>{})).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET') return;
  const u=new URL(r.url);
  if(u.origin!==location.origin) return;
  if(u.pathname.endsWith('/index.html') || u.pathname==='/' || u.pathname.endsWith('/sw.js')){
    e.respondWith(fetch(r,{cache:'no-store'}).then(res=>{
      if(res.ok && !u.pathname.endsWith('/sw.js')){
        const copy=res.clone(); caches.open(CACHE).then(c=>c.put('./index.html',copy));
      }
      return res;
    }).catch(()=>caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(res=>{
    const copy=res.clone(); caches.open(CACHE).then(c=>c.put(r,copy)); return res;
  }).catch(()=>caches.match('./index.html'))));
});
