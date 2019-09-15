if (!('ontouchstart' in document.documentElement)) {
  document.documentElement.className += 'no-touch';
}

window['__onGCastApiAvailable'] = function(isAvailable) {
  if (isAvailable) {
    initializeCastApi();
  }
};

initializeCastApi = function() {
  var context = cast.framework.CastContext.getInstance().setOptions({
    receiverApplicationId: '8DF59165',
    autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
  });
  
  const playerManager = context.getPlayerManager();

  context.start();
};
