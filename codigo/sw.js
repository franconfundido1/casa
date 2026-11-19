/* casa · después de la 1.ª visita funciona sin internet.
   Primero la red (así llegan las actualizaciones); sin red, lo guardado. El nombre del caché no se cambia nunca. */
const CACHE = 'casa-v1';
const BASICOS = ['./', 'manifest.json', 'icono-180.png', 'icono-192.png', 'icono-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASICOS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

async function redPrimero(req) {
  try {
    const res = await fetch(req);
    if (res.ok) { const c = await caches.open(CACHE); await c.put(req, res.clone()); }
    return res;
  } catch (err) {
    const hit = await caches.match(req, { ignoreSearch: true });
    if (hit) return hit;
    // la app es 1 sola página: sin red, cualquier navegación abre la página guardada
    if (req.mode === 'navigate') { const pagina = await caches.match('./'); if (pagina) return pagina; }
    throw err;
  }
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // solo lo de este sitio, y no los bocetos (/bocetos/), que no son parte de la app
  if (url.origin !== location.origin || url.pathname.includes('/bocetos/')) return;
  e.respondWith(redPrimero(req));
});
