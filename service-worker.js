self.addEventListener('install', function(e) {
 e.waitUntil(
   caches.open('rp-20191121').then(function(cache) {
     return cache.addAll([
       '/',
       '/?source=pwa',
       'https://cdn.jsdelivr.net/npm/vue@2.6.10/dist/vue.min.js',
       '/dist/rplayer.js'
     ]);
   })
 );
});

self.addEventListener('fetch', function(event) {
  console.log(event.request.url);
});
