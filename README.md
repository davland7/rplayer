# rPlayer

rPlayer is a player play streaming radio, this player, offers the possibility to change different audio format. Example: .m3u8, .mp3, .aac.

## rPlayer in action

https://rplayer.js.org/

## Easy to use

```
var player = new rPlayer();
```

## Play

```
player.play('URL');
```

## Stop

```
player.stop();
```

## Mute

```
player.mute();
```

## Set Volume

You can only set volume between 0 and 10

```
player.volume = 7; // 7 Default set in local storage
```

## timeupdate event

The [timeupdate event](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/timeupdate_event) is fired when the time indicated by the currentTime attribute has been updated.

```
rplayer.onTimeUpdate = function() {
  console.log('Time:', player.currentTime);
};
```

## Infos

```
console.log('Playing:', player.playing);
console.log('Volume:', player.volume);
console.log('Muted:', player.muted);
console.log('Source:', player.src);
console.log('Time:', player.currentTime);
```

## Include hls.js

* [hls.js](https://github.com/video-dev/hls.js)

## Demo

```
npm install
npm run build
npm run start
```

[http://127.0.0.1:9999](http://127.0.0.1:9999)

## npm dependencies

```
npm install hls.js --save
npm install terser-webpack-plugin webpack webpack-cli webpack-dev-server --save-dev
```

## Used by

[Mini Radio (Chrome extention)](https://chrome.google.com/webstore/detail/mini-radio/klcjochgjlcecbalpokmcldlfhngcnfh)
