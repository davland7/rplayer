# rPlayer

Radio player is a player play streaming radio, this player, offers the possibility to change different audio format. Example: .m3u8, .mp3, .aac.

## rPlayer in action

https://rplayer.js.org/

## Easy to use

```
var audio = new rPlayer();
```

## Play

```
audio.playSrc('URL');
```

## Stop

```
audio.stop();
```

## Pause

```
audio.pause();
```

## Mute

```
audio.mute();
```

## Rewind

```
audio.rewind(10); // Secondes
```

## Set Volume

The volume must not outside the range [0, 1].

```
audio.volume = 0.7; // 0.7 Default set in local storage
```

## Volume Up

```
audio.upVolume();
```

## Volume Down

```
audio.downVolume();
```

## timeupdate event

The [timeupdate event](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/timeupdate_event) is fired when the time indicated by the currentTime attribute has been updated.

```
audio.ontimeupdate = function() {
  console.log('Time:', audio.currentTime);
};
```

## Infos

```
console.log('Playing:', audio.playing);
console.log('Volume:', audio.volume * 100);
console.log('Paused:', audio.paused);
console.log('Muted:', audio.muted);
console.log('Source:', audio.src);
console.log('Time:', audio.currentTime);
```

## Include hls.js

* [hls.js](https://github.com/video-dev/hls.js)

## Demo

```
npm install
npm run build
npm run start
```

[http://localhost:9999/](http://localhost:9999/)

## npm dependencies

```
npm install hls.js --save
npm install @babel/core babel-loader webpack webpack-cli webpack-dev-server --save-dev
```

## Used by

[Mini Radio (Chrome extention)](https://chrome.google.com/webstore/detail/mini-radio/klcjochgjlcecbalpokmcldlfhngcnfh)
