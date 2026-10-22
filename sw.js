const CACHE_NAME = 'allan-anjos-v19';
const ASSETS = [
  './',
  './index.html',
  './index.css',
  './app.js',
  './js/calculator.js',
  './js/agent-pet.js',
  './cinematic.js',
  './exploded.js',
  './manifest.json',
  './assets/css/tailwind.min.css',
  './assets/vendor/fontawesome/css/all.min.css',
  './assets/vendor/particles/particles.min.js',
  './assets/vendor/qrcodejs/qrcode.min.js',
  './assets/vendor/gsap/gsap.min.js',
  './assets/vendor/gsap/ScrollTrigger.min.js',
  './assets/vendor/lenis/lenis.min.js',
  './assets/img/allan-foto-320.webp',
  './assets/img/allan-foto-320.jpg',
  './assets/pet/spritesheet.webp',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// Remove caches antigos para que atualizações (ex.: telefone) sempre propaguem
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Network-first: conteúdo sempre atualizado quando online, com fallback offline.
// Importante: o fallback para './index.html' só se aplica a navegações de
// página (mode "navigate"). Para os demais recursos (CSS, JS, imagens, fontes)
// tentamos o cache correspondente e, se não existir, deixamos a requisição
// falhar normalmente — devolver HTML no lugar de um asset quebra o parser
// do navegador ("Unexpected token '<'") em vez de simplesmente indicar que
// o recurso está indisponível offline.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // Só same-origin. Interceptar terceiros causou dois bugs em produção:
  // 1) fetch de SW conta como connect-src no CSP — bloqueava Google Fonts
  //    que o documento tinha permissão de carregar via style-src/font-src;
  // 2) cache.put lança TypeError em esquemas chrome-extension://.
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  const isNavigation = event.request.mode === 'navigate';

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() =>
        caches.match(event.request).then((cached) => {
          if (cached) return cached;
          if (isNavigation) return caches.match('./index.html');
          return Response.error();
        })
      )
  );
});
