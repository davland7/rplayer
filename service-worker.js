window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 76 and later from showing the mini-infobar
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
  showInstallPromotion();
});

/*
self.addEventListener('install', function(e) {
 e.waitUntil(
   caches.open('rp-20191122').then(function(cache) {
     return cache.addAll([
       '/',
       '/?source=pwa',
       'https://cdn.jsdelivr.net/npm/vue@2.6.10/dist/vue.min.js',
       '/dist/rplayer.js'
     ]);
   })
 );
});
*/
