const CACHE_NAME = "a-casa-abandonada-v2";
const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.webmanifest",
  "./imagens/acerto.png",
  "./imagens/carta-desafio.png",
  "./imagens/desafio.png",
  "./imagens/derrota.png",
  "./imagens/erro.png",
  "./imagens/icone.png",
  "./imagens/narrativa1.png",
  "./imagens/narrativa2.png",
  "./imagens/narrativa3.png",
  "./imagens/narrativa4.png",
  "./imagens/narrativa5.png",
  "./imagens/narrativa6.png",
  "./imagens/narrativa7.png",
  "./imagens/narrativa8.png",
  "./imagens/narrativa9.png",
  "./imagens/tela-inicial.png",
  "./imagens/tempo-esgotado.png",
  "./imagens/vitoria.png",
  "./sons/acerto.mp3",
  "./sons/derrota.mp3",
  "./sons/erro.mp3",
  "./sons/musica-tema.mp3",
  "./sons/tempo-esgotado.mp3",
  "./sons/tic-tac.mp3",
  "./sons/vitoria.mp3"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request)));
});
