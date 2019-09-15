if (!('ontouchstart' in document.documentElement)) {
  document.documentElement.className += 'no-touch';
}

window['__onGCastApiAvailable'] = function(isAvailable) {
  if (isAvailable) {
    initializeCastApi();
  }
};

initializeCastApi = function() {
  cast.framework.CastContext.getInstance().setOptions({
    receiverApplicationId: '8DF59165',
    autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
  });
};

var castSession = cast.framework.CastContext.getInstance().getCurrentSession();

var mediaInfo = new chrome.cast.media.MediaInfo(currentMediaURL, contentType);
var request = new chrome.cast.media.LoadRequest(mediaInfo);
castSession.loadMedia(request).then(
  function() { console.log('Load succeed'); },
  function(errorCode) { console.log('Error code: ' + errorCode); });

var playerCast = new cast.framework.RemotePlayer();
var playerController = new cast.framework.RemotePlayerController(playerCast);

playerController.playOrPause();
