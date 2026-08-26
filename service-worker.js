/* ============================================================
   Service Worker de AGENDA PERSONAL
   - Deja la app instalada funcionando SIN conexión ni servidor:
     la primera vez que se abre (o se instala) guarda una copia
     de la propia app en la caché del dispositivo y, a partir de
     ahí, la sirve siempre desde ahí.
   - Los DATOS introducidos (citas, notas, etc.) no pasan por
     aquí: se guardan aparte, en la carpeta/almacén propio del
     dispositivo (ver index.html), así que actualizar este
     archivo nunca borra lo ya introducido.
   ============================================================ */

const CACHE_NOMBRE = "agenda-personal-v1";

const ARCHIVOS_A_GUARDAR = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icons/icon-48.png",
  "./icons/icon-72.png",
  "./icons/icon-96.png",
  "./icons/icon-128.png",
  "./icons/icon-144.png",
  "./icons/icon-152.png",
  "./icons/icon-180.png",
  "./icons/icon-192.png",
  "./icons/icon-256.png",
  "./icons/icon-384.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-192.png",
  "./icons/icon-maskable-512.png",
  "./icons/favicon.ico"
];

self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches.open(CACHE_NOMBRE)
      .then((cache) => cache.addAll(ARCHIVOS_A_GUARDAR))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches.keys()
      .then((nombres) => Promise.all(
        nombres.filter((n) => n !== CACHE_NOMBRE).map((n) => caches.delete(n))
      ))
      .then(() => self.clients.claim())
  );
});

// Estrategia: responde al momento con lo que haya en caché (rápido y
// funciona sin conexión) y, si hay red disponible, actualiza la caché
// en segundo plano para la próxima vez.
self.addEventListener("fetch", (evento) => {
  if (evento.request.method !== "GET") return;

  evento.respondWith(
    caches.match(evento.request).then((enCache) => {
      const actualizar = fetch(evento.request)
        .then((respuesta) => {
          if (respuesta && respuesta.status === 200) {
            const copia = respuesta.clone();
            caches.open(CACHE_NOMBRE).then((cache) => cache.put(evento.request, copia));
          }
          return respuesta;
        })
        .catch(() => enCache);

      return enCache || actualizar;
    })
  );
});
