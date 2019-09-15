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

const context = cast.framework.CastReceiverContext.getInstance();
const playerManager = context.getPlayerManager();

context.start();
