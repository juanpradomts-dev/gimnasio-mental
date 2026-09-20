/* Service worker: offline-first para el shell de la app.
   Sube la versión (CACHE) cuando cambies index.html/app.js para forzar refresco. */
var CACHE="gm-v4";
var SHELL=[
  "./","./index.html","./app.js","./manifest.webmanifest",
  "./icon-192.png","./icon-512.png",
  "https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js",
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.3/dist/umd/supabase.min.js"
];
self.addEventListener("install",function(e){
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function(c){
    // no fallar la instalación si algún CDN no responde
    return Promise.all(SHELL.map(function(u){return c.add(u).catch(function(){})}));
  }));
});
self.addEventListener("activate",function(e){
  e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.map(function(k){if(k!==CACHE)return caches.delete(k)}))}).then(function(){return self.clients.claim()}));
});
self.addEventListener("fetch",function(e){
  var req=e.request;
  if(req.method!=="GET")return;
  var url=new URL(req.url);
  // Nunca cachear las llamadas a Supabase (datos en vivo)
  if(url.hostname.indexOf("supabase")>-1){return}
  // Fuentes de Google y CDNs: cache-first
  if(url.hostname.indexOf("cdn.jsdelivr.net")>-1||url.hostname.indexOf("fonts.g")>-1){
    e.respondWith(caches.match(req).then(function(r){return r||fetch(req).then(function(res){var cp=res.clone();caches.open(CACHE).then(function(c){c.put(req,cp)});return res}).catch(function(){return r})}));return;
  }
  // App shell: network-first con fallback a cache (para tomar cambios pero servir offline)
  e.respondWith(fetch(req).then(function(res){var cp=res.clone();caches.open(CACHE).then(function(c){c.put(req,cp)});return res}).catch(function(){return caches.match(req).then(function(r){return r||caches.match("./index.html")})}));
});
